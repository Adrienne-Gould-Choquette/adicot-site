// Answer key for the single-hung window size chart (V1.3): every size code.
import { WINDOWS, sizes } from '../src/assets/js/shwindow.js';

export default {
  workbook: 'G:\\My Drive\\5-Calculators\\Window Size Chart V1.3.xlsx',
  sheet: 'Sheet2',
  inputs: { code: 'A3' },
  outputs: { fw: 'A7', fh: 'B7', fwft: 'C7', fhft: 'D7', mw: 'E7', mh: 'F7', cw: 'G7', ch: 'H7',
    farea: 'A8', fareaft: 'C8', marea: 'E8', carea: 'G8', egress: 'A4' },
  cases: WINDOWS.map(w => ({ code: w[0] })),
  run: row => {
    const s = sizes(row.code);
    return {
      fw: s.frame.w, fh: s.frame.h, fwft: s.frameFt.w, fhft: s.frameFt.h, mw: s.masonry.w, mh: s.masonry.h,
      cw: s.clear.w, ch: s.clear.h, farea: s.frame.area, fareaft: s.frameFt.area, marea: s.masonry.area,
      carea: s.clear.area, egress: s.egress ? '*Egress on all floors' : '',
    };
  },
  refuse: [{ args: ['SH 99'] }, { args: [''] }],
  check: ({ args }) => sizes(...args) === null,
};
