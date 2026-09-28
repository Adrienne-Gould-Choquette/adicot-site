// Does the browser's duct sizing model still agree with the reference?
//
// src/assets/js/ductulator.js is a port of ductulator.py, which lives with the
// workbook in Google Drive and is what was validated against it over a 576-case
// grid. The Python stays the reference implementation; this file proves the
// JavaScript is a faithful copy of it, so a change to one can never quietly
// diverge from the other.
//
// Two halves:
//   1. structural checks — properties of the relations that hold independently
//      of either implementation, ported from test_ductulator.py.
//   2. the grid — every one of the 576 cases the Python wrote to
//      ductulator-cases.csv, compared field by field. Both languages compute in
//      IEEE-754 doubles, so these agree to the last bit; anything above 1e-12
//      relative means the port has drifted.
//
// Regenerate the grid after changing the model, from the Python directory:
//   python3 gen_cases.py && cp cases.csv <repo>/ductulator-cases.csv
import fs from 'node:fs';
import {
  solve, huebscherDe, rectFromDe, roundDiaFromFriction, frictionFromRound,
  rectArea, roundArea,
  Units, Material, Criterion, ROUGHNESS_FT,
  BASIS_FT, BASIS_M, FT_PER_M, IN_PER_M, CFM_PER_LPS, FPM_PER_MPS, PA_PER_IN_WG,
} from './src/assets/js/ductulator.js';

const CASES = 'ductulator-cases.csv';

