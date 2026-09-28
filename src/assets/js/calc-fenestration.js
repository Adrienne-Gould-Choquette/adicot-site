// The default fenestration and door values lookup. The tables are in
// fenestration.js; this reads the form and writes the results.
import { window as lookup, door } from './fenestration.js';
import { live, fillRows, shareable } from './calc-kit.js';

function init(form) {
  const el = id => document.getElementById(id);
  const pick = name => form.querySelector(`input[name="${name}"]:checked`)?.value;
  shareable(form, ['f', 'p', 'g', 'd'], el('fn-share'), el('fn-copied'));

  function recalc() {
    const frame = el('fn-frame').value, panes = pick('p'), glazing = pick('g');
    const w = lookup(frame, panes, glazing);
    const dt = el('fn-door').value, du = door(dt);
    fillRows(el('fn-tbody'), [
      ['U-factor', String(w.U), 'Btu/h·ft²·°F'],
      ['Solar heat gain coefficient, SHGC', String(w.SHGC), ''],
      ['Visible transmittance, VT', String(w.VT), ''],
      ['Door U-factor', String(du), 'Btu/h·ft²·°F'],
    ]);
    el('fn-table').hidden = false;
    el('fn-summary').textContent = `${frame}, ${panes.toLowerCase()}, ${glazing.toLowerCase()}: `
      + `U-factor ${w.U}, SHGC ${w.SHGC}, VT ${w.VT}. ${dt} door: U-factor ${du}.`;
  }

  live(form, recalc);
  recalc();
}

// Last, so every declaration above is initialised before the calculator starts.
const form = document.getElementById('fncalc');
if (form) init(form);
