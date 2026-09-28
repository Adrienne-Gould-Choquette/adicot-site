// Annual cooling cost: the electricity to run an air conditioner through a year's
// cooling, from its capacity, its seasonal efficiency and the equivalent
// full-load cooling hours for the location.
//
//   kWh/yr = capacity (Btu/h) ÷ SEER (Btu/Wh) × full-load hours ÷ 1000
//   cost   = kWh/yr × electricity rate ($/kWh)
//
// SEER2 is converted to SEER with the equipment-type factors efficiency.js uses
// (the EER/SEER2 converter), so the two pages agree. No workbook:
// check-handworked.mjs holds this to worked examples.
import { convert, EQUIPMENT } from './efficiency.js';

export { EQUIPMENT };
// EIA Electric Power Monthly, Table 5.3: US average residential price, 12 months
// ending July 2026, 17.99 cents/kWh.
export const DEFAULT_RATE = 0.18;

export function annualCost({ capacity, rating, value, equipment, hours, rate }) {
  const seer = rating === 'SEER2' ? convert(value, 'SEER2', equipment).SEER : value;
  const watts = capacity / seer;                 // average power at rated efficiency, W
  const kwh = watts * hours / 1000;
  return { seer, watts, kwh, cost: kwh * rate, monthly: kwh * rate / 12 };
}

export function problem({ capacity, rating, value, equipment, hours, rate }) {
  const fields = [[capacity, 'the cooling capacity', 'The cooling capacity'], [value, `the ${rating}`, `The ${rating}`],
    [hours, 'the full-load cooling hours, or choose a city', 'The full-load cooling hours'], [rate, 'the electricity rate', 'The electricity rate']];
  for (const [v, enter, name] of fields) {
    if (v === null) return `Enter ${enter}.`;
    if (Number.isNaN(v)) return `${name} is not a number.`;
  }
  if (!(capacity > 0)) return 'The cooling capacity must be more than zero.';
  if (!(value > 0)) return `The ${rating} must be more than zero.`;
  if (rating === 'SEER2' && !EQUIPMENT.includes(equipment)) return 'Choose the equipment type, to convert SEER2 to SEER.';
  if (hours < 0) return 'The full-load cooling hours cannot be negative.';
  if (rate < 0) return 'The electricity rate cannot be negative.';
  return null;
}
