// The code default fenestration and door tables, for the lookup's form and for
// the full tables printed on its page. The same module the lookup runs.
import { FRAMES, FENESTRATION, DOORS } from '../assets/js/fenestration.js';

// Table C303.1.3(1): U-factor by frame and panes (clear and tinted agree).
const uRows = [];
for (const frame of FRAMES) {
  const u = panes => FENESTRATION.find(r => r[0] === frame && r[1] === panes)[3];
  uRows.push({ frame, single: u('Single Pane'), double: u('Double Pane') });
}

// Table C303.1.3(3): SHGC and VT by panes and glazing, for everything but glass block.
const shgcRows = ['Single Pane', 'Double Pane'].flatMap(panes => ['Clear', 'Tinted'].map(glazing => {
  const r = FENESTRATION.find(x => x[0] === 'Metal' && x[1] === panes && x[2] === glazing);
  return { panes, glazing, shgc: r[4], vt: r[5] };
}));

export default { frames: FRAMES, doors: DOORS, uRows, shgcRows };
