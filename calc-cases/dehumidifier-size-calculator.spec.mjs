// Answer key for Dehumidifier Specifier V7.1: capacity conversions, the over-
// capacity message, and which models the check column shows, for capacities at,
// just above and between every model's rating, in all three units.
import { convert, checks, MODELS, MAX_PINTS } from '../src/assets/js/dehumidifier.js';

const pints = [1, 20, 37, 37.5, 50, 51, 60, 70, 71, 80, 85, 90, 91, 100, 102.5, 110, 116, 125, 130, 140, 141, 150, 155, 156, 165, 180, 195, 200, 205, 225, 226, 300, 345, 346, 400, 500, 501, 600, 730, 731, 1000];
const toBtuh = p => p * 1.04 / 24 * 1055;
const cases = [];
for (const p of pints) {
  // The two unused capacity cells hold other values: only the chosen unit's counts.
  cases.push({ units: 'Pints/day', ppd: p, btu: 999, kw: 7 });
  cases.push({ units: 'BTU/h', ppd: 5, btu: Math.round(toBtuh(p)), kw: 3 });
  cases.push({ units: 'kW', ppd: 5, btu: 999, kw: Math.round(toBtuh(p) / 3412.142 * 100) / 100 });
}

const CAP = { 'Pints/day': 'ppd', 'BTU/h': 'btu', kW: 'kw' };
const message = (units, p) => p > MAX_PINTS
  ? 'Max Dehumidifier Capacity Exceeded - \nEnter a Capacity Smaller than '
    + { 'Pints/day': '730 Pints/day', 'BTU/h': '33,373 BTU/h', kW: '9.78 kW' }[units]
  : '';

export default {
  workbook: 'G:\\My Drive\\5-Calculators\\Dehumidifier Specifier V7.1.xlsx',
  sheet: 'Sheet1',
  inputs: { units: 'B1', ppd: 'B2', btu: 'B3', kw: 'B4' },
  outputs: {
    pints: 'B5', btuh: 'B6', kW: 'B7', message: 'C8',
    ...Object.fromEntries(MODELS.map((_, i) => [`h${i + 12}`, `H${i + 12}`])),
  },
  cases,
  run: row => {
    const c = convert(row.units, Number(row[CAP[row.units]]));
    const h = checks(c.pints);
    return {
      ...c, message: message(row.units, c.pints),
      ...Object.fromEntries(h.map((v, i) => [`h${i + 12}`, v === true ? 'True' : v])),
    };
  },
  refuse: [],
  check: () => true,
};
