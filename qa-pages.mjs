// Page-by-page QA. Flags leftovers from the Wix export so a human review can go
// worst-first instead of reading all 59 pages blind.
// Writes qa-review.html (gitignored) and prints a ranked summary.
import fs from 'node:fs';
import path from 'node:path';

const SRC = 'src';
const taxonomy = JSON.parse(fs.readFileSync(SRC + '/_data/taxonomy.json', 'utf8'));
const names = new Set(taxonomy.flatMap(g => g.items.map(i => i.label.toLowerCase())));

const files = [];
for (const dir of ['pages', 'posts']) {
  for (const f of fs.readdirSync(path.join(SRC, dir))) {
    if (f.endsWith('.md')) files.push({ dir, f, p: path.join(SRC, dir, f) });
  }
}

// Phrases that only made sense inside the Wix page: anchors to widgets that no
// longer exist, form remnants, widget chrome.
const ORPHANS = [
  [/click here to jump/i, 'anchor to a Wix widget ("Click here to jump…")'],
  [/^jump to /im, 'orphan "Jump to…" link'],
  [/top of page|bottom of page/i, 'Wix page chrome'],
  [/^see all$/im, 'widget label "See All"'],
  [/^all posts$/im, 'widget label "All Posts"'],
  [/thanks for submitting/i, 'form confirmation text with no form'],
  [/^submit$/im, 'orphan Submit button text'],
  [/writer:|min read|views$/im, 'Wix blog byline residue'],
];

const report = [];
for (const { dir, f, p } of files) {
  const raw = fs.readFileSync(p, 'utf8');
  const fm = raw.match(/^---\n([\s\S]*?)\n---\n?/);
  const body = raw.slice(fm ? fm[0].length : 0);
  const title = (raw.match(/^title:\s*"?(.*?)"?$/m) || [, ''])[1];
  const permalink = (raw.match(/^permalink:\s*(.*)$/m) || [, ''])[1];
  const url = permalink.replace(/index\.html$/, '').replace(/\.html$/, '') || '/';
  const lines = body.split('\n').map(l => l.trim());
  const words = body.split(/\s+/).filter(Boolean).length;

  const flags = [];
  for (const [re, msg] of ORPHANS) if (re.test(body)) flags.push(msg);
  const bare = lines.filter(l => l && names.has(l.toLowerCase()));
  if (bare.length) flags.push('bare calculator name' + (bare.length > 1 ? 's' : '') + ': ' + bare.slice(0, 4).join(', '));
  if (/\*\*NEW\*\*/.test(body)) flags.push('leftover **NEW** badge');
  if (/!\[[^\]]*\bicon\b/i.test(body)) flags.push('navigation icon image');
  if (/^tags:$/im.test(body)) flags.push('Wix tag list');
  const dup = lines.find(l => l && title && l.toLowerCase() === title.toLowerCase());
  if (dup) flags.push('title repeated in body');
  if (words < 40) flags.push('very thin (' + words + ' words)');
  if (/\|\s*\|/.test(body)) flags.push('empty table cells');

  report.push({ dir, f, title, url, words, flags, body });
}

report.sort((a, b) => b.flags.length - a.flags.length || a.url.localeCompare(b.url));

const clean = report.filter(r => !r.flags.length).length;
console.log('pages: ' + report.length + '  |  clean: ' + clean + '  |  flagged: ' + (report.length - clean) + '\n');
for (const r of report) {
  if (!r.flags.length) continue;
  console.log(r.url.padEnd(46) + String(r.words).padStart(5) + 'w');
  r.flags.forEach(x => console.log('      - ' + x));
}

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const html = `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><title>Page QA</title><style>
body{margin:0;padding:28px 18px 70px;background:#fff;color:#16191d;font:15px/1.55 ui-sans-serif,system-ui,Segoe UI,sans-serif}
.wrap{max-width:900px;margin:0 auto}h1{font-size:24px;margin:0 0 6px}
.sum{color:#5d6874;margin:0 0 22px}
details{border:1px solid #e0e5ea;border-radius:9px;margin:0 0 9px;padding:0}
details[open]{background:#fcfcfd}
summary{cursor:pointer;padding:11px 14px;display:flex;gap:10px;align-items:baseline;flex-wrap:wrap}
summary code{font:12.5px ui-monospace,Consolas,monospace}
.n{margin-left:auto;color:#5d6874;font-size:12.5px}
.flag{display:inline-block;background:#fef4ea;color:#a8500a;border:1px solid #f0d6bb;border-radius:999px;padding:1px 9px;font-size:12px;margin:2px 3px 0 0}
.ok{background:#eef7ee;color:#2b6b34;border-color:#cfe6d2}
pre{margin:0;padding:12px 16px 18px;white-space:pre-wrap;font:12.5px/1.5 ui-monospace,Consolas,monospace;color:#2b3138;border-top:1px solid #e0e5ea}
a.live{font-size:12.5px}
</style></head><body><div class="wrap">
<h1>Page QA</h1>
<p class="sum">${report.length} pages — ${clean} clean, ${report.length - clean} flagged. Flagged first. Open one to read its body.</p>
${report.map(r => `<details${r.flags.length ? ' open' : ''}>
<summary><code>${esc(r.url)}</code> <a class="live" href="http://localhost:8088${esc(r.url)}" target="_blank">open</a>
<span class="n">${r.words}w</span><br>
${r.flags.length ? r.flags.map(x => `<span class="flag">${esc(x)}</span>`).join('') : '<span class="flag ok">no flags</span>'}</summary>
<pre>${esc(r.body.trim())}</pre></details>`).join('\n')}
</div></body></html>`;
fs.writeFileSync('qa-review.html', html);
console.log('\nqa-review.html written');
