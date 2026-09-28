// The condensate pump size calculator's form behaviour. The pump selection is in
// condensate-pump.js and the condensate from the coil in twostate.js; this reads
// the form, fills the voltage list for the chosen application, and writes the
// results.
import { selectPumps, problem, voltsFor } from './condensate-pump.js';
import { condensate } from './twostate.js';
import { problem as stateProblem } from './psychsheet.js';
import { live, num, fmt, fillRows, shareable, startingValues, unitSwitch, TEMP, FT, CFM } from './calc-kit.js';

const L_PER_GAL = 3.785411784;

function init(form) {
  const el = id => document.getElementById(id);
  const fillVolts = keep => {
    const vs = voltsFor(el('cp-type').value);
    const want = vs.includes(Number(keep)) ? Number(keep) : vs[0];
    el('cp-volts').replaceChildren(...vs.map(v => new Option(v === 230 ? '208-230 V' : v === 460 ? '380-460 V' : `${v} V`, String(v), false, v === want)));
  };
  // The type's voltages exist before a shared link or saved inputs choose one.
  const q = startingValues();
  if (q.get('t')) el('cp-type').value = q.get('t');
  fillVolts(q.get('v'));
  shareable(form, ['u', 'src', 'edb', 'ewb', 'ldb', 'lwb', 'cfm', 'alt', 'q', 't', 'v', 'h'], el('cp-share'), el('cp-copied'));
  el('cp-type').addEventListener('change', () => fillVolts(el('cp-volts').value), true);
  form.addEventListener('reset', () => setTimeout(() => { fillVolts(); recalc(); }, 0));
  unitSwitch(form, 'u', [[el('cp-edb'), TEMP], [el('cp-ewb'), TEMP], [el('cp-ldb'), TEMP], [el('cp-lwb'), TEMP],
    [el('cp-cfm'), CFM], [el('cp-alt'), FT], [el('cp-head'), FT], [el('cp-q'), L_PER_GAL]], 'Metric');

  function recalc() {
    const us = form.querySelector('input[name="u"]:checked')?.value !== 'Metric';
    const fromCoil = form.querySelector('input[name="src"]:checked')?.value !== 'flow';
    for (const [cls, a, b] of [['cp-t', '°F', '°C'], ['cp-q', 'cfm', 'l/s'], ['cp-l', 'ft', 'm'], ['cp-v', 'gph', 'l/h']]) {
      for (const x of form.querySelectorAll(`.${cls}`)) x.textContent = us ? a : b;
    }
    el('cp-coil').hidden = !fromCoil;
    el('cp-flow').hidden = fromCoil;
    const flowUnit = us ? 'gph' : 'l/h';
    el('cp-capcol').textContent = `Flow at the head, ${flowUnit}`;
    el('cp-maxcol').textContent = `Largest rated flow, ${flowUnit}`;
    const hide = why => { el('cp-summary').textContent = why; el('cp-table').hidden = true; el('cp-cond').hidden = !fromCoil || !el('cp-cbody').rows.length; };

    // The condensate flow, in gph, from the coil or as entered.
    let gph, rows = [];
    if (fromCoil) {
      const units = us ? 'US' : 'Metric', altitude = num(el('cp-alt')) ?? 0;
      const ent = { first: num(el('cp-edb')), second: num(el('cp-ewb')) }, lev = { first: num(el('cp-ldb')), second: num(el('cp-lwb')) };
      const why = stateProblem({ mode: 'db-wb', ...ent, altitude }) ?? stateProblem({ mode: 'db-wb', ...lev, altitude });
      const airflow = num(el('cp-cfm'));
      el('cp-cbody').replaceChildren();
      if (why) return hide(why.replace('.', ' (coil).'));
      if (airflow === null || Number.isNaN(airflow) || !(airflow > 0)) return hide('Enter the airflow across the coil.');
      const r = condensate({ units, mode: 'db-wb', entering: ent, leaving: lev, airflow, altitude });
      if (!(r.lbh > 0)) {
        fillRows(el('cp-cbody'), [['Condensate', '0', flowUnit]]);
        el('cp-cond').hidden = false;
        el('cp-table').hidden = true;
        el('cp-summary').textContent = 'The leaving air holds as much moisture as the entering air, so the coil makes no condensate and needs no pump.';
        return;
      }
      gph = us ? r.volume : r.volume / L_PER_GAL;
      rows = [['Condensate generated', fmt(r.volume, 2), flowUnit, 'cf-key'], ['', fmt(r.lbh * (us ? 1 : 0.453592), 2), us ? 'lb/h' : 'kg/h'], ['', fmt(r.pints, 1), 'pints/day']];
    } else {
      const v = num(el('cp-q'));
      gph = v === null || Number.isNaN(v) ? v : us ? v : v / L_PER_GAL;
    }
    fillRows(el('cp-cbody'), rows);
    el('cp-cond').hidden = !rows.length;

    const headIn = num(el('cp-head'));
    const head = headIn === null || Number.isNaN(headIn) ? headIn : us ? headIn : headIn / FT;
    const input = { type: el('cp-type').value, volts: Number(el('cp-volts').value), head, gph };
    const why = problem(input);
    if (why) return hide(why);

    const shown = selectPumps(input).filter(p => p.ok).sort((a, b) => a.capacity - b.capacity || a.row - b.row);
    const flow = g => fmt(us ? g : g * L_PER_GAL, us && g < 10 ? 1 : 0);
    const at = ft => (us ? `${ft} ft` : `${fmt(ft * FT, 1)} m`);
    el('cp-body').replaceChildren(...shown.map(p => {
      const tr = document.createElement('tr');
      const th = Object.assign(document.createElement('th'), { scope: 'row', textContent: p.model });
      const td = t => Object.assign(document.createElement('td'), { className: 'cf-num', textContent: t });
      tr.append(th, td(`${flow(p.capacity)} (at ${at(p.ratedAt)})`), td(flow(p.max)));
      return tr;
    }));
    el('cp-table').hidden = !shown.length;
    const need = `${flow(gph)} ${flowUnit} to ${us ? `${fmt(head, 1)} ft` : `${fmt(headIn, 2)} m`}`;
    el('cp-summary').textContent = shown.length
      ? `${shown.length === 1 ? '1 pump lifts' : `${shown.length} pumps lift`} ${need}${shown.length === 1 ? '' : ', smallest first'}.`
      : `No ${input.volts} V pump of this type lifts ${need}. Try another application or voltage, or a lower head.`;
  }

  live(form, recalc);
  recalc();
}

// Last, so every declaration above is initialised before the calculator starts.
const form = document.getElementById('cpcalc');
if (form) init(form);
