// The kitchen hood calculator's choices and printed rate tables, from the same
// module the calculator runs.
import { APPLIANCES, HOODS, CODE, ASHRAE } from '../assets/js/ckv.js';

const IMG = {
  'Wall-mounted canopy': ['0179db_9cafe345d5954581a7a2822516fc5fd1~mv2.jpg', 'Used for all types of cooking equipment located against a wall.'],
  'Single-island canopy': ['0179db_69889a3a9b26403cbca807c8e6eb8926~mv2.jpg', 'Used for all types of cooking equipment in a single-line island configuration.'],
  'Double-island canopy (per side)': ['0179db_2320bd2f449d4fceb0554ebb304577b7~mv2.jpg', 'Used for all types of cooking equipment mounted back-to-back in an island configuration. Enter one side at a time.'],
  Eyebrow: ['0179db_42b56174681441e99cf017cd8d5ea825~mv2.jpg', 'Used for direct mounting to ovens and some dishwashers.'],
  'Back shelf/proximity/pass-over': ['0179db_9e34ec3027b5448baff6cd045a9c9de6~mv2.jpg', 'Used for counter-height equipment, typically against a wall; pass-over hoods serve from the cooking side to the serving side.'],
};

const kinds = new Map();
for (const a of [...APPLIANCES].sort((x, y) => x.label.localeCompare(y.label))) {
  const kind = a.name.startsWith('Solid fuel') ? 'Solid fuel' : a.name.split(',')[0];
  if (!kinds.has(kind)) kinds.set(kind, []);
  kinds.get(kind).push({ name: a.name, label: a.label, duty: a.duty === 'Xtra Heavy' ? 'extra heavy' : a.duty.toLowerCase() });
}

const cell = v => v === 0 || v === null ? 'Not allowed' : v;
const span = r => r === null ? 'Not recommended' : r[0] === r[1] ? `${r[0]}+` : `${r[0]}–${r[1]}`;
export default {
  hoods: HOODS.map(h => ({ value: h, img: '/images/' + IMG[h][0], caption: IMG[h][1] })),
  figures: Object.fromEntries(HOODS.map(h => [h, { img: '/images/' + IMG[h][0], caption: IMG[h][1] }])),
  appliances: [...kinds].map(([label, items]) => ({ label, items })),
  byDuty: ['Light', 'Medium', 'Heavy', 'Xtra Heavy', 'Dishwasher'].map(d => ({
    duty: d === 'Xtra Heavy' ? 'Extra heavy' : d,
    names: APPLIANCES.filter(a => a.duty === d).map(a => a.label),
  })),
  codeTable: HOODS.map(h => ({ hood: h, rates: CODE[h].map(cell) })),
  ashraeTable: HOODS.map(h => ({ hood: h, rates: ASHRAE[h].map(span) })),
};
