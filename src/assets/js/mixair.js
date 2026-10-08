// Mixed air temperature and wet bulb of two or three air streams.
//
// The dry bulb is the flow-weighted mean of the streams', as in Mixed Air
// Calculator V1.6.xlsx (check-calculators.mjs holds it to the workbook's answers):
//
//   T_mix = (T1 Q1 + T2 Q2 + T3 Q3) / (Q1 + Q2 + Q3)
//
// Wet bulb does not mix linearly, so the workbook's flow-weighted wet bulb was
// only an approximation. Moisture mixes by humidity ratio instead: each stream's
// W comes from its dry and wet bulb, W_mix is their flow-weighted mean, and the
// mixed wet bulb is solved from T_mix and W_mix (ASHRAE Handbook—Fundamentals,
// chapter 1, through psychro.js), at sea-level pressure.
import { pws, wFromWb, wetBulb } from './psychro.js';

const PT = 14.696;   // psia, standard atmosphere at sea level
const toF = c => c * 9 / 5 + 32;
// Saturation humidity ratio [lb/lb] at tF [°F].
const ws = tF => 0.621945 * pws(tF) / (PT - pws(tF));

// streams: [{ q, db, wb }, ...]; a missing third stream is q = db = wb = 0, as
// blank cells are in the workbook. si: temperatures in °C rather than °F.
// Returns the total flow, the mixed dry and wet bulb (in the input's units), the
// mixed humidity ratio w (lb/lb, the same as kg/kg, before any condenses) and
// whether the mix is past saturation (fog).
export function mix(streams, si = false) {
  const [a, b, c] = [0, 1, 2].map(i => streams[i] ?? { q: 0, db: 0, wb: 0 });
  const total = a.q + b.q + c.q;
  const db = (a.db * a.q / total) + b.db * b.q / total + c.db * c.q / total;
  const f = si ? toF : t => t;
  const w = [a, b, c].reduce((sum, s) => (s.q ? sum + s.q / total * wFromWb(f(s.db), f(s.wb), PT, f(s.wb) < 32) : sum), 0);
  const back = t => (si ? (t - 32) * 5 / 9 : t);
  if (w <= ws(f(db))) return { total, db, wb: back(wetBulb(f(db), w, PT)), w, fog: false };
  // Past saturation the excess moisture condenses, and its latent heat warms the
  // mix until it is saturated at the same enthalpy: that temperature is both the
  // dry and the wet bulb.
  const h = f(db) * 0.24 + w * (1061 + 0.444 * f(db));
  let lo = f(db), hi = lo + 100;
  for (let i = 0; i < 60; i++) { const t = (lo + hi) / 2; if (0.24 * t + ws(t) * (1061 + 0.444 * t) < h) lo = t; else hi = t; }
  const t = back((lo + hi) / 2);
  return { total, db: t, wb: t, w, fog: true };
}

const NAMES = ['outdoor air', 'return air', 'third air stream'];

// Why the streams cannot be mixed, or null. Outdoor and return air are required,
// the third stream is all or nothing. The workbook reads a blank as zero, which
// would quietly mix in air at 0°; here a partly filled stream is refused instead.
export function problem(streams) {
  for (const [i, s] of streams.entries()) {
    const name = NAMES[i];
    const vals = [[s.q, 'flow'], [s.db, 'dry bulb'], [s.wb, 'wet bulb']];
    if (i === 2 && vals.every(([v]) => v === null)) continue;
    for (const [v, what] of vals) {
      if (v === null) return `Enter the ${name} ${what}.`;
      if (Number.isNaN(v)) return `The ${name} ${what} is not a number.`;
    }
    if (s.q < 0) return `The ${name} flow cannot be negative.`;
    if (s.wb > s.db) return `The ${name} wet bulb is higher than its dry bulb, which is not possible.`;
  }
  const total = streams.reduce((t, s) => t + (s.q ?? 0), 0);
  if (!(total > 0)) return 'At least one stream needs an air flow above zero.';
  return null;
}
