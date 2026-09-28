// The efficiency converter's form behaviour. The conversions are in
// efficiency.js; this reads the form and writes the results.
import { convert, problem, RATINGS } from './efficiency.js';
import { live, num, fmt, fillRows, shareable } from './calc-kit.js';

const UNIT = { COP: 'W/W', EER: 'Btu/Wh', SEER: 'Btu/Wh', SEER2: 'Btu/Wh', HSPF: 'Btu/Wh', HSPF2: 'Btu/Wh', 'kW/Ton': 'kW/ton' };

function init(form) {
  const el = id => document.getElementById(id);
  shareable(form, ['g', 'v', 'e'], el('ef-share'), el('ef-copied'));

  function recalc() {
    const given = el('ef-given').value, equip = el('ef-equip').value, v = num(el('ef-v'));
    const why = problem(v);
    if (why) {
      el('ef-summary').textContent = why;
      el('ef-table').hidden = true;
      return;
    }
    const r = convert(v, given, equip);
    fillRows(el('ef-tbody'), RATINGS.map(k => [k, fmt(r[k], 3), UNIT[k], k === given ? 'is-given' : '']));
    el('ef-table').hidden = false;
    const others = ['SEER2', 'EER', 'COP', 'kW/Ton'].filter(k => k !== given);
    el('ef-summary').textContent = `${fmt(v, 3)} ${given} (${equip.toLowerCase()}) = `
      + others.map(k => `${fmt(r[k], 3)} ${k}`).join(' = ') + '.';
  }

  live(form, recalc);
  recalc();
}

// Last, so every declaration above is initialised before the calculator starts.
const form = document.getElementById('efcalc');
if (form) init(form);
