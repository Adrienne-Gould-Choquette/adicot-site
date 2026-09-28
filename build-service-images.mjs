// Generates the two service card images (load calculations, energy code
// compliance) at the 1200x630 social-card size.
//
//   node build-service-images.mjs
//
// Each card is a photograph on the right, cut with a diagonal edge, and type on
// the left over white. The photographs come from the firm's own library at
// public/images -- carried over from the Wix site, so they are already licensed
// to Adicot and there is no stock agency to account to.
//
// Layout rule: SVG cannot measure text, so nothing here is sized by guessing a
// string's width. An earlier pass did that and the title overflowed its plate
// while two labels printed on top of each other. Type sits inside a fixed safe
// column that clears the diagonal at its narrowest point.
//
// Claims rule: every figure comes from src/_data/services.json or the service
// pages. The 99% first-pass number is deliberately absent -- on the page it
// carries a footnote saying what it excludes, and an image gets reposted
// without its footnote, so the claim would travel alone.
import fs from 'node:fs';
import sharp from 'sharp';

// The state count is a regulatory claim, so it is derived from the same list
// the site renders rather than typed into a caption that can drift out of step.
// verify-urls.mjs checks the prose against that list too.
const SERVICES = JSON.parse(fs.readFileSync('src/_data/services.json', 'utf8'));
const LICENSED = SERVICES.licensedIn.filter(s => s.license).length;
const FOOT = 'Industrial, commercial and multi-family. Licensed in ' + LICENSED + ' states.';

const OUT = 'src/assets';
const SRC = 'public/images';
const W = 1200, H = 630;

// Photo panel: starts at PX, and its left edge slants from PX + SLANT at the
// top down to PX at the bottom.
const PX = 520, PW = W - PX, SLANT = 130;
// Type must clear the diagonal everywhere, so the safe column ends at the
// narrowest point (the bottom of the slant), less a margin.
const SAFE_R = PX - 34;
const PAD = 58;

const INK = '#16191d';
const ORANGE = '#ef7c00';
const ORANGE_DK = '#a8500a';   // the accessible orange, for text on white
const MUTED = '#5d6874';

const FONT = "'Segoe UI', 'Helvetica Neue', Arial, sans-serif";
const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** Bullet rows: an orange check, then a line of text. */
function bullets(items, top, step) {
  return items.map((t, i) => {
    const y = top + i * step;
    return `
    <path d="M${PAD} ${y - 6} l7 8 12 -15" fill="none" stroke="${ORANGE}"
          stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/>
    <text x="${PAD + 32}" y="${y}" fill="${INK}" font-family="${FONT}"
          font-size="20" font-weight="600">${esc(t)}</text>`;
  }).join('');
}

