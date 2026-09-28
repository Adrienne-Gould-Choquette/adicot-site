// The diffuser sizer's form behaviour. The catalogs and the selection rules are in
// diffuser-size.js; this reads the form and writes the results table.
import { select, specSheet, RETURN } from './diffuser-size.js';
import { AIRGUIDE, airguideNote } from './airguide-diffusers.js';
import { live, num, fmt, shareable } from './calc-kit.js';

const IMG = {
  [RETURN]: ['/images/diffuser-return-grille.jpg', 166, 164, 'Return grille'],
  'Supply: 1-Way Curved Blade, Louvered Face': ['/images/diffuser-1-way.jpg', 160, 168, '1-way curved blade ceiling diffuser'],
  'Supply: 1-Way Multi-Shutter': ['/images/diffuser-multi-shutter.jpg', 182, 130, '1-way multi-shutter ceiling diffuser'],
  'Supply: 2-Way Curved Blade, Louvered Face': ['/images/diffuser-2-way.jpg', 172, 182, '2-way curved blade ceiling diffuser'],
  'Supply: 3-Way Curved Blade, Louvered Face': ['/images/diffuser-3-way.jpg', 168, 182, '3-way curved blade ceiling diffuser'],
  'Supply: 4-Way Curved Blade, Louvered Face': ['/images/diffuser-4-way.jpg', 198, 206, '4-way curved blade ceiling diffuser'],
};
// AirGuide types use the drawing of the matching Grille Tech type.
for (const [type, t] of Object.entries(AIRGUIDE)) {
  IMG[type] = t.kind === 'return' ? IMG[RETURN] : t.kind === 'sidewall' ? ['/images/diffuser-multi-shutter.jpg', 182, 130, 'Sidewall supply grille']
    : IMG[`Supply: ${t.ways}-Way Curved Blade, Louvered Face`];
}
const LS_PER_CFM = 0.471947443, FPM_PER_MS = 196.850393700787, PA_PER_INWG = 249.0889, M_PER_FT = 0.3048;

// A catalog value as shown in the chosen units.
function show(v, kind, us) {
  if (v === '' || v === null || v === false) return '';
  if (typeof v !== 'number') {
    if (us || !String(kind).startsWith('Throw')) return String(v);
    return String(v).split('-').map(x => (Number.isNaN(Number(x)) ? x : fmt(Number(x) * M_PER_FT, 1))).join('–');   // "5-9" ft -> m
  }
  const pressure = ['Ps', 'Pt', 'TP', 'SP'].includes(kind);
  if (us) return pressure ? fmt(v, 3) : String(v);
  if (kind === 'CFM') return fmt(v * LS_PER_CFM, 0);
  if (kind === 'FPM') return fmt(v / FPM_PER_MS, 1);
  if (pressure) return fmt(v * PA_PER_INWG, 0);
  return String(v);
}
const ROW_NAME = { CFM: ['Airflow', 'cfm', 'l/s'], Throw: ['Throw', 'ft', 'm'], Throw3: ['Throw at 150/100/50 fpm', 'ft', 'm'], NC: ['NC', '', ''],
  Ps: ['Static pressure', 'in. wg', 'Pa'], Pt: ['Total pressure', 'in. wg', 'Pa'], TP: ['Total pressure', 'in. wg', 'Pa'], SP: ['Negative static pressure', 'in. wg', 'Pa'] };

