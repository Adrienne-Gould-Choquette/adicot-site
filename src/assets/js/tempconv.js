// Temperature conversion between Fahrenheit, Celsius, Kelvin and Rankine.
//
// A port of Temp Converter V1.2.xlsx. Each formula is written in the same order
// as the workbook's Calculations sheet, so the two agree to the last bit;
// check-calculators.mjs holds this file to the workbook's own answers.

export const SCALES = [
  { code: 'F', name: 'Fahrenheit', symbol: '°F', absoluteZero: -459.67 },
  { code: 'C', name: 'Celsius', symbol: '°C', absoluteZero: -273.15 },
  { code: 'K', name: 'Kelvin', symbol: 'K', absoluteZero: 0 },
  { code: 'R', name: 'Rankine', symbol: '°R', absoluteZero: 0 },
];
export const scale = code => SCALES.find(s => s.code === code);

// One temperature in the given scale, as all four.
export function convert(t, from) {
  switch (from) {
    case 'C': return { C: t, F: t * 9 / 5 + 32, K: t + 273.15, R: t * 9 / 5 + 491.67 };
    case 'F': return { C: (t - 32) * 5 / 9, F: t, K: (t - 32) * 5 / 9 + 273.15, R: t + 459.67 };
    case 'K': return { C: t - 273.15, F: (t - 273.15) * 9 / 5 + 32, K: t, R: t * 9 / 5 };
    case 'R': return { C: (t - 491.67) * 5 / 9, F: t - 459.67, K: t * 5 / 9, R: t };
    default: throw new Error(`Unknown scale: ${from}`);
  }
}

// Why a value cannot be converted, or null when it can. The workbook converts
// anything; below absolute zero is not a temperature, so the page says so.
export function problem(t, from) {
  if (t === null) return 'Enter a temperature.';
  if (Number.isNaN(t)) return 'The temperature is not a number.';
  const s = scale(from);
  if (t < s.absoluteZero) {
    return `${fmtPlain(t)} ${s.symbol} is below absolute zero, which is ${fmtPlain(s.absoluteZero)} ${s.symbol}.`;
  }
  return null;
}

const fmtPlain = x => x.toLocaleString('en-US', { maximumFractionDigits: 2 });
