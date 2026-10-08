// Infiltration by the crack method: air leaking in around windows and doors,
// from the length of crack, how well the openings fit, and the winter wind.
//
// A port of Crackage Method V1.02.xlsx, formula for formula; check-calculators.mjs
// holds this file to the workbook's own answers.
//
//   VHF  = 0.000467 × V²                       velocity head factor, V in mph
//   rate = 0.95 VHF^0.55 (tight), 2.1 VHF^0.64 (average), 6.05 VHF^0.62 (loose)   cfm per ft of crack
//   crack = Σ qty × 2 × (width + height)       ft
//   Q    = rate × crack                        cfm
//   ACH  = Q × 60 / (L × W × H)

export const FITS = {
  Tight: { k: 1, describe: 'Wood Double-Hung (Locked) Weather-stripped; average gap (1/64-in. crack). Wood casement and awning windows; weather-stripped. Metal casement windows; weather-stripped' },
  Average: { k: 2, describe: 'Wood Double-Hung (Locked) Nonweather-stripped; average gap (1/64-in. crack) or weather-stripped; large gap (3/32-in. crack). All types of vertical and horizontal sliding windows; weather-stripped. If average gap (1/64-in. crack), this could be a tight-fitting window. Metal casement windows; non-weather-stripped; large gap (3/32-in. crack). This could be a loose-fitting window' },
  Loose: { k: 6, describe: 'Wood Double-Hung (Locked) Non-weather-stripped; large gap (3/32-in. crack). Vertical and horizontal sliding windows; non-weather-stripped. ' },
};
export const MAX_OPENINGS = 12;

// The workbook's own wording, shown with the results rather than instead of them.
export function windWarning(wind) {
  if (wind < 0) return '**Warning** Winter wind velocity below 0 mph will result in unstable results';
  if (wind > 36) return '**Warning** Winter wind velocity above 36 mph may result in unstable results';
  return '';
}

// openings: [{ qty, width, height }], blanks as null (counted as 0, as Excel does).
// building: { length, width, height }, optional, for the air changes per hour.
// extraCrack: crack length entered as a total (ft), added to the openings'.
export function crackage({ wind, fit, openings, building, extraCrack = 0 }) {
  const vhf = 0.000467 * wind ** 2;
  const k = FITS[fit].k;
  const rate = k === 1 ? 0.95 * vhf ** 0.55 : k === 2 ? 2.1 * vhf ** 0.64 : 6.05 * vhf ** 0.62;
  const crack = openings.reduce((s, o) => s + (o.qty ?? 0) * 2 * ((o.width ?? 0) + (o.height ?? 0)), 0) + (extraCrack ?? 0);
  const q = rate * crack;
  const volume = building ? (building.length ?? 0) * (building.width ?? 0) * (building.height ?? 0) : 0;
  return { vhf, k, rate, crack, q, volume, ach: q === 0 || volume === 0 ? null : q * 60 / volume, warning: windWarning(wind) };
}

// ---- building pressurization and door opening force ----
// The crack flow curves above give leakage per foot of crack against the
// pressure difference across it (VHF is a pressure, in. w.c.), so they also
// give the pressure a net surplus of outdoor air holds the building at, with no
// wind: the pressure at which the cracks leak exactly that surplus.
const CURVE = { 1: [0.95, 0.55], 2: [2.1, 0.64], 6: [6.05, 0.62] };
export const leakPerFoot = (fit, dp) => { const [c, n] = CURVE[FITS[fit].k]; return c * dp ** n; };   // cfm/ft
// The rest of the envelope leaks too. Commercial walls leak 0.10, 0.30 and
// 0.60 cfm per ft² of wall at 0.30 in. w.c. when tight, average and leaky
// (Tamura and Shaw 1976a, as reported in the ventilation and infiltration
// chapter of the ASHRAE Handbook—Fundamentals), with flow exponent n = 0.65.
// There is no separate roof figure, so the roof takes the same choices. Other
// openings (relief dampers, louvers, gaps) flow as orifices, flow coefficient
// 0.65: Q = 2610 A ΔP^0.5, cfm, A ft², ΔP in. w.c. A blower-door result (cfm at
// 75 Pa) replaces the wall and roof estimate.
export const SURFACE = { Tight: 0.10, Average: 0.30, Leaky: 0.60 };   // cfm/ft² at 0.30 in. w.c.
export const SURFACE_DP = 0.30, BLOWER_DP = 75 / 249.0889, ENVELOPE_N = 0.65, ORIFICE = 2610;

