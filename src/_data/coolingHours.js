// The annual cooling cost page's city list, from the module the page runs.
import { COOLING_HOURS } from '../assets/js/cooling-hours.js';

const byState = new Map();
for (const [city, hours] of COOLING_HOURS) {
  const [st, ...rest] = city.split('-');
  if (!byState.has(st)) byState.set(st, []);
  byState.get(st).push({ value: city, label: rest.join('-').trim(), hours });
}
export default { states: [...byState].map(([state, cities]) => ({ state, cities })) };
