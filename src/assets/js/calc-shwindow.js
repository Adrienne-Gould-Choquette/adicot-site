// The single-hung window size chart's form behaviour. The table is in
// shwindow.js; this reads the form and writes the results.
import { sizes } from './shwindow.js';
import { live, fmt, fillRows, shareable } from './calc-kit.js';

// Inches as the chart gives them (19.125, not 19.13); feet and areas rounded.
function inches(x) { return String(Number(x.toFixed(4))); }

function init(form) {
  const el = id => document.getElementById(id);
  shareable(form, ['c'], el('sh-share'), el('sh-copied'));

  function recalc() {
    const code = el('sh-code').value;
    const s = sizes(code);
    if (!s) {
      el('sh-summary').textContent = 'Choose a window size code.';
      el('sh-table').hidden = true;
      return;
    }
    const wh = d => `${inches(d.w)} × ${inches(d.h)}`;
    fillRows(el('sh-tbody'), [
      ['Frame size', wh(s.frame), 'in'],
      ['', `${fmt(s.frameFt.w)} × ${fmt(s.frameFt.h)}`, 'ft'],
      ['Frame area', fmt(s.frame.area, 0), 'in²'],
      ['', fmt(s.frameFt.area), 'ft²'],
      ['Masonry opening', wh(s.masonry), 'in'],
      ['Masonry opening area', fmt(s.masonry.area, 0), 'in²'],
      ['Clear opening', wh(s.clear), 'in'],
      ['Clear opening area', fmt(s.clear.area, 0), 'in²'],
    ]);
    el('sh-table').hidden = false;
    el('sh-summary').textContent = `${code.replace('*', '')}: frame ${wh(s.frame)} in, masonry opening `
      + `${wh(s.masonry)} in, clear opening ${wh(s.clear)} in.` + (s.egress ? ' Egress on all floors.' : '');
  }

  live(form, recalc);
  recalc();
}

// Last, so every declaration above is initialised before the calculator starts.
const form = document.getElementById('shcalc');
if (form) init(form);
