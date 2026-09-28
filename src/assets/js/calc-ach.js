// The air change rate calculator's form behaviour. The maths is in ach.js; this
// reads the form, relabels it, and writes the results.
import { solve, problem } from './ach.js';
import { live, num, fmt, fillRows, shareable, unitSwitch, FT, FT2, CFM } from './calc-kit.js';

function init(form) {
  const el = id => document.getElementById(id);
  const f = { value: el('ach-value'), height: el('ach-height'), length: el('ach-length'),
    width: el('ach-width'), area: el('ach-area') };
  const pick = name => form.querySelector(`input[name="${name}"]:checked`)?.value;

  shareable(form, ['u', 'k', 'v', 'h', 'm', 'l', 'w', 'a'], el('ach-share'), el('ach-copied'));
  // The known value is an air flow (converted) or an ACH (unitless, left alone).
  unitSwitch(form, 'u', [
    [f.value, () => (pick('k') === 'Q' ? CFM : null)],
    [f.height, FT], [f.length, FT], [f.width, FT], [f.area, FT2],
  ]);

  function relabel() {
    const si = pick('u') === 'SI';
    const knowQ = pick('k') === 'Q';
    const byArea = pick('m') === 'area';
    el('ach-value-label').textContent = knowQ ? 'Air flow rate' : 'Air changes per hour';
    el('ach-value-u').textContent = knowQ ? (si ? 'l/s' : 'cfm') : 'ACH';
    f.value.placeholder = knowQ ? (si ? '47' : '100') : '3';
    for (const s of form.querySelectorAll('.ach-len')) s.textContent = si ? 'm' : 'ft';
    el('ach-area-u').textContent = si ? 'm²' : 'ft²';
    f.height.placeholder = si ? '2.7' : '9';
    f.length.placeholder = f.width.placeholder = si ? '3.7' : '12';
    f.area.placeholder = si ? '13.4' : '144';
    // Only the fields for the chosen way of giving the floor are shown and required.
    el('ach-lw').hidden = byArea;
    el('ach-area-field').hidden = !byArea;
    f.length.required = f.width.required = !byArea;
    f.area.required = byArea;
  }

  function recalc() {
    relabel();
    const si = pick('u') === 'SI';
    const input = {
      units: si ? 'SI' : 'US', given: pick('k'), areaMode: pick('m'),
      value: num(f.value), height: num(f.height), length: num(f.length), width: num(f.width), area: num(f.area),
    };
    const why = problem(input);
    if (why) {
      el('ach-summary').textContent = why;
      el('ach-table').hidden = true;
      return;
    }
    const r = solve(input);
    const u = si ? { vol: 'm³', q: 'l/s' } : { vol: 'ft³', q: 'cfm' };
    fillRows(el('ach-tbody'), [
      ['Room volume', fmt(r.volume), u.vol],
      ['Air flow rate, Q', fmt(r.Q), u.q, input.given === 'Q' ? 'is-given' : 'cf-key'],
      ['Air changes per hour', fmt(r.ACH), 'ACH', input.given === 'ACH' ? 'is-given' : 'cf-key'],
    ]);
    el('ach-table').hidden = false;
    el('ach-summary').textContent = input.given === 'ACH'
      ? `${fmt(r.ACH)} air changes per hour in a ${fmt(r.volume)} ${u.vol} room takes ${fmt(r.Q)} ${u.q}.`
      : `${fmt(r.Q)} ${u.q} into a ${fmt(r.volume)} ${u.vol} room is ${fmt(r.ACH)} air changes per hour.`;
  }

  live(form, recalc);
  recalc();
}

// Last, so every declaration above is initialised before the calculator starts.
const form = document.getElementById('achcalc');
if (form) init(form);
