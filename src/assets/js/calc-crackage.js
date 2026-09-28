// The crack-method infiltration calculator's form behaviour. The maths is in
// crackage.js; this builds the window and door rows, reads the form and writes
// the results: infiltration, then (optionally) the building pressure the net
// outdoor air holds and the force it puts on each size of door.
import { crackage, problem, FITS, MAX_OPENINGS, pressurization, doorProblem, DOOR_LIMITS, SURFACE } from './crackage.js';
import { live, num, fmt, fillRows, shareable, startingValues } from './calc-kit.js';

// The page's worked example: four 3 × 5 ft windows and one 3 × 7 ft door.
const EXAMPLE = { windows: [['4', '3', '5']], doors: [['1', '3', '7']] };

function init(form) {
  const el = id => document.getElementById(id);
  const tpl = el('cm-row');

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
        inputs[i].setAttribute('aria-label', `${noun} ${n}, ${['quantity', 'width in feet', 'height in feet'][i]}`);
        if (values) inputs[i].value = values[i] ?? '';
      });
      if (prefix) { inputs[0].placeholder = 'e.g. 1'; inputs[2].placeholder = 'e.g. 7'; }
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
    const read = () => rows().map(r => { const [qty, width, height] = [...r.querySelectorAll('input')].map(num); return { qty, width, height }; });
    addButton.addEventListener('click', () => { add()?.querySelector('input').focus(); });
    return { names, start, fill, read };
  }

  const windows = list(el('cm-rows'), el('cm-add'), '', 'Window');
  const doors = list(el('cm-drows'), el('cm-dadd'), 'd', 'Door');
  const q = startingValues();
  windows.start(q, EXAMPLE.windows);
  doors.start(q, EXAMPLE.doors);
  const names = ['v', 'k', 'wm', 'tl', 'ta', 'bl', 'bw', 'bh', 'oa', 'wt', 'rt', 'oe', 'q75', 'dk', 'dc', 'dl', 'df'];
  for (let n = 1; n <= MAX_OPENINGS; n++) for (const p of [...windows.names, ...doors.names]) names.push(`${p}${n}`);
  shareable(form, names, el('cm-share'), el('cm-copied'));

  form.addEventListener('reset', () => setTimeout(() => { windows.fill(EXAMPLE.windows); doors.fill(EXAMPLE.doors); recalc(); }, 0));
  el('cm-dl').addEventListener('change', () => { if (el('cm-dl').value === 'custom') el('cm-df').focus(); });

  function recalc() {
    const fit = el('cm-fit').value;
    el('cm-fitdesc').textContent = FITS[fit]?.describe.trim() ?? '';
    // The windows (each size, or totals) and the doors: all of their cracks leak.
    const totals = form.querySelector('input[name="wm"]:checked')?.value === 'totals';
    el('cm-wsizes').hidden = totals;
    el('cm-wtotals').hidden = !totals;
    const doorRows = doors.read();
    const openings = [...(totals ? [] : windows.read()), ...doorRows];
    const v = { wind: num(el('cm-v')), fit, openings,
      extraCrack: totals ? num(el('cm-tl')) : null, extraArea: totals ? num(el('cm-ta')) : null,
      building: { length: num(el('cm-bl')), width: num(el('cm-bw')), height: num(el('cm-bh')) } };
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
    const out = [
      ['Linear feet of crack', fmt(r.crack, 1), 'ft'],
      ['Velocity head factor, VHF', fmt(r.vhf, 4), ''],
      [`Infiltration rate (k = ${r.k})`, fmt(r.rate, 3), 'cfm/ft'],
      ['Infiltration, Q', fmt(r.q, 1), 'cfm', 'cf-key'],
    ];
    if (r.ach !== null) out.push(['Air changes per hour', fmt(r.ach, 3), 'ACH'], ['Building volume', fmt(r.volume, 0), 'ft³']);
    fillRows(el('cm-tbody'), out);
    el('cm-table').hidden = false;
    el('cm-warn').textContent = r.warning.replace(/\*\*Warning\*\* /, 'Warning: ') + (r.warning ? '.' : '');
    el('cm-warn').hidden = !r.warning;
    el('cm-summary').textContent = r.crack === 0
      ? 'Enter the quantity and size of the windows and doors.'
      : `${fmt(r.q, 1)} cfm of infiltration through ${fmt(r.crack, 1)} ft of crack`
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
    const netOA = num(el('cm-oa'));
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
    const oe = num(el('cm-oe'));
    const env = { wallArea, wallRate: rate('cm-wt'), roofArea, roofRate: rate('cm-rt'), q75: num(el('cm-q75')), orifice: oe === null ? 0 : oe / 144 };
    const knob = num(el('cm-dk')) === null ? null : num(el('cm-dk')) / 12, closer = num(el('cm-dc'));
    const limit = custom ? num(el('cm-df')) : DOOR_LIMITS[el('cm-dl').value].lbf;
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
    const size = d => `${fmt(d.width, d.width % 1 ? 1 : 0)} × ${fmt(d.height, d.height % 1 ? 1 : 0)} ft`;
    const rows = [
      ['Building pressure from the net outdoor air', fmt(p.dp, 3), 'in. w.c.', 'cf-key'],
      ['', fmt(p.pa, 1), 'Pa'],
      ['Leakage through window and door cracks', fmt(p.parts.cracks, 0), 'cfm'],
      [measured ? 'Leakage through the envelope (measured)' : 'Leakage through walls and roof', fmt(p.parts.surface, 0), 'cfm'],
    ];
    if (!measured && dims) rows.push(['Wall area, less windows and doors', fmt(wallArea, 0), 'ft²'], ['Roof area', fmt(roofArea, 0), 'ft²']);
    if (p.parts.orifice > 0) rows.push(['Leakage through other openings', fmt(p.parts.orifice, 0), 'cfm']);
    for (const c of checks) rows.push([`Opening force, ${checks.length > 1 ? `door ${c.d.n} (${size(c.d)})` : `${size(c.d)} door`}`, fmt(c.p.force, 1), 'lbf', c === worst ? 'cf-key' : undefined]);
    rows.push(['Total opening force limit', fmt(limit, 0), 'lbf'],
      [checks.length > 1 ? 'Largest pressure the doors allow' : 'Largest pressure the door allows', fmt(allowDp, 3), 'in. w.c.'],
      ['Largest net outdoor air at that pressure', fmt(maxOA, 0), 'cfm']);
    fillRows(el('cm-ptbody'), rows);

    const dep = p.depressurized, amount = fmt(Math.abs(netOA), 0);
    const what = dep ? `${amount} cfm more exhaust than outdoor air holds the building ${fmt(p.dp, 3)} in. w.c. below outdoors`
      : `${amount} cfm of net outdoor air holds the building at ${fmt(p.dp, 3)} in. w.c.`;
    const which = checks.length > 1 ? `the ${size(worst.d)} door (door ${worst.d.n})` : 'the door';
    const over = checks.some(c => c.p.over);
    el('cm-psummary').textContent = over
      ? `${dep ? 'Over-depressurized' : 'Over-pressurized'}: ${what}, and ${which} takes ${fmt(p.force, 1)} lbf to open, over the ${fmt(limit, 0)} lbf limit. Keep the ${dep ? 'excess exhaust' : 'net outdoor air'} under about ${fmt(maxOA, 0)} cfm${dep ? ', or add makeup air' : ', or add relief'}.`
      : `Within the limit: ${what}, and ${which} takes ${fmt(p.force, 1)} lbf to open, under the ${fmt(limit, 0)} lbf limit. ${checks.length > 1 ? 'The doors allow' : 'The door allows'} up to about ${fmt(maxOA, 0)} cfm${dep ? ' of excess exhaust' : ''}.`;
    verdict(over
      ? `${dep ? 'Over-depressurized' : 'Over-pressurized'}: ${fmt(p.dp, 3)} in. w.c.; ${which} takes ${fmt(p.force, 1)} lbf to open, over the ${fmt(limit, 0)} lbf limit.`
      : `${dep ? 'Not over-depressurized' : 'Not over-pressurized'}: ${fmt(p.dp, 3)} in. w.c.${dep ? ' below outdoors' : ''}; ${which} takes ${fmt(p.force, 1)} lbf to open, within the ${fmt(limit, 0)} lbf limit.`, over);
    const notes = [`The force is for a door that opens against the pressure (${dep ? 'inward, into the building' : 'outward, away from the building'}); a door that opens the other way is pushed open instead. With no wind: wind raises the pressure across windward doors and lowers it on the leeward side.`];
    if (p.beyondCrackData) notes.push('The pressure is above 0.6 in. w.c., past the range the window crack curves were fitted for (winds up to 36 mph), so the crack leakage is extrapolated.');
    if (!measured && !dims) notes.unshift('Enter the building dimensions above to count the walls and roof; without them only the cracks and other openings leak, so the pressure shown is too high.');
    note.textContent = notes.join(' ');
  }

  live(form, recalc);
  recalc();
}

// Last, so every declaration above is initialised before the calculator starts.
const form = document.getElementById('cmcalc');
if (form) init(form);
