// Transfer and pass-through duct sizing: the minimum grille free area and the
// minimum transfer duct area for a supply airflow, and the return grilles that
// suit it. A port of Transfer Duct Sizer V1.57.xlsx, formula for formula;
// check-calculators.mjs holds this file to the workbook's own answers.
//
//   grille free area, Ak  = Q / 288 ft²        (50 in² per 100 cfm)
//   supply duct diameter  = White's explicit Colebrook solution at 0.1 in. wg per
//                           100 ft (one pass, not iterated; Fluid Mechanics, 1986)
//   transfer duct area    = 1.5 x the supply duct's area

import { RA, DG } from './airguide-grilles.js';

export const TYPES = {
  pass: 'Pass Through',
  flex: 'Transfer - Flex',
  hard: 'Transfer - Hard',
};
export const MAX_CFM = 2333;   // the largest grille's rating (48 x 30)

// Return grilles in the workbook's order: [width in, height in, free area Ak ft²].
export const GRILLES = [
  [6, 6, 0.17], [8, 6, 0.22], [10, 6, 0.29], [10, 8, 0.40], [12, 6, 0.36], [12, 8, 0.48], [12, 10, 0.61],
  [12, 12, 0.74], [16, 16, 1.32], [18, 6, 0.55], [18, 10, 0.91], [18, 12, 1.12], [18, 18, 1.73],
  [24, 12, 1.52], [24, 18, 2.35], [24, 24, 3.15], [30, 12, 1.93], [30, 18, 2.93], [30, 24, 3.97],
  [30, 30, 5.00], [36, 18, 3.55], [36, 24, 4.84], [36, 30, 6.10], [48, 24, 6.53], [48, 26, 7.50], [48, 30, 8.10],
];

// Excel's ROUND: half away from zero, after Excel's 15-digit rounding.
export function xround(x, d) {
  const m = 10 ** d;
  return Math.sign(x) * Math.round(Number((Math.abs(x) * m).toPrecision(15))) / m;
}

// Absolute roughness, ft. The supply duct is sized as the material chosen.
const ROUGHNESS = { 'Duct board': 0.0019, Flex: 0.00775, Metal: 0.0003 };
export const MATERIALS = ['Flex', 'Duct board', 'Metal'];
export const sizedAs = (type, material) => (MATERIALS.includes(material) ? material : 'Duct board');
export const roughness = (type, material) => ROUGHNESS[sizedAs(type, material)];

// Round duct diameter (in.) for q cfm at 0.1 in. wg per 100 ft: White's explicit
// "find the diameter" solution, one pass of Colebrook in Reynolds-number form.
export function supplyDiameter(q, eps) {
  const nu = 0.000162, rho = 0.0735, gc = 32.2, L = 100;
  const Q = q / 60;                                   // ft³/s
  const hf = 0.1 * 5.197 / rho;                       // head loss, ft
  const beta = (128 * gc * hf * Q ** 3 / (Math.PI ** 3 * L * nu ** 5)) ** 0.5;
  const re0 = 1.43 * beta ** 0.416;
  const re = (-2 * beta * Math.log10(Math.PI * (eps * nu / Q) * re0 / 14.8 + 2.51 / beta * re0 ** 1.5)) ** 0.4;
  return 4 * Q / (Math.PI * nu * re) * 12;
}

// The grilles to choose from: the workbook's Grille Tech list, or AirGuide's
// return (RA) or door/transfer (DG) grilles as [w, h, Ak].
export const MAKERS = {
  gt: { label: 'Grille Tech return grilles', grilles: GRILLES },
  ra: { label: 'AirGuide RA fixed blade return grilles', grilles: RA.map(([w, h, , ak]) => [w, h, ak]) },
  dg: { label: 'AirGuide DG door/transfer grilles', grilles: DG.map(([w, h, , ak]) => [w, h, ak]) },
};
// A catalog's limit: the largest grille's rating, Ak × 288 cfm.
export const maxCfmOf = maker => Math.max(...MAKERS[maker].grilles.map(([, , ak]) => xround(ak * 288, 0)));
export const largestOf = maker => MAKERS[maker].grilles.reduce((a, g) => (g[2] > a[2] ? g : a));

export function transfer(q, type, material, height = 8, maker = 'gt') {
  const GR = MAKERS[maker]?.grilles ?? GRILLES;
  if (!(q > 0)) return null;
  const d = supplyDiameter(q, roughness(type, material));
  const dFt = d / 12;
  const side = Math.sqrt(Math.PI * dFt ** 2 / 4);       // equal-area square, ft
  const minDuct = side * side * 1.5;                    // ft²
  const flex = type === 'flex';
  const u0 = xround(GR[0][2] * 288, 0);
  const grilles = GR.map(([w, h, ak]) => {
    const maxCfm = xround(ak * 288, 0);
    const neckTooSmall = w * h / 144 < minDuct ? 1 : 0;
    const akTooSmall = ak > minDuct ? 0 : 1;
    const oversized = q > 25 ? (2 * q < maxCfm ? 1 : 0) : (maxCfm === u0 ? 0 : 1);
    const hide = maxCfm < q ? 1 : neckTooSmall + akTooSmall + oversized;
    return { w, h, ak, maxCfm, hide, flexDia: flex ? xround(Math.sqrt(minDuct * 144 * 4 / Math.PI), 2) : null };
  });
  return {
    diameter: d,
    square: d * 2 ** 0.25 / 1.3,                        // in., equal-friction square (Huebscher)
    sizedAs: sizedAs(type, material),
    minGrille: q / 288,                                 // ft²
    minDuct,                                            // ft²
    minDuctDia: Math.sqrt(4 * minDuct / Math.PI) * 12,  // in.
    ductWidth: height > 0 ? minDuct / height * 144 : null,
    grilles, shown: grilles.filter(g => g.hide === 0),
    overLimit: q > (maker === 'gt' ? MAX_CFM : maxCfmOf(maker)),
  };
}
