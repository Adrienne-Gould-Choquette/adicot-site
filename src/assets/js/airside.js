// Coil loads between an entering and a leaving air state, by the exact method of
// ASHRAE Handbook—Fundamentals, chapter 1 ("Moist Air Cooling and
// Dehumidification", Equations 44 and 45), rather than standard-air factors:
//
//   mass flow of dry air   m = airflow / v1                   (v1 at the entering air)
//   total                  q = m [(h1 - h2) - (W1 - W2) hw2]  (hw2: condensate leaving
//                                                              at the leaving dry bulb)
//   sensible               qs = m (0.240 + 0.444 W2) (t1 - t2)
//   latent                 ql = q - qs
//   condensate             mw = m (W1 - W2)
//
// So sensible + latent = total exactly, the airflow's density follows the altitude
// and temperature, and positive loads are cooling (negative, heating). The
// airflow is at the entering air condition. check-handworked.mjs holds this to
// the Handbook's worked Examples 2 and 3.
//
// a, b: entering and leaving states from psychsheet.state (their .ip values are
// used, so the result is the same whichever display units the states were in).
import { state } from './psychsheet.js';
import { pws, tsat, pressure } from './psychro.js';

const CFM_PER_LS = 2.1188799727597, BTUH_PER_KW = 3412.142;

// Btu per lb of dry air removed, and the pieces of it.
function perPound(a, b) {
  const hw2 = b.ip.db - 32;                      // liquid water at t2, Btu/lb (0 at 32 °F)
  const total = (a.ip.h - b.ip.h) - (a.ip.W - b.ip.W) * hw2;
  const sensible = (0.240 + 0.444 * b.ip.W) * (a.ip.db - b.ip.db);
  return { total, sensible };
}

// airflow in cfm (units 'US') or l/s ('Metric'). Loads in Btu/h or kW; condensate
// in lb/h or kg/h; massFlow in lb/h or kg/s of dry air.
export function coilLoads(units, a, b, airflow) {
  const us = units === 'US';
  const cfm = us ? airflow : airflow * CFM_PER_LS;
  const m = cfm * 60 / a.ip.v;                   // lb of dry air per hour
  const p = perPound(a, b);
  const total = m * p.total, sensible = m * p.sensible;
  const lbh = m * (a.ip.W - b.ip.W);
  const out = us ? x => x : x => x / BTUH_PER_KW;
  return {
    massFlow: us ? m : m * 0.45359237 / 3600,
    total: out(total), sensible: out(sensible), latent: out(total - sensible),
    condensate: us ? lbh : lbh * 0.45359237,
    shr: total !== 0 ? sensible / total : null,
  };
}

// The airflow (cfm or l/s, at the entering air) that removes a given total load
// (Btu/h or kW) between the two states; null when the states cannot remove it.
export function airflowFor(units, a, b, load) {
  const us = units === 'US';
  const perLb = perPound(a, b).total;
  const q = us ? load : load * BTUH_PER_KW;
  if (!(perLb !== 0) || !(q / perLb > 0)) return null;
  const cfm = q / perLb * a.ip.v / 60;
  return us ? cfm : cfm / CFM_PER_LS;
}

// The leaving air that a sensible and a total load (Btu/h or kW) call for, at an
// airflow (cfm or l/s, at the entering air): the two load equations above solved
// for t2 and W2. The sensible gives t2 for a W2, and the total is then linear in
// W2 (h2 = 0.240 t2 + W2 (1061 + 0.444 t2)); a few passes settle it. Returns the
// leaving dry bulb (°F or °C) and RH (%), or { problem } when no air state
// carries those loads.
export function leavingForLoads(units, a, airflow, sensible, total, altitude = 0) {
  const us = units === 'US';
  const m = (us ? airflow : airflow * CFM_PER_LS) * 60 / a.ip.v;
  const qs = (us ? sensible : sensible * BTUH_PER_KW) / m, qt = (us ? total : total * BTUH_PER_KW) / m;
  let W2 = a.ip.W, t2 = a.ip.db;
  for (let i = 0; i < 50; i++) {
    t2 = a.ip.db - qs / (0.240 + 0.444 * W2);
    const next = (a.ip.h - 0.240 * t2 - a.ip.W * (t2 - 32) - qt) / (1093 - 0.556 * t2);
    const done = Math.abs(next - W2) < 1e-14;
    W2 = next;
    if (done) break;
  }
  if (!Number.isFinite(t2) || !Number.isFinite(W2)) return { problem: 'range' };
  if (!(W2 > 0)) return { problem: 'dry' };
  const pt = pressure(us ? altitude / 3.28084 : altitude), pv = pt * W2 / (0.621945 + W2);
  const rh = 100 * pv / pws(t2);
  if (rh > 100 + 1e-9) return { problem: 'saturated' };
  return { db: us ? t2 : (t2 - 32) / 1.8, rh: Math.min(rh, 100) };
}

