// The break-even calculator's form behaviour. The maths is in breakeven.js; this
// reads the form and writes the results and the volume table.
import { analyse, problem } from './breakeven.js';
import { live, num, fmt, fillRows, shareable } from './calc-kit.js';

function init(form) {
  const el = id => document.getElementById(id);
  shareable(form, ['nm', 'pr', 'vo', 'c1', 'c2', 'c3', 'c4', 'c5', 'f1', 'f2', 'f3', 'f4', 'f5'], el('be-share'), el('be-copied'));

  function recalc() {
    const list = ids => ids.map(id => num(el(`be-${id}`)) ?? 0);
    const v = { price: num(el('be-pr')), volume: num(el('be-vo')),
      variable: list(['c1', 'c2', 'c3', 'c4', 'c5']), fixed: list(['f1', 'f2', 'f3', 'f4', 'f5']) };
    const why = problem(v);
    if (why) {
      el('be-summary').textContent = why;
      el('be-table').hidden = true;
      el('be-vol-wrap').hidden = true;
      return;
    }
    const r = analyse(v);
    const $ = x => (x < 0 ? '−$' : '$') + fmt(Math.abs(x));
    const rows = [
      ['Total sales', $(r.totalSales), ''],
      ['Variable costs per unit', $(r.varPerUnit), ''],
      ['Unit contribution margin', $(r.margin), ''],
      ['Total fixed costs', $(r.totalFixed), ''],
      ['Net profit (loss)', $(r.net), ''],
      ['Break-even point', r.breakEven === null ? 'none' : fmt(r.breakEven, 1), r.breakEven === null ? '' : 'units', 'cf-key'],
    ];
    if (r.beyond) rows.push([`Profit on the remaining ${fmt(r.beyond.units, 0)} units`, $(r.beyond.profit), '']);
    fillRows(el('be-tbody'), rows);
    el('be-table').hidden = false;
    el('be-vtbody').replaceChildren(...r.table.map((t, i) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `<th scope="row">${i * 10} %</th><td></td><td></td><td></td><td></td>`;
      [fmt(t.units, 0), $(t.totalCost), $(t.sales), $(t.profit)].forEach((s, j) => { tr.children[j + 1].textContent = s; });
      return tr;
    }));
    el('be-vol-wrap').hidden = false;
    const name = el('be-name').value.trim();
    el('be-summary').textContent = (name ? `${name}: ` : '') + (r.breakEven === null
      ? (r.margin <= 0 ? 'the price does not cover the variable cost per unit, so there is no break-even point.' : 'enter the fixed costs to find the break-even point.')
      : `break even at ${fmt(r.breakEven, 1)} units per period; net profit at ${fmt(v.volume, 0)} units is ${$(r.net)}.`);
  }

  live(form, recalc);
  recalc();
}

// Last, so every declaration above is initialised before the calculator starts.
const form = document.getElementById('becalc');
if (form) init(form);
