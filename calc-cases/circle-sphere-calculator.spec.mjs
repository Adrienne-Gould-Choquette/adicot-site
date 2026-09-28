// Answer key for the circle and sphere calculator (Circle_Area_and_Circumference
// V1.11): every input type, in all four units, including the soccer ball example.
import { solve, problem, TYPES } from '../src/assets/js/circle.js';

const cases = [];
for (const [units, subs] of [['US', ['in', 'ft']], ['Metric', ['cm', 'm']]]) for (const sub of subs) {
  for (const type of TYPES) for (const value of [0.5, 11, 5575, 1234.567]) {
    // The workbook reads US inputs from row 2 and metric ones from row 3.
    cases.push(units === 'US'
      ? { units, typeUS: type, valueUS: value, subUS: sub, typeSI: '', valueSI: '', subSI: '' }
      : { units, typeUS: '', valueUS: '', subUS: '', typeSI: type, valueSI: value, subSI: sub });
  }
}

export default {
  workbook: 'G:\\My Drive\\5-Calculators\\Circle_Area_and_Circumference V1.11.xlsx',
  sheet: 'Sheet1',
  inputs: { units: 'A1', typeUS: 'A2', valueUS: 'B2', subUS: 'C2', typeSI: 'A3', valueSI: 'B3', subSI: 'C3' },
  outputs: {
    radiusIn: 'G7', radiusFt: 'G8', diameterIn: 'G9', diameterFt: 'G10', circleAreaIn: 'G11', circleAreaFt: 'G12',
    circumIn: 'G13', circumFt: 'G14', sphereVolIn: 'G15', sphereVolFt: 'G16', sphereAreaIn: 'G17', sphereAreaFt: 'G18',
    radiusCm: 'F7', radiusM: 'F8', diameterCm: 'F9', diameterM: 'F10', circleAreaCm: 'F11', circleAreaM: 'F12',
    circumCm: 'F13', circumM: 'F14', sphereVolCm: 'F15', sphereVolM: 'F16', sphereAreaCm: 'F17', sphereAreaM: 'F18',
  },
  cases,
  run: row => row.units === 'US'
    ? solve(row.typeUS, Number(row.valueUS), row.subUS)
    : solve(row.typeSI, Number(row.valueSI), row.subSI),
  refuse: [
    { args: [null], says: 'Enter a value' },
    { args: [0], says: 'The value must be greater than zero' },
    { args: [NaN], says: 'The value is not a number' },
  ],
  check: ({ args, says }) => (problem(...args) ?? '').startsWith(says),
};
