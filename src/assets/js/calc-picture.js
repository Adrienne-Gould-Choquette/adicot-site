// The picture hanger height calculator's form behaviour. The maths is in
// picture.js; this reads the form and writes the results.
import { hang, hangMetric, problem, toCm, toInches } from './picture.js';
import { live, num, fillRows, shareable } from './calc-kit.js';

const FIELDS = ['h', 'd', 'c', 'w'];
// The example each field shows in centimetres, and what the inch-only wording becomes.
const EG_CM = { h: '61', d: '8', c: '152', w: '91' };
const EYE = { US: '60 in is the recommended eye level for the center of a picture.', SI: '152 cm (60 in) is the recommended eye level for the center of a picture.' };
const ROUND = { US: 'Rounded up to the next ⅛ in; the exact value is in brackets.', SI: 'Rounded to the nearest millimeter.' };

// "69 1/4 in", with the exact decimal alongside (the workbook's rounding of a
// fraction above 7/8 differs between results; the exact value never does).
function show(r) {
  const frac = r.frac && r.frac !== '-' ? ` ${r.frac}` : '';
  return `${r.whole}${frac} in (${String(Number(r.exact.toFixed(4)))})`;
}

function init(form) {
  const el = id => document.getElementById(id);
  const metric = () => form.elements.u.value === 'SI';
  shareable(form, ['u', 'h', 'hf', 'd', 'df', 'c', 'cf', 'w', 'wf'], el('ph-share'), el('ph-copied'));
  const read = id => [num(el(`ph-${id}`)), el(`ph-${id}f`).value];

  // Centimetres are one decimal field; inches are whole inches and an eighth.
  function dress() {
    const si = metric();
    for (const u of form.querySelectorAll('[data-ph-u]')) u.textContent = si ? 'cm' : 'in';
    for (const id of FIELDS) {
      const input = el(`ph-${id}`);
      el(`ph-${id}f`).hidden = si;
      input.step = si ? 'any' : '1';
      input.inputMode = si ? 'decimal' : 'numeric';
      input.placeholder = si ? EG_CM[id] : input.dataset.eg;
      input.setAttribute('aria-label', input.getAttribute('aria-label').replace(/, .*/, si ? ', centimeters' : ', whole inches'));
    }
    el('ph-eye').textContent = EYE[si ? 'SI' : 'US'];
    el('ph-round').textContent = ROUND[si ? 'SI' : 'US'];
  }

  // Switching units converts what is entered: 60 in becomes 152.4 cm, not 60 cm.
  let current = form.elements.u.value;
  form.addEventListener('change', e => {
    if (e.target.name !== 'u' || e.target.value === current) return;
    current = e.target.value;
    for (const id of FIELDS) {
      const input = el(`ph-${id}`), eighth = el(`ph-${id}f`), v = num(input);
      if (v === null || Number.isNaN(v)) continue;
      if (current === 'SI') { input.value = String(toCm([v, eighth.value])); eighth.value = '0'; }
      else { const [whole, e8] = toInches(v); input.value = String(whole); eighth.value = e8; }
    }
    dress();
  }, true);   // capture, so values are converted before the recalculation runs
  // Reset puts the radios back to inches after this event; follow them.
  form.addEventListener('reset', () => setTimeout(() => { current = form.elements.u.value; dress(); }, 0));

  function recalc() {
    const si = metric(), w = read('w');
    const v = { height: read('h'), hookDrop: read('d'), center: read('c'), width: w[0] === null ? null : w };
    const why = problem(v, si ? 'centimeters' : 'inches');
    if (why) {
      el('ph-summary').textContent = why;
      el('ph-table').hidden = true;
      return;
    }
    let hook, rows;
    if (si) {
      const r = hangMetric({ height: v.height[0], hookDrop: v.hookDrop[0], center: v.center[0], width: v.width?.[0] });
      const cm = x => `${x.toFixed(1)} cm`;
      hook = cm(r.hook);
      rows = [['Hook height, from the floor', hook, '', 'cf-key']];
      if (v.width) rows.push(['Centre line, from either side', cm(r.centerLine), ''], ['Thirds of the width', cm(r.third), '']);
    } else {
      const r = hang(v);
      hook = show(r.hook).replace(/ \(.*/, '');
      rows = [['Hook height, from the floor', show(r.hook), '', 'cf-key']];
      if (r.centerLine) rows.push(['Centre line, from either side', show(r.centerLine), ''], ['Thirds of the width', show(r.third), '']);
    }
    fillRows(el('ph-tbody'), rows);
    el('ph-table').hidden = false;
    el('ph-summary').textContent = `Put the hook ${hook} above the floor.`;
  }

  dress();
  live(form, recalc);
  recalc();
}

// Last, so every declaration above is initialised before the calculator starts.
const form = document.getElementById('phcalc');
if (form) init(form);
