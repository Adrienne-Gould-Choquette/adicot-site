// Supply diffuser and return grille sizing: the sizes in a catalog that carry the
// required airflow at the chosen neck velocity without being oversized, and,
// optionally, without exceeding a noise criterion.
//
// A port of Diffuser Size Calculator V3.20.xlsx. sheet() reproduces Sheet1 cell
// for cell (the mirrored catalog, and the N/O/P flags that show or hide each
// size), so check-calculators.mjs can hold it to the workbook's own answers;
// select() is what the page uses. A size is shown when, with its airflow row
// read in the column of the highest listed velocity at or below the one given:
//   1. its airflow there is at least the required airflow,
//   2. its largest airflow in any column is at most 4 x the requirement, and
//   3. its smallest airflow is at most the requirement (1.2 x at or below 300 fpm);
// at 55 cfm or less, 2 and 3 become "first column <= 55" and "smallest <= 55";
// and, if a maximum NC is given, its NC in that column is not above it.
import { CL1, CL2, CL3, CL4, CL1M, Return, TYPES } from './diffuser-size-tables.js';
import { isAirguide, selectAirguide } from './airguide-diffusers.js';

export { TYPES };
export const RETURN = 'Return Grille';
const CATALOG = {
  'Supply: 1-Way Curved Blade, Louvered Face': CL1,
  'Supply: 1-Way Multi-Shutter': CL1M,
  'Supply: 2-Way Curved Blade, Louvered Face': CL2,
  'Supply: 3-Way Curved Blade, Louvered Face': CL3,
  'Supply: 4-Way Curved Blade, Louvered Face': CL4,
};
// The types offered, in the workbook's drop-down order.
export const OFFERED = [RETURN, 'Supply: 1-Way Curved Blade, Louvered Face', 'Supply: 1-Way Multi-Shutter',
  'Supply: 2-Way Curved Blade, Louvered Face', 'Supply: 3-Way Curved Blade, Louvered Face', 'Supply: 4-Way Curved Blade, Louvered Face'];
export const specSheet = type => (isAirguide(type) ? 'https://www.airguidemfg.com/' : TYPES.find(t => t[0].toLowerCase() === String(type).toLowerCase())?.[1] ?? '');

const same = (a, b) => String(a).toLowerCase() === String(b).toLowerCase();   // Excel's = on text
const ERR = { error: true };
const isErr = v => v === ERR;
const isNum = v => typeof v === 'number';

// Excel LOOKUP(x, header, row): the last header value <= x (headers ascending).
function lookup(x, header, row) {
  if (!isNum(x)) return ERR;
  let k = -1;
  for (let i = 0; i < header.length; i++) if (isNum(header[i]) && header[i] <= x) k = i;
  return k < 0 ? ERR : row[k];
}
const times1 = v => (isErr(v) ? ERR : isNum(v) ? v : v === false ? 0 : v === true ? 1 : ERR);   // "" * 1 is #VALUE!
const nums = row => row.filter(isNum);                          // MIN/MAX skip text and logicals
const min = row => (nums(row).length ? Math.min(...nums(row)) : 0);
const max = row => (nums(row).length ? Math.max(...nums(row)) : 0);
const le = (v, n) => (isNum(v) ? v <= n : false);               // text compares above any number
const add = (...xs) => (xs.some(isErr) ? ERR : xs.reduce((s, x) => s + x, 0));

// The page inputs as the workbook takes them: US airflow in cfm, metric in l/s
// (x 2.11888, rounded to whole cfm); US velocity in fpm, metric in m/s.
export const cfmOf = (units, flow) => Math.sign(flow) * Math.round(Math.abs(units === 'US' ? flow : flow * 2.11888));
// Rounded to 1e-6 fpm, as the workbook does, so 2.54 m/s is exactly 500 fpm.
export const fpmOf = (units, speed) => (units === 'US' ? speed : Math.round(speed * 196.850393700787 * 1e6) / 1e6);

