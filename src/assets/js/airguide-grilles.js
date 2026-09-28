// AirGuide return and transfer grilles, from the manufacturer's performance data
// sheets (scanned catalog pages, read by eye on 2026-09-26; check-airguide.mjs
// checks them for internal consistency). [nominal width in., height in., core
// area ft², Ak factor ft²]. AirGuide's Ak is the balancing factor for a velometer
// reading at the face (cfm = measured velocity × Ak), the same role Ak plays for
// the Grille Tech grilles.

// Fixed blade return grilles and registers: RA(OB), RAME(OB), RAAG(OB),
// RAAGME(OB), RAP(OB), RAPME(OB), RF2FS(OB), RF2FSME(OB), RF2DS(OB), RF2DSME(OB), RAFB(OB).
export const RA = [
  [6, 6, 0.20, 0.23], [8, 6, 0.28, 0.30], [10, 6, 0.35, 0.37], [8, 8, 0.38, 0.40], [12, 6, 0.42, 0.45],
  [12, 8, 0.58, 0.59], [10, 10, 0.61, 0.62], [18, 6, 0.65, 0.67], [12, 10, 0.74, 0.74], [12, 12, 0.90, 0.89],
  [14, 14, 1.24, 1.22], [18, 12, 1.37, 1.34], [24, 10, 1.52, 1.49], [16, 16, 1.64, 1.58], [24, 12, 1.85, 1.78],
  [18, 18, 2.10, 2.01], [30, 12, 2.32, 2.23], [20, 20, 2.61, 2.48], [22, 22, 3.17, 3.00], [30, 18, 3.54, 3.34],
  [24, 24, 3.79, 3.56], [36, 18, 4.27, 4.01], [26, 26, 4.47, 4.19], [30, 24, 4.77, 4.46], [28, 28, 5.20, 4.85],
  [36, 24, 5.74, 5.35], [30, 30, 5.99, 5.57],
];

// Door/transfer grilles: DG-1, DG-2, DG-3.
export const DG = [
  [6, 6, 0.18, 0.25], [8, 6, 0.25, 0.33], [10, 6, 0.32, 0.41], [8, 8, 0.35, 0.44], [12, 6, 0.40, 0.50],
  [12, 8, 0.55, 0.66], [10, 10, 0.58, 0.69], [12, 10, 0.70, 0.82], [12, 12, 0.86, 0.99], [14, 14, 1.20, 1.35],
  [18, 12, 1.32, 1.49], [16, 16, 1.59, 1.76], [24, 12, 1.79, 1.98], [18, 18, 2.04, 2.23], [30, 12, 2.25, 2.48],
  [20, 20, 2.54, 2.75], [22, 22, 3.10, 3.33], [30, 18, 3.46, 3.71], [24, 24, 3.71, 3.96], [36, 18, 4.18, 4.46],
  [26, 26, 4.38, 4.65], [30, 24, 4.68, 4.95], [28, 28, 5.11, 5.39], [36, 24, 5.64, 5.94], [30, 30, 5.89, 6.19],
];
