// Single-hung window sizes by size code: frame, masonry opening and clear opening.
//
// From the hidden 'Window Size Chart' sheet of Window Size Chart V1.3.xlsx,
// extracted by script rather than retyped; check-calculators.mjs holds this file
// to the workbook's own answers. A code ending in * is an egress size.
// Sizes vary slightly between manufacturers; verify with the one you use.

// [code, frame width, frame height, masonry width, masonry height, clear width, clear height], inches
export const WINDOWS = [
  ["SH 12", 19.125, 26, 20.125, 27, 14.375, 7],
  ["SH 13", 19.125, 38.375, 20.125, 39.375, 14.375, 13.1875],
  ["SH 14", 19.125, 50.625, 20.125, 51.625, 14.375, 19.3125],
  ["SH 15", 19.125, 63, 20.125, 64, 14.375, 25.5],
  ["SH 16", 19.125, 74.25, 20.125, 75.25, 14.375, 31.125],
  ["SH 22", 37, 26, 38, 27, 32.25, 7],
  ["SH 23", 37, 38.375, 38, 39.375, 32.25, 13.1875],
  ["SH 24", 37, 50.625, 38, 51.625, 32.25, 19.3125],
  ["SH 25*", 37, 63, 38, 64, 32.25, 25.5],
  ["SH 26*", 37, 74.25, 38, 75.25, 32.25, 31.125],
  ["SH 32", 53.125, 26, 54.125, 27, 48.375, 7],
  ["SH 33", 53.125, 38.375, 54.125, 39.375, 48.375, 13.1875],
  ["SH 34", 53.125, 50.625, 54.125, 51.625, 48.375, 19.3125],
  ["SH 35*", 53.125, 63, 54.125, 64, 48.375, 25.5],
  ["SH 36*", 53.125, 74.25, 54.125, 75.25, 48.375, 31.125],
  ["SH H32", 26.5, 26, 27.5, 27, 21.75, 7],
  ["SH H33", 26.5, 38.375, 27.5, 39.375, 21.75, 13.1875],
  ["SH H34", 26.5, 50.625, 27.5, 51.625, 21.75, 19.3125],
  ["SH H35", 26.5, 63, 27.5, 64, 21.75, 25.5],
  ["SH H36", 26.5, 74.25, 27.5, 75.25, 21.75, 31.125],
];

export function sizes(code) {
  const r = WINDOWS.find(w => w[0] === code);
  if (!r) return null;
  const [, fw, fh, mw, mh, cw, ch] = r;
  return {
    frame: { w: fw, h: fh, area: fw * fh }, frameFt: { w: fw / 12, h: fh / 12, area: fw / 12 * (fh / 12) },
    masonry: { w: mw, h: mh, area: mw * mh }, clear: { w: cw, h: ch, area: cw * ch },
    egress: code.endsWith('*'),
  };
}
