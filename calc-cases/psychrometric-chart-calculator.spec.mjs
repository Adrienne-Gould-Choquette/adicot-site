// Answer key for the psychrometric calculator (Psycrometric V3.5, exact ASHRAE):
// all three input modes, both unit systems, sea level and altitude, cold to hot.
import { state, problem } from '../src/assets/js/psychsheet.js';

const MODE = { 'db-wb': ['Temperature, db', 'Temperature, wb'], 'db-rh': ['Temperature, db', 'RH %'], 'dp-rh': ['Temperature, dp', 'RH %'] };
const cases = [];
for (const units of ['US Units', 'Metric Units']) {
  const us = units === 'US Units';
  const grid = {
    'db-wb': us ? [[40, 38], [75, 62.5], [95, 78], [110, 70]] : [[5, 3], [24, 17], [35, 25.6], [43, 21]],
    'db-rh': us ? [[40, 30], [75, 50], [95, 45], [55, 95]] : [[5, 30], [24, 50], [35, 45], [13, 95]],
    'dp-rh': us ? [[35, 50], [55, 60], [70, 80], [45, 20]] : [[2, 50], [13, 60], [21, 80], [7, 20]],
  };
  for (const [mode, pairs] of Object.entries(grid)) for (const [a, b] of pairs) for (const alt of us ? [0, 5280] : [0, 1600]) {
    cases.push({ units, t1: MODE[mode][0], t2: MODE[mode][1], c5: a, c6: mode === 'dp-rh' ? '' : b, c7: mode === 'dp-rh' ? b : '', c8: alt });
  }
}
const toMode = row => (row.t1 === 'Temperature, dp' ? 'dp-rh' : row.t2 === 'RH %' ? 'db-rh' : 'db-wb');

export default {
  workbook: 'G:\\My Drive\\5-Calculators\\Psycrometric V3.5.xlsx',
  sheet: 'Sheet1',
  inputs: { units: 'C4', t1: 'A5', t2: 'A6', c5: 'C5', c6: 'C6', c7: 'C7', c8: 'C8' },
  outputs: { db: 'C14', wb: 'C15', dp: 'C16', rh: 'C17', v: 'C18', h: 'C19', W: 'C20', grains: 'C21', patm: 'C22', pws: 'C23', pw: 'C24' },
  cases,
  run: row => {
    const r = state({ units: row.units === 'US Units' ? 'US' : 'Metric', mode: toMode(row), first: Number(row.c5),
      second: row.c6 === '' ? null : Number(row.c6), rh: row.c7 === '' ? null : Number(row.c7), altitude: Number(row.c8) });
    return { ...r, grains: r.grains ?? '**' };
  },
  refuse: [
    { args: { mode: 'db-rh', first: 75, second: 120, altitude: 0 }, says: 'The relative humidity must be' },
    { args: { mode: 'db-wb', first: 75, second: 80, altitude: 0 }, says: 'The wet bulb cannot be higher' },
    { args: { mode: 'dp-rh', first: 55, rh: null, altitude: 0 }, says: 'Enter the relative humidity' },
  ],
  check: ({ args, says }) => (problem(args) ?? '').startsWith(says),
};
