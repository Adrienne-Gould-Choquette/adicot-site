// Answer key for the power unit converter (V1.3; identical in every cell to the
// V1.2 the site ran before).
import { convert, problem, UNITS } from '../src/assets/js/powerconv.js';

const VALUES = [0, 0.075, 1, 7.5, 900, 12000, 36000, 250000, -500];
const cases = [];
for (const u of UNITS) for (const value of VALUES) cases.push({ value, unit: u.label });

export default {
  workbook: 'G:\\My Drive\\5-Calculators\\Power Unit Conversion V1.3.xlsx',
  sheet: 'Power Converter',
  inputs: { value: 'A1', unit: 'B1' },
  outputs: { btuh: 'A2', ftlbf: 'A3', hp: 'A4', kw: 'A5', mbh: 'A6', lbft: 'A7', ton: 'A8', w: 'A9' },
  cases,
  run: row => convert(Number(row.value), UNITS.find(u => u.label === row.unit).key),
  refuse: [
    { args: [null], says: 'Enter a value to convert' },
    { args: [NaN], says: 'The value is not a number' },
  ],
  check: ({ args, says }) => (problem(...args) ?? '').startsWith(says),
};
