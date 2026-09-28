// Turns the frames record.mjs captured into a video, in Chrome itself (the
// frames are drawn to a canvas in real time and MediaRecorder encodes it), so
// nothing needs installing:
//   node tools/video/encode.mjs <outDir> <name>      e.g. ... infiltration-pilot
// Writes <outDir>/<name>.mp4 (H.264, 1920 × 1080), or .webm if this Chrome
// cannot make MP4.
import fs from 'node:fs';
import path from 'node:path';
import { launch, serve, sleep } from './cdp.mjs';

const out = path.resolve(process.argv[2]), name = process.argv[3] ?? 'video';
fs.writeFileSync(path.join(out, 'encode.html'), `<!doctype html><canvas id="c" width="1920" height="1080"></canvas><script>
(async () => {
  const { duration, frames } = await (await fetch('frames/frames.json')).json();
  const c = document.getElementById('c'), g = c.getContext('2d');
  const types = ['video/mp4;codecs=avc1.640028', 'video/mp4', 'video/webm;codecs=vp9', 'video/webm'];
  const type = types.find(t => MediaRecorder.isTypeSupported(t));
  const load = f => fetch('frames/' + f.name).then(r => r.blob()).then(createImageBitmap);
  // Decode ahead of the playhead, a couple of seconds' worth at a time.
  const ready = new Map();
  let next = 0;
  const fill = async () => { while (next < frames.length && ready.size < 90) { const i = next++; ready.set(i, await load(frames[i])); } };
  await fill();
  g.drawImage(ready.get(0), 0, 0, 1920, 1080);
  const rec = new MediaRecorder(c.captureStream(30), { mimeType: type, videoBitsPerSecond: 10e6 });
  const parts = [];
  rec.ondataavailable = e => parts.push(e.data);
  const stopped = new Promise(r => rec.onstop = r);
  rec.start(1000);
  const t0 = performance.now();
  let shown = 0;
  await new Promise(done => {
    const tick = () => {
      const t = (performance.now() - t0) / 1000;
      while (shown + 1 < frames.length && frames[shown + 1].t <= t && ready.has(shown + 1)) {
        ready.get(shown)?.close(); ready.delete(shown); shown++;
      }
      g.drawImage(ready.get(shown), 0, 0, 1920, 1080);
      fill();
      if (t >= duration) done(); else requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
  rec.stop();
  await stopped;
  const ext = type.startsWith('video/mp4') ? 'mp4' : 'webm';
  await fetch('/save?name=${name}.' + ext, { method: 'POST', body: new Blob(parts, { type }) });
  window.result = { type, ext, lag: frames.length - 1 - shown };
})().catch(e => window.result = { error: String(e) });
</script>`);

const server = await serve(out, 8098, out);
const b = await launch({ port: 9334, width: 1920, height: 1080 });
await b.send('Emulation.setDeviceMetricsOverride', { width: 1920, height: 1080, deviceScaleFactor: 1, mobile: false });
await b.send('Page.navigate', { url: 'http://127.0.0.1:8098/encode.html' });
let result;
while (!(result = await b.evaluate('window.result ?? null'))) await sleep(1000);
console.log(result);
await b.close();
server.close();
// MediaRecorder's MP4 is fragmented; rewrite it as an ordinary one that every player can seek.
if (result.ext === 'mp4') {
  const { spawnSync } = await import('node:child_process');
  spawnSync(process.execPath, [(await import('node:url')).fileURLToPath(new URL('./fix-mp4.mjs', import.meta.url)), path.join(out, `${name}.mp4`)], { stdio: 'inherit' });
}
