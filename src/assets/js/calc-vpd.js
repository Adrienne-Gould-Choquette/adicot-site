// The vapour pressure deficit calculator's form behaviour. The maths is in
// vpd.js; this reads the form, writes the results and draws the chart.
import { vpd, problem, rhAtVpd, band, BANDS } from './vpd.js';
import { live, num, fmt, fillRows, shareable, startingValues, unitSwitch, helpButtons, TEMP, FT } from './calc-kit.js';

const SVG = 'http://www.w3.org/2000/svg';
function node(tag, attrs, text) {
  const n = document.createElementNS(SVG, tag);
  for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v);
  if (text !== undefined) n.textContent = text;
  return n;
}

// The chart's frame, shared by the drawing and by the pointer that reads it.
const W = 560, H = 380, L = 52, R = 14, T = 14, B = 44;
// Room temperatures the chart spans: 50 to 100 °F or 10 to 40 °C, widened in
// whole steps to take in the room entered, within what the equations cover.
function span(us, room) {
  const s = us ? 10 : 5, [lo, hi] = us ? [-20, 150] : [-30, 65];
  let [x0, x1] = us ? [50, 100] : [10, 40];
  if (room !== null && !Number.isNaN(room) && room >= lo && room <= hi) {
    x0 = Math.min(x0, Math.floor(room / s) * s);
    x1 = Math.max(x1, Math.ceil(room / s) * s);
  }
  return { x0, x1, s };
}
const scales = ({ x0, x1 }) => ({
  X: t => L + (t - x0) / (x1 - x0) * (W - L - R),
  Y: rh => T + (1 - rh) * (H - T - B),
});

// Bands of VPD over room temperature and relative humidity. Each boundary is a
// curve of constant VPD, at the leaf when `offset` (leaf minus room) is given,
// and `at` marks the room entered.
function chart(us, offset, room, at) {
  const sp = span(us, room), { X, Y } = scales(sp), u = us ? '°F' : '°C';
  const svg = node('svg', { viewBox: `0 0 ${W} ${H}`, role: 'img', 'aria-label':
    `Chart: bands of ${offset === null ? 'air' : 'leaf'} vapor pressure deficit against room temperature, `
    + `${sp.x0} to ${sp.x1} ${u}, and relative humidity, 0 to 100 %`
    + (at ? `; the room entered is at ${fmt(at.t, 1)} ${u} and ${fmt(at.rh * 100, 0)} %.` : '.') });
  // Driest first, each wetter band painted over it: everything above its curve.
  svg.append(node('rect', { x: L, y: T, width: W - L - R, height: H - T - B, class: 'vp-b-dry' }));
  for (let i = BANDS.length - 2; i >= 0; i--) {
    const pts = [];
    for (let k = 0; k <= 60; k++) {
      const t = sp.x0 + (sp.x1 - sp.x0) * k / 60;
      const rh = rhAtVpd({ units: us ? 'US' : 'Metric', room: t, leaf: offset === null ? null : t + offset, kpa: BANDS[i].below });
      pts.push(`${X(t).toFixed(1)},${Y(Math.max(0, Math.min(rh, 1))).toFixed(1)}`);
    }
    svg.append(node('polygon', { points: `${pts.join(' ')} ${W - R},${T} ${L},${T}`, class: `vp-b-${BANDS[i].key}` }));
  }
  for (let t = sp.x0; t <= sp.x1 + 1e-9; t += sp.s) {
    svg.append(node('line', { x1: X(t), x2: X(t), y1: T, y2: H - B, class: 'vp-grid' }));
    svg.append(node('text', { x: X(t), y: H - B + 18, 'text-anchor': 'middle', class: 'bp-tick' }, fmt(t, 0)));
  }
  for (let p = 0; p <= 100; p += 20) {
    svg.append(node('line', { x1: L, x2: W - R, y1: Y(p / 100), y2: Y(p / 100), class: 'vp-grid' }));
    svg.append(node('text', { x: L - 6, y: Y(p / 100) + 4, 'text-anchor': 'end', class: 'bp-tick' }, String(p)));
  }
  svg.append(node('text', { x: (L + W - R) / 2, y: H - 6, 'text-anchor': 'middle', class: 'bp-axis' }, `Room temperature, ${u}`));
  svg.append(node('text', { x: 14, y: (T + H - B) / 2, 'text-anchor': 'middle', class: 'bp-axis',
    transform: `rotate(-90 14 ${(T + H - B) / 2})` }, 'Relative humidity, %'));
  if (at && at.t >= sp.x0 && at.t <= sp.x1 && at.rh >= 0 && at.rh <= 1) {
    svg.append(node('line', { x1: X(at.t), x2: X(at.t), y1: T, y2: H - B, class: 'vp-cross' }));
    svg.append(node('line', { x1: L, x2: W - R, y1: Y(at.rh), y2: Y(at.rh), class: 'vp-cross' }));
    svg.append(node('circle', { cx: X(at.t), cy: Y(at.rh), r: 6, class: 'vp-dot' }));
  }
  return svg;
}

