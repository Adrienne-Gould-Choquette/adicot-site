// Answer key for the fluid mixing calculator (V1.04).
import { mix, problem, specificHeat, derived, OTHER } from '../src/assets/js/fluidmix.js';
import { FLUIDS } from '../src/assets/js/fluid-specific-heats.js';

// Every fluid, each mixed with water, plus custom specific heats, in both unit
// systems. V1.04 fills the ten specific heats V1.03 left blank.
const known = FLUIDS.map(f => f[0]);
const cases = [];
for (const [i, name] of known.entries()) {
  const units = i % 2 ? 'Metric' : 'US';
  cases.push(units === 'US'
    ? { units, t1: 60 + i, fluid1: name, cp1: '', m1: 50 + i, t2: 180, fluid2: 'Water, fresh', cp2: '', m2: 100 }
    : { units, t1: 15 + i / 4, fluid1: name, cp1: '', m1: 20 + i, t2: 80, fluid2: 'Water, fresh', cp2: '', m2: 45 });
}
for (const units of ['US', 'Metric']) {
  cases.push({ units, t1: 40, fluid1: OTHER, cp1: 0.85, m1: 12.5, t2: 140, fluid2: 'Ethylene glycol', cp2: '', m2: 30 });
  cases.push({ units, t1: -10, fluid1: OTHER, cp1: 0.3, m1: 1000, t2: 250, fluid2: OTHER, cp2: 1.2, m2: 0.5 });
}

const fluid = (t, name, cp, m) => ({ temp: Number(t), name, cp: cp === '' ? null : Number(cp), mass: Number(m) });

export default {
  workbook: 'G:\\My Drive\\5-Calculators\\Fluid Mixing Calculator V1.04.xlsx',
  sheet: 'Sheet1',
  inputs: { units: 'A1', t1: 'B4', fluid1: 'B5', cp1: 'B6', m1: 'B7', t2: 'B10', fluid2: 'B11', cp2: 'B12', m2: 'B13' },
  outputs: { temp: 'B17', cp: 'B18', mass: 'B19' },
  cases,
  run: row => mix(row.units, fluid(row.t1, row.fluid1, row.cp1, row.m1), fluid(row.t2, row.fluid2, row.cp2, row.m2)),
  refuse: [
    { kind: 'refuse', args: [{ temp: 60, name: 'Milk', cp: null, mass: null }, { temp: 180, name: 'Water, fresh', cp: null, mass: 10 }], says: 'Enter the fluid 1 mass' },
    { kind: 'refuse', args: [{ temp: 60, name: OTHER, cp: null, mass: 5 }, { temp: 180, name: 'Water, fresh', cp: null, mass: 10 }], says: 'Enter the fluid 1 specific heat' },
    { kind: 'refuse', args: [{ temp: 60, name: 'Milk', cp: null, mass: 5 }, { temp: 180, name: '', cp: null, mass: 10 }], says: 'Choose the fluid 2 type' },
    { kind: 'refuse', args: [{ temp: 60, name: 'Milk', cp: null, mass: 5 }, { temp: 180, name: 'Water, fresh', cp: null, mass: 0 }], says: 'The fluid 2 mass must be greater than zero' },
    // The ten once-blank Btu values come from kJ/kg·K, never zero.
    ...FLUIDS.filter(f => f[1] === null).map(f => ({ kind: 'derived', name: f[0], kj: f[2], says: `${f[0]} uses its kJ/kg·K value` })),
  ],
  check: r => r.kind === 'derived'
    ? derived(r.name) && specificHeat(r.name) === r.kj / 4.1868 && specificHeat(r.name) > 0
    : (problem(...r.args) ?? '').startsWith(r.says),
};