// env: { wallArea, wallRate, roofArea, roofRate (cfm/ft² at 0.30 in. w.c.),
// q75 (blower door, cfm at 75 Pa; replaces walls and roof), orifice (ft²) }.
export function leakageParts(fit, crack, env, dp) {
  const e = env ?? {};
  const surface = e.q75 > 0 ? e.q75 * (dp / BLOWER_DP) ** ENVELOPE_N
    : ((e.wallArea ?? 0) * (e.wallRate ?? 0) + (e.roofArea ?? 0) * (e.roofRate ?? 0)) * (dp / SURFACE_DP) ** ENVELOPE_N;
  return { cracks: crack * leakPerFoot(fit, dp), surface, orifice: ORIFICE * (e.orifice ?? 0) * Math.sqrt(dp) };
}
export const leakage = (fit, crack, env, dp) => { const p = leakageParts(fit, crack, env, dp); return p.cracks + p.surface + p.orifice; };
// The pressure (in. w.c.) at which total leakage equals the net outdoor air.
export function buildingPressure(fit, crack, env, netOA) {
  if (!(netOA > 0) || leakage(fit, crack, env, 1) <= 0) return 0;
  let lo = 0, hi = 1;
  while (leakage(fit, crack, env, hi) < netOA) hi *= 2;
  for (let i = 0; i < 200 && hi - lo > 1e-12 * hi; i++) {
    const mid = (lo + hi) / 2;
    if (leakage(fit, crack, env, mid) < netOA) lo = mid; else hi = mid;
  }
  return (lo + hi) / 2;
}

// Door opening force against a pressure difference (the door-opening equation
// of NFPA 92 and the ASHRAE Handbook's smoke-control chapter, inch-pound form):
//   F = Fdc + 5.2 W A ΔP / (2 (W − d))
// F lbf, Fdc door closer force lbf, W door width ft, A door area ft², ΔP in. w.c.,
// d knob to latch edge ft. A hinged, single-leaf door.
export const doorForce = ({ width, height, knob, closer }, dp) => closer + 5.2 * width * width * height * dp / (2 * (width - knob));
export const doorPressure = ({ width, height, knob, closer }, limit) => (limit - closer) * 2 * (width - knob) / (5.2 * width * width * height);

// Opening-force limits for swinging doors.
export const DOOR_LIMITS = {
  motion: { lbf: 30, label: 'Exterior and other swinging doors, 30 lbf to set the door in motion (IBC 1010.1.3, NFPA 101 7.2.1.4.5)' },
  interior: { lbf: 5, label: 'Interior hinged door, 5 lbf (IBC 1010.1.3, ADA 404.2.9, ICC A117.1 404.2.8)' },
};

// netOA: outdoor air supplied minus air exhausted, cfm; env as leakageParts;
// door: { width, height ft, knob ft, closer lbf }; limit lbf.
// A negative netOA (more exhaust than outdoor air) depressurizes the building by
// the same amount: the leakage paths run the other way, so the magnitude is the
// same and so is the force on a door that opens against it.
// CRACK_DATA_DP: the crack curves are fitted for winds up to 36 mph, a pressure
// of 0.000467 × 36² = 0.605 in. w.c.; above it they are extrapolated.
export const CRACK_DATA_DP = 0.000467 * 36 ** 2;
export function pressurization({ fit, crack, env, netOA, door, limit }) {
  const dp = buildingPressure(fit, crack, env, Math.abs(netOA));
  const allowDp = doorPressure(door, limit);
  return {
    dp, pa: dp * 249.0889,
    force: doorForce(door, dp),
    allowDp,
    parts: leakageParts(fit, crack, env, dp),
    maxOA: allowDp > 0 ? leakage(fit, crack, env, allowDp) : 0,
    over: dp > allowDp,
    depressurized: netOA < 0,
    beyondCrackData: crack > 0 && dp > CRACK_DATA_DP,
  };
}
export function doorProblem({ fit, crack, netOA, env, door, limit }) {
  for (const v of [env.q75, env.orifice]) if (v !== null && v !== undefined && (Number.isNaN(v) || v < 0)) return 'The blower-door leakage and open area must be positive numbers, or blank.';
  const all = [netOA, door.width, door.height, door.knob, door.closer, limit];
  if (all.some(v => v === null || Number.isNaN(v))) return 'Enter the net outdoor air and the door size, knob distance, closer force and force limit.';
  if (door.width <= 0 || door.height <= 0) return 'The door width and height must be more than zero.';
  if (door.knob < 0 || door.knob >= door.width) return 'The knob distance must be less than the door width.';
  if (door.closer < 0) return 'The closer force cannot be negative.';
  if (netOA !== 0 && leakage(fit, crack, env, 1) <= 0) return 'Nothing can leak: enter the windows and doors, the building dimensions, other openings or a measured leakage, so the building has somewhere for the air to go.';
  if (door.closer >= limit) return 'The closer force alone reaches the force limit, so the door allows no pressure difference.';
  return null;
}

export function problem({ wind, fit, openings, building, extraCrack, extraArea }) {
  if (wind === null) return 'Enter the winter wind speed.';
  for (const v of [extraCrack, extraArea]) if (v != null && (Number.isNaN(v) || v < 0)) return 'The window totals must be positive numbers.';
  if (Number.isNaN(wind)) return 'The wind speed must be a number.';
  if (!FITS[fit]) return 'Choose how well the windows fit.';
  for (const o of openings) {
    for (const v of [o.qty, o.width, o.height]) {
      if (v !== null && (Number.isNaN(v) || v < 0)) return 'Quantities and sizes must be positive numbers.';
    }
  }
  if (building) {
    for (const v of [building.length, building.width, building.height]) {
      if (v !== null && (Number.isNaN(v) || v < 0)) return 'The building dimensions must be positive numbers.';
    }
  }
  return null;
}
