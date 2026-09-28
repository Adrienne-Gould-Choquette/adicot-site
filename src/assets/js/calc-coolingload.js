// The cooling load ballpark estimator's form behaviour. The figures and the
// arithmetic are in coolingload.js; this reads the form and writes the results.
import { estimate } from './coolingload.js';
import { live, num, fmt, shareable, unitSwitch, FT2 } from './calc-kit.js';

function init(form) {
  const el = id => document.getElementById(id);
  shareable(form, ['u', 'a', 't'], el('ce-share'), el('ce-copied'));
  unitSwitch(form, 'u', [[el('ce-area'), FT2]], 'Metric');

  function recalc() {
    const units = form.querySelector('input[name="u"]:checked')?.value ?? 'English';
    const us = units === 'English';
    el('ce-au').textContent = us ? 'ft²' : 'm²';
    const r = estimate(units, num(el('ce-area')), el('ce-type').value);
    const tbody = el('ce-tbody');
    if (!r) {
      tbody.replaceChildren();
      el('ce-summary').textContent = 'Enter the floor area.';
      return;
    }
    const rows = [
      ['Occupants', 'people', r.occupants, 0],
      ['Lights & other electrical', 'W', r.watts, 0],
      ['Refrigeration', 'tons', r.tons, 1],
      ['Refrigeration', us ? 'Btu/h' : 'kW', r.heat, us ? 0 : 1],
    ];
    tbody.replaceChildren(...rows.map(([label, unit, vals, dp]) => {
      const tr = document.createElement('tr');
      if (label === 'Refrigeration' && unit === 'tons') tr.className = 'cf-key';
      const th = Object.assign(document.createElement('th'), { scope: 'row', textContent: `${label} (${unit})` });
      tr.append(th, ...vals.map(v => Object.assign(document.createElement('td'), { className: 'cf-num', textContent: v === null ? '' : fmt(v, dp) })));
      return tr;
    }));
    const span = (vals, dp) => {
      const s = vals.filter(v => v !== null);
      return s.length > 1 ? `${fmt(Math.min(...s), dp)}–${fmt(Math.max(...s), dp)}` : s.length ? fmt(s[0], dp) : 'n/a';
    };
    el('ce-summary').textContent = `About ${span(r.tons, 1)} tons of refrigeration, ${span(r.occupants, 0)} occupants `
      + `and ${span(r.watts, 0)} W of lights and other electrical.`;
  }

  live(form, recalc);
  recalc();
}

// Last, so every declaration above is initialised before the calculator starts.
const form = document.getElementById('clecalc');
if (form) init(form);
