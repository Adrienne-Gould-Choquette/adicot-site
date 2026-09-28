// Generates post thumbnails for the blog and category listings.
//
//   node build-post-thumbs.mjs
//
// Each post already names a lead image in its `ogImage` front matter, but those
// are Wix originals: twelve posts come to 5.1 MB, one of them 4032x3024. Putting
// those straight into a listing would download several megabytes to draw a row
// of 180px pictures, so they are resized here instead.
//
// Writes src/assets/thumbs/<fileSlug>.{webp,jpg} plus a manifest at
// src/_data/postThumbs.json. The templates render a thumbnail only for slugs in
// that manifest, so a post whose image is missing or unreadable gets a listing
// row without a picture rather than a broken image.
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const POSTS = 'src/posts';
const OUT = 'src/assets/thumbs';
const MANIFEST = 'src/_data/postThumbs.json';
const W = 400, H = 300;                       // 4:3, ~2x the size it is drawn at

fs.mkdirSync(OUT, { recursive: true });

const manifest = {};
const skipped = [];

for (const file of fs.readdirSync(POSTS).filter(f => f.endsWith('.md'))) {
  const slug = path.basename(file, '.md');
  const text = fs.readFileSync(path.join(POSTS, file), 'utf8');
  const m = /^ogImage:\s*"([^"]+)"/m.exec(text);
  if (!m) { skipped.push(slug + ' (no ogImage)'); continue; }

  const src = path.join('public', m[1]);
  if (!fs.existsSync(src)) { skipped.push(slug + ' (missing ' + m[1] + ')'); continue; }

  try {
    // `cover` rather than `contain`: a listing row wants a consistent shape, and
    // letterboxing a 4032x3024 photo next to a 488x284 screenshot looks broken.
    const buf = await sharp(src, { limitInputPixels: false })
      .resize(W, H, { fit: 'cover', position: 'attention' })
      .toBuffer();
    const webp = await sharp(buf).webp({ quality: 82 }).toFile(`${OUT}/${slug}.webp`);
    await sharp(buf).jpeg({ quality: 80, mozjpeg: true }).toFile(`${OUT}/${slug}.jpg`);
    manifest[slug] = { w: W, h: H };
    console.log(slug.slice(0, 46).padEnd(48), W + 'x' + H, Math.round(webp.size / 1024) + ' KB');
  } catch (e) {
    skipped.push(slug + ' (' + e.message.slice(0, 40) + ')');
  }
}

fs.writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2) + '\n');
console.log('---');
console.log(Object.keys(manifest).length + ' thumbnails -> ' + MANIFEST);
if (skipped.length) {
  console.log('no thumbnail for:');
  skipped.forEach(s => console.log('  ' + s));
}
