// The mechanical equipment wind pressure calculator's form behaviour. The maths is
// in windload.js; this reads the form and writes the results.
import { solve, problem } from './windload.js';
import { live, num, fmt, fillRows, shareable } from './calc-kit.js';

function init(form) {
  const el = id => document.getElementById(id);
  const pick = name => form.querySelector(`input[name="${name}"]:checked`)?.value;
  shareable(form, ['mn', 'rt', 'fl', 'c', 'rh', 'mt', 'mh', 'l', 'd', 'h', 'rc', 'ex', 'v'], el('wl-share'), el('wl-copied'));

  function recalc() {
    const rooftop = pick('rt') === 'yes';
    el('wl-roof').hidden = !rooftop;
    el('wl-ground').hidden = rooftop;
    el('wl-clear').required = el('wl-roofh').required = rooftop;
    el('wl-mh').required = !rooftop;

    const v = {
      rooftop, florida: rooftop && pick('fl') === 'yes', clearance: num(el('wl-clear')), roofHeight: num(el('wl-roofh')),
      mountHeight: num(el('wl-mh')), L: num(el('wl-l')), D: num(el('wl-d')), H: num(el('wl-h')),
      V: num(el('wl-v')), exposure: el('wl-exp').value,
    };
    const why = problem(v);
    if (why) {
      el('wl-summary').textContent = why;
      el('wl-table').hidden = true;
      el('wl-warn').hidden = true;
      return;
    }
    const r = solve(v);
    const rows = [
      ['Lateral pressure', '±' + fmt(r.lateral), 'psf', 'cf-key'],
      ['Uplift pressure', fmt(r.uplift), 'psf', 'cf-key'],
      ['Height above ground, z', fmt(r.z), 'ft'],
      ['Exposure coefficient, Kz', fmt(r.Kz, 3), ''],
      ['Velocity pressure, qz', fmt(r.qz), 'psf'],
    ];
    if (r.hvhz) rows.push(['HVHZ minimum clearance', `${r.hvhz.min}`, r.hvhz.ok ? 'in, OK' : 'in, NOT MET']);
    fillRows(el('wl-tbody'), rows);
    el('wl-table').hidden = false;

    const model = el('wl-model').value.trim() || 'Generic';
    const where = rooftop ? 'rooftop' : pick('mt').replace(' Mounted', '').toLowerCase() + '-mounted';
    el('wl-summary').textContent = `${model} ${where} equipment: lateral ±${fmt(r.lateral)} psf, `
      + `uplift ${fmt(r.uplift)} psf (ASD, ASCE 7-22).`;

    const warn = [];
    if (r.hvhz && !r.hvhz.ok) warn.push(`Insufficient clearance for HVHZ: the minimum is ${r.hvhz.min} in.`);
    if (r.unstable) warn.push('Warning: the calculator is not stable for equipment length / equipment height of 2 or more.');
    el('wl-warn').textContent = warn.join(' ');
    el('wl-warn').hidden = !warn.length;
  }

  live(form, recalc);
  recalc();
}

// Last, so every declaration above is initialised before the calculator starts.
const form = document.getElementById('wlcalc');
if (form) init(form);
