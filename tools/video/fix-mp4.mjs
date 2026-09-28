// Chrome's MediaRecorder writes a fragmented MP4 (moof/mdat pairs) whose
// header gives no length, so players show a few seconds and cannot seek. This
// rewrites it as an ordinary MP4 (one sample table, one mdat) without touching
// the encoded video:
//   node tools/video/fix-mp4.mjs <in.mp4> [out.mp4]      (out defaults to in)
// Video-only files from MediaRecorder: one track, no edit lists.
import fs from 'node:fs';

const [src, dst = src] = process.argv.slice(2);
const b = fs.readFileSync(src);

// Boxes: [{ type, start, end, body }] for the children of b[from, to).
function boxes(from, to) {
  const out = [];
  for (let i = from; i < to;) {
    let size = b.readUInt32BE(i), head = 8;
    if (size === 1) { size = Number(b.readBigUInt64BE(i + 8)); head = 16; }
    if (size === 0) size = to - i;
    out.push({ type: b.toString('latin1', i + 4, i + 8), start: i, end: i + size, body: i + head });
    i += size;
  }
  return out;
}
const child = (box, type) => boxes(box.body, box.end).find(x => x.type === type);
const path = (box, ...types) => types.reduce((x, t) => x && child(x, t), box);
const top = boxes(0, b.length);
const moov = top.find(x => x.type === 'moov');
const trak = child(moov, 'trak');
const trex = path(moov, 'mvex', 'trex');
const def = { duration: b.readUInt32BE(trex.body + 12), size: b.readUInt32BE(trex.body + 16), flags: b.readUInt32BE(trex.body + 20) };

// Every sample, from every fragment: where its bytes are, its size, duration, sync.
const samples = [];
for (let i = 0; i < top.length; i++) {
  if (top[i].type !== 'moof') continue;
  const moof = top[i], traf = child(moof, 'traf'), tfhd = child(traf, 'tfhd');
  const tf = b.readUIntBE(tfhd.body + 1, 3);
  let k = tfhd.body + 8;
  let base = moof.start;
  if (tf & 1) { base = Number(b.readBigUInt64BE(k)); k += 8; }
  if (tf & 2) k += 4;
  const d = { ...def };
  if (tf & 8) { d.duration = b.readUInt32BE(k); k += 4; }
  if (tf & 0x10) { d.size = b.readUInt32BE(k); k += 4; }
  if (tf & 0x20) { d.flags = b.readUInt32BE(k); k += 4; }
  for (const trun of boxes(traf.body, traf.end).filter(x => x.type === 'trun')) {
    const f = b.readUIntBE(trun.body + 1, 3), n = b.readUInt32BE(trun.body + 4);
    let p = trun.body + 8, offset = base, first = null;
    if (f & 1) { offset = base + b.readInt32BE(p); p += 4; }
    if (f & 4) { first = b.readUInt32BE(p); p += 4; }
    if (f & 0x800) throw new Error('composition offsets are not handled');
    for (let s = 0; s < n; s++) {
      const duration = f & 0x100 ? b.readUInt32BE((p += 4) - 4) : d.duration;
      const size = f & 0x200 ? b.readUInt32BE((p += 4) - 4) : d.size;
      let flags = f & 0x400 ? b.readUInt32BE((p += 4) - 4) : d.flags;
      if (s === 0 && first !== null) flags = first;
      samples.push({ offset, size, duration, sync: !(flags & 0x10000) });
      offset += size;
    }
  }
}
const total = samples.reduce((t, s) => t + s.duration, 0);

// New boxes.
const u32 = v => { const x = Buffer.alloc(4); x.writeUInt32BE(v); return x; };
const u64 = v => { const x = Buffer.alloc(8); x.writeBigUInt64BE(BigInt(v)); return x; };
const mk = (type, ...parts) => { const body = Buffer.concat(parts); return Buffer.concat([u32(body.length + 8), Buffer.from(type, 'latin1'), body]); };
const full = (type, ...parts) => mk(type, u32(0), ...parts);
const raw = box => b.subarray(box.start, box.end);

// Durations in the headers: mvhd/tkhd in the movie timescale, mdhd in the track's.
function withDuration(box, at0, at1, value) {
  const x = Buffer.from(raw(box)), v1 = x[8] === 1, at = (v1 ? at1 : at0) + 8;
  if (v1) x.writeBigUInt64BE(BigInt(value), at); else x.writeUInt32BE(value, at);
  return x;
}
const mvhdBox = child(moov, 'mvhd'), mdia = child(trak, 'mdia'), mdhdBox = child(mdia, 'mdhd');
const scaleOf = box => b.readUInt32BE(box.body + (b[box.body] === 1 ? 20 : 12));
const movieScale = scaleOf(mvhdBox), trackScale = scaleOf(mdhdBox);
const movieDur = Math.round(total / trackScale * movieScale);

// stts: runs of equal durations.
const runs = [];
for (const s of samples) { const r = runs.at(-1); if (r && r[1] === s.duration) r[0]++; else runs.push([1, s.duration]); }
const stts = full('stts', u32(runs.length), ...runs.flatMap(([n, d]) => [u32(n), u32(d)]));
const syncs = samples.flatMap((s, i) => (s.sync ? [i + 1] : []));
const stss = full('stss', u32(syncs.length), ...syncs.map(u32));
const stsz = full('stsz', u32(0), u32(samples.length), ...samples.map(s => u32(s.size)));
const stsc = full('stsc', u32(1), u32(1), u32(1), u32(1));   // one sample per chunk
const minf = child(mdia, 'minf'), stbl = child(minf, 'stbl');
const buildMoov = mdatData => {
  const co64 = full('co64', u32(samples.length), ...samples.map((s, i) => u64(mdatData + positions[i])));
  const newStbl = mk('stbl', raw(child(stbl, 'stsd')), stts, stss, stsc, stsz, co64);
  const newMinf = mk('minf', ...boxes(minf.body, minf.end).filter(x => x.type !== 'stbl').map(raw), newStbl);
  const newMdia = mk('mdia', withDuration(mdhdBox, 16, 24, total), ...boxes(mdia.body, mdia.end).filter(x => !['mdhd', 'minf'].includes(x.type)).map(raw), newMinf);
  const newTrak = mk('trak', withDuration(child(trak, 'tkhd'), 20, 28, movieDur), ...boxes(trak.body, trak.end).filter(x => !['tkhd', 'mdia', 'edts'].includes(x.type)).map(raw), newMdia);
  return mk('moov', withDuration(mvhdBox, 16, 24, movieDur), newTrak);
};
// The sample data, back to back, in one mdat (64-bit size: it can pass 4 GB in principle).
const positions = [];
let at = 0;
for (const s of samples) { positions.push(at); at += s.size; }
const data = Buffer.concat(samples.map(s => b.subarray(s.offset, s.offset + s.size)));
const ftyp = raw(top.find(x => x.type === 'ftyp'));
const mdatHead = Buffer.concat([u32(1), Buffer.from('mdat', 'latin1'), u64(data.length + 16)]);
const moovLen = buildMoov(0).length;
const newMoov = buildMoov(ftyp.length + moovLen + mdatHead.length);
fs.writeFileSync(dst, Buffer.concat([ftyp, newMoov, mdatHead, data]));
console.log(`${dst}: ${samples.length} frames, ${(total / trackScale).toFixed(2)} s, ${syncs.length} keyframes`);
