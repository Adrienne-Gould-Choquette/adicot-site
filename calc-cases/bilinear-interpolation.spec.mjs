// Answer key for bilinear interpolation (V1.9), including the page's Bryant
// example, reversed bounds, negative values, and points outside the grid.
import { interpolate, outside, problem } from '../src/assets/js/bilinear.js';

const WARN = 'Whoops! The number you are interpolating must be inbetween the bounding numbers - your results are invalid';
const cases = [
  { x1: 75, x: 79, x2: 85, y1: 63, y: 65, y2: 67, P11: 55.04, P12: 59, P21: 52.59, P22: 56.34 },
  { x1: 85, x: 79, x2: 75, y1: 67, y: 65, y2: 63, P11: 56.34, P12: 52.59, P21: 59, P22: 55.04 },
  { x1: 0, x: 0.25, x2: 1, y1: 0, y: 0.75, y2: 1, P11: 1, P12: 2, P21: 3, P22: 4 },
  { x1: -40, x: -12.5, x2: 20, y1: 100, y: 150, y2: 400, P11: -3.2, P12: 7.9, P21: 11.5, P22: -0.4 },
  { x1: 1000, x: 1500, x2: 2500, y1: 0.05, y: 0.08, y2: 0.1, P11: 12.1, P12: 10.4, P21: 18.3, P22: 15.9 },
  { x1: 75, x: 90, x2: 85, y1: 63, y: 65, y2: 67, P11: 55.04, P12: 59, P21: 52.59, P22: 56.34 },
  { x1: 75, x: 79, x2: 85, y1: 63, y: 60, y2: 67, P11: 55.04, P12: 59, P21: 52.59, P22: 56.34 },
  { x1: 75, x: 75, x2: 85, y1: 63, y: 65, y2: 67, P11: 55.04, P12: 59, P21: 52.59, P22: 56.34 },
];
const num = row => Object.fromEntries(Object.entries(row).map(([k, v]) => [k, Number(v)]));

export default {
  workbook: 'G:\\My Drive\\5-Calculators\\Bilinear Interpolation V1.9.xlsx',
  sheet: 'Bilinear Interpolation',
  inputs: { x1: 'B1', x: 'C1', x2: 'D1', y2: 'A2', y: 'A3', y1: 'A4', P12: 'B2', P22: 'D2', P11: 'B4', P21: 'D4' },
  outputs: { R: 'C3', warning: 'A5' },
  cases,
  run: row => { const v = num(row); return { R: interpolate(v), warning: outside(v) ? WARN : '' }; },
  refuse: [
    { args: { x1: 1, x: 2, x2: 1, y1: 0, y: 1, y2: 3, P11: 1, P12: 1, P21: 1, P22: 1 }, says: 'x₁ and x₂ must be different' },
    { args: { x1: 1, x: 2, x2: 3, y1: 0, y: null, y2: 3, P11: 1, P12: 1, P21: 1, P22: 1 }, says: 'Enter y' },
  ],
  check: ({ args, says }) => (problem(args) ?? '').startsWith(says),
};
