// Heating and cooling efficiency conversion: COP, EER, SEER, SEER2, HSPF, HSPF2
// and kW/ton.
//
// A port of EER SEER COP Converter V1.5.xlsx; check-calculators.mjs holds this
// file to the workbook's own answers. Each given rating has its own row of
// formulas in the workbook, written here in the same order. V1.5 uses one set of
// constants throughout: 3.413 Btu/Wh per W/W, and 0.293.
// SEER2 and HSPF2 use RESNET's factors, which depend on the equipment type.

export const RATINGS = ['COP', 'EER', 'SEER', 'SEER2', 'HSPF', 'HSPF2', 'kW/Ton'];
export const EQUIPMENT = ['Single Package', 'Single Split', 'Small Duct High Velocity', 'Space Constrained'];
const SEER2 = { 'Single Package': 0.96, 'Single Split': 0.95, 'Small Duct High Velocity': 1, 'Space Constrained': 0.99 };
const HSPF2 = { 'Single Package': 0.84, 'Single Split': 0.85, 'Small Duct High Velocity': 0.85, 'Space Constrained': 0.85 };

export function convert(v, given, equip) {
  const s2 = SEER2[equip], h2 = HSPF2[equip];
  switch (given) {
    case 'COP': return row(v, v * 3.413, v * 3.413 / 0.875, v / 0.293, v / 0.293 * h2, v * 3.413 / 0.875 * s2, 3.516 / v);
    case 'EER': return row(v / 3.413, v, v / 0.875, v / 3.413 / 0.293, v / 3.413 / 0.293 * h2, v / 0.875 * s2, 12 / v);
    case 'SEER': return row(v * 0.875 / 3.413, v * 0.875, v, v * 0.875 / 3.413 / 0.293, v * 0.875 / 3.413 / 0.293 * h2, v * s2,
      3.516 / (v * 0.875 / 3.413));
    case 'HSPF': return row(v * 0.293, 0.293 * v * 3.413, 0.293 * v * 3.413 / 0.875, v, v * h2, 0.293 * v * 3.413 / 0.875 * s2,
      12 / (0.293 * v * 3.413));
    case 'HSPF2': return row(v / h2 * 0.293, 0.293 * v / h2 * 3.413, 0.293 * v / h2 * 3.413 / 0.875, v / h2, v / h2 * h2,
      0.293 * v / h2 * 3.413 / 0.875 * s2, 12 / (0.293 * v / h2 * 3.413));
    case 'SEER2': return row(v / s2 * 0.875 / 3.413, v / s2 * 0.875, v / s2, v / s2 * 0.875 / 3.413 / 0.293,
      v / s2 * 0.875 / 3.413 / 0.293 * h2, v, 3.516 / (v / s2 * 0.875 / 3.413));
    case 'kW/Ton': return row(3.516 / v, 12 / v, 12 / 0.875 / v, 3.516 / 0.293 / v, 3.516 / 0.293 / v * h2, 12 / 0.875 / v * s2, v);
    default: throw new Error(`Unknown rating: ${given}`);
  }
}

function row(COP, EER, SEER, HSPF, HSPF2v, SEER2v, kWTon) {
  return { COP, EER, SEER, SEER2: SEER2v, HSPF, HSPF2: HSPF2v, 'kW/Ton': kWTon };
}

export function problem(v) {
  if (v === null) return 'Enter the efficiency value.';
  if (Number.isNaN(v)) return 'The efficiency value is not a number.';
  if (!(v > 0)) return 'The efficiency value must be greater than zero.';
  return null;
}
