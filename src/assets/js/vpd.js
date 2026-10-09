// Vapour pressure deficit of the air, and at a leaf, from the dry bulb and either
// the wet bulb or the relative humidity.
//
// A port of VPD_Vapor_Pressure_Differential V1.4.xlsx, formula for formula, on
// the same exact ASHRAE psychrometrics as the other psychrometric calculators
// (psychro.js, the PSY_ functions of Psycrometric V3.5); check-calculators.mjs
// holds this file to the workbook's own answers. Everything follows from one
// partial vapour pressure pw:
//   air VPD  = pws(dry bulb) - pw        leaf VPD = pws(leaf) - pw
import { pws, tsat, wFromWb, wetBulb } from './psychro.js';

const kPa = p => p * 68.9476 / 10;

// units: 'US' | 'Metric'. room, wb and leaf in °F or °C; rh a fraction; altitude
// in ft or m. Give rh or wb: with rh, the wet bulb is derived (rh wins if both);
// leaf may be null.
export function vpd({ units, room, wb, rh, altitude, leaf }) {
  const us = units === 'US';
  const toF = t => (us ? t : t * 9 / 5 + 32);
  const tdb = toF(room), alt = us ? altitude : altitude * 3.28084;
  const pt = 14.696 * (1 - 6.8754 * alt * 10 ** -6) ** 5.2559;
  const pwsDb = pws(tdb);
  let pw;
  if (rh !== null && rh !== undefined) {
    pw = rh * pwsDb;
  } else {
    const twb = toF(wb);
    const w = wFromWb(tdb, twb, pt, twb < 32);
    pw = pt * w / (0.621945 + w);
  }
  const W = 0.621945 * pw / (pt - pw);
  const dpF = tsat(pw);
  const wbF = rh !== null && rh !== undefined ? wetBulb(tdb, W, pt) : toF(wb);
  const back = t => (us ? t : (t - 32) * 5 / 9);
  return {
    wb: back(wbF), dp: back(dpF), rh: pw / pwsDb,
    v: us ? 0.370486 * (tdb + 459.67) * (1 + 1.607858 * W) / pt : 0.370486 * (tdb + 459.67) * (1 + 1.607858 * W) / pt / 16.01846337396,
    h: us ? 0.24 * tdb + W * (1061 + 0.444 * tdb) : 1.006 * room + 1000 * W / 1000 * (1.84 * room + 2501),
    W: us ? W : 1000 * W, grains: us ? W * 7000 : null,
    patm: kPa(pt), pws: kPa(pwsDb), pw: kPa(pw),
    air: kPa(pwsDb) - kPa(pw),
    leaf: leaf === null || leaf === undefined ? null : kPa(pws(toF(leaf)) - pw),
  };
}

export function problem({ room, wb, rh, altitude }) {
  for (const [v, what] of [[room, 'room temperature'], [altitude, 'altitude']]) {
    if (v === null) return `Enter the ${what}.`;
    if (Number.isNaN(v)) return `The ${what} is not a number.`;
  }
  if (rh === null || rh === undefined) {
    if (wb === null) return 'Enter the wet bulb temperature or the relative humidity.';
    if (Number.isNaN(wb)) return 'The wet bulb temperature is not a number.';
    if (wb > room) return 'The wet bulb cannot be higher than the room temperature.';
  } else if (Number.isNaN(rh) || !(rh > 0 && rh <= 1)) {
    return 'The relative humidity must be more than 0 and at most 100 %.';
  }
  return null;
}

// ---- the chart's bands ----
// The VPD ranges growers commonly quote, in kPa, driest last. They are a guide
// for reading the chart, not part of the workbook: each band runs up to `below`.
export const BANDS = [
  { key: 'wet', below: 0 },          // the leaf is under the dew point
  { key: 'humid', below: 0.4 },
  { key: 'low', below: 0.8 },
  { key: 'mid', below: 1.2 },
  { key: 'high', below: 1.6 },
  { key: 'dry', below: Infinity },
];
export const band = kpa => BANDS.find(b => kpa < b.below).key;

// The relative humidity (a fraction) at which the deficit is `kpa` in a room at
// `room`, measured at the leaf when a leaf temperature is given and in the air
// otherwise. It is vpd() solved for RH, so it needs no iteration; the answer is
// under 0 or over 1 where no humidity gives that deficit.
export function rhAtVpd({ units, room, leaf, kpa }) {
  const toF = t => (units === 'US' ? t : t * 9 / 5 + 32);
  const surface = leaf === null || leaf === undefined ? room : leaf;
  return (pws(toF(surface)) - kpa * 10 / 68.9476) / pws(toF(room));
}
