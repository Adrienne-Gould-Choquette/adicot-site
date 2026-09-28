// CLTD roof and wall numbers: the form behaviour. The tables are in
// cltd-tables.js; this reads the form and writes the results.
import { roofNumber, wallNumber, wallCode, ROOF_MASS, ROOF_R, WALL_R } from './cltd.js';
import { tableValues, hourly, problem } from './cltd-hourly.js';
import { live, num, fmt, fillRows, shareable, startingValues, unitSwitch, TEMP, FT2 } from './calc-kit.js';

// US to SI factors for the hourly inputs: a temperature difference (daily range)
// scales by 5/9 without an offset; U from Btu/h·ft²·°F to W/m²·K.
const DELTA_T = 5 / 9, U_SI = 5.678263337;

function init(form) {
  const el = id => document.getElementById(id);
  // Each roof type offers its own mass locations.
  const fillMass = keep => {
    const opts = ROOF_MASS[el('cl-rt').value];
    const want = keep && opts.includes(keep) ? keep : opts[0];
    el('cl-rm').replaceChildren(...opts.map(m => new Option(m, m, false, m === want)));
  };
  const q = startingValues();
  if (q.get('rt')) el('cl-rt').value = q.get('rt');
  fillMass(q.get('rm'));
  shareable(form, ['rt', 'rm', 'rr', 'wt', 'wm', 'ws', 'wr', 'u', 'wo', 'ti', 'to', 'dr', 'ru', 'ra', 'wu', 'wa'], el('cl-share'), el('cl-copied'));
  unitSwitch(form, 'u', [[el('cl-ti'), TEMP], [el('cl-to'), TEMP], [el('cl-dr'), DELTA_T],
    [el('cl-ru'), U_SI], [el('cl-wu'), U_SI], [el('cl-ra'), FT2], [el('cl-wa'), FT2]], 'SI');
  el('cl-rt').addEventListener('change', () => fillMass(el('cl-rm').value), true);

  function recalc() {
    const roof = roofNumber(el('cl-rt').value, el('cl-rm').value, el('cl-rr').value);
    const [wt, wm, ws, wr] = ['cl-wt', 'cl-wm', 'cl-ws', 'cl-wr'].map(id => el(id).value);
    const wall = wallNumber(wt, wm, ws, wr);
    fillRows(el('cl-tbody'), [
      ['CLTD roof number', roof ?? 'no value', '', 'cf-key'],
      ['Wall material code (Handbook Table 11)', wallCode(wt), ''],
      ['CLTD wall number', wall ?? 'no value', '', 'cf-key'],
    ]);
    el('cl-summary').textContent = `Roof number ${roof ?? '(none)'}, wall number ${wall ?? '(none)'}.`;
    // Where the Handbook marks a combination not possible, say which R-values it
    // does have.
    const notes = [];
    const [rt, rm, rr] = ['cl-rt', 'cl-rm', 'cl-rr'].map(id => el(id).value);
    if (roof === null) {
      const ok = ROOF_R.filter(r => roofNumber(rt, rm, r) !== null);
      notes.push(ok.length
        ? `Table 31 has no roof of this kind at R ${rr}. For this roof it has numbers for R ${ok.join(', ')}.`
        : 'Table 31 has no roof for this combination; change the mass location.');
    }
    if (wall === null) {
      const ok = WALL_R.filter(r => wallNumber(wt, wm, ws, r) !== null);
      notes.push(ok.length
        ? `The table has no wall number for R ${wr}. For this wall it has values for R ${ok.join(', ')}.`
        : 'The table has no wall number for this combination; change the mass location or the secondary material.');
    }
    const hint = el('cl-hint');
    hint.textContent = notes.join(' ');
    hint.hidden = !notes.length;
    recalcHourly(roof, wall);
  }

  function recalcHourly(roof, wall) {
    const units = form.querySelector('input[name="u"]:checked')?.value === 'SI' ? 'SI' : 'IP';
    const T = units === 'SI' ? '°C' : '°F', Q = units === 'SI' ? 'W' : 'Btu/h';
    for (const x of form.querySelectorAll('.cl-t')) x.textContent = T;
    for (const x of form.querySelectorAll('.cl-uu')) x.textContent = units === 'SI' ? 'W/m²·K' : 'Btu/h·ft²·°F';
    for (const x of form.querySelectorAll('.cl-au')) x.textContent = units === 'SI' ? 'm²' : 'ft²';
    const orient = el('cl-wo').value;
    const inputs = { units, indoor: num(el('cl-ti')), max: num(el('cl-to')), range: num(el('cl-dr')) };
    const opt = id => { const v = num(el(id)); return v === null ? null : v; };
    const why = problem({ ...inputs, u: opt('cl-ru') ?? opt('cl-wu'), area: opt('cl-ra') ?? opt('cl-wa') });
    const rv = tableValues('roof', roof === null ? null : String(roof)), wv = tableValues('wall', wall === null ? null : String(wall), orient);
    if (why || (!rv && !wv)) {
      el('cl-hsummary').textContent = why ?? 'Choose a roof or wall the tables have a number for.';
      el('cl-htable').hidden = true;
      el('cl-hnote').textContent = '';
      return;
    }
    const r = rv && hourly(rv, { ...inputs, u: opt('cl-ru'), area: opt('cl-ra') });
    const w = wv && hourly(wv, { ...inputs, u: opt('cl-wu'), area: opt('cl-wa') });
    const any = r ?? w, dp = units === 'SI' ? 1 : 0;
    const head = ['Hour'];
    if (r) head.push(`Roof ${roof}, ${T}`);
    if (w) head.push(`Wall ${wall} ${orient}, ${T}`);
    if (r?.hours[0].q != null) head.push(`Roof q, ${Q}`);
    if (w?.hours[0].q != null) head.push(`Wall q, ${Q}`);
    const tr = (cells, tag) => { const row = document.createElement('tr'); row.append(...cells.map(([t, cls]) => Object.assign(document.createElement(tag), { textContent: t, className: cls ?? '' }))); return row; };
    el('cl-hhead').replaceChildren(tr(head.map(h => [h]), 'th'));
    el('cl-hbody').replaceChildren(...any.hours.map((_, i) => {
      const cells = [[String(i + 1)]];
      const peak = (x, h) => (x.peak.hour === h.hour ? 'is-peak' : '');
      if (r) cells.push([fmt(r.hours[i].corrected, dp), peak(r, r.hours[i])]);
      if (w) cells.push([fmt(w.hours[i].corrected, dp), peak(w, w.hours[i])]);
      if (r?.hours[0].q != null) cells.push([fmt(r.hours[i].q, 0), peak(r, r.hours[i])]);
      if (w?.hours[0].q != null) cells.push([fmt(w.hours[i].q, 0), peak(w, w.hours[i])]);
      return tr(cells, 'td');
    }));
    el('cl-htable').hidden = false;
    const say = (x, what) => `${what} peaks at hour ${x.peak.hour}: CLTD ${fmt(x.peak.corrected, dp)} ${T}` + (x.peak.q != null ? `, q = ${fmt(x.peak.q, 0)} ${Q}` : '');
    el('cl-hsummary').textContent = [r && say(r, `Roof ${roof}`), w && say(w, `Wall ${wall} facing ${orient}`)].filter(Boolean).join('. ') + '.';
    el('cl-hnote').textContent = `Corrected CLTD = table CLTD ${any.correction >= 0 ? '+' : '−'} ${fmt(Math.abs(any.correction), dp)} ${T}: `
      + (units === 'SI' ? `(25.5 − ${fmt(inputs.indoor, 1)}) + (${fmt(any.tm, 1)} − 29.4)` : `(78 − ${fmt(inputs.indoor, 1)}) + (${fmt(any.tm, 1)} − 85)`)
      + `, where the outdoor mean ${fmt(any.tm, 1)} ${T} is the maximum less half the daily range. Hours are solar time. 1997 ASHRAE Handbook—Fundamentals, Table 30 (roofs) and Table 32 (walls), July, 40°N, dark surfaces`
      + (units === 'IP' ? '; °F values are converted from the SI printing (K × 1.8), within about 1 °F of the I-P printing.' : '.');
  }

  live(form, recalc);
  form.addEventListener('reset', () => setTimeout(() => { fillMass(); recalc(); }, 0));
  recalc();
}

// Last, so every declaration above is initialised before the calculator starts.
const form = document.getElementById('clcalc');
if (form) init(form);
