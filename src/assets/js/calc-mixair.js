// The air mixing calculator's form behaviour. The maths is in mixair.js; this
// reads the form, relabels it, and writes the results.
import { mix, problem } from './mixair.js';
import { live, num, fmt, fillRows, shareable, unitSwitch, CFM, TEMP } from './calc-kit.js';

function init(form) {
  const el = id => document.getElementById(id);
  const K = ['o', 'r', 'x'];
  const field = (k, p) => el(`mx-${k}${p}`);
  const si = () => form.querySelector('input[name="u"]:checked')?.value === 'SI';

  shareable(form, ['u', ...K.flatMap(k => [`${k}q`, `${k}db`, `${k}wb`])], el('mx-share'), el('mx-copied'));
  unitSwitch(form, 'u', K.flatMap(k => [[field(k, 'q'), CFM], [field(k, 'db'), TEMP], [field(k, 'wb'), TEMP]]));

  function recalc() {
    const u = si() ? { q: 'l/s', t: '°C' } : { q: 'cfm', t: '°F' };
    for (const s of form.querySelectorAll('.mx-q')) s.textContent = u.q;
    for (const s of form.querySelectorAll('.mx-t')) s.textContent = u.t;

    const streams = K.map(k => ({ q: num(field(k, 'q')), db: num(field(k, 'db')), wb: num(field(k, 'wb')) }));
    const why = problem(streams);
    if (why) {
      el('mx-summary').textContent = why;
      el('mx-table').hidden = true;
      return;
    }
    // A blank third stream contributes nothing, as in the workbook.
    const r = mix(streams.map(s => ({ q: s.q ?? 0, db: s.db ?? 0, wb: s.wb ?? 0 })));
    fillRows(el('mx-tbody'), [
      ['Total air flow', fmt(r.total), u.q],
      ['Mixed air dry bulb', fmt(r.db), u.t, 'cf-key'],
      ['Mixed air wet bulb', fmt(r.wb), u.t],
    ]);
    el('mx-table').hidden = false;
    el('mx-summary').textContent =
      `${fmt(r.total)} ${u.q} mixes to ${fmt(r.db)} ${u.t} dry bulb, ${fmt(r.wb)} ${u.t} wet bulb.`;
  }

  live(form, recalc);
  recalc();
}

// Last, so every declaration above is initialised before the calculator starts.
const form = document.getElementById('mixcalc');
if (form) init(form);
