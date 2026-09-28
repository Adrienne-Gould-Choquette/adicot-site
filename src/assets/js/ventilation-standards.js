// The ventilation standards the ventilation page can look up, beyond ASHRAE
// 62.1 (which keeps its own module, ashrae621.js):
//
//   imc     2024 International Mechanical Code, Table 403.3.1.1
//   fbc26   2026 Florida Building Code, Mechanical (9th ed.), Table 403.3.1.1,
//           the same values as the 2024 IMC
//   fbc23   2023 Florida Building Code, Mechanical (8th ed.), Table 403.3.1.1
//   170     ANSI/ASHRAE/ASHE 170-2021 Table 7-1, inpatient health care spaces
//   622     ANSI/ASHRAE 62.2-2025, dwelling-unit and local exhaust rates
//
// Every rate is the source's own, unaltered; the tables are generated from the
// captured sources (tools/extract/build-ventilation-tables.mjs) and npm test holds
// them to those sources. The arithmetic here is only what each source prescribes:
// Vbz = Rp·Pz + Ra·Az, airflow = ach × room volume, Qtot = 0.03·A + 7.5·(Nbr + 1).
import { IMC_2024, FBC_2023, ASHRAE_170 } from './ventilation-tables.js';

export const STANDARDS = [
  { id: '621', label: 'ASHRAE 62.1-2025 (commercial)', short: 'ASHRAE 62.1-2025' },
  { id: 'imc', label: 'IMC 2024, Table 403.3.1.1', short: '2024 IMC' },
  { id: 'fbc26', label: 'Florida FBC-M 2026 (9th ed.), Table 403.3.1.1', short: '2026 FBC-Mechanical' },
  { id: 'fbc23', label: 'Florida FBC-M 2023 (8th ed.), Table 403.3.1.1', short: '2023 FBC-Mechanical' },
  { id: '170', label: 'ASHRAE 170-2021 (health care, inpatient)', short: 'ASHRAE 170-2021' },
  { id: '622', label: 'ASHRAE 62.2-2025 (dwelling units)', short: 'ASHRAE 62.2-2025' },
];
export const standard = id => STANDARDS.find(s => s.id === id) ?? STANDARDS[0];
export const KIND = { 621: 'ashrae621', imc: 'code', fbc26: 'code', fbc23: 'code', 170: 'ach', 622: 'dwelling' };

