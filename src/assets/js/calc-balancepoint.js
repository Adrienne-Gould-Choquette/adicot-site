// The heat pump balance point calculator's form behaviour. The maths is in
// balancepoint.js; this reads the form, writes the results and draws the chart.
import { balancePoint, problem } from './balancepoint.js';
import { live, num, fmt, fillRows, shareable } from './calc-kit.js';

const FIELDS = { zeroTemp: 'z', designTemp: 'dt', designLoad: 'dl', lowTemp: 'lt', lowCap: 'lc', highTemp: 'ht', highCap: 'hc' };
const SVG = 'http://www.w3.org/2000/svg';

function node(tag, attrs, text) {
  const n = document.createElementNS(SVG, tag);
  for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v);
  if (text !== undefined) n.textContent = text;
  return n;
}

// A "nice" tick step for a range: 1, 2 or 5 × a power of ten, about `count` ticks.
function step(range, count) {
  const raw = range / count, p = 10 ** Math.floor(Math.log10(raw));
  return [1, 2, 5, 10].map(m => m * p).find(s => s >= raw);
}

// Load and capacity lines against outdoor temperature, with the balance point
// and the shortfall at the design temperature marked. Colours come from the
// site's tokens, so the chart follows light and dark mode.
function chart(v, r) {
  const W = 560, H = 320, L = 64, R = 16, T = 16, B = 44;
  const temps = [v.designTemp, v.zeroTemp, v.lowTemp, v.highTemp];
  if (r.balance !== null && Number.isFinite(r.balance)) temps.push(r.balance);
  let x0 = Math.min(...temps), x1 = Math.max(...temps);
  const xs = step(x1 - x0 || 10, 6);
  x0 = Math.floor(x0 / xs) * xs - xs; x1 = Math.ceil(x1 / xs) * xs;
  const yMaxRaw = Math.max(v.designLoad, r.load(x0), r.capacity(x0), r.capacity(x1), 1);
  const ys = step(yMaxRaw, 5), y1 = Math.ceil(yMaxRaw / ys) * ys;
  const X = t => L + (t - x0) / (x1 - x0) * (W - L - R);
  const Y = q => T + (1 - Math.max(0, Math.min(q, y1)) / y1) * (H - T - B);
  // Clip a line to the plot's 0..y1 band by sampling its ends inside it.
  const seg = f => {
    const pts = [];
    for (let i = 0; i <= 200; i++) {
      const t = x0 + (x1 - x0) * i / 200, q = f(t);
      if (q >= 0 && q <= y1) pts.push(`${X(t).toFixed(1)},${Y(q).toFixed(1)}`);
    }
    return pts.join(' ');
  };
  const svg = node('svg', { viewBox: `0 0 ${W} ${H}`, role: 'img', 'aria-label':
    `Chart: heat loss falls from ${fmt(v.designLoad, 0)} Btu/h at ${fmt(v.designTemp, 0)} °F to zero at ${fmt(v.zeroTemp, 0)} °F; `
    + `heat pump capacity runs from ${fmt(v.lowCap, 0)} Btu/h at ${fmt(v.lowTemp, 0)} °F to ${fmt(v.highCap, 0)} Btu/h at ${fmt(v.highTemp, 0)} °F`
    + (r.balance !== null ? `; balance point ${fmt(r.balance, 1)} °F.` : '.') });
  for (let t = x0; t <= x1 + 1e-9; t += xs) {
    svg.append(node('line', { x1: X(t), x2: X(t), y1: T, y2: H - B, class: 'bp-grid' }));
    svg.append(node('text', { x: X(t), y: H - B + 18, 'text-anchor': 'middle', class: 'bp-tick' }, fmt(t, 0)));
  }
  for (let q = 0; q <= y1 + 1e-9; q += ys) {
    svg.append(node('line', { x1: L, x2: W - R, y1: Y(q), y2: Y(q), class: 'bp-grid' }));
    svg.append(node('text', { x: L - 6, y: Y(q) + 4, 'text-anchor': 'end', class: 'bp-tick' }, fmt(q / 1000, q < 10000 && ys < 1000 ? 1 : 0)));
  }
  svg.append(node('text', { x: (L + W - R) / 2, y: H - 6, 'text-anchor': 'middle', class: 'bp-axis' }, 'Outdoor temperature, °F'));
  svg.append(node('text', { x: 14, y: (T + H - B) / 2, 'text-anchor': 'middle', class: 'bp-axis',
    transform: `rotate(-90 14 ${(T + H - B) / 2})` }, 'Btu/h (thousands)'));
  // The shortfall at design: the gap between the lines, where strip heat makes up the rest.
  if (r.supplemental > 0) {
    svg.append(node('line', { x1: X(v.designTemp), x2: X(v.designTemp), y1: Y(v.designLoad), y2: Y(r.capAtDesign), class: 'bp-gap' }));
  }
  svg.append(node('polyline', { points: seg(r.load), class: 'bp-load' }));
  svg.append(node('polyline', { points: seg(r.capacity), class: 'bp-cap' }));
  if (r.balance !== null && r.balance >= x0 && r.balance <= x1 && r.loadAtBalance >= 0 && r.loadAtBalance <= y1) {
    svg.append(node('circle', { cx: X(r.balance), cy: Y(r.loadAtBalance), r: 5, class: 'bp-dot' }));
  }
  const legend = node('g', { transform: `translate(${W - R - 170} ${T + 8})` });
  legend.append(node('rect', { x: -8, y: -12, width: 176, height: 44, rx: 6, class: 'bp-legend' }));
  legend.append(node('line', { x1: 0, x2: 22, y1: 0, y2: 0, class: 'bp-load' }), node('text', { x: 30, y: 4, class: 'bp-tick' }, 'Building heat loss'));
  legend.append(node('line', { x1: 0, x2: 22, y1: 20, y2: 20, class: 'bp-cap' }), node('text', { x: 30, y: 24, class: 'bp-tick' }, 'Heat pump capacity'));
  svg.append(legend);
  return svg;
}

