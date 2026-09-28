// Answer key for the condensate converter (V1.3; identical in every cell to the
// V1.2 the site ran before).
import { convert, problem, UNITS } from '../src/assets/js/condconv.js';

const VALUES = [0, 0.05, 1, 2.5, 12, 70, 500, 3412.142, 12000, 250000];
const cases = [];
for (const u of UNITS) for (const value of VALUES) cases.push({ value, unit: u.label });

export default {
  workbook: 'G:\\My Drive\\5-Calculators\\Condensate Converter V1.3.xlsx',
  sheet: 'Sheet1',
  inputs: { value: 'B1', unit: 'C1' },
  outputs: { btuh: 'B3', galh: 'B4', lh: 'B5', pintsday: 'B6', lbh: 'B7', W: 'B8', kW: 'B9' },
  cases,
  run: row => convert(Number(row.value), UNITS.find(u => u.label === row.unit).key),
  refuse: [
    { args: [null], says: 'Enter a value to convert' },
    { args: [NaN], says: 'The value is not a number' },
    { args: [-3], says: 'The value cannot be negative' },
  ],
  check: ({ args, says }) => (problem(...args) ?? '').startsWith(says),
};
