// Condensate (moisture removal) unit conversion: latent Btu/h, W and kW, and
// water in gallons/h, liters/h, pints/day and pounds/h.
//
// A port of Condensate Converter V1.3.xlsx, formula for formula and in the
// workbook's order; check-calculators.mjs holds this file to the workbook's own
// answers. Everything goes through pints per day, using the workbook's factors:
// 1.04 lb/pint, 1055 Btu/lb, 8 pints/gallon, 2.11338 pints/liter, 3.412142 Btu/h per W.

export const UNITS = [
  { key: 'btuh', label: 'BTU/hour', name: 'Latent heat', unit: 'Btu/h' },
  { key: 'W', label: 'Watts', name: 'Latent heat', unit: 'W' },
  { key: 'kW', label: 'kW', name: 'Latent heat', unit: 'kW' },
  { key: 'pintsday', label: 'Pints/day', name: 'Water', unit: 'pints/day' },
  { key: 'galh', label: 'gallons/hour', name: 'Water', unit: 'gal/h' },
  { key: 'lh', label: 'liters/hour', name: 'Water', unit: 'l/h' },
  { key: 'lbh', label: 'pounds/hour', name: 'Water', unit: 'lb/h' },
];

const DAY_HR = 1 / 24;

// The input as pints per day, from whichever unit it is in.
function pintsPerDay(v, from) {
  switch (from) {
    case 'btuh': return v * 24 / 1055 / 1.04;
    case 'galh': return v * 8 * 24;
    case 'lh': return v * 2.11338 / DAY_HR;
    case 'pintsday': return v;
    case 'lbh': return v / 1.04 * 24;
    case 'W': return v * 3.412142 * 24 / 1055 / 1.04;
    case 'kW': return v * 3.412142 * 24 / 1055 / 1.04 * 1000;
    default: throw new Error(`Unknown unit: ${from}`);
  }
}

export function convert(v, from) {
  const p = pintsPerDay(v, from);
  return {
    btuh: p * 1.04 / 24 * 1055,
    galh: p * 0.125 * DAY_HR,
    lh: p / 2.11338 * DAY_HR,
    pintsday: p,
    lbh: p * 1.04 * DAY_HR,
    W: p * 1.04 * DAY_HR * 1055 / 3.412142,
    kW: p * 1.04 * DAY_HR * 1055 / 3.412142 / 1000,
  };
}

export function problem(v) {
  if (v === null) return 'Enter a value to convert.';
  if (Number.isNaN(v)) return 'The value is not a number.';
  if (v < 0) return 'The value cannot be negative.';
  return null;
}
