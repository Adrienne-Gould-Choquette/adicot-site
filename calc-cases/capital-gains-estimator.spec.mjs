// Answer key for the long-term capital gains estimator (2.8): both tax years,
// every filing status, primary residence or not, gains inside and beyond the
// exclusion, incomes in each rate band and over the NIIT threshold, and the
// page's example.
import { estimate, problem, STATUSES, YEARS } from '../src/assets/js/capgains.js';

const cases = [];
for (const year of YEARS) for (const status of STATUSES) for (const primary of ['Yes', 'No']) {
  for (const [purchase, sale, expenses, mortgage, commission, income, newHome] of [
    [555000, 1900000, 300000, 100000, 0.07, 260000, ''],   // the page's example
    [180000, 320000, 15000, '', 0.06, 40000, 250000],
    [250000, 900000, 0, 50000, 0, 700000, 400000],
    [400000, 450000, 20000, '', 0.05, 90000, ''],       // a small gain
    [200000, 220000, 0, '', 0, 10000, ''],              // all in the 0% band
    [200000, 150000, 0, '', 0.06, 50000, ''],           // a loss
    [200000, 1200000, 0, '', 0, 150000, ''],            // across the 15% and 20% bands
  ]) cases.push({ purchase, sale, expenses, mortgage, commission, primary, status, year, income, newHome });
}
const n = v => (v === '' ? 0 : Number(v));

export default {
  workbook: 'G:\\My Drive\\5-Calculators\\Capital Gains Estimator 2.8.xlsx',
  sheet: 'Sheet1',
  inputs: { purchase: 'B1', sale: 'B2', expenses: 'B3', mortgage: 'B4', commission: 'C5', primary: 'B6', status: 'B7', year: 'C7', income: 'B9', newHome: 'B11' },
  outputs: {
    salesCommission: 'B5', excluded: 'B8', rate: 'B10', tax: 'C10', netProceeds: 'B12', cashOnHand: 'B13',
    gain: 'B18', taxable: 'B19', top0: 'B20', top15: 'B21', niitOver: 'B22', at0: 'B23', at15: 'B24', at20: 'B25', niit: 'B26',
  },
  cases,
  run: row => estimate({
    purchase: n(row.purchase), sale: n(row.sale), expenses: n(row.expenses), mortgage: n(row.mortgage),
    commission: n(row.commission), primary: row.primary === 'Yes', status: row.status, year: Number(row.year),
    income: n(row.income), newHome: n(row.newHome),
  }),
  refuse: [
    { args: { purchase: null, sale: 1, expenses: 0, commission: 0, income: 0 }, says: 'Enter the original purchase price' },
    { args: { purchase: 1, sale: 1, expenses: 0, commission: 1.2, income: 0 }, says: 'The sales commission must be less than 100' },
  ],
  check: ({ args, says }) => (problem(args) ?? '').startsWith(says),
};
