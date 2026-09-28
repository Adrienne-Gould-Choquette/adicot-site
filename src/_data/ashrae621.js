// The ASHRAE 62.1 page's drop-down and printed tables, from the same module the
// lookup runs.
import { groups } from '../assets/js/ashrae621.js';
import { TABLE_6_1, TABLE_6_2 } from '../assets/js/ashrae621-tables.js';

const cell = v => (v === null ? '' : v === true ? '✓' : v === false ? '' : v);
export default {
  groups: groups(),
  // Table 6-1 rows first, then Table E-1's outpatient rows, as the standard prints them.
  table61: TABLE_6_1.filter(r => !r[0].startsWith('Outpatient')).map(r => r.map(cell)),
  tableE1: TABLE_6_1.filter(r => r[0].startsWith('Outpatient')).map(r => r.map(cell)),
  table62: TABLE_6_2.map(r => r.map(cell)),
};
