// Text from a PDF whose fonts are Type0 with ToUnicode maps: parse the objects,
// decode each font's CMap, then walk the page content streams translating hex
// (and literal) strings with the current font's map. Positions (Td/Tm) start new
// lines when the y coordinate changes, so table rows come out one per line.
import fs from 'node:fs';
import zlib from 'node:zlib';

const buf = fs.readFileSync(process.argv[2]);
const s = buf.toString('latin1');

// Objects: "n 0 obj ... endobj", with their decoded stream if any.
const objs = new Map();
const objRe = /(\d+)\s+0\s+obj\b/g;
let m;
while ((m = objRe.exec(s))) {
  const start = m.index + m[0].length;
  const end = s.indexOf('endobj', start);
  const body = s.slice(start, end);
  let stream = null;
  const si = body.indexOf('stream');
  if (si >= 0) {
    let st = start + si + 6;
    if (s[st] === '\r') st++;
    if (s[st] === '\n') st++;
    const se = s.indexOf('endstream', st);
    const raw = buf.subarray(st, se);
    try { stream = zlib.inflateSync(raw).toString('latin1'); } catch { stream = /FlateDecode/.test(body.slice(0, si)) ? null : raw.toString('latin1'); }
  }
  objs.set(Number(m[1]), { dict: si >= 0 ? body.slice(0, si) : body, stream });
  objRe.lastIndex = end;
}
// Compressed object streams (PDF 1.5+): "n offset" pairs, then the objects
// themselves from /First on. Objects inside them never carry streams.
for (const o of [...objs.values()]) {
  if (!/\/Type\s*\/ObjStm/.test(o.dict) || !o.stream) continue;
  const n = Number(/\/N\s+(\d+)/.exec(o.dict)?.[1]), first = Number(/\/First\s+(\d+)/.exec(o.dict)?.[1]);
  const head = o.stream.slice(0, first).trim().split(/\s+/).map(Number);
  for (let i = 0; i < n; i++) {
    const num = head[2 * i], off = first + head[2 * i + 1];
    const next = i + 1 < n ? first + head[2 * i + 3] : o.stream.length;
    if (!objs.has(num)) objs.set(num, { dict: o.stream.slice(off, next), stream: null });
  }
}
const ref =(dict, key) => { const r = new RegExp('/' + key + '\\s+(\\d+)\\s+0\\s+R').exec(dict); return r ? Number(r[1]) : null; };

// ToUnicode CMap -> Map(code hex -> string)
function cmap(text) {
  const map = new Map();
  const hexToStr = h => { let o = ''; for (let k = 0; k + 4 <= h.length; k += 4) o += String.fromCharCode(parseInt(h.slice(k, k + 4), 16)); return o; };
  for (const blk of text.matchAll(/beginbfchar([\s\S]*?)endbfchar/g)) {
    for (const p of blk[1].matchAll(/<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]+)>/g)) map.set(p[1].toUpperCase(), hexToStr(p[2]));
  }
  for (const blk of text.matchAll(/beginbfrange([\s\S]*?)endbfrange/g)) {
    for (const p of blk[1].matchAll(/<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]+)>\s*(<([0-9A-Fa-f]+)>|\[([^\]]*)\])/g)) {
      const lo = parseInt(p[1], 16), hi = parseInt(p[2], 16), w = p[1].length;
      if (p[4]) { const base = parseInt(p[4], 16); for (let c = lo; c <= hi; c++) map.set(c.toString(16).toUpperCase().padStart(w, '0'), String.fromCharCode(base + c - lo)); }
      else { const list = [...p[5].matchAll(/<([0-9A-Fa-f]+)>/g)].map(x => hexToStr(x[1])); for (let c = lo; c <= hi; c++) map.set(c.toString(16).toUpperCase().padStart(w, '0'), list[c - lo] ?? ''); }
    }
  }
  return map;
}

