// The transfer duct sizer's form behaviour. The maths and the grille catalog are
// in transfer.js; this reads the form and writes the results.
import { transfer, MAX_CFM, MAKERS, maxCfmOf, largestOf } from './transfer.js';
import { live, num, fmt, fillRows, shareable } from './calc-kit.js';

const IMG = {
  pass: ['/images/transfer-pass-through.jpg', 1200, 492, 'Pass-through transfer grilles in a wall'],
  flex: ['/images/transfer-flex.png', 1200, 486, 'Transfer grilles connected by a flex duct'],
  hard: ['/images/transfer-hard.jpg', 1200, 486, 'Transfer grilles connected by a hard duct'],
};

function init(form) {
  const el = id => document.getElementById(id);
  shareable(form, ['q', 'ty', 'm', 'h', 'g'], el('tx-share'), el('tx-copied'));

  function recalc() {
    const type = form.querySelector('input[name="ty"]:checked')?.value ?? 'pass';
    const material = form.querySelector('input[name="m"]:checked')?.value ?? 'Flex';
    const maker = MAKERS[form.querySelector('input[name="g"]:checked')?.value] ? form.querySelector('input[name="g"]:checked').value : 'gt';
    const [src, w, h, alt] = IMG[type];
    const img = el('tx-img');
    if (img.getAttribute('src') !== src) Object.assign(img, { src, width: w, height: h, alt });
    el('tx-h-f').hidden = type === 'flex';

    const q = num(el('tx-q')), height = num(el('tx-h'));
    const r = q > 0 ? transfer(q, type, material, height > 0 ? height : null, maker) : null;
    const warn = el('tx-warn');
    if (!r) {
      fillRows(el('tx-tbody'), []);
      el('tx-list').hidden = true;
      warn.hidden = true;
      el('tx-summary').textContent = q === null ? 'Enter the supply airflow.' : 'The supply airflow must be more than 0 cfm.';
      return;
    }
    const flex = type === 'flex';
    const rows = [
      [`Estimated ${r.sizedAs.toLowerCase()} supply duct`, fmt(r.diameter, 2), 'in. round'],
      ['', `${fmt(r.square, 1)} × ${fmt(r.square, 1)}`, 'in. square'],
      ['Minimum grille free area', fmt(r.minGrille * 144, 1), 'in²'],
      ['Minimum transfer duct area (1.5 × supply)', fmt(r.minDuct * 144, 1), 'in²', 'cf-key'],
    ];
    if (flex) rows.push(['Minimum flex transfer duct', fmt(r.minDuctDia, 1), 'in. dia.']);
    else if (r.ductWidth !== null) rows.push([`Transfer duct width at ${fmt(height, 1)} in. high`, fmt(r.ductWidth, 1), 'in.']);
    fillRows(el('tx-tbody'), rows);

    el('tx-col').textContent = flex ? 'Grille neck, L × W' : 'Neck = duct, L × W';
    el('tx-grilles').replaceChildren(...r.shown.map(g => {
      const tr = document.createElement('tr');
      const th = Object.assign(document.createElement('th'), { scope: 'row', textContent: `${g.w} × ${g.h} in.` });
      const td = t => Object.assign(document.createElement('td'), { className: 'cf-num', textContent: t });
      tr.append(th, td(`${fmt(g.ak * 144, 0)} in²`), td(`${g.maxCfm} cfm`));
      return tr;
    }));
    el('tx-list').hidden = !r.shown.length;
    warn.hidden = !(r.overLimit || !r.shown.length);
    warn.textContent = r.overLimit
      ? `Above ${fmt(maker === 'gt' ? MAX_CFM : maxCfmOf(maker), 0)} cfm, the largest grille listed (${largestOf(maker)[0]} × ${largestOf(maker)[1]} in.) is too small; use more than one grille or a larger transfer path.`
      : `None of the ${MAKERS[maker].label} listed suits this airflow.`;
    el('tx-summary').textContent = `${fmt(q, 0)} cfm: grilles with at least ${fmt(r.minGrille * 144, 1)} in² of free area, `
      + (flex ? `on a flex duct of at least ${fmt(r.minDuctDia, 1)} in. diameter.` : `and a transfer duct of at least ${fmt(r.minDuct * 144, 1)} in².`);
  }

  // The diagram's notes are too small to read at the results column's width, so
  // a click opens it full size. The dialog takes whichever diagram is showing.
  const big = Object.assign(document.createElement('dialog'), { className: 'lightbox' });
  big.setAttribute('aria-label', 'Enlarged diagram');
  const bigImg = document.createElement('img');
  const close = Object.assign(document.createElement('button'), { type: 'button', className: 'lightbox-close', textContent: '×' });
  close.setAttribute('aria-label', 'Close');
  big.append(close, bigImg);
  document.body.append(big);
  el('tx-zoom').addEventListener('click', () => {
    const { src, width, height, alt } = el('tx-img');
    Object.assign(bigImg, { src, width, height, alt });
    big.showModal();
  });
  // A click on the picture or the backdrop closes it, as the × and Esc do.
  big.addEventListener('click', () => big.close());

  live(form, recalc);
  recalc();
}

// Last, so every declaration above is initialised before the calculator starts.
const form = document.getElementById('txcalc');
if (form) init(form);
