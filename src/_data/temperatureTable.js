// Common temperatures in all four scales, for the reference table on the
// temperature converter page. Built from the same module the converter runs,
// so the table and the calculator cannot disagree.
import { convert } from '../assets/js/tempconv.js';

const fmt = x => {
  const s = x.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return /^-0(\.0+)?$/.test(s) ? s.slice(1) : s;
};

const POINTS = [
  ['Absolute zero', 0, 'K'],
  ['Liquid nitrogen boils', -195.79, 'C'],
  ['Celsius and Fahrenheit agree', -40, 'C'],
  ['Typical freezer', 0, 'F'],
  ['Water freezes', 0, 'C'],
  ['Cooling-coil leaving air, typical', 55, 'F'],
  ['Room temperature', 20, 'C'],
  ['Summer indoor design', 75, 'F'],
  ['Body temperature', 37, 'C'],
  ['Summer outdoor design, hot climate', 105, 'F'],
  ['Water heater storage, typical', 140, 'F'],
  ['Water boils at sea level', 100, 'C'],
  ['Surface of the sun', 5772, 'K'],
];

export default POINTS.map(([label, t, from]) => {
  const all = convert(t, from);
  return { label, F: fmt(all.F), C: fmt(all.C), K: fmt(all.K), R: fmt(all.R) };
});
