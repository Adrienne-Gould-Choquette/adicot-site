// Answer key for the default fenestration and door values
// (Window Default Fenestration U_SHGC - 2023 FBC V1.2). Every window
// combination, each paired with a door type so all five doors are covered too.
import { FRAMES, PANES, GLAZING, DOORS, window, door } from '../src/assets/js/fenestration.js';

const cases = [];
let i = 0;
for (const frame of FRAMES) for (const panes of PANES) for (const glazing of GLAZING) {
  cases.push({ frame, panes, glazing, door: DOORS[i++ % DOORS.length][0] });
}

export default {
  workbook: 'G:\\My Drive\\5-Calculators\\Window Default Fenestration U_SHGC - 2023 FBC V1.2.xlsx',
  sheet: 'Sheet3',
  inputs: { frame: 'B2', panes: 'B3', glazing: 'B4', door: 'A14' },
  outputs: { u: 'B6', shgc: 'B7', vt: 'B8', doorU: 'B14' },
  cases,
  // The workbook writes each window value into a label, so compare the same text.
  run: row => {
    const w = window(row.frame, row.panes, row.glazing);
    return { u: `U-Value: ${w.U}`, shgc: `SHGC: ${w.SHGC}`, vt: `VT: ${w.VT}`, doorU: door(row.door) };
  },
  refuse: [
    { args: ['Metal', 'Triple Pane', 'Clear'], says: null },
    { args: ['Wood', 'Double Pane', 'Clear'], says: null },
  ],
  check: ({ args }) => window(...args) === null,
};
