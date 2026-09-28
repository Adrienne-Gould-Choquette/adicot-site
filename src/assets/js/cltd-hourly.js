// Hourly CLTDs for a roof or wall number, corrected for design temperatures, and
// the conduction cooling load q = U × A × CLTD.
//
// The tables are the 1997 ASHRAE Handbook—Fundamentals (SI) Tables 30 and 32:
// July, 40°N, dark surfaces, in kelvins. The Handbook's own correction for other
// design temperatures is the only adjustment:
//
//   SI:  Corr. CLTD = CLTD + (25.5 − tr) + (tm − 29.4)      °C
//   I-P: Corr. CLTD = CLTD + (78 − tr) + (tm − 85)          °F
//   tm = outdoor design maximum − daily range / 2
//
// In °F the table value is the kelvin value × 1.8. That is a conversion of the
// SI printing; the I-P printing's own whole-degree values differ from it by up to
// about 1 °F.
import { ROOF_CLTD, WALL_CLTD } from './cltd-hourly-tables.js';

export const ORIENTATIONS = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
// The design conditions the tables were computed for, in each unit system.
export const BASE = {
  SI: { indoor: 25.5, max: 35, range: 11.6, tmRef: 29.4 },
  IP: { indoor: 78, max: 95, range: 21, tmRef: 85 },
};

// The 24 hourly table values for a roof or wall number, in K, or null where the
// table has no such number.
export function tableValues(kind, number, orientation) {
  if (number === null || number === undefined) return null;
  return kind === 'roof' ? ROOF_CLTD[number] ?? null : WALL_CLTD[number]?.[orientation] ?? null;
}

// { correction, hours: [{ hour, table, corrected, q }], peak } in the chosen
// units. U and area are optional; q is in W (SI) or Btu/h (I-P).
export function hourly(values, { units, indoor, max, range, u = null, area = null }) {
  const b = BASE[units];
  const tm = max - range / 2;
  const correction = (b.indoor - indoor) + (tm - b.tmRef);
  const scale = units === 'IP' ? 1.8 : 1;
  const hours = values.map((k, i) => {
    const table = k * scale, corrected = table + correction;
    return { hour: i + 1, table, corrected, q: u !== null && area !== null ? u * area * corrected : null };
  });
  const peak = hours.reduce((p, h) => (h.corrected > p.corrected ? h : p), hours[0]);
  return { tm, correction, hours, peak };
}

export function problem({ indoor, max, range, u, area }) {
  for (const [v, what] of [[indoor, 'indoor design temperature'], [max, 'outdoor design maximum temperature'], [range, 'daily range']]) {
    if (v === null) return `Enter the ${what}.`;
    if (Number.isNaN(v)) return `The ${what} must be a number.`;
  }
  if (range < 0) return 'The daily range cannot be negative.';
  for (const [v, what] of [[u, 'U-factor'], [area, 'area']]) if (v !== null && (Number.isNaN(v) || v < 0)) return `The ${what} must be a positive number.`;
  return null;
}
