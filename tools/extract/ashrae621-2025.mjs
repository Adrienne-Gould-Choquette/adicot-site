// Capture ANSI/ASHRAE Standard 62.1-2025 Tables 6-1, 6-2 and E-1 from the text
// of the standard (tools/extract/pdftext.mjs output) into
// calc-cases/sources/ashrae-62.1-2025-tables.json. Cells are kept as printed
// (strings; "—" is the standard's not applicable); only the PDF's broken words
// are rejoined.
//
//   node tools/extract/pdftext.mjs "…/ASHRAE 62.1-2025.pdf" full.txt
//   node tools/extract/ashrae621-2025.mjs full.txt [out.json]
import fs from 'node:fs';

const lines = fs.readFileSync(process.argv[2], 'utf8').split(/\r?\n/);
const out = process.argv[3] ?? 'calc-cases/sources/ashrae-62.1-2025-tables.json';

// Words the PDF split with a stray space, and doubled spaces.
const FIX = [[/postoperati ve/, 'postoperative'], [/fixe d/, 'fixed'], [/dini ng/, 'dining'], [/li quids/, 'liquids'],
  [/de posit/, 'deposit'], [/reli gious/, 'religious'], [/re covery/, 'recovery'], [/commerc ial/, 'commercial'],
  [/fixt ure/, 'fixture'], [/athletic ,/, 'athletic,'], [/thera py/, 'therapy']];
// U+F020 is the PDF's symbol-font space.
const clean = s => FIX.reduce((t, [re, to]) => t.replace(re, to), s).replace(/[\s]+/g, ' ').replace(/ \)/g, ')').trim();

const start = (re, from = 0) => { const i = lines.findIndex((l, k) => k >= from && re.test(l)); if (i < 0) throw new Error(`not found: ${re}`); return i; };

// Table 6-1 and E-1 value run: numbers, "—" and "NA" at the end of a line.
const VAL = String.raw`(?:—|NA|\d+(?:\.\d+)?|)`;   // U+F0FC: the OS column's check mark
const TAIL = new RegExp(String.raw`^(.*?)\s*((?:${VAL}\s+)*${VAL})\s*$`);
const HEADINGS61 = ['Animal Facilities', 'Correctional Facilities', 'Educational Facilities', 'Food and Beverage Service', 'General',
  'Hotels, Motels, Resorts, Dormitories', 'Miscellaneous Spaces', 'Office Buildings', 'Public Assembly Spaces', 'Residential',
  'Retail', 'Sports and Entertainment'];

// Rows of a breathing-zone table between two line numbers. A row is a name
// (possibly wrapped over lines) followed by its values; `width` is the number
// of values a complete row has.
function breathing(from, to, headings) {
  const rows = [];
  let group = null, name = '';
  for (let i = from; i < to; i++) {
    const l = lines[i].trim();
    if (!l || l.startsWith('===') || /ANSI\/ASHRAE Standard 62\.1-2025/.test(l)) continue;
    const h = headings.find(x => clean(l).replace(/\s*a,b$/, '') === x);
    if (h) { group = h; name = ''; continue; }
    if (!group) continue;
    const m = TAIL.exec(l);
    const alone = /^\d+$/.test(l) && name === '' && rows.length;   // a CO2 value wrapped onto its own line
    if (alone) { rows[rows.length - 1].values.push(l); continue; }
    if (m && /\d|—|NA/.test(m[2]) && m[2].split(/\s+/).length >= 3) {
      const vals = m[2].split(/\s+/);
      rows.push({ group, name: clean(`${name} ${m[1]}`), os: vals.includes(''), values: vals.filter(v => v !== '') });
      name = '';
    } else name = `${name} ${l}`;
  }
  return rows;
}

