// Home price comparison: monthly cost of a new home against current housing, and
// the interest income given up by spending savings on it.
//
// A port of Home Price Calculator V1.19.xlsx, formula for formula, including
// Excel's FV, PMT and ROUND; check-calculators.mjs holds this file to the
// workbook's own answers. The mortgage is amortized monthly; closing costs come
// out of savings first and any shortfall is borrowed.

// Excel's ROUND to whole units: halves away from zero (Math.round rounds -2.5 to -2).
const round0 = x => Math.sign(x) * Math.round(Math.abs(x));
// Excel's FV with no payments, and PMT, as the workbook calls them.
const fv = (rate, nper, pv) => -pv * (1 + rate) ** nper;
const pmt = (rate, nper, pv) => (rate === 0 ? -pv / nper : -pv * rate / (1 - (1 + rate) ** -nper));

// Rates are fractions (0.045 for 4.5 %). Blank amounts are 0. insurancePct and
// taxPct are a year's home insurance and property tax as a fraction of the price.
export const DEFAULTS = { insurancePct: 0.0049, taxPct: 0.009 };   // US averages: Freddie Mac 2023, Census ACS 2024
export function compare({ savings, rate, taxRate, rent, hoa, insurance, parking, price, closing, mortgageRate, years, newHoa, newParking,
  insurancePct = DEFAULTS.insurancePct, taxPct = DEFAULTS.taxPct }) {
  const interest = -(savings + fv(rate, 1, savings));
  const interestTax = -(savings + fv(rate, 1, savings)) * taxRate;
  const currentInterest = (interest - interestTax) / 12;
  const currentHousing = rent + hoa + insurance + parking;

  const newSavings = Math.max(0, savings - price - closing * price);
  const newInterest = (-round0(newSavings + fv(rate, 1, newSavings)) + round0((newSavings + fv(rate, 1, newSavings)) * taxRate)) / 12;
  const mortgage = Math.max(0, price + closing * price - savings);
  const payment = mortgage <= 0 ? 0 : -pmt(mortgageRate / 12, years * 12, mortgage);
  const newInsurance = price * insurancePct / 12;
  const newTaxes = price * taxPct / 12;
  const newHousing = payment + newInsurance + newTaxes + newHoa * 1 + newParking * 1;

  const housingChange = newHousing - currentHousing;
  const interestChange = -currentInterest + newInterest;
  return {
    interest, interestTax, currentInterest, currentHousing, newSavings, newInterest, mortgage, payment,
    newInsurance, newTaxes, newHousing, housingChange, interestChange,
    net: Math.abs(-housingChange + interestChange), netAnnual: Math.abs(-housingChange + interestChange) * 12,
    saves: housingChange < interestChange,
  };
}

export function problem(v) {
  for (const [x, what] of [[v.price, 'purchase price'], [v.savings, 'total savings']]) {
    if (x === null) return `Enter the ${what}.`;
  }
  for (const [x, what] of Object.entries(v)) {
    if (Number.isNaN(x)) return `A value is not a number (${what}).`;
    if (x !== null && x < 0) return 'Values cannot be negative.';
  }
  const financed = v.price * (1 + (v.closing ?? 0)) > (v.savings ?? 0);
  if (financed && (v.years === null || !(v.years > 0))) return 'Enter the number of years for the mortgage.';
  if (financed && v.mortgageRate === null) return 'Enter the annual mortgage rate.';
  return null;
}
