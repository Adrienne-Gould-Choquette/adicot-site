// Do the CLTD page's hourly tables still match what was read from the 1997
// ASHRAE Handbook? The answer key is the extraction itself (calc-cases/sources),
// checked a second, independent way against the I-P printing's Table 30 as read
// from a photo, plus hand-worked corrections.
import fs from 'node:fs';
import { ROOF_CLTD, WALL_CLTD } from './src/assets/js/cltd-hourly-tables.js';
import { hourly, tableValues } from './src/assets/js/cltd-hourly.js';
import { ROOF, WALL } from './src/assets/js/cltd-tables.js';

const src = f => JSON.parse(fs.readFileSync(`calc-cases/sources/${f}`, 'utf8'));

export function checkCltdHourly() {
  const lines = [], issues = [];
  let checks = 0;
  const same = (what, a, b) => { checks++; if (JSON.stringify(a) !== JSON.stringify(b)) issues.push(`${what}: ${JSON.stringify(a)} ≠ ${JSON.stringify(b)}`); };
  const near = (what, a, b, tol) => { checks++; if (!(Math.abs(a - b) <= tol)) issues.push(`${what}: ${a} vs ${b}`); };

  const si = src('ashrae-1997-cltd-si.json');
  same('roof table', ROOF_CLTD, si.roofs);
  same('wall table', WALL_CLTD, si.walls);
  for (const [n, v] of Object.entries(si.roofs)) same(`roof ${n} has 24 hours`, v.length, 24);
  for (const [n, w] of Object.entries(si.walls)) for (const [o, v] of Object.entries(w)) same(`wall ${n} ${o} has 24 hours`, v.length, 24);
  lines.push(`  1997 Tables 30 and 32: ${Object.keys(si.roofs).length} roofs, ${Object.keys(si.walls).length} walls × 8 orientations, as extracted`);

  // Every roof and wall number the lookup can give has hourly values.
  for (const r of ROOF) for (const n of r.slice(1)) if (n != null) same(`roof number ${n} has hourly values`, !!tableValues('roof', String(n)), true);
  for (const [, v] of WALL) for (const n of v) if (n) same(`wall number ${n} has hourly values`, !!tableValues('wall', String(n), 'N'), true);
  lines.push('  every roof and wall number the lookup gives has hourly values');

  // The I-P printing, read from a photo: within 0.9 °F of K × 1.8 (the SI table
  // is rounded to whole kelvins, ±0.9 °F).
  const photo = src('ashrae-1997-cltd-ip-table-30-photo.json').roofs;
  let n = 0;
  for (const [r, v] of Object.entries(photo)) v.forEach((f, h) => { n++; near(`roof ${r} hour ${h + 1}: I-P ${f} °F vs SI ${si.roofs[r][h]} K`, si.roofs[r][h] * 1.8, f, 0.9); });
  lines.push(`  ${n} values of the I-P Table 30 (photo) within 0.9 °F of the SI values`);

  // Hand-worked corrections.
  // No correction where the mean is the formula's reference (85 °F, 29.4 °C). At
  // the table's own stated conditions (95 °F max, 21 °F range) the published
  // formula gives a mean of 84.5 °F and so -0.5 °F: the Handbook's own rounding.
  near('no correction at 78 °F in, 85 °F mean', hourly(si.roofs[1], { units: 'IP', indoor: 78, max: 95, range: 20 }).correction, 0, 1e-12);
  near('no correction at 25.5 °C in, 29.4 °C mean', hourly(si.roofs[1], { units: 'SI', indoor: 25.5, max: 35, range: 11.2 }).correction, 0, 1e-12);
  near('table conditions, as published: -0.5 °F', hourly(si.roofs[1], { units: 'IP', indoor: 78, max: 95, range: 21 }).correction, -0.5, 1e-12);
  const c = hourly(si.roofs[1], { units: 'IP', indoor: 75, max: 90, range: 20, u: 0.1, area: 1000 });
  near('roof 1, 75 °F in, 90 °F max, 20 °F range: correction', c.correction, (78 - 75) + (80 - 85), 1e-12);
  near('roof 1 hour 14 corrected', c.hours[13].corrected, 49 * 1.8 - 2, 1e-9);
  near('roof 1 hour 14 q', c.hours[13].q, 0.1 * 1000 * (49 * 1.8 - 2), 1e-9);
  same('roof 1 peak hour', c.peak.hour, 14);
  lines.push('  hand-worked corrections and loads match');
  return { lines, issues, checks };
}

if (process.argv[1]?.endsWith('check-cltd-hourly.mjs')) {
  const { lines, issues, checks } = checkCltdHourly();
  console.log('=== CLTD hourly tables vs the 1997 Handbook ===');
  lines.forEach(l => console.log(l));
  console.log(`  ${checks} comparisons`);
  issues.slice(0, 20).forEach(i => console.log('  FAILED: ' + i));
  process.exit(issues.length ? 1 : 0);
}
