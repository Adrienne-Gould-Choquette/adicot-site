// Answer key for Psychrometric 2 Condition V1.1 (exact ASHRAE): the entering and
// leaving air properties in all three of its input modes, both unit systems, sea
// level and altitude. The page's loads come from airside.js, by the Handbook's
// exact method rather than the workbook's 1.08 and 0.68, and are checked against
// the Handbook's worked examples in check-handworked.mjs instead.
import { states, round } from '../src/assets/js/twostate.js';
import { problem } from '../src/assets/js/psychsheet.js';

const TYPES = { 'db-wb': ['Temperature, db', 'Temperature, wb'], 'db-rh': ['Temperature, db', 'RH %'], 'dp-rh': ['Temperature, dp', 'RH %'] };
const cases = [];
for (const units of ['US Units', 'Metric Units']) {
  const us = units === 'US Units';
  const grid = {
    'db-wb': us ? [[80, 67, 55, 54]] : [[26.7, 19.4, 12.8, 12.2]],
    'db-rh': us ? [[95, 50, 55, 95], [75, 50, 58, 90]] : [[35, 50, 13, 95]],
    'dp-rh': us ? [[73, 50, 53, 95]] : [[22.8, 50, 11.7, 95]],
  };
  for (const [mode, rows] of Object.entries(grid)) for (const [e1, e2, l1, l2] of rows) for (const alt of us ? [0, 5000] : [0, 1500]) {
    const dp = mode === 'dp-rh';
    cases.push({ units, t1: TYPES[mode][0], t2: TYPES[mode][1],
      c6: e1, c7: dp ? '' : e2, c8: dp ? e2 : '', d6: l1, d7: dp ? '' : l2, d8: dp ? l2 : '', airflow: us ? 1000 : 472, alt });
  }
}
const modeOf = row => (row.t1 === 'Temperature, dp' ? 'dp-rh' : row.t2 === 'RH %' ? 'db-rh' : 'db-wb');
const pick = (row, a, b) => Number(modeOf(row) === 'dp-rh' ? row[b] : row[a]);
export const args = row => ({
  units: row.units === 'US Units' ? 'US' : 'Metric', mode: modeOf(row), airflow: Number(row.airflow), altitude: Number(row.alt),
  entering: { first: Number(row.c6), second: pick(row, 'c7', 'c8') }, leaving: { first: Number(row.d6), second: pick(row, 'd7', 'd8') },
});

const PROPS = ['db', 'wb', 'dp', 'rh', 'v', 'h', 'W', 'grains', 'patm', 'pws'];
const ROWS = [25, 26, 27, 28, 29, 30, 31, 32, 33, 34];
export default {
  workbook: 'G:\\My Drive\\5-Calculators\\Psychrometric 2 Condition V1.1.xlsx',
  sheet: 'Condensate Generated',
  inputs: { units: 'C3', t1: 'A6', t2: 'A7', c6: 'C6', c7: 'C7', c8: 'C8', d6: 'D6', d7: 'D7', d8: 'D8', airflow: 'C9', alt: 'C10' },
  outputs: {
    ...Object.fromEntries(PROPS.flatMap((p, i) => [[`e_${p}`, `C${ROWS[i]}`], [`l_${p}`, `D${ROWS[i]}`]])),
  },
  cases,
  run: row => {
    // The workbook's results table rounds each property to 4 decimals.
    const [a, b] = states(args(row));
    return Object.fromEntries(PROPS.flatMap(p => [[`e_${p}`, round(a[p], 4)], [`l_${p}`, round(b[p], 4)]]));
  },
  refuse: [{ args: { mode: 'db-rh', first: 95, second: null, altitude: 0 }, says: 'Enter the relative humidity' }],
  check: ({ args, says }) => (problem(args) ?? '').startsWith(says),
};
