// Confirms every URL the live Wix site serves also exists in _site,
// and that nothing links to a page that does not exist.
import fs from 'node:fs';
import path from 'node:path';
import { checkDuctulator } from './check-ductulator.mjs';
import { checkCalculators } from './check-calculators.mjs';
import { checkVentilationTables } from './check-ventilation-tables.mjs';
import { checkCltdHourly } from './check-cltd-hourly.mjs';
import { checkAirguide } from './check-airguide.mjs';
import { checkHandworked } from './check-handworked.mjs';
import { checkSeo } from './check-seo.mjs';

const SITE = '_site';
// The 71 URLs the Wix site published (its sitemap), each of which must keep
// resolving after the move; captured from the Wix export into the repo.
const inv = fs.readFileSync('deploy/wix-url-inventory.csv', 'utf8')
  .split('\n').slice(1).filter(Boolean)
  .map(l => l.split(',')[0].replace(/^"|"$/g, ''));

// A host serving this folder resolves /foo from foo.html or foo/index.html.
const exists = p => {
  const clean = p.replace(/^\//, '').replace(/\/$/, '');
  if (clean === '') return fs.existsSync(path.join(SITE, 'index.html'));
  return fs.existsSync(path.join(SITE, clean + '.html')) ||
         fs.existsSync(path.join(SITE, clean, 'index.html')) ||
         fs.existsSync(path.join(SITE, clean));
};

// Pages deliberately taken down. They were in the Wix sitemap, so each has a 301
// in deploy/*/_redirects rather than being left to 404. Listed here so the
// inventory check reports them as retired instead of missing.
const RETIRED = new Set([
  '/junk',
  // The other Wix scratch page, holding an old copy of the mixed air calculator.
  // Retired Sep 2026; 301 to /air-mixing-calculator in the deploy configs.
  '/images',
  // Florida work-order and energy-compliance forms, for services no longer
  // offered. Removed Sep 2026; 301s live in the deploy configs.
  '/work-order-commercial',
  '/work-order-residential',
  '/energy-calculation-commercial',
  '/energy-calculation-residential',
]);

const retired = inv.filter(p => RETIRED.has(p));
const missing = inv.filter(p => !exists(p) && !RETIRED.has(p));
console.log('=== original URLs ===');
console.log('  in inventory:', inv.length, '| resolving in _site:', inv.length - missing.length - retired.length, '| retired with a 301:', retired.length);
retired.forEach(p => console.log('    RETIRED (301 in deploy configs): ' + p));
if (missing.length) { console.log('  MISSING:'); missing.forEach(p => console.log('    ' + p)); }

// ---- internal link check ----
const htmlFiles = [];
(function walk(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const f = path.join(d, e.name);
    if (e.isDirectory()) walk(f);
    else if (e.name.endsWith('.html')) htmlFiles.push(f);
  }
})(SITE);

// Targets that are deliberately not built yet: site.quoteUrl, if it points at a
// local page that does not exist, is reported separately rather than failing
// the gate. Once the page is built it is checked like any other link.
const site = JSON.parse(fs.readFileSync('src/_data/site.json', 'utf8'));
const PENDING = new Set([site.quoteUrl].filter(u => u && u.startsWith('/') && !exists(u)));

