// Hourly CLTDs from the 1997 ASHRAE Handbook—Fundamentals (SI), Chapter 28:
// Table 30 (flat roofs) and Table 32 (sunlit walls), July, 40°N, in kelvins.
// Reads the glyph-position text tools/extract/pdfpos.mjs writes for each table:
//
//   node tools/extract/pdfpos.mjs "…/Fundamentals 1997….pdf" "Flat Roofs at 40" t30.txt
//   node tools/extract/pdfpos.mjs "…/Fundamentals 1997….pdf" "Sunlit Walls" t32.txt
//   node tools/extract/cltd1997.mjs t30.txt t32.txt calc-cases/sources/ashrae-1997-cltd-si.json
//
// Every row must have exactly 24 integers, the roof numbers must be those of
// Table 31, and each wall number all eight orientations, or the script stops.
import fs from 'node:fs';

const [t30, t32, out] = process.argv.slice(2);
const cells = l => l.split(' | ').map(s => s.trim());
const ints = a => a.map(v => { if (!/^-?\d+$/.test(v)) throw new Error(`not an integer: ${v} in ${a.join(' ')}`); return Number(v); });

const roofs = {};
for (const l of fs.readFileSync(t30, 'utf8').split('\n')) {
  const c = cells(l);
  if (c.length === 25 && /^\d+$/.test(c[0])) roofs[c[0]] = ints(c.slice(1));
}
const ROOF_NUMBERS = ['1', '2', '3', '4', '5', '8', '9', '10', '13', '14'];
if (Object.keys(roofs).join() !== ROOF_NUMBERS.join()) throw new Error(`roof numbers: ${Object.keys(roofs)}`);

const ORIENT = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
const walls = {};
let current = null;
for (const l of fs.readFileSync(t32, 'utf8').split('\n')) {
  const c = cells(l);
  const head = /^Wall \| Number \| (\d+)$/.exec(l.trim());
  if (head) { current = head[1]; walls[current] = {}; continue; }
  if (current && c.length === 25 && ORIENT.includes(c[0])) walls[current][c[0]] = ints(c.slice(1));
}
const WALL_NUMBERS = ['1', '2', '3', '4', '5', '6', '7', '9', '10', '11', '12', '13', '14', '15', '16'];
if (Object.keys(walls).join() !== WALL_NUMBERS.join()) throw new Error(`wall numbers: ${Object.keys(walls)}`);
for (const [n, w] of Object.entries(walls)) if (Object.keys(w).join() !== ORIENT.join()) throw new Error(`wall ${n}: ${Object.keys(w)}`);

fs.writeFileSync(out, JSON.stringify({
  source: '1997 ASHRAE Handbook—Fundamentals (SI), Chapter 28, Table 30 (flat roofs) and Table 32 (sunlit walls): July cooling load temperature differences at 40°N, K, hours 1–24 solar time. Read from G:/My Drive/3-Codes/ASHRAE/old/Fundamentals 1997 HVAC Fundamentals Handbook.pdf by glyph position (tools/extract/pdfpos.mjs, cltd1997.mjs). Conditions: dark surface, indoor 25.5 °C, outdoor maximum 35 °C, mean 29.5 °C, daily range 11.6 °C. Correction: Corr. CLTD = CLTD + (25.5 − tr) + (tm − 29.4).',
  roofs, walls,
}, null, 1));
console.log(`roofs ${Object.keys(roofs).length}, walls ${Object.keys(walls).length} × 8 orientations`);
