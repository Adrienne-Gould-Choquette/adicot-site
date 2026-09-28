// The duct size calculator's form behaviour. All of the engineering is in
// ductulator.js; this file only reads the form, relabels it when the unit
// system or the design criterion changes, and writes the results table.
//
// Results update as you type. There is no Calculate button because there is
// nothing to wait for — the model is a few dozen floating-point operations and
// runs in well under a millisecond.
import { solve, resultRows, formatDrop, Units, Criterion } from './ductulator.js';
import { live, shareable } from './calc-kit.js';

function init(form) {
  const el = id => document.getElementById(id);
  const material = el('dc-material');
  const volume = el('dc-volume');
  const value = el('dc-value');
  const height = el('dc-height');
  const table = el('dc-table');
  const tbody = el('dc-tbody');
  const summary = el('dc-summary');
  const note = el('dc-note');

  // Unit words, by unit system. Keyed the way the labels read, not the way the
  // model stores them.
  const U = {
    [Units.US]: { vol: 'cfm', vel: 'fpm', drop: "in. wg/100'", dim: 'in.' },
    [Units.METRIC]: { vol: 'l/s', vel: 'm/s', drop: 'Pa/30 m', dim: 'cm' },
  };

  // Per criterion: what the value field is called, which unit it carries, and a
  // representative value to show as a placeholder.
  const CRIT = {
    [Criterion.AIR_VELOCITY]: { label: 'Air velocity', unit: 'vel', eg: ['900', '4.5'] },
    [Criterion.FRICTION_LOSS]: { label: 'Friction loss', unit: 'drop', eg: ['0.08', '20'] },
    [Criterion.ROUND_DIA]: { label: 'Round duct diameter', unit: 'dim', eg: ['14', '35'] },
    [Criterion.RECT_WH]: { label: 'Rect. duct width', unit: 'dim', eg: ['20', '50'] },
  };

  const checked = name => form.querySelector(`input[name="${name}"]:checked`)?.value;
  const num = input => {
    const raw = input.value.trim();
    if (raw === '') return null;
    const n = Number(raw);
    return Number.isFinite(n) ? n : NaN;
  };

  function relabel() {
    const units = checked('dc-units') === Units.METRIC ? Units.METRIC : Units.US;
    const crit = checked('dc-criterion') || Criterion.FRICTION_LOSS;
    const u = U[units];
    const c = CRIT[crit];
    const metric = units === Units.METRIC;

    el('dc-volume-u').textContent = u.vol;
    el('dc-value-label').textContent = c.label;
    el('dc-value-u').textContent = u[c.unit];
    el('dc-height-u').textContent = u.dim;
    el('dc-height-label').textContent =
      crit === Criterion.RECT_WH ? 'Rect. duct height' : 'Duct height';

    volume.placeholder = metric ? '472' : '1000';
    value.placeholder = c.eg[metric ? 1 : 0];
    height.placeholder = metric ? '20' : '8';

    // The material's own spec sheet, where there is one to link to.
    const opt = material.selectedOptions[0];
    const spec = opt?.dataset.spec;
    let link = document.getElementById('dc-spec');
    if (spec) {
      if (!link) {
        link = document.createElement('a');
        link.id = 'dc-spec';
        link.className = 'dc-spec';
        link.rel = 'noopener';
        link.target = '_blank';
        el('dc-material-note').after(link);
      }
      link.href = spec;
      link.textContent = `${opt.value} spec sheet`;
      link.hidden = false;
    } else if (link) {
      link.hidden = true;
    }

    const rough = opt?.dataset.roughness;
    el('dc-material-note').textContent = rough
      ? `Absolute roughness ${rough}, which is what sets the friction loss.`
      : 'Sets the absolute roughness used for friction loss.';
  }

  function say(message) {
    summary.textContent = message;
    table.hidden = true;
    note.hidden = true;
  }

  function recalc() {
    relabel();

    const units = checked('dc-units') === Units.METRIC ? Units.METRIC : Units.US;
    const crit = checked('dc-criterion') || Criterion.FRICTION_LOSS;
    const mat = material.value;

    if (!mat) return say('Choose a duct material to size the duct.');

    const q = num(volume);
    if (q === null) return say('Enter the air volume.');
    if (!(q > 0)) return say('Air volume must be greater than zero.');

    const v = num(value);
    if (v === null) return say(`Enter the ${CRIT[crit].label.toLowerCase()}.`);
    if (!(v > 0)) return say(`${CRIT[crit].label} must be greater than zero.`);

    const h = num(height);
    if (Number.isNaN(h)) return say('Duct height is not a number.');
    if (h !== null && !(h > 0)) return say('Duct height must be greater than zero.');

    const r = solve(q, crit, v, { material: mat, units, ductHeight: h });

    // A duct this far out of range is a typo, not an answer worth printing.
    if (![r.roundDia, r.rectWidth, r.pressureDrop, r.velocityRound]
        .every(x => Number.isFinite(x) && x > 0)) {
      return say('Those values do not describe a duct. Check the air volume and the criterion.');
    }

    const sizeGiven = crit === Criterion.ROUND_DIA || crit === Criterion.RECT_WH;
    const KEY = sizeGiven ? ['Pressure Drop', 'Air Velocity, Round'] : ['Round Duct', 'Rect. Duct'];
    tbody.replaceChildren(...resultRows(r).map(([label, val, unit]) => {
      const tr = document.createElement('tr');
      if (KEY.includes(label)) tr.className = 'cf-key';
      const th = document.createElement('th');
      th.scope = 'row';
      th.textContent = label;
      const td = document.createElement('td');
      td.className = 'cf-num';
      td.textContent = val;
      const tdu = document.createElement('td');
      tdu.className = 'cf-unit';
      tdu.textContent = unit;
      tr.append(th, td, tdu);
      return tr;
    }));
    table.hidden = false;

    const u = U[units];
    const n = (x, dp) => x.toLocaleString('en-US',
      { minimumFractionDigits: dp, maximumFractionDigits: dp });
    summary.textContent =
      `${n(r.airVolume, 0)} ${u.vol} through ${mat.toLowerCase()} duct: `
      + `${n(r.roundDia, 2)} ${u.dim} round, or `
      + `${n(r.rectWidth, 2)} × ${n(r.rectHeight, 2)} ${u.dim} rectangular, `
      + `at ${formatDrop(r)} ${u.drop}.`;

    // The rectangle is the one that carries the same air at the same friction
    // rate, which is what Manual D means by equivalent.
    note.textContent = 'The rectangular duct is the equal-friction equivalent '
      + '(ACCA Manual D Appendix 3). Duct dimensions are inside dimensions.';
    note.hidden = false;
  }

  // The same field names serve a shared link and the inputs remembered between
  // visits; live() recalculates as you type and resets.
  shareable(form, ['dc-units', 'dc-criterion', 'dc-material', 'dc-volume', 'dc-value', 'dc-height']);
  live(form, recalc);
  recalc();
}

// Last, so every declaration above is initialised before the calculator starts.
const form = document.getElementById('ductcalc');
if (form) init(form);
