// Ohm's law with power: any two of voltage, current, resistance and power give
// the other two.
//
// A port of Ohms Law with Power Calculator V2.3.xlsx, formula for formula;
// check-calculators.mjs holds this file to the workbook's own answers. As in the
// workbook, each result is the largest of the four ways of computing it, where a
// way whose inputs are missing (zero) counts as zero.

// Inputs are numbers, or 0 for a blank, as the workbook reads them.
export function solve({ V = 0, I = 0, R = 0, P = 0 }) {
  const max = (...xs) => Math.max(...xs);
  return {
    V: max(V > 0 ? V : 0, I * R > 0 ? I * R : 0, P * R > 0 ? Math.sqrt(P * R) : 0, P * I > 0 ? P / I : 0),
    I: max(I > 0 ? I : 0, V * R > 0 ? V / R : 0, P * V > 0 ? P / V : 0, P * R > 0 ? Math.sqrt(P / R) : 0),
    R: max(R > 0 ? R : 0, V * I > 0 ? V / I : 0, V * P > 0 ? V ** 2 / P : 0, P * I > 0 ? P / I ** 2 : 0),
    P: max(P > 0 ? P : 0, I * R > 0 ? I ** 2 * R : 0, V * R > 0 ? V ** 2 / R : 0, V * I > 0 ? V * I : 0),
  };
}

const NAMES = { V: 'voltage', I: 'current', R: 'resistance', P: 'power' };

// Exactly two positive values, as the workbook (V2.3) requires before it answers.
export function problem(values) {
  const given = Object.entries(values).filter(([, v]) => v !== null);
  for (const [k, v] of given) {
    if (Number.isNaN(v)) return `The ${NAMES[k]} is not a number.`;
    if (!(v > 0)) return `The ${NAMES[k]} must be greater than zero.`;
  }
  if (given.length < 2) return given.length ? 'Enter one more value.' : 'Enter any two values.';
  if (given.length > 2) return 'Enter only two values; clear the others.';
  return null;
}
