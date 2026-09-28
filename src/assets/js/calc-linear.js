// Linear interpolation: the form behaviour. The maths is in linear.js; this reads
// the form, writes the result and draws the line.
import { interpolate, outside, problem } from './linear.js';
import { live, num, shareable } from './calc-kit.js';

const SVG = 'http://www.w3.org/2000/svg';
// Enough digits to be useful without implying false precision.
const show = v => String(Number(v.toPrecision(8)));
const node = (tag, attrs, text) => {
  const n = document.createElementNS(SVG, tag);
  for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v);
  if (text !== undefined) n.textContent = text;
  return n;
};
function ticks(lo, hi, count) {
  const raw = (hi - lo) / count || 1, p = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 5, 10].map(m => m * p).find(s => s >= raw);
  const out = [];
  for (let t = Math.ceil(lo / step) * step; t <= hi + step * 1e-9; t += step) out.push(Number(t.toPrecision(12)));
  return out;
}

// The two known points, the line through them (dashed beyond them) and the
// interpolated point with guides to both axes. Colours from the site's tokens.
function chart(v, r) {
  const W = 520, H = 320, L = 60, R = 16, T = 16, B = 40;
  const xs = [v.x1, v.x2, r.x], ys = [v.y1, v.y2, r.y];
  const pad = (a, b) => ((b - a) || Math.abs(a) || 1) * 0.12;
  let x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
  [x0, x1] = [x0 - pad(x0, x1), x1 + pad(x0, x1)];
  [y0, y1] = [y0 - pad(y0, y1), y1 + pad(y0, y1)];
  const X = t => L + (t - x0) / (x1 - x0) * (W - L - R), Y = t => T + (1 - (t - y0) / (y1 - y0)) * (H - T - B);
  const svg = node('svg', { viewBox: `0 0 ${W} ${H}`, role: 'img',
    'aria-label': `Graph: the line through (${show(v.x1)}, ${show(v.y1)}) and (${show(v.x2)}, ${show(v.y2)}), with the point (${show(r.x)}, ${show(r.y)}) on it.` });
  for (const t of ticks(x0, x1, 6)) {
    svg.append(node('line', { x1: X(t), x2: X(t), y1: T, y2: H - B, class: 'li-grid' }), node('text', { x: X(t), y: H - B + 16, 'text-anchor': 'middle', class: 'li-tick' }, show(t)));
  }
  for (const t of ticks(y0, y1, 5)) {
    svg.append(node('line', { x1: L, x2: W - R, y1: Y(t), y2: Y(t), class: 'li-grid' }), node('text', { x: L - 6, y: Y(t) + 4, 'text-anchor': 'end', class: 'li-tick' }, show(t)));
  }
  svg.append(node('text', { x: (L + W - R) / 2, y: H - 6, 'text-anchor': 'middle', class: 'li-axis' }, 'x'));
  svg.append(node('text', { x: 14, y: (T + H - B) / 2, 'text-anchor': 'middle', class: 'li-axis' }, 'y'));
  // The line across the whole plot, dashed; solid between the known points.
  const at = t => v.y1 + (t - v.x1) / (v.x2 - v.x1) * (v.y2 - v.y1);
  if (v.x1 !== v.x2) svg.append(node('line', { x1: X(x0), y1: Y(at(x0)), x2: X(x1), y2: Y(at(x1)), class: 'li-ext' }));
  svg.append(node('line', { x1: X(v.x1), y1: Y(v.y1), x2: X(v.x2), y2: Y(v.y2), class: 'li-line' }));
  svg.append(node('line', { x1: X(r.x), y1: Y(r.y), x2: X(r.x), y2: H - B, class: 'li-guide' }), node('line', { x1: X(r.x), y1: Y(r.y), x2: L, y2: Y(r.y), class: 'li-guide' }));
  for (const [px, py] of [[v.x1, v.y1], [v.x2, v.y2]]) svg.append(node('circle', { cx: X(px), cy: Y(py), r: 4.5, class: 'li-known' }));
  svg.append(node('circle', { cx: X(r.x), cy: Y(r.y), r: 6, class: 'li-point' }));
  return svg;
}

function init(form) {
  const el = id => document.getElementById(id);
  shareable(form, ['x1', 'y1', 'x2', 'y2', 's', 'v'], el('li-share'), el('li-copied'));

  function recalc() {
    const solveFor = form.querySelector('input[name="s"]:checked')?.value === 'x' ? 'x' : 'y';
    el('li-v-l').textContent = solveFor === 'x' ? 'y' : 'x';
    const v = { x1: num(el('li-x1')), y1: num(el('li-y1')), x2: num(el('li-x2')), y2: num(el('li-y2')), solveFor, value: num(el('li-v')) };
    const why = problem(v);
    el('li-warn').hidden = true;
    if (why) {
      el('li-summary').textContent = why;
      el('li-fig').hidden = true;
      return;
    }
    const r = interpolate(v);
    el('li-summary').textContent = solveFor === 'x' ? `x = ${show(r.x)} at y = ${show(r.y)}` : `y = ${show(r.y)} at x = ${show(r.x)}`;
    if (outside(r)) {
      el('li-warn').textContent = `The ${solveFor === 'x' ? 'y' : 'x'} you entered is outside the two known points, so this is an extrapolation along the same straight line, not an interpolation. Check that the relationship stays straight that far.`;
      el('li-warn').hidden = false;
    }
    el('li-svg').replaceChildren(chart(v, r));
    el('li-fig').hidden = false;
  }

  live(form, recalc);
  recalc();
}

// Last, so every declaration above is initialised before the calculator starts.
const form = document.getElementById('licalc');
if (form) init(form);
