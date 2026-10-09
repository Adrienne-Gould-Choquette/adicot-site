// Answer key for the picture hanger (Picture_Hanger_Calculator V1.3): every eighth,
// whole-inch results, and fractions that carry into the next inch, including the
// centre line of widths such as 35 7/8 in. (V1.0 dropped it to the lower inch;
// V1.2 changed only the diagram, which now measures the hook height to the hook;
// V1.3 adds a centimetre block in rows 23-32, checked in check-handworked.mjs).
import { hang, problem, EIGHTHS } from '../src/assets/js/picture.js';

const cases = [];
for (const [i, e] of EIGHTHS.entries()) {
  cases.push({ h: 24 + i, hf: e, d: 3, df: EIGHTHS[(i + 3) % 8], c: 60, cf: EIGHTHS[(i + 5) % 8], w: 36 + i, wf: EIGHTHS[(7 - i)] });
  cases.push({ h: 17, hf: EIGHTHS[(i + 1) % 8], d: 0, df: e, c: 57, cf: '0', w: 63, wf: e });
}
cases.push({ h: 30, hf: '0', d: 4, df: '0', c: 60, cf: '0', w: 40, wf: '0' });
for (const w of [11, 23, 35, 47]) cases.push({ h: 20, hf: '0', d: 2, df: '1/2', c: 58, cf: '0', w, wf: '7/8' });

const pair = (a, f) => [Number(a), f];

export default {
  workbook: 'G:\\My Drive\\5-Calculators\\Picture_Hanger_Calculator V1.3.xlsx',
  sheet: 'Sheet1',
  inputs: { h: 'B13', hf: 'C13', d: 'B14', df: 'C14', c: 'B15', cf: 'C15', w: 'B19', wf: 'C19' },
  outputs: { hookWhole: 'B16', hookFrac: 'C16', lineWhole: 'B20', lineFrac: 'C20', thirdWhole: 'B21', thirdFrac: 'C21' },
  cases,
  run: row => {
    const r = hang({ height: pair(row.h, row.hf), hookDrop: pair(row.d, row.df), center: pair(row.c, row.cf), width: pair(row.w, row.wf) });
    return { hookWhole: r.hook.whole, hookFrac: r.hook.frac, lineWhole: r.centerLine.whole, lineFrac: r.centerLine.frac,
      thirdWhole: r.third.whole, thirdFrac: r.third.frac };
  },
  refuse: [
    { args: { height: [null, '0'], hookDrop: [3, '0'], center: [60, '0'] }, says: 'Enter the picture height' },
    { args: { height: [24, '0'], hookDrop: [-1, '0'], center: [60, '0'] }, says: 'The distance from the top' },
  ],
  check: ({ args, says }) => (problem(args) ?? '').startsWith(says),
};
