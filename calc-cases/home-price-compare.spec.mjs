// Answer key for the home price comparison (V1.19): mortgage and cash purchases,
// savings that cover the price but not the closing costs, with and without
// savings interest, renters and owners, default and entered insurance/tax rates.
import { compare, problem } from '../src/assets/js/homeprice.js';

const cases = [];
for (const [savings, rate] of [[100000, 0.045], [0, 0], [650000, 0.05], [42500.5, 0.0375], [453000, 0.04]]) {
  for (const [price, mortgageRate, years] of [[450000, 0.065, 30], [600000, 0.07, 15], [300000, 0.055, 30]]) {
    for (const [rent, hoa, insurance, parking, newHoa, newParking] of [[2400, 0, 25, 150, 350, 0], [3100, 450, 60, 0, 0, 120]]) {
      cases.push({ savings, rate, taxRate: 0.24, rent, hoa, insurance, parking, price, closing: 0.01, mortgageRate, years, newHoa, newParking, insurancePct: 0.00575, taxPct: 0.0095 });
      cases.push({ savings, rate, taxRate: 0.32, rent, hoa, insurance, parking, price, closing: 0.025, mortgageRate, years, newHoa, newParking, insurancePct: 0.009, taxPct: 0.021 });
    }
  }
}
const n = v => (v === '' ? 0 : Number(v));

export default {
  workbook: 'G:\\My Drive\\5-Calculators\\Home Price Calculator V1.19.xlsx',
  sheet: 'Sheet1',
  inputs: { savings: 'C5', rate: 'C6', taxRate: 'C7', rent: 'C13', hoa: 'C14', insurance: 'C15', parking: 'C16',
    price: 'C20', closing: 'C21', mortgageRate: 'C22', years: 'C23', newHoa: 'C24', newParking: 'C25', insurancePct: 'C26', taxPct: 'C27' },
  outputs: { interest: 'C8', interestTax: 'C9', currentInterest: 'C10', currentHousing: 'C17', newSavings: 'C31',
    newInterest: 'C33', mortgage: 'C36', payment: 'C37', newInsurance: 'C38', newTaxes: 'C39', newHousing: 'C42',
    housingChange: 'K5', interestChange: 'K6', net: 'K9', netAnnual: 'K10', verdict: 'H8' },
  cases,
  run: row => {
    const r = compare(Object.fromEntries(Object.entries(row).map(([k, v]) => [k, n(v)])));
    return { ...r, verdict: r.saves ? 'The new home will SAVE you Money' : 'The new home will COST More:' };
  },
  refuse: [
    { args: { price: null, savings: 1000 }, says: 'Enter the purchase price' },
    { args: { price: 400000, savings: 100000, years: null, mortgageRate: 0.06 }, says: 'Enter the number of years' },
  ],
  check: ({ args, says }) => (problem(args) ?? '').startsWith(says),
};
