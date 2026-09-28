// Answer key for Coil Selection V2.9, water/glycol sheet: every fluid and every
// "solve for" in a cooling coil, plus heating coils and below-freezing glycol,
// where V2.7 put a solved temperature on the wrong side. The face area and tube
// velocity sheets are in the specs alongside.
import { water, FLUIDS } from '../src/assets/js/coil.js';

const FIND = { 'Heat Load': 'load', 'Temp-Entering': 'entering', 'Temp-Leaving': 'leaving', 'Volumetric Flow Rate': 'flow' };
const cases = [];
for (const units of ['English', 'Metric']) for (const [fluid] of FLUIDS) for (const find of Object.keys(FIND)) {
  const us = units === 'English';
  cases.push({ units, find, load: us ? 240000 : 70, te: us ? 45 : 7, tl: us ? 55 : 12.5, flow: us ? 48 : 3.1, fluid, coil: 'Cooling' });
  // Heating: hot water in at 180°F (82°C), out at 160°F (71°C).
  cases.push({ units, find, load: us ? 480000 : 140, te: us ? 180 : 82, tl: us ? 160 : 71, flow: us ? 48 : 3.1, fluid, coil: 'Heating' });
}
// Glycol below freezing, both coil types, solving for each temperature.
for (const coil of ['Cooling', 'Heating']) for (const find of ['Temp-Entering', 'Temp-Leaving']) {
  cases.push({ units: 'Metric', find, load: 40, te: -8, tl: -3, flow: 2, fluid: 'Propylene Glycol 40%', coil });
  cases.push({ units: 'English', find, load: 90000, te: 10, tl: 20, flow: 20, fluid: 'Ethylene Glycol 50%', coil });
}

export default {
  workbook: 'G:\\My Drive\\5-Calculators\\Coil Selection V2.9.xlsx',
  sheet: 'WATER GLYCOL & FLOW',
  inputs: { units: 'B1', find: 'B2', load: 'B3', te: 'B4', tl: 'B5', flow: 'B6', fluid: 'B7', coil: 'B8' },
  outputs: { result: 'C9' },
  cases,
  run: row => ({ result: water(row.units, FIND[row.find], row.fluid,
    { load: Number(row.load), entering: Number(row.te), leaving: Number(row.tl), flow: Number(row.flow) }, row.coil) }),
  refuse: [],
  check: () => true,
};
