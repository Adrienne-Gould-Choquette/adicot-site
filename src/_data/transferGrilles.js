// The transfer duct sizer's return grille catalog, printed on its page from the
// same module the calculator runs.
import { GRILLES, xround } from '../assets/js/transfer.js';

export default GRILLES.map(([w, h, ak]) => ({
  neck: `${w} × ${h}`, ak: ak.toFixed(2), akIn: xround(ak * 144, 0), maxCfm: xround(ak * 288, 0),
}));