function init(form) {
  const el = id => document.getElementById(id);
  shareable(form, ['u', 't', 'hm', 'wb', 'rh', 'lf', 'z'], el('vp-share'), el('vp-copied'));
  // An older link with a wet bulb and no humidity opens on the wet bulb.
  const q = startingValues();
  if (!q.has('hm') && q.has('wb') && !q.has('rh')) form.querySelector('input[name="hm"][value="wb"]').checked = true;
  unitSwitch(form, 'u', [[el('vp-t'), TEMP], [el('vp-wb'), TEMP], [el('vp-leaf'), TEMP], [el('vp-alt'), FT]], 'Metric');

  const isUS = () => form.querySelector('input[name="u"]:checked')?.value !== 'Metric';
  // Leaf minus room, when both are entered: the chart's bands are drawn for it,
  // and a point picked on the chart keeps it.
  function leafOffset() {
    const room = num(el('vp-t')), leaf = num(el('vp-leaf'));
    return room === null || leaf === null || Number.isNaN(room) || Number.isNaN(leaf) ? null : leaf - room;
  }

  function recalc() {
    const us = isUS();
    for (const s of form.querySelectorAll('.vp-t')) s.textContent = us ? '°F' : '°C';
    el('vp-altu').textContent = us ? 'ft' : 'm';
    // Humidity comes from one input or the other, so the two can't disagree.
    const fromRh = form.querySelector('input[name="hm"]:checked')?.value !== 'wb';
    el('vp-rh-f').hidden = !fromRh;
    el('vp-wb-f').hidden = fromRh;
    const rhPct = fromRh ? num(el('vp-rh')) : null;
    const v = { units: us ? 'US' : 'Metric', room: num(el('vp-t')), wb: fromRh ? null : num(el('vp-wb')),
      rh: rhPct === null || Number.isNaN(rhPct) ? rhPct : rhPct / 100, altitude: num(el('vp-alt')), leaf: num(el('vp-leaf')) };
    const why = fromRh && rhPct === null && v.room !== null ? 'Enter the relative humidity.' : problem(v);
    const r = why ? null : vpd(v);
    const offset = leafOffset(), t = us ? '°F' : '°C';
    el('vp-svg').replaceChildren(chart(us, offset, v.room, r && { t: v.room, rh: r.rh }));
    el('vp-basis').textContent = offset === null
      ? 'The bands show the air VPD. Enter a leaf temperature and they show the leaf VPD instead.'
      : `The bands show the leaf VPD with the leaf ${fmt(Math.abs(offset), 1)} ${t} ${offset < 0 ? 'cooler' : 'warmer'} than the room`
        + (offset === 0 ? ' (the same as the air VPD).' : '.');
    const here = r && band(r.leaf ?? r.air);
    for (const li of el('vp-key').children) {
      li.classList.toggle('is-here', li.dataset.band === here);
      // Only a leaf cooler than the room can be under the dew point.
      if (li.dataset.band === 'wet') li.hidden = !(offset < 0);
    }
    if (why) {
      el('vp-summary').textContent = why;
      el('vp-table').hidden = true;
      return;
    }
    const rows = [['VPD, air', fmt(r.air, 2), 'kPa', 'cf-key']];
    if (r.leaf !== null) rows.push(['VPD, leaf', fmt(r.leaf, 2), 'kPa', 'cf-key']);
    rows.push(
      ['Dew point', fmt(r.dp, 1), t],
      fromRh ? ['Wet bulb', fmt(r.wb, 1), t] : ['Relative humidity', fmt(r.rh * 100, 1), '%'],
      ['Humidity ratio', fmt(r.W, us ? 5 : 3), us ? 'lb/lb' : 'g/kg'],
      ['Specific enthalpy', fmt(r.h, 2), us ? 'Btu/lb' : 'kJ/kg'],
      ['Specific volume', fmt(r.v, 4), us ? 'ft³/lb' : 'm³/kg'],
      ['Saturation vapor pressure', fmt(r.pws, 3), 'kPa'], ['Partial vapor pressure', fmt(r.pw, 3), 'kPa'],
      ['Atmospheric pressure', fmt(r.patm, 2), 'kPa'],
    );
    fillRows(el('vp-tbody'), rows);
    el('vp-table').hidden = false;
    el('vp-summary').textContent = `VPD ${fmt(r.air, 2)} kPa in the air`
      + (r.leaf !== null ? `, ${fmt(r.leaf, 2)} kPa at the leaf.` : '.');
  }

  // ---- reading and setting a point on the chart ----
  // The room temperature and humidity under the pointer, to the degree (half a
  // degree in °C) and the whole percent; null outside the plot.
  function under(e) {
    const box = el('vp-svg').firstElementChild.getBoundingClientRect();
    const x = (e.clientX - box.left) * W / box.width, y = (e.clientY - box.top) * H / box.height;
    if (x < L || x > W - R || y < T || y > H - B) return null;
    const us = isUS(), sp = span(us, num(el('vp-t'))), s = us ? 1 : 2;
    return { us, t: Math.round((sp.x0 + (x - L) / (W - L - R) * (sp.x1 - sp.x0)) * s) / s,
      rh: Math.max(1, Math.round((1 - (y - T) / (H - T - B)) * 100)) };
  }
  const hint = el('vp-read').textContent;
  function readout(e) {
    const p = under(e);
    if (!p) { el('vp-read').textContent = hint; return; }
    const offset = leafOffset(), u = p.us ? '°F' : '°C';
    const r = vpd({ units: p.us ? 'US' : 'Metric', room: p.t, rh: p.rh / 100, altitude: 0, leaf: offset === null ? null : p.t + offset });
    el('vp-read').textContent = `${fmt(p.t, p.us ? 0 : 1)} ${u} and ${p.rh} % RH: ${fmt(r.air, 2)} kPa in the air`
      + (r.leaf !== null ? `, ${fmt(r.leaf, 2)} kPa at the leaf.` : '.');
  }
  // Picking a point enters it: the room temperature and the relative humidity,
  // and the leaf temperature moved with the room so the bands stay put.
  function pick(e) {
    const p = under(e);
    if (!p) return;
    const offset = leafOffset();
    el('vp-t').value = String(p.t);
    el('vp-rh').value = String(p.rh);
    if (offset !== null) el('vp-leaf').value = String(Number((p.t + offset).toFixed(1)));
    form.querySelector('input[name="hm"][value="rh"]').checked = true;
    el('vp-t').dispatchEvent(new Event('input', { bubbles: true }));
  }
  const plot = el('vp-svg');
  plot.addEventListener('click', pick);
  plot.addEventListener('pointermove', e => {
    if (e.pointerType !== 'mouse') return;
    if (e.buttons === 1) pick(e);
    readout(e);
  });
  plot.addEventListener('pointerleave', () => { el('vp-read').textContent = hint; });

  helpButtons(form);
  live(form, recalc);
  recalc();
}

// Last, so every declaration above is initialised before the calculator starts.
const form = document.getElementById('vpcalc');
if (form) init(form);
