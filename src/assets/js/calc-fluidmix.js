// The fluid mixing calculator's form behaviour. The maths is in fluidmix.js; this
// reads the form, relabels it, and writes the results.
import { mix, problem, specificHeat, derived, OTHER } from './fluidmix.js';
import { live, num, fmt, fillRows, shareable, unitSwitch, TEMP } from './calc-kit.js';

function init(form) {
  const el = id => document.getElementById(id);
  const metric = () => form.querySelector('input[name="u"]:checked')?.value === 'Metric';
  const LB = 1 / 2.20462;   // kg per lb, the workbook's factor

  shareable(form, ['u', 'f1', 'c1', 't1', 'm1', 'f2', 'c2', 't2', 'm2'], el('fm-share'), el('fm-copied'));
  unitSwitch(form, 'u', [[el('fm-t1'), TEMP], [el('fm-t2'), TEMP], [el('fm-m1'), LB], [el('fm-m2'), LB]], 'Metric');

  const read = n => {
    const name = el(`fm-f${n}`).value;
    return { name, temp: num(el(`fm-t${n}`)), mass: num(el(`fm-m${n}`)), cp: name === OTHER ? num(el(`fm-cp${n}`)) : null };
  };

  function relabel() {
    const m = metric();
    const cpu = m ? 'kcal/kg·°C' : 'Btu/lb·°F';
    for (const s of form.querySelectorAll('.fm-tu')) s.textContent = m ? '°C' : '°F';
    for (const s of form.querySelectorAll('.fm-mu')) s.textContent = m ? 'kg' : 'lb';
    for (const s of form.querySelectorAll('.fm-cpu')) s.textContent = cpu;
    for (const n of [1, 2]) {
      const name = el(`fm-f${n}`).value;
      const other = name === OTHER;
      el(`fm-cp${n}-field`).hidden = !other;
      el(`fm-cp${n}`).required = other;
      const note = el(`fm-cp${n}-note`);
      if (name && !other) {
        const cp = specificHeat(name);
        note.textContent = `Specific heat ${Number(cp.toFixed(4))} ${cpu}`
          + (derived(name) ? ', from its kJ/kg·K value.' : '.');
      } else {
        note.textContent = '';
      }
    }
  }

  function recalc() {
    relabel();
    const f1 = read(1), f2 = read(2);
    const why = problem(f1, f2);
    if (why) {
      el('fm-summary').textContent = why;
      el('fm-table').hidden = true;
      return;
    }
    const m = metric();
    const r = mix(m ? 'Metric' : 'US', f1, f2);
    const u = m ? { t: '°C', m: 'kg', cp: 'kcal/kg·°C' } : { t: '°F', m: 'lb', cp: 'Btu/lb·°F' };
    fillRows(el('fm-tbody'), [
      ['Mixed temperature', fmt(r.temp), u.t, 'cf-key'],
      ['Mixed specific heat', fmt(r.cp, 3), u.cp],
      ['Total mass', fmt(r.mass), u.m],
    ]);
    el('fm-table').hidden = false;
    el('fm-summary').textContent = `The mix is ${fmt(r.mass)} ${u.m} at ${fmt(r.temp)} ${u.t}, `
      + `with a specific heat of ${fmt(r.cp, 3)} ${u.cp}.`;
  }

  live(form, recalc);
  recalc();
}

// Last, so every declaration above is initialised before the calculator starts.
const form = document.getElementById('fmcalc');
if (form) init(form);
