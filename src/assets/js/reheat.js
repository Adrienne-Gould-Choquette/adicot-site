// Reheat (heating) coil capacity from airflow and the entering and leaving air
// temperatures.
//
// A port of Reheat Coil Sizing Calculator V1.4.xlsx, formula for formula and in
// the workbook's order; check-calculators.mjs holds this file to the workbook's
// own answers. SI inputs are converted to cfm and °F first, as the workbook does,
// and the result is always in Btu/h, kW and W:
//
//   Btu/h = 1.0882 x cfm x (T_entering - T_leaving)     kW = Btu/h / 3412
//
// A negative capacity is heating, which is what a reheat coil does.

// units: 'US' | 'Metric'. airflow in cfm or l/s, temperatures in °F or °C.
export function capacity({ units, airflow, leaving, entering }) {
  const us = units === 'US';
  const cfm = us ? airflow : airflow * 2.1188799727597;
  const tl = us ? leaving : (leaving * 9 / 5 + 32);
  const te = us ? entering : (entering * 9 / 5 + 32);
  const btuh = 1.0882 * cfm * (-tl + te);
  const kW = btuh / 3412;
  return { btuh, kW, W: kW * 1000 };
}

export function problem({ airflow, leaving, entering }) {
  for (const [v, what] of [[airflow, 'reheat coil airflow'], [leaving, 'leaving coil temperature'],
    [entering, 'entering coil temperature']]) {
    if (v === null) return `Enter the ${what}.`;
    if (Number.isNaN(v)) return `The ${what} is not a number.`;
  }
  if (!(airflow > 0)) return 'The reheat coil airflow must be greater than zero.';
  return null;
}
