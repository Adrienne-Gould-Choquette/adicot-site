// Annual cooling cost: the form behaviour. The maths is in annualcost.js; this
// reads the form, keeps the hours in step with the chosen location, and writes
// the results.
import { annualCost, problem } from './annualcost.js';
import { combobox } from './combobox.js';
import { live, num, fmt, fillRows, shareable } from './calc-kit.js';

function init(form) {
  const el = id => document.getElementById(id);
  shareable(form, ['c', 'r', 's', 'e', 'city', 'h', 'rate'], el('ac-share'), el('ac-copied'));
  // A location fills in its hours; typing other hours means "my own hours".
  const hoursOf = () => Number(el('ac-city').selectedOptions[0]?.dataset.hours ?? NaN);
  // Blank fields are not remembered, so a cleared location comes back as the
  // default one; hours that are not that location's mean the user's own.
  if (el('ac-city').value && num(el('ac-h')) !== hoursOf()) el('ac-city').value = '';
  const cities = combobox(el('ac-city'), { placeholder: 'Type a city, or show all' });
  el('ac-city').addEventListener('change', () => { if (!Number.isNaN(hoursOf())) el('ac-h').value = String(hoursOf()); });
  el('ac-h').addEventListener('input', () => {
    if (el('ac-city').value && num(el('ac-h')) !== hoursOf()) { el('ac-city').value = ''; cities.refresh(); }
  });
  form.addEventListener('reset', () => setTimeout(() => cities.refresh(), 0));

  function recalc() {
    const rating = form.querySelector('input[name="r"]:checked')?.value === 'SEER2' ? 'SEER2' : 'SEER';
    el('ac-s-l').textContent = rating;
    el('ac-e-f').hidden = rating !== 'SEER2';
    const v = { capacity: num(el('ac-c')), rating, value: num(el('ac-s')), equipment: el('ac-e').value,
      hours: num(el('ac-h')), rate: num(el('ac-rate')) };
    const why = problem(v);
    if (why) {
      el('ac-summary').textContent = why;
      el('ac-table').hidden = true;
      return;
    }
    const r = annualCost(v);
    const $ = x => '$' + fmt(x, 2);
    const rows = [];
    if (rating === 'SEER2') rows.push([`SEER (from SEER2 ${fmt(v.value, 1)}, ${v.equipment.toLowerCase()})`, fmt(r.seer, 2), '']);
    rows.push(['Average power at full load', fmt(r.watts, 0), 'W'],
      ['Annual cooling energy', fmt(r.kwh, 0), 'kWh/yr'],
      ['Annual cooling cost', $(r.cost), '/yr', 'cf-key'],
      ['Average per month', $(r.monthly), '/mo']);
    fillRows(el('ac-tbody'), rows);
    el('ac-table').hidden = false;
    const opt = el('ac-city').selectedOptions[0];
    const place = el('ac-city').value ? `in ${opt.textContent}, ${opt.parentElement.label}` : `with ${fmt(v.hours, 0)} full-load cooling hours`;
    el('ac-summary').textContent = `About ${$(r.cost)} a year to cool (${fmt(r.kwh, 0)} kWh) ${place}, at $${v.rate}/kWh.`;
  }

  live(form, recalc);
  recalc();
}

// Last, so every declaration above is initialised before the calculator starts.
const form = document.getElementById('accalc');
if (form) init(form);