// The leaving dry bulb (°F or °C) at which a total load (Btu/h or kW) is removed,
// when the leaving air's RH (mode 'db-rh', %) or dew point ('db-dp') is known.
// The total falls steadily as the leaving dry bulb rises, so it is found by
// bisection, between the dew point (or -40 °F) and 150 °F. { problem } when the
// load cannot be met in that range.
export function leavingForTotal(units, a, mode, second, airflow, total, altitude = 0) {
  const us = units === 'US';
  const m = (us ? airflow : airflow * CFM_PER_LS) * 60 / a.ip.v;
  const qt = (us ? total : total * BTUH_PER_KW) / m;
  const disp = f => (us ? f : (f - 32) / 1.8);
  const miss = f => perPound(a, state({ units, mode, first: disp(f), second, altitude })).total - qt;
  let lo = mode === 'db-dp' ? (us ? second : second * 1.8 + 32) : -40, hi = 150;
  if (!(lo < hi)) return { problem: 'range' };
  if (!(miss(lo) >= 0)) return { problem: mode === 'db-dp' ? 'dewpoint' : 'range' };
  if (!(miss(hi) <= 0)) return { problem: 'range' };
  for (let i = 0; i < 80; i++) {
    const mid = (lo + hi) / 2;
    if (miss(mid) > 0) lo = mid; else hi = mid;
  }
  return { db: disp((lo + hi) / 2) };
}

// --- One load at a time, from part of the air conditions ---
//
// Sensible needs only the two dry bulbs, and latent only the moisture at each
// end, so each can be found without the other. What is missing is filled in the
// plainest way and the page says which: with no moisture, the air is taken as dry
// (W = 0) for the sensible load; with no dry bulb, the air is taken at its dew
// point for the latent load. Temperatures are in °F or °C, W in lb/lb (kg/kg),
// altitude in ft or m, loads in Btu/h or kW.
const ptAt = (us, altitude) => pressure(us ? altitude / 3.28084 : altitude);
const toF = (us, t) => (us ? t : t * 1.8 + 32), fromF = (us, f) => (us ? f : (f - 32) / 1.8);
const volume = (tF, W, pt) => 0.370486 * (tF + 459.67) * (1 + 1.607858 * W) / pt;
const dewF = (W, pt) => tsat(pt * W / (0.621945 + W));

// Humidity ratio at a dew point: the one moisture measure that needs no dry bulb.
export function humidityAtDewPoint(units, dewPoint, altitude = 0) {
  const us = units === 'US', pt = ptAt(us, altitude), pv = pws(toF(us, dewPoint));
  return 0.621945 * pv / (pt - pv);
}

// qs = m (0.240 + 0.444 W2) (t1 - t2), with m at the entering dry bulb and W1.
// W1 null: dry air. W2 null: the moisture does not change (W2 = W1).
export function sensibleLoad(units, t1, t2, airflow, altitude = 0, W1 = null, W2 = null) {
  const us = units === 'US', f1 = toF(us, t1), f2 = toF(us, t2);
  const m = (us ? airflow : airflow * CFM_PER_LS) * 60 / volume(f1, W1 ?? 0, ptAt(us, altitude));
  const q = m * (0.240 + 0.444 * (W2 ?? W1 ?? 0)) * (f1 - f2);
  return us ? q : q / BTUH_PER_KW;
}

// The leaving dry bulb for a sensible load alone: the same equation, for t2.
export function leavingDryBulbFor(units, t1, airflow, sensible, altitude = 0, W1 = null) {
  const us = units === 'US', f1 = toF(us, t1);
  const m = (us ? airflow : airflow * CFM_PER_LS) * 60 / volume(f1, W1 ?? 0, ptAt(us, altitude));
  return fromF(us, f1 - (us ? sensible : sensible * BTUH_PER_KW) / (m * (0.240 + 0.444 * (W1 ?? 0))));
}

// ql = q - qs, which the equations at the top reduce to
//   ql = m (W1 - W2) (1093 + 0.444 t1 - t2).
// t1, t2 null: that end's dew point stands in for its dry bulb.
export function latentLoad(units, W1, W2, airflow, altitude = 0, t1 = null, t2 = null) {
  const us = units === 'US', pt = ptAt(us, altitude);
  const f1 = t1 === null ? dewF(W1, pt) : toF(us, t1), f2 = t2 === null ? dewF(W2, pt) : toF(us, t2);
  const m = (us ? airflow : airflow * CFM_PER_LS) * 60 / volume(f1, W1, pt);
  const q = m * (W1 - W2) * (1093 + 0.444 * f1 - f2);
  return us ? q : q / BTUH_PER_KW;
}

// The leaving dew point and humidity ratio for a latent load alone. The leaving
// dry bulb is unknown, so the leaving dew point stands in for it, as above.
// { problem: 'dry' } when the load is more moisture than the air holds.
export function leavingDewPointFor(units, W1, airflow, latent, altitude = 0, t1 = null) {
  const us = units === 'US', pt = ptAt(us, altitude);
  const f1 = t1 === null ? dewF(W1, pt) : toF(us, t1);
  const ql = (us ? latent : latent * BTUH_PER_KW) / ((us ? airflow : airflow * CFM_PER_LS) * 60 / volume(f1, W1, pt));
  let W2 = W1, f2 = dewF(W1, pt);
  for (let i = 0; i < 50; i++) {
    const next = W1 - ql / (1093 + 0.444 * f1 - f2);
    if (!(next > 0)) return { problem: 'dry' };
    const done = Math.abs(next - W2) < 1e-14;
    W2 = next; f2 = dewF(W2, pt);
    if (done) break;
  }
  return { dewPoint: fromF(us, f2), W: W2 };
}
