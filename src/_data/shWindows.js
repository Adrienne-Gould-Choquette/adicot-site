// The single-hung window size chart, for the converter's picker and the full
// chart printed on its page. The same module the converter runs.
import { WINDOWS } from '../assets/js/shwindow.js';

const inches = x => String(Number(x.toFixed(4)));
export default WINDOWS.map(([code, fw, fh, mw, mh, cw, ch]) => ({
  code, egress: code.endsWith('*'),
  frame: `${inches(fw)} × ${inches(fh)}`, masonry: `${inches(mw)} × ${inches(mh)}`, clear: `${inches(cw)} × ${inches(ch)}`,
}));
