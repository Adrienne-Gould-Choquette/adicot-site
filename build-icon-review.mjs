// Builds icon-review.html at the project root — a local file (not part of the
// site) for eyeballing the icon guesses. Open it directly in a browser.
import fs from 'node:fs';

const taxonomy = JSON.parse(fs.readFileSync('src/_data/taxonomy.json', 'utf8'));
const rows = [];
for (const g of taxonomy) {
  for (const it of g.items) {
    if (!it.icon) { rows.push({ ...it, group: g.name, missing: true }); continue; }
    rows.push({ ...it, group: g.name });
  }
}
const guesses = rows.filter(r => r.iconGuess);
const sure = rows.filter(r => r.icon && !r.iconGuess);
const none = rows.filter(r => r.missing);
const esc = s => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');

// paths in taxonomy are site-absolute (/images/..); on disk they are public/images/..
const card = r => `<li>
  ${r.icon ? `<img src="public${esc(r.icon)}" alt="">` : '<div class="noicon">?</div>'}
  <div>
    <strong>${esc(r.label)}</strong>
    <span>${esc(r.group)}</span>
    <em>${r.icon ? 'alt: &ldquo;' + esc(r.iconAlt) + '&rdquo;' : 'no icon assigned'}</em>
    <code>${esc(r.path)}</code>
  </div>
</li>`;

fs.writeFileSync('icon-review.html', `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"><title>Icon review</title><style>
:root{--bg:#fff;--fg:#16191d;--muted:#5d6874;--line:#e0e5ea;--accent:#0b5fbf;--warn:#a8570a;--warnbg:#fdf4e7}
@media(prefers-color-scheme:dark){:root{--bg:#121519;--fg:#e7ebef;--muted:#97a2ae;--line:#2a3038;--accent:#5ea8ff;--warn:#e2ab5e;--warnbg:#2b2317}
 img{filter:invert(1) brightness(1.6) contrast(.85)}}
*{box-sizing:border-box}
body{margin:0;padding:32px 20px 70px;background:var(--bg);color:var(--fg);font:15px/1.55 ui-sans-serif,system-ui,-apple-system,Segoe UI,sans-serif}
.wrap{max-width:1040px;margin:0 auto}
h1{font-size:25px;margin:0 0 4px}h2{font-size:17px;margin:34px 0 12px;padding-bottom:7px;border-bottom:1px solid var(--line)}
p.sub{color:var(--muted);margin:0 0 6px}
.note{background:var(--warnbg);border:1px solid color-mix(in srgb,var(--warn) 35%,transparent);border-radius:9px;padding:12px 15px;margin:18px 0 0}
ul{list-style:none;padding:0;margin:0;display:grid;grid-template-columns:repeat(auto-fill,minmax(290px,1fr));gap:10px}
li{display:flex;gap:13px;align-items:center;border:1px solid var(--line);border-radius:10px;padding:12px 14px}
li img{width:44px;height:44px;flex:0 0 44px;object-fit:contain}
.noicon{width:44px;height:44px;flex:0 0 44px;display:grid;place-items:center;border:1px dashed var(--line);border-radius:8px;color:var(--muted)}
li div{min-width:0}
li strong{display:block;font-size:15px}
li span{display:block;font-size:12px;color:var(--muted)}
li em{display:block;font-style:normal;font-size:12px;color:var(--muted);margin-top:3px}
li code{display:block;font:11.5px ui-monospace,Consolas,monospace;color:var(--muted);margin-top:2px;overflow:hidden;text-overflow:ellipsis}
</style></head><body><div class="wrap">
<h1>Calculator icon review</h1>
<p class="sub">Icons recovered from the old Wix index and matched on their alt text.</p>
<div class="note"><b>Only the first section needs your eye.</b> To change one, edit <code>icon</code> and
<code>iconAlt</code> for that entry in <code>src/_data/taxonomy.json</code>, then drop the
<code>iconGuess</code> flag. Every icon in <code>public/images/</code> is available.</div>

<h2>Uncertain &mdash; please check (${guesses.length})</h2>
<ul>${guesses.map(card).join('')}</ul>

<h2>No icon assigned (${none.length})</h2>
<ul>${none.map(card).join('')}</ul>

<h2>Confident (${sure.length})</h2>
<ul>${sure.map(card).join('')}</ul>
</div></body></html>
`);
console.log('icon-review.html —', guesses.length, 'to check,', none.length, 'unassigned,', sure.length, 'confident');