function init(form) {
  const el = id => document.getElementById(id);
  shareable(form, Object.values(FIELDS), el('bp-share'), el('bp-copied'));

  function recalc() {
    const v = Object.fromEntries(Object.entries(FIELDS).map(([k, id]) => [k, num(el(`bp-${id}`))]));
    const why = problem(v);
    if (why) {
      el('bp-summary').textContent = why;
      el('bp-table').hidden = true;
      el('bp-fig').hidden = true;
      return;
    }
    const r = balancePoint(v);
    const kw = k => (typeof k === 'number' ? `${fmt(k, 0)} kW` : k);
    const rows = [
      ['Balance point', r.balance === null ? 'none: the lines never cross' : fmt(r.balance, 1), r.balance === null ? '' : '°F', 'cf-key'],
    ];
    if (r.balance !== null) rows.push(['Heat loss = capacity at the balance point', fmt(r.loadAtBalance, 0), 'Btu/h']);
    rows.push(
      ['Heat pump capacity at the design temperature', fmt(r.capAtDesign, 0), 'Btu/h'],
      ['Supplemental heat needed at design', fmt(r.supplemental, 0), 'Btu/h'],
      ['', fmt(r.supplementalKw, 2), 'kW'],
      ['Strip heater, supplemental', r.strip === 0 ? 'none needed' : kw(r.strip), '', 'cf-key'],
      ['Emergency heat, full design load', fmt(r.emergencyKw, 2), 'kW'],
      ['Strip heater, emergency heat', r.emergencyStrip === 0 ? 'none needed' : kw(r.emergencyStrip), ''],
    );
    fillRows(el('bp-tbody'), rows);
    el('bp-table').hidden = false;
    el('bp-svg').replaceChildren(chart(v, r));
    el('bp-fig').hidden = false;
    el('bp-summary').textContent = v.designLoad === 0
      ? 'With no heat loss at the design temperature, no supplemental heat is needed.'
      : r.supplemental === 0
        ? `The heat pump covers the full ${fmt(v.designLoad, 0)} Btu/h at ${fmt(v.designTemp, 0)} °F; no supplemental heat is needed`
          + (r.balance !== null ? ` (balance point ${fmt(r.balance, 1)} °F).` : '.')
        : `Balance point ${r.balance === null ? 'none' : fmt(r.balance, 1) + ' °F'}. At ${fmt(v.designTemp, 0)} °F the heat pump falls `
          + `${fmt(r.supplemental, 0)} Btu/h (${fmt(r.supplementalKw, 2)} kW) short: `
          + (typeof r.strip === 'number' ? `a ${r.strip} kW strip heater covers it.` : 'more than a 25 kW strip heater.');
  }

  live(form, recalc);
  recalc();
}

// Last, so every declaration above is initialised before the calculator starts.
const form = document.getElementById('bpcalc');
if (form) init(form);
