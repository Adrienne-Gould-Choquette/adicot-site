// Air flow rate from air changes per hour, or the reverse, for a room.
//
// A port of ACH V1.6.xlsx, formula for formula and in the workbook's order, so
// the two agree to the last bit; check-calculators.mjs holds this file to the
// workbook's own answers.
//
//   US: Q [cfm] = ACH x V [ft³] / 60        ACH = Q / V x 60
//   SI: Q [l/s] = ACH / 3600 x V [m³] x 1000 ACH = 3600 x Q / V / 1000

// units: 'US' | 'SI'. given: 'Q' (an air flow rate) | 'ACH'. areaMode: 'area' | 'lw'.
export function solve({ units, given, value, height, areaMode, area, length, width }) {
  const volume = areaMode === 'area' ? area * height : length * width * height;
  const si = units === 'SI';
  const Q = given === 'Q' ? value : si ? value / 3600 * volume * 1000 : value * volume / 60;
  const ACH = given === 'ACH' ? value : si ? 3600 * value / volume / 1000 : value / volume * 60;
  return { volume, Q, ACH };
}

// Why the inputs cannot be solved, or null. Every quantity here is a size or a
// rate, so each must be a positive number.
export function problem({ given, value, height, areaMode, area, length, width }) {
  const need = [
    [value, given === 'Q' ? 'the air flow rate' : 'the air changes per hour'],
    [height, 'the room height'],
    ...(areaMode === 'area' ? [[area, 'the floor area']] : [[length, 'the room length'], [width, 'the room width']]),
  ];
  for (const [v, what] of need) {
    if (v === null) return `Enter ${what}.`;
    if (Number.isNaN(v)) return `${cap(what)} is not a number.`;
    if (!(v > 0)) return `${cap(what)} must be greater than zero.`;
  }
  return null;
}

const cap = s => s.replace(/^the /, '').replace(/^./, c => c.toUpperCase());