// --------------------------------------------------------------------------
export function checkDuctulator() {
  const out = [];
  const issues = [];
  let checks = 0;

  const rel = (got, want) => Math.abs(got - want) / Math.max(Math.abs(want), 1e-12);
  const check = (name, got, want, tol) => {
    checks++;
    const r = rel(got, want);
    if (!(r <= tol)) issues.push(`${name}: got ${got} want ${want} rel=${r.toExponential(2)}`);
    return r;
  };

  // --- 1. Huebscher De, structural properties of the relation -------------
  // Properties that follow from De = 1.30*(WH)^0.625/(W+H)^0.25 and can be
  // derived independently, rather than table values quoted from memory.
  const SHAPES = [[8, 8], [12, 8], [20, 8], [12, 12], [30, 10], [24, 6], [6, 48]];
  for (const [w, h] of SHAPES) {
    check(`symmetry De(${w}x${h})`, huebscherDe(w, h), huebscherDe(h, w), 1e-15);
    // exponents sum to 0.625*2 - 0.25 = 1, so De is homogeneous of degree 1
    check(`scale De(${w}x${h}) x3`, huebscherDe(3 * w, 3 * h), 3 * huebscherDe(w, h), 1e-14);
  }
  for (const a of [6, 8, 12.5, 30]) {
    check(`square De(${a}x${a})`, huebscherDe(a, a), 1.30 * a / 2 ** 0.25, 1e-15);
  }
  // equal-friction De is always smaller than the equal-area diameter
  for (const [w, h] of SHAPES) {
    const de = huebscherDe(w, h);
    checks++;
    if (!(Math.PI * de * de / 4 < w * h)) issues.push(`De(${w}x${h}) is not smaller than equal-area`);
  }
  out.push(`  Huebscher De: symmetric, scale-invariant, exact on squares, ${SHAPES.length} shapes sub-equal-area`);

  // --- 2. rectFromDe is the exact inverse of huebscherDe ------------------
  for (const [de, h] of [[14, 8], [7.06, 6], [20, 10], [36, 12], [8, 4], [60, 48]]) {
    const [w, hh] = rectFromDe(de, h);
    check(`rect round-trip De=${de} H=${h}`, huebscherDe(w, hh), de, 1e-12);
  }
  for (const de of [4, 14, 33.7, 60]) {
    const [w, h] = rectFromDe(de);
    check(`square round-trip De=${de}`, huebscherDe(w, h), de, 1e-12);
  }
  out.push('  rectFromDe inverts huebscherDe exactly, constrained and square');

  // --- 3. sizing and friction are one model, rate round-trips -------------
  // Both directions are Swamee-Jain/Darcy-Weisbach, so sizing on a friction
  // rate and then re-deriving the rate from the diameter must return the
  // input. Through workbook V1.25 the sizing direction used White's explicit
  // solution instead, and disagreed by 0.8% on metal up to 7.9% on fabric.
  const TRIPS = [
    [125, 0.10, 'Flex'], [530, 0.10, 'Flex'],
    [1000, 0.08, 'Metal'], [2400, 0.05, 'Metal'],
    [400, 0.20, 'Duct board'], [800, 0.15, 'Fabric DurkeeSox'],
    [25, 0.50, 'Fabric DurkeeSox'], [10000, 0.02, 'Metal'],
  ];
  let worstTrip = 0;
  for (const [q, rate, mat] of TRIPS) {
    const dia = roundDiaFromFriction(q, rate, BASIS_FT, ROUGHNESS_FT[mat]);
    const back = frictionFromRound(q, dia, BASIS_FT, ROUGHNESS_FT[mat]);
    worstTrip = Math.max(worstTrip, check(`round-trip ${q} cfm ${mat} ${rate}`, back, rate, 1e-9));
  }
  out.push(`  friction round-trips through sizing on ${TRIPS.length} cases, worst ${worstTrip.toExponential(1)}`);

  // --- 4. US and Metric describe the same physical duct -------------------
  const rateUs = 0.08;
  const ratePa = rateUs * PA_PER_IN_WG * (BASIS_M * FT_PER_M / BASIS_FT);
  const a = solve(1000.0, Criterion.FRICTION_LOSS, rateUs, { material: Material.METAL, units: Units.US });
  const b = solve(1000.0 / CFM_PER_LPS, Criterion.FRICTION_LOSS, ratePa, { material: Material.METAL, units: Units.METRIC });
  check('US/metric round dia', a.roundDia, b.roundDia * IN_PER_M / 100, 1e-12);
  check('US/metric rect W', a.rectWidth, b.rectWidth * IN_PER_M / 100, 1e-12);
  check('US/metric velocity', a.velocityRound, b.velocityRound * FPM_PER_MPS, 1e-12);
  out.push('  US and Metric size the same physical duct');

  // --- 5. every criterion recovers the same duct --------------------------
  const base = solve(1000, Criterion.FRICTION_LOSS, 0.08, { material: Material.METAL });
  for (const [crit, val, h] of [
    [Criterion.AIR_VELOCITY, base.velocityRound, null],
    [Criterion.ROUND_DIA, base.roundDia, null],
    [Criterion.RECT_WH, base.rectWidth, base.rectHeight],
  ]) {
    const r = solve(1000, crit, val, { material: Material.METAL, ductHeight: h });
    check(`recover via ${crit}`, r.roundDia, base.roundDia, 1e-9);
  }
  out.push('  all four criteria recover the same duct');

  // --- 6. the equal-friction rectangle is larger and slower ---------------
  checks += 2;
  if (!(rectArea(base) > roundArea(base))) issues.push('rect must have more free area than round');
  if (!(base.velocityRect < base.velocityRound)) issues.push('rect must run slower than round');
  out.push(`  round ${roundArea(base).toFixed(1)} in2 @ ${base.velocityRound.toFixed(0)} fpm`
    + `  ->  rect ${rectArea(base).toFixed(1)} in2 @ ${base.velocityRect.toFixed(0)} fpm`);

  // --- 7. workbook V1.26 parity ------------------------------------------
  // Sizing moved when V1.26 put both directions on Swamee-Jain. Before that
  // change these were 12.08 in. and 666 fpm, and the version published on the
  // site reported an equal-AREA rectangle of 10.71 rather than Manual D's 10.98.
  const p = solve(530, Criterion.FRICTION_LOSS, 0.1, { material: Material.FLEX });
  check('V1.26 air volume', p.airVolume, 530, 1e-9);
  check('V1.26 velocity', Math.round(p.velocityRound), 674, 1e-9);
  check('V1.26 pressure drop', p.pressureDrop, 0.1, 1e-9);
  check('V1.26 round dia', Number(p.roundDia.toFixed(2)), 12.00, 1e-9);
  check('V1.26 rect side', Number(p.rectWidth.toFixed(2)), 10.98, 1e-9);
  out.push('  workbook V1.26 parity: 530 cfm Flex 0.1 -> 12.00 in., 10.98 sq., 674 fpm');

  // --- 8. the form's material list matches the model's ---------------------
  // src/_data/ductMaterials.json fills the dropdown, and its `name` is the key
  // the model looks roughness up by. Rename one there and solve() throws on a
  // material the page happily offers, so check the two lists agree.
  const known = Object.keys(ROUGHNESS_FT);
  let offered = [];
  try {
    offered = JSON.parse(fs.readFileSync('src/_data/ductMaterials.json', 'utf8'));
  } catch {
    issues.push('src/_data/ductMaterials.json is missing or is not valid JSON');
  }
  for (const m of offered) {
    checks++;
    if (!known.includes(m.name)) {
      issues.push(`ductMaterials.json offers "${m.name}", which the model does not know`);
    }
  }
  for (const k of known) {
    checks++;
    if (!offered.some(m => m.name === k)) issues.push(`the model knows "${k}" but the form does not offer it`);
  }
  out.push(`  ${offered.length} material(s) offered, all known to the model`);

  // --- 9. the 576-case grid, against the Python's own numbers -------------
  const FIELDS = [
    ['py_len', 'length'], ['py_vol', 'airVolume'], ['py_vround', 'velocityRound'],
    ['py_drop', 'pressureDrop'], ['py_dia', 'roundDia'], ['py_w', 'rectWidth'],
    ['py_h', 'rectHeight'], ['py_vrect', 'velocityRect'],
  ];
  const TOL = 1e-12;

  let rows;
  try {
    rows = parseCsv(fs.readFileSync(CASES, 'utf8'));
  } catch {
    issues.push(`${CASES} is missing — regenerate it with gen_cases.py`);
    return { lines: out, issues, checks };
  }

  let worst = 0, worstAt = null, mismatched = 0;
  for (const row of rows) {
    const r = solve(Number(row.q), row.criterion, Number(row.value), {
      material: row.material,
      units: row.units,
      ductHeight: Number(row.height) || null,
    });
    let bad = false;
    for (const [col, key] of FIELDS) {
      const d = rel(r[key], Number(row[col]));
      if (d > worst) { worst = d; worstAt = { row, key }; }
      if (d > TOL) bad = true;
    }
    checks += FIELDS.length;
    if (bad) {
      mismatched++;
      if (mismatched <= 5) {
        issues.push(`case ${row.units} ${row.material} q=${row.q} ${row.criterion}`
          + `=${row.value} h=${row.height} differs from the Python`);
      }
    }
  }
  if (mismatched > 5) issues.push(`...and ${mismatched - 5} more mismatched case(s)`);

  const where = worstAt
    ? ` (${worstAt.key}, ${worstAt.row.units} ${worstAt.row.material} ${worstAt.row.criterion})`
    : '';
  out.push(`  ${rows.length} reference cases from ductulator.py: `
    + (mismatched ? `${mismatched} MISMATCHED` : 'all match')
    + `, worst ${worst === 0 ? 'bit-identical' : worst.toExponential(1) + where}`);

  return { lines: out, issues, checks };
}

