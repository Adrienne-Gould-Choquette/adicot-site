// The coil selection calculator's form behaviour: four tools, each solved as soon
// as its own inputs are complete. The air side's states come from psychsheet.js
// and its loads from airside.js (the exact ASHRAE method, as the psychrometric
// 2-condition calculator); face area, water flow and tube velocity from coil.js.
import { face, water, tubeVelocity } from './coil.js';
import { state, problem as stateProblem } from './psychsheet.js';
import { coilLoads, airflowFor, leavingForLoads, leavingForTotal, humidityAtDewPoint, sensibleLoad, latentLoad, leavingDryBulbFor, leavingDewPointFor, enteringForLoads, enteringForTotal, enteringDryBulbFor, enteringDewPointFor } from './airside.js';
import { live, num, fmt, fillRows, shareable } from './calc-kit.js';

const NAMES = { water: { load: 'Heat load', flow: 'Water flow rate', entering: 'Entering water', leaving: 'Leaving water' } };
// Why no leaving (or entering) air answers the loads given.
const SAYS = (us, entering) => ({
  saturated: `Those loads would ${entering ? 'need entering air' : 'take the leaving air'} past saturation: no ${entering ? 'entering' : 'leaving'} condition gives that sensible and total cooling at this airflow.`,
  dry: entering ? 'Those loads would need entering air holding less than no moisture: check the latent cooling and its sign.'
    : 'Those loads would take more moisture out of the air than it holds at this airflow.',
  dewpoint: entering ? 'Air entering at that dew point gives more than that total cooling even when it enters saturated: the dew point, the airflow or the load has to change.'
    : 'Air with that leaving dew point cannot give up that much heat at this airflow: it would be cooled below its dew point.',
  range: `No ${entering ? 'entering' : 'leaving'} dry bulb between ${us ? '-40 and 150 °F' : '-40 and 65 °C'} gives that total cooling.`,
});
const VAR = { entering: 1, leaving: 2, load: 3, flow: 4 };

