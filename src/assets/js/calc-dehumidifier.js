// The dehumidifier selector's form behaviour. The catalog and the selection rule
// are in dehumidifier.js; this reads the form and writes the results.
import { select, convert, MAX_PINTS } from './dehumidifier.js';
import { live, num, fmt, fillRows, shareable } from './calc-kit.js';

const UNIT_LABEL = { 'Pints/day': 'pints/day', 'BTU/h': 'Btu/h', kW: 'kW' };
const KEY = { 'Pints/day': 'pints', 'BTU/h': 'btuh', kW: 'kW' };

function init(form) {
  const el = id => document.getElementById(id);
  const unitsNow = () => form.querySelector('input[name="u"]:checked')?.value ?? 'Pints/day';
  shareable(form, ['u', 'c'], el('dh-share'), el('dh-copied'));

  // Switching units converts what has been typed: 90 pints/day becomes 4,114 Btu/h.
  let was = unitsNow();
  for (const r of form.querySelectorAll('input[name="u"]')) {
    r.addEventListener('change', () => {
      const cap = num(el('dh-cap')), to = unitsNow();
      if (cap !== null && !Number.isNaN(cap) && to !== was) {
        el('dh-cap').value = String(Number(convert(was, cap)[KEY[to]].toPrecision(6)));
      }
      was = to;
    }, true);
  }
  form.addEventListener('reset', () => { was = 'Pints/day'; });

  function recalc() {
    const units = unitsNow();
    el('dh-cu').textContent = UNIT_LABEL[units];
    const cap = num(el('dh-cap'));
    const list = el('dh-list');
    if (!(cap > 0)) {
      fillRows(el('dh-conv'), []);
      el('dh-tbody').replaceChildren();
      list.hidden = true;
      el('dh-summary').textContent = 'Enter the required capacity.';
      return;
    }
    const r = select(units, cap);
    fillRows(el('dh-conv'), [
      ['Required capacity', fmt(r.pints, 1), 'pints/day', 'cf-key'],
      ['', fmt(r.btuh, 0), 'Btu/h'],
      ['', fmt(r.kW, 2), 'kW'],
    ]);
    if (r.tooBig) {
      const max = convert('Pints/day', MAX_PINTS);
      el('dh-summary').textContent = `That is more than the largest dehumidifier listed, ${MAX_PINTS} pints/day `
        + `(${fmt(max.btuh, 0)} Btu/h, ${fmt(max.kW, 2)} kW). Split the load between units, or enter a smaller capacity.`;
      el('dh-tbody').replaceChildren();
      list.hidden = true;
      return;
    }
    el('dh-tbody').replaceChildren(...r.models.map(([name, cfm, eff, ppd, price, url]) => {
      const tr = document.createElement('tr');
      const th = document.createElement('th');
      th.scope = 'row';
      th.append(Object.assign(document.createElement('a'), { href: url, textContent: name, target: '_blank', rel: 'noopener' }));
      const td = t => Object.assign(document.createElement('td'), { className: 'cf-num', textContent: t });
      tr.append(th, td(String(ppd)), td(String(cfm)), td(String(eff)), td('$' + fmt(price, 0)));
      return tr;
    }));
    list.hidden = false;
    const n = r.models.length;
    el('dh-summary').textContent = `${fmt(r.pints, 1)} pints/day: ${n} dehumidifier${n === 1 ? '' : 's'} rated `
      + `${r.models[0][3]}${r.models[n - 1][3] !== r.models[0][3] ? `–${r.models[n - 1][3]}` : ''} pints/day, the smallest that meet it.`;
  }

  live(form, recalc);
  recalc();
}

// Last, so every declaration above is initialised before the calculator starts.
const form = document.getElementById('dhcalc');
if (form) init(form);
