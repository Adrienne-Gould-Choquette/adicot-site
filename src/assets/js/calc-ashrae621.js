// Ventilation and exhaust rates: the form behaviour. ASHRAE 62.1 lookups and zone
// arithmetic are in ashrae621.js; the other standards are in
// ventilation-standards.js. This reads the form, swaps the category list when the
// standard changes, and writes the results.
import { ventilation, exhaust, zone, rules, current } from './ashrae621.js';
import { STANDARDS, KIND, standard, categories, codeRow, codeNote, codeZone, row170, note170,
  achFlow, dwelling622, LOCAL_EXHAUST_622 } from './ventilation-standards.js';
import { combobox } from './combobox.js';
import { live, num, fmt, fillRows, shareable, startingValues, unitSwitch, FT, FT2 } from './calc-kit.js';

// Table values print as the source gives them: "—" is "not applicable".
const show = v => v == null || v === '' ? '—' : typeof v === 'number' ? String(v) : v;

const SOURCES = {
  621: 'ANSI/ASHRAE Standard 62.1-2025, Table 6-1 (minimum ventilation rates in the breathing zone), Normative Appendix E Table E-1 (outpatient health care) and Table 6-2 (minimum exhaust rates).',
  imc: '2024 International Mechanical Code, Table 403.3.1.1 (minimum ventilation rates) and Equation 4-1.',
  fbc26: '2026 Florida Building Code, Mechanical, Ninth Edition, Table 403.3.1.1 (minimum ventilation rates) and Equation 4-1.',
  fbc23: '2023 Florida Building Code, Mechanical, Eighth Edition, Table 403.3.1.1 (minimum ventilation rates) and Equation 4-1.',
  170: 'ANSI/ASHRAE/ASHE Standard 170-2021, Table 7-1 (design parameters, inpatient spaces). Notes are summarised; read them in the standard.',
  622: 'ANSI/ASHRAE Standard 62.2-2025, Equation 4-1 (total ventilation rate) and Tables 5-1 and 5-2 (local exhaust).',
};

