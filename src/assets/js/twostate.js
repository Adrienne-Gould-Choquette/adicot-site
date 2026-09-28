// Two psychrometric states (entering and leaving air), and the condensate
// between them as Condensate Generated V2.16 computes it, formula for formula
// (7000 gr/lb, 1.04 lb per pint ...). check-calculators.mjs holds the states to
// Psychrometric 2 Condition V1.1 and the condensate to its workbook. The coil
// loads between the states are in airside.js.
import { state } from './psychsheet.js';

// Excel's ROUND: halves away from zero, judged on the 15 significant digits Excel
// keeps, so 1.00005 rounds up even though its double is a hair below.
export function round(x, d) {
  const a = Number(Math.abs(x).toPrecision(15));
  return Math.sign(x) * Math.round(a * 10 ** d) / 10 ** d;
}

// units: 'US' | 'Metric'; mode as psychsheet; entering/leaving: { first, second }
// (second is the RH for 'dp-rh'), each with its own optional mode that overrides
// the shared one; airflow in cfm or l/s; altitude in ft or m.
export function states({ units, mode, entering, leaving, altitude }) {
  const one = s => { const m = s.mode ?? mode; return state({ units, mode: m, first: s.first, second: m === 'dp-rh' ? null : s.second,
    rh: m === 'dp-rh' ? s.second : null, altitude }, true); };
  return [one(entering), one(leaving)];
}

// Condensate Generated: water condensed between the two states, in several units.
export function condensate(input) {
  const us = input.units === 'US';
  const [a, b] = states(input);
  const cfm = us ? input.airflow : input.airflow * 2.1188799727597;
  const lbh = cfm / a.ip.v * 60 * (a.grains - b.grains) / 7000;
  const pints = lbh / 1.04 * 24;
  return {
    entering: a, leaving: b, lbh, kgh: lbh * 0.453592,
    volume: us ? lbh * 0.11983 : lbh * 0.4535921,   // gal/h, or l/h
    pints, btuh: pints * 1.04 / 24 * 1055, kW: pints * 1.04 / 24 * 1055 / 3.412142 / 1000,
  };
}
