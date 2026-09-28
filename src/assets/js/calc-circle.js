// The circle and sphere calculator's form behaviour. The maths is in circle.js;
// this reads the form and writes the results.
import { solve, problem, POWER } from './circle.js';
import { live, num, fmt, fillRows, shareable, startingValues } from './calc-kit.js';

const SUBS = { US: ['in', 'ft'], Metric: ['cm', 'm'] };
// Moving between unit systems maps inches to centimetres and feet to metres,
// converting the value entered by the length factor raised to its power.
const PAIR = { in: ['cm', 2.54], ft: ['m', 0.3048], cm: ['in', 1 / 2.54], m: ['ft', 1 / 0.3048] };

function init(form) {
  const el = id => document.getElementById(id);
  const pick = name => form.querySelector(`input[name="${name}"]:checked`)?.value;
  const sub = el('cs-u');
  const fill = (system, chosen) => {
    sub.replaceChildren(...SUBS[system].map(u => new Option(u, u, false, u === chosen)));
  };
  fill(pick('s'), 'in');
  // A shared link may name ft or m, which must exist as an option before it is set.
  const q = startingValues();
  if (q.get('s') === 'Metric') fill('Metric', 'cm');
  shareable(form, ['s', 't', 'v', 'u'], el('cs-share'), el('cs-copied'));

  let system = pick('s');
  form.addEventListener('change', e => {
    if (e.target.name !== 's' || e.target.value === system) return;
    const [next, f] = PAIR[sub.value];
    const v = num(el('cs-v'));
    if (v !== null && !Number.isNaN(v)) el('cs-v').value = String(Number((v * f ** POWER[pick('t')]).toPrecision(6)));
    system = e.target.value;
    fill(system, next);
  }, true);

  function recalc() {
    const type = pick('t'), unit = sub.value, v = num(el('cs-v'));
    const why = problem(v);
    if (why) {
      el('cs-summary').textContent = why;
      el('cs-table').hidden = true;
      return;
    }
    const r = solve(type, v, unit);
    const us = system === 'US';
    const [a, b] = us ? ['in', 'ft'] : ['cm', 'm'];
    const k = us ? ['In', 'Ft'] : ['Cm', 'M'];
    const row = (label, key, p) => [
      [label, fmt(r[key + k[0]], 4), a + (p > 1 ? (p === 2 ? '²' : '³') : '')],
      ['', fmt(r[key + k[1]], 4), b + (p > 1 ? (p === 2 ? '²' : '³') : '')],
    ];
    fillRows(el('cs-tbody'), [
      ...row('Radius', 'radius', 1), ...row('Diameter', 'diameter', 1),
      ...row('Area of a circle', 'circleArea', 2), ...row('Circumference', 'circum', 1),
      ...row('Volume of a sphere', 'sphereVol', 3), ...row('Surface area of a sphere', 'sphereArea', 2),
    ]);
    el('cs-table').hidden = false;
    el('cs-summary').textContent = `Diameter ${fmt(r['diameter' + k[0]], 4)} ${a}, radius ${fmt(r['radius' + k[0]], 4)} ${a}.`;
  }

  live(form, recalc);
  // Reset restores the default unit system, so restore its unit list too.
  form.addEventListener('reset', () => setTimeout(() => { system = 'US'; fill('US', 'in'); recalc(); }, 0));
  recalc();
}

// Last, so every declaration above is initialised before the calculator starts.
const form = document.getElementById('cscalc');
if (form) init(form);
