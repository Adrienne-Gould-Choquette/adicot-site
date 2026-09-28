// Commercial kitchen hood exhaust: the code minimum (2024 IMC 507.2.10/507.3.4), the
// ASHRAE Handbook range for the hood's heaviest duty, and a range weighted by
// each appliance's own duty, plus make-up air. A port of Commercial Kitchen
// Exhaust Calculation V1.9.xlsx; check-calculators.mjs holds this file to the
// workbook's own answers.

// Appliances by duty category (ASHRAE Handbook—HVAC Applications, Ch. 34), as
// listed in the workbook: [name, duty, shorter label to show].
export const APPLIANCES = [
  ["Braising pan/tilting skillet, electric", 'Light'],
  ["Braising pan/tilting skillet, gas", 'Medium'],
  ["Broiler, chain conveyor, electric", 'Medium'],
  ["Broiler, chain conveyor, gas", 'Heavy'],
  ["Broiler, electric and gas, over-fired (upright)", 'Heavy'],
  ["Broiler, electric, under-fired", 'Medium'],
  ["Broiler, gas, under-fired", 'Heavy'],
  ["Dishwasher", 'Dishwasher'],
  ["Fryer, doughnut, electric and gas", 'Medium'],
  ["Fryer, kettle, electric and gas", 'Medium'],
  ["Fryer, open deep-fat, electric and gas", 'Medium'],
  ["Fryer, pressure, electric and gas", 'Medium'],
  ["Griddle, double-sided, electric and gas", 'Medium'],
  ["Griddle, flat, electric and gas", 'Medium'],
  ["Grill, plancha, electric and gas", 'Heavy'],
  ["Oven, baking, electric and gas", 'Light'],
  ["Oven, combination, electric and gas", 'Light'],
  ["Oven, convection, full-size, electric and gas", 'Light'],
  ["Oven, convection, half-size, electric and gas (protein cooking)", 'Light'],
  ["Oven, conveyor, electric", 'Light'],
  ["Oven, conveyor, gas", 'Medium'],
  ["Oven, deck, electric and gas", 'Light'],
  ["Oven, rapid cook, electric", 'Light'],
  ["Oven, revolving rack, electric and gas", 'Light'],
  ["Oven, roasting, electric and gas", 'Light'],
  ["Oven, rotisserie, electric and gas", 'Light'],
  ["Oven, stone hearth, gas", 'Light'],
  ["Oven, stone hearth, wood-fired or wood for flavoring", 'Xtra Heavy'],
  ["Oven, tandoor, gas", 'Heavy'],
  ["Range, cooktop, induction", 'Light'],
  ["Range, discrete element, electric (with or without oven)", 'Light'],
  ["Range, hot top, electric and gas", 'Medium'],
  ["Range, open-burner, gas (with or without oven)", 'Medium'],
  ["Range, wok, gas and electric", 'Heavy'],
  ["Salamander, electric and gas", 'Light'],
  ["Smoker, electric and gas", 'Medium'],
  ["Solid fuel cooking appliances combusting a solid fuel (such as wood, charcoal, or coal) to provide all or part of the heat for the cooking process", 'Xtra Heavy', 'Solid fuel cooking appliance (wood, charcoal or coal)'],
].map(([name, duty, label]) => ({ name, duty, label: label ?? name }));

const byName = new Map(APPLIANCES.map(a => [a.name, a]));
export const appliance = s => byName.get(s) ?? null;

export const HOODS = ['Wall-mounted canopy', 'Single-island canopy', 'Double-island canopy (per side)', 'Eyebrow', 'Back shelf/proximity/pass-over'];
export const DUTIES = ['Light', 'Medium', 'Heavy', 'Xtra Heavy'];
const DUTY_NO = { Light: 1, Medium: 2, Heavy: 3, 'Xtra Heavy': 4, Dishwasher: 5 };
export const DUTY_NAME = { 1: 'light', 2: 'medium', 3: 'heavy', 4: 'extra-heavy', 5: 'dishwasher' };

