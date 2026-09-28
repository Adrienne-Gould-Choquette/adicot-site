// Serves the local review pages (qa-review.html, icon-review.html) and the
// images they reference. Localhost only; nothing here is part of the site.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const PORT = 8777;
const ALLOW = new Set(['/qa-review.html', '/icon-review.html']);
const TYPES = { '.html': 'text/html', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg', '.gif': 'image/gif', '.webp': 'image/webp', '.svg': 'image/svg+xml' };

http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]);
  if (p === '/') p = '/qa-review.html';
  // review pages, plus the images they embed
  if (!ALLOW.has(p) && !p.startsWith('/public/images/')) {
    res.writeHead(404, { 'content-type': 'text/plain' });
    res.end('Not served here. Try /qa-review.html or /icon-review.html');
    return;
  }
  const file = path.join(ROOT, p);
  if (!file.startsWith(ROOT) || !fs.existsSync(file)) { res.writeHead(404).end('not found: ' + p); return; }
  res.writeHead(200, { 'content-type': TYPES[path.extname(file).toLowerCase()] || 'application/octet-stream' });
  fs.createReadStream(file).pipe(res);
}).listen(PORT, () => {
  console.log('review pages on http://localhost:' + PORT);
  console.log('  http://localhost:' + PORT + '/qa-review.html');
  console.log('  http://localhost:' + PORT + '/icon-review.html');
});
