// Answer key for Coil Selection V2.9, coil face area and velocity sheet.
import { face } from '../src/assets/js/coil.js';

const cases = [];
for (const units of ['English', 'Metric']) {
  for (const [h, w, q] of units === 'English' ? [[24, 36, 2000], [30, 48.5, 4000], [18, 20, 600]] : [[610, 914, 944], [762, 1232, 1888], [457, 508, 283]]) {
    cases.push({ units, h, w, q });
  }
}

export default {
  workbook: 'G:\\My Drive\\5-Calculators\\Coil Selection V2.9.xlsx',
  sheet: 'AREA & VELOCITY',
  inputs: { units: 'B1', h: 'B2', w: 'B3', q: 'B6' },
  outputs: { area: 'B4', velocity: 'B8' },
  cases,
  run: row => face(row.units, Number(row.h), Number(row.w), Number(row.q)),
  refuse: [],
  check: () => true,
};
