// Answer key for the air mixing calculator (Mixed Air Calculator V1.6).
import { mix, problem } from '../src/assets/js/mixair.js';

// Two and three streams, both unit systems (labels only in the workbook), hot and
// cold outdoor air, 100 % outdoor or return air, and the page's own example.
const OA = [[150, 91, 77], [400, 95, 78], [1000, 20, 18], [0, 91, 77], [236, 35, 25]];
const RA = [[1550, 75, 62.3], [1600, 72, 60], [0, 75, 62.3], [944, 24, 17]];
const X = [['', '', ''], [300, 55, 54.5], [125.5, 60, 58]];
const cases = [];
for (const units of ['English Units', 'Metric Units']) for (const o of OA) for (const r of RA) for (const x of X) {
  if (Number(o[0]) + Number(r[0]) + Number(x[0] || 0) === 0) continue;
  cases.push({ units, oq: o[0], odb: o[1], owb: o[2], rq: r[0], rdb: r[1], rwb: r[2], xq: x[0], xdb: x[1], xwb: x[2] });
}

const n = v => (v === '' ? 0 : Number(v));
const fogless = (row, r) => (r.fog ? { ...r, db: Number(row.db) } : r);

export default {
  workbook: 'G:\\My Drive\\5-Calculators\\Mixed Air Calculator V1.6.xlsx',
  sheet: 'Mixed Air Calculator',
  inputs: { units: 'C2', oq: 'C5', odb: 'C6', owb: 'C7', rq: 'D5', rdb: 'D6', rwb: 'D7', xq: 'E5', xdb: 'E6', xwb: 'E7' },
  // The workbook's wet bulb (D13) was a flow-weighted mean, which is wrong;
  // check-handworked.mjs checks the psychrometric wet bulb instead.
  outputs: { total: 'D11', db: 'D12' },
  cases,
  // Past saturation the mix fogs and its latent heat warms it; the workbook
  // ignores that, so its dry bulb is compared only where nothing condenses.
  // check-handworked.mjs covers the fog case.
  run: row => fogless(row, mix([
    { q: n(row.oq), db: n(row.odb), wb: n(row.owb) },
    { q: n(row.rq), db: n(row.rdb), wb: n(row.rwb) },
    { q: n(row.xq), db: n(row.xdb), wb: n(row.xwb) },
  ], row.units === 'Metric Units')),
  refuse: [
    { args: [{ q: 150, db: 91, wb: null }, { q: 1550, db: 75, wb: 62 }, { q: null, db: null, wb: null }], says: 'Enter the outdoor air wet bulb' },
    { args: [{ q: 150, db: 91, wb: 77 }, { q: 1550, db: 75, wb: 62 }, { q: 300, db: null, wb: null }], says: 'Enter the third air stream dry bulb' },
    { args: [{ q: 150, db: 70, wb: 77 }, { q: 1550, db: 75, wb: 62 }, { q: null, db: null, wb: null }], says: 'The outdoor air wet bulb is higher than its dry bulb' },
    { args: [{ q: -5, db: 91, wb: 77 }, { q: 1550, db: 75, wb: 62 }, { q: null, db: null, wb: null }], says: 'The outdoor air flow cannot be negative' },
    { args: [{ q: 0, db: 91, wb: 77 }, { q: 0, db: 75, wb: 62 }, { q: null, db: null, wb: null }], says: 'At least one stream needs an air flow' },
  ],
  check: ({ args, says }) => (problem(args) ?? '').startsWith(says),
};
