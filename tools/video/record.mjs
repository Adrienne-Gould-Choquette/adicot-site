// Records the pilot video's screen footage for the infiltration calculator:
//   node tools/video/record.mjs <outDir>     (build the site first; this serves _site)
// Writes JPEG frames and frames.json (each frame's time) to <outDir>/frames;
// encode.mjs then makes the video. The timing follows the pilot script, so
// each line of narration has its shot on screen.
import fs from 'node:fs';
import path from 'node:path';
import { launch, serve, sleep } from './cdp.mjs';

const out = path.resolve(process.argv[2]), dir = path.join(out, 'frames');
fs.rmSync(dir, { recursive: true, force: true });
fs.mkdirSync(dir, { recursive: true });
const server = await serve('_site', 8099, out);
const b = await launch({ width: 1302, height: 818, scale: 1.5 });
await b.send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 720, deviceScaleFactor: 1.5, mobile: false });
await b.send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value: 'light' }] });
await b.send('Page.enable');
await b.send('Page.navigate', { url: 'http://127.0.0.1:8099/infiltration-pressurization-calculator' });
await sleep(2500);
await b.evaluate(fs.readFileSync(new URL('./stage.js', import.meta.url), 'utf8'));
await b.evaluate('document.fonts.ready.then(() => stage.clearAll())');
await sleep(500);

const frames = [];
let t0 = null;
b.on('Page.screencastFrame', f => {
  const t = f.metadata.timestamp;
  if (t0 === null) t0 = t;
  const name = `f${String(frames.length).padStart(5, '0')}.jpg`;
  fs.writeFileSync(path.join(dir, name), Buffer.from(f.data, 'base64'));
  frames.push({ name, t: +(t - t0).toFixed(3) });
  b.send('Page.screencastFrameAck', { sessionId: f.sessionId }).catch(() => {});
});
await b.send('Page.startScreencast', { format: 'jpeg', quality: 92, maxWidth: 1920, maxHeight: 1080, everyNthFrame: 1 });
const start = Date.now();
const until = async s => { const wait = start + s * 1000 - Date.now(); if (wait > 0) await sleep(wait); };
const js = s => b.evaluate(`(async () => { const { sleep, move, to, click, type, scroll, top, hl, row, endCard } = stage; ${s} })()`);
const fast = `{ per: 70, ms: 330 }`;
const keyRow = `document.querySelector('#cm-tbody tr.cf-key')`;

// A small move so the screencast sends its first frame at once.
await js('await move(700, 520, 300)');
// 0:00 The calculator, empty.
await until(2.5); await js('await move(330, 150, 900)');
// 0:08 Wind speed and window fit.
await until(8); await js(`await type('cm-v', '20', { per: 160 }); await sleep(500); await to('cm-fit', 700);`);
// 0:15 The windows, the door, the building; then the infiltration.
await until(15); await js(`await scroll(top('cm-rows') - 150);
  const w = document.querySelectorAll('#cm-rows input'), d = document.querySelectorAll('#cm-drows input');
  await type(w[0], '4', ${fast}); await type(w[1], '3', ${fast}); await type(w[2], '5', ${fast});
  await type(d[0], '1', ${fast}); await type(d[1], '3', ${fast}); await type(d[2], '7', ${fast});
  await type('cm-bl', '30', ${fast}); await type('cm-bw', '60', ${fast}); await type('cm-bh', '16', ${fast});
  document.activeElement.blur(); await scroll(top('cm-results-h') - 90, 900);
  hl(${keyRow});`);
// 0:24 Net outdoor air 500: the verdict.
await until(24); await js(`hl(${keyRow}, false);
  await scroll(top('cm-oa') - 300); await type('cm-oa', '500', { per: 150 }); document.activeElement.blur(); await sleep(400);
  await scroll(top('cm-verdict') - 110, 1000); await move(975, 150, 600); hl('cm-verdict');`);
// 0:38 2,000 cfm: over-pressurized.
await until(38); await js(`hl('cm-verdict', false); await scroll(top('cm-oa') - 300, 700);
  await type('cm-oa', '2000', { per: 120 }); document.activeElement.blur(); await sleep(250);
  await scroll(top('cm-verdict') - 110, 800); hl('cm-verdict');`);
// 0:45 The most outdoor air the door allows.
await until(45); await js(`hl('cm-verdict', false); const r = row('Largest net outdoor air');
  await scroll(top(r) - 470, 900); hl(r); await to(r.lastElementChild ?? r, 600);`);
// 0:52 End card.
await until(52); await js('endCard()');
await until(57);
await b.send('Page.stopScreencast');
await sleep(300);
fs.writeFileSync(path.join(dir, 'frames.json'), JSON.stringify({ duration: 57, frames }));
console.log(`${frames.length} frames over ${frames.at(-1)?.t}s`);
await b.close();
server.close();
