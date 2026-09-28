// Temperature change of air through an insulated duct.
//
// A port of Temp Loss Thru Air Duct Version 1.14.xlsx, formula for formula and
// in the workbook's order; check-calculators.mjs holds this file to the
// workbook's own answers. The exit temperature is the exact solution of
// dT/dL = -k (T - T_outside):
//
//   T_exit = T_outside + (T_air - T_outside) x e^(-k L),   k = P / (R_total m_dot c_p)

export const EXTERIOR = [
  { label: 'Still air', h: 1 },
  { label: 'Moving air', h: 1.75 },
  { label: 'Outdoors (wind)', h: 4 },
];
// The workbook's own labels for the three exterior conditions, for its answer key.
export const EXTERIOR_WB = [
  'Still air: h_outside= 1 BTU/(hr·ft²·°F)',
  'Moving air: h_outside= 1.75 BTU/(hr·ft²·°F)',
  'Outdoors (wind): h_outside= 4 BTU/(hr·ft²·°F)',
];

const CP = 0.24;   // Btu/lb·°F
const R_DUCT = 0;  // thin sheet metal

// shape: 'Rectangular' | 'Round'. Dimensions in inches, Q in cfm, °F, ft.
export function solve({ shape, height, width, diameter, hOutside, Q, tAir, tOutside, rInsulation, length }) {
  const rect = shape === 'Rectangular';
  const dia = (rect ? 2 * height * width / (height + width) : diameter) / 12;           // ft
  const perimeter = (rect ? 2 * (height + width) : Math.PI * diameter) / 12;             // ft
  const area = (rect ? height * width : Math.PI * diameter ** 2 / 4) / 144;              // ft²
  const velocity = Q / area / 60;                                                        // fps
  // Hydraulic diameter in feet. V1.13 divided it by 12 a second time, which made
  // h_inside 64 % too high; fixed in V1.14.
  const hInside = 1.5 * velocity ** 0.8 / dia ** 0.2;
  const mDot = Q * 0.075 * 60;                                                           // lb/h
  const rInside = 1 / hInside;
  const rOutside = 1 / hOutside;
  const rTotal = rInsulation + R_DUCT + rInside + rOutside;
  const k = perimeter / (rTotal * mDot * CP);                                            // 1/ft
  const tExit = tOutside + (tAir - tOutside) * Math.exp(-k * length);
  return {
    dia, perimeter, area, velocity, hInside, hOutside, mDot, rInside, rOutside, rTotal, k, tExit,
    // Heat picked up by the air (negative when it loses heat), from the same balance.
    heat: mDot * CP * (tExit - tAir),
  };
}

export function problem(v) {
  const need = v.shape === 'Rectangular'
    ? [[v.height, 'duct height'], [v.width, 'duct width']]
    : [[v.diameter, 'duct diameter']];
  for (const [x, what] of [...need, [v.Q, 'air flow rate'], [v.tAir, 'entering air temperature'],
    [v.tOutside, 'outside air temperature'], [v.rInsulation, 'insulation R-value'], [v.length, 'duct length']]) {
    if (x === null) return `Enter the ${what}.`;
    if (Number.isNaN(x)) return `The ${what} is not a number.`;
  }
  for (const [x, what] of [...need, [v.Q, 'air flow rate'], [v.length, 'duct length']]) {
    if (!(x > 0)) return `The ${what} must be greater than zero.`;
  }
  if (v.rInsulation < 0) return 'The insulation R-value cannot be negative.';
  return null;
}
