// The ventilation page's standard picker and the printed IMC table, from the
// modules the page runs.
import { STANDARDS } from '../assets/js/ventilation-standards.js';
import { IMC_2024 } from '../assets/js/ventilation-tables.js';

const cell = v => v ?? '—';
export default {
  standards: STANDARDS,
  imc: IMC_2024.map(([group, name, notes, ...values]) => ({ group, name, notes: [...notes].join(', '), values: values.map(cell) })),
};