/** Everything drawn over the photo and the white field. */
function overlay({ kicker, title1, title2, points, foot }) {
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <!-- brand bar, full width so it ties the photo to the type -->
  <rect x="0" y="0" width="${W}" height="10" fill="${ORANGE}"/>

  <!-- kicker -->
  <rect x="${PAD}" y="64" width="232" height="38" rx="19" fill="${INK}"/>
  <text x="${PAD + 116}" y="90" text-anchor="middle" fill="#ffffff"
        font-family="${FONT}" font-size="16" font-weight="700" letter-spacing="2">${esc(kicker)}</text>

  <!-- title, second line in the brand colour -->
  <text x="${PAD}" y="182" fill="${INK}" font-family="${FONT}"
        font-size="54" font-weight="700" letter-spacing="-1.2">${esc(title1)}</text>
  <text x="${PAD}" y="242" fill="${ORANGE_DK}" font-family="${FONT}"
        font-size="54" font-weight="700" letter-spacing="-1.2">${esc(title2)}</text>

  <line x1="${PAD}" y1="278" x2="${PAD + 96}" y2="278" stroke="${ORANGE}" stroke-width="4"/>

  ${bullets(points, 330, 44)}

  <text x="${PAD}" y="${H - 74}" fill="${MUTED}" font-family="${FONT}"
        font-size="17" font-weight="500">${esc(foot)}</text>
  <text x="${PAD}" y="${H - 44}" fill="${INK}" font-family="${FONT}"
        font-size="21" font-weight="700" letter-spacing="0.4">adicot.com</text>
</svg>`);
}

/** Diagonal mask for the photo panel, in panel-local coordinates. */
const panelMask = Buffer.from(
  `<svg xmlns="http://www.w3.org/2000/svg" width="${PW}" height="${H}">
     <polygon points="${SLANT},0 ${PW},0 ${PW},${H} 0,${H}" fill="#fff"/>
   </svg>`);

/** Thin orange rule following the diagonal, so the cut reads as deliberate. */
const panelEdge = Buffer.from(
  `<svg xmlns="http://www.w3.org/2000/svg" width="${PW}" height="${H}">
     <line x1="${SLANT}" y1="0" x2="0" y2="${H}" stroke="${ORANGE}" stroke-width="7"/>
   </svg>`);

const CARDS = [
  {
    name: 'og-load-calculations',
    // Drafting desk: psychrometric chart, ductulator, drafting template, an
    // engineering calculator and a rolled Adicot drawing.
    photo: '0179db_dca54d08c373401db157f8994af66b0d~mv2_d_5472_3648_s_4_2.jpg',
    extract: { left: 1500, top: 1380, width: 3972, height: 2268 },
    focus: 'east',
    kicker: 'ENGINEER STAMPED',
    title1: 'HVAC LOAD',
    title2: 'CALCULATIONS',
    points: [
      'Block and room-by-room loads',
      '3,000+ projects stamped since 2014',
      'Returned in 5-10 business days',
    ],
    foot: FOOT,
  },
  {
    name: 'og-energy-code-compliance',
    // Mid-rise multi-family under construction.
    photo: '11062b_4a43fccd46cc4229ad40b312283005f9~mv2.jpg',
    focus: 'east',
    kicker: 'ENGINEER STAMPED',
    title1: 'ENERGY CODE',
    title2: 'COMPLIANCE',
    points: [
      'Prescriptive or performance path',
      '1,080+ multifamily projects',
      'Plan-review ready, stamped',
    ],
    foot: FOOT,
  },
];

if (!fs.existsSync(OUT)) { console.error('No ' + OUT + ' directory.'); process.exit(1); }

for (const c of CARDS) {
  const src = `${SRC}/${c.photo}`;
  if (!fs.existsSync(src)) { console.error('Missing photo: ' + src); process.exit(1); }

  let pipe = sharp(src, { limitInputPixels: false });
  // An explicit crop where part of the frame must not ship -- the drafting photo
  // shows a title block carrying the firm's old Osprey address, still legible at
  // card size, so that corner is cropped out rather than relied on to blur.
  if (c.extract) pipe = pipe.extract(c.extract);
  const photo = await pipe.resize(PW, H, { fit: 'cover', position: c.focus }).toBuffer();

  // Mask to the diagonal, then lay the orange rule along the cut.
  const panel = await sharp(photo)
    .composite([{ input: panelMask, blend: 'dest-in' }, { input: panelEdge }])
    .png().toBuffer();

  const base = sharp({ create: { width: W, height: H, channels: 4, background: '#ffffff' } });
  const out = base.composite([
    { input: panel, left: PX, top: 0 },
    { input: overlay(c), left: 0, top: 0 },
  ]);

  const png = await out.clone().png({ compressionLevel: 9 }).toFile(`${OUT}/${c.name}.png`);
  const webp = await out.clone().webp({ quality: 88 }).toFile(`${OUT}/${c.name}.webp`);
  console.log(
    c.name.padEnd(30),
    png.width + 'x' + png.height,
    'png ' + Math.round(png.size / 1024) + ' KB',
    'webp ' + Math.round(webp.size / 1024) + ' KB');
}

/* ---------- calculator screenshot ----------
   One of the firm's own calculators, inputs and results, which is the thing the
   band heading is claiming. The source in public/images is already cropped: the
   full screenshot carried the old Wix navigation and a contact block with a
   phone and fax number, and neither belongs in the repo.

   The source aspect is kept rather than squared off. Cropping to a tidier ratio
   clipped the last row of the results table, which looks like a mistake rather
   than a crop. */
{
  const src = `${SRC}/calc-duct-size-screenshot.webp`;
  const meta = await sharp(src).metadata();
  for (const [name, w] of [['band-calculators', 720], ['calc-duct-size', 940]]) {
    const h = Math.round(w * meta.height / meta.width);
    const buf = await sharp(src).resize(w, h).toBuffer();
    const png = await sharp(buf).png({ compressionLevel: 9 }).toFile(`${OUT}/${name}.png`);
    const webp = await sharp(buf).webp({ quality: 90 }).toFile(`${OUT}/${name}.webp`);
    console.log(name.padEnd(34), png.width + 'x' + png.height,
      'screenshot', 'webp ' + Math.round(webp.size / 1024) + ' KB');
  }
}

/* ---------- service page banners ----------
   The same two photographs the cards use, without the type baked in: each
   service page already carries its own heading, and a banner repeating it would
   have the title on screen twice. Wide and short so it sits under the page head
   without pushing the copy below the fold. */
{
  const BW = 1360, BH = 420;
  const banners = [
    { name: 'banner-cooling-load-calculations',
      photo: '0179db_dca54d08c373401db157f8994af66b0d~mv2_d_5472_3648_s_4_2.jpg',
      // Same crop as the card: clear of the title block with the old address.
      extract: { left: 1500, top: 1380, width: 3972, height: 2268 }, focus: 'east' },
    { name: 'banner-energy-code-compliance',
      photo: '11062b_4a43fccd46cc4229ad40b312283005f9~mv2.jpg', focus: 'east' },
  ];
  for (const b of banners) {
    let pipe = sharp(`${SRC}/${b.photo}`, { limitInputPixels: false });
    if (b.extract) pipe = pipe.extract(b.extract);
    const buf = await pipe.resize(BW, BH, { fit: 'cover', position: b.focus }).toBuffer();
    const png = await sharp(buf).png({ compressionLevel: 9 }).toFile(`${OUT}/${b.name}.png`);
    const webp = await sharp(buf).webp({ quality: 84 }).toFile(`${OUT}/${b.name}.webp`);
    console.log(b.name.padEnd(34), png.width + 'x' + png.height,
      'photo', 'webp ' + Math.round(webp.size / 1024) + ' KB');
  }
}
