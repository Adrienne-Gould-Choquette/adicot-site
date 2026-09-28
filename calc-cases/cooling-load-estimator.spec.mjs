// Answer key for Cooling Load Ballpark Estimator V1.6: every building type, both
// unit systems.
import { estimate, BUILDINGS } from '../src/assets/js/coolingload.js';

const cases = [];
for (const units of ['US', 'Metric']) {
  for (const b of BUILDINGS) cases.push({ units, area: units === 'US' ? 10000 : 929, type: b[1] });
  for (const area of [1, 2500.5, 250000]) cases.push({ units, area, type: BUILDINGS[2][1] });
}

const blank = v => v ?? '';
export default {
  workbook: 'G:\\My Drive\\5-Calculators\\Cooling Load Ballpark Estimator V1.6.xlsx',
  sheet: 'Sheet5',
  inputs: { units: 'B3', area: 'B5', type: 'B7' },
  outputs: {
    occLo: 'B12', occAvg: 'C12', occHi: 'D12',
    wLo: 'E12', wAvg: 'F12', wHi: 'G12',
    tonsLo: 'H12', tonsAvg: 'I12', tonsHi: 'J12',
    heatLo: 'H13', heatAvg: 'I13', heatHi: 'J13',
  },
  cases,
  run: row => {
    const r = estimate(row.units === 'US' ? 'English' : 'Metric', Number(row.area), row.type);
    const [occLo, occAvg, occHi] = r.occupants.map(blank);
    const [wLo, wAvg, wHi] = r.watts.map(blank);
    const [tonsLo, tonsAvg, tonsHi] = r.tons.map(blank);
    const [heatLo, heatAvg, heatHi] = r.heat.map(blank);
    return { occLo, occAvg, occHi, wLo, wAvg, wHi, tonsLo, tonsAvg, tonsHi, heatLo, heatAvg, heatHi };
  },
  refuse: [],
  check: () => true,
};
