// Answer key for the crack-method infiltration calculator: each window fit, the
// wind from calm through past the workbook's 36 mph warning (and below zero), one
// to all twelve openings, fractional sizes, blank cells and a missing building.
import { crackage, problem } from '../src/assets/js/crackage.js';

const N = 12;
const rows = Array.from({ length: N }, (_, i) => 18 + i);
const inputs = { wind: 'B3', fit: 'B5', length: 'B2', width: 'C2', height: 'D2' };
rows.forEach((r, i) => Object.assign(inputs, { [`q${i + 1}`]: `B${r}`, [`w${i + 1}`]: `C${r}`, [`h${i + 1}`]: `D${r}` }));
// "Add another opening" ticks: row n counts only when row n-1's box is ticked.
rows.slice(0, N - 1).forEach((r, i) => { inputs[`a${i + 1}`] = `F${r}`; });

// A case with the first `openings.length` openings in use and the rest cleared.
function make(wind, fit, openings, building = [30, 60, 16]) {
  const c = { wind, fit, length: building[0], width: building[1], height: building[2] };
  for (let i = 0; i < N; i++) {
    const o = openings[i] ?? [null, null, null];
    [c[`q${i + 1}`], c[`w${i + 1}`], c[`h${i + 1}`]] = o;
    if (i < N - 1) c[`a${i + 1}`] = i + 1 < openings.length;
  }
  return c;
}

const sets = [
  [[4, 3, 5], [1, 3, 7]],
  [[1, 3, 6.6667]],
  [[10, 2.5, 4], [2, 3, 6.8], [1, 6, 6.8], [6, 4, 4]],
  Array.from({ length: 12 }, (_, i) => [i + 1, 1.5 + i * 0.25, 3 + (i % 4)]),
  [[2, 5.5, 3.25], [null, 4, 4], [3, null, 5]],
  [[8, 2, 3], [4, 3.5, 5], [1, 3, 7], [1, 6, 7], [12, 1.25, 2.75], [2, 8, 4.5], [1, 3, 6.8]],
];
const cases = [];
const winds = [0, 5, 7.5, 12.5, 15, 20, 24.6, 30, 36, 40, -3];
winds.forEach((wind, i) => {
  for (const fit of ['Tight', 'Average', 'Loose']) cases.push(make(wind, fit, sets[(i + fit.length) % sets.length]));
});
cases.push(make(15, 'Average', sets[0], [null, 60, 16]));
cases.push(make(15, 'Loose', sets[2], [100, 45.5, 22]));
cases.push(make(20, 'Tight', [], [30, 60, 16]));

const n = v => (v === null || v === undefined || v === '' ? null : Number(v));
const args = c => ({
  wind: n(c.wind), fit: c.fit,
  openings: Array.from({ length: N }, (_, i) => ({ qty: n(c[`q${i + 1}`]), width: n(c[`w${i + 1}`]), height: n(c[`h${i + 1}`]) }))
    .filter((_, i) => i === 0 || String(c[`a${i}`]).toLowerCase() === 'true'),
  building: { length: n(c.length), width: n(c.width), height: n(c.height) },
});

export default {
  workbook: 'G:\\My Drive\\5-Calculators\\Crackage Method V1.02.xlsx',
  sheet: 'Sheet1',
  inputs,
  outputs: { vhf: 'I25', rate: 'B33', crack: 'B32', q: 'B34', ach: 'B35', warning: 'B4' },
  cases,
  run: row => {
    const r = crackage(args(row));
    return { ...r, ach: r.ach ?? '' };
  },
  refuse: [
    { args: { wind: null, fit: 'Tight', openings: [] }, says: 'Enter the winter wind speed' },
    { args: { wind: 10, fit: '', openings: [] }, says: 'Choose how well' },
    { args: { wind: 10, fit: 'Loose', openings: [{ qty: -1, width: 3, height: 5 }] }, says: 'Quantities and sizes' },
  ],
  check: ({ args, says }) => (problem(args) ?? '').startsWith(says),
};
