// The engineering economics calculator's form behaviour. The maths is in
// econ.js; this reads the form and writes the result.
import { solve, problem } from './econ.js';
import { live, num, fmt, fillRows, shareable } from './calc-kit.js';

const NAME = { F: 'Future value, F', P: 'Present value, P', A: 'Uniform series, A' };

function init(form) {
  const el = id => document.getElementById(id);
  shareable(form, ['find', 'p', 'f', 'a', 'g', 'i', 'n'], el('ec-share'), el('ec-copied'));

  function recalc() {
    const find = form.querySelector('input[name="find"]:checked')?.value ?? 'F';
    // The amount being found is not an input.
    for (const k of ['P', 'F', 'A']) el(`ec-${k}-field`).hidden = k === find;
    const rate = num(el('ec-i'));
    const v = { find, P: num(el('ec-P')), F: num(el('ec-F')), A: num(el('ec-A')), G: num(el('ec-G')),
      i: rate === null || Number.isNaN(rate) ? rate : rate / 100, n: num(el('ec-n')) };
    v[find] = null;
    const why = problem(v);
    if (why) {
      el('ec-summary').textContent = why;
      el('ec-table').hidden = true;
      return;
    }
    const zero = x => x ?? 0;
    const r = solve({ find, P: zero(v.P), F: zero(v.F), A: zero(v.A), G: zero(v.G), i: v.i, n: v.n });
    fillRows(el('ec-tbody'), [[NAME[find], fmt(r), '$', 'cf-key']]);
    el('ec-table').hidden = false;
    el('ec-summary').textContent = `${NAME[find].split(',')[0]} = $${fmt(r)} at ${fmt(rate, 3).replace(/\.?0+$/, '')} % per period over ${fmt(v.n, 0)} periods.`;
  }

  live(form, recalc);
  recalc();
}

// Last, so every declaration above is initialised before the calculator starts.
const form = document.getElementById('eccalc');
if (form) init(form);