function init(form) {
  const el = id => document.getElementById(id);
  const ids = ['af', 'am1', 'am2', 'e1', 'e2', 'x1', 'x2', 'aq', 'qs', 'ql', 'qt', 'alt', 'fh', 'fw', 'wf', 'fl', 'w1', 'w2', 'w3', 'w4', 'vq', 'vd', 'vn'];
  shareable(form, ['u', 'wc', ...ids], el('co-share'), el('co-copied'));

  function recalc() {
    const units = form.querySelector('input[name="u"]:checked')?.value ?? 'English';
    const us = units === 'English';
    const U = us
      ? { t: '°F', q: 'Btu/h', a: 'cfm', h: 'Btu/lb', w: 'gr/lb', d: 'in', g: 'gpm', td: 'in', l: 'ft', area: 'ft²', vel: 'fpm', tv: 'fps' }
      : { t: '°C', q: 'kW', a: 'l/s', h: 'kJ/kg', w: 'g/kg', d: 'mm', g: 'l/s', td: 'cm', l: 'm', area: 'm²', vel: 'm/s', tv: 'm/s' };
    // What tool 1 solves for: the loads, the airflow, or the air at one end of the
    // coil, either from the loads ('leave', 'enter') or from the total and that
    // end's moisture ('ldb', 'edb').
    const find = el('co-af').value;
    const findFlow = find === 'flow', findLeave = find === 'leave', findDb = find === 'ldb', findEnter = find === 'enter', findEdb = find === 'edb';
    // A total load at a fixed wet bulb barely moves with the dry bulb, so a dry
    // bulb is solved against an RH or a dew point only.
    for (const [id, off] of [['co-am1', findEdb], ['co-am2', findDb]]) {
      const wbOpt = el(id).querySelector('option[value="db-wb"]');
      wbOpt.hidden = wbOpt.disabled = off;
      if (off && el(id).value === 'db-wb') el(id).value = 'db-rh';
    }
    const m1 = el('co-am1').value, m2 = el('co-am2').value;
    U.m1 = m1 === 'db-rh' ? '%' : U.t; U.m2 = m2 === 'db-rh' ? '%' : U.t;
    for (const [cls, k] of [['co-t', 't'], ['co-q', 'q'], ['co-a', 'a'], ['co-d', 'd'], ['co-g', 'g'], ['co-td', 'td'], ['co-l', 'l'], ['co-m1', 'm1'], ['co-m2', 'm2']]) {
      for (const s of form.querySelectorAll('.' + cls)) s.textContent = U[k];
    }
    const rows = [], notes = [];

    // Tool 1: the coil's air side, from the entering and leaving air conditions.
    const show = (id, on) => { el('co-' + id).closest('.field').hidden = !on; };
    const fromLoads = findLeave || findEnter;        // an end of the coil, from the loads
    const side = findLeave || findDb ? 'lev' : findEnter || findEdb ? 'ent' : null;   // the end being solved for
    show('aq', !findFlow); show('qt', find !== 'loads'); show('qs', fromLoads || findFlow); show('ql', fromLoads || findFlow);
    show('e1', side !== 'ent'); show('e2', !findEnter); show('am1', !findEnter);
    show('x1', side !== 'lev'); show('x2', !findLeave); show('am2', !findLeave);
    let airflow = null;        // for the face velocity
    let totalCooling = null;   // for the water tool
    const altitude = num(el('co-alt')) ?? 0;
    const ent = { first: num(el('co-e1')), second: num(el('co-e2')) }, lev = { first: num(el('co-x1')), second: num(el('co-x2')) };
    const given = v => v !== null && !Number.isNaN(v);
    const psyUnits = us ? 'US' : 'Metric';
    const dq = us ? 0 : 2;     // decimals of a load
    const q = findFlow ? null : num(el('co-aq'));
    if (given(q) && q > 0) airflow = q;
    // A state from its two inputs: null when either is missing, or with a note
    // when they cannot be (a wet bulb above the dry bulb, say).
    let bad = false;
    const known = (mode, s, which) => {
      if (!given(s.first) || !given(s.second)) return null;
      const w = stateProblem({ mode, ...s, altitude });
      if (w) { if (!bad) notes.push(w.replace('.', ` (${which} air).`)); bad = true; return null; }
      return state({ units: psyUnits, mode, ...s, altitude });
    };
    let a = side === 'ent' ? null : known(m1, ent, 'entering');
    let b = side === 'lev' ? null : known(m2, lev, 'leaving');
    // Each end's humidity ratio, lb/lb: from the whole state, or from a dew point
    // alone, which needs no dry bulb.
    const atDew = (mode, s) => (!given(s.first) && mode === 'db-dp' && given(s.second) ? humidityAtDewPoint(psyUnits, s.second, altitude) : null);
    const W1 = a ? a.ip.W : side === 'ent' ? null : atDew(m1, ent);
    const W2 = b ? b.ip.W : side === 'lev' ? null : atDew(m2, lev);
    const grains = W => fmt(us ? W * 7000 : W * 1000, us ? 1 : 2);
    const DRY = 'With no moisture entered, the sensible cooling takes the air as dry, which runs up to about 1 % high for humid air; enter the moisture at both ends for the exact loads.';
    const SAME = 'The sensible cooling takes the moisture as unchanged through the coil; enter the moisture at both ends for the latent and total cooling.';
    const AT_DEW = 'With no dry bulb, the latent cooling takes the air at its dew point, which runs about 3 to 4 % high for a typical cooling coil; enter the dry bulbs for the exact loads.';

    const NO_W = 'A wet bulb or an RH does not fix the moisture in the air without its dry bulb. For the latent cooling alone, give the moisture at both ends as dew points; otherwise enter the dry bulbs too.';
    const NO_FLOW = 'No airflow carries that load between these conditions: check the sign of the load against the entering and leaving air.';
    // The load an airflow is wanted for: the total if given, else the sensible,
    // else the latent.
    const flowLoad = !findFlow ? null : [['total', 'qt'], ['sensible', 'qs'], ['latent', 'ql']].map(([k, id]) => [k, num(el('co-' + id))]).find(([, v]) => given(v)) ?? null;

    // The air at one end, when it is the unknown: found from the other end, the
    // airflow and the loads, then carried through the same results as a given one.
    let entMode = m1, levMode = m2, solved = false;
    const says = SAYS(us, side === 'ent');
    if (fromLoads && airflow !== null && !bad) {
      let qs = num(el('co-qs')), ql = num(el('co-ql')), qt = num(el('co-qt'));
      const n = [qs, ql, qt].filter(given).length;
      if (n === 3 && Math.abs(qs + ql - qt) > 0.005 * Math.max(Math.abs(qs), Math.abs(ql), Math.abs(qt))) {
        notes.push('The sensible and latent cooling do not add up to the total: clear one of the three.');
      } else if (n >= 2) {
        // Any two of the three loads fix the air at the other end.
        if (!given(qt)) qt = qs + ql;
        if (!given(qs)) qs = qt - ql;
        const r = findLeave ? a && leavingForLoads(psyUnits, a, airflow, qs, qt, altitude) : b && enteringForLoads(psyUnits, b, airflow, qs, qt, altitude);
        if (r?.problem) notes.push(says[r.problem]);
        else if (r && findLeave) { lev.first = r.db; lev.second = r.rh; levMode = 'db-rh'; solved = true; }
        else if (r) { ent.first = r.db; ent.second = r.rh; entMode = 'db-rh'; solved = true; }
      } else if (findLeave && given(qs) && given(ent.first)) {
        // The sensible load alone gives the other dry bulb.
        rows.push(['Leaving dry bulb', fmt(leavingDryBulbFor(psyUnits, ent.first, airflow, qs, altitude, W1), 1), U.t, 'cf-key']);
        notes.push(W1 === null ? DRY : 'The sensible cooling alone gives the leaving dry bulb, with the entering moisture taken as unchanged; add the latent or total cooling for the leaving moisture.');
      } else if (findEnter && given(qs) && given(lev.first)) {
        const t = enteringDryBulbFor(psyUnits, lev.first, airflow, qs, altitude, W2);
        if (t === null) notes.push('No entering dry bulb gives that much sensible cooling at this airflow.');
        else {
          rows.push(['Entering dry bulb', fmt(t, 1), U.t, 'cf-key']);
          notes.push(W2 === null ? DRY : 'The sensible cooling alone gives the entering dry bulb, with the leaving moisture taken as unchanged; add the latent or total cooling for the entering moisture.');
        }
      } else if (findLeave && given(ql) && W1 !== null) {
        // The latent load alone gives the other dew point.
        const r = leavingDewPointFor(psyUnits, W1, airflow, ql, altitude, given(ent.first) ? ent.first : null);
        if (r.problem) notes.push(says.dry);
        else {
          rows.push(['Leaving dew point', fmt(r.dewPoint, 1), U.t, 'cf-key'], ['Entering humidity ratio', grains(W1), U.w], ['Leaving humidity ratio', grains(r.W), U.w]);
          notes.push(given(ent.first) ? 'The latent cooling alone gives the leaving dew point, with the leaving air taken at that dew point; add the sensible or total cooling for the leaving dry bulb.' : AT_DEW);
        }
      } else if (findEnter && given(ql) && W2 !== null) {
        const r = enteringDewPointFor(psyUnits, W2, airflow, ql, altitude, given(lev.first) ? lev.first : null);
        if (r.problem) notes.push(says.dry);
        else {
          rows.push(['Entering dew point', fmt(r.dewPoint, 1), U.t, 'cf-key'], ['Entering humidity ratio', grains(r.W), U.w], ['Leaving humidity ratio', grains(W2), U.w]);
          notes.push('The latent cooling alone gives the entering dew point, with the entering air taken at that dew point, which puts the latent about 3 to 4 % high for a typical cooling coil; add the sensible or total cooling for the entering dry bulb.');
        }
      }
    }
    if ((findDb || findEdb) && airflow !== null && !bad && (findDb ? a : b)) {
      const qt = num(el('co-qt')), s = findDb ? lev : ent, mode = findDb ? m2 : m1;
      if (given(qt) && given(s.second)) {
        if (mode === 'db-rh' && !(s.second > 0 && s.second <= 100)) notes.push(`The relative humidity must be more than 0 and at most 100 % (${findDb ? 'leaving' : 'entering'} air).`);
        else {
          const r = findDb ? leavingForTotal(psyUnits, a, m2, s.second, airflow, qt, altitude) : enteringForTotal(psyUnits, b, m1, s.second, airflow, qt, altitude);
          if (r.problem) notes.push(says[r.problem]);
          else { s.first = r.db; solved = true; }
        }
      }
    }
    if (solved && side === 'lev') b = known(levMode, lev, 'leaving');
    if (solved && side === 'ent') a = known(entMode, ent, 'entering');

    if (a && b && (side === null || solved)) {
      if (solved) {
        // The end found, in full; what was given for it is not repeated.
        const [x, name, mode] = side === 'lev' ? [b, 'Leaving', m2] : [a, 'Entering', m1];
        rows.push([name + ' dry bulb', fmt(x.db, 1), U.t, 'cf-key']);
        if (fromLoads || mode !== 'db-wb') rows.push([name + ' wet bulb', fmt(x.wb, 1), U.t, fromLoads ? 'cf-key' : undefined]);
        if (fromLoads || mode !== 'db-rh') rows.push([name + ' RH', fmt(x.rh, 0), '%']);
        if (fromLoads || mode !== 'db-dp') rows.push([name + ' dew point', fmt(x.dp, 1), U.t]);
      }
      const wa = us ? a.grains : a.W, wb = us ? b.grains : b.W;   // gr/lb or g/kg
      rows.push(['Entering air enthalpy', fmt(a.h, 2), U.h], ['Leaving air enthalpy', fmt(b.h, 2), U.h],
        ['Entering humidity ratio', fmt(wa, us ? 1 : 2), U.w], ['Leaving humidity ratio', fmt(wb, us ? 1 : 2), U.w]);
      if (flowLoad) {
        const [kind, load] = flowLoad, flow = airflowFor(psyUnits, a, b, load, kind);
        if (flow !== null) { airflow = flow; rows.push([`Airflow for the ${kind} cooling`, fmt(flow, us ? 0 : 1), U.a, 'cf-key']); }
        else notes.push(kind === 'total' ? 'The leaving air must hold less heat than the entering air to remove that load.' : NO_FLOW);
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
    } else if (flowLoad && !bad) {
      // The airflow from one load and part of the conditions: each single-load
      // formula is proportional to the airflow, so the load is divided by the
      // load of one cfm (or l/s).
      const [kind, load] = flowLoad, bothDb = given(ent.first) && given(lev.first);
      let flow = null;
      if (kind === 'sensible' && bothDb) {
        flow = load / sensibleLoad(psyUnits, ent.first, lev.first, 1, altitude, W1, W2);
        if (flow > 0 && Number.isFinite(flow)) notes.push(W1 === null && W2 === null
          ? 'With no moisture entered, the airflow takes the air as dry, which runs up to about 1 % low for humid air; enter the moisture at both ends for the exact airflow.'
          : 'The airflow takes the moisture as unchanged through the coil; enter the moisture at both ends for the exact airflow.');
      } else if (kind === 'latent' && W1 !== null && W2 !== null) {
        flow = load / latentLoad(psyUnits, W1, W2, 1, altitude, given(ent.first) ? ent.first : null, given(lev.first) ? lev.first : null);
        if (flow > 0 && Number.isFinite(flow) && !given(ent.first)) notes.push('With no dry bulb, the airflow takes the air at its dew point, which runs about 3 to 4 % low for a typical cooling coil; enter the dry bulbs for the exact airflow.');
      } else if (kind === 'latent' && !bothDb && given(ent.second) && given(lev.second)) notes.push(NO_W);
      if (flow !== null) {
        if (flow > 0 && Number.isFinite(flow)) { airflow = flow; rows.push([`Airflow for the ${kind} cooling`, fmt(flow, us ? 0 : 1), U.a, 'cf-key']); }
        else notes.push(NO_FLOW);
      }
    } else if (find === 'loads' && airflow !== null && !bad) {
      // Part of the conditions: the dry bulbs alone give the sensible cooling, and
      // the moisture at each end alone gives the latent.
      const bothDb = given(ent.first) && given(lev.first);
      if (bothDb) {
        const qs = sensibleLoad(psyUnits, ent.first, lev.first, airflow, altitude, W1, W2);
        rows.push(['Sensible cooling', fmt(qs, dq), U.q, 'cf-key']);
        notes.push(W1 === null && W2 === null ? DRY : SAME);
        if (qs < 0) notes.push('A negative load denotes heating.');
      }
      if (W1 !== null && W2 !== null) {
        const ql = latentLoad(psyUnits, W1, W2, airflow, altitude, given(ent.first) ? ent.first : null, given(lev.first) ? lev.first : null);
        rows.push(['Latent cooling', fmt(ql, dq), U.q, 'cf-key'], ['Entering humidity ratio', grains(W1), U.w], ['Leaving humidity ratio', grains(W2), U.w]);
        if (!given(ent.first)) notes.push(AT_DEW);
        else if (!bothDb) notes.push('With no leaving dry bulb, the latent cooling takes the leaving air at its dew point, which changes it by well under 1 %; enter the leaving dry bulb for the exact loads.');
        if (ql < 0) notes.push('A negative latent load denotes adding moisture.');
      } else if (!bothDb && given(ent.second) && given(lev.second)) {
        notes.push(NO_W);
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

  // A reset picks each select's first enabled option, so the wet bulb choices
  // are enabled again before it runs.
  form.addEventListener('reset', () => { for (const o of form.querySelectorAll('option[value="db-wb"]')) o.disabled = false; });
  live(form, recalc);
  recalc();
}

// Last, so every declaration above is initialised before the calculator starts.
const form = document.getElementById('cocalc');
if (form) init(form);
