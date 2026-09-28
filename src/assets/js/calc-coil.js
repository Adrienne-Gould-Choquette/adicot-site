// The coil selection calculator's form behaviour: four tools, each solved as soon
// as its own inputs are complete. The air side's states come from psychsheet.js
// and its loads from airside.js (the exact ASHRAE method, as the psychrometric
// 2-condition calculator); face area, water flow and tube velocity from coil.js.
import { face, water, tubeVelocity } from './coil.js';
import { state, problem as stateProblem } from './psychsheet.js';
import { coilLoads, airflowFor } from './airside.js';
import { live, num, fmt, fillRows, shareable } from './calc-kit.js';

const NAMES = { water: { load: 'Heat load', flow: 'Water flow rate', entering: 'Entering water', leaving: 'Leaving water' } };
const VAR = { entering: 1, leaving: 2, load: 3, flow: 4 };

function init(form) {
  const el = id => document.getElementById(id);
  const ids = ['af', 'am1', 'am2', 'e1', 'e2', 'x1', 'x2', 'aq', 'qt', 'alt', 'fh', 'fw', 'wf', 'fl', 'w1', 'w2', 'w3', 'w4', 'vq', 'vd', 'vn'];
  shareable(form, ['u', 'wc', ...ids], el('co-share'), el('co-copied'));
  // The moisture inputs' labels follow each state's "moisture as" choice.
  const setLabel = (id, text) => { const l = form.querySelector(`label[for="co-${id}"]`); if (l) l.firstChild.textContent = text + ' '; };

  function recalc() {
    const units = form.querySelector('input[name="u"]:checked')?.value ?? 'English';
    const us = units === 'English';
    const U = us
      ? { t: '°F', q: 'Btu/h', a: 'cfm', h: 'Btu/lb', w: 'gr/lb', d: 'in', g: 'gpm', td: 'in', l: 'ft', area: 'ft²', vel: 'fpm', tv: 'fps' }
      : { t: '°C', q: 'kW', a: 'l/s', h: 'kJ/kg', w: 'g/kg', d: 'mm', g: 'l/s', td: 'cm', l: 'm', area: 'm²', vel: 'm/s', tv: 'm/s' };
    const m1 = el('co-am1').value, m2 = el('co-am2').value;
    const WORD = { 'db-wb': 'wet bulb', 'db-rh': 'RH', 'db-dp': 'dew point' };
    U.m1 = m1 === 'db-rh' ? '%' : U.t; U.m2 = m2 === 'db-rh' ? '%' : U.t;
    for (const [cls, k] of [['co-t', 't'], ['co-q', 'q'], ['co-a', 'a'], ['co-d', 'd'], ['co-g', 'g'], ['co-td', 'td'], ['co-l', 'l'], ['co-m1', 'm1'], ['co-m2', 'm2']]) {
      for (const s of form.querySelectorAll('.' + cls)) s.textContent = U[k];
    }
    setLabel('e2', 'Entering ' + WORD[m1]);
    setLabel('x2', 'Leaving ' + WORD[m2]);
    const rows = [], notes = [];

    // Tool 1: the coil's air side, from the entering and leaving air conditions.
    const findFlow = el('co-af').value === 'flow';
    el('co-aq').closest('.field').hidden = findFlow;
    el('co-qt').closest('.field').hidden = !findFlow;
    let airflow = null;        // for the face velocity
    let totalCooling = null;   // for the water tool
    const altitude = num(el('co-alt')) ?? 0;
    const ent = { first: num(el('co-e1')), second: num(el('co-e2')) }, lev = { first: num(el('co-x1')), second: num(el('co-x2')) };
    const given = v => v !== null && !Number.isNaN(v);
    if ([ent.first, ent.second, lev.first, lev.second].every(given)) {
      const w1 = stateProblem({ mode: m1, ...ent, altitude }), w2 = stateProblem({ mode: m2, ...lev, altitude });
      if (w1 || w2) notes.push(w1 ? w1.replace('.', ' (entering air).') : w2.replace('.', ' (leaving air).'));
      else {
        const psyUnits = us ? 'US' : 'Metric';
        const a = state({ units: psyUnits, mode: m1, ...ent, altitude }), b = state({ units: psyUnits, mode: m2, ...lev, altitude });
        const wa = us ? a.grains : a.W, wb = us ? b.grains : b.W;   // gr/lb or g/kg
        rows.push(['Entering air enthalpy', fmt(a.h, 2), U.h], ['Leaving air enthalpy', fmt(b.h, 2), U.h],
          ['Entering humidity ratio', fmt(wa, us ? 1 : 2), U.w], ['Leaving humidity ratio', fmt(wb, us ? 1 : 2), U.w]);
        if (findFlow) {
          const qt = num(el('co-qt'));
          if (given(qt)) {
            const q = airflowFor(psyUnits, a, b, qt);
            if (q !== null) { airflow = q; rows.push(['Airflow for the total cooling', fmt(q, us ? 0 : 1), U.a, 'cf-key']); }
            else notes.push('The leaving air must hold less heat than the entering air to remove that load.');
          }
        } else {
          const q = num(el('co-aq'));
          if (given(q) && q > 0) airflow = q;
        }
        if (airflow !== null) {
          const r = coilLoads(psyUnits, a, b, airflow);
          const qs = r.sensible, ql = r.latent, qtot = r.total;
          if (qtot > 0) totalCooling = qtot;
          rows.push(['Sensible cooling', fmt(qs, us ? 0 : 2), U.q], ['Latent cooling', fmt(ql, us ? 0 : 2), U.q], ['Total cooling', fmt(qtot, us ? 0 : 2), U.q, findFlow ? undefined : 'cf-key']);
          if (r.shr !== null && qtot > 0) rows.push(['Sensible heat ratio', fmt(r.shr, 2), '']);
          if (qs < 0 || qtot < 0) notes.push('A negative load denotes heating.');
          if (ql < 0) notes.push('A negative latent load denotes adding moisture.');
        }
      }
    }

    // Tool 3: water and glycol; the variable being solved for is not an input. A
    // blank heat load takes the air side's total cooling.
    let waterFlow = null;   // for the tube velocity
    {
      const f = el('co-wf').value;
      for (const [v, n] of Object.entries(VAR)) el(`co-w${n}`).closest('.field').hidden = v === f;
      const vals = Object.fromEntries(Object.entries(VAR).filter(([v]) => v !== f).map(([v, n]) => [v, num(el(`co-w${n}`))]));
      const loadLinked = f !== 'load' && vals.load === null && totalCooling !== null;
      if (loadLinked) vals.load = totalCooling;
      el('co-w3').placeholder = totalCooling !== null ? fmt(totalCooling, us ? 0 : 2) : (us ? '240000' : '70');
      if (!Object.values(vals).some(x => x === null || Number.isNaN(x))) {
        const coil = form.querySelector('input[name="wc"]:checked')?.value ?? 'Cooling';
        const r = water(units, f, el('co-fluid').value, vals, coil);
        if (Number.isFinite(r)) {
          rows.push([NAMES.water[f], fmt(r, f === 'load' ? (us ? 0 : 2) : 2), f === 'load' ? U.q : f === 'flow' ? U.g : U.t, 'cf-key']);
          if (loadLinked) notes.push("The water tool uses the air side's total cooling as its heat load; enter a heat load to override it.");
        }
        waterFlow = f === 'flow' ? r : vals.flow;
        if (!(waterFlow > 0)) waterFlow = null;
      }
    }
    // Tool 2: face area, and face velocity with the air side's airflow.
    const fh = num(el('co-fh')), fw = num(el('co-fw'));
    if (fh > 0 && fw > 0) {
      const r = face(units, fh, fw, airflow ?? 0);
      rows.push(['Coil face area', fmt(r.area, 2), U.area]);
      if (airflow > 0) rows.push(['Coil face velocity', fmt(r.velocity, us ? 0 : 2), U.vel, 'cf-key']);
    }
    // Tool 4: water velocity in the tubes. A blank flow takes the water tool's flow.
    const vd = num(el('co-vd')), vn = num(el('co-vn'));
    let vq = num(el('co-vq'));
    el('co-vq').placeholder = waterFlow !== null ? fmt(waterFlow, 2) : (us ? '48' : '3');
    const flowLinked = vq === null && waterFlow !== null;
    if (flowLinked) vq = waterFlow;
    if (vq > 0 && vd > 0 && vn > 0) {
      rows.push(['Water velocity in tubes', fmt(tubeVelocity(units, vq, vd, vn), 2), U.tv, 'cf-key']);
      if (flowLinked) notes.push("The tube velocity uses the water tool's flow; enter a flow rate to override it.");
    }

    fillRows(el('co-tbody'), rows);
    el('co-summary').textContent = rows.length
      ? rows.filter(r => !/enthalpy|humidity ratio/.test(r[0])).map(([l, v, u]) => `${l} ${v}${u ? " " + u : ""}`).join('; ') + '.'
      : 'Fill in any of the tools; each result appears as soon as its inputs are complete.';
    el('co-note').textContent = notes.join(' ');
    el('co-note').hidden = !notes.length;
  }

  live(form, recalc);
  recalc();
}

// Last, so every declaration above is initialised before the calculator starts.
const form = document.getElementById('cocalc');
if (form) init(form);
