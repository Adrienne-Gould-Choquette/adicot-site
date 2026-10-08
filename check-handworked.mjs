// Calculators with no workbook behind them, held to worked examples: the page's
// own example, and cases worked by hand from the published equations.
import { interpolate, outside, problem } from './src/assets/js/linear.js';
import { annualCost, problem as costProblem } from './src/assets/js/annualcost.js';
import { COOLING_HOURS } from './src/assets/js/cooling-hours.js';
import { readHours } from './tools/extract/build-cooling-hours.mjs';
import { state } from './src/assets/js/psychsheet.js';
import { coilLoads, airflowFor } from './src/assets/js/airside.js';
import { doorForce, doorPressure, pressurization, leakage, leakPerFoot, doorProblem, crackage } from './src/assets/js/crackage.js';
import { mix } from './src/assets/js/mixair.js';

export function checkHandworked() {
  const lines = [], issues = [];
  let checks = 0;
  const near = (what, got, want, tol = 1e-9) => { checks++; if (!(Math.abs(got - want) <= tol)) issues.push(`${what}: ${got}, expected ${want}`); };
  const same = (what, got, want) => { checks++; if (got !== want) issues.push(`${what}: ${JSON.stringify(got)}, expected ${JSON.stringify(want)}`); };

  // Linear interpolation: the page's Bryant example, 54.06 MBtuh at 79 °F.
  const bryant = { x1: 75, y1: 55.04, x2: 85, y2: 52.59 };
  near('linear: Bryant example y at 79', interpolate({ ...bryant, solveFor: 'y', value: 79 }).y, 55.04 * 0.6 + 52.59 * 0.4);
  near('linear: Bryant example rounds to 54.06', Math.round(interpolate({ ...bryant, solveFor: 'y', value: 79 }).y * 100) / 100, 54.06, 0);
  near('linear: back from y to x', interpolate({ ...bryant, solveFor: 'x', value: 55.04 * 0.6 + 52.59 * 0.4 }).x, 79);
  near('linear: at a known point', interpolate({ ...bryant, solveFor: 'y', value: 85 }).y, 52.59);
  near('linear: points given right to left', interpolate({ x1: 10, y1: 0, x2: 0, y2: 100, solveFor: 'y', value: 2.5 }).y, 75);
  same('linear: inside is not extrapolation', outside(interpolate({ ...bryant, solveFor: 'y', value: 79 })), false);
  same('linear: beyond x2 is extrapolation', outside(interpolate({ ...bryant, solveFor: 'y', value: 90 })), true);
  same('linear: refuses x1 = x2', (problem({ x1: 5, y1: 1, x2: 5, y2: 2, solveFor: 'y', value: 5 }) ?? '').startsWith('x₁ and x₂'), true);
  same('linear: refuses a flat line when solving for x', (problem({ x1: 1, y1: 2, x2: 5, y2: 2, solveFor: 'x', value: 2 }) ?? '').startsWith('y₁ and y₂'), true);
  same('linear: asks for a blank point', problem({ x1: null, y1: 1, x2: 5, y2: 2, solveFor: 'y', value: 3 }), 'Enter x₁.');
  lines.push('  linear interpolation: page example and hand-worked cases match');

  // Annual cooling cost: the page's Miami example, worked by hand.
  const miami = annualCost({ capacity: 38000, rating: 'SEER', value: 11, hours: 3931, rate: 0.18 });
  near('annual cost: Miami example power, W', miami.watts, 38000 / 11);
  near('annual cost: Miami example energy, kWh', miami.kwh, 38000 / 11 * 3931 / 1000);
  near('annual cost: Miami example rounds to $2,444.37', Math.round(miami.cost * 100) / 100, 2444.37, 0);
  near('annual cost: SEER 16 rounds to $1,680.50', Math.round(annualCost({ capacity: 38000, rating: 'SEER', value: 16, hours: 3931, rate: 0.18 }).cost * 100) / 100, 1680.5, 0);
  near('annual cost: SEER2 14.25 split = SEER 15', annualCost({ capacity: 36000, rating: 'SEER2', value: 14.25, equipment: 'Single Split', hours: 1000, rate: 0.1 }).seer, 15);
  near('annual cost: SEER2 package uses 0.96', annualCost({ capacity: 36000, rating: 'SEER2', value: 14.4, equipment: 'Single Package', hours: 1000, rate: 0.1 }).seer, 15);
  same('annual cost: SEER2 needs the equipment type', costProblem({ capacity: 36000, rating: 'SEER2', value: 14, equipment: '', hours: 1000, rate: 0.1 }), 'Choose the equipment type, to convert SEER2 to SEER.');
  same('annual cost: asks for the hours', costProblem({ capacity: 36000, rating: 'SEER', value: 14, hours: null, rate: 0.1 }), 'Enter the full-load cooling hours, or choose a city.');
  // The page's city list is the ENERGY STAR table, unchanged.
  same('annual cost: cooling hours match the ENERGY STAR source', JSON.stringify(COOLING_HOURS), JSON.stringify(readHours()));
  same('annual cost: 218 cities', COOLING_HOURS.length, 218);
  same('annual cost: Miami 3,931 h', COOLING_HOURS.find(([c]) => c === 'FL-Miami')?.[1], 3931);
  lines.push('  annual cooling cost: page example, SEER2 conversion and ENERGY STAR hours match');

  // Exact coil loads (airside.js) against the 2025 ASHRAE Handbook—Fundamentals,
  // chapter 1. The Handbook reads real-gas table values; the calculators use the
  // chapter's ideal-gas equations, which run about 0.3 % lower, so 0.5 % is allowed.
  const S = (units, mode, first, second, altitude = 0) => state({ units, mode, first, second, altitude });
  const pct = (got, want) => Math.abs(got / want - 1) * 100;
  // Example 3: 85 °F / 50 % RH to saturated 50 °F at 10,000 cfm: 50.77 tons.
  const e3 = coilLoads('US', S('US', 'db-rh', 85, 50), S('US', 'db-rh', 50, 100), 10000);
  near('coil loads: ASHRAE Example 3, 50.77 tons (within 0.5 %)', pct(e3.total / 12000, 50.77), 0, 0.5);
  near('coil loads: sensible + latent = total', e3.sensible + e3.latent - e3.total, 0, 1e-6);
  // Example 2: saturated 35 °F heated to 100 °F (dew point stays 35 °F) at 20,000 cfm: 1,507,000 Btu/h.
  const e2 = coilLoads('US', S('US', 'db-rh', 35, 100), S('US', 'db-dp', 100, 35), 20000);
  near('coil loads: ASHRAE Example 2, 1,507,000 Btu/h heating (within 0.5 %)', pct(-e2.total, 1507000), 0, 0.5);
  near('coil loads: no latent when the moisture is unchanged', e2.latent, 0, 1e-6);
  // The same coil in metric agrees, and the airflow solver inverts the load.
  const m3 = coilLoads('Metric', S('Metric', 'db-rh', (85 - 32) / 1.8, 50), S('Metric', 'db-rh', 10, 100), 10000 / 2.1188799727597);
  near('coil loads: metric kW = US Btu/h / 3412.142', m3.total, e3.total / 3412.142, 1e-6);
  near('coil loads: airflow for the load returns 10,000 cfm', airflowFor('US', S('US', 'db-rh', 85, 50), S('US', 'db-rh', 50, 100), e3.total), 10000, 1e-6);
  // Dry bulb + dew point gives the same state as dry bulb + the RH it implies.
  const byRh = S('US', 'db-rh', 80, 50), byDp = S('US', 'db-dp', 80, byRh.dp);
  near('db + dp: humidity ratio matches db + rh', byDp.ip.W, byRh.ip.W, 1e-9);
  near('db + dp: wet bulb matches db + rh', byDp.wb, byRh.wb, 1e-6);
  lines.push('  coil loads: ASHRAE Fundamentals chapter 1 Examples 2 and 3; dry bulb + dew point agrees with dry bulb + RH');

  // Door opening force (crack-method page): the hand calculation for a 3 × 7 ft
  // hinged door, knob 3 in. from the edge, no closer.
  const door = { width: 3, height: 7, knob: 0.25, closer: 0 };
  near('door: 30 lbf allows 165 / 327.6 in. w.c.', doorPressure(door, 30), 165 / 327.6, 1e-12);
  near('door: 5 lbf allows 27.5 / 327.6 in. w.c.', doorPressure(door, 5), 27.5 / 327.6, 1e-12);
  near('door: force at 0.5036 in. w.c.', doorForce(door, 0.5036), 29.99, 0.01);
  near('door: a 10 lbf closer leaves 20 lbf for pressure', doorPressure({ ...door, closer: 10 }, 30), 110 / 327.6, 1e-12);
  // The page's pressurization example: 30 × 60 × 16 ft, average walls and roof,
  // 84 ft of average-fit crack, 500 cfm of net outdoor air.
  const env = { wallArea: 2 * 90 * 16 - 81, wallRate: 0.30, roofArea: 1800, roofRate: 0.30 };
  const p = pressurization({ fit: 'Average', crack: 84, env, netOA: 500, door, limit: 5 });
  near('pressurization: leakage at the pressure found equals the net OA', leakage('Average', 84, env, p.dp), 500, 1e-6);
  near('pressurization: page example 0.058 in. w.c.', p.dp, 0.058, 0.0005);
  near('pressurization: page example door force 3.4 lbf', p.force, 3.4, 0.05);
  near('pressurization: page example 639 cfm allowed', p.maxOA, 639, 0.5);
  near('pressurization: page example 2,046 cfm allowed at 30 lbf', pressurization({ fit: 'Average', crack: 84, env, netOA: 500, door, limit: 30 }).maxOA, 2046, 0.5);
  // Each path by hand at 0.1 in. w.c.
  near('walls and roof at 0.1 in.: 4599 × 0.30 × (0.1/0.3)^0.65', leakage('Average', 0, env, 0.1), 4599 * 0.30 * (0.1 / 0.3) ** 0.65, 1e-9);
  near('cracks at 0.1 in.: 84 × 2.1 × 0.1^0.64', leakage('Average', 84, {}, 0.1), 84 * 2.1 * 0.1 ** 0.64, 1e-9);
  near('crack curve at the example VHF is the infiltration rate', leakPerFoot('Average', 0.000467 * 400), 0.718, 0.0005);
  near('orifice: 1 ft² at 0.25 in. w.c. = 2610 × 0.5', leakage('Average', 0, { orifice: 1 }, 0.25), 1305, 1e-9);
  near('blower door: 3000 cfm at 75 Pa, at 75 Pa', leakage('Average', 0, { q75: 3000 }, 75 / 249.0889), 3000, 1e-9);
  // Windows as totals (crack length) give the same crack as the sizes they add up to.
  const bySizes = crackage({ wind: 20, fit: 'Average', openings: [{ qty: 40, width: 3, height: 5 }, { qty: 2, width: 3, height: 7 }] });
  const byTotals = crackage({ wind: 20, fit: 'Average', openings: [{ qty: 2, width: 3, height: 7 }], extraCrack: 640 });
  same('window totals: crack length matches the sizes', byTotals.crack, bySizes.crack);
  same('window totals: infiltration matches the sizes', byTotals.q, bySizes.q);
  // More exhaust than outdoor air: the same pressure, below outdoors.
  const dep = pressurization({ fit: 'Average', crack: 84, env, netOA: -500, door, limit: 5 });
  same('depressurization: same magnitude as pressurization', dep.dp, p.dp);
  same('depressurization: flagged', dep.depressurized, true);
  // No leakage path is an error, not "within the limit".
  same('no leakage path: refused', /Nothing can leak/.test(doorProblem({ fit: 'Average', crack: 0, netOA: 500, env: {}, door, limit: 5 }) ?? ''), true);
  // Cracks only, 500 cfm: far past the crack curves' 0.6 in. w.c. range, and flagged.
  same('beyond the crack data: flagged', pressurization({ fit: 'Average', crack: 84, env: {}, netOA: 500, door, limit: 30 }).beyondCrackData, true);
  lines.push("  pressurization and door force: the 30 and 5 lbf hand calculations, the page example and each leakage path; depressurization and the no-leakage and past-the-data cases");

  // Air mixing: ASHRAE adiabatic mixing. Worked through the psychrometric
  // calculator: each stream's W, h and v from its dry and wet bulb, the dry air
  // mass Q / v, and the mixed state must carry the mass-weighted W and h.
  const P = (db, wb, units = 'US') => state({ units, mode: 'db-wb', first: db, second: wb, altitude: 0 }).ip;
  const massMix = (streams, units) => {
    const ps = streams.map(([q, db, wb]) => ({ ...P(db, wb, units), m: q / P(db, wb, units).v }));
    const m = ps.reduce((t, x) => t + x.m, 0);
    return { W: ps.reduce((t, x) => t + x.m * x.W, 0) / m, h: ps.reduce((t, x) => t + x.m * x.h, 0) / m };
  };
  const ex = [[150, 91, 77], [1550, 75, 62.3], [300, 55, 54.5]];
  const mixed = mix(ex.map(([q, db, wb]) => ({ q, db, wb })));
  const want = massMix(ex);
  near('air mixing: page example W is the mass-weighted W', mixed.w, want.W, 1e-9);
  near('air mixing: page example mixed state has that W', P(mixed.db, mixed.wb).W, want.W, 1e-9);
  near('air mixing: page example mixed state has the mass-weighted h', P(mixed.db, mixed.wb).h, want.h, 1e-6);
  near('air mixing: page example 73.06 °F dry bulb', mixed.db, 73.06, 0.005);
  near('air mixing: page example 62.43 °F wet bulb', mixed.wb, 62.43, 0.005);
  near('air mixing: page example 67.2 gr/lb', mixed.w * 7000, 67.2, 0.05);
  const siEx = [[236, 35, 25], [944, 24, 17]];
  const si = mix(siEx.map(([q, db, wb]) => ({ q, db, wb })), true);
  near('air mixing: SI mixed state has the mass-weighted W', P(si.db, si.wb, 'Metric').W, massMix(siEx, 'Metric').W, 1e-9);
  const winter = mix([{ q: 1000, db: 20, wb: 18 }, { q: 1600, db: 72, wb: 60 }]);
  near('air mixing: winter air (ice on the wick) mixes by W too', P(winter.db, winter.wb).W, winter.w, 1e-9);
  // Saturated 20 °F and 95 °F air, half and half by flow, is past saturation:
  // it fogs, and settles saturated at the mix's enthalpy.
  const fogEx = [[1000, 20, 20], [1000, 95, 95]];
  const fog = mix(fogEx.map(([q, db, wb]) => ({ q, db, wb })));
  same('air mixing: past saturation is flagged', fog.fog, true);
  same('air mixing: fog leaves it saturated', fog.db, fog.wb);
  near('air mixing: fog keeps the enthalpy', P(fog.db, fog.db).h, massMix(fogEx).h, 1e-4);
  same('air mixing: the page example does not fog', mixed.fog, false);
  lines.push('  air mixing: ASHRAE adiabatic mixing by dry air mass (page example, SI, winter, fog)');
  return { lines, issues, checks };
}

if (process.argv[1]?.endsWith('check-handworked.mjs')) {
  const { lines, issues, checks } = checkHandworked();
  console.log('=== calculators without a workbook, against worked examples ===');
  lines.forEach(l => console.log(l));
  console.log(`  ${checks} comparisons`);
  issues.forEach(i => console.log('  FAILED: ' + i));
  process.exit(issues.length ? 1 : 0);
}
