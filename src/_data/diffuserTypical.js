// Typical net free area by diffuser core size, for the table on the FPM to CFM
// page. The same module the calculator runs.
import { TYPICAL } from '../assets/js/diffuser.js';

export default TYPICAL.map(([L, W, net]) => ({ size: `${L} × ${W}`, core: (L * W / 144).toFixed(2), net: net.toFixed(2), ak: (net / (L * W / 144)).toFixed(2) }));
