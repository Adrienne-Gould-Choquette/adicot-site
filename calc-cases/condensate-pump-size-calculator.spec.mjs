// Answer key for Condensate Pump Specifier V5.3: every pump type at each of its
// voltages, at heads on and between the catalog's listed heads and above the
// highest, and condensate flows from well under to well over the pumps'
// ratings. The condensate flow is set directly in C20, over its formula (the
// page computes it with the exact psychrometrics of Condensate Generated V2.16,
// held to that workbook by its own answer key). Outputs are each pump row's
// show/hide score (AE).
import { selectPumps, problem, TYPES, voltsFor } from '../src/assets/js/condensate-pump.js';
import { PUMPS } from '../src/assets/js/condensate-pump-models.js';

const HEADS = [0, 1, 3, 5, 7, 9, 10, 14, 20, 27, 35, 45, 55, 60, 65];
const GPH = [0.3, 1.2, 1.6, 2.5, 12, 30, 47, 70, 160, 300, 500];
const cases = [];
for (const type of TYPES) for (const volts of voltsFor(type)) for (const head of HEADS) for (const gph of GPH) cases.push({ type, volts, head, gph });

export default {
  workbook: 'G:\\My Drive\\5-Calculators\\Condensate Pump Specifier V5.3.xlsx',
  sheet: 'Condensate Generated',
  inputs: { type: 'C26', volts: 'C27', head: 'C28', gph: 'C20' },
  outputs: Object.fromEntries(PUMPS.map(([row]) => [`s${row}`, `AE${row}`])),
  cases,
  run: row => {
    const r = selectPumps({ type: row.type, volts: Number(row.volts), head: Number(row.head), gph: Number(row.gph) });
    return Object.fromEntries(r.map(p => [`s${p.row}`, p.ok ? 0 : 1]));
  },
  refuse: [
    { args: { type: 'Nope', volts: 115, head: 5, gph: 1 }, says: 'Choose the pump type' },
    { args: { type: TYPES[0], volts: 999, head: 5, gph: 1 }, says: 'Choose the voltage' },
    { args: { type: TYPES[0], volts: 115, head: -1, gph: 1 }, says: 'The head height must be' },
  ],
  check: ({ args, says }) => (problem(args) ?? '').startsWith(says),
};
