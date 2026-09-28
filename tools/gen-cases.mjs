// Regenerate a calculator's answer key from its workbook.
//
//   node tools/gen-cases.mjs temperature-converter
//
// Reads calc-cases/<slug>.spec.mjs, runs every case through the workbook in
// Excel (via gen-cases.ps1, Windows only), and writes calc-cases/<slug>.csv.
// Commit the CSV: it is the answer key check-calculators.mjs holds the page to.
// Never edit it by hand; its only value is that the workbook wrote it.
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const slug = process.argv[2];
if (!slug) { console.error('usage: node tools/gen-cases.mjs <slug>'); process.exit(2); }

const spec = (await import(pathToFileURL(path.join(root, 'calc-cases', `${slug}.spec.mjs`)))).default;
const job = path.join(os.tmpdir(), `gen-cases-${slug}.json`);
fs.writeFileSync(job, JSON.stringify({
  workbook: spec.workbook, sheet: spec.sheet, inputs: spec.inputs, outputs: spec.outputs,
  cases: spec.cases, out: path.join(root, 'calc-cases', `${slug}.csv`),
}));
execFileSync('powershell.exe',
  ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', path.join(root, 'tools', 'gen-cases.ps1'), '-Job', job],
  { stdio: 'inherit' });
fs.rmSync(job);
