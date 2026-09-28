// Break-even analysis: unit contribution margin, profit, break-even volume, and a
// table of cost and profit from 0 to 100 % of the sales volume.
//
// A port of Break Even Calculator V1.0.xlsx, formula for formula; check-calculators.mjs
// holds this file to the workbook's own answers. Blank amounts are 0.

export function analyse({ price, volume, variable, fixed }) {
  const totalSales = price !== 0 || volume !== 0 ? price * volume : 0;
  const varPerUnit = variable.reduce((a, b) => a + b, 0);
  const totalVariable = varPerUnit * volume;
  const margin = price > 0 ? Math.max(0, price - varPerUnit) : 0;
  const gross = totalSales !== 0 || totalVariable !== 0 ? totalSales - totalVariable : 0;
  const fixedSum = fixed.reduce((a, b) => a + b, 0);
  const totalFixed = fixedSum !== 0 ? fixedSum : 0;
  const net = gross !== 0 || totalFixed !== 0 ? gross - totalFixed : 0;
  const breakEven = margin > 0 && totalFixed > 0 ? totalFixed / margin : null;
  const table = [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1].map(f => {
    const units = f === 1 ? volume : volume ? volume * f : 0;
    const variableCost = varPerUnit * units, totalCost = totalFixed + variableCost, sales = price * units;
    return { units, variableCost, totalCost, sales, profit: sales - totalCost };
  });
  return {
    totalSales, varPerUnit, totalVariable, margin, gross, totalFixed, net, breakEven,
    // Profit on the units sold beyond break-even, as the workbook reports it.
    beyond: breakEven === null ? null : { units: Math.trunc(volume - breakEven), profit: (volume - breakEven) * margin },
    table,
  };
}

export function problem({ price, volume, variable, fixed }) {
  for (const [v, what] of [[price, 'sales price per unit'], [volume, 'sales volume']]) {
    if (v === null) return `Enter the ${what}.`;
  }
  for (const v of [price, volume, ...variable, ...fixed]) {
    if (Number.isNaN(v)) return 'A value is not a number.';
    if (v < 0) return 'Values cannot be negative.';
  }
  return null;
}
