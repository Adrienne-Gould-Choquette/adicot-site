// Do the hand-written calculators still agree with their workbooks?
//
// Each calculator has a spec in calc-cases/<slug>.spec.mjs and an answer key in
// calc-cases/<slug>.csv, which tools/gen-cases.mjs wrote by running the spec's
// cases through the workbook in Excel. This runs the same cases through the
// page's own module and compares every output. It also checks that the page
// refuses the inputs it should.
//
// Excel and JavaScript both compute in IEEE-754 doubles, but Excel rounds some
// results to 15 significant digits, so agreement is judged at 1e-12 relative.
// Anything looser than that is the port drifting, not arithmetic noise.
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const DIR = 'calc-cases';
const REL = 1e-12;

export async function checkCalculators() {
  const lines = [], issues = [];
  let checks = 0;
  const specs = fs.existsSync(DIR) ? fs.readdirSync(DIR).filter(f => f.endsWith('.spec.mjs')).sort() : [];
  for (const file of specs) {
    const slug = file.replace('.spec.mjs', '');
    const spec = (await import(pathToFileURL(path.resolve(DIR, file)))).default;
    const csv = path.join(DIR, `${slug}.csv`);
    if (!fs.existsSync(csv)) { issues.push(`${slug}: no answer key; run node tools/gen-cases.mjs ${slug}`); continue; }
    // An input and an output with the same name share one CSV column, and the
    // output then overwrites the input the port is given.
    const clash = Object.keys(spec.inputs).filter(k => k in spec.outputs);
    if (clash.length) issues.push(`${slug}: ${clash.join(', ')} named as both an input and an output`);
    const rows = parseCsv(fs.readFileSync(csv, 'utf8'));
    // An answer key with no cases proves nothing; it means generation failed.
    if (rows.length < spec.cases.length) {
      issues.push(`${slug}: answer key has ${rows.length} of ${spec.cases.length} cases; regenerate it`);
    }
    let worst = 0, bad = 0;
    for (const row of rows) {
      const got = spec.run(row);
      for (const k of Object.keys(spec.outputs)) {
        checks++;
        // Text outputs (a label, or a value the workbook concatenates into a
        // sentence) must match exactly.
        if (row[k] !== '' && Number.isNaN(Number(row[k]))) {
          if (String(got[k]) !== row[k]) {
            bad++;
            if (bad <= 5) issues.push(`${slug}: ${JSON.stringify(row)} ${k} = "${got[k]}", workbook "${row[k]}"`);
          }
          continue;
        }
        const want = Number(row[k]), have = got[k];
        const err = Math.abs(have - want) / Math.max(1, Math.abs(want));
        if (!(err <= REL)) {
          bad++;
          if (bad <= 5) issues.push(`${slug}: ${JSON.stringify(row)} ${k} = ${have}, workbook ${want}`);
        }
        if (Number.isFinite(err)) worst = Math.max(worst, err);
      }
    }
    let refused = 0;
    for (const r of spec.refuse ?? []) {
      checks++;
      if (spec.check(r)) refused++;
      else issues.push(`${slug}: should refuse ${JSON.stringify(r.args)} with "${r.says}"`);
    }
    lines.push(`  ${slug}: ${rows.length} workbook cases ${bad ? `${bad} WRONG` : 'all match'}, `
      + `worst ${worst.toExponential(1)} relative; refuses ${refused}/${(spec.refuse ?? []).length} bad inputs`);
  }
  if (!specs.length) lines.push('  no calculators yet');

  // Each page script must start its calculator on its last line. Started any
  // earlier, it runs before the declarations below it exist and the page throws
  // on load (a ReferenceError the build cannot otherwise see; it happened twice).
  const JS = 'src/assets/js';
  const pageScripts = fs.readdirSync(JS).filter(f => /^calc-.+\.js$/.test(f) && f !== 'calc-kit.js');
  for (const f of pageScripts) {
    checks++;
    const last = fs.readFileSync(path.join(JS, f), 'utf8').trim().split(/\r?\n/).pop();
    if (last !== 'if (form) init(form);') issues.push(`${f}: must end with "if (form) init(form);"`);
  }
  lines.push(`  ${pageScripts.length} page scripts start their calculator last`);
  return { lines, issues, checks };
}

// A quoted field may hold commas, doubled quotes and line breaks (a workbook
// message that wraps onto a second line), so this reads the whole text rather
// than splitting it into lines first.
function parseCsv(text) {
  const [head, ...rows] = splitRows(text.replace(/^﻿/, '').trim());
  return rows.map(cells => Object.fromEntries(head.map((h, i) => [h, cells[i]])));
}
function splitRows(text) {
  const rows = []; let cells = [], cur = '', quoted = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"' && text[i + 1] === '"') { cur += '"'; i++; }
      else if (ch === '"') quoted = false;
      else cur += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ',') { cells.push(cur); cur = ''; }
    else if (ch === '\r' || ch === '\n') {
      if (ch === '\r' && text[i + 1] === '\n') i++;
      cells.push(cur); rows.push(cells); cells = []; cur = '';
    } else cur += ch;
  }
  cells.push(cur); rows.push(cells);
  return rows;
}

if (process.argv[1]?.endsWith('check-calculators.mjs')) {
  const { lines, issues, checks } = await checkCalculators();
  console.log('=== hand-written calculators vs workbooks ===');
  lines.forEach(l => console.log(l));
  console.log(`  ${checks} comparisons`);
  issues.slice(0, 20).forEach(i => console.log('  FAILED: ' + i));
  process.exit(issues.length ? 1 : 0);
}
