// The home price comparison's form behaviour. The maths is in homeprice.js; this
// reads the form and writes the results.
import { compare, problem } from './homeprice.js';
import { live, num, fmt, fillRows, shareable } from './calc-kit.js';

const FIELDS = { savings: 'sv', rate: 'ir', taxRate: 'tr', rent: 'rn', hoa: 'ho', insurance: 'in', parking: 'pk',
  price: 'pp', closing: 'cc', mortgageRate: 'mr', years: 'yr', newHoa: 'nh', newParking: 'np', insurancePct: 'hi', taxPct: 'pt' };
const PERCENT = new Set(['rate', 'taxRate', 'closing', 'mortgageRate', 'insurancePct', 'taxPct']);
// Left blank, these take the calculator's defaults rather than 0.
const DEFAULTED = new Set(['insurancePct', 'taxPct']);

function init(form) {
  const el = id => document.getElementById(id);
  shareable(form, Object.values(FIELDS), el('hp-share'), el('hp-copied'));

  function recalc() {
    const v = {};
    for (const [k, id] of Object.entries(FIELDS)) {
      const x = num(el(`hp-${id}`));
      v[k] = x === null || Number.isNaN(x) || !PERCENT.has(k) ? x : x / 100;
    }
    // With savings covering the price and closing costs there is no mortgage, so
    // its inputs and results are hidden rather than shown empty.
    const cash = v.price > 0 && v.savings !== null && !Number.isNaN(v.savings)
      && v.price * (1 + (v.closing ?? 0)) <= v.savings;
    for (const id of ['hp-mr', 'hp-yr']) el(id).closest('.field').hidden = cash;
    const why = problem(v);
    if (why) {
      el('hp-summary').textContent = why;
      el('hp-table').hidden = true;
      return;
    }
    const r = compare(Object.fromEntries(Object.entries(v).filter(([k, x]) => !(x === null && DEFAULTED.has(k))).map(([k, x]) => [k, x ?? 0])));
    const $ = x => (x < 0 ? '−$' : '$') + fmt(Math.abs(x));
    fillRows(el('hp-tbody'), [
      ['Current housing expenses', $(r.currentHousing), '/mo'],
      ['New housing expenses', $(r.newHousing), '/mo'],
      ...(r.mortgage > 0 ? [['  of which mortgage payment', $(r.payment), '/mo']] : []),
      ['Current interest earned, after tax', $(r.currentInterest), '/mo'],
      ['New interest earned, after tax', $(r.newInterest), '/mo'],
      ['Housing expense change', $(r.housingChange), '/mo'],
      ['Interest income change', $(r.interestChange), '/mo'],
      ['Net impact', $(r.net), '/mo', 'cf-key'],
      ['', $(r.netAnnual), '/yr'],
      ...(r.mortgage > 0 ? [['Mortgage amount', $(r.mortgage), '']] : []),
    ]);
    el('hp-table').hidden = false;
    el('hp-summary').textContent = (r.mortgage > 0 ? '' : 'Cash purchase: your savings cover the price and closing costs. ')
      + (r.saves
        ? `The new home will save you about ${$(r.net)} a month (${$(r.netAnnual)} a year).`
        : `The new home will cost about ${$(r.net)} more a month (${$(r.netAnnual)} a year).`);
  }

  live(form, recalc);
  recalc();
}

// Last, so every declaration above is initialised before the calculator starts.
const form = document.getElementById('hpcalc');
if (form) init(form);
