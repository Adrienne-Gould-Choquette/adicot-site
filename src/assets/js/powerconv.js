// Power unit conversion: Btu/h, ft·lbf/h, horsepower, kW, MBH, lb·ft/h, tons of
// refrigeration and watts.
//
// A port of Power Unit Conversion V1.3.xlsx; check-calculators.mjs holds this
// file to the workbook's own answers. Every unit goes through watts, with the
// workbook's factors (watts per unit), exactly as it computes them:
//   watts = value x factor(from)        result = watts / factor(to)

export const UNITS = [
  { key: 'btuh', label: 'Btu/hour', unit: 'Btu/h', w: 0.293071070172217, dp: 0 },
  { key: 'mbh', label: 'MBH', unit: 'MBH', w: 293.071070172217, dp: 2 },
  { key: 'ton', label: 'ton (refrigeration)', unit: 'tons', w: 3516.85284206661, dp: 2 },
  { key: 'kw', label: 'kilowatt', unit: 'kW', w: 1000, dp: 2 },
  { key: 'w', label: 'watt', unit: 'W', w: 1, dp: 0 },
  { key: 'hp', label: 'horsepower', unit: 'hp', w: 745.699871582286, dp: 2 },
  { key: 'ftlbf', label: 'foot pound-force/hour', unit: 'ft·lbf/h', w: 0.000376616096758177, dp: 0 },
  { key: 'lbft', label: 'pound-foot/hour', unit: 'lb·ft/h', w: 0.000376616096758177, dp: 0 },
];

export function convert(value, from) {
  const watts = UNITS.find(u => u.key === from).w * value;
  return Object.fromEntries(UNITS.map(u => [u.key, watts / u.w]));
}

export function problem(v) {
  if (v === null) return 'Enter a value to convert.';
  if (Number.isNaN(v)) return 'The value is not a number.';
  return null;
}
