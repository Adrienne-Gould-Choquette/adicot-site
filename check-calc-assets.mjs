// Do the SpreadsheetConverter bundles reference anything still hosted off-site?
// If they pull images from Wix, those break the day Wix is cancelled — and
// verify-urls.mjs deliberately skips this directory as vendor code.
import fs from 'node:fs';
import path from 'node:path';

const hits = new Map();
const EXTERNAL = /wixstatic|adicot\.com|filesusr|parastorage|spreadsheethosting/i;

function walk(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) { walk(p); continue; }
    if (!/\.(htm|html|js|css|appcache)$/i.test(e.name)) continue;
    const text = fs.readFileSync(p, 'utf8');
    for (const m of text.matchAll(/https?:\/\/[^"')\s>\\]+/g)) {
      if (!EXTERNAL.test(m[0])) continue;
      const key = p.split(path.sep).join('/').replace('public/calculators/', '');
      if (!hits.has(key)) hits.set(key, new Set());
      hits.get(key).add(m[0]);
    }
  }
}
walk('public/calculators');

console.log('calculator files referencing an external host:', hits.size, '\n');
let images = 0;
for (const [f, urls] of hits) {
  console.log(f);
  for (const u of urls) {
    if (/\.(jpe?g|png|gif|webp|svg)/i.test(u)) images++;
    console.log('   ' + u.slice(0, 120));
  }
}
console.log('\nimage references among them:', images);
