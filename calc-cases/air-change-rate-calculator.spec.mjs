// Answer key for the air change rate calculator (ACH V1.6).
import { solve, problem } from '../src/assets/js/ach.js';

const UNITS = { English: 'US', SI: 'SI' };
const GIVEN = { 'Air Flow Rate, Q': 'Q', 'Air Changes/hr, ACH': 'ACH' };
const MODE = { Area: 'area', 'Length x Width': 'lw' };

// Both unit systems, both directions, both ways of giving the floor, across
// closets to warehouses and fractional values.
const cases = [];
for (const units of Object.keys(UNITS)) for (const given of Object.keys(GIVEN)) {
  const values = given.startsWith('Air Flow') ? [25, 100.8, 450, 2375.5, 12000] : [0.35, 3, 6, 12.5, 25];
  for (const value of values) for (const height of [2.4, 8, 14]) {
    cases.push({ units, given, value, height, mode: 'Area', area: 144, length: '', width: '' });
    cases.push({ units, given, value, height, mode: 'Length x Width', area: '', length: 12, width: 12 });
    cases.push({ units, given, value, height, mode: 'Length x Width', area: '', length: 250.5, width: 80 });
  }
}

const args = row => ({
  units: UNITS[row.units], given: GIVEN[row.given], value: Number(row.value), height: Number(row.height),
  areaMode: MODE[row.mode], area: Number(row.area), length: Number(row.length), width: Number(row.width),
});

export default {
  workbook: 'G:\\My Drive\\5-Calculators\\ACH V1.6.xlsx',
  sheet: 'Sheet1',
  inputs: { units: 'C1', given: 'B3', value: 'C3', height: 'C5', mode: 'C6', area: 'C7', length: 'C8', width: 'E8' },
  outputs: { volume: 'C9', Q: 'C13', ACH: 'C15' },
  cases,
  run: row => solve(args(row)),
  refuse: [
    { args: { given: 'Q', value: null, height: 8, areaMode: 'area', area: 100 }, says: 'Enter the air flow rate' },
    { args: { given: 'ACH', value: 0, height: 8, areaMode: 'area', area: 100 }, says: 'Air changes per hour must be greater than zero' },
    { args: { given: 'Q', value: 100, height: -8, areaMode: 'area', area: 100 }, says: 'Room height must be greater than zero' },
    { args: { given: 'Q', value: 100, height: 8, areaMode: 'lw', length: 10, width: null }, says: 'Enter the room width' },
    { args: { given: 'Q', value: 100, height: 8, areaMode: 'area', area: NaN }, says: 'Floor area is not a number' },
  ],
  check: ({ args, says }) => (problem(args) ?? '').startsWith(says),
};
