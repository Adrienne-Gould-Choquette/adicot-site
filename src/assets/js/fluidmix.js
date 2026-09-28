// Mixed temperature and specific heat of two fluids.
//
// A port of Fluid Mixing Calculator V1.04.xlsx, formula for formula and in the
// workbook's order; check-calculators.mjs holds this file to the workbook's own
// answers. Metric inputs are converted to °F and lb first, as the workbook does:
//
//   T_mix  = (m1 c1 T1 + m2 c2 T2) / (m1 c1 + m2 c2)
//   c_mix  = m1/M c1 + m2/M c2,   M = m1 + m2
//
// Specific heats are in Btu/lb·°F, which is the same number as kcal/kg·°C.
import { FLUIDS } from './fluid-specific-heats.js';

export const OTHER = '_Other';
// 1 Btu/lb·°F = 4.1868 kJ/kg·K, by definition.

// Ten fluids had a kJ/kg·K value but a blank Btu/lb·°F one, which V1.03 read as
// zero, so the fluid dropped out of the mix without a word. V1.04 fills them as
// kJ/kg·K / 4.1868, and so does this (the extracted table keeps them null).
export function specificHeat(name) {
  const row = FLUIDS.find(f => f[0] === name);
  if (!row) return null;
  return row[1] ?? row[2] / 4.1868;
}
export const derived = name => FLUIDS.find(f => f[0] === name)?.[1] === null;

// fluid: { temp, name, cp (used when name is OTHER), mass }. units: 'US' | 'Metric'.
export function mix(units, f1, f2) {
  const us = units === 'US';
  const t1 = us ? f1.temp : 9 / 5 * f1.temp + 32;
  const t2 = us ? f2.temp : 9 / 5 * f2.temp + 32;
  const c1 = f1.name === OTHER ? f1.cp : specificHeat(f1.name);
  const c2 = f2.name === OTHER ? f2.cp : specificHeat(f2.name);
  const m1 = us ? f1.mass : f1.mass * 2.20462;
  const m2 = us ? f2.mass : f2.mass * 2.20462;
  const tF = (m1 * c1 * t1 + t2 * c2 * m2) / (m2 * c2 + m1 * c1);
  const M = m2 + m1;
  return {
    temp: us ? tF : (tF - 32) * 5 / 9,
    cp: m1 / M * c1 + m2 / M * c2,
    mass: us ? M : M / 2.20462,
  };
}

export function problem(f1, f2) {
  for (const [f, n] of [[f1, 'fluid 1'], [f2, 'fluid 2']]) {
    if (f.temp === null) return `Enter the ${n} temperature.`;
    if (Number.isNaN(f.temp)) return `The ${n} temperature is not a number.`;
    if (!f.name) return `Choose the ${n} type.`;
    if (f.name === OTHER) {
      if (f.cp === null) return `Enter the ${n} specific heat.`;
      if (!(f.cp > 0)) return `The ${n} specific heat must be greater than zero.`;
    }
    if (f.mass === null) return `Enter the ${n} mass.`;
    if (Number.isNaN(f.mass)) return `The ${n} mass is not a number.`;
    if (!(f.mass > 0)) return `The ${n} mass must be greater than zero.`;
  }
  return null;
}
