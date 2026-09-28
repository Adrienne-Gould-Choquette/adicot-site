// Answer key for Coil Selection V2.9, water velocity in coil tubes.
import { tubeVelocity } from '../src/assets/js/coil.js';

const cases = [];
for (const units of ['English', 'Metric']) {
  for (const [q, d, n] of units === 'English' ? [[48, 0.5, 12], [20, 0.43, 8], [100, 0.62, 24]] : [[3, 1.27, 12], [1.26, 1.09, 8], [6.3, 1.57, 24]]) {
    cases.push({ units, q, d, n });
  }
}

export default {
  workbook: 'G:\\My Drive\\5-Calculators\\Coil Selection V2.9.xlsx',
  sheet: 'WATER VELOCITY (FPS)',
  inputs: { units: 'B1', q: 'B2', d: 'B3', n: 'B4' },
  outputs: { velocity: 'B5' },
  cases,
  run: row => ({ velocity: tubeVelocity(row.units, Number(row.q), Number(row.d), Number(row.n)) }),
  refuse: [],
  check: () => true,
};
