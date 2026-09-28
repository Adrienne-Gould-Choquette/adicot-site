// Parse the AirGuide catalog transcriptions in calc-cases/sources (airguide-*.txt)
// into { vel, pressure: { kind, values }, sizes: [{ area, labels, rows: { CFM,
// NC, 4W... } }] }. Shared by build-airguide.mjs and check-airguide.mjs.
import fs from 'node:fs';

const cell = v => (v === '.' ? null : v === '-' ? '—' : /^-?\d+(\.\d+)?$/.test(v) ? Number(v) : v);

export function parseAirguide(file) {
  const out = { vel: null, pressure: null, header: {}, sizes: [] };
  let size = null;
  for (const raw of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || (line.startsWith('#') && !line.startsWith('##'))) continue;
    const head = /^##\s+([\d.]+)\s*\|\s*(.+)$/.exec(line);
    if (head) { size = { area: Number(head[1]), labels: head[2].split(',').map(s => s.trim()), rows: {} }; out.sizes.push(size); continue; }
    const [key, ...vals] = line.split(/\s+/);
    if (key === 'VEL') out.vel = vals.map(Number);
    else if (!size) { out.header[key] = vals.map(Number); out.pressure ??= { kind: key, values: vals.map(Number) }; }
    else if (key === 'AK') size.ak = vals.length === 1 ? Number(vals[0]) : vals.map(Number);
    else size.rows[key] = vals.map(cell);
  }
  for (const s of out.sizes) for (const [k, v] of Object.entries(s.rows)) {
    if (v.length !== out.vel.length) throw new Error(`${file} ${s.labels[0]} ${k}: ${v.length} values, expected ${out.vel.length}`);
  }
  return out;
}
