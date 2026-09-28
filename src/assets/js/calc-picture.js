// The picture hanger height calculator's form behaviour. The maths is in
// picture.js; this reads the form and writes the results.
import { hang, problem } from './picture.js';
import { live, num, fillRows, shareable } from './calc-kit.js';

// "69 1/4 in", with the exact decimal alongside (the workbook's rounding of a
// fraction above 7/8 differs between results; the exact value never does).
function show(r) {
  const frac = r.frac && r.frac !== '-' ? ` ${r.frac}` : '';
  return `${r.whole}${frac} in (${String(Number(r.exact.toFixed(4)))})`;
}

function init(form) {
  const el = id => document.getElementById(id);
  shareable(form, ['h', 'hf', 'd', 'df', 'c', 'cf', 'w', 'wf'], el('ph-share'), el('ph-copied'));
  const read = id => [num(el(`ph-${id}`)), el(`ph-${id}f`).value];

  function recalc() {
    const w = read('w');
    const v = { height: read('h'), hookDrop: read('d'), center: read('c'), width: w[0] === null ? null : w };
    const why = problem(v);
    if (why) {
      el('ph-summary').textContent = why;
      el('ph-table').hidden = true;
      return;
    }
    const r = hang(v);
    const rows = [['Hook height, from the floor', show(r.hook), '', 'cf-key']];
    if (r.centerLine) rows.push(['Centre line, from either side', show(r.centerLine), ''], ['Thirds of the width', show(r.third), '']);
    fillRows(el('ph-tbody'), rows);
    el('ph-table').hidden = false;
    el('ph-summary').textContent = `Put the hook ${show(r.hook).replace(/ \(.*/, '')} above the floor.`;
  }

  live(form, recalc);
  recalc();
}

// Last, so every declaration above is initialised before the calculator starts.
const form = document.getElementById('phcalc');
if (form) init(form);
