// The psychrometric calculators' form behaviour: one state (psychrometric
// calculator), or entering and leaving states (two-condition and condensate
// calculators). The states come from psychsheet.js; the coil loads from
// airside.js (the exact ASHRAE method) and the condensate from twostate.js.
import { state, problem, UNITS } from './psychsheet.js';
import { states, condensate } from './twostate.js';
import { coilLoads } from './airside.js';
import { live, num, fmt, fillRows, shareable, unitSwitch, TEMP, FT, CFM } from './calc-kit.js';

const LABELS = { 'db-wb': ['Dry bulb', 'Wet bulb'], 'db-rh': ['Dry bulb', 'Relative humidity'], 'db-dp': ['Dry bulb', 'Dew point'],
  'dp-rh': ['Dew point', 'Relative humidity'] };
const TEMP_SECOND = new Set(['db-wb', 'db-dp']);   // modes whose second input is a temperature

function init(form) {
  const el = id => document.getElementById(id);
  const two = form.dataset.states === '2', kind = form.dataset.kind;
  const pick = name => form.querySelector(`input[name="${name}"]:checked`)?.value;
  const ids = two ? ['a1', 'a2', 'b1', 'b2'] : ['a1', 'b1'];
  // Two states each have their own "Given" (m1, m2); one state has m.
  shareable(form, ['u', ...(two ? ['m1', 'm2'] : ['m']), ...ids, ...(two ? ['q'] : []), 'z'], el('ps-share'), el('ps-copied'));
  // Links shared before the split carry one m for both states.
  const legacy = new URLSearchParams(location.search);
  if (two && LABELS[legacy.get('m')] && !legacy.has('m1')) el('ps-m1').value = el('ps-m2').value = legacy.get('m');
  const modeOf = n => (two ? el(`ps-m${n}`).value : pick('m'));
  // The second input is a temperature for db + wb and db + dp, and an RH otherwise.
  const second = n => () => (TEMP_SECOND.has(modeOf(n)) ? TEMP : null);
  unitSwitch(form, 'u', [
    ...ids.map(id => [el(`ps-${id}`), id.startsWith('a') ? TEMP : second(id[1])]),
    ...(two ? [[el('ps-q'), CFM]] : []), [el('ps-alt'), FT],
  ], 'Metric');

  function recalc() {
    const units = pick('u'), us = units === 'US', u = UNITS[units];
    for (const n of two ? [1, 2] : [1]) {
      const m = modeOf(n), [l1, l2] = LABELS[m], sfx = two ? '-' + n : '';
      el('ps-l1' + sfx).textContent = l1; el(`ps-l1${sfx}u`).textContent = u.t;
      el('ps-l2' + sfx).textContent = l2; el(`ps-l2${sfx}u`).textContent = TEMP_SECOND.has(m) ? u.t : '%';
    }
    el('ps-altu').textContent = us ? 'ft' : 'm';
    if (two) el('ps-qu').textContent = us ? 'cfm' : 'l/s';

    const read = n => ({ mode: modeOf(n), first: num(el(`ps-a${n}`)), second: num(el(`ps-b${n}`)) });
    const altitude = num(el('ps-alt'));
    const args = s => ({ mode: s.mode, first: s.first, second: s.mode === 'dp-rh' ? null : s.second,
      rh: s.mode === 'dp-rh' ? s.second : null, altitude });
    const s1 = read(1), s2 = two ? read(2) : null;
    const w1 = problem(args(s1)), w2 = two ? problem(args(s2)) : null;
    const which = (w, side) => (two && !/altitude/.test(w) ? w.replace(/\.$/, ` (${side} air).`) : w);
    let why = w1 ? which(w1, 'entering') : w2 ? which(w2, 'leaving') : null;
    const q = two ? num(el('ps-q')) : null;
    if (!why && two && (q === null || !(q > 0))) why = q === null ? 'Enter the airflow.' : 'The airflow must be greater than zero.';
    if (why) {
      el('ps-summary').textContent = why;
      el('ps-head').hidden = el('ps-props-wrap').hidden = true;
      return;
    }

    const props = [
      ['Dry bulb', 'db', u.t, 2], ['Wet bulb', 'wb', u.t, 2], ['Dew point', 'dp', u.t, 2], ['Relative humidity', 'rh', '%', 1],
      ['Specific volume', 'v', u.v, 4], ['Specific enthalpy', 'h', u.h, 3], ['Humidity ratio', 'W', u.W, us ? 5 : 3],
      ['Humidity ratio', 'grains', 'gr/lb', 2], ['Atmospheric pressure', 'patm', u.p, 3],
      ['Saturation vapor pressure', 'pws', u.p, 4], ['Partial vapor pressure', 'pw', u.p, 4],
    ];
    const row = (label, cells, unit) => {
      const tr = document.createElement('tr');
      const th = document.createElement('th'); th.scope = 'row'; th.textContent = label; tr.append(th);
      for (const c of [...cells, unit]) { const td = document.createElement('td'); td.textContent = c; tr.append(td); }
      return tr;
    };

    if (!two) {
      const r = state({ units, ...args(s1) });
      el('ps-ptbody').replaceChildren(...props.filter(p => r[p[1]] !== null).map(([l, k, un, dp]) => row(l, [fmt(r[k], dp)], un)));
      el('ps-props-wrap').hidden = false;
      el('ps-head').hidden = true;
      el('ps-summary').textContent = `${fmt(r.db, 1)} ${u.t} dry bulb, ${fmt(r.wb, 1)} ${u.t} wet bulb, ${fmt(r.dp, 1)} ${u.t} dew point, `
        + `${fmt(r.rh, 1)} % RH; h = ${fmt(r.h, 2)} ${u.h}.`;
      return;
    }

    const input = { units, entering: s1, leaving: s2, airflow: q, altitude };
    if (kind === 'coil') {
      // Loads by the exact ASHRAE method; condensate as the condensate calculator.
      const [a, b] = states(input), r = coilLoads(units, a, b, q), pints = condensate(input).pints;
      const cap = us ? 'Btu/h' : 'kW', d = us ? 0 : 2;
      const perTon = r.total > 0 ? (us ? q / (r.total / 12000) : q / r.total) : null;
      fillRows(el('ps-htbody'), [
        ['Total cooling', fmt(r.total, d), cap, 'cf-key'], ['Sensible cooling', fmt(r.sensible, d), cap],
        ['Latent cooling', fmt(r.latent, d), cap],
        ...(r.shr !== null && r.total > 0 ? [['Sensible heat ratio', fmt(r.shr, 2), '']] : []),
        ['Condensate', fmt(pints, 1), 'pints/day'],
        ...(perTon !== null ? [[us ? 'Airflow per ton' : 'Airflow per kW', fmt(perTon, 1), us ? 'cfm/ton' : 'l/s per kW']] : []),
      ]);
      el('ps-ptbody').replaceChildren(...props.filter(p => p[1] !== 'pw').map(([l, k, un, dp]) => row(l, [fmt(a[k], dp), fmt(b[k], dp)], un)));
      el('ps-summary').textContent = `${fmt(r.total, d)} ${cap} total cooling: ${fmt(r.sensible, d)} sensible, `
        + `${fmt(r.latent, d)} latent; ${fmt(pints, 1)} pints/day of condensate.`
        + (r.total < 0 ? ' A negative load denotes heating.' : '');
    } else {
      const r = condensate(input);
      fillRows(el('ps-htbody'), [
        ['Condensate', fmt(r.lbh, 2), 'lb/h', 'cf-key'], ['', fmt(r.kgh, 2), 'kg/h'], ['', fmt(r.volume, 2), us ? 'gal/h' : 'l/h'],
        ['', fmt(r.pints, 1), 'pints/day'], ['Latent heat', fmt(r.btuh, 0), 'Btu/h'], ['', fmt(r.kW, 2), 'kW'],
      ]);
      el('ps-ptbody').replaceChildren(...props.map(([l, k, un, dp]) => row(l, [fmt(r.entering[k], dp), fmt(r.leaving[k], dp)], un)));
      el('ps-summary').textContent = `${fmt(r.lbh, 2)} lb/h (${fmt(r.pints, 1)} pints/day) of condensate, `
        + `${fmt(r.btuh, 0)} Btu/h of latent heat.`;
    }
    el('ps-head').hidden = false;
    el('ps-props-wrap').hidden = false;
  }

  live(form, recalc);
  recalc();
}

// Last, so every declaration above is initialised before the calculator starts.
const form = document.getElementById('pscalc');
if (form) init(form);
