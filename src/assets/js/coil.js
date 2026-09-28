// Coil selection: coil face area and velocity, water and glycol flow, and water
// velocity in coil tubes. The air-side loads are in airside.js.
//
// A port of Coil Selection V2.9.xlsx, sheet by sheet and formula for formula,
// with the workbook's factors; check-calculators.mjs holds this file to the
// workbook's own answers. units: 'English' | 'Metric' throughout.

// ---- coil face area and air velocity ----
export function face(units, height, width, flow) {
  const us = units === 'English';
  const area = height * width / (us ? 144 : 1000000);
  return { area, velocity: flow / (us ? 1 : 1000) / area };
}

// ---- water and glycol: load = flow x fluid factor x (entering - leaving) ----
// Fluid factor (cp x density x 60): (Btu/h)/(gpm·°F), or kJ/(°C·l).
// Glycols by volume, at 15 °C (59 °F): density (kg/l) and specific heat
// (kJ/kg·K) from ASHRAE Handbook—Fundamentals (2001), chapter 21, Tables 6, 7,
// 10 and 11, as Sheet2 of V2.9 holds them. English = lb/gal x Btu/lb·°F x 60.
const GLYCOL = [
  ['Ethylene Glycol 10%', 1.01487, 3.963], ['Ethylene Glycol 20%', 1.03139, 3.803], ['Ethylene Glycol 30%', 1.04707, 3.631],
  ['Ethylene Glycol 40%', 1.06165, 3.451], ['Ethylene Glycol 50%', 1.07546, 3.261],
  ['Propylene Glycol 10%', 1.00975, 4.067], ['Propylene Glycol 20%', 1.02091, 3.962], ['Propylene Glycol 30%', 1.03051, 3.834],
  ['Propylene Glycol 40%', 1.03865, 3.685], ['Propylene Glycol 50%', 1.04552, 3.513],
];
export const FLUIDS = [
  ...GLYCOL.map(([name, rho, cp]) => [name, rho * 8.34540445 * (cp / 4.1868) * 60, rho * cp]),
  ['Water', 500.90039999999993, 4.186895325],
];
export const fluidFactor = (fluid, units) => FLUIDS.find(f => f[0] === fluid)?.[units === 'English' ? 1 : 2] ?? null;
// Load and flow come from the size of the temperature difference. A solved
// temperature keeps its sign (sub-zero glycol) and follows the coil: in a
// cooling coil the water warms up, in a heating coil it cools down.
export function water(units, find, fluid, { load, entering, leaving, flow }, coil = 'Cooling') {
  const f = fluidFactor(fluid, units);
  if (find === 'load') return Math.abs(flow * f * (entering - leaving));
  if (find === 'flow') return Math.abs(load / (f * (entering - leaving)));
  const dt = Math.abs(load) / (flow * f);
  const heating = coil === 'Heating';
  if (find === 'entering') return heating ? leaving + dt : leaving - dt;
  return heating ? entering - dt : entering + dt;
}

// ---- water velocity in coil tubes [fps or m/s] ----
const G7 = 1 / 60 / 7.48052 * 144 * 4 / Math.PI;
export function tubeVelocity(units, flow, diameter, tubes) {
  if (units === 'English') return flow * G7 / diameter ** 2 / tubes;
  return flow * 15.8503 * G7 / (diameter / 2.54) ** 2 / tubes / 3.28084;
}
