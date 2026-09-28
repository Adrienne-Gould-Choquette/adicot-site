// Answer key for the heat pump balance point calculator: the workbook's own
// example, cold-climate and oversized heat pumps (no supplemental heat), loads
// past the largest strip heater, a flat capacity line, rating points given in
// either order, and parallel lines that never cross.
import { balancePoint, problem } from '../src/assets/js/balancepoint.js';

const cases = [
  [65, 17, 15000, 17, 10700, 47, 17800],
  [65, 5, 36000, 17, 22000, 47, 34000],
  [65, -10, 60000, 5, 30000, 47, 42000],
  [60, 10, 24000, 17, 30000, 47, 36000],
  [65, 20, 90000, 17, 40000, 47, 60000],
  [65, 17, 18000, 17, 12000, 47, 12000],
  [65, 17, 15000, 47, 17800, 17, 10700],
  [65, 17, 4800, 17, 10000, 47, 7000],
  [70, 0, 50000, -5, 28000, 47, 48000],
  [65, 2, 32000, 5, 16500, 47, 29500],
  [68, 25, 12000, 17, 9000, 47, 14000],
  [65, 17, 0, 17, 10700, 47, 17800],
  [65, 17, 30000, 17, 0, 47, 12000],
  [55, -20, 75000, -13, 28000, 47, 51000],
  [65, 17, 42650.5, 17, 18250.25, 47, 29900.75],
].map(([zeroTemp, designTemp, designLoad, lowTemp, lowCap, highTemp, highCap]) =>
  ({ zeroTemp, designTemp, designLoad, lowTemp, lowCap, highTemp, highCap }));

const blank = x => (x === null ? '' : x);

export default {
  workbook: 'G:\\My Drive\\5-Calculators\\Balance Point V1.1.xlsx',
  sheet: 'Sheet1',
  inputs: { zeroTemp: 'B1', designTemp: 'B2', designLoad: 'C2', lowTemp: 'B3', lowCap: 'C3', highTemp: 'B4', highCap: 'C4' },
  outputs: { loadSlope: 'B6', capSlope: 'B7', balance: 'B8', loadAtBalance: 'B9', capAtDesign: 'B10',
    supplemental: 'B11', supplementalKw: 'B12', strip: 'B13', emergencyKw: 'B14', emergencyStrip: 'B15' },
  cases,
  run: row => {
    const r = balancePoint(Object.fromEntries(Object.entries(row).map(([k, v]) => [k, Number(v)])));
    return { ...r, balance: blank(r.balance), loadAtBalance: blank(r.loadAtBalance) };
  },
  refuse: [
    { args: { ...cases[0], designLoad: null }, says: 'Enter the design heat loss' },
    { args: { ...cases[0], zeroTemp: 10 }, says: 'The no-load temperature must be above' },
    { args: { ...cases[0], highTemp: 17 }, says: 'The two rating temperatures must differ' },
    { args: { ...cases[0], lowCap: -5 }, says: 'The capacity at the low rating temperature cannot be negative' },
  ],
  check: ({ args, says }) => (problem(args) ?? '').startsWith(says),
};
