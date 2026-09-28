// The dehumidifier catalog printed on the selector's page, from the same module
// the calculator runs.
import { MODELS, modelBtuh, modelKW } from '../assets/js/dehumidifier.js';

const round = (x, dp) => x.toLocaleString('en-US', { minimumFractionDigits: dp, maximumFractionDigits: dp });
export default MODELS.map(([name, cfm, eff, ppd, price, url]) => ({
  name, url, cfm, eff, ppd, price: round(price, 0),
  btuh: round(modelBtuh(ppd), 0), kW: round(modelKW(ppd), 2),
}));
