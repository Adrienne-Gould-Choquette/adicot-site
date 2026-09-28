// The cooling load estimator's drop-down and printed check figures, from the
// same module the calculator runs.
import { BUILDINGS } from '../assets/js/coolingload.js';

const fig = v => v === 0 ? '' : v;
const groups = new Map();
for (const [name] of BUILDINGS) {
  const i = name.indexOf(': ');
  const head = name.slice(0, i);
  if (!groups.has(head)) groups.set(head, []);
  groups.get(head).push({ value: name, label: name.slice(i + 2) });
}
export default {
  groups: [...groups].map(([label, options]) => ({ label, options })),
  table: BUILDINGS.map(([name, , occ, lights, ref]) => ({ name, occ: occ.map(fig), lights: lights.map(fig), ref: ref.map(fig) })),
};
