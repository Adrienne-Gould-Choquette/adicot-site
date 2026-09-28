// Answer key for FPM to CFM through a diffuser (V1.3): both directions, all three
// ways of giving the area, both unit systems, and the page's worked example.
import { solve, problem, typicalNet } from '../src/assets/js/diffuser.js';

const MODE = { 'L x W & Ak': 'lw', 'Core Area & Ak': 'core', 'Net Area': 'net' };
const FIND = { 'Q, Flow Rate': 'V', 'V, Velocity': 'Q' };   // the workbook names what is given
const cases = [];
for (const units of ['English', 'Metric']) for (const given of Object.keys(FIND)) for (const mode of Object.keys(MODE)) {
  const vals = given.startsWith('Q') ? (units === 'English' ? [150, 1200] : [70, 566]) : (units === 'English' ? [350, 976] : [2.5, 5]);
  for (const value of vals) for (const [L, W, core, Ak, net] of [[12, 18, 1.5, 0.82, 1.23], [24, 24, 4, 0.65, 2.58], [30.5, 45.7, 0.139, 0.7, 0.097]]) {
    cases.push({ units, given, value, mode, L: mode === 'L x W & Ak' ? L : '', W: mode === 'L x W & Ak' ? W : '',
      core: mode === 'Core Area & Ak' ? core : '', Ak: mode === 'Net Area' ? '' : Ak, net: mode === 'Net Area' ? net : '' });
  }
}
const n = v => (v === '' ? null : Number(v));

export default {
  workbook: 'G:\\My Drive\\5-Calculators\\FPM to CFM thru a Diffuser V1.3.xlsx',
  sheet: 'Sheet1',
  inputs: { units: 'B1', given: 'A2', value: 'B2', mode: 'A3', L: 'B4', W: 'D4', core: 'B5', Ak: 'B6', net: 'B7' },
  outputs: { result: 'B8', hint: 'F4' },
  cases,
  run: row => {
    const r = solve({ units: row.units, find: FIND[row.given], value: Number(row.value), mode: MODE[row.mode],
      L: n(row.L), W: n(row.W), core: n(row.core), Ak: n(row.Ak), net: n(row.net) });
    // The workbook's typical-net-area hint, in its own words, when L and W are entered.
    const hint = row.L !== '' && row.W !== '' ? `(Ak=${typicalNet(Number(row.L), Number(row.W))}ft2)` : '';
    return { result: r.result, hint };
  },
  refuse: [
    { args: { find: 'V', value: null, mode: 'net', net: 1 }, says: 'Enter the air flow rate' },
    { args: { find: 'Q', value: 500, mode: 'lw', L: 12, W: null, Ak: 0.8 }, says: 'Enter the core width' },
    { args: { find: 'V', value: 500, mode: 'core', core: 1.5, Ak: 1.3 }, says: 'The area factor, Ak, cannot be more than 1' },
    { args: { find: 'V', value: 500, mode: 'net', net: 0 }, says: 'The net area must be greater than zero' },
  ],
  check: ({ args, says }) => (problem({ L: null, W: null, core: null, Ak: null, net: null, ...args }) ?? '').startsWith(says),
};