// 2024 IMC 507.2.10 and 507.3.4.1 (FBC-M 2023 507.5) minimum exhaust, cfm per linear foot of hood, by duty
// (light, medium, heavy, extra heavy); 0 = hood type not allowed.
export const CODE = {
  'Back shelf/proximity/pass-over': [250, 300, 400, 0],
  'Double-island canopy (per side)': [250, 300, 400, 550],
  Eyebrow: [250, 250, 0, 0],
  'Single-island canopy': [400, 500, 600, 700],
  'Wall-mounted canopy': [200, 300, 400, 550],
};
const DISHWASHER_RATE = 100;

// ASHRAE Handbook exhaust ranges, cfm per linear foot, [low, high] by duty;
// null = not recommended. Extra heavy has a floor only ("550+").
export const ASHRAE = {
  'Back shelf/proximity/pass-over': [[100, 200], [200, 300], [300, 400], null],
  'Double-island canopy (per side)': [[150, 200], [200, 300], [250, 400], [500, 500]],
  Eyebrow: [[150, 250], [150, 250], null, null],
  'Single-island canopy': [[250, 300], [300, 400], [300, 600], [550, 550]],
  'Wall-mounted canopy': [[150, 200], [200, 300], [200, 400], [350, 350]],
};
const range = (hood, duty) => duty === 'Dishwasher' ? [100, 100] : ASHRAE[hood][DUTY_NO[duty] - 1];

const LS_PER_CFM = 1 / 2.1188799727597, FT_PER_M = 3.28084;

// items: [{ appliance (name or workbook key), length }], length in inches (US)
// or metres (metric). mua: make-up air as a percentage of exhaust.
export function hood({ units = 'English', hood: type, items, mua = 0 }) {
  const us = units === 'English';
  const rows = items.map(it => ({ ...it, a: appliance(it.appliance) })).filter(r => r.a && r.length > 0);
  if (!rows.length) return null;
  // Metric lengths are in metres; the workbook keeps US lengths in inches.
  const equipLen = rows.reduce((s, r) => s + r.length, 0) / (us ? 12 : 1);     // ft or m
  const hoodLen = equipLen + (us ? 1 : 1 / 3.281);                               // 6 in. overhang each end
  const maxDuty = Math.max(...rows.map(r => DUTY_NO[r.a.duty]));
  const perLen = us ? 1 : FT_PER_M * LS_PER_CFM;   // cfm/ft x ft = cfm; cfm/ft x m -> l/s

  const codeRate = maxDuty === 5 ? DISHWASHER_RATE : CODE[type][maxDuty - 1];
  const code = codeRate === 0 ? null : hoodLen * codeRate * perLen;

  // The hood is rated for its heaviest-duty appliance; the weighted range
  // averages each appliance's own range over the equipment length.
  const ranges = rows.map(r => range(type, r.a.duty));
  const allowed = ranges.every(Boolean);
  const lo = allowed ? Math.max(...ranges.map(x => x[0])) : null;
  const hi = allowed ? Math.max(...ranges.map(x => x[1])) : null;
  const handbook = allowed ? [lo * hoodLen * perLen, hi * hoodLen * perLen] : null;

  let weighted = null;
  if (allowed) {
    const w = i => rows.reduce((s, r, k) => s + r.length * ranges[k][i], 0) / rows.reduce((s, r) => s + r.length, 0);
    weighted = [w(0) * hoodLen * perLen, w(1) * hoodLen * perLen];
  }
  const pct = x => x === null ? null : x * mua / 100;
  return {
    equipLen, hoodLen, maxDuty, codeRate, code, notAllowed: codeRate === 0,
    handbook, extraHeavy: maxDuty === 4, weighted,
    muaCode: pct(code), muaHandbook: handbook && handbook.map(pct),
    dishwasher: rows.some(r => r.a.duty === 'Dishwasher'),
  };
}
