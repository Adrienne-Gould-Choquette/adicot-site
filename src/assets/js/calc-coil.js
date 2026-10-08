// The coil selection calculator's form behaviour: four tools, each solved as soon
// as its own inputs are complete. The air side's states come from psychsheet.js
// and its loads from airside.js (the exact ASHRAE method, as the psychrometric
// 2-condition calculator); face area, water flow and tube velocity from coil.js.
import { face, water, tubeVelocity } from './coil.js';
import { state, problem as stateProblem } from './psychsheet.js';
import { coilLoads, airflowFor, leavingForLoads, leavingForTotal, humidityAtDewPoint, sensibleLoad, latentLoad, leavingDryBulbFor, leavingDewPointFor } from './airside.js';
import { live, num, fmt, fillRows, shareable } from './calc-kit.js';

const NAMES = { water: { load: 'Heat load', flow: 'Water flow rate', entering: 'Entering water', leaving: 'Leaving water' } };
// Why no leaving air answers the loads given.
const SAYS = us => ({
  saturated: 'Those loads would take the leaving air past saturation: no leaving condition gives that sensible and total cooling at this airflow.',
  dry: 'Those loads would take more moisture out of the air than it holds at this airflow.',
  dewpoint: 'Air with that leaving dew point cannot give up that much heat at this airflow: it would be cooled below its dew point.',
  range: 'No leaving dry bulb between ' + (us ? '-40 and 150 °F' : '-40 and 65 °C') + ' gives that total cooling.',
});
const VAR = { entering: 1, leaving: 2, load: 3, flow: 4 };

