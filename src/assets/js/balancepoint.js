// Heat pump balance point, and the supplemental (strip) heat to cover the load
// below it at the design temperature.
//
// A port of Balance Point V1.1.xlsx, formula for formula; check-calculators.mjs
// holds this file to the workbook's own answers. Both lines are straight:
//
//   load(T)     = design load × (T_zero − T) / (T_zero − T_design)
//   capacity(T) = capacity at the low rating temperature + slope × (T − T_low)
//
// The balance point is where they cross. Below it the heat pump alone falls
// short; the shortfall at the design temperature is the supplemental heat.

export const BTUH_PER_KW = 3412.14163;
export const STRIP_KW = [5, 8, 10, 15, 20, 25];

// The smallest standard strip heater at least as big as kw (0 for none needed).
export function stripSize(kw) {
  if (kw === 0) return 0;
  return STRIP_KW.find(s => s >= kw) ?? 'Over 25 kW';
}

// zeroTemp: outdoor temperature with no heating load; designTemp, designLoad;
// the heat pump's capacity at two rating temperatures (lowTemp < highTemp usually).
export function balancePoint({ zeroTemp, designTemp, designLoad, lowTemp, lowCap, highTemp, highCap }) {
  const loadSlope = designLoad / (zeroTemp - designTemp);
  const capSlope = (highCap - lowCap) / (highTemp - lowTemp);
  const denom = capSlope + loadSlope;
  const balance = denom === 0 ? null : (loadSlope * zeroTemp - lowCap + capSlope * lowTemp) / denom;
  const capAtDesign = lowCap + capSlope * (designTemp - lowTemp);
  const supplemental = Math.max(0, designLoad - capAtDesign);
  const supplementalKw = supplemental / BTUH_PER_KW;
  const emergencyKw = designLoad / BTUH_PER_KW;
  return {
    loadSlope, capSlope, balance,
    loadAtBalance: balance === null ? null : loadSlope * (zeroTemp - balance),
    capAtDesign, supplemental, supplementalKw, strip: stripSize(supplementalKw),
    emergencyKw, emergencyStrip: stripSize(emergencyKw),
    load: T => loadSlope * (zeroTemp - T),
    capacity: T => lowCap + capSlope * (T - lowTemp),
  };
}

const LABEL = {
  zeroTemp: 'outdoor temperature with no heating load', designTemp: 'outdoor design temperature',
  designLoad: 'design heat loss', lowTemp: 'low rating temperature', lowCap: 'capacity at the low rating temperature',
  highTemp: 'high rating temperature', highCap: 'capacity at the high rating temperature',
};
export function problem(v) {
  for (const [k, what] of Object.entries(LABEL)) {
    if (v[k] === null || v[k] === undefined) return `Enter the ${what}.`;
    if (Number.isNaN(v[k])) return `The ${what} must be a number.`;
  }
  for (const k of ['designLoad', 'lowCap', 'highCap']) if (v[k] < 0) return `The ${LABEL[k]} cannot be negative.`;
  if (v.zeroTemp <= v.designTemp) return 'The no-load temperature must be above the design temperature.';
  if (v.highTemp === v.lowTemp) return 'The two rating temperatures must differ.';
  return null;
}
