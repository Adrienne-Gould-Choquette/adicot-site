// Engineering economics: present value (P), future value (F) or uniform series (A)
// from any combination of the others and an arithmetic gradient (G), at rate i
// per period over n periods.
//
// A port of Engineering Economics V1.4.xlsx (not V1.5, which shows any negative
// answer as $0); check-calculators.mjs holds this file to the workbook's own
// answers. Each answer is the sum of every given amount times its factor, e.g.
//   F = A (F/A) + G (F/G) + P (F/P)
// At i = 0 the workbook divides by zero, and for rates below about 1e-7 the
// factors lose all precision to cancellation (F/G at i = 1e-9 is off sixfold);
// there the port uses the factors' exact limits as i goes to zero.

// find: 'F' | 'P' | 'A'. Amounts not given are 0.
export function solve({ find, P = 0, F = 0, A = 0, G = 0, i, n }) {
  if (Math.abs(i) < 1e-7) {
    if (find === 'F') return P + A * n + G * n * (n - 1) / 2;
    if (find === 'P') return F + A * n + G * n * (n - 1) / 2;
    return F / n + P / n + G * (n - 1) / 2;
  }
  const c = (1 + i) ** n;
  const f = {
    af: i / (c - 1), ap: i * c / (c - 1), ag: 1 / i - n / (c - 1),
    fa: (c - 1) / i, fg: (c - 1) / i ** 2 - n / i, fp: c,
    pa: (c - 1) / i / c, pf: 1 / c, pg: (c - i * n - 1) / i ** 2 / c,
  };
  if (find === 'A') return f.af * F + f.ap * P + f.ag * G;
  if (find === 'F') return f.fa * A + f.fg * G + f.fp * P;
  return f.pa * A + f.pf * F + f.pg * G;
}

export function problem({ find, P, F, A, G, i, n }) {
  if (i === null) return 'Enter the interest rate per period.';
  if (n === null) return 'Enter the number of periods.';
  for (const [v, what] of [[i, 'interest rate'], [n, 'number of periods'], [P, 'present value'], [F, 'future value'],
    [A, 'uniform series'], [G, 'gradient']]) {
    if (Number.isNaN(v)) return `The ${what} is not a number.`;
  }
  if (!(n > 0)) return 'The number of periods must be greater than zero.';
  if (i <= -1) return 'The interest rate must be greater than −100 %.';
  const given = { P, F, A, G };
  delete given[find];
  if (Object.values(given).every(v => v === null || v === 0)) return 'Enter at least one of the given amounts.';
  return null;
}
