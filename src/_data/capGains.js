// The capital gains estimator's rate tables, printed on its page from the same
// module the calculator runs.
import { RATES, STATUSES } from '../assets/js/capgains.js';

const $ = x => '$' + x.toLocaleString('en-US');
export default Object.entries(RATES).reverse().map(([year, byStatus]) => ({
  year,
  rows: STATUSES.map(s => {
    const [top0, top15, niit, excl] = byStatus[s];
    return { status: s, zero: `${$(0)} to ${$(top0)}`, fifteen: `${$(top0 + 1)} to ${$(top15)}`, twenty: `over ${$(top15)}`, niit: $(niit), excl: $(excl) };
  }),
}));
