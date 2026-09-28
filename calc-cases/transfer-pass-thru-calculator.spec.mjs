// Answer key for Transfer Duct Sizer V1.57: airflows across the grille table's
// transition points and beyond its limit, for every duct type and supply duct
// material, through the text the Results sheet shows (including the table's
// column header) and every grille row's max supply, width and show/hide flag.
import { transfer, xround, GRILLES, TYPES, MATERIALS } from '../src/assets/js/transfer.js';

const Q = [1, 10, 20, 25, 26, 31, 38.5, 40, 50, 54.5, 63.5, 84.5, 123.4, 150, 300, 600, 720, 1200, 2332, 2332.5, 2333, 2333.5, 2400];
const cases = [];
for (const q of Q) for (const [k, type] of Object.entries(TYPES)) for (const mat of MATERIALS) {
  // The workbook stores "Transfer - Hard" with a trailing space.
  cases.push({ q, type: k === 'hard' ? type + ' ' : type, mat, height: q < 100 ? 8 : q < 1000 ? 10 : 6.5 });
}
const KEY = Object.fromEntries(Object.entries(TYPES).map(([k, v]) => [v, k]));
const ROWS = GRILLES.map((_, i) => 27 + 2 * i);

export default {
  workbook: 'G:\\My Drive\\5-Calculators\\Transfer Duct Sizer V1.57.xlsx',
  sheet: 'Results',
  inputs: { q: 'S2', type: 'S3', mat: 'S15', height: 'S22' },
  outputs: {
    limit: 'S1', label: 'A16', supply: 'S16', square: 'S17', minGrille: 'S20', grilleText: 'U20',
    minDuct: 'S21', ductText: 'U21', widthText: 'T22', diaText: 'S23', flexType: 'Z4', header: 'S26',
    ...Object.fromEntries(ROWS.flatMap(r => [[`p${r}`, `P${r}`], [`u${r}`, `U${r}`], [`s${r}`, `S${r}`], [`t${r}`, `T${r}`]])),
  },
  cases,
  run: row => {
    const q = Number(row.q), type = KEY[row.type.trim()], height = Number(row.height);
    const r = transfer(q, type, row.mat, height);
    const sq = xround(r.square, 1);
    const flex = type === 'flex';
    return {
      limit: q <= 2333 ? '' : 'Inputs over 2333 CFM are invalid!',
      label: `Estimated ${{ Flex: 'Flex', Metal: 'Metal', 'Duct board': 'Duct Board' }[r.sizedAs]} Supply Duct Size`,
      supply: `${xround(r.diameter, 2)} in. Ø round @ 0.1 in. w.g.`,
      square: `(${sq} in. x ${sq} in. square, equal friction)`,
      header: flex ? 'Min. Flex Duct\nDiameter [in]' : 'Duct = Grille Neck Size\nLxW [in x in]',
      minGrille: r.minGrille,
      grilleText: `(≈${xround(r.minGrille * 144, 1)} in²)`,
      minDuct: r.minDuct,
      ductText: `(≈${xround(r.minDuct * 144, 1)} in²)`,
      widthText: `[in]  x  width: ${xround(r.ductWidth, 1)} [in]`,
      diaText: `${xround(r.minDuctDia, 1)} in`,
      flexType: flex ? 1 : 0,
      ...Object.fromEntries(r.grilles.flatMap((g, i) => [
        [`p${ROWS[i]}`, g.hide], [`u${ROWS[i]}`, g.maxCfm],
        [`s${ROWS[i]}`, flex ? g.flexDia : g.w], [`t${ROWS[i]}`, flex ? '' : `x${g.h}`],
      ])),
    };
  },
  refuse: [],
  check: () => true,
};
