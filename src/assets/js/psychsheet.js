// One psychrometric state, as the calculation sheet of Psycrometric V3.5 (Sheet1)
// and of Psychrometric 2 Condition V1.1 and Condensate Generated V2.16 (Input_1,
// Input_2) computes it, cell for cell. check-calculators.mjs holds this file to
// all three workbooks.
//
// Four ways to give the state:
//   db + wb:  dry bulb and wet bulb
//   db + rh:  dry bulb and relative humidity
//   dp + rh:  dew point and relative humidity
//   db + dp:  dry bulb and dew point (not in the workbooks; added September 2026,
//             from the same equations: the vapor pressure is pws at the dew point)
import { pwsIce, pwsWater, pws, tsat, wFromWb, wetBulb, pressure } from './psychro.js';

// units: 'US' | 'Metric'. mode: 'db-wb' | 'db-rh' | 'dp-rh' | 'db-dp'. first: dry
// bulb or dew point; second: wet bulb, RH (%) or dew point; rh: RH (%) for dp-rh;
// altitude in ft or m.
// grainsInMetric: the Input sheets show grains/lb in metric too; Sheet1 does not.
export function state({ units, mode, first, second, rh, altitude }, grainsInMetric = false) {
  const us = units === 'US';
  const toC = t => (us ? (t - 32) * 5 / 9 : t);
  const B5 = toC(first);
  const B6 = mode === 'db-rh' ? second : toC(second);
  const B8 = us ? altitude / 3.28084 : altitude;
  const B9 = pressure(B8);
  const F = c => c * 9 / 5 + 32;

  // The three branches, in °C (the J column), then the chosen one (O column).
  let O18, O19, O20, O21;
  if (mode === 'db-wb') {
    const tdb = B5 * 9 / 5 + 32, twb = B6 * 9 / 5 + 32;
    const w = wFromWb(tdb, twb, B9, twb < 32), pv = B9 * w / (0.621945 + w);
    O20 = B5; O21 = B6;
    O18 = 100 * pv / pws(tdb);
    O19 = (tsat(pv) - 32) * 5 / 9;
  } else if (mode === 'db-dp') {
    const tdb = B5 * 9 / 5 + 32, pv = pws(B6 * 9 / 5 + 32), w = 0.621945 * pv / (B9 - pv);
    O20 = B5; O19 = B6;
    O18 = 100 * pv / pws(tdb);
    O21 = (wetBulb(tdb, w, B9) - 32) * 5 / 9;
  } else if (mode === 'db-rh') {
    const tdb = B5 * 9 / 5 + 32, pv = B6 / 100 * pws(tdb), w = 0.621945 * pv / (B9 - pv);
    O20 = B5; O18 = B6;
    O19 = (tsat(pv) - 32) * 5 / 9;
    O21 = (wetBulb(tdb, w, B9) - 32) * 5 / 9;
  } else {
    const pv = pws(B5 * 9 / 5 + 32);
    O19 = B5; O18 = rh;
    O20 = (tsat(pv / (rh / 100)) - 32) * 5 / 9;
    const w = 0.621945 * pv / (B9 - pv);
    O21 = (wetBulb(O20 * 9 / 5 + 32, w, B9) - 32) * 5 / 9;
  }
  const P19 = F(O19), P20 = F(O20), P21 = F(O21);
  const Q19 = O19 * 9 / 5 + 32 + 459.67, Q20 = O20 * 9 / 5 + 32 + 459.67, Q21 = O21 * 9 / 5 + 32 + 459.67;

  // Saturation pressures at dry bulb, wet bulb and dew point: ice at or below 0 °C,
  // water at or above, the larger where both apply.
  const sat = (T, c) => Math.max(c <= 0 ? pwsIce(T) : -Infinity, c >= 0 ? pwsWater(T) : -Infinity);
  const J5 = sat(Q20, O20), J7 = sat(Q21, O21), J8 = sat(Q19, O19);
  const K7 = 0.621945 * J7 / (B9 - J7);

  // Humidity ratio: from the wet bulb when db + wb are given (eq 35 or 37 by the
  // wet bulb), otherwise straight from the vapour pressure.
  let N5;
  if (mode === 'db-wb') {
    const L5 = P21 >= 32 ? ((1093 - 0.556 * P21) * K7 - 0.24 * (P20 - P21)) / (1093 + 0.444 * P20 - P21) : -Infinity;
    const M5 = P21 < 32 ? ((1220 - 0.04 * P21) * K7 - 0.24 * (P20 - P21)) / (1220 + 0.444 * P20 - 0.48 * P21) : -Infinity;
    N5 = Math.max(L5, M5);
  } else {
    const pv = mode === 'db-rh' ? O18 / 100 * pws(P20) : pws(P19);
    N5 = 0.621945 * pv / (B9 - pv);
  }
  const R5 = 0.24 * P20 + N5 * (1061 + 0.444 * P20);
  const S5 = 0.370486 * Q20 * (1 + 1.607858 * N5) / B9;

  const C20 = us ? N5 : 1000 * N5;
  return {
    db: us ? P20 : O20, wb: us ? P21 : O21, dp: us ? P19 : O19, rh: O18,
    v: us ? S5 : S5 / 16.01846337396,
    h: us ? R5 : 1.006 * O20 + C20 / 1000 * (1.84 * O20 + 2501),
    W: C20,
    grains: us || grainsInMetric ? N5 * 7000 : null,
    patm: us ? B9 * 2.036 : B9 * 68.9476,
    pws: us ? J5 * 2.036 : J5 * 0.0689476 * 1000,
    pw: us ? J8 * 2.036 : J8 * 0.0689476 * 1000,
    // In IP, whatever the display units, for the front sheets' own formulas and
    // for the exact coil loads (airside.js).
    ip: { v: S5, grains: N5 * 7000, W: N5, h: R5, db: P20 },
  };
}

export const UNITS = {
  US: { t: '°F', v: 'ft³/lb dry air', h: 'Btu/lb', W: 'lb/lb', p: 'in. Hg' },
  Metric: { t: '°C', v: 'm³/kg dry air', h: 'kJ/kg', W: 'g/kg', p: 'mbar' },
};

export function problem({ mode, first, second, rh, altitude }) {
  const names = { 'db-wb': ['dry bulb', 'wet bulb'], 'db-rh': ['dry bulb', 'relative humidity'], 'dp-rh': ['dew point', 'relative humidity'], 'db-dp': ['dry bulb', 'dew point'] }[mode];
  const vals = [[first, names[0]], [mode === 'dp-rh' ? rh : second, names[1]], [altitude, 'altitude']];
  for (const [v, what] of vals) {
    if (v === null) return `Enter the ${what}.`;
    if (Number.isNaN(v)) return `The ${what} is not a number.`;
  }
  const r = mode === 'dp-rh' ? rh : mode === 'db-rh' ? second : null;
  if (r !== null && !(r > 0 && r <= 100)) return 'The relative humidity must be more than 0 and at most 100 %.';
  if (mode === 'db-wb' && second > first) return 'The wet bulb cannot be higher than the dry bulb.';
  if (mode === 'db-dp' && second > first) return 'The dew point cannot be higher than the dry bulb.';
  return null;
}
