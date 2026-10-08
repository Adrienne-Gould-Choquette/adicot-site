import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { schemaGraph } from './tools/schema.mjs';

// Pixel size [width, height] of a PNG, GIF, WebP or JPEG, from its header.
function pixelSize(b) {
  if (b.length > 24 && b.readUInt32BE(0) === 0x89504e47) return [b.readUInt32BE(16), b.readUInt32BE(20)];
  if (b.toString('ascii', 0, 3) === 'GIF') return [b.readUInt16LE(6), b.readUInt16LE(8)];
  if (b.toString('ascii', 0, 4) === 'RIFF' && b.toString('ascii', 8, 12) === 'WEBP') {
    const kind = b.toString('ascii', 12, 16);
    if (kind === 'VP8X') return [1 + b.readUIntLE(24, 3), 1 + b.readUIntLE(27, 3)];
    if (kind === 'VP8 ') return [b.readUInt16LE(26) & 0x3fff, b.readUInt16LE(28) & 0x3fff];
    if (kind === 'VP8L') { const v = b.readUInt32LE(21); return [(v & 0x3fff) + 1, ((v >> 14) & 0x3fff) + 1]; }
  }
  if (b[0] === 0xff && b[1] === 0xd8) {
    for (let i = 2; i + 9 < b.length;) {
      if (b[i] !== 0xff) { i++; continue; }
      const marker = b[i + 1];
      if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) return [b.readUInt16BE(i + 7), b.readUInt16BE(i + 5)];
      i += 2 + b.readUInt16BE(i + 2);
    }
  }
  return null;
}

