// The reheat coil sizing calculator's form behaviour. The maths is in reheat.js;
// this reads the form, relabels it, and writes the results.
import { capacity, problem } from './reheat.js';
import { live, num, fmt, fillRows, shareable, unitSwitch, CFM, TEMP } from './calc-kit.js';

function init(form) {
  const el = id => document.getElementById(id);
  const metric = () => form.querySelector('input[name="u"]:checked')?.value === 'Metric';

  shareable(form, ['u', 'q', 'tl', 'te'], el('rh-share'), el('rh-copied'));
  unitSwitch(form, 'u', [[el('rh-q'), CFM], [el('rh-tl'), TEMP], [el('rh-te'), TEMP]], 'Metric');

  function recalc() {
    const m = metric();
    const u = m ? { q: 'l/s', t: '°C' } : { q: 'cfm', t: '°F' };
    for (const s of form.querySelectorAll('.rh-q')) s.textContent = u.q;
    for (const s of form.querySelectorAll('.rh-t')) s.textContent = u.t;
    el('rh-q').placeholder = m ? '1416' : '3000';
    el('rh-tl').placeholder = m ? '21' : '70';
    el('rh-te').placeholder = m ? '11' : '52';

    const input = { units: m ? 'Metric' : 'US', airflow: num(el('rh-q')), leaving: num(el('rh-tl')), entering: num(el('rh-te')) };
    const why = problem(input);
    if (why) {
      el('rh-summary').textContent = why;
      el('rh-table').hidden = true;
      return;
    }
    const r = capacity(input);
    fillRows(el('rh-tbody'), [['Capacity', fmt(r.btuh), 'Btu/h', 'cf-key'], ['', fmt(r.kW), 'kW'], ['', fmt(r.W), 'W']]);
    el('rh-table').hidden = false;
    const what = r.btuh < 0 ? 'of heating' : r.btuh > 0 ? 'of cooling' : '';
    el('rh-summary').textContent = r.btuh === 0
      ? 'The entering and leaving temperatures are the same, so no reheat is needed.'
      : `${fmt(input.airflow)} ${u.q} from ${fmt(input.entering)} ${u.t} to ${fmt(input.leaving)} ${u.t} takes `
        + `${fmt(Math.abs(r.btuh))} Btu/h (${fmt(Math.abs(r.kW))} kW) ${what}.`;
  }

  live(form, recalc);
  recalc();
}

// Last, so every declaration above is initialised before the calculator starts.
const form = document.getElementById('rhcalc');
if (form) init(form);
