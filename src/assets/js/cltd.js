// CLTD roof and wall numbers: which ASHRAE CLTD table column applies to a roof or
// wall, from its construction.
//
// A port of ASHRAE CLTD Surface Type V1.1.xlsx; check-calculators.mjs holds this file
// to the workbook's own answers for every combination the form offers.
import { ROOF, ROOF_TYPES, WALL, WALL_TYPES, WALL_CODES } from './cltd-tables.js';

export { ROOF_TYPES, ROOF_MASS, ROOF_R, WALL_TYPES } from './cltd-tables.js';
export const WALL_MASS = ['Mass Located Inside Insulation', 'Mass Evenly Distributed', 'Mass Located Outside Insulation'];
export const WALL_SECONDARY = ['Stucco and/or Plaster', 'Steel or other lightweight siding', 'Face brick'];
export const WALL_R = ['0.0 - 2.0', '2.0 - 2.5', '2.5 - 3.0', '3.0 - 3.5', '3.5 - 4.0', '4.0 - 4.75', '4.75 - 5.5', '5.5 - 6.5',
  '6.5 - 7.75', '7.75 - 9.0', '9.0 - 10.75', '10.75 - 12.75', '12.75 - 15.0', '15.0 - 17.5', '17.5 - 20.0', '20.0 - 23.0', '23.0 - 27.0'];

// Roof number, or null where the table has none.
export function roofNumber(type, mass, r) {
  const row = ROOF.find(x => x[0] === mass + r);
  return row?.[1 + ROOF_TYPES.indexOf(type)] ?? null;
}

// Wall number, or null where the table has none (the workbook shows "No Value").
export function wallNumber(material, mass, secondary, r) {
  const code = WALL_TYPES.find(t => t[0] === material)?.[1];
  const key = { 'Mass Evenly Distributed': 2, 'Mass Located Inside Insulation': 1 }[mass] ?? 3;
  const row = WALL.find(x => x[0] === `${key}${secondary.slice(0, 3)}${r}`);
  const v = row?.[1][WALL_CODES.indexOf(code)];
  return v ? v : null;
}
export const wallCode = material => WALL_TYPES.find(t => t[0] === material)?.[1] ?? null;
