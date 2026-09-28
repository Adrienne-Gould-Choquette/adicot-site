// Do the ventilation page's code and standard tables still match what was read
// from their sources? These tables have no workbook, so the answer key is the
// capture itself (calc-cases/sources), taken from ICC's code viewer and the
// ASHRAE PDFs, plus the arithmetic each source prescribes, checked against the
// source's own worked table where it has one.
import fs from 'node:fs';
import { IMC_2024, FBC_2023, ASHRAE_170 } from './src/assets/js/ventilation-tables.js';
import { categories, codeRow, codeZone, row170, achFlow, dwelling622, STANDARDS } from './src/assets/js/ventilation-standards.js';
import { TABLE_6_1, TABLE_6_2 } from './src/assets/js/ashrae621-tables.js';
import { ventilation, exhaust, zone, current, key, CATEGORIES } from './src/assets/js/ashrae621.js';
import { build as build621 } from './tools/extract/build-ashrae621-tables.mjs';

const src = f => JSON.parse(fs.readFileSync(`calc-cases/sources/${f}`, 'utf8'));

export function checkVentilationTables() {
  const lines = [], issues = [];
  let checks = 0;
  const same = (what, a, b) => { checks++; if (JSON.stringify(a) !== JSON.stringify(b)) issues.push(`${what}: ${JSON.stringify(a)} ≠ ${JSON.stringify(b)}`); };

  // IMC 2024 (also FBC-M 2026) and FBC-M 2023: every cell as captured.
  for (const [name, table, file] of [['IMC 2024', IMC_2024, 'imc-2024-table-403.3.1.1.json'], ['FBC-M 2023', FBC_2023, 'fbc-mechanical-2023-table-403.3.1.1.json']]) {
    const rows = src(file).rows;
    same(`${name} row count`, table.length, rows.length);
    rows.forEach((r, i) => r.forEach((v, j) => same(`${name} row ${i} (${r[1]}) column ${j}`, table[i]?.[j], v)));
    lines.push(`  ${name}: ${rows.length} rows, every cell as captured`);
  }

  // ASHRAE 170 Table 7-1: every value as parsed, after the generator's only
  // changes (N/R to NR, "(e)" to "See note e", hyphen to en dash in ranges).
  const t71 = src('ashrae-170-2021-table-7-1.json').rows;
  same('170 row count', ASHRAE_170.length, t71.length);
  const KEYS = ['pressure', 'oa', 'total', 'exhausted', 'recirc', 'turndown', 'filter', 'rh', 'temp'];
  const norm = s => s.replace(/\([a-z]{1,2}\)/g, ' ').replace(/,/g, ' ').replace(/N\/R/g, 'NR').replace(/(\d)-(\d)/g, '$1–$2').replace(/\s+/g, ' ').trim();
  t71.forEach((r, i) => {
    const mine = KEYS.map(k => ASHRAE_170[i][k].v === 'See note e' ? '' : ASHRAE_170[i][k].v).join(' ').replace(/\s+/g, ' ').trim();
    same(`170 row ${i} (${r.name}) values`, mine, norm(r.values));
    const noteCount = (r.values.match(/\([a-z]{1,2}\)/g) ?? []).length;
    same(`170 row ${i} (${r.name}) value notes`, KEYS.reduce((n, k) => n + ASHRAE_170[i][k].n.length, 0), noteCount);
  });
  const tally = rows => rows.reduce((t, f) => ({ ...t, [f]: (t[f] ?? 0) + 1 }), {});
  same('170 filter column tally', tally(ASHRAE_170.map(r => r.filter.v)), { 'MERV-8': 56, 'MERV-14': 20, 'MERV-16': 4, HEPA: 5 });
  lines.push(`  ASHRAE 170-2021 Table 7-1: ${t71.length} rows, every value as parsed`);

  // ASHRAE 62.2: Equation 4-1 reproduces every cell of Tables 4-1a and 4-1b at
  // the upper end of each floor-area band.
  const t41 = src('ashrae-62.2-2025-table-4-1.json');
  for (const [units, rows] of [['English', t41.ip], ['Metric', t41.si]]) {
    for (const r of rows) {
      const upper = Number(r[0].replace('<', '').split(' to ').pop());
      for (let n = 1; n <= 5; n++) same(`62.2 ${units} ${r[0]}, ${n} bedrooms`, Math.round(dwelling622(units, upper, n)), r[n]);
    }
  }
  same('62.2 bedrooms not less than 1', dwelling622('English', 1000, 0), dwelling622('English', 1000, 1));
  lines.push('  ASHRAE 62.2-2025: Equation 4-1 reproduces all 100 cells of Tables 4-1a and 4-1b');

  // Hand-worked zone cases.
  const office = codeRow('imc', 'Offices: Office spaces');
  same('IMC office, 1,000 ft², default density: Vbz', codeZone(office, 1000, null).vbz, 5 * 5 + 0.06 * 1000);
  same('IMC office, 1,000 ft², 12 people: Vbz', codeZone(office, 1000, 12).vbz, 5 * 12 + 0.06 * 1000);
  const garage = codeRow('imc', 'Storage: Repair garages, enclosed parking garages');
  same('IMC parking garage, 10,000 ft²: exhaust', codeZone(garage, 10000, null).exhaust, 7500);
  same('IMC corridor, 500 ft²: Vbz', codeZone(codeRow('imc', 'Public spaces: Corridors'), 500, null).vbz, 30);
  same('170 AII room total ach', row170('Nursing Units and Other Patient Care Areas: AII room').total.v, '12');
  same('170: 6 ach in 1,000 ft³', achFlow(6, 1000, 'English'), 100);
  same('170: 6 ach in 36 m³', achFlow(6, 36, 'Metric'), 60);
  for (const s of STANDARDS.filter(x => ['imc', 'fbc26', 'fbc23', '170'].includes(x.id))) {
    const values = categories(s.id).map(c => c.value);
    same(`${s.id}: category values are unique`, new Set(values).size, values.length);
  }
  lines.push('  hand-worked zone and airflow cases match');

  // ASHRAE 62.1-2025 Tables 6-1, E-1 and 6-2: the page's module is exactly what
  // the generator makes from the capture (every cell, OS mark and CO2 limit),
  // the capture was cross-read against the table-only PDF (see
  // tools/extract/ashrae621-2025.mjs), and the lookups and Equation 6-1 work.
  const { t61, t62 } = build621();
  same('62.1 Table 6-1 + E-1 row count', TABLE_6_1.length, t61.length);
  t61.forEach((r, i) => same(`62.1 Table 6-1 row ${i} (${r[0]})`, TABLE_6_1[i], r));
  same('62.1 Table 6-2 row count', TABLE_6_2.length, t62.length);
  t62.forEach((r, i) => same(`62.1 Table 6-2 row ${i} (${r[0]})`, TABLE_6_2[i], r));
  const s621 = src('ashrae-62.1-2025-tables.json');
  same('62.1 capture: Table 6-1 rows', s621.table61.length, 90);
  same('62.1 capture: Table 6-2 rows', s621.table62.length, 33);
  same('62.1 capture: Table E-1 rows', s621.tableE1.length, 18);
  for (const r of [...s621.table61, ...s621.tableE1]) same(`62.1 ${r.name}: value count`, r.values.length, s621.table61.includes(r) ? 7 : 6);
  // Spot values read off the printed pages.
  const v = c => ventilation(c);
  same('62.1 office space', [v('Office Buildings-Office space').rpCfm, v('Office Buildings-Office space').raCfm, v('Office Buildings-Office space').density, v('Office Buildings-Office space').co2, v('Office Buildings-Office space').os], [5, 0.06, 5, 600, true]);
  same('62.1 restaurant dining density', v('Food and Beverage Service-Restaurant dining rooms').density, 67);
  same('62.1 educational libraries air class (blank in the standard)', v('Educational Facilities-Libraries').airClass, null);
  same('62.1 residential common corridors density (blank in the standard)', v('Residential-Common corridors').density, null);
  same('62.1 urgent care triage (E-1)', [v('Outpatient Health Care Facilities-Urgent care triage room').rpCfm, v('Outpatient Health Care Facilities-Urgent care triage room').airClass], [10, 3]);
  same('62.1 science lab exhaust', exhaust('Educational Facilities-Science laboratories').perAreaCfm, 0.35);
  same('62.1 public toilet exhaust', exhaust('Toilets—public (>1 person) per fixture (water closet or urinal)').perUnitCfm, '50/70');
  same('62.1 renamed: Cell*', current('Correctional Facilities-Cell*'), 'Correctional Facilities-Cell');
  same('62.1 office, 5,000 ft², default density: Vbz', zone('Office Buildings-Office space', 'English', 5000, null).vbz, 425);
  same('62.1 pet shop, 2,000 ft²: Vbz and exhaust', [zone('Retail-Pet shops (animal areas)', 'English', 2000, null).vbz, zone('Retail-Pet shops (animal areas)', 'English', 2000, null).exhaust], [510, 1800]);
  same('62.1 office, 500 m², metric: Vbz', zone('Office Buildings-Office space', 'Metric', 500, null).vbz, 2.5 * 25 + 0.3 * 500);
  same('62.1: categories are unique', new Set(CATEGORIES.map(key)).size, CATEGORIES.length);
  lines.push(`  ASHRAE 62.1-2025: Tables 6-1 (${s621.table61.length} rows), E-1 (${s621.tableE1.length}) and 6-2 (${s621.table62.length}) as captured; lookups and Equation 6-1 cases match`);
  return { lines, issues, checks };
}

if (process.argv[1]?.endsWith('check-ventilation-tables.mjs')) {
  const { lines, issues, checks } = checkVentilationTables();
  console.log('=== ventilation tables vs their sources ===');
  lines.forEach(l => console.log(l));
  console.log(`  ${checks} comparisons`);
  issues.slice(0, 20).forEach(i => console.log('  FAILED: ' + i));
  process.exit(issues.length ? 1 : 0);
}
