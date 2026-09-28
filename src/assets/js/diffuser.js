// Velocity through a diffuser from its air flow, or air flow from velocity.
//
// A port of FPM to CFM thru a Diffuser V1.3.xlsx, formula for formula and in the
// workbook's order; check-calculators.mjs holds this file to the workbook's own
// answers.
//
//   net area = L x W / 144 x Ak  |  core area x Ak  |  net area as given   [ft²]
//   V [fpm] = Q [cfm] / net area         Q [cfm] = V [fpm] x net area
// Metric: L and W in cm (net area in m²), Q in l/s and V in m/s, hence / and x 1000.

// Typical net free area by diffuser core size, from the workbook's hidden table
// [length in, width in, net free area ft²], and the straight line fitted to it.
export const TYPICAL = [
  [6, 6, 0.14], [8, 6, 0.18], [10, 6, 0.24], [8, 8, 0.26], [12, 6, 0.29], [12, 8, 0.39], [10, 10, 0.41],
  [18, 6, 0.44], [12, 10, 0.5], [12, 12, 0.61], [14, 14, 0.84], [18, 12, 0.93], [24, 10, 1.03],
  [16, 16, 1.12], [24, 12, 1.26], [18, 18, 1.43], [30, 12, 1.58], [20, 20, 1.77], [22, 22, 2.16],
  [30, 18, 2.41], [24, 24, 2.58], [36, 18, 2.92], [26, 26, 3.04], [30, 24, 3.24], [28, 28, 3.54],
  [36, 24, 3.9], [30, 30, 4.07],
];
// Net free area estimated from the core size (US), rounded up as the workbook shows it.
export const typicalNet = (L, W) => Math.ceil((L * W / 144 * 0.6571 - 0.0463) * 100 - 1e-9) / 100;

// units: 'English' | 'Metric'. find: 'V' (given Q) | 'Q' (given V).
// mode: 'lw' (L x W and Ak) | 'core' (core area and Ak) | 'net' (net area).
export function solve({ units, find, value, mode, L, W, core, Ak, net }) {
  const us = units === 'English';
  const area = mode === 'lw' ? (us ? L * W / 144 * Ak : L * W / 100 ** 2 * Ak)
    : mode === 'core' ? core * Ak : net;
  const result = find === 'V'
    ? (us ? value / area : value / area / 1000)
    : (us ? value * area : value * area * 1000);
  return { area, result };
}

export function problem({ find, value, mode, L, W, core, Ak, net }) {
  const need = [[value, find === 'V' ? 'air flow rate' : 'velocity']];
  if (mode === 'lw') need.push([L, 'core length'], [W, 'core width'], [Ak, 'area factor, Ak']);
  if (mode === 'core') need.push([core, 'core area'], [Ak, 'area factor, Ak']);
  if (mode === 'net') need.push([net, 'net area']);
  for (const [x, what] of need) {
    if (x === null) return `Enter the ${what}.`;
    if (Number.isNaN(x)) return `The ${what} is not a number.`;
    if (!(x > 0)) return `The ${what} must be greater than zero.`;
  }
  if (Ak !== null && Ak > 1 && mode !== 'net') return 'The area factor, Ak, cannot be more than 1.';
  return null;
}
