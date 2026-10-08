// The crack-method infiltration calculator's form behaviour. The maths is in
// crackage.js; this builds the window and door rows, reads the form and writes
// the results: infiltration, then (optionally) the building pressure the net
// outdoor air holds and the force it puts on each size of door.
import { crackage, problem, FITS, MAX_OPENINGS, pressurization, doorProblem, DOOR_LIMITS, SURFACE } from './crackage.js';
import { live, num, fmt, fillRows, shareable, startingValues, unitSwitch, FT, FT2, FT3, CFM } from './calc-kit.js';

// The maths runs in IP; SI entries are converted to it and the results back.
// US to SI factors: mph to m/s, in to mm, in² to cm², lbf to N, in. w.c. to Pa.
const MPH = 0.44704, IN = 25.4, IN2 = 6.4516, LBF = 4.4482216152605, INWC = 249.0889;

// The page's worked example: four 3 × 5 ft windows and one 3 × 7 ft door.
const EXAMPLE = { windows: [['4', '3', '5']], doors: [['1', '3', '7']] };

// Each explanation opens from a "?" beside what it explains, rather than all of
// them showing. Without scripting they stay as written, beside their inputs.
function helpButtons(form) {
  let n = 0;
  for (const side of form.querySelectorAll('.cm-side')) {
    const hints = [...side.querySelectorAll('.hint, .ashrae-steps')];
    if (!hints.length) continue;
    const label = side.querySelector('label'), about = side.dataset.help ?? label?.firstChild.textContent.trim() ?? 'this';
    const button = document.createElement('button');
    button.type = 'button';
    button.className = label ? 'cm-help' : 'cm-help cm-help-plain';
    button.textContent = '?';
    button.setAttribute('aria-label', 'Explain ' + about);
    button.setAttribute('aria-expanded', 'false');
    button.setAttribute('aria-controls', hints.map(h => (h.id ||= 'cm-help-' + ++n)).join(' '));
    for (const h of hints) h.hidden = true;
    button.addEventListener('click', () => {
      const open = button.getAttribute('aria-expanded') !== 'true';
      button.setAttribute('aria-expanded', String(open));
      for (const h of hints) h.hidden = !open;
    });
    // At the end of the first label's line, or after the button a row starts with.
    const field = side.querySelector('.field');
    if (field) field.insertBefore(button, field.firstChild); else side.firstElementChild.append(button);
  }
}