// ---- IMC / FBC-Mechanical Table 403.3.1.1 ----
const IMC_NOTES = {
  a: 'Based on net occupiable floor area.',
  b: 'Mechanical exhaust required and the recirculation of air from such spaces is prohibited. Recirculation of air that is contained completely within such spaces shall not be prohibited (see Section 403.2.1, Item 3).',
  c: 'Spaces unheated or maintained below 50°F are not covered by these requirements unless the occupancy is continuous.',
  d: 'Ventilation systems in enclosed parking garages shall comply with Section 404.',
  e: 'Rates are per water closet, urinal or adult changing station. The higher rate shall be provided where the exhaust system is designed to operate intermittently. The lower rate shall be permitted only where the exhaust system is designed to operate continuously while occupied.',
  f: 'Rates are per room unless otherwise indicated. The higher rate shall be provided where the exhaust system is designed to operate intermittently. The lower rate shall be permitted only where the exhaust system is designed to operate continuously while occupied.',
  g: 'Mechanical exhaust is required and recirculation from such spaces is prohibited. For occupancies other than science laboratories, where there is a wheel-type energy recovery ventilation (ERV) unit in the exhaust system design, the volume of air leaked from the exhaust airstream into the outdoor airstream within the ERV shall be less than 10 percent of the outdoor air volume. Recirculation of air that is contained completely within such spaces shall not be prohibited (see Section 403.2.1, Items 2 and 4).',
  h: 'For nail salons, each manicure and pedicure station shall be provided with a source capture system capable of exhausting not less than 50 cfm per station. Exhaust inlets shall be located in accordance with Section 502.20. Where one or more required source capture systems operate continuously during occupancy, the exhaust rate from such systems shall be permitted to be applied to the exhaust flow rate required by Table 403.3.1.1 for the nail salon.',
  i: 'Outpatient facilities to which the rates apply are freestanding birth centers, urgent care centers, neighborhood clinics and physicians’ offices, Class 1 imaging facilities, outpatient psychiatric facilities, outpatient rehabilitation facilities and outpatient dental facilities.',
  j: 'The requirements of this table provide for acceptable IAQ. The requirements of this table do not address the airborne transmission of airborne viruses, bacteria and other infectious contagions.',
  k: 'These rates are intended only for outpatient dental clinics where the amount of nitrous oxide is limited. They are not intended for dental operatories in institutional buildings where nitrous oxide is piped.',
  l: 'The occupiable floor area in warehouses shall not include the floor area of self-storage units, floor areas under rack storage or designated palletized storage floor areas.',
};
// The 2026 FBC-M prints the IMC's notes with small wording changes.
const FBC26_NOTES = { ...IMC_NOTES,
  a: 'Based upon net occupiable floor area.',
  i: 'Outpatient facilities to which the rates apply are freestanding birth centers, urgent care centers, neighborhood clinics and physicians’ offices, Class 1 imaging facilities, outpatient psychiatric facilities, outpatient rehabilitation facilities, and outpatient dental facilities.',
  j: 'The requirements of this table provide for acceptable IAQ. The requirements of this table do not address the airborne transmission or airborne viruses, bacteria, and other infectious contagions.',
  l: 'The occupiable floor area in warehouses shall not include the floor area of self-storage units, floor areas under rack storage, or designated palletized storage floor areas.',
};
// The 2023 FBC-M (on the 2021 IMC) has notes a to h, and e without adult changing stations.
const FBC23_NOTES = Object.fromEntries(Object.entries({ ...FBC26_NOTES,
  e: 'Rates are per water closet or urinal. The higher rate shall be provided where the exhaust system is designed to operate intermittently. The lower rate shall be permitted only where the exhaust system is designed to operate continuously while occupied.',
}).filter(([k]) => k <= 'h'));
const CODE = { imc: [IMC_2024, IMC_NOTES], fbc26: [IMC_2024, FBC26_NOTES], fbc23: [FBC_2023, FBC23_NOTES] };

// ---- ASHRAE 170-2021 Table 7-1 ----
// The standard's normative notes, in brief: read the note in the standard itself
// before relying on it.
const T71_NOTES = {
  a: 'Recirculating room units are acceptable except where this column says “No”.',
  b: 'Pharmacy compounding areas may need more air changes, pressure differential and filtration (USP 795, 797, 800).',
  c: 'A trauma/resuscitation room is a first-aid or emergency department room; an OR in a trauma center is an OR.',
  d: 'Pressure relationships need not be maintained when the room is unoccupied.',
  e: 'See Sections 7.2.1 (AII) and 7.2.2 (PE) for these rooms’ pressure relationships.',
  f: 'Lab rates may be higher by program, or lower where a hazard assessment (AIHA/ASSE Z9.5) or demand control allows.',
  h: 'Applies only where autopsies are not performed on site and bodies are held briefly.',
  i: 'Not used.',
  j: 'Exhaust directly outdoors where contamination or odor is a concern, with constant outdoor replacement air.',
  k: 'RH limits apply at any point within the space’s design temperature range.',
  l: 'Systems must hold the range in normal operation; other temperatures are allowed for comfort or medical need.',
  m: 'Anesthetic gases need both local scavenging and general ventilation (NIOSH; see NFPA 99).',
  n: 'Allow for short pressure excursions with doors moving; simple visual checks of airflow direction are permitted.',
  o: 'Surgical procedures may need temperatures, rates, humidity or air distribution beyond these minimums.',
  p: 'Treatment rooms used for bronchoscopy are bronchoscopy rooms; nitrous oxide use needs waste-gas exhaust.',
  q: 'HEPA filtration of recirculated air may replace exhausting outdoors, under the conditions in the note.',
  r: 'Exhaust rate shall meet or exceed local requirements.',
  s: 'Four total ach is permitted where supplemental heating or cooling (radiant, baseboard) is used.',
  t: 'PE rooms: constant-volume airflow; HEPA recirculation may add air changes but outdoor ach still apply.',
  u: 'AII rooms: HEPA recirculation may add air changes but outdoor ach still apply; 4 total ach when not used for isolation.',
  v: 'Wider temperature ranges are permitted where the laboratory program or equipment requires.',
  w: 'Exhausting all room air applies only to waiting rooms for chest x-rays for respiratory diagnosis.',
  x: 'A room planned for both bronchoscopy and GI endoscopy uses the bronchoscopy parameters.',
  y: 'Single-bed rooms with Group D diffusers need 6 total ach, on the volume up to 6 ft above the floor.',
  z: 'See AAMI ST79.',
  aa: 'Exam rooms for patients with undiagnosed gastrointestinal, respiratory or skin symptoms.',
  bb: 'Lower total ach is permitted where the 62.1 Section 6.5 performance path shows lower contaminant levels.',
  cc: 'Filter entries are minimum efficiencies; see Section 6.4.',
  dd: 'As an alternative to HEPA in Filter Bank No. 2, MERV-14 may be used with a terminal HEPA filter for the space.',
  ee: 'Bracketed FGI references point to the FGI Guidelines paragraphs.',
  ff: 'Unoccupied turndown needs a 20-minute time delay after the space becomes unoccupied.',
  gg: 'MERV-14 is required where sterile equipment is packed into sterile packages.',
  hh: 'See also Section 7.4.1(c).',
  ii: 'MERV-8 may be used if all air is exhausted outdoors and the room is kept negative.',
  jj: 'Negative pressure is required if isotopes are openly mixed in the room.',
};

