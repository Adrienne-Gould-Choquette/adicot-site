// Answer key for the CLTD wall numbers (ASHRAE CLTD Surface Type, Wall sheet):
// every wall material, mass location, secondary material and R-value range.
import { wallNumber, wallCode, WALL_TYPES, WALL_MASS, WALL_SECONDARY, WALL_R } from '../src/assets/js/cltd.js';

const cases = [];
for (const [material] of WALL_TYPES) for (const mass of WALL_MASS) for (const secondary of WALL_SECONDARY) {
  for (const r of WALL_R) cases.push({ material, mass, secondary, r });
}

export default {
  workbook: 'G:\\My Drive\\5-Calculators\\ASHRAE CLTD Surface Type V1.1.xlsx',
  sheet: 'Wall',
  inputs: { material: 'B1', mass: 'B2', secondary: 'B3', r: 'B4' },
  outputs: { code: 'C1', wall: 'B5' },
  cases,
  run: row => {
    const n = wallNumber(row.material, row.mass, row.secondary, row.r);
    return { code: wallCode(row.material), wall: n ?? 'No Value' };
  },
  refuse: [{ args: ['8" Clay tile', 'Mass Evenly Distributed', 'Face brick', '99 - 100'] }],
  check: ({ args }) => wallNumber(...args) === null,
};
