// Bilinear interpolation: the form behaviour. The maths is in bilinear.js; this
// reads the grid and writes the result into its centre.
import { interpolate, outside, problem } from './bilinear.js';
import { live, num, shareable } from './calc-kit.js';

const KEYS = ['x1', 'x', 'x2', 'y1', 'y', 'y2', 'P11', 'P12', 'P21', 'P22'];
// Enough digits to be useful without implying false precision.
function show(v) { return String(Number(v.toPrecision(8))); }

function init(form) {
  const el = id => document.getElementById(id);
  shareable(form, ['x1', 'x', 'x2', 'y1', 'y', 'y2', 'p11', 'p12', 'p21', 'p22'], el('bi-share'), el('bi-copied'));

  function recalc() {
    const v = Object.fromEntries(KEYS.map(k => [k, num(el(`bi-${k}`))]));
    const why = problem(v);
    el('bi-warn').hidden = true;
    if (why) {
      el('bi-summary').textContent = why;
      el('bi-out').textContent = '?';
      return;
    }
    const R = interpolate(v);
    el('bi-out').textContent = show(R);
    el('bi-summary').textContent = `R(${show(v.x)}, ${show(v.y)}) = ${show(R)}`;
    if (outside(v)) {
      el('bi-warn').textContent = 'x and y must lie between their bounding values; outside them this is an extrapolation, and the result is not valid.';
      el('bi-warn').hidden = false;
    }
  }

  live(form, recalc);
  recalc();
}

// Last, so every declaration above is initialised before the calculator starts.
const form = document.getElementById('bicalc');
if (form) init(form);