// ---- ASHRAE 62.2-2025 ----
// Table 5-1 (demand-controlled) and Table 5-2 (continuous) local exhaust.
export const LOCAL_EXHAUST_622 = {
  demand: [['Kitchen, vented range hood (including appliance-range hood combinations)', '100 cfm (50 L/s)'],
    ['Kitchen, other exhaust fans, including downdraft', '300 cfm (150 L/s)'], ['Bathroom or toilet room', '50 cfm (25 L/s)']],
  continuous: [['Enclosed kitchen', '5 ach, based on kitchen volume'], ['Bathroom or toilet room', '20 cfm (10 L/s)']],
};
// Equation 4-1a (cfm, ft²) and 4-1b (L/s, m²); bedrooms not less than 1.
export function dwelling622(units, area, bedrooms) {
  const n = Math.max(1, bedrooms);
  return units === 'Metric' ? 0.15 * area + 3.5 * (n + 1) : 0.03 * area + 7.5 * (n + 1);
}

// ---- the category list for each table ----
// A category's value is "group: name", unique within its table.
const codeKey = r => `${r[0]}: ${r[1]}`;
const t71Key = r => `${r.group}: ${r.name}`;
export function categories(id) {
  if (CODE[id]) return CODE[id][0].map(r => ({ value: codeKey(r), group: r[0], label: r[1] }));
  if (id === '170') return ASHRAE_170.map(r => ({ value: t71Key(r), group: r.group, label: r.name }));
  return [];
}

// A code table's row, or null.
export function codeRow(id, category) {
  const r = CODE[id]?.[0].find(x => codeKey(x) === category);
  if (!r) return null;
  const [group, name, notes, density, rp, ra, exhaust] = r;
  return { group, name, notes: [...notes], density, rp, ra, exhaust };
}
export const codeNote = (id, letter) => CODE[id]?.[1][letter] ?? null;

export const row170 = category => ASHRAE_170.find(r => t71Key(r) === category) ?? null;
export const note170 = letter => T71_NOTES[letter] ?? null;

// Vbz = Rp·Pz + Ra·Az (IMC Equation 4-1), with Pz from the default density
// when no population is given, and the area exhaust. Only where the table's
// entries are numbers: a text entry (private dwelling living areas) has no
// arithmetic to do.
export function codeZone(row, area, people) {
  const num = v => (typeof v === 'number' ? v : null);
  const rp = num(row.rp), ra = num(row.ra), density = num(row.density);
  const pz = people ?? (density !== null && area !== null ? density * area / 1000 : null);
  const hasRates = rp !== null || ra !== null;
  const vbz = hasRates && area !== null && (pz !== null || rp === null) ? (rp ?? 0) * (pz ?? 0) + (ra ?? 0) * area : null;
  const ex = num(row.exhaust);
  return { pz, defaultPz: people === null, vbz, exhaust: ex !== null && area !== null ? ex * area : null };
}

// Airflow for an air change rate: cfm = ach × ft³ / 60, L/s = ach × m³ / 3.6.
export const achFlow = (ach, volume, units) => ach * volume / (units === 'Metric' ? 3.6 : 60);
