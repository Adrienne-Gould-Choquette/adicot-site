// Links between the three kinds of page, built once from front matter so each
// link is declared in one place and shows on both ends:
//
//   a post's      forCalculator: /path   -> the calculator lists the post as its
//                                           guide; the post links the calculator
//   a post's      services: ["slug"]     -> the service page lists the post; the
//                                           post links the service
//   a calculator's service: slug         -> the calculator points at the service;
//                                           the service page lists the calculator
import fs from 'node:fs';
import path from 'node:path';

const front = file => {
  const m = fs.readFileSync(file, 'utf8').match(/^---\r?\n([\s\S]*?)\r?\n---/);
  const get = key => {
    const v = ((m ? m[1] : '').match(new RegExp(`^${key}:\\s*(.*)$`, 'm')) || [])[1];
    if (v === undefined) return undefined;
    try { return JSON.parse(v); } catch { return v.trim(); }
  };
  const link = get('permalink');
  return { get, url: link ? link.replace(/index\.html$/, '').replace(/\.html$/, '') || '/' : null };
};
const files = dir => fs.readdirSync(dir).filter(f => f.endsWith('.md')).sort().map(f => path.join(dir, f));

export default function () {
  const taxonomy = JSON.parse(fs.readFileSync('src/_data/taxonomy.json', 'utf8'));
  const services = JSON.parse(fs.readFileSync('src/_data/services.json', 'utf8')).items;
  // Full page titles, not the short tile labels the taxonomy carries.
  const calcs = new Set(taxonomy.flatMap(g => g.items.map(i => i.path)));
  const calcLabel = new Map();
  for (const f of files('src/pages')) { const p = front(f); if (calcs.has(p.url)) calcLabel.set(p.url, p.get('title')); }
  const service = slug => {
    const s = services.find(x => x.slug === slug && x.page);
    if (!s) throw new Error(`crossLinks: no service page "${slug}"`);
    return { slug, name: s.name, url: `/services/${slug}` };
  };

  const guides = {}, postCalculator = {}, postServices = {}, calcService = {};
  const serviceCalcs = {}, servicePosts = {};

  for (const f of files('src/posts')) {
    const p = front(f), post = { url: p.url, title: p.get('title') };
    const calc = p.get('forCalculator');
    if (calc) {
      if (!calcLabel.has(calc)) throw new Error(`crossLinks: ${f} names unknown calculator "${calc}"`);
      (guides[calc] ||= []).push(post);
      postCalculator[p.url] = { path: calc, label: calcLabel.get(calc) };
    }
    for (const slug of p.get('services') || []) {
      (postServices[p.url] ||= []).push(service(slug));
      (servicePosts[slug] ||= []).push(post);
    }
  }
  for (const f of files('src/pages')) {
    const p = front(f), slug = p.get('service');
    if (!slug) continue;
    calcService[p.url] = service(slug);
    (serviceCalcs[slug] ||= []).push({ path: p.url, label: p.get('title') });
  }
  return { guides, postCalculator, postServices, calcService, serviceCalcs, servicePosts };
}
