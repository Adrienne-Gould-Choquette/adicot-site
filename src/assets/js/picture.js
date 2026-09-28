// Picture hanging: hook height for a picture centred at a chosen height, and the
// centre line and thirds of its width, to the nearest eighth of an inch.
//
// A port of Picture_Hanger_Calculator V1.1.xlsx, formula for formula, including how
// it rounds fractions; check-calculators.mjs holds this file to the workbook's own
// answers. Measurements are whole inches plus an eighth ('0', '1/8' ... '7/8').

export const EIGHTHS = ['0', '1/8', '1/4', '3/8', '1/2', '5/8', '3/4', '7/8'];
const frac = s => EIGHTHS.indexOf(s) / 8;

// A value as the workbook shows it: whole inches and the eighth at or above the
// fraction ('-' for none); a fraction above 7/8 carries into the next inch.
function eighths(x) {
  const t = Math.trunc(x), e = x - t;
  let f;
  if (e === 0) f = '-';
  else if (e > 7 / 8) f = '';
  else f = EIGHTHS[Math.ceil(e * 8 - 1e-12)] ?? '';
  const whole = f === '' ? 1 + t : t;
  return { whole, frac: f, exact: x };
}

// Inputs are [inches, eighth] pairs; width is optional.
export function hang({ height, hookDrop, center, width }) {
  const H = height[0] + frac(height[1]), drop = hookDrop[0] + frac(hookDrop[1]), C = center[0] + frac(center[1]);
  const out = { hook: eighths((C) + (H) / 2 - (drop)) };
  if (width) {
    const W = width[0] + frac(width[1]);
    out.centerLine = eighths(W / 2);
    out.third = eighths(W / 3);
  }
  return out;
}

export function problem({ height, hookDrop, center, width }) {
  for (const [v, what] of [[height, 'picture height'], [hookDrop, 'distance from the top of the picture to the hook'], [center, 'height of the picture centre']]) {
    if (v[0] === null) return `Enter the ${what}.`;
    if (Number.isNaN(v[0]) || v[0] < 0) return `The ${what} must be a positive number of inches.`;
  }
  if (width && (Number.isNaN(width[0]) || width[0] < 0)) return 'The picture width must be a positive number of inches.';
  return null;
}
