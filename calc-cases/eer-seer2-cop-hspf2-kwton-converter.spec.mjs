// Answer key for the efficiency converter (EER SEER COP Converter V1.5): every
// given rating, every equipment type, typical and extreme values.
import { convert, problem, RATINGS, EQUIPMENT } from '../src/assets/js/efficiency.js';

const VALUES = { COP: [2.5, 3.6, 5], EER: [9.5, 12, 14.2], SEER: [13, 15, 21], SEER2: [13.4, 14.3, 20],
  HSPF: [7.7, 8.8, 10], HSPF2: [6.5, 7.5, 9], 'kW/Ton': [0.6, 0.85, 1.26] };
const cases = [];
for (const given of RATINGS) for (const equip of EQUIPMENT) for (const value of VALUES[given]) cases.push({ given, value, equip });

export default {
  workbook: 'G:\\My Drive\\5-Calculators\\EER SEER COP Converter V1.5.xlsx',
  sheet: 'Sheet1',
  inputs: { given: 'A1', value: 'B1', equip: 'A2' },
  // A4:A10 follow the labels in B4:B10: COP, EER, SEER, SEER2, HSPF, HSPF2, kW/Ton.
  outputs: { COP: 'A4', EER: 'A5', SEER: 'A6', SEER2: 'A7', HSPF: 'A8', HSPF2: 'A9', kWTon: 'A10' },
  cases,
  run: row => {
    const r = convert(Number(row.value), row.given, row.equip);
    return { ...r, kWTon: r['kW/Ton'] };
  },
  refuse: [
    { args: [null], says: 'Enter the efficiency value' },
    { args: [0], says: 'The efficiency value must be greater than zero' },
  ],
  check: ({ args, says }) => (problem(...args) ?? '').startsWith(says),
};
