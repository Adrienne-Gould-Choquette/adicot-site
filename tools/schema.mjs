// Structured data (schema.org JSON-LD) for every page, as one linked @graph:
// the firm, the website and, per page type, what the page is. Search engines use
// it for the knowledge panel, breadcrumbs in results and article dates. Built by
// the `schemaGraph` filter in eleventy.config.mjs from the page's own data, so a
// new page gets the right markup without template edits.
import fs from 'node:fs';
import serviceFaqs from '../src/_data/serviceFaqs.js';

const SITE = 'https://www.adicot.com';
let calcList;
const calculators = () => calcList ??= [...new Map(JSON.parse(fs.readFileSync('src/_data/taxonomy.json', 'utf8'))
  .flatMap(g => g.items).map(i => [i.path, { name: i.label, url: SITE + i.path.replace(/\.html$/, '') }])).values()];
const ORG = `${SITE}/#organization`, WEBSITE = `${SITE}/#website`, PERSON = `${SITE}/about#adrienne-gould-choquette`;

// The states Adicot is licensed in (the About page's list).
const STATES = ['Arkansas', 'Florida', 'Illinois', 'Louisiana', 'Massachusetts', 'Nebraska', 'Oklahoma', 'Pennsylvania',
  'Texas', 'West Virginia', 'Wyoming'];
const areaServed = STATES.map(name => ({ '@type': 'State', name, containedInPlace: { '@type': 'Country', name: 'United States' } }));

const organization = {
  '@type': 'Organization', '@id': ORG,
  name: 'Adicot, Inc.', alternateName: 'Adicot', url: SITE,
  logo: { '@type': 'ImageObject', url: `${SITE}/assets/logo.png`, width: 225, height: 124 },
  email: 'admin@adicot.com',
  foundingDate: '2014-10-15',
  founder: { '@id': PERSON },
  address: { '@type': 'PostalAddress', addressLocality: 'Boston', addressRegion: 'MA', addressCountry: 'US' },
  areaServed,
  knowsAbout: ['HVAC load calculations', 'Energy code compliance', 'Mechanical engineering', 'Ventilation design', 'Psychrometrics'],
  contactPoint: { '@type': 'ContactPoint', contactType: 'customer service', email: 'admin@adicot.com', url: `${SITE}/contact`, availableLanguage: 'English' },
};
const website = { '@type': 'WebSite', '@id': WEBSITE, url: SITE, name: 'adicot.com', inLanguage: 'en-US', publisher: { '@id': ORG } };
const person = {
  '@type': 'Person', '@id': PERSON,
  name: 'Adrienne Gould-Choquette', honorificSuffix: 'P.E.', jobTitle: 'Founder and Principal Engineer',
  worksFor: { '@id': ORG }, url: `${SITE}/about`,
  alumniOf: { '@type': 'CollegeOrUniversity', name: 'University of Rhode Island' },
};

const clean = s => String(s ?? '').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
const crumbs = list => ({
  '@type': 'BreadcrumbList',
  itemListElement: list.map(([name, item], i) => ({ '@type': 'ListItem', position: i + 1, name: clean(name), item })),
});

// d: { url (canonical), path, title, description, image (absolute or ''), date,
//      calc (a calculator page), post (a blog post) }
export function schemaGraph(d) {
  const path = d.path.replace(/\.html$/, '').replace(/\/index$/, '/') || '/';
  const title = clean(d.title), description = clean(d.description);
  const image = d.image || `${SITE}/assets/og-default.png`;
  const webpage = (type, extra = {}) => ({
    '@type': type, '@id': `${d.url}#webpage`, url: d.url, name: title, description: description || undefined,
    isPartOf: { '@id': WEBSITE }, inLanguage: 'en-US', primaryImageOfPage: { '@type': 'ImageObject', url: image }, ...extra,
  });
  const graph = [organization, website];

  if (path === '/') {
    graph.push(webpage('WebPage', { about: { '@id': ORG } }));
  } else if (d.calc) {
    graph.push(webpage('WebPage', { mainEntity: { '@id': `${d.url}#app` } }), {
      '@type': 'WebApplication', '@id': `${d.url}#app`, name: title, url: d.url, description: description || undefined,
      applicationCategory: 'UtilitiesApplication', operatingSystem: 'Any', browserRequirements: 'Requires JavaScript',
      isAccessibleForFree: true, offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      publisher: { '@id': ORG }, image,
    }, crumbs([['Calculators', `${SITE}/calculators`], [title, d.url]]));
  } else if (d.post) {
    graph.push(webpage('WebPage'), {
      '@type': 'BlogPosting', '@id': `${d.url}#article`, headline: title.slice(0, 110), description: description || undefined,
      datePublished: d.date || undefined, dateModified: d.modified || d.date || undefined,
      author: { '@id': PERSON }, publisher: { '@id': ORG }, image, mainEntityOfPage: { '@id': `${d.url}#webpage` }, inLanguage: 'en-US',
    }, person, crumbs([['Blog', `${SITE}/blog`], [title, d.url]]));
  } else if (path === '/about') {
    graph.push(webpage('AboutPage', { about: { '@id': ORG }, mainEntity: { '@id': ORG } }), person);
  } else if (path === '/contact') {
    graph.push(webpage('ContactPage', { about: { '@id': ORG } }));
  } else if (path === '/services') {
    graph.push(webpage('CollectionPage', { about: { '@id': ORG } }), crumbs([['Engineering Services', d.url]]));
  } else if (path.startsWith('/services/')) {
    graph.push(webpage('WebPage', { mainEntity: { '@id': `${d.url}#service` } }), {
      '@type': 'Service', '@id': `${d.url}#service`, name: title, serviceType: title, description: description || undefined,
      provider: { '@id': ORG }, areaServed, url: d.url,
    }, crumbs([['Engineering Services', `${SITE}/services`], [title, d.url]]));
    // The page's FAQs, as plain text.
    const faqs = serviceFaqs()[path.split('/').pop()];
    if (faqs) graph.push({
      '@type': 'FAQPage', '@id': `${d.url}#faq`,
      mainEntity: faqs.map(f => ({
        '@type': 'Question', name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: clean(f.a.replace(/<[^>]+>/g, '')) },
      })),
    });
  } else if (path === '/calculators') {
    graph.push(webpage('CollectionPage', { mainEntity: { '@id': `${d.url}#list` } }), {
      '@type': 'ItemList', '@id': `${d.url}#list`, name: 'Engineering calculators', numberOfItems: calculators().length,
      itemListElement: calculators().map((c, i) => ({ '@type': 'ListItem', position: i + 1, name: clean(c.name), url: c.url })),
    });
  } else if (path === '/blog') {
    graph.push(webpage('CollectionPage'), crumbs([['Blog', d.url]]));
  } else if (path.startsWith('/blog/categories/')) {
    graph.push(webpage('CollectionPage'), crumbs([['Blog', `${SITE}/blog`], [title, d.url]]));
  } else {
    graph.push(webpage('WebPage'));
  }
  return JSON.stringify({ '@context': 'https://schema.org', '@graph': graph });
}
