// Glyph positions from chosen PDF pages, for tables whose text is drawn out of
// reading order (the 1997 ASHRAE Handbook sets its CLTD tables by writing digits
// and then kerning back over them, so the content stream says "71 … 6" for
// "7 16"). Each glyph is placed by simulating the text state (Tm, Td, TL, Tf, Tc,
// Tw, Tz, TJ kerning, and the font's own glyph widths), then rows are grouped by
// y and the glyphs in a row sorted by x; a gap wider than about a third of the
// font size starts a new cell.
//
//   node tools/extract/pdfpos.mjs file.pdf "marker text" out.txt
//
// Only pages whose plain text contains the marker are written. Cells come out
// separated by " | ".
import fs from 'node:fs';
import zlib from 'node:zlib';

const [file, marker, outFile] = process.argv.slice(2);
const buf = fs.readFileSync(file);
const s = buf.toString('latin1');

const objs = new Map();
const objRe = /(\d+)\s+0\s+obj\b/g;
let m;
while ((m = objRe.exec(s))) {
  const start = m.index + m[0].length, end = s.indexOf('endobj', start), body = s.slice(start, end);
  let stream = null;
  const si = body.indexOf('stream');
  if (si >= 0) {
    let st = start + si + 6;
    if (s[st] === '\r') st++;
    if (s[st] === '\n') st++;
    const raw = buf.subarray(st, s.indexOf('endstream', st));
    try { stream = zlib.inflateSync(raw).toString('latin1'); } catch { stream = null; }
  }
  objs.set(Number(m[1]), { dict: si >= 0 ? body.slice(0, si) : body, stream });
  objRe.lastIndex = end;
}
for (const o of [...objs.values()]) {
  if (!/\/Type\s*\/ObjStm/.test(o.dict) || !o.stream) continue;
  const n = Number(/\/N\s+(\d+)/.exec(o.dict)[1]), first = Number(/\/First\s+(\d+)/.exec(o.dict)[1]);
  const head = o.stream.slice(0, first).trim().split(/\s+/).map(Number);
  for (let i = 0; i < n; i++) {
    const off = first + head[2 * i + 1], next = i + 1 < n ? first + head[2 * i + 3] : o.stream.length;
    if (!objs.has(head[2 * i])) objs.set(head[2 * i], { dict: o.stream.slice(off, next), stream: null });
  }
}
const deref = v => { const r = /^\s*(\d+)\s+0\s+R/.exec(v ?? ''); return r ? objs.get(Number(r[1]))?.dict ?? '' : v ?? ''; };
const ref = (dict, key) => { const r = new RegExp('/' + key + '\\s+(\\d+)\\s+0\\s+R').exec(dict); return r ? Number(r[1]) : null; };

function cmap(text) {
  const map = new Map();
  const hex = h => { let o = ''; for (let k = 0; k + 4 <= h.length; k += 4) o += String.fromCharCode(parseInt(h.slice(k, k + 4), 16)); return o; };
  for (const b of text.matchAll(/beginbfchar([\s\S]*?)endbfchar/g)) for (const p of b[1].matchAll(/<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]+)>/g)) map.set(parseInt(p[1], 16), hex(p[2]));
  for (const b of text.matchAll(/beginbfrange([\s\S]*?)endbfrange/g)) {
    for (const p of b[1].matchAll(/<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]+)>/g)) {
      const lo = parseInt(p[1], 16), hi = parseInt(p[2], 16), base = parseInt(p[3], 16);
      for (let c = lo; c <= hi; c++) map.set(c, String.fromCharCode(base + c - lo));
    }
  }
  return map;
}
function font(dictText) {
  const two = /\/Subtype\s*\/Type0/.test(dictText);
  const tu = ref(dictText, 'ToUnicode');
  const map = tu !== null ? cmap(objs.get(tu)?.stream ?? '') : null;
  const widths = new Map();
  if (!two) {
    const fc = Number(/\/FirstChar\s+(\d+)/.exec(dictText)?.[1] ?? 0);
    let w = /\/Widths\s*\[([^\]]*)\]/.exec(dictText)?.[1];
    if (!w) { const wr = ref(dictText, 'Widths'); if (wr !== null) w = /\[([^\]]*)\]/.exec(objs.get(wr)?.dict ?? '')?.[1]; }
    (w ?? '').trim().split(/\s+/).filter(Boolean).forEach((x, i) => widths.set(fc + i, Number(x)));
  } else {
    const df = ref(dictText, 'DescendantFonts') ?? null;
    let d = df !== null ? objs.get(df)?.dict ?? '' : /\/DescendantFonts\s*\[([^\]]*)\]/.exec(dictText)?.[1] ?? '';
    d = deref(d.replace(/^\s*\[/, '')) || d;
    const W = /\/W\s*\[([\s\S]*)\]/.exec(d)?.[1] ?? '';
    const toks = W.match(/\[|\]|\d+(?:\.\d+)?/g) ?? [];
    for (let i = 0; i < toks.length;) {
      const c = Number(toks[i++]);
      if (toks[i] === '[') { i++; let k = c; while (toks[i] !== ']') widths.set(k++, Number(toks[i++])); i++; }
      else { const c2 = Number(toks[i++]), w = Number(toks[i++]); for (let k = c; k <= c2; k++) widths.set(k, w); }
    }
  }
  return { two, map, widths };
}
const WIN = { 0x96: '–', 0x97: '—', 0x92: '’', 0x93: '“', 0x94: '”' };

