// Builds the "related calculators" list for every calculator page, once, at
// build time. Layered so the strongest signal always wins:
//
//   1. Curated pairs (related.json) — recovered from the hand-picked strips on
//      the old site. Editorial judgement about engineering workflow that no
//      similarity measure reproduces. Kept in their original order.
//   2. Shared taxonomy categories, weighted INVERSELY by category size. Sharing
//      "Electrical" (2 members) is real evidence; sharing "Equipment" (10) is
//      weak. Without this the category signal is close to arbitrary.
//   3. Term overlap with IDF weighting. Catches pairs the categories miss —
//      duct sizing and temperature loss share friction, velocity, roughness.
//      IDF is essential: every page says "calculator" and "ASHRAE", so raw
//      overlap would rank on boilerplate.
//   4. A small nudge toward favourites, to break ties usefully.
//
// A page can override the whole thing with `related:` in its front matter.
import fs from 'node:fs';
import path from 'node:path';

const LIMIT = 6;
const W_CATEGORY = 30;   // divided by category size
const W_TERMS = 26;      // scales the normalised IDF overlap
const W_FAV = 2;

const STOP = new Set(('the and for are with that this from you your can will has have not but its ' +
  'all any out use used using when what which where how why into than then they them their there ' +
  'these those been being was were also more most other such some only very each per based upon ' +
  'over under between about after before during while would could should must may might does did ' +
  'here who whom our ours both same own too just now new get got make made take given calculator ' +
  'calculators calculate calculated calculation online free users user enter click button results ' +
  'result value values input inputs select adicot').split(' '));

function terms(body) {
  const set = new Set();
  for (const raw of body.toLowerCase().split(/[^a-z0-9µ°²³/.+-]+/)) {
    const w = raw.replace(/^[.+-]+|[.+-]+$/g, '');
    if (w.length < 4 || w.length > 28 || STOP.has(w) || /^\d+(\.\d+)?$/.test(w)) continue;
    set.add(w);
  }
  return set;
}

export default function () {
  const taxonomy = JSON.parse(fs.readFileSync('src/_data/taxonomy.json', 'utf8'));
  const curated = JSON.parse(fs.readFileSync('src/_data/related.json', 'utf8'));

  // path -> item, plus the categories it belongs to
  const items = new Map();
  const cats = [];
  for (const g of taxonomy) {
    const members = g.items.map(i => i.path);
    cats.push({ name: g.name, members });
    for (const i of g.items) {
      if (!items.has(i.path)) items.set(i.path, { ...i, cats: [] });
      items.get(i.path).cats.push(g.name);
    }
  }
  const catSize = Object.fromEntries(cats.map(c => [c.name, new Set(c.members).size]));

  // term sets, from the page sources
  const bodies = new Map();
  for (const f of fs.readdirSync('src/pages')) {
    if (!f.endsWith('.md')) continue;
    const raw = fs.readFileSync(path.join('src/pages', f), 'utf8');
    const m = raw.match(/^---\n[\s\S]*?\n---\n?/);
    const front = m ? m[0] : '';
    const link = (front.match(/^permalink:\s*(.*)$/m) || [])[1];
    if (!link) continue;
    const url = link.replace(/index\.html$/, '').replace(/\.html$/, '') || '/';
    if (!items.has(url)) continue;
    bodies.set(url, terms(raw.slice(front.length)));
  }

  // document frequency, for IDF
  const df = new Map();
  for (const set of bodies.values()) for (const t of set) df.set(t, (df.get(t) || 0) + 1);
  const N = bodies.size || 1;
  const idf = t => Math.log(N / (df.get(t) || N));

  function termScore(a, b) {
    const A = bodies.get(a), B = bodies.get(b);
    if (!A || !B || !A.size || !B.size) return 0;
    let shared = 0;
    for (const t of A) if (B.has(t)) shared += idf(t);
    return shared / Math.sqrt(A.size * B.size);
  }

  const out = {};
  for (const [self, item] of items) {
    const picks = (curated[self] || []).filter(p => items.has(p) && p !== self);

    if (picks.length < LIMIT) {
      const scored = [];
      for (const [other, o] of items) {
        if (other === self || picks.includes(other)) continue;
        let s = 0;
        for (const c of item.cats) if (o.cats.includes(c)) s += W_CATEGORY / (catSize[c] || 1);
        s += W_TERMS * termScore(self, other);
        if (o.fav) s += W_FAV;
        if (s > 0) scored.push([other, s]);
      }
      scored.sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
      for (const [p] of scored) {
        if (picks.length >= LIMIT) break;
        picks.push(p);
      }
    }

    out[self] = picks.slice(0, LIMIT).map(p => {
      const i = items.get(p);
      return { path: p, label: i.label, icon: i.icon || null, curated: (curated[self] || []).includes(p) };
    });
  }
  return out;
}
