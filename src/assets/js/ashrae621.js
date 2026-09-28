// ASHRAE Standard 62.1-2025 lookups: an occupancy category's breathing-zone
// ventilation rates (Table 6-1, and Table E-1 for outpatient health care) and
// minimum exhaust rates (Table 6-2). The values are the standard's, unaltered;
// tables in ashrae621-tables.js.
import { TABLE_6_1, TABLE_6_2 } from './ashrae621-tables.js';

// Categories match on their letters and digits alone, so spacing and dashes
// never decide a match.
export const key = name => String(name).toLowerCase().replace('(continued)', '').replace(/[^a-z0-9]/g, '');
const index = table => new Map(table.map(r => [key(r[0]), r]));
const OA = index(TABLE_6_1), EX = index(TABLE_6_2);

// Every category in either table, alphabetically, under Table 6-1's spelling
// where it has one.
export const CATEGORIES = [...new Map([...TABLE_6_2, ...TABLE_6_1].map(r => [key(r[0]), r[0]])).values()]
  .sort((a, b) => a.localeCompare(b));

// Names used by the 2022 edition (and so in links shared before the update) for
// spaces the 2025 edition lists under a new name.
export const RENAMED = {
  'Correctional Facilities-Cell*': 'Correctional Facilities-Cell',
  'Educational Facilities-Classrooms (age 9 plus)': 'Educational Facilities-Classrooms (age 9+)',
  'Educational Facilities-Multiuse assembly': 'Educational Facilities-Multiuse assembly (tables and chairs)',
  'Office Buildings-Breakrooms': 'General-Break rooms',
  'Transient Residential-Common corridors': 'Residential-Common corridors',
  'Residential kitchens': 'Dwelling-unit kitchens',
  'Shower rooms': 'Shower rooms per shower head',
  'Toilets—private': 'Toilets—private (one person)',
  'Toilets—public': 'Toilets—public (>1 person) per fixture (water closet or urinal)',
};
export const current = category => {
  const hit = Object.entries(RENAMED).find(([old]) => key(old) === key(category));
  return hit ? hit[1] : category;
};

const blank = r => r.slice(1).every(v => v == null || v === 0 || v === false);

// Table 6-1 (or E-1) row, or null where the category has no breathing-zone rates.
export function ventilation(category) {
  const r = OA.get(key(category));
  if (!r || blank(r)) return null;
  const [, rpCfm, rpLs, raCfm, raLs, density, airClass, co2, os] = r;
  return { rpCfm, rpLs, raCfm, raLs, density, airClass, co2, os, appendixE: r[0].startsWith('Outpatient Health Care') };
}

// What one "unit" is for the per-unit exhaust rates.
const UNIT = {
  'Dwelling-unit kitchens': 'kitchen', 'Shower rooms per shower head': 'shower head',
  'Toilets—private (one person)': 'toilet room', 'Toilets—public (>1 person) per fixture (water closet or urinal)': 'fixture',
};

