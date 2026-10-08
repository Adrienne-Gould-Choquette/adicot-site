// Shared behaviour for the hand-written calculators: live recalculation, number
// parsing and formatting, the results table, and a link that reopens the page
// with the same inputs. Each calculator keeps its own maths in its own module and
// its own form in a partial; this file is only the parts every one of them needs.

// Recalculate on every edit. There is no Calculate button: the maths runs in well
// under a millisecond, so there is nothing to wait for.
export function live(form, recalc) {
  const update = () => { recalc(); remember(form); };
  form.addEventListener('input', update);
  form.addEventListener('change', update);
  // A reset repopulates the fields after this event, so read them on the next
  // tick. It also forgets the saved inputs: Reset means start from the defaults.
  form.addEventListener('reset', () => { forget(); setTimeout(recalc, 0); });
  form.addEventListener('submit', e => e.preventDefault());
}

// ---- remembering the last inputs ----
// Each calculator keeps the values last entered in this browser (localStorage,
// nothing is sent anywhere), so a return visit starts where the user left off.
// A shared link's values take precedence; Reset clears the saved ones. The key
// ignores ".html" so /coil-selection-calculator and its .html form share it.
const storeKey = () => 'adicot:inputs:' + location.pathname.replace(/.html$/, '');
function remember(form) {
  const names = form._remember;
  if (!names) return;
  // Blank fields are saved too, so a field the user cleared stays clear rather
  // than coming back with the page's default value.
  const saved = {};
  for (const name of names) {
    if (form.elements[name]) saved[name] = form.elements[name].value ?? '';
  }
  try {
    if (Object.values(saved).some(v => v !== '')) localStorage.setItem(storeKey(), JSON.stringify(saved));
    else localStorage.removeItem(storeKey());
  } catch { /* storage unavailable (private mode): the calculator still works */ }
}
function forget() {
  try { localStorage.removeItem(storeKey()); } catch { /* nothing saved */ }
}
// The values a calculator starts from: a shared link's, if the URL carries any,
// otherwise the ones last entered in this browser.
export function startingValues() {
  const url = new URLSearchParams(location.search);
  if ([...url.keys()].length) return url;
  try { return new URLSearchParams(JSON.parse(localStorage.getItem(storeKey()) ?? '{}')); } catch { return new URLSearchParams(); }
}

// A field's number, null when it is empty, NaN when it is not a number.
export function num(input) {
  const raw = input.value.trim();
  if (raw === '') return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : NaN;
}

// Fixed decimals with thousands separators. Never prints "-0.00": a result that
// rounds to zero is zero, whichever side of it the floating point landed on.
export function fmt(x, dp = 2) {
  const s = x.toLocaleString('en-US', { minimumFractionDigits: dp, maximumFractionDigits: dp });
  return /^-0(\.0+)?$/.test(s) ? s.slice(1) : s;
}

// Two decimals, or four when the value is under one, so a small result such as
// 0.0114 gal/h does not round away to 0.00.
export const fmtAuto = x => fmt(x, x !== 0 && Math.abs(x) < 1 ? 4 : 2);

// Fill a results table body from [label, value, unit, className?] rows.
export function fillRows(tbody, rows) {
  tbody.replaceChildren(...rows.map(([label, value, unit, cls]) => {
    const tr = document.createElement('tr');
    if (cls) tr.className = cls;
    const th = document.createElement('th');
    th.scope = 'row';
    th.textContent = label;
    const td = document.createElement('td');
    td.className = 'cf-num';
    td.textContent = value;
    const tu = document.createElement('td');
    tu.className = 'cf-unit';
    tu.textContent = unit;
    tr.append(th, td, tu);
    return tr;
  }));
}

// Switching unit systems converts what has already been typed rather than
// reinterpreting it: 10 ft becomes 3.048 m, not 10 m. `fields` is a list of
// [input, conversion]. A conversion is a factor that multiplies a US value to get
// the SI one, or TEMP for temperatures (an offset, not a factor), or a function
// returning either, for fields whose unit depends on another choice. null or 1
// leaves the field alone. Converted values keep six significant figures, so a
// round trip does not leave 9.999999999 behind.
export const TEMP = { toSI: f => (f - 32) * 5 / 9, toUS: c => c * 9 / 5 + 32 };
export function unitSwitch(form, radioName, fields, siValue = 'SI') {
  let current = form.querySelector(`input[name="${radioName}"]:checked`)?.value;
  form.addEventListener('change', e => {
    if (e.target.name !== radioName) return;
    const next = e.target.value;
    if (next === current) return;
    const toSI = next === siValue;
    for (const [input, conversion] of fields) {
      const c = typeof conversion === 'function' ? conversion() : conversion;
      const v = num(input);
      if (!c || c === 1 || v === null || Number.isNaN(v)) continue;
      const out = typeof c === 'object' ? (toSI ? c.toSI(v) : c.toUS(v)) : (toSI ? v * c : v / c);
      input.value = String(Number(out.toPrecision(6)));
    }
    current = next;
  }, true);   // capture, so values are converted before the recalculation runs
  // Reset puts the radios back to their defaults after this event; follow them.
  form.addEventListener('reset', () => setTimeout(() => { current = form.querySelector(`input[name="${radioName}"]:checked`)?.value; }, 0));
}

// Exact unit factors (US to SI), by definition.
export const FT = 0.3048;                 // m per ft
export const FT2 = 0.09290304;            // m² per ft²
export const FT3 = 0.028316846592;        // m³ per ft³
export const CFM = 0.47194744320;         // l/s per ft³/min

// Inputs <-> query string, so a result can be shared or kept with project notes.
// Only fields listed by name take part. The page's canonical link points at the
// bare URL, so search engines see one page however many links are shared. The
// same fields are the ones remembered between visits (see live()).
export function shareable(form, names, button, status) {
  form._remember = names;
  const params = startingValues();
  for (const name of names) {
    if (!params.has(name)) continue;
    const v = params.get(name);
    const field = form.elements[name];
    if (!field) continue;
    if (field instanceof RadioNodeList || field.type === 'radio') {
      for (const r of form.querySelectorAll(`input[name="${name}"]`)) r.checked = r.value === v;
    } else {
      field.value = v;
    }
  }

  if (!button) return;
  button.hidden = false;
  button.addEventListener('click', async () => {
    const out = new URLSearchParams();
    for (const name of names) {
      const field = form.elements[name];
      const v = field?.value ?? '';
      if (v !== '') out.set(name, v);
    }
    const url = `${location.origin}${location.pathname}${out.size ? '?' + out : ''}`;
    history.replaceState(null, '', url);
    let copied = false;
    try { await navigator.clipboard.writeText(url); copied = true; } catch { /* shown in the address bar instead */ }
    if (status) {
      status.textContent = copied ? 'Link copied.' : 'Link is in the address bar.';
      clearTimeout(status._t);
      status._t = setTimeout(() => { status.textContent = ''; }, 4000);
    }
  });
}
