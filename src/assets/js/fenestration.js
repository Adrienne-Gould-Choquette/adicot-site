// Default U-factors, SHGC and VT for glazed fenestration, and default door
// U-factors, when no NFRC-rated values are available.
//
// From the 2024 IECC and the 2023 Florida Building Code, Energy Conservation,
// Table C303.1.3 (1), (2) and (3), as tabulated in Window Default Fenestration
// U_SHGC - 2023 FBC V1.2.xlsx. The tables are unchanged from the 2021 IECC and
// 2020 FBC the workbook was first built from (checked on codes.iccsafe.org,
// Sept 2026). check-calculators.mjs holds these tables to the workbook's own
// answers for every combination.

export const FRAMES = ['Metal', 'Metal w Thermal Break', 'Nonmetal or Metal Clad', 'Glazed Block',
  'Skylight - Metal', 'Skylight - Metal w Thermal Break', 'Skylight - Nonmetal or Metal Clad'];
export const PANES = ['Double Pane', 'Single Pane'];
export const GLAZING = ['Clear', 'Tinted'];

// [frame, panes, glazing, U, SHGC, VT]
export const FENESTRATION = [
  ['Glazed Block', 'Double Pane', 'Clear', 0.6, 0.6, 0.6],
  ['Glazed Block', 'Double Pane', 'Tinted', 0.6, 0.6, 0.6],
  ['Glazed Block', 'Single Pane', 'Clear', 0.6, 0.6, 0.6],
  ['Glazed Block', 'Single Pane', 'Tinted', 0.6, 0.6, 0.6],
  ['Metal', 'Double Pane', 'Clear', 0.8, 0.7, 0.6],
  ['Metal', 'Double Pane', 'Tinted', 0.8, 0.6, 0.3],
  ['Metal', 'Single Pane', 'Clear', 1.2, 0.8, 0.6],
  ['Metal', 'Single Pane', 'Tinted', 1.2, 0.7, 0.3],
  ['Metal w Thermal Break', 'Double Pane', 'Clear', 0.65, 0.7, 0.6],
  ['Metal w Thermal Break', 'Double Pane', 'Tinted', 0.65, 0.6, 0.3],
  ['Metal w Thermal Break', 'Single Pane', 'Clear', 1.1, 0.8, 0.6],
  ['Metal w Thermal Break', 'Single Pane', 'Tinted', 1.1, 0.7, 0.3],
  ['Nonmetal or Metal Clad', 'Double Pane', 'Clear', 0.55, 0.7, 0.6],
  ['Nonmetal or Metal Clad', 'Double Pane', 'Tinted', 0.55, 0.6, 0.3],
  ['Nonmetal or Metal Clad', 'Single Pane', 'Clear', 0.95, 0.8, 0.6],
  ['Nonmetal or Metal Clad', 'Single Pane', 'Tinted', 0.95, 0.7, 0.3],
  ['Skylight - Metal', 'Double Pane', 'Clear', 1.3, 0.7, 0.6],
  ['Skylight - Metal', 'Double Pane', 'Tinted', 1.3, 0.6, 0.3],
  ['Skylight - Metal', 'Single Pane', 'Clear', 2, 0.8, 0.6],
  ['Skylight - Metal', 'Single Pane', 'Tinted', 2, 0.7, 0.3],
  ['Skylight - Metal w Thermal Break', 'Double Pane', 'Clear', 1.1, 0.7, 0.6],
  ['Skylight - Metal w Thermal Break', 'Double Pane', 'Tinted', 1.1, 0.6, 0.3],
  ['Skylight - Metal w Thermal Break', 'Single Pane', 'Clear', 1.9, 0.8, 0.6],
  ['Skylight - Metal w Thermal Break', 'Single Pane', 'Tinted', 1.9, 0.7, 0.3],
  ['Skylight - Nonmetal or Metal Clad', 'Double Pane', 'Clear', 1.05, 0.7, 0.6],
  ['Skylight - Nonmetal or Metal Clad', 'Double Pane', 'Tinted', 1.05, 0.6, 0.3],
  ['Skylight - Nonmetal or Metal Clad', 'Single Pane', 'Clear', 1.75, 0.8, 0.6],
  ['Skylight - Nonmetal or Metal Clad', 'Single Pane', 'Tinted', 1.75, 0.7, 0.3],
];

// [door type, U]
export const DOORS = [
  ['Insulated Metal (Other)', 0.6],
  ['Insulated Metal (Rolling)', 0.9],
  ['Insulated, nonmetal edge, max 45% glazing, any glazing double pane', 0.35],
  ['Uninsulated Metal', 1.2],
  ['Wood', 0.5],
];

export function window(frame, panes, glazing) {
  const row = FENESTRATION.find(r => r[0] === frame && r[1] === panes && r[2] === glazing);
  return row ? { U: row[3], SHGC: row[4], VT: row[5] } : null;
}

export const door = type => DOORS.find(d => d[0] === type)?.[1] ?? null;
