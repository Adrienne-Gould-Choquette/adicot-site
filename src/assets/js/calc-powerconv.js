// The power unit converter's form behaviour. The conversions are in
// powerconv.js; this reads the form and writes the results.
import { convert, problem, UNITS } from './powerconv.js';
import { live, num, fmt, fillRows, shareable } from './calc-kit.js';

// Each unit's usual precision (from the old calculator), with four decimals for
// anything under one so that 900 Btu/h shows 0.0750 tons rather than 0.08.
function show(x, dp) { return fmt(x, x !== 0 && Math.abs(x) < 1 ? 4 : dp); }

function init(form) {
  const el = id => document.getElementById(id);
  shareable(form, ['v', 'u'], el('pw-share'), el('pw-copied'));

  function recalc() {
    const from = form.querySelector('input[name="u"]:checked')?.value ?? 'btuh';
    const v = num(el('pw-value'));
    const why = problem(v);
    if (why) {
      el('pw-summary').textContent = why;
      el('pw-table').hidden = true;
      return;
    }
    const r = convert(v, from);
    fillRows(el('pw-tbody'), UNITS.map(u => [u.unit, show(r[u.key], u.dp), '', u.key === from ? 'is-given' : '']));
    el('pw-table').hidden = false;
    const g = UNITS.find(u => u.key === from);
    const at = k => { const u = UNITS.find(x => x.key === k); return `${show(r[k], u.dp)} ${u.unit}`; };
    el('pw-summary').textContent = `${show(v, g.dp)} ${g.unit} = `
      + ['btuh', 'ton', 'kw', 'hp'].filter(k => k !== from).map(at).join(' = ') + '.';
  }

  live(form, recalc);
  recalc();
}

// Last, so every declaration above is initialised before the calculator starts.
const form = document.getElementById('pwcalc');
if (form) init(form);
