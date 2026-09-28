// FPM to CFM through a diffuser: the form behaviour. The maths is in
// diffuser.js; this reads the form, relabels it, and writes the results.
import { solve, problem, typicalNet } from './diffuser.js';
import { live, num, fmt, fillRows, shareable, unitSwitch, CFM } from './calc-kit.js';

const FPM = 0.00508;   // m/s per fpm, exact

function init(form) {
  const el = id => document.getElementById(id);
  const pick = name => form.querySelector(`input[name="${name}"]:checked`)?.value;
  shareable(form, ['u', 'k', 'v', 'm', 'l', 'w', 'c', 'a', 'n'], el('df-share'), el('df-copied'));
  unitSwitch(form, 'u', [
    [el('df-v'), () => (pick('k') === 'V' ? CFM : FPM)],
    [el('df-l'), 2.54], [el('df-w'), 2.54], [el('df-core'), 0.09290304], [el('df-net'), 0.09290304],
  ], 'Metric');

  function recalc() {
    const us = pick('u') === 'English', find = pick('k'), mode = pick('m');
    el('df-v-label').textContent = find === 'V' ? 'Air flow rate' : 'Velocity';
    el('df-v-u').textContent = find === 'V' ? (us ? 'cfm' : 'l/s') : (us ? 'fpm' : 'm/s');
    for (const s of form.querySelectorAll('.df-len')) s.textContent = us ? 'in' : 'cm';
    for (const s of form.querySelectorAll('.df-area')) s.textContent = us ? 'ft²' : 'm²';
    el('df-lw').hidden = mode !== 'lw';
    el('df-core-field').hidden = mode !== 'core';
    el('df-ak-field').hidden = mode === 'net';
    el('df-net-field').hidden = mode !== 'net';
    el('df-l').required = el('df-w').required = mode === 'lw';
    el('df-core').required = mode === 'core';
    el('df-ak').required = mode !== 'net';
    el('df-net').required = mode === 'net';

    const v = { units: us ? 'English' : 'Metric', find, mode, value: num(el('df-v')), L: num(el('df-l')),
      W: num(el('df-w')), core: num(el('df-core')), Ak: mode === 'net' ? null : num(el('df-ak')), net: num(el('df-net')) };
    // The workbook's typical net free area for the core size (US sizes only).
    el('df-typical').textContent = us && v.L > 0 && v.W > 0
      ? `A ${fmt(v.L, 0)} × ${fmt(v.W, 0)} in core typically has about ${typicalNet(v.L, v.W)} ft² of net free area.` : '';

    const why = problem(v);
    if (why) {
      el('df-summary').textContent = why;
      el('df-table').hidden = true;
      return;
    }
    const r = solve(v);
    const out = find === 'V' ? ['Velocity', us ? 'fpm' : 'm/s'] : ['Air flow rate', us ? 'cfm' : 'l/s'];
    fillRows(el('df-tbody'), [
      [out[0], fmt(r.result, us ? 0 : 2), out[1], 'cf-key'],
      ['Net free area', fmt(r.area, 3), us ? 'ft²' : 'm²'],
    ]);
    el('df-table').hidden = false;
    el('df-summary').textContent = `${out[0]}: ${fmt(r.result, us ? 0 : 2)} ${out[1]} through ${fmt(r.area, 3)} ${us ? 'ft²' : 'm²'} of net free area.`;
  }

  live(form, recalc);
  recalc();
}

// Last, so every declaration above is initialised before the calculator starts.
const form = document.getElementById('dfcalc');
if (form) init(form);
