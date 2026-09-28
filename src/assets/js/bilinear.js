// Bilinear (double) interpolation within a grid of four known points.
//
// A port of Bilinear Interpolation V1.9.xlsx; check-calculators.mjs holds this
// file to the workbook's own answers.
//
//   R(x,y) = [P11 (x2-x)(y2-y) + P21 (x-x1)(y2-y) + P12 (x2-x)(y-y1) + P22 (x-x1)(y-y1)]
//            / ((x2-x1)(y2-y1))
// with P11 at (x1,y1), P21 at (x2,y1), P12 at (x1,y2) and P22 at (x2,y2).

export function interpolate({ x1, x2, x, y1, y2, y, P11, P12, P21, P22 }) {
  const d = (x2 - x1) * (y2 - y1);
  return P11 * (x2 - x) * (y2 - y) / d + P21 * (x - x1) * (y2 - y) / d
    + P12 * (x2 - x) * (y - y1) / d + P22 * (x - x1) * (y - y1) / d;
}

// The workbook's check: x and y must lie strictly between their bounds.
export const outside = ({ x1, x2, x, y1, y2, y }) =>
  !(x > Math.min(x1, x2) && x < Math.max(x1, x2) && y > Math.min(y1, y2) && y < Math.max(y1, y2));

const NAMES = { x1: 'x₁', x2: 'x₂', x: 'x', y1: 'y₁', y2: 'y₂', y: 'y', P11: 'P₁₁', P12: 'P₁₂', P21: 'P₂₁', P22: 'P₂₂' };
export function problem(v) {
  for (const k of Object.keys(NAMES)) {
    if (v[k] === null) return `Enter ${NAMES[k]}.`;
    if (Number.isNaN(v[k])) return `${NAMES[k]} is not a number.`;
  }
  if (v.x1 === v.x2) return 'x₁ and x₂ must be different.';
  if (v.y1 === v.y2) return 'y₁ and y₂ must be different.';
  return null;
}
