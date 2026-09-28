// Condensate pump selection: the pumps of the chosen type and voltage that can
// lift the condensate flow to the chosen head.
//
// A port of Condensate Pump Specifier V5.3.xlsx (Little Giant HVAC catalog 995505, rev 01-26);
// check-calculators.mjs holds this file to the workbook's own answers. A pump is
// listed when its type and voltage match and its flow at the design head is at
// least the condensate flow. The catalog gives flow at a few heads only; between
// them the flow at the next higher listed head is used (conservative), and above
// the highest listed head the pump is not rated, so it is not listed. The
// condensate flow itself comes from twostate.js (exact ASHRAE psychrometrics,
// as the condensate calculator), or is entered directly.
import { HEADS, PUMPS } from './condensate-pump-models.js';

export { HEADS };
// The pump types, and the voltages each is made for, in the workbook's order.
export const TYPES = [...new Set(PUMPS.filter(p => !p[5]).map(p => p[2]))].sort();
export const voltsFor = type => [...new Set(PUMPS.filter(p => p[2] === type && !p[5]).map(p => p[3]))].sort((a, b) => a - b);

// Flow at the listed head at or next above `head`, 0 above the highest listed.
export function flowAt(flows, head) {
  const i = HEADS.findIndex((h, k) => h >= head && flows[k] !== null);
  return i < 0 ? { gph: 0, at: null } : { gph: flows[i], at: HEADS[i] };
}

export function selectPumps({ type, volts, head, gph }) {
  return PUMPS.map(([row, model, t, v, flows, fixedOut]) => {
    const cap = flowAt(flows, head);
    const ok = !fixedOut && t === type && v === volts && !(cap.gph < gph);
    return { row, model, type: t, volts: v, flows, capacity: cap.gph, ratedAt: cap.at, ok,
      max: Math.max(...flows.filter(f => f !== null)) };
  });
}

export function problem({ type, volts, head, gph }) {
  if (!TYPES.includes(type)) return 'Choose the pump type.';
  if (!voltsFor(type).includes(volts)) return 'Choose the voltage.';
  if (head === null) return 'Enter the head height.';
  if (Number.isNaN(head) || head < 0) return 'The head height must be a positive number of feet.';
  if (gph === null) return 'Enter the condensate flow.';
  if (Number.isNaN(gph) || gph < 0) return 'The condensate flow must be a positive number.';
  return null;
}
