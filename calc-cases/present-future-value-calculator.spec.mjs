// Answer key for the engineering economics calculator (Engineering Economics
// V1.4): every "find", single and combined givens, negative cash flows, and the
// page's worked examples. The workbook cannot answer at i = 0, so zero-rate
// behaviour is checked against the exact limits instead.
import { solve, problem } from '../src/assets/js/econ.js';

const FIND = { 'Future Value (F)': 'F', 'Present Value (P)': 'P', 'Uniform Series (A)': 'A' };
const cases = [
  { find: 'Future Value (F)', P: 5000, F: '', A: '', G: '', i: 0.05, n: 10 },
  { find: 'Present Value (P)', P: '', F: 10000, A: '', G: '', i: 0.04, n: 3 },
  { find: 'Future Value (F)', P: '', F: '', A: 500, G: '', i: 0.08, n: 8 },
  { find: 'Present Value (P)', P: '', F: '', A: 1000, G: '', i: 0.07, n: 5 },
  { find: 'Uniform Series (A)', P: '', F: 10000, A: '', G: '', i: 0.06, n: 5 },
  { find: 'Uniform Series (A)', P: 50000, F: '', A: '', G: '', i: 0.08, n: 10 },
  { find: 'Future Value (F)', P: '', F: '', A: '', G: 2000, i: 0.05, n: 8 },
  { find: 'Present Value (P)', P: '', F: '', A: '', G: 2000, i: 0.05, n: 8 },
  { find: 'Uniform Series (A)', P: '', F: '', A: '', G: 2000, i: 0.05, n: 8 },
  { find: 'Future Value (F)', P: 1000, F: '', A: 100, G: 25, i: 0.065, n: 15 },
  { find: 'Present Value (P)', P: '', F: 8000, A: 500, G: -20, i: 0.07, n: 10 },
  { find: 'Present Value (P)', P: '', F: '', A: '', G: -50, i: 0.07, n: 10 },
  { find: 'Uniform Series (A)', P: 10000, F: -2000, A: '', G: '', i: 0.01, n: 60 },
  { find: 'Future Value (F)', P: 250, F: '', A: '', G: '', i: 0.0125, n: 360 },
];
const n = v => (v === '' ? 0 : Number(v));

export default {
  workbook: 'G:\\My Drive\\5-Calculators\\Engineering Economics V1.4.xlsx',
  sheet: 'Engineering Economics',
  inputs: { find: 'B1', P: 'B5', F: 'B6', A: 'B7', G: 'B8', i: 'B9', n: 'B10' },
  outputs: { result: 'B12' },
  cases,
  run: row => ({ result: solve({ find: FIND[row.find], P: n(row.P), F: n(row.F), A: n(row.A), G: n(row.G), i: Number(row.i), n: Number(row.n) }) }),
  refuse: [
    { kind: 'refuse', args: { find: 'F', P: null, F: null, A: null, G: null, i: 0.05, n: 10 }, says: 'Enter at least one of the given amounts' },
    { kind: 'refuse', args: { find: 'F', P: 100, F: null, A: null, G: null, i: null, n: 10 }, says: 'Enter the interest rate' },
    { kind: 'refuse', args: { find: 'P', P: null, F: 100, A: null, G: null, i: 0.05, n: 0 }, says: 'The number of periods must be greater than zero' },
    // Zero interest, which the workbook cannot do: the exact limits, and continuity
    // with a rate a hair above zero.
    { kind: 'zero', args: { find: 'F', P: 1000, A: 100, G: 25, n: 15 }, want: 1000 + 1500 + 25 * 105 },
    { kind: 'zero', args: { find: 'P', F: 8000, A: 500, G: -20, n: 10 }, want: 8000 + 5000 - 20 * 45 },
    { kind: 'zero', args: { find: 'A', P: 12000, F: 0, G: 60, n: 12 }, want: 1000 + 60 * 5.5 },
  ],
  check: r => r.kind === 'zero'
    ? Math.abs(solve({ ...r.args, i: 0 }) - r.want) < 1e-9 && Math.abs(solve({ ...r.args, i: 1e-6 }) - r.want) < 1e-4 * Math.abs(r.want)
    : (problem(r.args) ?? '').startsWith(r.says),
};