function init(form) {
  const el = id => document.getElementById(id);
  const unitsNow = () => form.querySelector('input[name="u"]:checked')?.value ?? 'US';
  shareable(form, ['u', 't', 'v', 'q', 'nc'], el('ds-share'), el('ds-copied'));

  // Switching units converts what has been typed.
  let was = unitsNow();
  for (const r of form.querySelectorAll('input[name="u"]')) {
    r.addEventListener('change', () => {
      const to = unitsNow();
      if (to !== was) {
        const toMetric = to === 'Metric';
        for (const [id, f] of [['ds-v', FPM_PER_MS], ['ds-q', 1 / LS_PER_CFM]]) {
          const x = num(el(id));
          if (x !== null && !Number.isNaN(x)) el(id).value = String(Number((toMetric ? x / f : x * f).toPrecision(4)));
        }
      }
      was = to;
    }, true);
  }
  form.addEventListener('reset', () => { was = 'US'; });

  function recalc() {
    const units = unitsNow(), us = units === 'US', type = el('ds-type').value;
    el('ds-vu').textContent = us ? 'fpm' : 'm/s';
    el('ds-qu').textContent = us ? 'cfm' : 'l/s';
    const [src, w, h, alt] = IMG[type];
    const img = el('ds-img');
    if (img.getAttribute('src') !== src) Object.assign(img, { src, width: w, height: h, alt });
    el('ds-spec').href = specSheet(type).replace(/^http:/, 'https:');
    const note = el('ds-note');
    note.hidden = type !== 'Supply: 1-Way Multi-Shutter' && !AIRGUIDE[type];
    note.textContent = AIRGUIDE[type] ? airguideNote(type)
      : 'The multi-shutter ratings in this catalog are the same as the 1-way curved blade diffuser\'s; confirm them with the manufacturer.';

    const speed = num(el('ds-v')), flow = num(el('ds-q')), maxNcIn = num(el('ds-nc'));
    const head = el('ds-head'), body = el('ds-body'), wrap = el('ds-wrap');
    if (!(speed > 0) || !(flow > 0)) {
      head.replaceChildren(); body.replaceChildren(); wrap.hidden = true;
      el('ds-summary').textContent = 'Enter the neck velocity and the airflow.';
      return;
    }
    const r = select({ units, type, flow, speed, maxNc: maxNcIn > 0 ? maxNcIn : null });
    if (r.column < 0) {
      head.replaceChildren(); body.replaceChildren(); wrap.hidden = true;
      const lowest = r.header.find(v => typeof v === 'number');
      el('ds-summary').textContent = `The catalog starts at ${us ? `${lowest} fpm` : `${fmt(lowest / FPM_PER_MS, 1)} m/s`}; enter at least that neck velocity.`;
      return;
    }
    const cell = (tag, text, cls) => Object.assign(document.createElement(tag), { textContent: text, className: cls ?? '' });
    const hl = i => (i === r.column ? 'ds-col' : '');
    // Header: neck velocity, then the pressure row.
    const hr = document.createElement('tr');
    hr.append(cell('th', 'Neck size'), cell('th', `Velocity, ${us ? 'fpm' : 'm/s'}`), ...r.header.map((v, i) => cell('th', show(v, 'FPM', us), `cf-num ${hl(i)}`)));
    const [pKind, ...pVals] = r.pressure;
    const pr = document.createElement('tr');
    const [pName, pUs, pSi] = ROW_NAME[pKind] ?? [pKind, '', ''];
    pr.append(cell('th', ''), cell('th', `${pName}, ${us ? pUs : pSi}`), ...pVals.map((v, i) => cell('td', show(v, pKind, us), `cf-num ${hl(i)}`)));
    head.replaceChildren(hr, pr);
    body.replaceChildren(...r.groups.flatMap(g => g.rows.map((row, k) => {
      const tr = document.createElement('tr');
      if (k === 0) {
        const th = cell('th', g.labels.join(', ') + (g.ak ? ` (Ak ${g.ak} ft²)` : ''));
        th.rowSpan = g.rows.length; th.scope = 'rowgroup';
        tr.append(th);
      }
      const [kind, ...vals] = row;
      const [name, u1, u2] = ROW_NAME[kind] ?? [kind, '', ''];
      const unit = us ? u1 : u2;
      tr.append(cell('td', unit ? `${name}, ${unit}` : name), ...vals.map((v, i) => cell('td', show(v, kind, us), `cf-num ${hl(i)}`)));
      if (k === 0) tr.className = 'ds-first';
      return tr;
    })));
    wrap.hidden = !r.groups.length;
    const col = r.header[r.column];
    const colText = us ? `${col} fpm` : `${fmt(col / FPM_PER_MS, 1)} m/s`;
    el('ds-summary').textContent = r.groups.length
      ? `${r.groups.length} size${r.groups.length === 1 ? '' : 's'} carry ${us ? `${r.cfm} cfm` : `${fmt(flow, 0)} l/s`}, read at the ${colText} column (highlighted).`
      : `No size in this catalog fits ${us ? `${r.cfm} cfm` : `${fmt(flow, 0)} l/s`} at this velocity${maxNcIn > 0 ? ' and noise limit' : ''}. Try another velocity or type, or split the airflow.`;
  }

  live(form, recalc);
  recalc();
}

// Last, so every declaration above is initialised before the calculator starts.
const form = document.getElementById('dscalc');
if (form) init(form);
