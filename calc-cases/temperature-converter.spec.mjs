// Answer key for the temperature converter: which workbook, which cells, which
// cases, and how to ask the port the same question. tools/gen-cases.mjs runs the
// cases through the workbook in Excel; check-calculators.mjs runs them through
// the port and compares.
import { convert, problem } from '../src/assets/js/tempconv.js';

const NAME = { F: 'Fahrenheit', C: 'Celsius', K: 'Kelvin', R: 'Rankine' };
const ZERO = { F: -459.67, C: -273.15, K: 0, R: 0 };

// Every scale, from absolute zero through cryogenic, everyday, process and
// solar temperatures, plus fractional and very large values.
const VALUES = [-459.67, -273.15, -40, -17.5, 0, 0.01, 20, 32, 37, 68.4, 98.6, 100, 212,
  273.15, 373.15, 459.67, 491.67, 527.67, 1000, 5772, 10389.6, 123456.789];
const cases = [];
for (const unit of Object.keys(NAME)) {
  for (const temp of VALUES) if (temp >= ZERO[unit]) cases.push({ temp, unit: NAME[unit] });
}

export default {
  workbook: 'G:\\My Drive\\5-Calculators\\Temp Converter V1.2.xlsx',
  sheet: 'Power Converter',
  inputs: { temp: 'A1', unit: 'B1' },
  outputs: { C: 'A2', F: 'A3', K: 'A4', R: 'A5' },
  cases,
  // Map a CSV row to the port's answer, keyed like the outputs.
  run: row => convert(Number(row.temp), Object.keys(NAME).find(k => NAME[k] === row.unit)),
  // Inputs the page must refuse, and the start of what it should say.
  refuse: [
    { args: [-460, 'F'], says: '-460 °F is below absolute zero' },
    { args: [-273.16, 'C'], says: '-273.16 °C is below absolute zero' },
    { args: [-0.01, 'K'], says: '-0.01 K is below absolute zero' },
    { args: [null, 'F'], says: 'Enter a temperature' },
    { args: [NaN, 'C'], says: 'The temperature is not a number' },
  ],
  check: ({ args, says }) => (problem(...args) ?? '').startsWith(says),
};
