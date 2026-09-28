// Wind pressure on mechanical equipment, ASCE 7-22 (allowable stress design).
//
// A port of Wind Load Calculator-V9.0.xlsx, formula for formula and in the
// workbook's order; check-calculators.mjs holds this file to the workbook's own
// answers.
//
//   z   = roof height + (clearance + equipment height) / 12   rooftop equipment [ft]
//       = mounting height + equipment height / 12              slab or wall [ft]
//   Kz  = 2.41 (max(z, 15) / zg)^(2/alpha)                    Table 26.10-1, 26.11-1
//   qz  = 0.00256 Kz Kzt Ke V^2                                26.10.2 [psf]
//   lateral = qz Kd GCr(1.9) x 0.6,  uplift = qz Kd GCr(1.5) x 0.6
//                                                             29.4-2, 29.4-3, 2.4.1 [psf]
// 7-22 moved Kd from qz into the force equations (same product) and changed the
// Kz constant and the exposure constants zg and alpha.

const KD = 0.85, KZT = 1, KE = 1, GCR_LATERAL = 1.9, GCR_UPLIFT = 1.5;
const ZG = { B: 3280, C: 2460, D: 1935 };
const ALPHA = { B: 7.5, C: 9.8, D: 11.5 };

// Florida HVHZ minimum clearance under rooftop equipment [in], by the equipment's
// shorter plan dimension [in].
const HVHZ = [[0, 14], [24, 18], [37, 24], [49, 30], [61, 48]];

// rooftop, florida: booleans. mount: 'Slab Mounted' | 'Wall Mounted' (not rooftop).
// Dimensions: clearance, L, D, H in inches; roofHeight, mountHeight in ft; V in mph.
export function solve({ rooftop, florida, clearance, roofHeight, mountHeight, L, D, H, V, exposure }) {
  const z = rooftop ? roofHeight + (clearance + H) / 12 : mountHeight + H / 12;
  const zg = ZG[exposure] ?? 1935, alpha = ALPHA[exposure] ?? 11.5;
  const Kz = z < 15 ? 2.41 * (15 / zg) ** (2 / alpha) : 2.41 * (z / zg) ** (2 / alpha);
  const qz = 0.00256 * Kz * KZT * KE * V ** 2;
  const minClear = [...HVHZ].reverse().find(([d]) => d <= Math.min(L, D))?.[1];
  return {
    z, Kz, qz,
    lateral: qz * KD * GCR_LATERAL * 0.6,
    uplift: qz * KD * GCR_UPLIFT * 0.6,
    // Florida only: whether the clearance under rooftop equipment meets HVHZ.
    hvhz: florida ? { min: minClear, ok: minClear <= clearance } : null,
    unstable: L / H >= 2,
  };
}

export function problem(v) {
  const need = [[v.L, 'equipment length'], [v.D, 'equipment depth'], [v.H, 'equipment height'], [v.V, 'ultimate wind speed']];
  if (v.rooftop) need.unshift([v.clearance, 'clearance below the equipment'], [v.roofHeight, 'roof height']);
  else need.unshift([v.mountHeight, 'mounting height']);
  for (const [x, what] of need) {
    if (x === null) return `Enter the ${what}.`;
    if (Number.isNaN(x)) return `The ${what} is not a number.`;
    if (x < 0) return `The ${what} cannot be negative.`;
  }
  for (const [x, what] of [[v.L, 'equipment length'], [v.D, 'equipment depth'], [v.H, 'equipment height'], [v.V, 'ultimate wind speed']]) {
    if (!(x > 0)) return `The ${what} must be greater than zero.`;
  }
  if (!v.exposure) return 'Choose the exposure category.';
  return null;
}
