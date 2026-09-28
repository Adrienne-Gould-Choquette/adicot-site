// Answer key for Ohm's law with power (V2.3): every pair of inputs, from control
// circuits to large heaters.
import { solve, problem } from '../src/assets/js/ohms.js';

const SAMPLES = { V: [24, 120, 208, 480], I: [0.5, 12, 21.63], R: [2.5, 9.61, 1000], P: [40, 4500, 25000] };
const KEYS = ['V', 'I', 'R', 'P'];
const cases = [];
for (let a = 0; a < 4; a++) for (let b = a + 1; b < 4; b++) {
  for (const x of SAMPLES[KEYS[a]]) for (const y of SAMPLES[KEYS[b]]) {
    const c = { V: '', I: '', R: '', P: '' };
    c[KEYS[a]] = x; c[KEYS[b]] = y;
    cases.push(c);
  }
}
const n = v => (v === '' ? 0 : Number(v));

export default {
  workbook: 'G:\\My Drive\\5-Calculators\\Ohms Law with Power Calculator V2.3.xlsx',
  sheet: 'Sheet1',
  inputs: { V: 'B2', I: 'B3', R: 'B4', P: 'B5' },
  outputs: { outV: 'B9', outI: 'B10', outR: 'B11', outP: 'B12' },
  cases,
  run: row => {
    const r = solve({ V: n(row.V), I: n(row.I), R: n(row.R), P: n(row.P) });
    return { outV: r.V, outI: r.I, outR: r.R, outP: r.P };
  },
  refuse: [
    { args: { V: 208, I: null, R: null, P: null }, says: 'Enter one more value' },
    { args: { V: 208, I: 10, R: 20, P: null }, says: 'Enter only two values' },
    { args: { V: 208, I: -10, R: null, P: null }, says: 'The current must be greater than zero' },
    { args: { V: null, I: null, R: null, P: null }, says: 'Enter any two values' },
  ],
  check: ({ args, says }) => (problem(args) ?? '').startsWith(says),
};