const pending = new Map();
const broken = new Map();
for (const f of htmlFiles) {
  if (f.includes(path.join(SITE, 'calculators'))) continue;   // vendor bundles
  const html = fs.readFileSync(f, 'utf8');
  for (const m of html.matchAll(/(?:href|src)="(\/[^"#?]*)"/g)) {
    const target = m[1];
    if (/\.(css|js|png|jpe?g|gif|webp|svg|xml|txt|ico|htm|html|woff2?|ttf|appcache)$/i.test(target)) {
      if (!fs.existsSync(path.join(SITE, target.replace(/^\//, '')))) {
        broken.set(target, (broken.get(target) || 0) + 1);
      }
    } else if (PENDING.has(target)) {
      pending.set(target, (pending.get(target) || 0) + 1);
    } else if (!exists(target)) {
      broken.set(target, (broken.get(target) || 0) + 1);
    }
  }
}
console.log('\n=== internal links ===');
console.log('  html files scanned:', htmlFiles.length, '| broken targets:', broken.size);
[...pending.entries()].forEach(([t, n]) => console.log('    PENDING (placeholder in site.json): ' + t + '   (' + n + ' refs)'));
[...broken.entries()].sort((a, b) => b[1] - a[1]).slice(0, 20)
  .forEach(([t, n]) => console.log('    ' + t + '   (' + n + ' refs)'));

// ---- calculator bundles pointing off-site ----
// The bundles are vendor code and are skipped by the link check above, which is
// exactly how 16 Wix-hosted images survived unnoticed inside four calculators.
// Links back to adicot.com are fine; anything else on a third-party host is not.
const calcExternal = new Map();
(function walkCalc(d) {
  if (!fs.existsSync(d)) return;
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const f = path.join(d, e.name);
    if (e.isDirectory()) { walkCalc(f); continue; }
    if (!/\.(htm|html|js|css)$/i.test(e.name)) continue;
    for (const m of fs.readFileSync(f, 'utf8').matchAll(/https?:\/\/[^"')\s>\\]+/g)) {
      if (!/wixstatic|filesusr|parastorage|spreadsheethosting/i.test(m[0])) continue;
      const k = path.relative(path.join(SITE, 'calculators'), f).split(path.sep)[0];
      calcExternal.set(k, (calcExternal.get(k) || 0) + 1);
    }
  }
})(path.join(SITE, 'calculators'));
console.log('\n=== calculator bundles: off-site assets ===');
if (!calcExternal.size) console.log('  none — every asset is served from this site');
for (const [k, n] of calcExternal) console.log('  ' + k + ': ' + n + ' reference(s)');

// ---- pages still pointing at Wix ----
const wixRefs = new Map();
for (const f of htmlFiles) {
  if (f.includes(path.join(SITE, 'calculators'))) continue;
  for (const m of fs.readFileSync(f, 'utf8').matchAll(/https?:\/\/[^"' ]*(wixstatic|wix\.com|parastorage|filesusr|spreadsheethosting)[^"' ]*/g)) {
    const host = new URL(m[0]).host;
    wixRefs.set(host, (wixRefs.get(host) || 0) + 1);
  }
}
console.log('\n=== still referencing third-party hosts ===');
if (!wixRefs.size) console.log('  none');
for (const [h, n] of [...wixRefs].sort((a, b) => b[1] - a[1])) console.log('  ' + h.padEnd(34) + n);

// A form whose action is unfinished posts nowhere useful: the visitor types an
// address, submits, and lands on an error page. Two are known to be waiting on
// accounts that only Adrienne can open, so they are listed here and reported
// rather than fatal. Anything NOT on this list is a mistake and fails the run.
// Clear an entry the moment its provider is wired up, so the check keeps its
// teeth.
const FORMS_PENDING = new Set([
  'https://buttondown.com/api/emails/embed-subscribe/YOUR-BUTTONDOWN-USERNAME',
  'https://formspree.io/f/',
]);
const PLACEHOLDER = /YOUR-[A-Z-]+|PLACEHOLDER|EXAMPLE-/i;

const formIssues = new Map();                // action -> {why, pages:Set}
for (const f of htmlFiles) {
  for (const m of fs.readFileSync(f, 'utf8').matchAll(/<form\b[^>]*>/gi)) {
    const a = /action\s*=\s*"([^"]*)"/i.exec(m[0]);
    if (!a) continue;                        // same-page GET, e.g. the search box
    const action = a[1].trim();
    const why = !action ? 'empty action'
      : PLACEHOLDER.test(action) ? 'placeholder still in action'
      : /\/f\/$/.test(action) ? 'provider id missing'
      : null;
    if (!why) continue;
    if (!formIssues.has(action)) formIssues.set(action, { why, pages: new Set() });
    formIssues.get(action).pages.add(path.relative(SITE, f));
  }
}
// A placeholder list address is not rendered as a form (the page shows an
// email-us note instead), so report it from site.json.
const updatesAction = JSON.parse(fs.readFileSync('src/_data/site.json', 'utf8')).updates?.action ?? '';
if (PLACEHOLDER.test(updatesAction)) formIssues.set(updatesAction, { why: 'placeholder in site.json; sign-up shows an email-us note until it is set', pages: new Set(['(every page footer)']) });
const formsFatal = [...formIssues].filter(([a]) => !FORMS_PENDING.has(a));

console.log('\n=== forms that would lose what people type ===');
if (!formIssues.size) console.log('  none - every rendered form posts somewhere real');
for (const [action, { why, pages }] of formIssues) {
  const tag = FORMS_PENDING.has(action) ? 'PENDING (waiting on an account)' : 'BROKEN';
  console.log('  ' + tag);
  console.log('    ' + why + ': ' + action);
  console.log('    on ' + pages.size + ' page(s), e.g. ' + [...pages][0]);
}

// How many states the site says it is licensed in has to match how many
// licences it can actually show. Overstating that is a regulatory problem for a
// PE, not a typo, so the prose is checked against services.json rather than
// trusted to stay in step by hand.
const svc = JSON.parse(fs.readFileSync('src/_data/services.json', 'utf8'));
const licensed = svc.licensedIn.filter(s => s.license);
const undocumented = svc.licensedIn.filter(s => !s.license);
const WORDS = { nine: 9, ten: 10, eleven: 11, twelve: 12 };

const counts = new Map();                       // claimed number -> pages
for (const f of htmlFiles) {
  if (f.includes(path.join(SITE, 'calculators'))) continue;
  const html = fs.readFileSync(f, 'utf8');
  for (const m of html.matchAll(/licen[sc]ed in (\d+|nine|ten|eleven|twelve) states?/gi)) {
    const n = WORDS[m[1].toLowerCase()] ?? Number(m[1]);
    if (!counts.has(n)) counts.set(n, new Set());
    counts.get(n).add(path.relative(SITE, f));
  }
  for (const m of html.matchAll(/in (nine|ten|eleven|twelve) states/gi)) {
    const n = WORDS[m[1].toLowerCase()];
    if (!counts.has(n)) counts.set(n, new Set());
    counts.get(n).add(path.relative(SITE, f));
  }
}
const wrong = [...counts].filter(([n]) => n !== licensed.length);

console.log('\n=== licensure claims ===');
console.log('  licences on file: ' + licensed.length +
  (undocumented.length ? '  | listed without a number: ' +
    undocumented.map(s => s.name).join(', ') : ''));
for (const [n, pages] of counts) {
  console.log('  ' + (n === licensed.length ? 'ok     ' : 'MISMATCH') +
    '  "' + n + ' states" on ' + pages.size + ' page(s), e.g. ' + [...pages][0]);
}
if (wrong.length) {
  console.log('  -> the site claims more states than it can show a licence for.');
  console.log('     Either add the missing number to services.json, or drop the state');
  console.log('     and update the prose. See README, Licensing.');
}

// A project may appear under more than one service, but it has to be written up
// from that service's angle each time. The same paragraph on two pages tells a
// reader nothing the second time, and it happened here the first time these
// were split up. Fatal, because it reads as finished work.
const seenCopy = new Map();                     // paragraph -> service slugs
for (const proj of svc.projects || []) {
  for (const [slug, v] of Object.entries(proj.on || {})) {
    const key = (v.body || '').replace(/\s+/g, ' ').trim().toLowerCase();
    if (!key) continue;
    if (!seenCopy.has(key)) seenCopy.set(key, []);
    seenCopy.get(key).push(proj.title + ' on /' + slug);
  }
}
const dupes = [...seenCopy.values()].filter(w => w.length > 1);
console.log('\n=== project copy ===');
if (!dupes.length) {
  const n = [...seenCopy.keys()].length;
  console.log('  ' + n + ' write-up(s), each unique to its page');
} else {
  for (const w of dupes) console.log('  DUPLICATE: same paragraph on\n    ' + w.join('\n    '));
  console.log('  -> write it from each service\'s angle, or list the project once.');
}

// A stylesheet with an unbalanced brace, or a declaration left behind after its
// selector was deleted, does not fail loudly: the browser skips ahead to
// recover and everything after that point silently stops applying. That is how
// the blog thumbnails disappeared while the HTML still contained them. Fatal,
// because the page looks broken and nothing else reports it.
const cssIssues = [];
for (const f of ['src/assets/css/site.css']) {
  const text = fs.readFileSync(f, 'utf8');
  // Strip comments first so braces or semicolons inside them do not count.
  const src = text.replace(/\/\*[\s\S]*?\*\//g, '');
  let depth = 0, line = 1;
  for (const ch of src) {
    if (ch === '\n') { line++; continue; }
    if (ch === '{') depth++;
    else if (ch === '}') {
      depth--;
      if (depth < 0) { cssIssues.push(f + ':' + line + ' closing brace with nothing open'); depth = 0; }
    }
  }
  if (depth !== 0) cssIssues.push(f + ' ends with ' + depth + ' unclosed rule(s)');

  // A declaration at the top level means a selector was removed and its body
  // left behind.
  let d = 0;
  src.split('\n').forEach((raw, i) => {
    const l = raw.trim();
    const opens = (raw.match(/{/g) || []).length, closes = (raw.match(/}/g) || []).length;
    if (d === 0 && l && !l.startsWith('@') && /^[-a-z]+\s*:/i.test(l) && !opens) {
      cssIssues.push(f + ':' + (i + 1) + ' declaration outside any rule -> ' + l.slice(0, 48));
    }
    d += opens - closes;
    if (d < 0) d = 0;
  });
}
console.log('\n=== stylesheet ===');
if (!cssIssues.length) console.log('  braces balanced, no stray declarations');
cssIssues.slice(0, 12).forEach(i => console.log('  ' + i));

// The duct sizing model the browser runs is a port of ductulator.py, which is
// what was validated against the workbook. Fatal if the two have drifted: a
// calculator that quietly returns different numbers from the reference is worse
// than one that is obviously broken.
const duct = checkDuctulator();
console.log('\n=== duct sizing model ===');
duct.lines.forEach(l => console.log(l));
duct.issues.slice(0, 8).forEach(i => console.log('  FAILED: ' + i));

// The same rule for every other hand-written calculator: its module must give the
// workbook's own answers, case for case, and refuse what it should refuse.
const calcs = await checkCalculators();
console.log('\n=== hand-written calculators vs workbooks ===');
calcs.lines.forEach(l => console.log(l));
calcs.issues.slice(0, 8).forEach(i => console.log('  FAILED: ' + i));

// The code and standard tables that have no workbook: held to their captured sources.
const vent = checkVentilationTables();
console.log('\n=== ventilation tables vs their sources ===');
vent.lines.forEach(l => console.log(l));
vent.issues.slice(0, 8).forEach(i => console.log('  FAILED: ' + i));

const cltd = checkCltdHourly();
console.log('\n=== CLTD hourly tables vs the 1997 Handbook ===');
cltd.lines.forEach(l => console.log(l));
cltd.issues.slice(0, 8).forEach(i => console.log('  FAILED: ' + i));

const ag = checkAirguide();
console.log(String.fromCharCode(10) + '=== AirGuide catalog transcriptions ===');
ag.lines.forEach(l => console.log(l));
ag.issues.slice(0, 8).forEach(i => console.log('  FAILED: ' + i));

const hw = checkHandworked();
console.log(String.fromCharCode(10) + '=== calculators without a workbook, against worked examples ===');
hw.lines.forEach(l => console.log(l));
hw.issues.slice(0, 8).forEach(i => console.log('  FAILED: ' + i));

const seo = checkSeo();
console.log(String.fromCharCode(10) + '=== search-engine basics ===');
seo.lines.forEach(l => console.log(l));
seo.issues.slice(0, 12).forEach(i => console.log('  FAILED: ' + i));

process.exit(missing.length || formsFatal.length || dupes.length || cssIssues.length
  || duct.issues.length || calcs.issues.length || vent.issues.length || cltd.issues.length || ag.issues.length || hw.issues.length || seo.issues.length ? 1 : 0);
