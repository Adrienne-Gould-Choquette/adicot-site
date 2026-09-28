// Builds the client-side search index from the Markdown sources.
//
// Read from disk rather than from Eleventy collections so the index never
// depends on template render order, and so body text is available without
// relying on `templateContent`.
import fs from 'node:fs';
import path from 'node:path';

// Body text is indexed as a deduplicated term list, not a prose prefix. A prefix
// misses anything further down the page — "Huebscher" and "Colebrook" sit deep in
// the duct-sizing methodology — while unique terms give full-page recall for
// roughly the same payload.
const MAX_TERMS = 320;
const STOP = new Set(('the and for are with that this from you your can will has have not but its it\'s ' +
  'all any out use used using when what which where how why into than then they them their there these those ' +
  'been being was were also more most other such some only very each per based upon over under between ' +
  'about after before during while would could should must may might shall does did done here who whom ' +
  'our ours both same own too just now new get got make made take taken give given').split(' '));

function terms(body) {
  const seen = new Set();
  for (const raw of body.toLowerCase().split(/[^a-z0-9µ°²³/.+-]+/)) {
    const w = raw.replace(/^[.+-]+|[.+-]+$/g, '');
    if (w.length < 4 || w.length > 28) continue;
    if (STOP.has(w)) continue;
    if (/^\d+(\.\d+)?$/.test(w)) continue;      // bare numbers are noise
    seen.add(w);
    if (seen.size >= MAX_TERMS) break;
  }
  return Array.from(seen).join(' ');
}

function parse(file) {
  const raw = fs.readFileSync(file, 'utf8');
  const m = raw.match(/^---\n([\s\S]*?)\n---\n?/);
  const front = {};
  if (m) {
    for (const line of m[1].split('\n')) {
      const kv = line.match(/^([A-Za-z]+):\s*(.*)$/);
      if (!kv) continue;
      let v = kv[2].trim();
      if (/^".*"$/.test(v)) { try { v = JSON.parse(v); } catch { v = v.slice(1, -1); } }
      front[kv[1]] = v;
    }
  }
  const body = raw.slice(m ? m[0].length : 0)
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')      // images
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')    // links -> their text
    .replace(/[#>*_`|-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return { front, body };
}

export default function () {
  const taxonomy = JSON.parse(fs.readFileSync('src/_data/taxonomy.json', 'utf8'));

  // short label + category for anything on the calculator index
  const meta = new Map();
  for (const g of taxonomy) {
    for (const it of g.items) {
      const e = meta.get(it.path) || { labels: [], cats: [] };
      if (!e.labels.includes(it.label)) e.labels.push(it.label);
      if (!e.cats.includes(g.name)) e.cats.push(g.name);
      meta.set(it.path, e);
    }
  }

  // Leftover scratch pages from the Wix site. They stay live so no URL 404s,
  // but they should not surface in search. Delete the pages to drop them entirely.
  const HIDDEN = new Set(['/junk']);

  const entries = [];
  for (const [dir, kind] of [['src/pages', 'page'], ['src/posts', 'post']]) {
    for (const f of fs.readdirSync(dir).filter(n => n.endsWith('.md'))) {
      const { front, body } = parse(path.join(dir, f));
      if (!front.permalink) continue;
      const url = front.permalink.replace(/index\.html$/, '').replace(/\.html$/, '') || '/';
      if (HIDDEN.has(url)) continue;
      const m = meta.get(url) || { labels: [], cats: [] };
      entries.push({
        u: url,
        // the home page's own title is just the domain, which reads as noise here
        t: url === '/' ? 'Home' : (front.title || ''),
        l: m.labels.filter(x => x !== front.title),
        c: m.cats,
        d: front.description || '',
        k: kind === 'post' ? 'Blog' : (m.cats[0] || ''),
        b: terms(body),
        // an embedded bundle or a hand-written one: either way the page holds a calculator
        f: !!(front.calculator || front.calcInclude),
      });
    }
  }

  // the two index pages, so "blog" and "calculators" are findable
  entries.push({ u: '/calculators', t: 'All Engineering Calculators', l: [], c: [], d: 'Every calculator, grouped by category.', k: '', b: taxonomy.flatMap(g => [g.name, ...g.items.map(i => i.label)]).join(' '), f: false });
  entries.push({ u: '/blog', t: 'Blog', l: [], c: [], d: 'Calculator walkthroughs and HVAC engineering notes.', k: 'Blog', b: '', f: false });

  entries.sort((a, b) => a.t.localeCompare(b.t));
  return entries;
}
