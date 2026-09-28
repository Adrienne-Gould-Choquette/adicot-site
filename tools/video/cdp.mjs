// A small Chrome DevTools Protocol client for the video tools: launches the
// installed Chrome headless, opens one page and sends commands to it. Node's
// built-in WebSocket, so nothing to install.
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const CHROME = ['C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'].find(p => fs.existsSync(p));
export const sleep = ms => new Promise(r => setTimeout(r, ms));

export async function launch({ port = 9333, width = 1280, height = 720, scale = 1 } = {}) {
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'adicot-video-'));
  const proc = spawn(CHROME, ['--headless=new', `--remote-debugging-port=${port}`, `--user-data-dir=${profile}`,
    `--window-size=${width},${height}`, `--force-device-scale-factor=${scale}`, '--hide-scrollbars', '--no-first-run',
    '--no-default-browser-check', '--autoplay-policy=no-user-gesture-required', 'about:blank'], { stdio: 'ignore' });
  let targets;
  for (let i = 0; i < 50 && !targets; i++) {
    await sleep(200);
    try { targets = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json(); } catch { /* not up yet */ }
  }
  const page = targets.find(t => t.type === 'page');
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
  let id = 0;
  const pending = new Map(), listeners = new Map();
  ws.onmessage = e => {
    const m = JSON.parse(e.data);
    if (m.id && pending.has(m.id)) { const { res, rej } = pending.get(m.id); pending.delete(m.id); m.error ? rej(new Error(m.error.message)) : res(m.result); }
    else if (m.method) (listeners.get(m.method) ?? []).forEach(f => f(m.params));
  };
  const send = (method, params = {}) => new Promise((res, rej) => { const n = ++id; pending.set(n, { res, rej }); ws.send(JSON.stringify({ id: n, method, params })); });
  const on = (method, f) => listeners.set(method, [...(listeners.get(method) ?? []), f]);
  const evaluate = async expr => {
    const r = await send('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true });
    if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description ?? r.exceptionDetails.text);
    return r.result.value;
  };
  const close = async () => { try { await send('Browser.close'); } catch { /* gone */ } proc.kill(); };
  return { send, on, evaluate, close };
}

// Serves a folder over HTTP; POST /save?name=x writes the body to outDir/x.
import http from 'node:http';
export function serve(root, port, outDir) {
  const types = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json',
    '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.woff2': 'font/woff2', '.ico': 'image/x-icon' };
  const server = http.createServer((req, res) => {
    const u = new URL(req.url, 'http://x');
    if (req.method === 'POST' && u.pathname === '/save') {
      const out = fs.createWriteStream(path.join(outDir, path.basename(u.searchParams.get('name'))));
      req.pipe(out); out.on('finish', () => res.end('ok')); return;
    }
    let p = path.join(root, decodeURIComponent(u.pathname));
    if (fs.existsSync(p) && fs.statSync(p).isDirectory()) p = path.join(p, 'index.html');
    if (!fs.existsSync(p) && fs.existsSync(p + '.html')) p += '.html';
    if (!fs.existsSync(p)) { res.statusCode = 404; return res.end('not found'); }
    res.setHeader('Content-Type', types[path.extname(p)] ?? (p.endsWith('.mp4') ? 'video/mp4' : 'application/octet-stream'));
    res.setHeader('Accept-Ranges', 'bytes');
    // Byte ranges, so a video served from here can be seeked.
    const size = fs.statSync(p).size, range = /bytes=(\d*)-(\d*)/.exec(req.headers.range ?? '');
    if (range) {
      const start = range[1] ? +range[1] : size - +range[2], end = range[1] && range[2] ? +range[2] : size - 1;
      res.writeHead(206, { 'Content-Range': `bytes ${start}-${end}/${size}`, 'Content-Length': end - start + 1 });
      return fs.createReadStream(p, { start, end }).pipe(res);
    }
    res.setHeader('Content-Length', size);
    fs.createReadStream(p).pipe(res);
  });
  return new Promise(r => server.listen(port, '127.0.0.1', () => r(server)));
}
