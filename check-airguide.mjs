// Are the AirGuide catalog transcriptions (calc-cases/sources/airguide-*.txt)
// consistent with themselves? They were read by eye from scanned catalog pages,
// so every value is checked against the catalog's own patterns:
//   - CFM = core area × velocity, within the catalog's rounding;
//   - NC never falls as velocity rises;
//   - each throw triple rises (150, 100, 50 fpm terminal velocity) and no throw
//     falls as velocity rises.
// A value that breaks a pattern is either a misread (fixed in the source) or a
// misprint in the catalog itself, kept as printed and listed in KNOWN below.
// Anything else fails the check.
import { parseAirguide } from './tools/extract/airguide.mjs';
import { RA } from './src/assets/js/airguide-grilles.js';
import { AG_CB, AG_RA, AG_V } from './src/assets/js/airguide-tables.js';

// Catalog misprints, confirmed against the page images, kept as printed.
const KNOWN = {
  cb: [
    '.12 6x4 3W 500 fpm: throw 9-6-14 does not rise',
    '.12 6x4 3W 500 fpm: throw 9-6-14 out of line with both neighbours',
    '.55 24x4 2W 700-800 fpm: throw falls from 14-26-32 to 15-22-36',
    '.55 24x4 1W 900 fpm: throw 20-3-49 does not rise',
    '.55 24x4 1W 800-900 fpm: throw falls from 17-26-43 to 20-3-49',
    '.62 18x6 4W 700-800 fpm: throw falls from 12-17-27 to 13-19-21',
    '.62 18x6 1W 500-600 fpm: throw falls from 12-18-29 to 15-21-24',
    '1.02 30x6 1W 900-1000 fpm: throw falls from 24-46-57 to 26-40-63',
    '2.10 24x14 1W 600-700 fpm: throw falls from 20-39-47 to 22-33-53',
    '4.72 36x20 4W 800-900 fpm: throw falls from 31-33-52 to 24-37-59',
    '5.82 36x24 1W 300-400 fpm: throw falls from 13-19-31 to 11-25-41',
    '8.63 36x36 CFM 900 fpm: 7700, area x velocity 7767',
  ],
  v: [
    '2.32 30x12 T22 800-1000 fpm: throw falls from 33-40-57 to 32-45-63',
    '2.79 36x12 T0 600-700 fpm: throw falls from 34-48-68 to 4-51-73',
    '3.27 42x12 T45 1000-1200 fpm: throw falls from 27-33-47 to 3-36-51',
    '4.47 26x26 T45 400-500 fpm: throw falls from 14-22-35 to 18-27-32',
    '7.69 48x24 T45 500-600 fpm: throw falls from 23-45-50 to 28-39-55',
  ],
};

const tri = v => (typeof v === 'string' && /^\d+-\d+-\d+$/.test(v) ? v.split('-').map(Number) : null);

export function lint(cat, { cfmTol = 0.005, cfmAbs = 5 } = {}) {
  const found = [];
  for (const s of cat.sizes) {
    const id = `${s.area < 1 ? String(s.area).replace(/^0/, '') : s.area.toFixed(2)} ${s.labels[0]}`;
    const cfm = s.rows.CFM ?? [];
    cfm.forEach((q, i) => {
      if (typeof q !== 'number') return;
      const want = s.area * cat.vel[i];
      if (Math.abs(q - want) > Math.max(cfmAbs, want * cfmTol)) found.push(`${id} CFM ${cat.vel[i]} fpm: ${q}, area x velocity ${Math.round(want)}`);
    });
    const nc = (s.rows.NC ?? []).map((v, i) => [v, i]).filter(([v]) => typeof v === 'number');
    for (let k = 1; k < nc.length; k++) if (nc[k][0] < nc[k - 1][0]) found.push(`${id} NC ${cat.vel[nc[k][1]]} fpm: ${nc[k][0]} below ${nc[k - 1][0]}`);
    for (const [key, vals] of Object.entries(s.rows)) {
      if (key === 'CFM' || key === 'NC') continue;
      const t = vals.map(tri);
      t.forEach((x, i) => { if (x && !(x[0] < x[1] && x[1] < x[2])) found.push(`${id} ${key} ${cat.vel[i]} fpm: throw ${vals[i]} does not rise`); });
      // Pairs of neighbouring throws where a later (higher velocity) one is
      // shorter. A throw out of line with both its neighbours is reported once,
      // as the outlier; any other break is reported as the pair.
      const idx = t.map((x, i) => (x ? i : -1)).filter(i => i >= 0);
      const bad = [];
      for (let k = 1; k < idx.length; k++) {
        const a = idx[k - 1], b = idx[k];
        if (t[b].some((v, c) => v < t[a][c])) bad.push([a, b]);
      }
      const outliers = new Set(idx.filter(i => bad.some(([a, b]) => b === i) && bad.some(([a]) => a === i)));
      for (const i of outliers) found.push(`${id} ${key} ${cat.vel[i]} fpm: throw ${vals[i]} out of line with both neighbours`);
      for (const [a, b] of bad) if (!outliers.has(a) && !outliers.has(b)) found.push(`${id} ${key} ${cat.vel[a]}-${cat.vel[b]} fpm: throw falls from ${vals[a]} to ${vals[b]}`);
    }
  }
  return found;
}

export function checkAirguide() {
  const lines = [], issues = [];
  let checks = 0;
  for (const [key, file] of [['cb', 'calc-cases/sources/airguide-cb.txt'], ['ra', 'calc-cases/sources/airguide-ra.txt'], ['v', 'calc-cases/sources/airguide-v.txt']]) {
    const cat = parseAirguide(file);
    const found = lint(cat);
    checks += cat.sizes.reduce((n, s) => n + Object.values(s.rows).flat().length, 0);
    const known = new Set(KNOWN[key] ?? []);
    for (const f of found) if (!known.has(f)) issues.push(`${key}: ${f}`);
    for (const k of known) if (!found.includes(k)) issues.push(`${key}: listed misprint no longer found: ${k}`);
    lines.push(`  ${key}: ${cat.sizes.length} sizes, consistent apart from ${known.size} catalog misprints kept as printed`);
  }
  // The page's generated tables are the sources, unchanged.
  for (const [name, table, file] of [['CB', AG_CB, 'airguide-cb.txt'], ['RA', AG_RA, 'airguide-ra.txt'], ['V', AG_V, 'airguide-v.txt']]) {
    checks++;
    if (JSON.stringify(table) !== JSON.stringify(parseAirguide(`calc-cases/sources/${file}`))) issues.push(`airguide-tables.js ${name} differs from ${file}; run node tools/extract/build-airguide.mjs`);
  }
  // The transfer sizer's RA list is the same grilles, sizes, core areas and Ak.
  const ra = parseAirguide('calc-cases/sources/airguide-ra.txt').sizes.map(x => {
    const [w, h] = x.labels[0].split('x').map(Number);
    return [w, h, x.area, x.ak];
  });
  checks++;
  if (JSON.stringify(ra) !== JSON.stringify(RA)) issues.push('ra: airguide-grilles.js RA differs from the catalog source');
  else lines.push('  ra: the transfer sizer’s RA list matches the source');
  return { lines, issues, checks };
}

if (process.argv[1]?.endsWith('check-airguide.mjs')) {
  const { lines, issues, checks } = checkAirguide();
  console.log('=== AirGuide catalog transcriptions ===');
  lines.forEach(l => console.log(l));
  console.log(`  ${checks} values`);
  issues.forEach(i => console.log('  FAILED: ' + i));
  process.exit(issues.length ? 1 : 0);
}