// Quote-aware, because one criterion is "Rect. Duct, W x H".
function parseCsv(text) {
  const rows = [];
  for (const line of text.trim().split(/\r?\n/)) {
    const cells = [];
    let cur = '', quoted = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (quoted) {
        if (ch === '"' && line[i + 1] === '"') { cur += '"'; i++; }
        else if (ch === '"') quoted = false;
        else cur += ch;
      } else if (ch === '"') quoted = true;
      else if (ch === ',') { cells.push(cur); cur = ''; }
      else cur += ch;
    }
    cells.push(cur);
    rows.push(cells);
  }
  const head = rows.shift();
  return rows.map(cells => Object.fromEntries(head.map((h, i) => [h, cells[i]])));
}

// --------------------------------------------------------------------------
if (import.meta.url === `file://${process.argv[1].split('\\').join('/')}`
    || process.argv[1]?.endsWith('check-ductulator.mjs')) {
  const { lines, issues, checks } = checkDuctulator();
  console.log('=== duct sizing model ===');
  lines.forEach(l => console.log(l));
  console.log(`  ${checks} comparisons`);
  if (issues.length) {
    console.log('\n  FAILED:');
    issues.slice(0, 20).forEach(i => console.log('    ' + i));
  }
  process.exit(issues.length ? 1 : 0);
}
