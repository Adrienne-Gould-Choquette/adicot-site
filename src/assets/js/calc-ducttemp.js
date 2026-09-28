// Temperature loss through an air duct: the form behaviour. The maths is in
// ducttemp.js; this reads the form and writes the results.
import { solve, problem, EXTERIOR } from './ducttemp.js';
import { live, num, fmt, fillRows, shareable } from './calc-kit.js';

const FIG = {
  Rectangular: ['/images/temp-loss-rectangular-duct.jpg', 852, 'Heat transfer through the wall of an insulated rectangular duct'],
  Round: ['/images/temp-loss-round-duct.jpg', 854, 'Heat transfer through the wall of an insulated round duct'],
};

function init(form) {
  const el = id => document.getElementById(id);
  shareable(form, ['s', 'h', 'w', 'd', 'x', 'q', 'ta', 'to', 'r', 'l'], el('dt-share'), el('dt-copied'));

  function recalc() {
    const shape = form.querySelector('input[name="s"]:checked')?.value ?? 'Rectangular';
    const rect = shape === 'Rectangular';
    el('dt-rect').hidden = !rect;
    el('dt-round').hidden = rect;
    el('dt-h').required = el('dt-w').required = rect;
    el('dt-d').required = !rect;
    const [src, h, alt] = FIG[shape];
    if (!el('dt-fig').src.endsWith(src)) Object.assign(el('dt-fig'), { src, height: h, alt });

    const v = {
      shape, height: num(el('dt-h')), width: num(el('dt-w')), diameter: num(el('dt-d')),
      hOutside: EXTERIOR[Number(el('dt-ext').value)].h, Q: num(el('dt-q')), tAir: num(el('dt-ta')),
      tOutside: num(el('dt-to')), rInsulation: num(el('dt-r')), length: num(el('dt-l')),
    };
    const why = problem(v);
    if (why) {
      el('dt-summary').textContent = why;
      el('dt-table').hidden = true;
      return;
    }
    const r = solve(v);
    const change = r.tExit - v.tAir;
    fillRows(el('dt-tbody'), [
      ['Exit air temperature', fmt(r.tExit, 1), '°F', 'cf-key'],
      ['Temperature change', (change > 0 ? '+' : '') + fmt(change, 2), '°F'],
      [change < 0 ? 'Heat lost' : 'Heat gained', fmt(Math.abs(r.heat), 0), 'Btu/h'],
      ['Air velocity', fmt(r.velocity, 1), 'fps'],
      ['Perimeter', fmt(r.perimeter, 2), 'ft'],
      ['h inside', fmt(r.hInside, 1), 'Btu/h·ft²·°F'],
      ['R total', fmt(r.rTotal, 2), 'h·ft²·°F/Btu'],
      ['Mass flow, ṁ', fmt(r.mDot, 0), 'lb/h'],
      ['k', r.k.toExponential(2), '1/ft'],
    ]);
    el('dt-table').hidden = false;
    el('dt-summary').textContent = `Air entering at ${fmt(v.tAir, 1)} °F leaves ${fmt(v.length, 0)} ft later at `
      + `${fmt(r.tExit, 1)} °F, ${change < 0 ? 'losing' : 'gaining'} ${fmt(Math.abs(r.heat), 0)} Btu/h.`;
  }

  live(form, recalc);
  recalc();
}

// Last, so every declaration above is initialised before the calculator starts.
const form = document.getElementById('dtcalc');
if (form) init(form);
