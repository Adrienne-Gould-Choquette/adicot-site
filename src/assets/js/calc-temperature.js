// The temperature converter's form behaviour. The conversions are in tempconv.js;
// this reads the form and writes the results.
import { convert, problem, scale, SCALES } from './tempconv.js';
import { live, num, fmt, fillRows, shareable } from './calc-kit.js';

function init(form) {
  const el = id => document.getElementById(id);
  const temp = el('tc-temp');
  const table = el('tc-table');
  const summary = el('tc-summary');

  // Reopen with the inputs from a shared link, before the first calculation.
  shareable(form, ['t', 'u'], el('tc-share'), el('tc-copied'));

  function recalc() {
    const from = form.querySelector('input[name="u"]:checked')?.value ?? 'F';
    const t = num(temp);
    const why = problem(t, from);
    if (why) {
      summary.textContent = why;
      table.hidden = true;
      return;
    }
    const all = convert(t, from);
    fillRows(el('tc-tbody'), SCALES.map(s =>
      [s.name, fmt(all[s.code]), s.symbol, s.code === from ? 'is-given' : '']));
    table.hidden = false;

    const given = scale(from);
    const others = SCALES.filter(s => s.code !== from).map(s => `${fmt(all[s.code])} ${s.symbol}`);
    summary.textContent = `${fmt(t)} ${given.symbol} = ${others.slice(0, -1).join(', ')} and ${others.at(-1)}.`;
  }

  live(form, recalc);
  recalc();
}

// Last, so every declaration above is initialised before the calculator starts.
const form = document.getElementById('tempcalc');
if (form) init(form);
