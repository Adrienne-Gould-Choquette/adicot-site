// Moist-air properties, 2021 ASHRAE Handbook—Fundamentals, chapter 1 (IP units:
// °F, psia, lb/lb). The shared engine behind the psychrometric, two-condition and
// condensate calculators.
//
// These are the same algorithms as the named functions (PSY_PWS, PSY_TSAT,
// PSY_WB, ...) in Psycrometric V3.5, Psychrometric 2 Condition V1.1 and
// Condensate Generated V2.16, step for step, so the site and the workbooks agree.
// No curve fits: dew point and wet bulb are solved exactly by Newton's method.

// Hyland-Wexler constants (ASHRAE eqs 5 and 6), as the workbooks enter them.
const C1 = -1.0214165 * 10 ** 4, C2 = -4.8932428, C3 = -5.3765794 * 10 ** -3, C4 = 1.9202377 * 10 ** -7,
  C5 = 3.5575832 * 10 ** -10, C6 = -9.0344688 * 10 ** -14, C7 = 4.1635019, C8 = -1.0440397 * 10 ** 4,
  C9 = -1.129465 * 10 ** 1, C10 = -2.7022355 * 10 ** -2, C11 = 1.289036 * 10 ** -5, C12 = -2.4780681 * 10 ** -9,
  C13 = 6.5459673;

// Saturation pressure over ice and over water at absolute temperature T [°R], as
// the calculation sheets evaluate them (H and I columns).
export const pwsIce = T => Math.exp(C1 / T + C2 + C3 * T + C4 * T ** 2 + C5 * T ** 3 + C6 * T ** 4 + C7 * Math.log(T));
export const pwsWater = T => Math.exp(C8 / T + C9 + C10 * T + C11 * T ** 2 + C12 * T ** 3 + C13 * Math.log(T));

// Saturation pressure [psia] at tF [°F], ice below 32 °F (the PSY_PWS function).
export function pws(tF) {
  const Tr = tF + 459.67;
  return tF < 32
    ? Math.exp(-10214.165 / Tr - 4.8932428 - 0.0053765794 * Tr + 0.00000019202377 * Tr ** 2 + 3.5575832e-10 * Tr ** 3 - 9.0344688e-14 * Tr ** 4 + 4.1635019 * Math.log(Tr))
    : Math.exp(-10440.397 / Tr - 11.29465 - 0.027022355 * Tr + 0.00001289036 * Tr ** 2 - 2.4780681e-9 * Tr ** 3 + 6.5459673 * Math.log(Tr));
}
// d(ln pws)/dT (PSY_DLNPWS).
function dlnpws(tF) {
  const Tr = tF + 459.67;
  return tF < 32
    ? 10214.165 / Tr ** 2 - 0.0053765794 + 2 * 0.00000019202377 * Tr + 3 * 3.5575832e-10 * Tr ** 2 - 4 * 9.0344688e-14 * Tr ** 3 + 4.1635019 / Tr
    : 10440.397 / Tr ** 2 - 0.027022355 + 2 * 0.00001289036 * Tr - 3 * 2.4780681e-9 * Tr ** 2 + 6.5459673 / Tr;
}

// Temperature [°F] at which pws equals pv: the dew point of pv, or the dry bulb
// whose saturation pressure is pv/RH (PSY_TSAT). ASHRAE eqs 39/40 to start.
export function tsat(pv) {
  const a = Math.log(pv);
  const ga = 100.45 + 33.193 * a + 2.319 * a ** 2 + 0.17074 * a ** 3 + 1.2063 * pv ** 0.1984;
  let x = ga < 32 ? 90.12 + 26.142 * a + 0.8927 * a ** 2 : ga;
  for (let i = 0; i < 6; i++) x = x - (Math.log(pws(x)) - a) / dlnpws(x);
  return x;
}

// Humidity ratio from dry and wet bulb [°F] at pressure pt [psia]: ASHRAE eq 35
// with water on the wick, eq 37 with ice (PSY_WWB).
export function wFromWb(tdb, twb, pt, ice) {
  const s = pws(twb), ws = 0.621945 * s / (pt - s);
  return ice
    ? ((1220 - 0.04 * twb) * ws - 0.24 * (tdb - twb)) / (1220 + 0.444 * tdb - 0.48 * twb)
    : ((1093 - 0.556 * twb) * ws - 0.24 * (tdb - twb)) / (1093 + 0.444 * tdb - twb);
}
function wbBranch(tdb, w, pt, ice) {
  const pv = pt * w / (0.621945 + w);
  let x = (tdb + 2 * tsat(pv)) / 3;
  for (let i = 0; i < 12; i++) {
    x = x - (wFromWb(tdb, x, pt, ice) - w) / ((wFromWb(tdb, x + 0.001, pt, ice) - wFromWb(tdb, x - 0.001, pt, ice)) / 0.002);
  }
  return x;
}
// Wet bulb [°F] from dry bulb and humidity ratio (PSY_WB): the water root if it
// is at or above 32 °F, else the ice root if below; between them the wick is
// freezing and the wet bulb is 32 °F.
export function wetBulb(tdb, w, pt) {
  const sw = wbBranch(tdb, w, pt, false);
  if (sw >= 32) return sw;
  const si = wbBranch(tdb, w, pt, true);
  return si < 32 ? si : 32;
}

// Atmospheric pressure [psia] at altitude [ft] (ASHRAE eq 3), as the workbooks
// compute it from metres.
export const pressure = altM => 14.696 * (1 - 6.8754 * altM * 3.28084 * 10 ** -6) ** 5.2559;
