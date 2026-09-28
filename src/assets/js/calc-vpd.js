// The vapour pressure deficit calculator's form behaviour. The maths is in
// vpd.js; this reads the form and writes the results.
import { vpd, problem } from './vpd.js';
import { live, num, fmt, fillRows, shareable, startingValues, unitSwitch, TEMP, FT } from './calc-kit.js';

function init(form) {
  const el = id => document.getElementById(id);
  shareable(form, ['u', 't', 'hm', 'wb', 'rh', 'lf', 'z'], el('vp-share'), el('vp-copied'));
  // An older link with a wet bulb and no humidity opens on the wet bulb.
  const q = startingValues();
  if (!q.has('hm') && q.has('wb') && !q.has('rh')) form.querySelector('input[name="hm"][value="wb"]').checked = true;
  unitSwitch(form, 'u', [[el('vp-t'), TEMP], [el('vp-wb'), TEMP], [el('vp-leaf'), TEMP], [el('vp-alt'), FT]], 'Metric');

  function recalc() {
    const us = form.querySelector('input[name="u"]:checked')?.value !== 'Metric';
    for (const s of form.querySelectorAll('.vp-t')) s.textContent = us ? '°F' : '°C';
    el('vp-altu').textContent = us ? 'ft' : 'm';
    // Humidity comes from one input or the other, so the two can't disagree.
    const fromRh = form.querySelector('input[name="hm"]:checked')?.value !== 'wb';
    el('vp-rh-f').hidden = !fromRh;
    el('vp-wb-f').hidden = fromRh;
    const rhPct = fromRh ? num(el('vp-rh')) : null;
    const v = { units: us ? 'US' : 'Metric', room: num(el('vp-t')), wb: fromRh ? null : num(el('vp-wb')),
      rh: rhPct === null || Number.isNaN(rhPct) ? rhPct : rhPct / 100, altitude: num(el('vp-alt')), leaf: num(el('vp-leaf')) };
    const why = fromRh && rhPct === null && v.room !== null ? 'Enter the relative humidity.' : problem(v);
    if (why) {
      el('vp-summary').textContent = why;
      el('vp-table').hidden = true;
      return;
    }
    const r = vpd(v);
    const t = us ? '°F' : '°C';
    const rows = [['VPD, air', fmt(r.air, 2), 'kPa', 'cf-key']];
    if (r.leaf !== null) rows.push(['VPD, leaf', fmt(r.leaf, 2), 'kPa', 'cf-key']);
    rows.push(
      ['Dew point', fmt(r.dp, 1), t],
      fromRh ? ['Wet bulb', fmt(r.wb, 1), t] : ['Relative humidity', fmt(r.rh * 100, 1), '%'],
      ['Humidity ratio', fmt(r.W, us ? 5 : 3), us ? 'lb/lb' : 'g/kg'],
      ['Specific enthalpy', fmt(r.h, 2), us ? 'Btu/lb' : 'kJ/kg'],
      ['Specific volume', fmt(r.v, 4), us ? 'ft³/lb' : 'm³/kg'],
      ['Saturation vapor pressure', fmt(r.pws, 3), 'kPa'], ['Partial vapor pressure', fmt(r.pw, 3), 'kPa'],
      ['Atmospheric pressure', fmt(r.patm, 2), 'kPa'],
    );
    fillRows(el('vp-tbody'), rows);
    el('vp-table').hidden = false;
    el('vp-summary').textContent = `VPD ${fmt(r.air, 2)} kPa in the air`
      + (r.leaf !== null ? `, ${fmt(r.leaf, 2)} kPa at the leaf.` : '.');
  }

  live(form, recalc);
  recalc();
}

// Last, so every declaration above is initialised before the calculator starts.
const form = document.getElementById('vpcalc');
if (form) init(form);
