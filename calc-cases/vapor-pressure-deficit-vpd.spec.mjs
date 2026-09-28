// Answer key for the VPD calculator (VPD_Vapor_Pressure_Differential V1.4): both
// unit systems, from the wet bulb or from RH (with and without a wet bulb also
// entered), with and without a leaf temperature, and below freezing.
import { vpd, problem } from '../src/assets/js/vpd.js';

const round2 = x => Math.sign(x) * Math.round(Number(Math.abs(x).toPrecision(15)) * 100) / 100;
const cases = [];
for (const units of ['US Units', 'Metric Units']) {
  const us = units === 'US Units';
  for (const [room, wb, rh, leaf] of us
    ? [[77, 65, '', 75], [77, 65, 0.55, 75], [85, 70, 0.6, 82], [68, 58, '', ''], [90, 72, 0.5, 88], [80, '', 0.7, 78], [30, 25, '', ''], [20, '', 0.6, 18], [35, 30.5, '', 33]]
    : [[25, 18.3, '', 24], [25, 18.3, 0.55, 24], [29.4, 21.1, 0.6, 27.8], [20, 14.4, '', ''], [32.2, 22.2, 0.5, 31.1], [26.7, '', 0.7, 25.6], [-1, -4, '', ''], [-6.7, '', 0.6, -7.8]]) {
    for (const alt of us ? [0, 4000] : [0, 1200]) cases.push({ units, room, wb, rh, alt, leaf });
  }
}
const n = v => (v === '' ? null : Number(v));

export default {
  workbook: 'G:\\My Drive\\5-Calculators\\VPD_Vapor_Pressure_Differential V1.4.xlsx',
  sheet: 'Sheet1',
  inputs: { units: 'D1', room: 'D2', wb: 'D3', rh: 'D6', alt: 'D7', leaf: 'D10' },
  outputs: { wbOut: 'D15', dp: 'D16', rhOut: 'D17', v: 'D18', h: 'D19', W: 'D20', grains: 'D21', patm: 'D22', pws: 'D23', pw: 'D24', airText: 'D25', leafText: 'D26' },
  cases,
  run: row => {
    const r = vpd({ units: row.units === 'US Units' ? 'US' : 'Metric', room: Number(row.room), wb: n(row.wb),
      rh: n(row.rh), altitude: Number(row.alt), leaf: n(row.leaf) });
    // The workbook's own text for the two deficits.
    return { ...r, wbOut: r.wb, rhOut: r.rh, grains: r.grains ?? '**', airText: `${round2(r.pws - r.pw)}kPa`,
      leafText: r.leaf === null ? 'kPa' : `${round2(r.leaf)}kPa` };   // the workbook shows a bare "kPa" with no leaf
  },
  refuse: [
    { args: { room: 77, wb: 80, rh: null, altitude: 0 }, says: 'The wet bulb cannot be higher' },
    { args: { room: 77, wb: 65, rh: 1.5, altitude: 0 }, says: 'The relative humidity must be' },
  ],
  check: ({ args, says }) => (problem(args) ?? '').startsWith(says),
};
