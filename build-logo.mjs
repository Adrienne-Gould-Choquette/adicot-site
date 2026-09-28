// Generates the site logo assets from the master TIF on Google Drive.
// Re-run only if the master changes; the outputs are committed.
import sharp from 'sharp';
import fs from 'node:fs';

const SRC = 'G:/My Drive/4-Logo/_Current/Adicot-Logo-2017.tif';
// LOGO_OUT renders elsewhere, e.g. to preview a change before replacing the committed assets.
const OUT = process.env.LOGO_OUT ?? 'src/assets';

if (!fs.existsSync(SRC)) {
  console.error('Master logo not found (Google Drive offline?):', SRC);
  console.error('Existing assets in ' + OUT + ' are unchanged.');
  process.exit(1);
}

const base = sharp(SRC, { limitInputPixels: false })
  .trim({ background: '#ffffff', threshold: 12 })          // drop the wide white margin
  .flatten({ background: '#ffffff' });                      // no alpha: keep the white plate

const meta = await base.clone().toBuffer({ resolveWithObject: true });
console.log('trimmed master:', meta.info.width + ' x ' + meta.info.height);

// Header lockup. Displayed at 56px tall, emitted at 2x.
const H = 112;
for (const [name, fmt, opts] of [
  ['logo.png', 'png', { compressionLevel: 9 }],
  ['logo.webp', 'webp', { quality: 92 }],
]) {
  const info = await sharp(await base.clone().toBuffer(), { limitInputPixels: false })
    .resize({ height: H, fit: 'contain', background: '#ffffff' })
    .extend({ top: 6, bottom: 6, left: 10, right: 10, background: '#ffffff' })
    .toFormat(fmt, opts)
    .toFile(`${OUT}/${name}`);
  console.log(name.padEnd(11), info.width + ' x ' + info.height, Math.round(info.size / 1024) + ' KB');
}

// ---- dark-background version of the logo ----
// The master is black letterforms and an orange wordmark on white. A plain
// invert would turn the orange blue, so remap per pixel instead:
//   achromatic pixels (the black A/I and the white ground) -> white art on
//     transparent, with alpha taken from the original darkness so the
//     anti-aliased edges stay smooth
//   saturated pixels (the orange wordmark) -> left exactly as they are
// The result is transparent-backed, so it sits on any dark value.
{
  const SAT = 40;                       // max-min above this counts as "coloured"
  const src = await base.clone().resize({ height: H }).ensureAlpha()
    .raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = src.info;
  const px = src.data;
  for (let i = 0; i < px.length; i += channels) {
    const r = px[i], g = px[i + 1], b = px[i + 2];
    const sat = Math.max(r, g, b) - Math.min(r, g, b);
    if (sat > SAT) continue;            // orange wordmark: untouched
    const lum = (r * 0.2126 + g * 0.7152 + b * 0.0722);
    px[i] = px[i + 1] = px[i + 2] = 255;         // white art
    px[i + 3] = Math.round(255 - lum);           // opaque where it was black
  }
  const dark = sharp(px, { raw: { width, height, channels } })
    .extend({ top: 6, bottom: 6, left: 10, right: 10, background: { r: 0, g: 0, b: 0, alpha: 0 } });
  for (const [name, fmt, opts] of [
    ['logo-dark.png', 'png', { compressionLevel: 9 }],
    ['logo-dark.webp', 'webp', { quality: 92, alphaQuality: 100 }],
  ]) {
    const info = await dark.clone().toFormat(fmt, opts).toFile(`${OUT}/${name}`);
    console.log(name.padEnd(16), info.width + ' x ' + info.height, Math.round(info.size / 1024) + ' KB');
  }
}

// ---- favicons, from the initials mark ----
// The .psd master is not readable by libvips; the .gif beside it is the same
// artwork at 511x366 with transparency, which is ample since the largest icon
// we emit is 180px.
const MARK = 'G:/My Drive/4-Logo/_Current/Adicot-Logo-Initials.gif';
if (fs.existsSync(MARK)) {
  const mark = await sharp(MARK).trim({ threshold: 10 }).toBuffer({ resolveWithObject: true });
  console.log('\ninitials mark trimmed:', mark.info.width + ' x ' + mark.info.height);

  // A shrunken black-on-white logo reads as grey mush at 16px. Instead: a solid
  // brand-orange tile with the black initials on it, matching the black letters
  // of the header logo. High contrast, and it works on light or dark chrome.
  // The mark is black on transparent, so it goes on the tile as it is.
  const BRAND = '#ef7c00';
  const letters = mark.data;

  const icon = async (size, padRatio, radiusRatio, name) => {
    const inner = Math.round(size * (1 - padRatio * 2));
    const art = await sharp(letters)
      .resize({ width: inner, height: inner, fit: 'inside' })
      .toBuffer();
    const layers = [{ input: art, gravity: 'center' }];
    if (radiusRatio > 0) {
      const r = Math.round(size * radiusRatio);
      layers.push({
        input: Buffer.from(
          `<svg width="${size}" height="${size}"><rect width="${size}" height="${size}" rx="${r}" ry="${r}" fill="#fff"/></svg>`),
        blend: 'dest-in',
      });
    }
    const info = await sharp({
      create: { width: size, height: size, channels: 4, background: BRAND },
    }).composite(layers).png({ compressionLevel: 9 }).toFile(`${OUT}/${name}`);
    console.log(name.padEnd(22), info.width + 'x' + info.height, info.size + ' B');
  };

  // Tab icons get rounded corners; Apple applies its own mask, so that one is
  // full-bleed with a little more breathing room.
  await icon(32, 0.06, 0.18, 'favicon-32.png');
  await icon(48, 0.06, 0.18, 'favicon-48.png');
  await icon(180, 0.14, 0, 'apple-touch-icon.png');
}

// Social card image (og:image needs a bigger, roughly 1.91:1 frame)
const og = await sharp(await base.clone().toBuffer(), { limitInputPixels: false })
  .resize({ width: 1000, fit: 'contain', background: '#ffffff' })
  .extend({ top: 120, bottom: 120, left: 100, right: 100, background: '#ffffff' })
  .png({ compressionLevel: 9 })
  .toFile(`${OUT}/og-default.png`);
console.log('og-default.png'.padEnd(11), og.width + ' x ' + og.height, Math.round(og.size / 1024) + ' KB');
