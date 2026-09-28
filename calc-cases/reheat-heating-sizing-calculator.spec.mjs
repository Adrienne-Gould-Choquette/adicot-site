// Answer key for the reheat coil sizing calculator (V1.4).
import { capacity, problem } from '../src/assets/js/reheat.js';

// Both unit systems; typical reheat (leaving above entering, so heating), a
// cooling case, equal temperatures, and the page's own 3,000 cfm example.
const cases = [];
for (const units of ['US', 'Metric']) {
  const flows = units === 'US' ? [150, 400, 1200, 3000, 12500] : [70, 190, 566, 1416];
  const temps = units === 'US'
    ? [[70, 52], [72, 55], [75, 58.5], [55, 75], [68, 68], [95, 40]]
    : [[21, 11], [22.2, 12.8], [24, 14.7], [13, 24], [20, 20]];
  for (const airflow of flows) for (const [leaving, entering] of temps) cases.push({ units, airflow, leaving, entering });
}

export default {
  workbook: 'G:\\My Drive\\5-Calculators\\Reheat Coil Sizing Calculator V1.4.xlsx',
  sheet: 'Sheet1',
  inputs: { units: 'B1', airflow: 'B2', leaving: 'B3', entering: 'B4' },
  outputs: { btuh: 'A8', kW: 'A9', W: 'A10' },
  cases,
  run: row => capacity({ units: row.units, airflow: Number(row.airflow), leaving: Number(row.leaving), entering: Number(row.entering) }),
  refuse: [
    { args: { airflow: null, leaving: 70, entering: 52 }, says: 'Enter the reheat coil airflow' },
    { args: { airflow: 3000, leaving: null, entering: 52 }, says: 'Enter the leaving coil temperature' },
    { args: { airflow: 3000, leaving: 70, entering: NaN }, says: 'The entering coil temperature is not a number' },
    { args: { airflow: 0, leaving: 70, entering: 52 }, says: 'The reheat coil airflow must be greater than zero' },
  ],
  check: ({ args, says }) => (problem(args) ?? '').startsWith(says),
};
