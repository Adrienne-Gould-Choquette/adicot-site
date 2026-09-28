// The kitchen hood calculator's form behaviour. The rates and the arithmetic are
// in ckv.js; this builds the appliance rows, reads the form and writes the results.
import { hood, DUTY_NAME } from './ckv.js';
import { live, num, fmt, fillRows, shareable, startingValues } from './calc-kit.js';

const MAX_ROWS = 31;   // as many as the workbook has
const IN_PER_M = 1 / 0.0254;

function init(form) {
  const el = id => document.getElementById(id);
  const rowsBox = el('ck-rows'), tpl = el('ck-row');
  const unitsNow = () => form.querySelector('input[name="u"]:checked')?.value ?? 'English';
  const rows = () => [...rowsBox.querySelectorAll('.ck-row')];

  // Row n's fields are named e<n> (appliance) and l<n> (length), so a shared
  // link carries them like any other field.
  function addRow() {
    const n = rows().length + 1;
    if (n > MAX_ROWS) return null;
    const row = tpl.content.firstElementChild.cloneNode(true);
    const [sel, len] = [row.querySelector('select'), row.querySelector('input')];
    sel.name = `e${n}`; sel.id = `ck-e${n}`; row.querySelector('label').htmlFor = sel.id;
    len.name = `l${n}`; len.id = `ck-l${n}`; row.querySelector('.ck-len label').htmlFor = len.id;
    row.querySelector('.ck-lu').textContent = unitsNow() === 'English' ? 'in' : 'm';
    row.querySelector('.ck-remove').addEventListener('click', () => removeRow(row));
    rowsBox.append(row);
    el('ck-add').disabled = n >= MAX_ROWS;
    return row;
  }
  // Removing a row renumbers the rest, keeping their values.
  function removeRow(row) {
    const kept = rows().filter(r => r !== row).map(r => [r.querySelector('select').value, r.querySelector('input').value]);
    rowsBox.replaceChildren();
    for (const [e, l] of kept.length ? kept : [['', '']]) {
      const r = addRow();
      r.querySelector('select').value = e;
      r.querySelector('input').value = l;
    }
    recalc();
  }

  // Build as many rows as a shared link (or the saved inputs) needs before it fills them in.
  const q = startingValues();
  let need = 1;
  for (let n = 1; n <= MAX_ROWS; n++) if (q.has(`e${n}`) || q.has(`l${n}`)) need = n;
  for (let n = 0; n < need; n++) addRow();
  const names = ['u', 'h', 't', 'm'];
  for (let n = 1; n <= MAX_ROWS; n++) names.push(`e${n}`, `l${n}`);
  shareable(form, names, el('ck-share'), el('ck-copied'));

  el('ck-add').addEventListener('click', () => { addRow()?.querySelector('select').focus(); });

  // Switching units converts the lengths already typed: 36 in becomes 0.9144 m.
  let was = unitsNow();
  for (const r of form.querySelectorAll('input[name="u"]')) {
    r.addEventListener('change', () => {
      const to = unitsNow();
      if (to !== was) {
        for (const row of rows()) {
          const inp = row.querySelector('input'), v = num(inp);
          if (v !== null && !Number.isNaN(v)) inp.value = String(Number((to === 'Metric' ? v / IN_PER_M : v * IN_PER_M).toPrecision(6)));
          row.querySelector('.ck-lu').textContent = to === 'English' ? 'in' : 'm';
        }
      }
      was = to;
    }, true);
  }
  form.addEventListener('reset', () => {
    was = 'English';
    setTimeout(() => { rowsBox.replaceChildren(); addRow(); recalc(); }, 0);
  });

  // The hood style's diagram.
  const figures = JSON.parse(el('ck-figures').textContent);
  function showHood() {
    const f = figures[el('ck-hood').value];
    if (!f) return;
    el('ck-img').src = f.img; el('ck-img').alt = `${el('ck-hood').value} hood`;
    el('ck-cap').textContent = f.caption;
  }

  function recalc() {
    showHood();
    const units = unitsNow(), us = units === 'English';
    const air = us ? 'cfm' : 'l/s', len = us ? 'ft' : 'm';
    const items = rows().map(r => ({ appliance: r.querySelector('select').value, length: num(r.querySelector('input')) }));
    const muaIn = num(el('ck-mua'));
    const mua = muaIn > 0 ? Math.min(muaIn, 100) : 0;
    const type = form.querySelector('input[name="t"]:checked')?.value ?? 'Type I';
    const h = el('ck-hood').value;
    const r = hood({ units, hood: h, items: items.filter(it => it.length > 0), mua });
    const notes = [];
    if (!r) {
      fillRows(el('ck-tbody'), []);
      el('ck-summary').textContent = 'Choose the appliances under the hood and enter their lengths.';
      el('ck-notes').replaceChildren();
      return;
    }
    const dp = us ? 0 : 1;
    const rng = (pair, plus) => pair[0] === pair[1] ? `${fmt(pair[0], dp)}${plus ? '+' : ''}` : `${fmt(pair[0], dp)}–${fmt(pair[1], dp)}${plus ? '+' : ''}`;
    const out = [
      ['Equipment length', fmt(r.equipLen, 2), len],
      ['Hood length (6 in. overhang each end)', fmt(r.hoodLen, 2), len],
      ['Heaviest duty under the hood', DUTY_NAME[r.maxDuty], ''],
      r.notAllowed
        ? ['Code minimum exhaust', `not allowed for ${DUTY_NAME[r.maxDuty]} duty`, '']
        : ['Code minimum exhaust', fmt(r.code, dp), air, 'cf-key'],
      r.handbook ? ['ASHRAE Handbook range', rng(r.handbook, r.extraHeavy), air] : ['ASHRAE Handbook range', 'not recommended', ''],
      r.weighted ? ['Range weighted by each appliance’s duty', rng(r.weighted, false), air] : null,
    ].filter(Boolean);
    if (mua > 0) {
      if (!r.notAllowed) out.push([`Make-up air at ${fmt(mua, 0)}%, code minimum`, fmt(r.muaCode, dp), air]);
      if (r.handbook) out.push([`Make-up air at ${fmt(mua, 0)}%, ASHRAE range`, rng(r.muaHandbook, r.extraHeavy), air]);
    }
    fillRows(el('ck-tbody'), out);
    el('ck-summary').textContent = r.notAllowed
      ? `${/^[aeiou]/i.test(h) ? 'An' : 'A'} ${h.toLowerCase()} hood is not allowed over ${DUTY_NAME[r.maxDuty]}-duty appliances. Choose another hood style.`
      : `${fmt(r.hoodLen, 2)} ${len} ${h.toLowerCase()} hood: code minimum ${fmt(r.code, dp)} ${air} `
        + `(${r.codeRate} cfm per foot of hood for ${DUTY_NAME[r.maxDuty]} duty).`;

    // The workbook's notes that apply to this hood.
    notes.push('Where any cooking appliance under a hood requires a Type I hood, a Type I hood shall be installed. Where a Type II hood is required, a Type I or Type II hood shall be installed.');
    notes.push(`${type} hoods shall be installed per IMC/FBC-M Section 507.${type === 'Type I' ? 2 : 3}.`);
    notes.push('The inside lower edge of canopy-type hoods shall overhang the top surface of the appliance by at least 6 in. (152 mm) on all open sides (IMC 507.1.6.1; FBC-M 507.4.1); the calculator adds 6 in. at each end.');
    notes.push('Outdoor air shall be sufficient for a kitchen exhaust rate of at least 0.70 cfm per square foot of kitchen space (IMC/FBC-M Table 403.3.1.1; ASHRAE 62.1).');
    if (r.maxDuty === 4 && type === 'Type I') notes.push('Type I hoods over extra-heavy-duty appliances shall not cover heavy-, medium- or light-duty appliances, and shall discharge to an exhaust system independent of other exhaust systems.');
    if (r.dishwasher) notes.push('Dishwashers shall be installed under Type II hoods. With a dishwasher under the hood, the hood is sized as if every appliance under it were a dishwasher (100 cfm per foot).');
    el('ck-notes').replaceChildren(...notes.map(t => Object.assign(document.createElement('li'), { textContent: t })));
  }

  live(form, recalc);
  recalc();
}

// Last, so every declaration above is initialised before the calculator starts.
const form = document.getElementById('ckcalc');
if (form) init(form);