// Table 6-1: pages up to Table 6-2, skipping the repeated headers.
const t61 = start(/^Table 6-1\s+Minimum Ventilation Rates in Breathing Zone\s*$/);
const t62 = start(/^Table 6-2\s+Minimum Exhaust Rates/);
const body = [];
for (let i = t61; i < t62; i++) body.push(i);
// Drop header blocks: from a "Table 6-1" line through "#/100 m" + "2".
const skip = new Set();
for (let i = t61; i < t62; i++) {
  if (/^Table 6-1/.test(lines[i].trim())) {
    let j = i;
    while (j < t62 && !/or #\/100 m/.test(lines[j])) skip.add(j++);
    skip.add(j); skip.add(j + 1);
  }
}
const kept = lines.slice();
for (const i of skip) kept[i] = '';
const saved = lines.splice(0, lines.length, ...kept);
const table61 = breathing(t61, t62, HEADINGS61);
lines.splice(0, lines.length, ...saved);

// Table 6-2: flat rows "name v v v v class", with sub-rows for continuous and
// intermittent operation under the rows that have them.
const t63 = start(/^Table 6-3\s+Airstreams or Sources/, t62);
const table62 = [];
let group62 = null;
for (let i = start(/^Animal Facilities$/, t62); i < t63; i++) {
  const l = clean(lines[i]);
  if (!l || l.startsWith('===') || /ANSI\/ASHRAE Standard 62\.1-2025/.test(l)) continue;
  if (l === 'Animal Facilities') { group62 = l; continue; }
  const sub = /^(Continuous|Intermittent) operation (\S+) (\S+)$/.exec(l);
  if (sub) { table62[table62.length - 1].modes.push({ mode: sub[1], cfmUnit: sub[2], lsUnit: sub[3] }); continue; }
  const full = /^(.*?) (\S+) (\S+) (\S+) (\S+) (\d)$/.exec(l);
  const split = /^(.*?)(?: — —)? (\d)$/.exec(l);   // a row whose rates follow on sub-rows
  if (full && /^(—|\d)/.test(full[2])) table62.push({ group: group62, name: full[1], values: full.slice(2, 7), modes: [] });
  else if (split) table62.push({ group: group62, name: split[1].replace(/ — —$/, ''), values: ['—', '—', '—', '—', split[2]], modes: [] });
  else throw new Error(`6-2: cannot read "${l}"`);
  if (group62 && !/^(Animal|Large-animal|Necropsy|Small-animal)/.test(table62[table62.length - 1].name)) {
    table62[table62.length - 1].group = null; group62 = null;
  }
}

// Table E-1 (Normative Appendix E): outpatient health care.
const e1 = start(/^Table E-1\s+Minimum Ventilation Rates in Breathing Zone/);
const e1end = start(/^a\. The requirements of this table/, e1);
const kept2 = lines.slice();
for (let i = e1; i < e1end; i++) if (!/^Outpatient Health Care Facilities|\d\s*$/.test(lines[i].trim()) || /#\/100 m|m$/.test(lines[i].trim())) kept2[i] = '';
lines.splice(0, lines.length, ...kept2);
const tableE1 = breathing(e1, e1end, ['Outpatient Health Care Facilities']);
lines.splice(0, lines.length, ...saved);

// Cells the standard leaves blank (not "—"), so the text has one value fewer.
// Checked against the printed pages: Educational Facilities Libraries prints no
// air class, and Residential Common corridors no occupant density.
const BLANK = { 'Educational Facilities|Libraries': 5, 'Residential|Common corridors': 4 };
for (const r of table61) {
  const at = BLANK[`${r.group}|${r.name}`];
  if (at !== undefined && r.values.length === 6) r.values.splice(at, 0, '');
}

const doc = {
  source: 'ANSI/ASHRAE Standard 62.1-2025, Ventilation and Acceptable Indoor Air Quality (ASHRAE 62.1-2025.pdf), Tables 6-1 and 6-2 and Normative Appendix E Table E-1, read by tools/extract/pdftext.mjs and tools/extract/ashrae621-2025.mjs',
  columns61: ['Rp cfm/person', 'Rp L/s·person', 'Ra cfm/ft²', 'Ra L/s·m²', 'Default occupant density #/1000 ft² or #/100 m²', 'Air class', 'Maximum CO2 above ambient C6.1 (ppm)'],
  columns62: ['cfm/unit', 'cfm/ft²', 'L/s·unit', 'L/s·m²', 'Air class'],
  columnsE1: ['Rp cfm/person', 'Rp L/s·person', 'Ra cfm/ft²', 'Ra L/s·m²', 'Default occupant density', 'Air class'],
  table61, table62, tableE1,
};
fs.writeFileSync(out, JSON.stringify(doc, null, 1) + '\n');
console.log(`6-1: ${table61.length} rows, 6-2: ${table62.length} rows, E-1: ${tableE1.length} rows -> ${out}`);
for (const r of table61) if (r.values.length !== 7) console.log('  6-1 short row:', r.group, '|', r.name, r.values.join(' '));
for (const r of tableE1) if (r.values.length !== 6) console.log('  E-1 short row:', r.name, r.values.join(' '));
