// The condensate converter's form behaviour. The conversions are in condconv.js;
// this reads the form and writes the results.
import { convert, problem, UNITS } from './condconv.js';
import { live, num, fmtAuto, fillRows, shareable } from './calc-kit.js';

function init(form) {
  const el = id => document.getElementById(id);
  shareable(form, ['v', 'u'], el('cc-share'), el('cc-copied'));

  function recalc() {
    const from = form.querySelector('input[name="u"]:checked')?.value ?? 'btuh';
    const v = num(el('cc-value'));
    const why = problem(v);
    if (why) {
      el('cc-summary').textContent = why;
      el('cc-table').hidden = true;
      return;
    }
    const r = convert(v, from);
    fillRows(el('cc-tbody'), UNITS.map(u => [u.name, fmtAuto(r[u.key]), u.unit, u.key === from ? 'is-given' : '']));
    el('cc-table').hidden = false;
    const given = UNITS.find(u => u.key === from);
    el('cc-summary').textContent = `${fmtAuto(v)} ${given.unit} is ${fmtAuto(r.pintsday)} pints/day `
      + `(${fmtAuto(r.galh)} gal/h) of water, or ${fmtAuto(r.btuh)} Btu/h of latent heat.`;
  }

  live(form, recalc);
  recalc();
}

// Last, so every declaration above is initialised before the calculator starts.
const form = document.getElementById('cccalc');
if (form) init(form);