function init(form) {
  helpButtons(form);
  const el = id => document.getElementById(id);
  const tpl = el('cm-row');
  const si = () => form.querySelector('input[name="u"]:checked')?.value === 'SI';
  // A field's value in the IP units the maths uses.
  const us = (input, f) => { const v = num(input); return si() && v ? v / f : v; };
  // An IP result in the chosen units.
  const show = (x, f, dp) => fmt(si() ? x * f : x, dp);
  // Swap each data-si label, option or placeholder for the chosen units.
  function relabel(root) {
    for (const e of root.querySelectorAll('[data-si]')) {
      const key = e.tagName === 'INPUT' ? 'placeholder' : 'textContent';
      e.dataset.us ??= e[key];
      e[key] = si() ? e.dataset.si : e.dataset.us;
    }
  }

  // A list of opening rows (windows, or doors). Row n's fields are
  // <prefix>q<n>, <prefix>w<n> and <prefix>h<n> (windows have no prefix, doors
  // "d"), so a shared link carries them like any other field.
  function list(box, addButton, prefix, noun) {
    const rows = () => [...box.querySelectorAll('.cm-row')];
    const names = ['q', 'w', 'h'].map(p => prefix + p);
    function add(values) {
      const n = rows().length + 1;
      if (n > MAX_OPENINGS) return null;
      const row = tpl.content.firstElementChild.cloneNode(true);
      const inputs = row.querySelectorAll('input'), labels = row.querySelectorAll('label');
      names.forEach((p, i) => {
        inputs[i].name = `${p}${n}`; inputs[i].id = `cm-${p}${n}`; labels[i].htmlFor = inputs[i].id;
        inputs[i].setAttribute('aria-label', `${noun} ${n}, ${['quantity', 'width', 'height'][i]}`);
        if (values) inputs[i].value = values[i] ?? '';
      });
      if (prefix) { inputs[0].placeholder = 'e.g. 1'; inputs[2].placeholder = 'e.g. 7'; }
      relabel(row);
      row.querySelector('.cm-remove').setAttribute('aria-label', `Remove this ${noun.toLowerCase()} size`);
      row.querySelector('.cm-remove').addEventListener('click', () => remove(row));
      box.append(row);
      addButton.disabled = n >= MAX_OPENINGS;
      return row;
    }
    // Removing a row renumbers the rest, keeping their values.
    function remove(row) {
      const kept = rows().filter(r => r !== row).map(r => [...r.querySelectorAll('input')].map(i => i.value));
      box.replaceChildren();
      for (const v of kept.length ? kept : [['', '', '']]) add(v);
      recalc();
      form.dispatchEvent(new Event('change'));   // so the saved inputs forget the row too
    }
    function fill(values) { box.replaceChildren(); for (const v of values) add(v); }
    // As many rows as a shared link (or the saved inputs) needs, else the example.
    function start(q, example) {
      let need = 0;
      for (let n = 1; n <= MAX_OPENINGS; n++) if (names.some(p => q.has(`${p}${n}`))) need = n;
      if (need) for (let n = 0; n < need; n++) add(); else fill(example);
    }
    const read = () => rows().map(r => { const [qty, width, height] = r.querySelectorAll('input'); return { qty: num(qty), width: us(width, FT), height: us(height, FT) }; });
    addButton.addEventListener('click', () => { add()?.querySelector('input').focus(); });
    return { names, start, fill, read };
  }

  const windows = list(el('cm-rows'), el('cm-add'), '', 'Window');
  const doors = list(el('cm-drows'), el('cm-dadd'), 'd', 'Door');
  const q = startingValues();
  windows.start(q, EXAMPLE.windows);
  doors.start(q, EXAMPLE.doors);
  const names = ['u', 'v', 'k', 'wm', 'tl', 'ta', 'bl', 'bw', 'bh', 'oa', 'wt', 'rt', 'oe', 'q75', 'dk', 'dc', 'dl', 'df'];
  for (let n = 1; n <= MAX_OPENINGS; n++) for (const p of [...windows.names, ...doors.names]) names.push(`${p}${n}`);
  shareable(form, names, el('cm-share'), el('cm-copied'));
  // The opening rows come and go, so they are listed afresh on each switch.
  const fixed = [['cm-v', MPH], ['cm-tl', FT], ['cm-ta', FT2], ['cm-bl', FT], ['cm-bw', FT], ['cm-bh', FT], ['cm-oa', CFM],
    ['cm-oe', IN2], ['cm-q75', CFM], ['cm-dk', IN], ['cm-dc', LBF], ['cm-df', LBF]].map(([id, f]) => [el(id), f]);
  unitSwitch(form, 'u', { *[Symbol.iterator]() {
    yield* fixed;
    for (const r of form.querySelectorAll('.cm-row')) for (const i of [...r.querySelectorAll('input')].slice(1)) yield [i, FT];
  } });

  // Reset clears the form. The browser's own reset puts back the worked example
  // the page opens with (the inputs' value attributes), so once it has run the
  // number fields are emptied, the opening rows cut to one blank row each, and
  // any open explanation closed.
  form.addEventListener('reset', () => setTimeout(() => {
    for (const i of form.querySelectorAll('input[type="number"]')) i.value = '';
    windows.fill([['', '', '']]); doors.fill([['', '', '']]);
    for (const b of form.querySelectorAll('.cm-help[aria-expanded="true"]')) b.click();
    recalc();
  }, 0));
  el('cm-dl').addEventListener('change', () => { if (el('cm-dl').value === 'custom') el('cm-df').focus(); });

  function recalc() {
    relabel(form);
    const fit = el('cm-fit').value;
    el('cm-fitdesc').textContent = FITS[fit]?.describe.trim() ?? '';
    // The windows (each size, or totals) and the doors: all of their cracks leak.
    const totals = form.querySelector('input[name="wm"]:checked')?.value === 'totals';
    el('cm-wsizes').hidden = totals;
    el('cm-wtotals').hidden = !totals;
    const doorRows = doors.read();
    const openings = [...(totals ? [] : windows.read()), ...doorRows];
    const v = { wind: us(el('cm-v'), MPH), fit, openings,
      extraCrack: totals ? us(el('cm-tl'), FT) : null, extraArea: totals ? us(el('cm-ta'), FT2) : null,
      building: { length: us(el('cm-bl'), FT), width: us(el('cm-bw'), FT), height: us(el('cm-bh'), FT) } };
    const why = problem(v);
    if (why) {
      el('cm-summary').textContent = why;
      el('cm-table').hidden = true;
      el('cm-warn').hidden = true;
      el('cm-press').hidden = true;
      verdict(null);
      return;
    }
    const r = crackage(v);
    const u = si() ? { ft: 'm', cfm: 'l/s' } : { ft: 'ft', cfm: 'cfm' };
    const out = [
      [si() ? 'Length of crack' : 'Linear feet of crack', show(r.crack, FT, 1), u.ft],
      ['Velocity head factor, VHF', si() ? fmt(r.vhf * INWC, 2) : fmt(r.vhf, 4), si() ? 'Pa' : ''],
      [`Infiltration rate (k = ${r.k})`, show(r.rate, CFM / FT, 3), si() ? 'l/s per m' : 'cfm/ft'],
      ['Infiltration, Q', show(r.q, CFM, 1), u.cfm, 'cf-key'],
    ];
    if (r.ach !== null) out.push(['Air changes per hour', fmt(r.ach, 3), 'ACH'], ['Building volume', show(r.volume, FT3, 0), si() ? 'm³' : 'ft³']);
    fillRows(el('cm-tbody'), out);
    el('cm-table').hidden = false;
    // The workbook's warning names 0 and 36 mph; in SI, give m/s first.
    const warning = si() ? r.warning.replace(/(-?\d+) mph/, (m, n) => `${fmt(n * MPH, 1)} m/s (${m})`) : r.warning;
    el('cm-warn').textContent = warning.replace(/\*\*Warning\*\* /, 'Warning: ') + (warning ? '.' : '');
    el('cm-warn').hidden = !r.warning;
    el('cm-summary').textContent = r.crack === 0
      ? 'Enter the quantity and size of the windows and doors.'
      : `${show(r.q, CFM, 1)} ${u.cfm} of infiltration through ${show(r.crack, FT, 1)} ${u.ft} of crack`
        + (r.ach !== null ? `, ${fmt(r.ach, 3)} air changes per hour.` : '.');
    pressure(v, r, doorRows);
  }

  // The one-line answer at the top of the results: over-pressurized or not.
  function verdict(text, over) {
    const v = el('cm-verdict');
    v.hidden = !text;
    v.textContent = text ?? '';
    v.classList.toggle('is-over', !!over);
  }

  // Pressurization: shown once a net outdoor air is entered. The building
  // pressure is one number; the force it takes to open a door depends on the
  // door's size, so each door size is checked and the worst decides.
  function pressure(v, r, doorRows) {
    const custom = el('cm-dl').value === 'custom';
    el('cm-df-f').hidden = !custom;
    const netOA = us(el('cm-oa'), CFM);
    // Pressure, force and air flow as text in the chosen units.
    const P = x => (si() ? `${fmt(x * INWC, 1)} Pa` : `${fmt(x, 3)} in. w.c.`);
    const F = (x, dp = 1) => `${show(x, LBF, dp)} ${si() ? 'N' : 'lbf'}`;
    const C = x => `${show(x, CFM, 0)} ${si() ? 'l/s' : 'cfm'}`;
    el('cm-press').hidden = netOA === null;
    if (netOA === null) {
      verdict('Pressurization not checked: enter the net outdoor air (outdoor air supplied minus air exhausted) to see whether the building is over-pressurized.');
      return;
    }
    const b = v.building, dims = [b.length, b.width, b.height].every(x => x > 0);
    const openingArea = v.openings.reduce((t, o) => t + (o.qty ?? 0) * (o.width ?? 0) * (o.height ?? 0), 0) + (v.extraArea ?? 0);
    const wallArea = dims ? Math.max(0, 2 * (b.length + b.width) * b.height - openingArea) : 0;
    const roofArea = dims ? b.length * b.width : 0;
    const rate = id => SURFACE[el(id).value] ?? 0;
    const oe = us(el('cm-oe'), IN2);
    const env = { wallArea, wallRate: rate('cm-wt'), roofArea, roofRate: rate('cm-rt'), q75: us(el('cm-q75'), CFM), orifice: oe === null ? 0 : oe / 144 };
    const knob = num(el('cm-dk')) === null ? null : us(el('cm-dk'), IN) / 12, closer = us(el('cm-dc'), LBF);
    const limit = custom ? us(el('cm-df'), LBF) : DOOR_LIMITS[el('cm-dl').value].lbf;
    const note = el('cm-pnote');
    const fail = why => { el('cm-psummary').textContent = why; el('cm-ptbody').replaceChildren(); note.textContent = ''; verdict(`Pressurization not checked: ${why.charAt(0).toLowerCase()}${why.slice(1)}`); };

    const sized = doorRows.map((d, i) => ({ ...d, n: i + 1 })).filter(d => d.width > 0 && d.height > 0 && (d.qty ?? 1) > 0);
    if (!sized.length) return fail('Enter a door size under Doors to check the opening force.');
    const checks = [];
    for (const d of sized) {
      const door = { width: d.width, height: d.height, knob, closer };
      const why = doorProblem({ fit: v.fit, crack: r.crack, netOA, env, door, limit });
      if (why) return fail(sized.length > 1 ? `Door ${d.n}: ${why}` : why);
      checks.push({ d, p: pressurization({ fit: v.fit, crack: r.crack, env, netOA, door, limit }) });
    }
    const worst = checks.reduce((a, c) => (c.p.force > a.p.force ? c : a));
    const p = worst.p;   // the building pressure and leakage are the same for every door
    const maxOA = Math.min(...checks.map(c => c.p.maxOA));
    const allowDp = Math.min(...checks.map(c => c.p.allowDp));
    const measured = env.q75 > 0;
    const side = x => (si() ? fmt(x * FT, 2) : fmt(x, x % 1 ? 1 : 0));
    const size = d => `${side(d.width)} × ${side(d.height)} ${si() ? 'm' : 'ft'}`;
    const [cfm, ft2, lbf] = si() ? ['l/s', 'm²', 'N'] : ['cfm', 'ft²', 'lbf'];
    const pressures = [['in. w.c.', fmt(p.dp, 3)], ['Pa', fmt(p.pa, 1)]];
    if (si()) pressures.reverse();
    const rows = [
      ['Building pressure from the net outdoor air', pressures[0][1], pressures[0][0], 'cf-key'],
      ['', pressures[1][1], pressures[1][0]],
      ['Leakage through window and door cracks', show(p.parts.cracks, CFM, 0), cfm],
      [measured ? 'Leakage through the envelope (measured)' : 'Leakage through walls and roof', show(p.parts.surface, CFM, 0), cfm],
    ];
    if (!measured && dims) rows.push(['Wall area, less windows and doors', show(wallArea, FT2, 0), ft2], ['Roof area', show(roofArea, FT2, 0), ft2]);
    if (p.parts.orifice > 0) rows.push(['Leakage through other openings', show(p.parts.orifice, CFM, 0), cfm]);
    for (const c of checks) rows.push([`Opening force, ${checks.length > 1 ? `door ${c.d.n} (${size(c.d)})` : `${size(c.d)} door`}`, show(c.p.force, LBF, 1), lbf, c === worst ? 'cf-key' : undefined]);
    rows.push(['Total opening force limit', show(limit, LBF, 0), lbf],
      [checks.length > 1 ? 'Largest pressure the doors allow' : 'Largest pressure the door allows', si() ? fmt(allowDp * INWC, 1) : fmt(allowDp, 3), si() ? 'Pa' : 'in. w.c.'],
      ['Largest net outdoor air at that pressure', show(maxOA, CFM, 0), cfm]);
    fillRows(el('cm-ptbody'), rows);

    const dep = p.depressurized, amount = C(Math.abs(netOA));
    const what = dep ? `${amount} more exhaust than outdoor air holds the building ${P(p.dp)} below outdoors`
      : `${amount} of net outdoor air holds the building at ${P(p.dp)}`;
    const which = checks.length > 1 ? `the ${size(worst.d)} door (door ${worst.d.n})` : 'the door';
    const over = checks.some(c => c.p.over);
    el('cm-psummary').textContent = over
      ? `${dep ? 'Over-depressurized' : 'Over-pressurized'}: ${what}, and ${which} takes ${F(p.force)} to open, over the ${F(limit, 0)} limit. Keep the ${dep ? 'excess exhaust' : 'net outdoor air'} under about ${C(maxOA)}${dep ? ', or add makeup air' : ', or add relief'}.`
      : `Within the limit: ${what}, and ${which} takes ${F(p.force)} to open, under the ${F(limit, 0)} limit. ${checks.length > 1 ? 'The doors allow' : 'The door allows'} up to about ${C(maxOA)}${dep ? ' of excess exhaust' : ''}.`;
    verdict(over
      ? `${dep ? 'Over-depressurized' : 'Over-pressurized'}: ${P(p.dp)}; ${which} takes ${F(p.force)} to open, over the ${F(limit, 0)} limit.`
      : `${dep ? 'Not over-depressurized' : 'Not over-pressurized'}: ${P(p.dp)}${dep ? ' below outdoors' : ''}; ${which} takes ${F(p.force)} to open, within the ${F(limit, 0)} limit.`, over);
    const notes = [`The force is for a door that opens against the pressure (${dep ? 'inward, into the building' : 'outward, away from the building'}); a door that opens the other way is pushed open instead. With no wind: wind raises the pressure across windward doors and lowers it on the leeward side.`];
    if (p.beyondCrackData) notes.push(`The pressure is above ${si() ? '150 Pa' : '0.6 in. w.c.'}, past the range the window crack curves were fitted for (winds up to ${si() ? '16 m/s' : '36 mph'}), so the crack leakage is extrapolated.`);
    if (!measured && !dims) notes.unshift('Enter the building dimensions above to count the walls and roof; without them only the cracks and other openings leak, so the pressure shown is too high.');
    note.textContent = notes.join(' ');
  }

  live(form, recalc);
  recalc();
}

// Last, so every declaration above is initialised before the calculator starts.
const form = document.getElementById('cmcalc');
if (form) init(form);