function init(form) {
  const el = id => document.getElementById(id);
  const ids = ['af', 'am1', 'am2', 'e1', 'e2', 'x1', 'x2', 'aq', 'qs', 'ql', 'qt', 'alt', 'fh', 'fw', 'wf', 'fl', 'w1', 'w2', 'w3', 'w4', 'vq', 'vd', 'vn'];
  shareable(form, ['u', 'wc', ...ids], el('co-share'), el('co-copied'));
  // The moisture inputs' labels follow each state's "moisture as" choice.
  const setLabel = (id, text) => { const l = form.querySelector(`label[for="co-${id}"]`); if (l) l.firstChild.textContent = text + ' '; };

  function recalc() {
    const units = form.querySelector('input[name="u"]:checked')?.value ?? 'English';
    const us = units === 'English';
    const U = us
      ? { t: '°F', q: 'Btu/h', a: 'cfm', h: 'Btu/lb', w: 'gr/lb', d: 'in', g: 'gpm', td: 'in', l: 'ft', area: 'ft²', vel: 'fpm', tv: 'fps' }
      : { t: '°C', q: 'kW', a: 'l/s', h: 'kJ/kg', w: 'g/kg', d: 'mm', g: 'l/s', td: 'cm', l: 'm', area: 'm²', vel: 'm/s', tv: 'm/s' };
    // What tool 1 solves for: the loads, the airflow, or the leaving air, either
    // from both loads ('leave') or from the total and the leaving moisture ('ldb').
    const find = el('co-af').value;
    const findFlow = find === 'flow', findLeave = find === 'leave', findDb = find === 'ldb';
    // A total load at a fixed wet bulb barely moves with the dry bulb, so the
    // leaving dry bulb is solved against an RH or a dew point only.
    const wbOpt = el('co-am2').querySelector('option[value="db-wb"]');
    wbOpt.hidden = wbOpt.disabled = findDb;
    if (findDb && el('co-am2').value === 'db-wb') el('co-am2').value = 'db-rh';
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
    const show = (id, on) => { el('co-' + id).closest('.field').hidden = !on; };
    show('aq', !findFlow); show('qt', find !== 'loads'); show('qs', findLeave); show('ql', findLeave);
    show('x1', !findLeave && !findDb); show('x2', !findLeave); show('am2', !findLeave);
    let airflow = null;        // for the face velocity
    let totalCooling = null;   // for the water tool
    const altitude = num(el('co-alt')) ?? 0;
    const ent = { first: num(el('co-e1')), second: num(el('co-e2')) }, lev = { first: num(el('co-x1')), second: num(el('co-x2')) };
    const given = v => v !== null && !Number.isNaN(v);
    const psyUnits = us ? 'US' : 'Metric';
    const dq = us ? 0 : 2;     // decimals of a load
    const q = findFlow ? null : num(el('co-aq'));
    if (given(q) && q > 0) airflow = q;
    const entFull = given(ent.first) && given(ent.second);
    const w1 = entFull ? stateProblem({ mode: m1, ...ent, altitude }) : null;
    const a = entFull && !w1 ? state({ units: psyUnits, mode: m1, ...ent, altitude }) : null;
    if (w1) notes.push(w1.replace('.', ' (entering air).'));
    // The entering humidity ratio, lb/lb: from the whole state, or from a dew
    // point alone, which needs no dry bulb.
    const W1 = a ? a.ip.W : !given(ent.first) && m1 === 'db-dp' && given(ent.second) ? humidityAtDewPoint(psyUnits, ent.second, altitude) : null;
    const grains = W => fmt(us ? W * 7000 : W * 1000, us ? 1 : 2);
    const DRY = 'With no moisture entered, the sensible cooling takes the air as dry, which runs up to about 1 % high for humid air; enter the moisture at both ends for the exact loads.';
    const AT_DEW = 'With no dry bulb, the latent cooling takes the air at its dew point, which runs about 3 to 4 % high for a typical cooling coil; enter the dry bulbs for the exact loads.';

    // The leaving air, when it is the unknown: found from the entering air, the
    // airflow and the loads, then carried through the same results as a given one.
    let levMode = m2, solved = false;
    if (findLeave && airflow !== null && !w1) {
      let qs = num(el('co-qs')), ql = num(el('co-ql')), qt = num(el('co-qt'));
      const n = [qs, ql, qt].filter(given).length;
      if (n === 3 && Math.abs(qs + ql - qt) > 0.005 * Math.max(Math.abs(qs), Math.abs(ql), Math.abs(qt))) {
        notes.push('The sensible and latent cooling do not add up to the total: clear one of the three.');
      } else if (n >= 2) {
        // Any two of the three loads fix the leaving air.
        if (!given(qt)) qt = qs + ql;
        if (!given(qs)) qs = qt - ql;
        if (a) {
          const r = leavingForLoads(psyUnits, a, airflow, qs, qt, altitude);
          if (r.problem) notes.push(SAYS(us)[r.problem]);
          else { lev.first = r.db; lev.second = r.rh; levMode = 'db-rh'; solved = true; }
        }
      } else if (given(qs) && given(ent.first)) {
        // The sensible load alone gives the leaving dry bulb.
        rows.push(['Leaving dry bulb', fmt(leavingDryBulbFor(psyUnits, ent.first, airflow, qs, altitude, W1), 1), U.t, 'cf-key']);
        notes.push(W1 === null ? DRY : 'The sensible cooling alone gives the leaving dry bulb, with the entering moisture taken as unchanged; add the latent or total cooling for the leaving moisture.');
      } else if (given(ql) && W1 !== null) {
        // The latent load alone gives the leaving dew point.
        const r = leavingDewPointFor(psyUnits, W1, airflow, ql, altitude, given(ent.first) ? ent.first : null);
        if (r.problem) notes.push(SAYS(us).dry);
        else {
          rows.push(['Leaving dew point', fmt(r.dewPoint, 1), U.t, 'cf-key'], ['Entering humidity ratio', grains(W1), U.w], ['Leaving humidity ratio', grains(r.W), U.w]);
          notes.push(given(ent.first) ? 'The latent cooling alone gives the leaving dew point, with the leaving air taken at that dew point; add the sensible or total cooling for the leaving dry bulb.' : AT_DEW);
        }
      }
    }
    if (findDb && a && airflow !== null) {
      const qt = num(el('co-qt'));
      if (given(qt) && given(lev.second)) {
        if (m2 === 'db-rh' && !(lev.second > 0 && lev.second <= 100)) notes.push('The relative humidity must be more than 0 and at most 100 % (leaving air).');
        else {
          const r = leavingForTotal(psyUnits, a, m2, lev.second, airflow, qt, altitude);
          if (r.problem) notes.push(SAYS(us)[r.problem]);
          else { lev.first = r.db; solved = true; }
        }
      }
    }

    const finding = findLeave || findDb;
    const levFull = given(lev.first) && given(lev.second) && (!finding || solved);
    const w2 = levFull ? stateProblem({ mode: levMode, ...lev, altitude }) : null;
    if (w2 && !w1) notes.push(w2.replace('.', ' (leaving air).'));
    if (a && levFull && !w2) {
      const b = state({ units: psyUnits, mode: levMode, ...lev, altitude });
      if (solved) {
        rows.push(['Leaving dry bulb', fmt(b.db, 1), U.t, 'cf-key']);
        if (findLeave || m2 !== 'db-wb') rows.push(['Leaving wet bulb', fmt(b.wb, 1), U.t, findLeave ? 'cf-key' : undefined]);
        if (findLeave || m2 !== 'db-rh') rows.push(['Leaving RH', fmt(b.rh, 0), '%']);
        if (findLeave || m2 !== 'db-dp') rows.push(['Leaving dew point', fmt(b.dp, 1), U.t]);
      }
      const wa = us ? a.grains : a.W, wb = us ? b.grains : b.W;   // gr/lb or g/kg
      rows.push(['Entering air enthalpy', fmt(a.h, 2), U.h], ['Leaving air enthalpy', fmt(b.h, 2), U.h],
        ['Entering humidity ratio', fmt(wa, us ? 1 : 2), U.w], ['Leaving humidity ratio', fmt(wb, us ? 1 : 2), U.w]);
      if (findFlow) {
        const qt = num(el('co-qt'));
        if (given(qt)) {
          const flow = airflowFor(psyUnits, a, b, qt);
          if (flow !== null) { airflow = flow; rows.push(['Airflow for the total cooling', fmt(flow, us ? 0 : 1), U.a, 'cf-key']); }
          else notes.push('The leaving air must hold less heat than the entering air to remove that load.');
        }
      }
      if (airflow !== null) {
        const r = coilLoads(psyUnits, a, b, airflow);
        const qs = r.sensible, ql = r.latent, qtot = r.total;
        if (qtot > 0) totalCooling = qtot;
        rows.push(['Sensible cooling', fmt(qs, dq), U.q], ['Latent cooling', fmt(ql, dq), U.q], ['Total cooling', fmt(qtot, dq), U.q, find === 'loads' ? 'cf-key' : undefined]);
        if (r.shr !== null && qtot > 0) rows.push(['Sensible heat ratio', fmt(r.shr, 2), '']);
        if (qs < 0 || qtot < 0) notes.push('A negative load denotes heating.');
        if (ql < 0) notes.push('A negative latent load denotes adding moisture.');
      }
    } else if (find === 'loads' && airflow !== null && !w1 && !w2) {
      // Part of the conditions: the dry bulbs alone give the sensible cooling, and
      // the moisture at each end alone gives the latent.
      const b = levFull ? state({ units: psyUnits, mode: m2, ...lev, altitude }) : null;
      const W2 = b ? b.ip.W : !given(lev.first) && m2 === 'db-dp' && given(lev.second) ? humidityAtDewPoint(psyUnits, lev.second, altitude) : null;
      const bothDb = given(ent.first) && given(lev.first);
      if (bothDb) {
        const qs = sensibleLoad(psyUnits, ent.first, lev.first, airflow, altitude, W1, W2);
        rows.push(['Sensible cooling', fmt(qs, dq), U.q, 'cf-key']);
        notes.push(W1 === null ? DRY : 'The sensible cooling takes the entering moisture as unchanged through the coil; enter the leaving moisture for the latent and total cooling.');
        if (qs < 0) notes.push('A negative load denotes heating.');
      }
      if (W1 !== null && W2 !== null) {
        const ql = latentLoad(psyUnits, W1, W2, airflow, altitude, given(ent.first) ? ent.first : null, given(lev.first) ? lev.first : null);
        rows.push(['Latent cooling', fmt(ql, dq), U.q, 'cf-key'], ['Entering humidity ratio', grains(W1), U.w], ['Leaving humidity ratio', grains(W2), U.w]);
        if (!given(ent.first)) notes.push(AT_DEW);
        else if (!bothDb) notes.push('With no leaving dry bulb, the latent cooling takes the leaving air at its dew point, which changes it by well under 1 %; enter the leaving dry bulb for the exact loads.');
        if (ql < 0) notes.push('A negative latent load denotes adding moisture.');
      } else if (!bothDb && given(ent.second) && given(lev.second)) {
        notes.push('A wet bulb or an RH does not fix the moisture in the air without its dry bulb. For the latent cooling alone, give the moisture at both ends as dew points; otherwise enter the dry bulbs too.');
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
