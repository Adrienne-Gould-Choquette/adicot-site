// Long-term capital gains estimate on the sale of a property: the federal tax on
// the gain, stacked on top of the seller's ordinary taxable income, plus the
// 3.8% net investment income tax, after the primary-residence exclusion.
//
// A port of Capital Gains Estimator 2.8.xlsx, formula for formula;
// check-calculators.mjs holds this file to the workbook's own answers.
// Not modelled: state tax, depreciation recapture, adjustments to basis. The
// NIIT is estimated with taxable income in place of modified AGI.

// By tax year and filing status: [0% rate up to, 15% rate up to] (taxable
// income; IRS Rev. Proc. 2024-40 and 2025-32, section 3.03), the NIIT threshold
// (IRC 1411, not indexed) and the primary-residence exclusion (IRC 121).
export const RATES = {
  2025: {
    Single: [48350, 533400, 200000, 250000],
    'Married, filing jointly': [96700, 600050, 250000, 500000],
    'Married, filing separately': [48350, 300000, 125000, 250000],
    'Head of household': [64750, 566700, 200000, 250000],
  },
  2026: {
    Single: [49450, 545500, 200000, 250000],
    'Married, filing jointly': [98900, 613700, 250000, 500000],
    'Married, filing separately': [49450, 306850, 125000, 250000],
    'Head of household': [66200, 579600, 200000, 250000],
  },
};
export const YEARS = Object.keys(RATES).map(Number);
export const STATUSES = ['Single', 'Married, filing jointly', 'Married, filing separately', 'Head of household'];

// commission is a fraction (0.07 for 7 %). mortgage and newHome may be 0.
export function estimate({ purchase, sale, expenses, mortgage, commission, primary, status, income, newHome, year = 2026 }) {
  const [top0, top15, niitOver, allowance] = RATES[year][status];
  const salesCommission = commission * sale;
  const gain = sale * (1 - commission) - purchase - expenses;
  const excluded = primary ? Math.min(allowance, Math.max(0, gain)) : 0;
  const taxable = Math.max(0, gain - excluded);
  const at0 = Math.max(0, Math.min(income + taxable, top0) - income);
  const at15 = Math.max(0, Math.min(income + taxable, top15) - Math.max(income, top0));
  const at20 = taxable - at0 - at15;
  const niit = 0.038 * Math.min(taxable, Math.max(0, income + taxable - niitOver));
  const tax = 0.15 * at15 + 0.2 * at20 + niit;
  return {
    salesCommission, gain, excluded, taxable, top0, top15, niitOver, at0, at15, at20, niit, tax,
    rate: taxable === 0 ? 0 : tax / taxable,
    netProceeds: sale - purchase - expenses - salesCommission - tax,
    cashOnHand: sale - mortgage - salesCommission - tax - newHome,
  };
}

export function problem(v) {
  for (const [x, what] of [[v.purchase, 'original purchase price'], [v.sale, 'sales price'], [v.expenses, 'expenses'],
    [v.commission, 'sales commission'], [v.income, 'taxable income']]) {
    if (x === null) return `Enter the ${what}.`;
    if (Number.isNaN(x)) return `The ${what} is not a number.`;
    if (x < 0) return `The ${what} cannot be negative.`;
  }
  if (v.commission >= 1) return 'The sales commission must be less than 100 %.';
  return null;
}
