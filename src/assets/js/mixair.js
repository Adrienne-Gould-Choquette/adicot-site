// Mixed air dry bulb and wet bulb of two or three air streams: the adiabatic
// mixing of moist air streams, ASHRAE Handbook—Fundamentals, chapter 1, at
// sea-level pressure.
//
// Each stream's flow becomes a mass of dry air, m = Q / v, from its specific
// volume v. The mix keeps the dry air, the water vapor and the energy, so its
// humidity ratio and enthalpy are the mass-weighted means of the streams':
//
//   W_mix = Σ m W / Σ m      h_mix = Σ m h / Σ m
//
// and its dry bulb and wet bulb follow from W_mix and h_mix (psychro.js). Mixed
// Air Calculator V1.6.xlsx averaged the dry and wet bulbs by flow instead; wet
// bulb does not mix linearly, and flow is not mass, so both were approximate.
import { pws, wFromWb, wetBulb } from './psychro.js';

const PT = 14.696;   // psia, standard atmosphere at sea level
const toF = c => c * 9 / 5 + 32;
// Saturation humidity ratio [lb/lb] at tF [°F].
const ws = tF => 0.621945 * pws(tF) / (PT - pws(tF));
// Enthalpy [Btu/lb dry air] and specific volume [ft³/lb dry air] (ASHRAE eqs 32 and 26).
const enthalpy = (tF, w) => 0.24 * tF + w * (1061 + 0.444 * tF);
const volume = (tF, w) => 0.370486 * (tF + 459.67) * (1 + 1.607858 * w) / PT;

// streams: [{ q, db, wb }, ...]; a missing third stream is q = db = wb = 0, as
// blank cells are in the workbook. si: temperatures in °C rather than °F.
// Returns the total flow, the mixed dry and wet bulb (in the input's units), the
// mixed humidity ratio w (lb/lb, the same as kg/kg, before any condenses) and
// whether the mix is past saturation (fog).
export function mix(streams, si = false) {
  const total = streams.reduce((t, s) => t + (s.q ?? 0), 0);
  const f = si ? toF : t => t, back = t => (si ? (t - 32) * 5 / 9 : t);
  const parts = streams.filter(s => s.q > 0).map(s => {
    const db = f(s.db), w = wFromWb(db, f(s.wb), PT, f(s.wb) < 32);
    return { m: s.q / volume(db, w), w, h: enthalpy(db, w) };
  });
  const mass = parts.reduce((t, x) => t + x.m, 0);
  const w = parts.reduce((t, x) => t + x.m * x.w, 0) / mass;
  const h = parts.reduce((t, x) => t + x.m * x.h, 0) / mass;
  const db = (h - 1061 * w) / (0.24 + 0.444 * w);
  if (w <= ws(db)) return { total, db: back(db), wb: back(wetBulb(db, w, PT)), w, fog: false };
  // Past saturation the excess moisture condenses, and its latent heat warms the
  // mix until it is saturated at the same enthalpy: that temperature is both the
  // dry and the wet bulb.
  let lo = db, hi = db + 100;
  for (let i = 0; i < 60; i++) { const t = (lo + hi) / 2; if (enthalpy(t, ws(t)) < h) lo = t; else hi = t; }
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
