// The coil selection calculator's form behaviour: four tools, each solved as soon
// as its own inputs are complete. The air side's states come from psychsheet.js
// and its loads from airside.js (the exact ASHRAE method, as the psychrometric
// 2-condition calculator); face area, water flow and tube velocity from coil.js.
import { face, water, tubeVelocity } from './coil.js';
import { state, problem as stateProblem } from './psychsheet.js';
import { coilLoads, airflowFor, leavingForLoads, leavingForTotal, humidityAtDewPoint, sensibleLoad, latentLoad, leavingDryBulbFor, leavingDewPointFor, enteringForLoads, enteringForTotal, enteringDryBulbFor, enteringDewPointFor } from './airside.js';
import { live, num, fmt, fillRows, shareable } from './calc-kit.js';

const NAMES = { water: { load: 'Heat load', flow: 'Fluid flow rate', entering: 'Entering fluid', leaving: 'Leaving fluid' } };
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

// Tool 1 works out whatever the entries so far fix; its optional Solve for only
// hides the chosen answer's inputs. Its fields, as they are named in a prompt or a warning.
const AIR = { e1: 'the entering dry bulb', e2: 'the entering moisture', x1: 'the leaving dry bulb', x2: 'the leaving moisture', aq: 'the airflow', qs: 'the sensible cooling', ql: 'the latent cooling', qt: 'the total cooling' };
// What each answer takes: its fields, and how many of the three loads.
const TARGETS = [['cooling loads', ['e1', 'e2', 'x1', 'x2', 'aq'], 0], ['leaving air', ['e1', 'e2', 'aq'], 2],
  ['airflow', ['e1', 'e2', 'x1', 'x2'], 1], ['entering air', ['x1', 'x2', 'aq'], 2]];
const list = a => (a.length < 2 ? a.join('') : a.slice(0, -1).join(', ') + ' and ' + a.at(-1));
// The entries still missing for the one or two answers nearest to complete.
function nextStep(has, n, only = null) {
  const opts = TARGETS.filter(([name]) => !only || name === only).map(([name, ids, loads]) => {
    const miss = ids.filter(id => !has(id)).map(id => AIR[id]), short = Math.max(0, loads - n);
    if (short) miss.push(short === 2 ? 'two of the three loads' : n ? 'one more of the loads' : 'one of the three loads');
    return { name, miss, count: miss.length + Math.max(0, short - 1) };
  }).filter(o => o.count).sort((x, y) => x.count - y.count).slice(0, 2);
  return opts.length ? opts.map((o, i) => `${i ? 'or' : 'Add'} ${list(o.miss)} for the ${o.name}`).join('; ') + '.' : '';
}

