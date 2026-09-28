// Answer key for Diffuser Size Calculator V3.20: every type, velocities below the
// first catalog column, between columns and above the last, airflows either side
// of the 55 cfm rule up to 3,000 cfm, with and without a maximum NC, and metric
// inputs; through the show/hide flag of every size group, supply and return.
import { sheet, cfmOf, fpmOf, specSheet, OFFERED } from '../src/assets/js/diffuser-size.js';

const cases = [];
for (const type of OFFERED) {
  for (const fpm of [250, 300, 500, 650, 1000]) for (const cfm of [40, 55, 150, 400, 900, 1500, 3000]) for (const nc of ['', 30]) {
    cases.push({ units: 'US', type, fpm, mps: '', ls: '', cfm, nc });
  }
  for (const mps of [1.2, 2.5, 3.0, 5.2]) for (const ls of [20, 100, 500]) cases.push({ units: 'Metric', type, fpm: '', mps, ls, cfm: '', nc: '' });
}

const SUPPLY = Array.from({ length: 30 }, (_, i) => 10 + 3 * i);    // P10..P97
const RETURN = Array.from({ length: 26 }, (_, i) => 104 + 2 * i);   // P104..P154
const n = v => (v === '' || v === undefined ? 0 : Number(v));
const out = v => (v && v.error ? '#ERROR' : v);

export default {
  workbook: 'G:\\My Drive\\5-Calculators\\Diffuser Size Calculator V3.20.xlsx',
  sheet: 'Sheet1',
  inputs: { units: 'C1', type: 'C2', fpm: 'C3', mps: 'C4', ls: 'C5', cfm: 'C6', nc: 'C7' },
  outputs: {
    cfmOut: 'P2', velocity: 'U17', velText: 'J4', link: 'Q3', p8: 'P8', p102: 'P102',
    ...Object.fromEntries(SUPPLY.map(r => [`p${r}`, `P${r}`])),
    ...Object.fromEntries(RETURN.map(r => [`p${r}`, `P${r}`])),
  },
  cases,
  run: row => {
    const us = row.units === 'US';
    const cfm = cfmOf(row.units, n(us ? row.cfm : row.ls));
    const velocity = fpmOf(row.units, n(us ? row.fpm : row.mps));
    const { supply, ret } = sheet({ type: row.type, cfm, velocity, maxNc: row.nc === '' ? null : Number(row.nc) });
    const at = (rows, r) => rows.find(x => x.r === r);
    return {
      cfmOut: cfm, velocity,
      velText: row.mps === '' ? '' : `(${Math.round(velocity)} FPM)`,
      link: specSheet(row.type),
      p8: at(supply, 8).P, p102: at(ret, 102).P,
      ...Object.fromEntries(SUPPLY.map(r => [`p${r}`, out(at(supply, r).P)])),
      ...Object.fromEntries(RETURN.map(r => [`p${r}`, out(at(ret, r).P)])),
    };
  },
  refuse: [],
  check: () => true,
};
