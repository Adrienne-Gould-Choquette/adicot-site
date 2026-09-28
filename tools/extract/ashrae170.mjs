// Parse ANSI/ASHRAE/ASHE Standard 170-2021 Table 7-1 (design parameters,
// inpatient spaces) from the text that tools/extract/pdftext.mjs pulls out of the
// standard's PDF:
//
//   node tools/extract/pdftext.mjs "…/170-2021.pdf" 170.txt
//   node tools/extract/ashrae170.mjs 170.txt table-7-1.json
//
// Rows wrap unpredictably, so the table is flattened to one string and each row
// is matched on its nine value columns, with the text before them as its name.
// Anything the pattern cannot account for stops the parse and is reported, so a
// row is never silently merged into its neighbour.
import fs from 'node:fs';

const lines = fs.readFileSync(process.argv[2], 'utf8').split('\n');
const start = lines.findIndex(l => l.startsWith('Table 7-1 Design Parameters'));
const end = lines.findIndex((l, i) => i > start && /^Normative Notes for Table 7-1/.test(l));
const DROP = /^(Table 7-1 Design|\(Continued\)|Function of Space|Pressure Relationship|Minimum Outdoor|Minimum {2}Total|All Room Air|Air {2}Recirculated|Unoccupied {2}Turndown|Minimum Filter|Design {2}Relative|Design {2}Temperature|Informative Notes|\(1\) NR = no|shown in parentheses|=== page end|ANSI\/ASHRAE\/ASHE Standard 170-2021|\d+ ANSI\/ASHRAE)/;

// Headings are the lines in capitals; mark them so they never join a row's name.
let flat = lines.slice(start, end).map(l => l.trim()).filter(l => l && !DROP.test(l))
  .map(l => (/^[A-Z][A-Z &,:/-]{8,}$/.test(l) ? `⟦${l}⟧` : l)).join('\n');
// Words and values the PDF broke across lines.
flat = flat
  .replace(/\bYe\s*\n\s*s\b/g, 'Yes').replace(/\bPo\s*\n\s*sitive\b/g, 'Positive').replace(/\bHE\s*\n\s*PA\b/g, 'HEPA')
  .replace(/\bM\s*\n?\s*E\s*R\s*\n?\s*V-/g, 'MERV-').replace(/\bMER\s*\n\s*V-/g, 'MERV-')
  .replace(/(\d+)\s*\n\s*([–-]\d)/g, '$1$2')
  .replace(/\s+/g, ' ');

const NOTE = String.raw`(?:\s*\([a-z]{1,2}\)(?:,\s*\([a-z]{1,2}\))*)?`;
const YN = String.raw`(Yes|No|NR|N\/R)`;
const ROW = new RegExp(String.raw`(.+?)\s(Positive|Negative|NR|N\/R|\(e\))${NOTE}\s(NR|\d+)${NOTE}\s(\d+|NR)${NOTE}`
  + String.raw`\s${YN}${NOTE}\s${YN}${NOTE}\s${YN}${NOTE}\s(MERV-\d+|HEPA|NR)${NOTE}`
  + String.raw`\s(NR|Max \d+|Min \d+|\d+[–-]\d+)${NOTE}\s(NR|\d+[–-]\d+\/\d+[–-]\d+|(?:Max|Min) \d+\/\d+)${NOTE}(?=\s|$)`, 'y');

const rows = [];
let pos = 0, heading = '', stopped = null;
while (pos < flat.length) {
  ROW.lastIndex = pos;
  const m = ROW.exec(flat);
  if (!m) { stopped = flat.slice(pos, pos + 300); break; }
  let name = m[1].trim();
  const h = name.match(/^(?:⟦[^⟧]*⟧\s*(?:\([a-z]\)\s*)?)+/);
  if (h) { heading = [...h[0].matchAll(/⟦([^⟧]*)⟧/g)].pop()[1]; name = name.slice(h[0].length).trim(); }
  if (name.includes('⟦')) { stopped = `heading inside a row name: ${name}`; break; }
  const values = m[0].slice(m[1].length).trim();
  rows.push({ heading, name, values });
  pos += m[0].length;
  while (flat[pos] === ' ') pos++;
}
fs.writeFileSync(process.argv[3], JSON.stringify({ rows, stopped }, null, 1));
console.log(`${rows.length} rows; ${stopped ? 'stopped at: ' + stopped : 'all parsed'}`);
