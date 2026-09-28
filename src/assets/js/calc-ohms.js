// Ohm's law with power: the form behaviour. The maths is in ohms.js; this reads
// the form and writes the results.
import { solve, problem } from './ohms.js';
import { live, num, fmt, fillRows, shareable } from './calc-kit.js';

function init(form) {
  const el = id => document.getElementById(id);
  const K = ['V', 'I', 'R', 'P'];
  shareable(form, ['v', 'i', 'r', 'p'], el('ohm-share'), el('ohm-copied'));

  function recalc() {
    const values = Object.fromEntries(K.map(k => [k, num(el(`ohm-${k}`))]));
    const why = problem(values);
    if (why) {
      el('ohm-summary').textContent = why;
      el('ohm-table').hidden = true;
      return;
    }
    const r = solve(Object.fromEntries(K.map(k => [k, values[k] ?? 0])));
    const given = k => (values[k] !== null ? 'is-given' : '');
    fillRows(el('ohm-tbody'), [
      ['Voltage, V', fmt(r.V), 'volts', given('V')],
      ['Current, I', fmt(r.I), 'amps', given('I')],
      ['Resistance, R', fmt(r.R), 'ohms', given('R')],
      ['Power, P', fmt(r.P), 'watts', given('P')],
    ]);
    el('ohm-table').hidden = false;
    el('ohm-summary').textContent = `${fmt(r.V)} V, ${fmt(r.I)} A, ${fmt(r.R)} Ω, ${fmt(r.P)} W.`;
  }

  live(form, recalc);
  recalc();
}

// Last, so every declaration above is initialised before the calculator starts.
const form = document.getElementById('ohmcalc');
if (form) init(form);
