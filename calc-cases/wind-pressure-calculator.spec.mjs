// Answer key for the mechanical equipment wind pressure calculator (V9.0, ASCE 7-22).
import { solve, problem } from '../src/assets/js/windload.js';

// Rooftop in and out of Florida, slab and wall mounting, every exposure, low and
// high buildings (the 15 ft floor on z), small and large equipment, and wind
// speeds from 105 to 185 mph.
const cases = [];
const EQUIP = [[48, 30, 36], [96, 60, 44], [20, 18, 30], [130, 70, 55]];
for (const exposure of ['B', 'C', 'D']) for (const V of [105, 150, 185]) for (const [i, [L, D, H]] of EQUIP.entries()) {
  cases.push({ rooftop: 'YES', florida: i % 2 ? 'YES' : 'NO', clearance: [14, 12, 24, 36][i], roofHeight: [10, 35, 80, 150][i], mount: '', mountHeight: '', L, D, H, risk: 'II', V, exposure });
  cases.push({ rooftop: 'NO', florida: 'NO', clearance: '', roofHeight: '', mount: i % 2 ? 'Wall Mounted' : 'Slab Mounted', mountHeight: i % 2 ? 20 : 0, L, D, H, risk: 'III', V, exposure });
}

// Blank cells read as zero in the workbook.
const n = v => (v === '' ? 0 : Number(v));
const args = row => ({
  rooftop: row.rooftop === 'YES', florida: row.florida === 'YES', clearance: n(row.clearance), roofHeight: n(row.roofHeight),
  mountHeight: n(row.mountHeight), L: n(row.L), D: n(row.D), H: n(row.H), V: n(row.V), exposure: row.exposure,
});

export default {
  workbook: 'G:\\My Drive\\5-Calculators\\Wind Load Calculator-V9.0.xlsx',
  sheet: 'Velocity Pressure',
  inputs: { rooftop: 'B3', florida: 'B4', clearance: 'B5', roofHeight: 'B6', mount: 'A7', mountHeight: 'B7', L: 'B8', D: 'B9', H: 'B10', risk: 'B11', V: 'B12', exposure: 'B13' },
  outputs: { lateral: 'B16', uplift: 'B17', z: 'E13', Kz: 'E18', qz: 'E19', clearMsg: 'C5', warning: 'A18' },
  cases,
  run: row => {
    const a = args(row);
    const r = solve(a);
    // The workbook's own wording for the clearance check and the stability warning.
    const clearMsg = '[in] ' + (!a.florida ? '' : r.hvhz.ok
      ? `Min. Clearance for HVHZ = ${r.hvhz.min}'' - OK`
      : `Insufficient Clearance for HVHZ (Min.${r.hvhz.min}'')`);
    const warning = r.unstable ? 'Warning - Calculator not stable for Equip length/ Equp Height >=2' : '';
    return { ...r, clearMsg, warning };
  },
  refuse: [
    { args: { rooftop: true, clearance: null, roofHeight: 20, L: 48, D: 30, H: 36, V: 150, exposure: 'C' }, says: 'Enter the clearance below the equipment' },
    { args: { rooftop: false, mountHeight: 0, L: 48, D: 30, H: 0, V: 150, exposure: 'C' }, says: 'The equipment height must be greater than zero' },
    { args: { rooftop: false, mountHeight: -3, L: 48, D: 30, H: 36, V: 150, exposure: 'C' }, says: 'The mounting height cannot be negative' },
    { args: { rooftop: false, mountHeight: 0, L: 48, D: 30, H: 36, V: 150, exposure: '' }, says: 'Choose the exposure category' },
  ],
  check: ({ args, says }) => (problem(args) ?? '').startsWith(says),
};
