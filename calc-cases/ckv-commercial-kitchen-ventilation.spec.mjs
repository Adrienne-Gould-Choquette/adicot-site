// Answer key for Commercial Kitchen Exhaust Calculation V1.9, US units: every
// hood style with an appliance of each duty, and mixed lines of appliances
// (including a dishwasher after the first row, which V1.8 missed), through the
// code minimum, the ASHRAE range, the duty-weighted range and make-up air. The
// metric key is alongside.
import { hood, HOODS } from '../src/assets/js/ckv.js';

// One appliance of each duty, by the workbook's spelling.
const BY_DUTY = {
  Light: 'Oven, convection, full-size, electric and gas',
  Medium: 'Fryer, open deep-fat, electric and gas',
  Heavy: 'Range, wok, gas and electric',
  'Xtra Heavy': 'Oven, stone hearth, wood-fired or wood for flavoring',
  Dishwasher: 'Dishwasher',
};
const LINES = [
  ['Range, open-burner, gas (with or without oven)', 'Griddle, flat, electric and gas', 'Fryer, pressure, electric and gas'],
  ['Oven, baking, electric and gas', 'Broiler, gas, under-fired'],
  ['Salamander, electric and gas', 'Range, hot top, electric and gas', 'Broiler, chain conveyor, gas', 'Oven, deck, electric and gas'],
  ['Braising pan/tilting skillet, electric', 'Oven, rotisserie, electric and gas'],
  ['Dishwasher', 'Oven, baking, electric and gas'],
  ['Oven, baking, electric and gas', 'Dishwasher'],
  ['Fryer, kettle, electric and gas', 'Oven, revolving rack, electric and gas', 'Oven, rapid cook, electric'],
  ['Solid fuel cooking appliances combusting a solid fuel (such as wood, charcoal, or coal) to provide all or part of the heat for the cooking process', 'Grill, plancha, electric and gas'],
];

export function buildCases(units) {
  const us = units === 'English';
  const L = inches => us ? inches : Math.round(inches * 0.0254 * 1000) / 1000;   // metres
  const cases = [];
  const add = (hoodName, items, mua, type = 'Type I') => {
    const c = { units, hood: hoodName, type, mua };
    for (let i = 0; i < 4; i++) {
      c[`b${i + 1}`] = items[i]?.[0] ?? '';
      c[`f${i + 1}`] = items[i] ? L(items[i][1]) : '';
      if (i < 3) c[`i${i + 1}`] = i < items.length - 1 ? 1 : '';   // "add equipment" ticked on all but the last row
    }
    cases.push(c);
  };
  for (const h of HOODS) {
    for (const [duty, a] of Object.entries(BY_DUTY)) add(h, [[a, 72]], duty === 'Medium' ? 80 : 0, duty === 'Dishwasher' ? 'Type II' : 'Type I');
    LINES.forEach((line, k) => add(h, line.map((a, j) => [a, 24 + 12 * ((j + k) % 4) + (k === 1 ? 6 : 0)]), [0, 100, 85, 0, 50, 0, 70, 0][k]));
  }
  return cases;
}

// The workbook's own representation of each output (text where it builds text).
const excelText = x => String(Number(x.toPrecision(15)));
export function asWorkbook(row) {
  const items = [1, 2, 3, 4].map(i => ({ appliance: row[`b${i}`], length: Number(row[`f${i}`]) })).filter(it => it.appliance);
  const mua = Number(row.mua);
  const r = hood({ units: row.units, hood: row.hood, items, mua });
  const d51 = r.notAllowed ? 'Hood Type Not Allowed' : r.code;
  const d52 = r.handbook ? r.handbook[0] : 0;
  let f52 = '';
  if (r.handbook) f52 = (r.handbook[1] === d52 ? '' : excelText(r.handbook[1])) + (r.extraHeavy ? '+' : '');
  let i52 = '';
  if (f52 !== '' && f52 !== '+') i52 = f52.endsWith('+') ? '#ERROR' : Number(f52) * mua / 100;   // "400+" x % is #VALUE! in Excel
  return {
    equipLen: r.equipLen, hoodLen: r.hoodLen, maxDuty: r.maxDuty,
    code: d51, muaCode: typeof d51 === 'string' ? 'SELECT HOOD' : d51 * mua / 100,
    hbLow: d52, hbHigh: f52, muaLow: d52 * mua / 100 === 0 ? '' : d52 * mua / 100, muaHigh: i52,
    wLow: r.weighted ? r.weighted[0] : '#ERROR', wHigh: r.weighted ? r.weighted[1] : '#ERROR',
    dishwasher: r.maxDuty === 5 ? 'ONCE A DISHWASHER HAS BEEN SELECTED ALL EQUIPMENT IS ASSUMED TO BE A DISHWASHER' : '',
  };
}

export const INPUTS = {
  units: 'C7', hood: 'C8', type: 'C11', mua: 'G49',
  b1: 'B14', b2: 'B15', b3: 'B16', b4: 'B17',
  f1: 'F14', f2: 'F15', f3: 'F16', f4: 'F17',
  i1: 'I14', i2: 'I15', i3: 'I16',
};
export const OUTPUTS = {
  equipLen: 'C49', hoodLen: 'C50', maxDuty: 'T13', code: 'D51', muaCode: 'G51',
  hbLow: 'D52', hbHigh: 'F52', muaLow: 'G52', muaHigh: 'I52', dishwasher: 'B12',
};

export default {
  workbook: 'G:\\My Drive\\5-Calculators\\Commercial Kitchen Exhaust Calculation V1.9.xlsx',
  sheet: 'Sheet1',
  inputs: INPUTS,
  outputs: { ...OUTPUTS, wLow: 'D53', wHigh: 'F53' },
  cases: buildCases('English'),
  run: asWorkbook,
  refuse: [],
  check: () => true,
};
