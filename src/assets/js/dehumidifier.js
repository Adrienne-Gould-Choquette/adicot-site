// Dehumidifier selection: converts a latent capacity between pints/day, Btu/h
// and kW, and picks the smallest group of dehumidifiers that meets it. A port of
// Dehumidifier Specifier V7.1.xlsx, formula for formula; check-calculators.mjs
// holds this file to the workbook's own answers.
//
//   Btu/h = pints/day x 1.04 lb/pint / 24 h/day x 1055 Btu/lb
//   kW    = Btu/h / 3412.142
import { MODELS } from './dehumidifier-models.js';

export { MODELS };
export const UNITS = ['Pints/day', 'BTU/h', 'kW'];
export const MAX_PINTS = 730;   // the largest model

const LB_PER_PINT = 1.04, BTU_PER_LB = 1055, BTU_PER_KW = 3412.142;

// The capacity in all three units (the workbook's B5:B7).
export function convert(units, capacity) {
  if (units === 'Pints/day') {
    return { pints: capacity, btuh: capacity * LB_PER_PINT / 24 * BTU_PER_LB, kW: capacity * LB_PER_PINT / 24 * BTU_PER_LB / BTU_PER_KW };
  }
  if (units === 'BTU/h') {
    return { pints: capacity / LB_PER_PINT * 24 / BTU_PER_LB, btuh: capacity, kW: capacity / BTU_PER_KW };
  }
  return { pints: capacity / LB_PER_PINT * 24 / BTU_PER_LB * BTU_PER_KW, btuh: capacity * BTU_PER_KW, kW: capacity };
}

// A model's rated capacity in Btu/h and kW (the workbook's columns E and F).
export const modelBtuh = ppd => ppd * LB_PER_PINT / 24 * BTU_PER_LB;
export const modelKW = ppd => modelBtuh(ppd) / BTU_PER_KW;

// The workbook's check column (H12:H41): 0 shows a model; 1 (too small) or
// true (larger than needed) hides it. Shown are the models that meet the
// capacity and are rated less than 10 pints/day above the smallest one that does,
// so similar units from different manufacturers appear side by side. V7.1; until
// V7.0 each model was grouped with the one before it when within 10 pints/day,
// which with the denser 2026 list chained 100 to 140 pints/day into one group.
export function checks(pints, blank = false) {
  if (blank) return MODELS.map(() => true);
  const smallest = MODELS.find(([, , , ppd]) => !(pints - ppd > 0))?.[3];
  return MODELS.map(([, , , ppd]) => pints - ppd > 0 ? 1 : ppd < smallest + 10 ? 0 : true);
}

// The recommended models for a capacity: those the check column shows.
export function select(units, capacity) {
  const c = convert(units, capacity);
  const shown = checks(c.pints);
  return { ...c, tooBig: c.pints > MAX_PINTS, models: MODELS.filter((_, i) => shown[i] === 0) };
}
