// Answer key for the CLTD roof numbers (ASHRAE CLTD Surface Type, Roof sheet):
// every roof type, every mass location it offers, every R-value range.
import { roofNumber, ROOF_TYPES, ROOF_MASS, ROOF_R } from '../src/assets/js/cltd.js';

const cases = [];
for (const type of ROOF_TYPES) for (const mass of ROOF_MASS[type]) for (const r of ROOF_R) cases.push({ type, mass, r });

export default {
  workbook: 'G:\\My Drive\\5-Calculators\\ASHRAE CLTD Surface Type V1.1.xlsx',
  sheet: 'Roof',
  inputs: { type: 'B1', mass: 'B2', r: 'B3' },
  outputs: { roof: 'B4' },
  cases,
  run: row => ({ roof: roofNumber(row.type, row.mass, row.r) ?? 'No Value' }),
  refuse: [{ args: ['Steel Deck', 'Mass inside insulation', '0-5'] }],
  check: ({ args }) => roofNumber(...args) === null,
};
