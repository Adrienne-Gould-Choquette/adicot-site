// Mixed air temperature of two or three air streams.
//
// A port of Mixed Air Calculator V1.6.xlsx, formula for formula and in the
// workbook's order; check-calculators.mjs holds this file to the workbook's own
// answers. Each temperature is the flow-weighted mean of the streams':
//
//   T_mix = (T1 Q1 + T2 Q2 + T3 Q3) / (Q1 + Q2 + Q3)
//
// applied to dry bulb and wet bulb alike. The unit system only changes labels:
// the same equation holds in cfm and °F or in l/s and °C.

// streams: [{ q, db, wb }, ...]; a missing third stream is q = db = wb = 0, as
// blank cells are in the workbook.
export function mix(streams) {
  const [a, b, c] = [0, 1, 2].map(i => streams[i] ?? { q: 0, db: 0, wb: 0 });
  const total = a.q + b.q + c.q;
  return {
    total,
    db: (a.db * a.q / total) + b.db * b.q / total + c.db * c.q / total,
    wb: (a.wb * a.q / total) + b.wb * b.q / total + c.wb * c.q / total,
  };
}

const NAMES = ['outdoor air', 'return air', 'third air stream'];

// Why the streams cannot be mixed, or null. Outdoor and return air are required,
// the third stream is all or nothing. The workbook reads a blank as zero, which
// would quietly mix in air at 0°; here a partly filled stream is refused instead.
export function problem(streams) {
  for (const [i, s] of streams.entries()) {
    const name = NAMES[i];
    const vals = [[s.q, 'flow'], [s.db, 'dry bulb'], [s.wb, 'wet bulb']];
    if (i === 2 && vals.every(([v]) => v === null)) continue;
    for (const [v, what] of vals) {
      if (v === null) return `Enter the ${name} ${what}.`;
      if (Number.isNaN(v)) return `The ${name} ${what} is not a number.`;
    }
    if (s.q < 0) return `The ${name} flow cannot be negative.`;
    if (s.wb > s.db) return `The ${name} wet bulb is higher than its dry bulb, which is not possible.`;
  }
  const total = streams.reduce((t, s) => t + (s.q ?? 0), 0);
  if (!(total > 0)) return 'At least one stream needs an air flow above zero.';
  return null;
}
