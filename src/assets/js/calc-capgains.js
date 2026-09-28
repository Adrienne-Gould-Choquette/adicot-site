// The capital gains estimator's form behaviour. The maths is in capgains.js; this
// reads the form and writes the results.
import { estimate, problem } from './capgains.js';
import { live, num, fmt, fillRows, shareable } from './calc-kit.js';

function init(form) {
  const el = id => document.getElementById(id);
  shareable(form, ['pp', 'sp', 'ex', 'cm', 'ti', 'mo', 'nh', 'pr', 'st', 'yr'], el('cg-share'), el('cg-copied'));

  function recalc() {
    const pct = num(el('cg-cm'));
    const v = {
      purchase: num(el('cg-pp')), sale: num(el('cg-sp')), expenses: num(el('cg-ex')),
      commission: pct === null || Number.isNaN(pct) ? pct : pct / 100, income: num(el('cg-ti')),
      mortgage: num(el('cg-mo')) ?? 0, newHome: num(el('cg-nh')) ?? 0,
      primary: form.querySelector('input[name="pr"]:checked')?.value === 'yes', status: el('cg-st').value,
      year: Number(el('cg-yr').value),
    };
    const why = problem(v);
    el('cg-warn').hidden = true;
    if (why) {
      el('cg-summary').textContent = why;
      el('cg-table').hidden = true;
      return;
    }
    const r = estimate(v);
    const $ = x => (x < 0 ? '−$' : '$') + fmt(Math.abs(x), 0);
    fillRows(el('cg-tbody'), [
      ['Sales commission', $(r.salesCommission), ''],
      ['Capital gain', $(r.gain), ''],
      ['Excluded (primary residence)', $(r.excluded), ''],
      ['Taxable gain', $(r.taxable), ''],
      ['Gain taxed at 0%', $(r.at0), ''],
      ['Gain taxed at 15%', $(r.at15), ''],
      ['Gain taxed at 20%', $(r.at20), ''],
      ['Net investment income tax (3.8%)', $(r.niit), ''],
      ['Capital gains tax', $(r.tax), '', 'cf-key'],
      ['Effective rate on the taxable gain', fmt(r.rate * 100, 2), '%'],
      ['Net proceeds from sale', $(r.netProceeds), ''],
      ['Remaining cash on hand', $(r.cashOnHand), ''],
    ]);
    el('cg-table').hidden = false;
    el('cg-summary').textContent = r.gain <= 0
      ? `No gain on the sale, so no capital gains tax. Net proceeds ${$(r.netProceeds)}.`
      : `Estimated ${v.year} federal tax on the gain ${$(r.tax)}; net proceeds ${$(r.netProceeds)}.`;
    if (r.gain > 0 && r.taxable === 0) {
      el('cg-warn').textContent = 'The whole gain is within the primary-residence exclusion.';
      el('cg-warn').hidden = false;
    }
  }

  live(form, recalc);
  recalc();
}

// Last, so every declaration above is initialised before the calculator starts.
const form = document.getElementById('cgcalc');
if (form) init(form);