// Sheet1 rows 8..99 (supply) and 102..155 (return): the mirrored catalog cells
// (columns A..J / A..M) and the flags N, O, P; a size group shows when P = 0 on
// its CFM row. Returns { supply: [{ r, cells, N, O, P }], ret: [...] }.
export function sheet({ type, cfm, velocity, maxNc = null }) {
  const isReturn = same(type, RETURN);
  const cat = Object.entries(CATALOG).find(([k]) => same(k, type))?.[1] ?? null;
  const mirror = (rows, k, width) => Array.from({ length: width }, (_, j) => {
    const v = rows?.[k]?.[j];
    return v === null || v === undefined ? '' : v;
  });
  const supply = [], ret = [];
  for (let k = 0; k <= 91; k++) supply.push({ r: 8 + k, cells: !isReturn && cat ? mirror(cat, k, 10) : Array(10).fill('') });
  for (let k = 0; k <= 53; k++) ret.push({ r: 102 + k, cells: isReturn ? mirror(Return, k, 13) : Array(13).fill(false) });

  // Rows below the two header rows, as N_r, O_r and P_r are written on Sheet1.
  const flags = (rows, width, notOurs, ncOffset) => {
    const header = rows[0].cells.slice(2, width);
    for (let i = 2; i < rows.length; i++) {
      const row = rows[i], prev = rows[i - 1];
      const B = row.cells[1], data = row.cells.slice(2, width);
      if (notOurs) row.N = 1;
      else if (B !== 'CFM') row.N = prev.N;
      else { const v = times1(lookup(velocity, header, data)); row.N = isErr(v) ? ERR : v >= cfm ? 0 : 1; }
      if (B !== 'CFM') row.O = prev.O;
      else if (cfm <= 55) row.O = le(data[0], 55) ? 0 : 1;
      else row.O = max(data) > 4 * cfm ? 1 : 0;
      let tail = prev.P;
      if (B === 'CFM') {
        tail = cfm <= 55 ? (min(data) <= 55 ? 0 : 1)
          : velocity > 300 && min(data) > cfm ? 1 : min(data) > 1.2 * cfm ? 1 : 0;
        if (maxNc !== null && maxNc !== '') {
          const v = lookup(velocity, header, rows[i + ncOffset]?.cells.slice(2, width) ?? []);
          if (!isErr(v) && isNum(v) && v > maxNc) tail += 1;
        }
      }
      row.P = add(row.N, row.O, tail);
    }
  };
  // Supply header rows 8 and 9: N = 1, O = 0; P8 hides the table with no type
  // or a return grille, P9 with a return grille.
  supply[0].N = supply[1].N = 1; supply[0].O = supply[1].O = 0;
  supply[0].P = !type || isReturn ? 1 : 0;
  supply[1].P = isReturn ? 1 : 0;
  flags(supply, 10, isReturn, 2);
  // Return header rows 102 and 103: N = P = 1 unless a return grille is chosen.
  ret[0].N = ret[1].N = isReturn ? 0 : 1; ret[0].O = ret[1].O = 0;
  ret[0].P = ret[0].N; ret[1].P = ret[1].N;
  flags(ret, 13, !isReturn, 1);
  return { supply, ret };
}

// The sizes to show: [{ labels, rows: [[label, values...]...] }] in catalog order.
export function select({ units, type, flow, speed, maxNc = null }) {
  const cfm = cfmOf(units, flow), velocity = fpmOf(units, speed);
  // AirGuide's catalogs are not in the workbook; the same rules, applied directly.
  if (isAirguide(type)) return selectAirguide({ type, cfm, velocity, maxNc });
  const { supply, ret } = sheet({ type, cfm, velocity, maxNc });
  const isReturn = same(type, RETURN);
  const rows = isReturn ? ret : supply;
  const size = isReturn ? 2 : 3, width = isReturn ? 13 : 10;
  const header = rows[0].cells.slice(2, width), pressure = rows[1].cells.slice(1, width);
  const groups = [];
  for (let i = 2; i + size - 1 < rows.length; i += size) {
    if (rows[i].P !== 0 || rows[i].cells[1] !== 'CFM') continue;
    const g = rows.slice(i, i + size);
    groups.push({
      labels: g.map(x => x.cells[0]).filter(l => l !== '' && l !== false).map(l => String(l).replace(/"/g, '').trim()).filter(l => !/^Ak/i.test(l)),
      ak: g.map(x => String(x.cells[0])).find(l => /^Ak/i.test(l))?.replace(/^Ak\s*=?\s*/i, '') ?? null,
      rows: g.map(x => x.cells.slice(1, width)),
    });
  }
  const col = header.findLastIndex(h => isNum(h) && h <= velocity);
  return { cfm, velocity, header, pressure, column: col, groups };
}
