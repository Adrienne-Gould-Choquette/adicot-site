// Answer key for temperature loss through an air duct (V1.14).
import { solve, problem, EXTERIOR, EXTERIOR_WB } from '../src/assets/js/ducttemp.js';

// Both shapes, all three exterior conditions, heat gain and heat loss, bare to
// well insulated, short to long runs.
const cases = [];
for (const shape of ['Rectangular', 'Round']) for (const [ei, ext] of EXTERIOR_WB.entries()) {
  for (const [q, ta, to] of [[2000, 55, 95], [1000, 155, -4], [450, 120, 70], [8000, 58, 110]]) {
    for (const [r, len] of [[0, 20], [6, 135], [8, 100], [4.2, 350]]) {
      cases.push({ shape, height: 16 + ei, width: 14, diameter: 18 - 2 * ei, ext, Q: q, tAir: ta, tOutside: to, rIns: r, length: len });
    }
  }
}

export default {
  workbook: 'G:\\My Drive\\5-Calculators\\Temp Loss Thru Air Duct Version 1.14.xlsx',
  sheet: 'Sheet1',
  inputs: { shape: 'C2', height: 'C3', width: 'E3', diameter: 'C4', ext: 'C5', Q: 'C6', tAir: 'C7', tOutside: 'C8', rIns: 'D9', length: 'C10' },
  outputs: { tExit: 'G2', dia: 'P8', perimeter: 'Q8', area: 'R8', velocity: 'D16', hInside: 'D17', hOutside: 'D18', mDot: 'D20', k: 'D21', rInside: 'D23', rOutside: 'D24', rTotal: 'D25' },
  cases,
  run: row => solve({
    shape: row.shape, height: Number(row.height), width: Number(row.width), diameter: Number(row.diameter),
    hOutside: EXTERIOR[EXTERIOR_WB.indexOf(row.ext)].h, Q: Number(row.Q), tAir: Number(row.tAir),
    tOutside: Number(row.tOutside), rInsulation: Number(row.rIns), length: Number(row.length),
  }),
  refuse: [
    { args: { shape: 'Round', diameter: null, Q: 1000, tAir: 55, tOutside: 95, rInsulation: 6, length: 100 }, says: 'Enter the duct diameter' },
    { args: { shape: 'Rectangular', height: 16, width: 0, Q: 1000, tAir: 55, tOutside: 95, rInsulation: 6, length: 100 }, says: 'The duct width must be greater than zero' },
    { args: { shape: 'Round', diameter: 18, Q: 1000, tAir: 55, tOutside: 95, rInsulation: -2, length: 100 }, says: 'The insulation R-value cannot be negative' },
    { args: { shape: 'Round', diameter: 18, Q: 1000, tAir: null, tOutside: 95, rInsulation: 6, length: 100 }, says: 'Enter the entering air temperature' },
  ],
  check: ({ args, says }) => (problem(args) ?? '').startsWith(says),
};
