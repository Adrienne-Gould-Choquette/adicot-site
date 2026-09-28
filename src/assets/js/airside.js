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
