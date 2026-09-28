// Linear interpolation between two known points (x1, y1) and (x2, y2): the y at
// a given x, or the x at a given y, on the straight line through them.
//
//   y = y1 (x2 − x)/(x2 − x1) + y2 (x − x1)/(x2 − x1)
//   x = x1 (y2 − y)/(y2 − y1) + x2 (y − y1)/(y2 − y1)
//
// No workbook: check-handworked.mjs holds this to worked examples.

export function interpolate({ x1, y1, x2, y2, solveFor, value }) {
  if (solveFor === 'x') {
    const t = (value - y1) / (y2 - y1);
    return { x: x1 + t * (x2 - x1), y: value, t };
  }
  const t = (value - x1) / (x2 - x1);
  return { x: value, y: y1 + t * (y2 - y1), t };
}

// Outside the two points the answer is an extrapolation, not an interpolation.
export const outside = r => r.t < 0 || r.t > 1;

const NAMES = { x1: 'x₁', y1: 'y₁', x2: 'x₂', y2: 'y₂' };
export function problem(v) {
  for (const [k, n] of Object.entries(NAMES)) {
    if (v[k] === null) return `Enter ${n}.`;
    if (Number.isNaN(v[k])) return `${n} is not a number.`;
  }
  const given = v.solveFor === 'x' ? 'y' : 'x';
  if (v.value === null) return `Enter the ${given} to interpolate at.`;
  if (Number.isNaN(v.value)) return `${given} is not a number.`;
  if (v.solveFor === 'x' ? v.y1 === v.y2 : v.x1 === v.x2) {
    return v.solveFor === 'x' ? 'y₁ and y₂ are equal, so the line is flat and no single x gives that y.' : 'x₁ and x₂ must be different.';
  }
  return null;
}