export default function (eleventyConfig) {
  // Eleventy's dev server hardcodes port 8080 and does not read PORT, so two
  // preview sessions collide. Honour PORT when the harness assigns one, and
  // fall back to Eleventy's own default when run by hand.
  if (process.env.PORT) {
    eleventyConfig.setServerOptions({ port: Number(process.env.PORT) });
  }

  // Calculators and images are copied verbatim. Calculator bundles are
  // SpreadsheetConverter output — never reformat or rebuild them.
  eleventyConfig.addPassthroughCopy({ public: '/' });
  eleventyConfig.addPassthroughCopy('src/assets');

  eleventyConfig.addCollection('posts', c =>
    c.getFilteredByGlob('src/posts/*.md').sort((a, b) => b.data.date - a.data.date));

  // category slug -> { name, posts[] }, built from each post's front matter
  eleventyConfig.addCollection('categories', c => {
    const cats = JSON.parse(readFileSync('src/_data/blogCategories.json', 'utf8'));
    const posts = c.getFilteredByGlob('src/posts/*.md');
    return Object.entries(cats).map(([slug, meta]) => ({
      slug,
      name: meta.name,
      posts: posts
        .filter(p => (p.data.categories || []).includes(slug))
        .sort((a, b) => b.data.date - a.data.date),
    })).filter(c => c.posts.length);
  });

  eleventyConfig.addFilter('readableDate', d =>
    d ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' }) : '');
  eleventyConfig.addFilter('isoDate', d => (d ? new Date(d).toISOString() : ''));
  eleventyConfig.addFilter('limit', (arr, n) => (arr || []).slice(0, n));
  // The Wix icons are up to 2.7 MB each but shown at 24-34 px. tools/shrink-images.ps1
  // writes a 96 px copy to /images/icon/; use it when one exists.
  eleventyConfig.addFilter('iconUrl', url => {
    const small = '/images/icon/' + path.basename(String(url || '')).replace(/\.\w+$/, '.png');
    return url && fs.existsSync(path.join('public', small)) ? small : url;
  });

  // Cache buster for the stylesheet and scripts. The deploy configs serve
  // /assets/* with max-age=31536000, immutable, so a returning visitor would
  // keep an old site.css for a year after a fix and never revalidate it. The
  // hash is over the file's own bytes, so the URL changes exactly when the file
  // does and stays stable when it does not.
  const bustCache = new Map();
  eleventyConfig.addFilter('bust', (url) => {
    if (bustCache.has(url)) return bustCache.get(url);
    const onDisk = path.join('src', url.replace(/^[/]/, ''));
    let out = url;
    try {
      const hash = crypto.createHash('sha1').update(fs.readFileSync(onDisk)).digest('hex').slice(0, 8);
      out = url + '?v=' + hash;
    } catch { /* not a local file we build: leave it alone */ }
    bustCache.set(url, out);
    return out;
  });

  // Entries whose `pages` list names this slug. Used for the representative
  // projects, which live under the service they demonstrate and can appear
  // under more than one where the scope genuinely covers both. Nunjucks has no
  // test for "array contains", and selectattr with an invented one silently
  // matches everything, which is how all three projects once showed on both
  // pages.
  eleventyConfig.addFilter('forPage', (arr, slug) =>
    (arr || []).filter(x => x.on && x.on[slug]));
  // Meta descriptions are written for search engines and nearly all open with the
  // same lead-in ("Our Online, Easy-to-Use Calculator allows Users to ..."). On a
  // 45-card index that reads as noise, so strip it and keep the substance.
  const LEADINS = [
    /^(our|this|the)\b[^.]{0,60}?\bcalculator\b\s*(allows?|lets?)\s+users?\s+(to\s+)?/i,
    /^(an?|our|this|the)\b[^.]{0,40}?\bcalculator\s+(to|for|that)\s+/i,
    /^(an?|our|this|the)\s+(free\s+)?(online\s+)?(easy[- ]to[- ]us\w+,?\s+)+(online\s+)?calculator[.:\s]+/i,
    /^easy[- ]to[- ]use\s+\*?free\*?\s+calculator\s+(for|to)\s+/i,
    /^(easy\s+to\s+use\s+)?online\s+calculator\s+(to\s+|for\s+)?/i,
    /^quickly\s+and\s+easily\s+/i,
    /^easy[- ]to[- ]use\s+(online\s+)?/i,
  ];
  eleventyConfig.addFilter('cardBlurb', s => {
    let t = String(s || '').trim();
    for (const re of LEADINS) { const next = t.replace(re, ''); if (next !== t) { t = next.trim(); break; } }
    if (!t) return '';
    return t.charAt(0).toUpperCase() + t.slice(1);
  });

  eleventyConfig.addFilter('truncate', (s, n) => {
    const t = String(s || '').trim();
    if (t.length <= n) return t;
    return t.slice(0, t.lastIndexOf(' ', n) > 0 ? t.lastIndexOf(' ', n) : n).replace(/[,.;:]$/, '') + '…';
  });

  // Pages are emitted as flat files (/duct-size-calculator.html) so the exact URL
  // Google already has — /duct-size-calculator — is served 200, with no redirect
  // hop. These two filters keep every link and canonical in the extensionless form.
  const clean = url => String(url || '/').replace(/index\.html$/, '').replace(/\.html$/, '')
    .replace(/(.)\/$/, '$1') || '/';
  eleventyConfig.addFilter('cleanUrl', clean);
  eleventyConfig.addFilter('canonicalOf', url => 'https://www.adicot.com' + clean(url));
  eleventyConfig.addFilter('schemaGraph', schemaGraph);
  // When a source file last changed, from git (a fresh clone resets file dates,
  // so the file system cannot say). Falls back to the page's own date.
  const gitDates = new Map();
  eleventyConfig.addFilter('lastChanged', (inputPath, fallback) => {
    if (!gitDates.has(inputPath)) {
      let d = '';
      try { d = execFileSync('git', ['log', '-1', '--format=%cI', '--', inputPath], { encoding: 'utf8' }).trim(); } catch { /* not in git */ }
      gitDates.set(inputPath, d);
    }
    const d = gitDates.get(inputPath) || (fallback ? new Date(fallback).toISOString() : '');
    return d ? new Date(d).toISOString().slice(0, 10) : '';
  });

  // Images in page content (mostly Markdown carried over from Wix) have no
  // width or height, so the page jumps as each one loads. Give every local
  // <img> without them its file's real size, and load it lazily unless the
  // tag already says how to load.
  const sizeCache = new Map();
  const imageSize = url => {
    if (sizeCache.has(url)) return sizeCache.get(url);
    const rel = decodeURIComponent(url.split(/[?#]/)[0]).replace(/^[/]/, '');
    const file = [path.join('public', rel), path.join('src', rel)].find(f => fs.existsSync(f));
    const size = file ? pixelSize(fs.readFileSync(file)) : null;
    sizeCache.set(url, size);
    return size;
  };
  eleventyConfig.addTransform('img-size', function (content) {
    if (!(this.page.outputPath || '').endsWith('.html')) return content;
    return content.replace(/<img\b[^>]*>/g, tag => {
      if (/\swidth=/.test(tag)) return tag;
      const src = /\ssrc="(\/[^"]+)"/.exec(tag)?.[1];
      const size = src && imageSize(src);
      if (!size) return tag;
      const extra = ` width="${size[0]}" height="${size[1]}"` + (/\sloading=/.test(tag) ? '' : ' loading="lazy" decoding="async"');
      return tag.replace(/^<img\b/, '<img' + extra);
    });
  });

  // Links off the site open in a new tab, so the adicot.com page stays open.
  eleventyConfig.addTransform('external-links', function (content) {
    if (!(this.page.outputPath || '').endsWith('.html')) return content;
    return content.replace(/<a\b[^>]*\shref="https?:\/\/(?!(?:www\.)?adicot\.com[/"])[^"]*"[^>]*>/g, tag => {
      if (!/\starget=/.test(tag)) tag = tag.replace(/^<a\b/, '<a target="_blank"');
      if (!/\srel=/.test(tag)) return tag.replace(/^<a\b/, '<a rel="noopener"');
      return /\srel="[^"]*\bnoopener\b/.test(tag) ? tag : tag.replace(/\srel="/, ' rel="noopener ');
    });
  });


  return {
    dir: { input: 'src', includes: '_includes', data: '_data', output: '_site' },
    markdownTemplateEngine: 'njk',
    htmlTemplateEngine: 'njk',
  };
}