function init(form) {
  const el = id => document.getElementById(id);
  const catSelect = el('as-cat');
  const original621 = catSelect.innerHTML;
  const stdNow = () => el('as-std').value;

  // Fill the category drop-down for a standard, keeping the choice where the
  // new table has the same category.
  function fillCategories(id, keep) {
    if (KIND[id] === 'ashrae621') catSelect.innerHTML = original621;
    else {
      const byGroup = new Map();
      for (const c of categories(id)) {
        if (!byGroup.has(c.group)) byGroup.set(c.group, []);
        byGroup.get(c.group).push(c);
      }
      catSelect.replaceChildren(...[...byGroup].map(([g, opts]) => {
        const og = document.createElement('optgroup');
        og.label = g;
        og.append(...opts.map(o => new Option(o.label, o.value)));
        return og;
      }));
    }
    if (!keep) return;
    // The same key, or failing that the same room name under any heading.
    const bare = s => s.toLowerCase().replace(/^[^:]*:\s*|^[^-]*-/, '').replace(/[^a-z0-9]/g, '');
    const opts = [...catSelect.options];
    const hit = opts.find(o => o.value === keep) ?? opts.find(o => bare(o.value) === bare(keep));
    if (hit) catSelect.value = hit.value;
  }

  // The standard and its categories are set before shareable() fills in the
  // rest, so a shared link's category exists in the list when it is chosen.
  const q = startingValues();
  const startStd = STANDARDS.some(s => s.id === q.get('std')) ? q.get('std') : '621';
  el('as-std').value = startStd;
  fillCategories(startStd);
  shareable(form, ['std', 'c', 'u', 'az', 'pz', 'ht', 'br'], el('as-share'), el('as-copied'));
  // Links and saved entries from before the 2025 update may name a space the
  // 2025 edition renamed.
  if (KIND[startStd] === 'ashrae621' && q.get('c') && catSelect.value !== q.get('c')) {
    const now = current(q.get('c'));
    if ([...catSelect.options].some(o => o.value === now)) catSelect.value = now;
  }
  const cb = combobox(catSelect);
  unitSwitch(form, 'u', [[el('as-az'), FT2], [el('as-pz'), null], [el('as-ht'), FT], [el('as-br'), null]], 'Metric');

  el('as-std').addEventListener('change', () => {
    const id = stdNow();
    // The IMC and FBC tables are in US units only.
    if (KIND[id] === 'code' && form.querySelector('input[name="u"]:checked')?.value === 'Metric') {
      const us = form.querySelector('input[name="u"][value="English"]');
      us.checked = true;
      us.dispatchEvent(new Event('change', { bubbles: true }));
    }
    fillCategories(id, catSelect.value);
    cb.refresh();
  });
  // Occupants start as the table's default (density × floor area) and follow the
  // area and category until the user types a number of their own; clearing the
  // field goes back to the default. Setting .value from script fires no input
  // event, so only the user's typing marks the field as their own.
  let pzOwn = null;   // null until the first recalc decides whether a restored value is the user's
  el('as-pz').addEventListener('input', () => { pzOwn = el('as-pz').value.trim() !== ''; });
  form.addEventListener('reset', () => setTimeout(() => { pzOwn = false; fillCategories('621'); cb.refresh(); recalc(); }, 0));
  function defaultPz(kind, id, cat, us, area) {
    if (area === null) return null;
    const d = kind === 'ashrae621' ? ventilation(cat)?.density : kind === 'code' ? codeRow(id, cat)?.density : null;
    return typeof d === 'number' ? d * area / (us ? 1000 : 100) : null;
  }

  function layout(kind) {
    el('as-cat-f').hidden = kind === 'dwelling';
    el('as-units').hidden = kind === 'code';
    el('as-units-note').hidden = kind !== 'code';
    el('as-pz-f').hidden = !(kind === 'ashrae621' || kind === 'code');
    el('as-ht-f').hidden = kind !== 'ach';
    el('as-br-f').hidden = kind !== 'dwelling';
    el('as-zone-l').textContent = kind === 'dwelling' ? 'Dwelling unit' : kind === 'ach' ? 'Room (optional)' : 'Zone (optional)';
    el('as-az-l').innerHTML = kind === 'ashrae621' || kind === 'code' ? 'Floor area, A<sub>z</sub>' : 'Floor area';
    el('as-zone-hint').textContent = kind === 'ach' ? 'Enter the floor area and ceiling height to turn the air change rates into airflow.'
      : kind === 'dwelling' ? 'Conditioned floor area of the dwelling unit, and its number of bedrooms (not less than 1).'
        : 'Occupants start at the table’s default occupant density times the floor area. Type your own number to override it; clear it to go back to the default.';
    el('as-source').textContent = SOURCES[stdNow()];
  }

  function recalc() {
    const id = stdNow(), kind = KIND[id];
    layout(kind);
    const us = (form.querySelector('input[name="u"]:checked')?.value ?? 'English') === 'English' || kind === 'code';
    const U = us ? { air: 'cfm', area: 'ft²', len: 'ft', vol: 'ft³', dens: 'per 1,000 ft²' } : { air: 'L/s', area: 'm²', len: 'm', vol: 'm³', dens: 'per 100 m²' };
    for (const s of form.querySelectorAll('.as-area')) s.textContent = U.area;
    for (const s of form.querySelectorAll('.as-len')) s.textContent = U.len;
    const az = num(el('as-az'));
    const area = az > 0 ? az : null;
    const def = kind === 'ashrae621' || kind === 'code' ? defaultPz(kind, id, catSelect.value, us, area) : null;
    const shown = def === null ? '' : String(Number(def.toFixed(2)));
    if (pzOwn === null) pzOwn = el('as-pz').value.trim() !== '' && el('as-pz').value.trim() !== shown;
    // Not while the user is in the field: clearing it to type a new number must not
    // refill it under their cursor. It refills when they leave (a change event).
    if (!pzOwn && document.activeElement !== el('as-pz')) el('as-pz').value = shown;
    el('as-pz').placeholder = area === null ? 'enter a floor area' : def === null ? 'no default; enter occupants' : 'table default';
    const pz = num(el('as-pz'));
    // The default goes to the arithmetic as "no population given", so the results
    // label it as the default and use the unrounded value.
    const people = pzOwn && pz !== null && pz >= 0 ? pz : null;
    const out = { oa: [], ex: [], notes: [], summary: '' };
    if (kind === 'ashrae621') run621(catSelect.value, us, U, area, people, out);
    else if (kind === 'code') runCode(id, catSelect.value, U, area, people, out);
    else if (kind === 'ach') run170(catSelect.value, us, U, area, num(el('as-ht')), out);
    else run622(us, U, area, num(el('as-br')), out);
    fillRows(el('as-oa'), out.oa);
    fillRows(el('as-ex'), out.ex);
    el('as-ex').closest('table').hidden = !out.ex.length;
    el('as-summary').textContent = out.summary;
    el('as-note').replaceChildren(...out.notes.map(t => Object.assign(document.createElement('li'), { textContent: t })));
    el('as-note').hidden = !out.notes.length;
  }

  function run621(cat, us, U, area, people, out) {
    const units = us ? 'English' : 'Metric';
    const v = ventilation(cat), e = exhaust(cat), z = zone(cat, units, area, people);
    if (v) {
      out.oa.push(['People outdoor air rate, Rp', show(us ? v.rpCfm : v.rpLs), `${U.air}/person`],
        ['Area outdoor air rate, Ra', show(us ? v.raCfm : v.raLs), `${U.air}/${U.area}`],
        ['Default occupant density', v.density === null ? 'not given' : show(v.density), typeof v.density === 'number' ? U.dens : ''],
        ['Air class', v.airClass === null ? 'not given' : show(v.airClass), '']);
      if (!v.appendixE) out.oa.push(['Maximum CO₂ above ambient, ΔC6.1', show(v.co2), typeof v.co2 === 'number' ? 'ppm' : ''],
        ['Occupied-standby (OS, 6.2.6.2)', v.os ? 'allowed' : 'no', '']);
      if (z.pz !== null && area !== null) out.oa.push([z.defaultPz ? 'Zone population, Pz (default)' : 'Zone population, Pz', fmt(z.pz, z.pz % 1 ? 1 : 0), 'people']);
      if (z.vbz !== null) out.oa.push(['Breathing-zone outdoor air, Vbz', fmt(z.vbz, us ? 0 : 1), U.air, 'cf-key']);
      else if (area !== null) out.notes.push('Enter the number of occupants to find Vbz; this category has no default density.');
    } else out.oa.push(['Table 6-1', 'not listed', '']);
    if (e) {
      const unit = show(us ? e.perUnitCfm : e.perUnitLs), per = show(us ? e.perAreaCfm : e.perAreaLs);
      if (unit !== '—') out.ex.push([e.paired ? 'Exhaust rate, continuous / intermittent' : 'Exhaust rate, per unit', unit, `${U.air} per ${e.unit}`]);
      if (per !== '—') out.ex.push(['Exhaust rate, per area', per, `${U.air}/${U.area}`]);
      out.ex.push(['Exhaust air class', show(e.airClass), '']);
      if (z.exhaust !== null) out.ex.push(['Minimum exhaust for this area', fmt(z.exhaust, us ? 0 : 1), U.air, 'cf-key']);
    } else out.ex.push(['Table 6-2', 'no exhaust required', '']);
    out.notes.push(...rules(cat));
    const parts = [];
    if (v) parts.push(z.vbz !== null ? `Vbz ${fmt(z.vbz, us ? 0 : 1)} ${U.air}` : `Rp ${show(us ? v.rpCfm : v.rpLs)} ${U.air}/person, Ra ${show(us ? v.raCfm : v.raLs)} ${U.air}/${U.area}`);
    else parts.push('not listed in Table 6-1');
    if (e) parts.push(z.exhaust !== null ? `exhaust ${fmt(z.exhaust, us ? 0 : 1)} ${U.air}`
      : e.paired ? `exhaust ${show(us ? e.perUnitCfm : e.perUnitLs)} ${U.air} per ${e.unit} (continuous/intermittent)` : 'exhaust per Table 6-2');
    else parts.push('no exhaust required');
    out.summary = `${cat}: ${parts.join('; ')}.`;
  }

  function runCode(id, cat, U, area, people, out) {
    const r = codeRow(id, cat);
    if (!r) { out.summary = 'Choose an occupancy category.'; return; }
    const text = typeof r.rp === 'string' || typeof r.density === 'string';
    out.oa.push(['Occupant density', show(r.density), typeof r.density === 'number' ? '#/1,000 ft²' : ''],
      ['People outdoor airflow rate, Rp', show(r.rp), typeof r.rp === 'number' ? 'cfm/person' : ''],
      ['Area outdoor airflow rate, Ra', show(r.ra), typeof r.ra === 'number' ? 'cfm/ft²' : '']);
    const z = text ? null : codeZone(r, area, people);
    if (z) {
      if (z.pz !== null && area !== null && r.rp !== null) out.oa.push([z.defaultPz ? 'Zone population, Pz (default)' : 'Zone population, Pz', fmt(z.pz, z.pz % 1 ? 1 : 0), 'people']);
      if (z.vbz !== null) out.oa.push(['Breathing-zone outdoor air, Vbz', fmt(z.vbz, 0), 'cfm', 'cf-key']);
      else if (area !== null && (r.rp !== null || r.ra !== null)) out.notes.push('Enter the number of occupants to find Vbz; this occupancy has no default density.');
    }
    const perRoom = typeof r.exhaust === 'string';
    const letter = r.notes.find(L => L === 'e' || L === 'f');
    out.ex.push(['Exhaust airflow rate', show(r.exhaust), r.exhaust === null ? '' : perRoom ? (letter === 'e' ? 'cfm per fixture' : /shower/i.test(r.name) ? 'cfm per shower head' : 'cfm per room') : 'cfm/ft²']);
    if (z?.exhaust != null) out.ex.push(['Minimum exhaust for this area', fmt(z.exhaust, 0), 'cfm', 'cf-key']);
    const letters = [...new Set([...(typeof r.density === 'number' || typeof r.ra === 'number' || typeof r.exhaust === 'number' ? ['a'] : []), ...r.notes])].sort();
    for (const L of letters) if (codeNote(id, L)) out.notes.push(`Note ${L}: ${codeNote(id, L)}`);
    const parts = [];
    if (text) parts.push(`${show(r.rp)}`);
    else if (z?.vbz != null) parts.push(`Vbz ${fmt(z.vbz, 0)} cfm`);
    else if (r.rp !== null || r.ra !== null) parts.push(`Rp ${show(r.rp)} cfm/person, Ra ${show(r.ra)} cfm/ft²`);
    else parts.push('no outdoor air rate');
    parts.push(r.exhaust === null ? 'no exhaust rate' : z?.exhaust != null ? `exhaust ${fmt(z.exhaust, 0)} cfm` : `exhaust ${show(r.exhaust)} ${perRoom ? 'cfm (lower rate for continuous operation)' : 'cfm/ft²'}`);
    out.summary = `${r.name}: ${parts.join('; ')}.`;
  }

  function run170(cat, us, U, area, height, out) {
    const r = row170(cat);
    if (!r) { out.summary = 'Choose a space.'; return; }
    const val = c => c.v + (c.n.length ? ` (note ${c.n.join(', ')})` : '');
    const [tf, tc] = r.temp.v.split('/');
    const temp = r.temp.v === 'NR' ? 'NR' : us ? `${tf} °F` : `${tc} °C`;
    out.oa.push(['Pressure relationship to adjacent areas', val(r.pressure), ''],
      ['Minimum outdoor air changes', val(r.oa), r.oa.v === 'NR' ? '' : 'ach'],
      ['Minimum total air changes', val(r.total), r.total.v === 'NR' ? '' : 'ach'],
      ['All room air exhausted directly to outdoors', val(r.exhausted), ''],
      ['Air recirculated by room units', val(r.recirc), ''],
      ['Unoccupied turndown', val(r.turndown), ''],
      ['Minimum filter efficiency', val(r.filter), ''],
      ['Design relative humidity', val(r.rh), r.rh.v === 'NR' ? '' : '%'],
      ['Design temperature', temp + (r.temp.n.length ? ` (note ${r.temp.n.join(', ')})` : ''), '']);
    if (r.fgi) out.oa.push(['FGI Guidelines reference', r.fgi, '', 'cf-wrap']);
    const oaN = Number(r.oa.v), totN = Number(r.total.v);
    const vol = area !== null && height > 0 ? area * height : null;
    if (vol !== null) {
      out.ex.push(['Room volume', fmt(vol, 0), U.vol]);
      if (!Number.isNaN(oaN)) out.ex.push(['Minimum outdoor airflow', fmt(achFlow(oaN, vol, us ? 'English' : 'Metric'), us ? 0 : 1), U.air, 'cf-key']);
      if (!Number.isNaN(totN)) out.ex.push(['Minimum total airflow', fmt(achFlow(totN, vol, us ? 'English' : 'Metric'), us ? 0 : 1), U.air, 'cf-key']);
    }
    if (!Number.isNaN(oaN) && !Number.isNaN(totN) && oaN > totN) {
      out.notes.push('As printed in the standard, this row’s minimum outdoor ach exceeds its minimum total ach. Check your copy of the standard and its errata before designing to it.');
    }
    const letters = [...new Set([...r.notes, ...['pressure', 'oa', 'total', 'exhausted', 'recirc', 'turndown', 'filter', 'rh', 'temp'].flatMap(k => r[k].n)])];
    for (const L of letters) if (note170(L)) out.notes.push(`Note ${L}: ${note170(L)}`);
    out.summary = `${r.name}: ${r.pressure.v === 'NR' ? 'no pressure requirement' : r.pressure.v.toLowerCase()}, `
      + `${r.oa.v === 'NR' ? 'no outdoor ach requirement' : `${r.oa.v} outdoor ach`}, ${r.total.v === 'NR' ? 'no total ach requirement' : `${r.total.v} total ach`}, ${r.filter.v}`
      + (vol !== null && !Number.isNaN(totN) ? `; ${fmt(achFlow(totN, vol, us ? 'English' : 'Metric'), us ? 0 : 1)} ${U.air} total.` : '.');
  }

  function run622(us, U, area, bedrooms, out) {
    const q = area !== null && bedrooms !== null && !Number.isNaN(bedrooms) && bedrooms >= 0 ? dwelling622(us ? 'English' : 'Metric', area, bedrooms) : null;
    if (q !== null) {
      out.oa.push(['Bedrooms used (not less than 1)', String(Math.max(1, bedrooms)), ''],
        ['Total required ventilation rate, Qtot', fmt(q, us ? 0 : 1), U.air, 'cf-key']);
      out.summary = `Qtot ${fmt(q, us ? 0 : 1)} ${U.air} of continuous whole-dwelling ventilation.`;
    } else {
      out.summary = 'Enter the floor area and the number of bedrooms.';
    }
    for (const [a, v] of LOCAL_EXHAUST_622.demand) out.ex.push([`Demand-controlled: ${a}`, v, '', 'cf-wrap']);
    for (const [a, v] of LOCAL_EXHAUST_622.continuous) out.ex.push([`Continuous: ${a}`, v, '', 'cf-wrap']);
    out.notes.push('Qtot = 0.03 Afloor + 7.5 (Nbr + 1) cfm, or 0.15 Afloor + 3.5 (Nbr + 1) L/s (Equation 4-1). Section 4.1.2 allows an infiltration credit for detached units with a blower door test; it is not applied here.',
      'Each kitchen, bathroom and toilet room needs local exhaust at the Table 5-1 (demand-controlled) or Table 5-2 (continuous) rate. Kitchens that are not enclosed need demand-controlled exhaust.');
  }

  live(form, recalc);
  recalc();
}

// Last, so every declaration above is initialised before the calculator starts.
const form = document.getElementById('ascalc');
if (form) init(form);