function init(form) {
  const el = id => document.getElementById(id);
  const ids = ['as', 'am1', 'am2', 'e1', 'e2', 'x1', 'x2', 'aq', 'qs', 'ql', 'qt', 'alt', 'fh', 'fw', 'wf', 'fl', 'w1', 'w2', 'w3', 'w4', 'vq', 'vd', 'vn'];
  shareable(form, ['u', 'tool', 'adds', 'wc', ...ids], el('co-share'), el('co-copied'));
  // The add-on ticks live in the hidden "adds" field, which shares and remembers.
  const adds = [...el('co-adds').querySelectorAll('input[type="checkbox"]')];
  const syncAdds = () => { const on = el('co-adds-v').value.split(','); for (const c of adds) c.checked = on.includes(c.value); };
  syncAdds();
  el('co-adds').addEventListener('change', () => { el('co-adds-v').value = adds.filter(c => c.checked).map(c => c.value).join(','); });
  form.addEventListener('reset', () => setTimeout(syncAdds, 0));
  // Tool 2's airflow is tool 1's: typing in either fills in the other.
  el('co-fq').value = el('co-aq').value;
  el('co-fq').addEventListener('input', () => { el('co-aq').value = el('co-fq').value; });
  el('co-aq').addEventListener('input', () => { el('co-fq').value = el('co-aq').value; });
  // The answer picked in the guide, whose inputs are highlighted until it appears.
  let target = null;
  const guides = [...form.querySelectorAll('.co-guide')], targets = guides.flatMap(g => [...g.querySelectorAll('.co-target')]);
  for (const b of targets) b.addEventListener('click', () => {
    target = target === b ? null : b;
    // In tool 1 the answer picked is also what to solve for ("whatever" for the
    // ones the drop-down has no entry for, and when unpicked).
    if (b.closest('.co-guide').dataset.tool === 'air') { el('co-as').value = target?.dataset.as || 'any'; recalc(); }
    // In the fluid tool the answer picked is also what to solve for.
    else if (target?.dataset.solve) { el('co-wf').value = target.dataset.solve; el('co-wf').dispatchEvent(new Event('change', { bubbles: true })); }
    else recalc();
  });
  form.addEventListener('reset', () => { target = null; });
  // And the other way: choosing what to solve for picks it in the guide.
  el('co-as').addEventListener('change', () => { target = targets.find(b => b.dataset.as === el('co-as').value) ?? null; });

  function recalc() {
    const units = form.querySelector('input[name="u"]:checked')?.value ?? 'English';
    const us = units === 'English';
    const U = us
      ? { t: '°F', q: 'Btu/h', a: 'cfm', h: 'Btu/lb', w: 'gr/lb', d: 'in', g: 'gpm', td: 'in', l: 'ft', area: 'ft²', vel: 'fpm', tv: 'fps' }
      : { t: '°C', q: 'kW', a: 'l/s', h: 'kJ/kg', w: 'g/kg', d: 'mm', g: 'l/s', td: 'cm', l: 'm', area: 'm²', vel: 'm/s', tv: 'm/s' };
    const m1 = el('co-am1').value, m2 = el('co-am2').value;
    U.m1 = m1 === 'db-rh' ? '%' : U.t; U.m2 = m2 === 'db-rh' ? '%' : U.t;
    for (const [cls, k] of [['co-t', 't'], ['co-q', 'q'], ['co-a', 'a'], ['co-d', 'd'], ['co-g', 'g'], ['co-td', 'td'], ['co-l', 'l'], ['co-m1', 'm1'], ['co-m2', 'm2']]) {
      for (const s of form.querySelectorAll('.' + cls)) s.textContent = U[k];
    }
    const rows = [], notes = [];
    // Only the chosen tool is shown. Each tool's rows and notes start where the
    // last one's ended, so `cut` records those points to show just its own.
    const tool = form.querySelector('input[name="tool"]:checked')?.value ?? 'air';
    const cut = {}, mark = k => { cut[k] = [rows.length, notes.length]; };

    // Tool 1: the coil's air side. Of the entering air, the leaving air, the
    // airflow and the loads, whichever the entries fix is worked out: the loads
    // from both conditions and the airflow, the airflow from both conditions and
    // a load, or the air at one end from the other end, the airflow and the loads.
    const given = x => x !== null && !Number.isNaN(x);
    // Solve for hides that answer's inputs, and what they hold is ignored.
    const off = { loads: ['qs', 'ql', 'qt'], airflow: ['aq'], leaving: ['x1', 'x2'], entering: ['e1', 'e2'] }[el('co-as').value] ?? [];
    for (const id of Object.keys(AIR)) el('co-' + id).closest('.field').hidden = off.includes(id);
    const v = Object.fromEntries(Object.keys(AIR).map(id => [id, off.includes(id) ? null : num(el('co-' + id))]));
    const has = id => given(v[id]);
    // The entries a result drew on. One left over is reported, not silently dropped.
    const used = new Set(), use = (...from) => { for (const id of from) if (has(id)) used.add(id); };
    let over = false;          // a left-over entry is one the others already fix
    let airflow = has('aq') && v.aq > 0 ? v.aq : null;   // also for the face velocity
    let totalCooling = null;   // for the water tool
    const altitude = num(el('co-alt')) ?? 0;
    const ent = { first: v.e1, second: v.e2 }, lev = { first: v.x1, second: v.x2 };
    const psyUnits = us ? 'US' : 'Metric';
    const dq = us ? 0 : 2;     // decimals of a load
    // A state from its two inputs: null when either is missing, or with a note
    // when they cannot be (a wet bulb above the dry bulb, say).
    let bad = false;
    const known = (mode, s, which) => {
      if (!given(s.first) || !given(s.second)) return null;
      const w = stateProblem({ mode, ...s, altitude });
      if (w) { if (!bad) notes.push(w.replace('.', ` (${which} air).`)); bad = true; return null; }
      return state({ units: psyUnits, mode, ...s, altitude });
    };
    let a = known(m1, ent, 'entering'), b = known(m2, lev, 'leaving');
    // Each end's humidity ratio, lb/lb: from the whole state, or from a dew point
    // alone, which needs no dry bulb.
    const atDew = (mode, s) => (!given(s.first) && mode === 'db-dp' && given(s.second) ? humidityAtDewPoint(psyUnits, s.second, altitude) : null);
    const W1 = a ? a.ip.W : atDew(m1, ent), W2 = b ? b.ip.W : atDew(m2, lev);
    const grains = W => fmt(us ? W * 7000 : W * 1000, us ? 1 : 2);
    const DRY = 'With no moisture entered, the sensible cooling takes the air as dry, which runs up to about 1 % high for humid air; enter the moisture at both ends for the exact loads.';
    const SAME = 'The sensible cooling takes the moisture as unchanged through the coil; enter the moisture at both ends for the latent and total cooling.';
    const AT_DEW = 'With no dry bulb, the latent cooling takes the air at its dew point, which runs about 3 to 4 % high for a typical cooling coil; enter the dry bulbs for the exact loads.';
    const NO_W = 'A wet bulb or an RH does not fix the moisture in the air without its dry bulb. For the latent cooling alone, give the moisture at both ends as dew points; otherwise enter the dry bulbs too.';
    const NO_FLOW = 'No airflow carries that load between these conditions: check the sign of the load against the entering and leaving air.';
    // An end found from one load, given its dry bulb and dew point: its dry and wet
    // bulb rows, or just the dry bulb and a note when the dew point is above it.
    const ends = (name, db, dp, note) => {
      rows.push([name + ' dry bulb', fmt(db, 1), U.t, 'cf-key']);
      if (stateProblem({ mode: 'db-dp', first: db, second: dp, altitude })) { notes.push(note); return false; }
      rows.push([name + ' wet bulb', fmt(state({ units: psyUnits, mode: 'db-dp', first: db, second: dp, altitude }).wb, 1), U.t, 'cf-key']);
      return true;
    };
    let qs = v.qs, ql = v.ql, qt = v.qt;
    const n = [qs, ql, qt].filter(given).length;

    // One end known in full and the other not: the other is found from the
    // airflow and the loads, then carried through the same results as a given one.
    const side = a && !b ? 'lev' : b && !a ? 'ent' : null;
    let solved = false, byTotal = false, stuck = false;
    if (side && airflow !== null && !bad) {
      const findLeave = side === 'lev', end = findLeave ? 'leaving' : 'entering', says = SAYS(us, !findLeave);
      const s = findLeave ? lev : ent, mode = findLeave ? m2 : m1;
      const [own, other] = findLeave ? [['x1', 'x2'], ['e1', 'e2']] : [['e1', 'e2'], ['x1', 'x2']];
      if (n === 3 && Math.abs(qs + ql - qt) > 0.005 * Math.max(Math.abs(qs), Math.abs(ql), Math.abs(qt))) {
        notes.push('The sensible and latent cooling do not add up to the total: clear one of the three.'); stuck = true;
      } else if (n >= 2) {
        // Any two of the three loads fix the air at the other end, whatever part
        // of it was entered.
        if (!given(qt)) qt = qs + ql;
        if (!given(qs)) qs = qt - ql;
        const r = findLeave ? leavingForLoads(psyUnits, a, airflow, qs, qt, altitude) : enteringForLoads(psyUnits, b, airflow, qs, qt, altitude);
        if (r.problem) { notes.push(says[r.problem]); stuck = true; }
        else { s.first = r.db; s.second = r.rh; solved = true; over = own.some(has); use(...other, 'aq', 'qs', 'ql', 'qt'); }
      } else if (has('qt') && given(s.second) && !given(s.first)) {
        // The total load and that end's RH or dew point give its dry bulb. A total
        // at a fixed wet bulb barely moves with the dry bulb, so not a wet bulb.
        stuck = true;
        if (mode === 'db-wb') notes.push(`With the total cooling alone, give the ${end} moisture as an RH or a dew point, or add the ${end} dry bulb: at a fixed wet bulb the total hardly changes with the dry bulb.`);
        else if (mode === 'db-rh' && !(s.second > 0 && s.second <= 100)) notes.push(`The relative humidity must be more than 0 and at most 100 % (${end} air).`);
        else {
          const r = findLeave ? leavingForTotal(psyUnits, a, mode, s.second, airflow, qt, altitude) : enteringForTotal(psyUnits, b, mode, s.second, airflow, qt, altitude);
          if (r.problem) notes.push(says[r.problem]);
          else { s.first = r.db; solved = byTotal = true; stuck = false; use(...other, 'aq', 'qt', own[1]); }
        }
      }
      if (solved && findLeave) b = known(byTotal ? m2 : 'db-rh', lev, 'leaving');
      if (solved && !findLeave) a = known(byTotal ? m1 : 'db-rh', ent, 'entering');
    }

    if (a && b) {
      if (solved) {
        // The end found, in full, including whatever was given for it.
        const [x, name] = side === 'lev' ? [b, 'Leaving'] : [a, 'Entering'];
        rows.push([name + ' dry bulb', fmt(x.db, 1), U.t, 'cf-key'], [name + ' wet bulb', fmt(x.wb, 1), U.t, 'cf-key'],
          [name + ' RH', fmt(x.rh, 0), '%'], [name + ' dew point', fmt(x.dp, 1), U.t]);
      } else use('e1', 'e2', 'x1', 'x2');
      const wa = us ? a.grains : a.W, wb = us ? b.grains : b.W;   // gr/lb or g/kg
      rows.push(['Entering air enthalpy', fmt(a.h, 2), U.h], ['Leaving air enthalpy', fmt(b.h, 2), U.h],
        ['Entering humidity ratio', fmt(wa, us ? 1 : 2), U.w], ['Leaving humidity ratio', fmt(wb, us ? 1 : 2), U.w]);
      const wantLoads = !solved && airflow !== null;
      if (wantLoads) { use('aq'); over = n > 0; }
      else if (!solved && n) {
        // No airflow: it is found from one load, the total if given, else the
        // sensible, else the latent.
        const [kind, id] = [['total', 'qt'], ['sensible', 'qs'], ['latent', 'ql']].find(([, id]) => has(id));
        const flow = airflowFor(psyUnits, a, b, v[id], kind);
        use(id); over = n > 1;
        if (flow !== null) { airflow = flow; rows.push(['Airflow', fmt(flow, us ? 0 : 1), U.a, 'cf-key']); }
        else { notes.push(kind === 'total' ? 'The leaving air must hold less heat than the entering air to remove that load.' : NO_FLOW); stuck = true; }
      }
      if (airflow !== null) {
        const r = coilLoads(psyUnits, a, b, airflow);
        if (r.total > 0) totalCooling = r.total;
        const found = id => (has(id) ? undefined : 'cf-key');   // a load entered is not highlighted
        rows.push(['Sensible cooling', fmt(r.sensible, dq), U.q, found('qs')], ['Latent cooling', fmt(r.latent, dq), U.q, found('ql')], ['Total cooling', fmt(r.total, dq), U.q, found('qt')]);
        if (r.shr !== null && r.total > 0) rows.push(['Sensible heat ratio', fmt(r.shr, 2), '']);
        if (r.sensible < 0 || r.total < 0) notes.push('A negative load denotes heating.');
        if (r.latent < 0) notes.push('A negative latent load denotes adding moisture.');
      }
    } else if (!bad && !stuck) {
      // Part of the conditions still gives part of the answer.
      const bothDb = has('e1') && has('x1');
      if (airflow !== null) {
        // The dry bulbs alone give the sensible cooling, and the moisture at each
        // end alone gives the latent.
        if (bothDb) {
          const q = sensibleLoad(psyUnits, v.e1, v.x1, airflow, altitude, W1, W2);
          rows.push(['Sensible cooling', fmt(q, dq), U.q, 'cf-key']);
          notes.push(W1 === null && W2 === null ? DRY : SAME);
          if (q < 0) notes.push('A negative load denotes heating.');
          use('e1', 'x1', 'aq'); if (W1 !== null) use('e2'); if (W2 !== null) use('x2'); over ||= has('qs');
        }
        if (W1 !== null && W2 !== null) {
          const q = latentLoad(psyUnits, W1, W2, airflow, altitude, v.e1, v.x1);
          rows.push(['Latent cooling', fmt(q, dq), U.q, 'cf-key'], ['Entering humidity ratio', grains(W1), U.w], ['Leaving humidity ratio', grains(W2), U.w]);
          if (!has('e1')) notes.push(AT_DEW);
          else if (!bothDb) notes.push('With no leaving dry bulb, the latent cooling takes the leaving air at its dew point, which changes it by well under 1 %; enter the leaving dry bulb for the exact loads.');
          if (q < 0) notes.push('A negative latent load denotes adding moisture.');
          use('e1', 'e2', 'x1', 'x2', 'aq'); over ||= has('ql');
        }
        // One load and one end: the sensible gives the other dry bulb, and the
        // latent the other dew point.
        if (has('qs') && has('e1') && !has('x1')) {
          const t = leavingDryBulbFor(psyUnits, v.e1, airflow, qs, altitude, W1);
          if (W1 === null) { rows.push(['Leaving dry bulb', fmt(t, 1), U.t, 'cf-key']); notes.push(DRY); }
          else {
            if (ends('Leaving', t, a.dp, 'That leaves the air below its dew point, so the coil must also remove moisture; add the latent or total cooling for the leaving wet bulb.')) notes.push('The sensible cooling alone gives the leaving air with the entering moisture taken as unchanged; add the latent or total cooling for the actual leaving moisture.');
          }
          use('e1', 'aq', 'qs'); if (W1 !== null) use('e2');
        } else if (has('qs') && has('x1') && !has('e1')) {
          const t = enteringDryBulbFor(psyUnits, v.x1, airflow, qs, altitude, W2);
          if (t === null) notes.push('No entering dry bulb gives that much sensible cooling at this airflow.');
          else {
            if (W2 === null) { rows.push(['Entering dry bulb', fmt(t, 1), U.t, 'cf-key']); notes.push(DRY); }
            else {
              if (ends('Entering', t, b.dp, 'That puts the entering air below its dew point; add the latent or total cooling for the entering wet bulb.')) notes.push('The sensible cooling alone gives the entering air with the leaving moisture taken as unchanged; add the latent or total cooling for the actual entering moisture.');
            }
            use('x1', 'aq', 'qs'); if (W2 !== null) use('x2');
          }
        }
        if (has('ql') && W1 !== null && W2 === null) {
          const r = leavingDewPointFor(psyUnits, W1, airflow, ql, altitude, v.e1);
          if (r.problem) notes.push(SAYS(us, false).dry);
          else {
            ends('Leaving', has('x1') ? v.x1 : r.dewPoint, r.dewPoint, 'The leaving dry bulb entered is below the leaving dew point these give: check the latent cooling.');
            rows.push(['Leaving dew point', fmt(r.dewPoint, 1), U.t, 'cf-key'], ['Entering humidity ratio', grains(W1), U.w], ['Leaving humidity ratio', grains(r.W), U.w]);
            if (!has('e1')) notes.push(AT_DEW);
            else if (!has('x1')) notes.push('The latent cooling alone gives the leaving dew point, with the leaving air taken at that dew point; add the sensible or total cooling for the leaving dry bulb.');
            use('e1', 'e2', 'aq', 'ql');
          }
        } else if (has('ql') && W2 !== null && W1 === null) {
          const r = enteringDewPointFor(psyUnits, W2, airflow, ql, altitude, v.x1);
          if (r.problem) notes.push(SAYS(us, true).dry);
          else {
            ends('Entering', has('e1') ? v.e1 : r.dewPoint, r.dewPoint, 'The entering dry bulb entered is below the entering dew point these give: check the latent cooling.');
            rows.push(['Entering dew point', fmt(r.dewPoint, 1), U.t, 'cf-key'], ['Entering humidity ratio', grains(r.W), U.w], ['Leaving humidity ratio', grains(W2), U.w]);
            if (!has('e1')) notes.push('The latent cooling alone gives the entering dew point, with the entering air taken at that dew point, which puts the latent about 3 to 4 % high for a typical cooling coil; add the sensible or total cooling for the entering dry bulb.');
            use('x1', 'x2', 'aq', 'ql');
          }
        }
      } else {
        // No airflow: one load and part of the conditions give it. Each single-load
        // formula is proportional to the airflow, so the load is divided by the
        // load of one cfm (or l/s).
        let flow = null, kind = null;
        if (has('qs') && bothDb) {
          kind = 'sensible'; flow = qs / sensibleLoad(psyUnits, v.e1, v.x1, 1, altitude, W1, W2);
          use('e1', 'x1', 'qs'); if (W1 !== null) use('e2'); if (W2 !== null) use('x2');
          if (flow > 0 && Number.isFinite(flow)) notes.push(W1 === null && W2 === null
            ? 'With no moisture entered, the airflow takes the air as dry, which runs up to about 1 % low for humid air; enter the moisture at both ends for the exact airflow.'
            : 'The airflow takes the moisture as unchanged through the coil; enter the moisture at both ends for the exact airflow.');
        } else if (has('ql') && W1 !== null && W2 !== null) {
          kind = 'latent'; flow = ql / latentLoad(psyUnits, W1, W2, 1, altitude, v.e1, v.x1);
          use('e1', 'e2', 'x1', 'x2', 'ql');
          if (flow > 0 && Number.isFinite(flow) && !has('e1')) notes.push('With no dry bulb, the airflow takes the air at its dew point, which runs about 3 to 4 % low for a typical cooling coil; enter the dry bulbs for the exact airflow.');
        }
        if (flow !== null) {
          if (flow > 0 && Number.isFinite(flow)) { airflow = flow; rows.push(['Airflow', fmt(flow, us ? 0 : 1), U.a, 'cf-key']); }
          else notes.push(NO_FLOW);
        }
      }
      if (W1 === null && W2 === null && !bothDb && has('e2') && has('x2') && !rows.length) notes.push(NO_W);
    }

    // What to enter next, while nothing is fixed yet; and, once something is,
    // any entry it did not draw on.
    const answered = rows.some(r => r[3] === 'cf-key');
    const prompt = answered || notes.length || !Object.keys(AIR).some(has) ? '' : nextStep(id => (id === 'aq' ? airflow !== null : has(id)), n, { loads: 'cooling loads', airflow: 'airflow', leaving: 'leaving air', entering: 'entering air' }[el('co-as').value]);
    el('co-loadhint').textContent = prompt;
    el('co-loadhint').hidden = !prompt;
    const extra = answered ? Object.keys(AIR).filter(id => has(id) && !used.has(id)).map(id => AIR[id]) : [];
    // Over-defined entries may disagree, so the air side shows nothing until one
    // is cleared, and the water tool does not take its total cooling.
    let overMsg = '';
    if (extra.length) {
      const [is, it] = extra.length > 1 ? ['are', 'them'] : ['is', 'it'];
      if (over) {
        const [they, one] = extra.length > 1 ? ['they', 'different inputs'] : ['it', 'a different input'];
        overMsg = `Over-defined: the other inputs already determine ${list(extra)}, so ${they} can't also be entered. Clear ${list(extra)}, or clear ${one} to keep ${it}.`;
        rows.length = notes.length = 0;
        totalCooling = null;
      } else notes.unshift(`${list(extra).replace(/^t/, 'T')} ${is} entered but not used in these results.`);
    }

    // Once anything is answered, tool 1 lists every one of its quantities that is
    // known, entered or found, in one order: entering air, leaving air, airflow,
    // then the three loads. Found values keep their highlight.
    if (answered && !overMsg) {
      const have = new Map(rows.map(r => [r[0], r]));
      const add = (label, value, unit) => { if (!have.has(label)) have.set(label, [label, value, unit]); };
      const air = (name, x, db, dpId, mode) => {
        if (x) {
          add(`${name} dry bulb`, fmt(x.db, 1), U.t); add(`${name} wet bulb`, fmt(x.wb, 1), U.t);
          add(`${name} RH`, fmt(x.rh, 0), '%'); add(`${name} dew point`, fmt(x.dp, 1), U.t);
        } else {
          if (used.has(db)) add(`${name} dry bulb`, fmt(v[db], 1), U.t);
          if (used.has(dpId) && mode === 'db-dp') add(`${name} dew point`, fmt(v[dpId], 1), U.t);
        }
      };
      air('Entering', a, 'e1', 'e2', m1);
      air('Leaving', b, 'x1', 'x2', m2);
      if (airflow !== null) add('Airflow', fmt(airflow, us ? 0 : 1), U.a);
      for (const [id, label] of [['qs', 'Sensible cooling'], ['ql', 'Latent cooling'], ['qt', 'Total cooling']]) {
        if (used.has(id)) add(label, fmt(v[id], dq), U.q);
      }
      const ORDER = ['Entering dry bulb', 'Entering wet bulb', 'Entering RH', 'Entering dew point',
        'Leaving dry bulb', 'Leaving wet bulb', 'Leaving RH', 'Leaving dew point', 'Airflow',
        'Sensible cooling', 'Latent cooling', 'Total cooling', 'Sensible heat ratio'];
      const at = r => (ORDER.includes(r[0]) ? ORDER.indexOf(r[0]) : ORDER.length);
      rows.splice(0, rows.length, ...[...have.values()].sort((x, y) => at(x) - at(y)));
    }

    mark('water');
    // Tool 3: water and glycol; the variable being solved for is not an input. A
    // blank heat load takes the air side's total cooling.
    let waterFlow = null;   // for the tube velocity
    {
      const f = el('co-wf').value;
      for (const [v, n] of Object.entries(VAR)) el(`co-w${n}`).closest('.field').hidden = v === f;
      el('co-w3-hint').hidden = f === 'load';   // no heat load box to leave blank
      const vals = Object.fromEntries(Object.entries(VAR).filter(([v]) => v !== f).map(([v, n]) => [v, num(el(`co-w${n}`))]));
      const loadLinked = f !== 'load' && vals.load === null && totalCooling !== null;
      if (loadLinked) vals.load = totalCooling;
      el('co-w3').placeholder = totalCooling !== null ? fmt(totalCooling, us ? 0 : 2) : (us ? '240000' : '70');
      if (!Object.values(vals).some(x => x === null || Number.isNaN(x))) {
        const coil = form.querySelector('input[name="wc"]:checked')?.value ?? 'Cooling';
        const r = water(units, f, el('co-fluid').value, vals, coil);
        if (Number.isFinite(r)) {
          rows.push([NAMES.water[f], fmt(r, f === 'load' ? (us ? 0 : 2) : 2), f === 'load' ? U.q : f === 'flow' ? U.g : U.t, 'cf-key']);
          if (loadLinked) notes.push("The fluid flow uses the air side's total cooling as its heat load; enter a heat load to override it.");
        }
        waterFlow = f === 'flow' ? r : vals.flow;
        if (!(waterFlow > 0)) waterFlow = null;
      }
    }
    mark('face');
    // Tool 2: face area, and face velocity with its airflow, which is tool 1's
    // entry (the two boxes mirror each other) or, left blank, what tool 1 found.
    const fh = num(el('co-fh')), fw = num(el('co-fw')), fqIn = num(el('co-fq'));
    const fq = fqIn > 0 ? fqIn : airflow;
    el('co-fq').placeholder = fqIn === null && airflow > 0 ? fmt(airflow, us ? 0 : 1) : (us ? '1000' : '470');
    if (fh > 0 && fw > 0) {
      const r = face(units, fh, fw, fq ?? 0);
      rows.push(['Coil face area', fmt(r.area, 2), U.area, 'cf-key']);
      if (fq > 0) rows.push(['Coil face velocity', fmt(r.velocity, us ? 0 : 2), U.vel, 'cf-key']);
      if (fq > 0 && fqIn === null) notes.push('The face velocity uses the airflow tool 1 found; enter an airflow to override it.');
    }
    mark('tubes');
    // Tool 4: water velocity in the tubes. A blank flow takes the water tool's flow.
    const vd = num(el('co-vd')), vn = num(el('co-vn'));
    let vq = num(el('co-vq'));
    el('co-vq').placeholder = waterFlow !== null ? fmt(waterFlow, 2) : (us ? '48' : '3');
    const flowLinked = vq === null && waterFlow !== null;
    if (flowLinked) vq = waterFlow;
    if (vq > 0 && vd > 0 && vn > 0) {
      rows.push(['Fluid velocity in tubes', fmt(tubeVelocity(units, vq, vd, vn), 2), U.tv, 'cf-key']);
      if (flowLinked) notes.push("The tube velocity uses the flow from tool 3; enter a flow rate to override it.");
    }

    mark('end');
    // Which tools are open: the chosen one, and from tool 1 any add-on ticked. An
    // add-on is offered once its input exists, and stays while ticked.
    const ticked = k => adds.find(c => c.value === k).checked;
    const ready = { face: airflow > 0, water: totalCooling > 0, tubes: ticked('water') && waterFlow > 0 };
    const isOpen = k => tool === k || (tool === 'air' && ticked(k) && (k !== 'tubes' || ticked('water')));
    for (const label of el('co-adds').querySelectorAll('label')) {
      const k = label.dataset.add;
      label.hidden = tool !== 'air' || !(ready[k] || isOpen(k));
    }
    el('co-adds').hidden = ![...el('co-adds').querySelectorAll('label')].some(l => !l.hidden);
    for (const fs of form.querySelectorAll('.co-tool')) fs.hidden = !isOpen(fs.dataset.tool);
    // Each open tool's rows and notes, in page order, headed when more than one has any.
    const NAME = { air: 'Air side', face: 'Face velocity', water: 'Fluid flow', tubes: 'Tube velocity' };
    const span = { air: [[0, 0], cut.water], water: [cut.water, cut.face], face: [cut.face, cut.tubes], tubes: [cut.tubes, cut.end] };
    const groups = ['air', 'face', 'water', 'tubes'].filter(isOpen).map(k => {
      const [[r0, n0], [r1, n1]] = span[k];
      return [k, rows.slice(r0, r1), notes.slice(n0, n1)];
    });
    const headed = groups.filter(g => g[1].length).length > 1;
    const shown = groups.flatMap(([k, r]) => (headed && r.length ? [[NAME[k], '', '', 'cf-group-h'], ...r] : r));
    const said = groups.flatMap(g => g[2]), warn = tool === 'air' ? overMsg : '';
    fillRows(el('co-tbody'), shown);
    if (target && (target.closest('.co-guide').dataset.tool !== tool || rows.some(r => r[0] === target.dataset.done && r[3] === 'cf-key'))) target = null;
    const need = target ? target.dataset.need.split(' ') : [];
    for (const b of targets) b.setAttribute('aria-pressed', String(b === target));
    for (const f of form.querySelectorAll('.co-f')) f.classList.toggle('co-want', need.includes(f.dataset.var));
    for (const g of guides) g.hidden = !(g.dataset.tool === tool && !warn && (!shown.length || g.contains(target)));
    el('co-results-h').textContent = (shown.length && !target) || warn ? 'Results' : 'Instructions';
    const keyRows = shown.filter(r => r[3] === 'cf-key');
    const main = keyRows.length ? keyRows : shown.filter(r => r[3] !== 'cf-group-h' && !/enthalpy|humidity ratio/.test(r[0]));
    el('co-summary').classList.toggle('is-over', !!warn);
    el('co-summary').textContent = warn || (main.length
      ? main.map(([l, v, u]) => `${l} ${v}${u ? " " + u : ""}`).join('; ') + '.'
      : (tool === 'air' && prompt) || 'Fill in the inputs; results appear as soon as there are enough to work with.');
    el('co-note').textContent = said.join(' ');
    el('co-note').hidden = !said.length;
  }

  live(form, recalc);
  recalc();
}

// Last, so every declaration above is initialised before the calculator starts.
const form = document.getElementById('cocalc');
if (form) init(form);
