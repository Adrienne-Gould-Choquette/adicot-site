// Answer key for Condensate Generated V2.16 (exact ASHRAE): the same coil
// conditions as the two-condition calculator, through this workbook's front sheet.
import { condensate } from '../src/assets/js/twostate.js';
import { problem } from '../src/assets/js/psychsheet.js';
import twoCond, { args } from './psychrometric-chart-2-condition.spec.mjs';

const PROPS = ['db', 'wb', 'dp', 'rh', 'v', 'h', 'W', 'grains', 'patm', 'pws', 'pw'];
const ROWS = [22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32];
export default {
  workbook: 'G:\\My Drive\\5-Calculators\\Condensate Generated V2.16.xlsx',
  sheet: 'Condensate Generated',
  inputs: twoCond.inputs,
  outputs: {
    lbh: 'C16', kgh: 'C17', volume: 'C18', pints: 'C19', btuh: 'C20', kW: 'C21',
    ...Object.fromEntries(PROPS.flatMap((p, i) => [[`e_${p}`, `C${ROWS[i]}`], [`l_${p}`, `D${ROWS[i]}`]])),
  },
  cases: twoCond.cases,
  run: row => {
    const r = condensate(args(row));
    return { ...r, ...Object.fromEntries(PROPS.flatMap(p => [[`e_${p}`, r.entering[p]], [`l_${p}`, r.leaving[p]]])) };
  },
  refuse: [{ args: { mode: 'dp-rh', first: 55, rh: 0, altitude: 0 }, says: 'The relative humidity must be' }],
  check: ({ args, says }) => (problem(args) ?? '').startsWith(says),
};
