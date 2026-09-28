// AirGuide grilles and registers for the diffuser sizer: the catalog types it
// offers and the size selection, using the same rules as the Grille Tech
// workbook (diffuser-size.js):
//   - a size shows when its airflow at the chosen neck velocity column (the last
//     catalog velocity at or below it) is at least the design airflow;
//   - not when its largest catalog airflow is more than 4 × the design (or, at
//     55 cfm and below, when its smallest is above 55 cfm);
//   - not when its smallest catalog airflow is above the design airflow at
//     neck velocities over 300 fpm, or above 1.2 × the design airflow;
//   - not when a maximum NC is given and the size is rated above it at that column.
// The result has the shape diffuser-size.js select() returns, so the page draws
// either catalog the same way.
import { AG_CB, AG_RA, AG_V } from './airguide-tables.js';

const CB = (ways, key) => ({ cat: AG_CB, kind: 'supply', throwKey: key, ways });
const V = (deg, key, i) => ({ cat: AG_V, kind: 'sidewall', throwKey: key, pressureKey: `TP${key.slice(1)}`, akIndex: i, deg });
export const AIRGUIDE = {
  'AirGuide: RA fixed blade return grille': { cat: AG_RA, kind: 'return' },
  'AirGuide: V/VH sidewall register, 0° deflection': V('0°', 'T0', 0),
  'AirGuide: V/VH sidewall register, 22½° deflection': V('22½°', 'T22', 1),
  'AirGuide: V/VH sidewall register, 45° deflection': V('45°', 'T45', 2),
  'AirGuide: CB curved blade, 1-way': CB(1, '1W'),
  'AirGuide: CB curved blade, 2-way': CB(2, '2W'),
  'AirGuide: CB curved blade, 3-way': CB(3, '3W'),
  'AirGuide: CB curved blade, 4-way': CB(4, '4W'),
};
export const isAirguide = type => Object.hasOwn(AIRGUIDE, type);

const isNum = v => typeof v === 'number';
// The last catalog velocity at or below v, as an index; -1 below the first.
const column = (vel, v) => vel.reduce((k, h, i) => (h <= v ? i : k), -1);

export function selectAirguide({ type, cfm, velocity, maxNc = null }) {
  const t = AIRGUIDE[type];
  const { cat } = t;
  const col = column(cat.vel, velocity);
  const pKey = t.pressureKey ?? Object.keys(cat.header)[0];
  const groups = [];
  for (const s of cat.sizes) {
    const q = s.rows.CFM, nums = q.filter(isNum);
    const min = Math.min(...nums), max = Math.max(...nums);
    if (col < 0 || !isNum(q[col]) || q[col] < cfm) continue;
    if (cfm <= 55 ? !(q[0] <= 55) : max > 4 * cfm) continue;
    if (cfm <= 55 ? min > 55 : (velocity > 300 && min > cfm) || min > 1.2 * cfm) continue;
    const nc = s.rows.NC?.[col];
    if (maxNc !== null && maxNc !== '' && isNum(nc) && nc > maxNc) continue;
    const throwRow = t.throwKey ? [['Throw3', ...s.rows[t.throwKey].map(v => v ?? '')]] : [];
    const rows = [['CFM', ...q], ...(t.kind === 'sidewall' ? [['NC', ...s.rows.NC], ...throwRow] : [...throwRow, ['NC', ...s.rows.NC]])];
    const ak = Array.isArray(s.ak) ? s.ak[t.akIndex] : s.ak;
    groups.push({
      labels: s.labels.map(l => l.replace('x', ' x ')),
      ak: ak === undefined ? null : String(ak),
      area: s.area,
      rows,
    });
  }
  return {
    cfm, velocity, header: cat.vel, column: col, groups,
    pressure: [pKey.startsWith('TP') ? 'TP' : 'SP', ...cat.header[pKey]],
  };
}

// AirGuide's catalog notes that apply to each kind of type.
export function airguideNote(type) {
  const t = AIRGUIDE[type];
  if (!t) return '';
  if (t.kind === 'return') return 'AirGuide RA data: fixed blade return grilles; negative static pressure at the grille. NC based on 10 dB room absorption.';
  if (t.kind === 'sidewall') return `AirGuide V/VH data: double deflection grille with opposed blade damper (register), blades at ${t.deg} vertical deflection. Throws at terminal velocities of 150, 100 and 50 fpm, isothermal, with the ceiling (coanda) effect. NC at 0° deflection.`;
  return `AirGuide CB data, ${t.ways}-way pattern: throws at terminal velocities of 150, 100 and 50 fpm with a 20 °F cooling ΔT, surface mounted with the ceiling effect. Blades fully open reduce the NC by 6 and multiply the total pressure by 0.3.`;
}