const pages = [...objs.entries()].filter(([, o]) => /\/Type\s*\/Page\b/.test(o.dict)).sort((a, b) => a[0] - b[0]);
let out = '';
for (const [, page] of pages) {
  let res = page.dict;
  const rref = ref(page.dict, 'Resources');
  if (rref !== null) res = objs.get(rref)?.dict ?? res;
  let fontDict = /\/Font\s*<<([\s\S]*?)>>/.exec(res)?.[1] ?? '';
  const fref = ref(res, 'Font');
  if (!fontDict && fref !== null) fontDict = objs.get(fref)?.dict ?? '';
  const fonts = {};
  for (const f of fontDict.matchAll(/\/([\w.+-]+)\s+(\d+)\s+0\s+R/g)) fonts[f[1]] = font(objs.get(Number(f[2]))?.dict ?? '');
  const contents = /\/Contents\s*\[([^\]]*)\]/.exec(page.dict)?.[1] ?? /\/Contents\s+(\d+\s+0\s+R)/.exec(page.dict)?.[1] ?? '';
  const t = [...contents.matchAll(/(\d+)\s+0\s+R/g)].map(r => objs.get(Number(r[1]))?.stream ?? '').join('\n');
  // Text state.
  let f = null, fs0 = 1, Tc = 0, Tw = 0, Th = 1, TL = 0;
  let tm = [1, 0, 0, 1, 0, 0], lm = [1, 0, 0, 1, 0, 0];
  const glyphs = [];
  const emit = (code, str) => {
    const w = (f?.widths.get(code) ?? 500) / 1000;
    const ch = f?.map?.get(code) ?? (WIN[code] ?? String.fromCharCode(code));
    glyphs.push({ x: tm[4], y: tm[5], ch, size: fs0 * Math.hypot(tm[0], tm[1]) });
    const adv = (w * fs0 + Tc + (ch === ' ' ? Tw : 0)) * Th;
    tm[4] += adv * tm[0]; tm[5] += adv * tm[1];
  };
  const show = x => {
    if (x.startsWith('<')) {
      const hex = x.slice(1, -1).replace(/\s/g, ''), step = f?.two ? 4 : 2;
      for (let k = 0; k < hex.length; k += step) emit(parseInt(hex.slice(k, k + step), 16));
    } else {
      const raw = x.slice(1, -1).replace(/\\([0-7]{1,3})|\\(.)/g, (mm, o, c) => (o ? String.fromCharCode(parseInt(o, 8)) : ({ n: '\n', r: '\r', t: '\t' }[c] ?? c)));
      for (const c of raw) emit(c.charCodeAt(0));
    }
  };
  const tokens = t.match(/\/[\w.+-]+|<[0-9A-Fa-f\s]*>|\((?:\\.|[^\\)])*\)|\[|\]|-?\d*\.?\d+|[A-Za-z'"*]+/g) ?? [];
  let stack = [], arr = null;
  for (const tok of tokens) {
    if (tok === '[') { arr = []; continue; }
    if (tok === ']') { stack.push(arr); arr = null; continue; }
    if (arr) { arr.push(tok); continue; }
    const n = k => Number(stack[stack.length - k]);
    switch (tok) {
      case 'BT': tm = [1, 0, 0, 1, 0, 0]; lm = [...tm]; break;
      case 'Tf': f = fonts[stack[stack.length - 2]?.slice(1)] ?? null; fs0 = n(1); break;
      case 'Tc': Tc = n(1); break;
      case 'Tw': Tw = n(1); break;
      case 'Tz': Th = n(1) / 100; break;
      case 'TL': TL = n(1); break;
      case 'Tm': tm = stack.slice(-6).map(Number); lm = [...tm]; break;
      case 'Td': case 'TD': {
        const tx = n(2), ty = n(1);
        if (tok === 'TD') TL = -ty;
        lm = [lm[0], lm[1], lm[2], lm[3], lm[4] + tx * lm[0] + ty * lm[2], lm[5] + tx * lm[1] + ty * lm[3]]; tm = [...lm]; break;
      }
      case 'T*': lm = [lm[0], lm[1], lm[2], lm[3], lm[4] - TL * lm[2], lm[5] - TL * lm[3]]; tm = [...lm]; break;
      case 'Tj': show(stack[stack.length - 1]); break;
      case "'": lm[5] -= TL * lm[3]; tm = [...lm]; show(stack[stack.length - 1]); break;
      case 'TJ':
        for (const x of stack[stack.length - 1] ?? []) {
          if (/^-?\d/.test(x)) { const adv = -Number(x) / 1000 * fs0 * Th; tm[4] += adv * tm[0]; tm[5] += adv * tm[1]; }
          else show(x);
        }
        break;
      default:
        if (/^[A-Za-z'"*]+$/.test(tok)) { stack = []; continue; }
        stack.push(tok); continue;
    }
    stack = [];
  }
  const plain = glyphs.map(g => g.ch).join('');
  if (!plain.includes(marker)) continue;
  // Rows by y (within a quarter of the text size), top down; cells by x gaps.
  const rows = [];
  for (const g of glyphs.filter(g => g.ch.trim())) {
    const r = rows.find(r => Math.abs(r.y - g.y) < g.size * 0.25);
    if (r) r.g.push(g); else rows.push({ y: g.y, g: [g] });
  }
  rows.sort((a, b) => b.y - a.y);
  out += `=== page (${marker}) ===\n`;
  for (const r of rows) {
    r.g.sort((a, b) => a.x - b.x);
    let line = '', last = null;
    for (const g of r.g) {
      if (last && g.x - last.x > last.size * 0.85) line += ' | ';
      line += g.ch;
      last = g;
    }
    out += line + '\n';
  }
}
fs.writeFileSync(outFile, out);
console.log(`${out.split('\n').length} lines`);