const WIN={0x80:'€',0x82:'‚',0x83:'ƒ',0x84:'„',0x85:'…',0x86:'†',0x87:'‡',0x88:'ˆ',0x89:'‰',0x8A:'Š',0x8B:'‹',0x8C:'Œ',0x91:'‘',0x92:'’',0x93:'“',0x94:'”',0x95:'•',0x96:'–',0x97:'—',0x98:'˜',0x99:'™',0x9A:'š',0x9B:'›',0x9C:'œ',0x9F:'Ÿ'};
const winChar=c=>WIN[c]??String.fromCharCode(c);
const unknown={};
// Pages in order, with their font resources and content streams.
const pages = [...objs.entries()].filter(([, o]) => /\/Type\s*\/Page\b/.test(o.dict)).sort((a, b) => a[0] - b[0]);
let out = '';
for (const [, page] of pages) {
  // Resources may be inline or a reference.
  let res = page.dict;
  const rref = ref(page.dict, 'Resources');
  if (rref !== null) res = objs.get(rref)?.dict ?? res;
  let fontDict = /\/Font\s*<<([\s\S]*?)>>/.exec(res)?.[1] ?? '';
  const fref = ref(res, 'Font');
  if (!fontDict && fref !== null) fontDict = objs.get(fref)?.dict ?? '';
  const fonts = {};
  for (const f of fontDict.matchAll(/\/([\w.+-]+)\s+(\d+)\s+0\s+R/g)) {
    const fo = objs.get(Number(f[2]));
    const tu = fo ? ref(fo.dict, 'ToUnicode') : null;
    fonts[f[1]] = { map: tu !== null ? cmap(objs.get(tu)?.stream ?? '') : null, two: /Type0/.test(fo?.dict ?? '') };
  }
  const contents = /\/Contents\s*\[([^\]]*)\]/.exec(page.dict)?.[1] ?? /\/Contents\s+(\d+\s+0\s+R)/.exec(page.dict)?.[1] ?? '';
  const streams = [...contents.matchAll(/(\d+)\s+0\s+R/g)].map(r => objs.get(Number(r[1]))?.stream ?? '');
  const t = streams.join('\n');
  let font = null, line = '', lastY = null;
  const decode = (hex) => {
    const f = fonts[font];
    const step = f?.two ? 4 : 2;
    let o = '';
    for (let k = 0; k < hex.length; k += step) { const code = hex.slice(k, k + step).toUpperCase(); const u=f?.map?.get(code); if(u!==undefined) o+=u; else if(!f?.two) o+=winChar(parseInt(code,16)); else { unknown[font+':'+code]=(unknown[font+':'+code]??0)+1; o+='□'; } }
    return o;
  };
  const tokens = t.match(/\/[\w.+-]+|<[0-9A-Fa-f\s]*>|\((?:\\.|[^\\)])*\)|\[|\]|-?\d*\.?\d+|[A-Za-z'"*]+/g) ?? [];
  const stack = [];
  for (const tok of tokens) {
    if (tok === 'Tf') { font = stack[stack.length - 2]?.slice(1); stack.length = 0; continue; }
    if (tok === 'Tm' || tok === 'Td' || tok === 'TD') {
      const y = Number(stack[stack.length - 1]);
      if (tok === 'Tm' && lastY !== null && Math.abs(y - lastY) > 1) { out += line.trim() + '\n'; line = ''; }
      else if (tok !== 'Tm' && Math.abs(y) > 1) { out += line.trim() + '\n'; line = ''; }
      else line += ' ';
      if (tok === 'Tm') lastY = y;
      stack.length = 0; continue;
    }
    if (tok === 'T*' || tok === "'" ) { out += line.trim() + '\n'; line = ''; stack.length = 0; continue; }
    if (tok === 'Tj' || tok === 'TJ') {
      for (const x of stack) {
        if (x.startsWith('<')) line += decode(x.slice(1, -1).replace(/\s/g, ''));
        else if (x.startsWith('(')) { const raw=x.slice(1,-1).replace(/\\([0-7]{1,3})|\\(.)/g,(m,o,c)=>o?String.fromCharCode(parseInt(o,8)):({n:' ',r:'',t:' '}[c]??c)); const f=fonts[font]; let o=''; for(const ch of raw){ const code=ch.charCodeAt(0).toString(16).toUpperCase().padStart(2,'0'); const u=f?.map?.get(code); o+= u!==undefined?u:winChar(ch.charCodeAt(0)); } line+=o; }
        else if (/^-?\d/.test(x) && Number(x) < -200) line += ' ';
      }
      stack.length = 0; continue;
    }
    if (tok === 'ET') { stack.length = 0; continue; }
    stack.push(tok);
    if (stack.length > 400) stack.splice(0, 200);
  }
  out += line.trim() + '\n=== page end ===\n';
}
fs.writeFileSync(process.argv[3], out); console.error(JSON.stringify(Object.entries(unknown).slice(0,20)));
console.log(JSON.stringify({ pages: pages.length, chars: out.length }));
