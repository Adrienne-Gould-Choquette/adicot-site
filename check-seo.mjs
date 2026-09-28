// Search-engine basics for every indexable page of the built site (_site), and
// the sitemap. Run by verify-urls.mjs; also runs on its own after a build:
//   node check-seo.mjs
// Per page: a title of at most ~60 characters (Google cuts near there), a meta
// description of 70-160, a canonical URL, an Open Graph image, exactly one h1,
// alt text on every image, and structured data that parses as one @graph with
// the firm and the site in it. The sitemap must list every indexable page, and
// nothing that is noindex, each with a lastmod.
import fs from 'node:fs';
import path from 'node:path';

const SITE = '_site';
const decode = s => s.replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>');

export function checkSeo() {
  const lines = [], issues = [];
  let checks = 0;
  const need = (ok, what) => { checks++; if (!ok) issues.push(what); };
  const files = [];
  (function walk(d) { for (const f of fs.readdirSync(d)) { const p = path.join(d, f); if (fs.statSync(p).isDirectory()) walk(p); else if (f.endsWith('.html')) files.push(p); } })(SITE);

  const canonicals = [], titles = new Map(), noindexed = [];
  for (const f of files) {
    const h = fs.readFileSync(f, 'utf8');
    const rel = '/' + path.relative(SITE, f).replace(/\\/g, '/');
    const get = re => { const m = re.exec(h); return m ? decode(m[1]) : null; };
    const canonical = get(/<link rel="canonical" href="([^"]*)"/);
    if (/<meta name="robots" content="[^"]*noindex/.test(h)) { if (canonical) noindexed.push(canonical); continue; }
    const title = get(/<title>([^<]*)<\/title>/), desc = get(/<meta name="description" content="([^"]*)"/);
    need(title && title.length <= 62, `${rel}: title ${title ? `is ${title.length} characters, over 62` : 'missing'}`);
    need(desc && desc.length >= 70 && desc.length <= 160, `${rel}: description ${desc ? `is ${desc.length} characters (70-160)` : 'missing'}`);
    need(canonical?.startsWith('https://www.adicot.com'), `${rel}: canonical missing or off-site`);
    need(/<meta property="og:image" content="https:\/\/www\.adicot\.com\/[^"]+"/.test(h), `${rel}: no og:image`);
    need((h.match(/<h1[\s>]/g) || []).length === 1, `${rel}: not exactly one h1`);
    need(![...h.matchAll(/<img\b([^>]*)>/g)].some(m => !/\balt="/.test(m[1])), `${rel}: an image has no alt attribute`);
    const ld = /<script type="application\/ld\+json">([\s\S]*?)<\/script>/.exec(h);
    let types = [];
    try { types = JSON.parse(ld[1])['@graph'].map(x => x['@type']); } catch { /* reported below */ }
    need(types.includes('Organization') && types.includes('WebSite'), `${rel}: structured data missing or unreadable`);
    if (canonical) canonicals.push(canonical);
    if (title) titles.set(title, [...(titles.get(title) ?? []), rel]);
  }
  for (const [t, ps] of titles) need(ps.length === 1, `duplicate title "${t}": ${ps.join(', ')}`);

  const sm = fs.readFileSync(path.join(SITE, 'sitemap.xml'), 'utf8');
  const locs = [...sm.matchAll(/<loc>([^<]*)<\/loc>/g)].map(m => m[1]);
  for (const c of canonicals) need(locs.includes(c), `sitemap is missing ${c}`);
  for (const l of locs) need(!noindexed.includes(l), `sitemap lists noindex page ${l}`);
  need(new Set(locs).size === locs.length, 'sitemap lists a URL twice');
  need((sm.match(/<lastmod>\d{4}-\d{2}-\d{2}<\/lastmod>/g) || []).length === locs.length, 'a sitemap entry has no valid lastmod');

  lines.push(`  ${canonicals.length} indexable pages: titles, descriptions, canonical, og:image, one h1, alt text, structured data`);
  lines.push(`  sitemap: ${locs.length} URLs, each dated; no noindex pages`);
  return { lines, issues, checks };
}

if (process.argv[1]?.endsWith('check-seo.mjs')) {
  const { lines, issues, checks } = checkSeo();
  console.log('=== search-engine basics ===');
  lines.forEach(l => console.log(l));
  console.log(`  ${checks} checks`);
  issues.slice(0, 30).forEach(i => console.log('  FAILED: ' + i));
  process.exit(issues.length ? 1 : 0);
}
