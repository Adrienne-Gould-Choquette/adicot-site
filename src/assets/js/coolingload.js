// Cooling load ballpark estimate: occupants, lights and other electrical, and
// refrigeration for a floor area and building type, from the check figures in
// coolingload-table.js. Ported exactly from Cooling Load Ballpark Estimator V1.6
// (its metric sheet converts with 0.092903 m²/ft², tons to kW with 3.52).
import { BUILDINGS } from './coolingload-table.js';

export { BUILDINGS };
const byName = new Map(BUILDINGS.flatMap(b => [[b[0], b], [b[1], b]]));
export const building = name => byName.get(name) ?? null;

const M2 = 0.092903;   // the workbook's m² per ft²

// Each result is [lo, avg, hi]; null where the table has no figure.
export function estimate(units, area, name) {
  const b = building(name);
  if (!b || !(area > 0)) return null;
  const metric = units === 'Metric';
  const per = v => v === 0 ? null : area / (metric ? v * M2 : v);
  const occupants = b[2].map(per);
  const tons = b[4].map(per);
  return {
    occupants,
    watts: b[3].map(w => w === 0 ? null : area * (metric ? w / M2 : w)),
    tons,
    heat: tons.map(t => t === null ? null : metric ? t * 3.52 : t * 12000),   // kW or Btu/h
  };
}