// Table 6-2 row, or null where the category has no exhaust requirement.
// `paired` is a continuous / intermittent pair such as "50/100".
export function exhaust(category) {
  const r = EX.get(key(category));
  if (!r || blank(r)) return null;
  const [name, perUnitCfm, perAreaCfm, perUnitLs, perAreaLs, airClass] = r;
  return { perUnitCfm, perAreaCfm, perUnitLs, perAreaLs, airClass, unit: UNIT[name] ?? 'unit', paired: /\//.test(String(perUnitCfm)) };
}

// The raw [Table 6-1 row, Table 6-2 row] for a category.
export const TABLE_ROW = category => [OA.get(key(category)), EX.get(key(category))];

// The standard's requirements tied to particular categories, which the 2022
// edition carried as Table 6-2's lettered notes and 2025 states in Section 6.
const RULE = {
  paired: 'The first rate is for continuous operation, the second for intermittent operation. Where intermittent operation is allowed, the exhaust is intended to run whenever the space is in use (Section 6.5.1.4, Informative Note 2).',
  toilets: 'Exhaust air from toilets that has been cleaned to meet Class 1 criteria per Section 5.14.1 may be recirculated (Section 6.5.1, Exception 3).',
  auto: 'Stands where engines are run shall have exhaust systems that connect directly to the engine exhaust and prevent the escape of fumes (Section 6.5.1.2.1).',
  garage: 'Garage exhaust shall run continuously whenever the garage is in use, unless designed by the Section 6.5.2 performance path (Section 6.5.1.2.2). Exhaust is not required where two or more sides are walls at least 50% open to the outside (Section 6.5.1, Exception 2).',
  kitchen: 'Kitchen exhaust shall comply with ANSI/ASHRAE Standard 154 (Section 6.5.1.2.3).',
  labs: 'Laboratories that comply with all of ANSI/ASSP Z9.5, or as determined by the owner’s environmental health and safety professional, need not meet the Table 6-1 and 6-2 rates (Sections 6.2.1.1.4 and 6.5.1, Exception 1).',
  animal: 'Animal facilities that have completed a risk evaluation by the owner’s environmental health and safety professional need not meet the Table 6-1 and 6-2 rates (Section 6.2.1.1.5).',
  combustion: 'Where combustion equipment is operated on the playing surface, the Section 6.5.2 exhaust requirements apply (Section 6.5.1.2).',
  cell: 'Only cells with a toilet require exhaust.',
  outpatient: 'Outpatient health care rates are from Normative Appendix E (Table E-1), for outpatient spaces the authority having jurisdiction has deemed Standard 170 not to cover. They provide for acceptable indoor air quality and do not address the airborne transmission of infectious contagions. The dental rates are only for outpatient dental clinics where the amount of nitrous oxide is limited, not for institutional buildings with piped nitrous oxide.',
};
export function rules(category) {
  const c = key(category), out = [];
  const e = exhaust(category);
  if (e?.paired) out.push(RULE.paired);
  if (c.startsWith('toilets')) out.push(RULE.toilets);
  if (c === key('Auto repair rooms')) out.push(RULE.auto);
  if (c === key('Parking garages')) out.push(RULE.garage);
  if (c === key('Kitchens—commercial')) out.push(RULE.kitchen);
  if (/laboratories/.test(c)) out.push(RULE.labs);
  if (c.startsWith('animalfacilities')) out.push(RULE.animal);
  if (c === key('Arenas')) out.push(RULE.combustion);
  if (c === key('Correctional Facilities-Cell')) out.push(RULE.cell);
  if (c.startsWith('outpatienthealthcare')) out.push(RULE.outpatient);
  return out;
}

// The drop-down's groups: the standard's headings, then the spaces Table 6-2
// lists on their own.
const HEADINGS = ['Animal Facilities', 'Correctional Facilities', 'Educational Facilities', 'Food and Beverage Service',
  'General', 'Hotels, Motels, Resorts, Dormitories', 'Miscellaneous Spaces', 'Office Buildings',
  'Outpatient Health Care Facilities', 'Public Assembly Spaces', 'Residential', 'Retail', 'Sports and Entertainment'];
export function groups() {
  const out = new Map([...HEADINGS, 'Other spaces'].map(h => [h, []]));
  for (const c of CATEGORIES) {
    const i = c.indexOf('-');
    const head = i < 0 ? '' : c.slice(0, i);
    if (out.has(head) && head !== 'Other spaces') out.get(head).push({ value: c, label: c.slice(i + 1) });
    else out.get('Other spaces').push({ value: c, label: c });
  }
  return [...out].map(([label, options]) => ({ label, options }));
}

const n = v => typeof v === 'number' ? v : null;   // "—" (not applicable) and blanks
// Breathing-zone outdoor airflow Vbz = Rp·Pz + Ra·Az (Equation 6-1) and the
// area-based exhaust, for a zone of the given floor area. Without a population,
// Pz is the default occupant density times the area (per 1000 ft² or 100 m²).
export function zone(category, units, area, people) {
  const us = units !== 'Metric';
  const v = ventilation(category), e = exhaust(category);
  const rp = v ? n(us ? v.rpCfm : v.rpLs) ?? 0 : null;
  const ra = v ? n(us ? v.raCfm : v.raLs) ?? 0 : null;
  const density = v ? n(v.density) : null;
  const pz = people ?? (density !== null && area !== null ? density * area / (us ? 1000 : 100) : null);
  const vbz = v && area !== null && (pz !== null || rp === 0) ? rp * (pz ?? 0) + ra * area : null;
  const perArea = e ? n(us ? e.perAreaCfm : e.perAreaLs) : null;
  return { pz, defaultPz: people === null, vbz, exhaust: perArea !== null && area !== null ? perArea * area : null };
}
