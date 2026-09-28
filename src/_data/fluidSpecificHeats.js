// The specific-heat table for the fluid mixing calculator's picker and for the
// full table printed on its page. The same module the calculator runs.
import { FLUIDS } from '../assets/js/fluid-specific-heats.js';
import { specificHeat } from '../assets/js/fluidmix.js';

// "Ammonia, 104oF" reads better as "Ammonia, 104 °F"; the stored name is unchanged.
const pretty = s => s.replace(/ /g, ' ').replace(/(-?\d)oF/g, '$1 °F');
const trim = x => Number(x.toFixed(4));

export default FLUIDS.map(([name, btu, kj]) => ({
  name, label: pretty(name), btu: trim(specificHeat(name)), kj, derived: btu === null,
}));
