// Finds British spellings in the files we author. Extracted Wix content
// (src/pages, src/posts) is the owner's own writing and is reported separately.
import fs from 'node:fs';
import path from 'node:path';

const PAIRS = [
  ['favourite', 'favorite'], ['colour', 'color'], ['behaviour', 'behavior'],
  ['honour', 'honor'], ['labour', 'labor'], ['neighbour', 'neighbor'],
  ['specialis', 'specializ'], ['organis', 'organiz'], ['recognis', 'recogniz'],
  ['prioritis', 'prioritiz'], ['optimis', 'optimiz'], ['customis', 'customiz'],
  ['standardis', 'standardiz'], ['analys', 'analyz'], ['emphasis(e|ing)', 'emphasiz'],
  ['centre', 'center'], ['metre', 'meter'], ['litre', 'liter'],
  ['licence', 'license'], ['defence', 'defense'], ['offence', 'offense'],
  ['modelling', 'modeling'], ['modelled', 'modeled'], ['labelled', 'labeled'],
  ['cancelled', 'canceled'], ['travelling', 'traveling'], ['signalling', 'signaling'],
  ['catalogue', 'catalog'], ['judgement', 'judgment'], ['ageing', 'aging'],
  ['whilst', 'while'], ['amongst', 'among'], ['programme', 'program'],
  ['enquir', 'inquir'], ['practise', 'practice'], ['grey', 'gray'],
  ['fulfil\\b', 'fulfill'], ['instal\\b', 'install'], ['storey', 'story'],
];

const OURS = ['src/_data', 'src/_includes', 'src/services', 'src/assets/js',
  'src/assets/css', 'src/calculators.njk', 'src/blog.njk', 'src/categories.njk',
  'src/404.njk', 'src/feed.njk', 'README.md'];
const THEIRS = ['src/pages', 'src/posts'];

function walk(p, acc) {
  if (!fs.existsSync(p)) return acc;
  const st = fs.statSync(p);
  if (st.isFile()) { acc.push(p); return acc; }
  for (const e of fs.readdirSync(p)) walk(path.join(p, e), acc);
  return acc;
}

function scan(roots) {
  const hits = [];
  for (const r of roots) {
    for (const f of walk(r, [])) {
      if (/\.(png|jpg|jpeg|gif|webp|svg|ico|woff2?|ttf)$/i.test(f)) continue;
      const text = fs.readFileSync(f, 'utf8');
      text.split('\n').forEach((line, i) => {
        for (const [bad, good] of PAIRS) {
          const re = new RegExp(bad, 'gi');
          if (re.test(line)) hits.push({ f, n: i + 1, bad, good, line: line.trim().slice(0, 96) });
        }
      });
    }
  }
  return hits;
}

const ours = scan(OURS);
const theirs = scan(THEIRS);

console.log('=== files we author: ' + ours.length + ' hits ===');
const byFile = {};
ours.forEach(h => (byFile[h.f] = byFile[h.f] || []).push(h));
for (const [f, hs] of Object.entries(byFile)) {
  console.log('\n' + f + '  (' + hs.length + ')');
  hs.slice(0, 8).forEach(h => console.log('  ' + String(h.n).padStart(4) + '  ' + h.bad + ' -> ' + h.good + '   ' + h.line));
  if (hs.length > 8) console.log('   ... +' + (hs.length - 8) + ' more');
}

console.log('\n\n=== extracted Wix content (the owner’s own writing, NOT changed) ===');
const tByFile = {};
theirs.forEach(h => (tByFile[h.f] = tByFile[h.f] || []).push(h));
for (const [f, hs] of Object.entries(tByFile)) {
  console.log('  ' + f.replace(/\\/g, '/') + ': ' + [...new Set(hs.map(h => h.bad))].join(', '));
}
if (!theirs.length) console.log('  none');
