// Answer key for the break-even calculator: profitable, loss-making and
// price-below-cost cases, with the volume table's two ends and middle.
import { analyse, problem } from '../src/assets/js/breakeven.js';

const cases = [
  { price: 25, volume: 2000, c1: 1.5, c2: 6, c3: 1.25, c4: 0.5, c5: 0.75, f1: 4000, f2: 900, f3: 450, f4: 6000, f5: 1200 },
  { price: 120, volume: 150, c1: 10, c2: 45, c3: 5, c4: 2, c5: 0, f1: 3000, f2: 500, f3: 0, f4: 2500, f5: 0 },
  { price: 9.99, volume: 10000, c1: 0, c2: 4.2, c3: 0.8, c4: 0.35, c5: 0.1, f1: 12000, f2: 1500, f3: 800, f4: 9000, f5: 3000 },
  { price: 5, volume: 800, c1: 1, c2: 4, c3: 0.5, c4: 0, c5: 0, f1: 1000, f2: 0, f3: 0, f4: 0, f5: 0 },
  { price: 40, volume: 90, c1: 2, c2: 11, c3: 3, c4: 0, c5: 1, f1: 2500, f2: 300, f3: 200, f4: 1800, f5: 400 },
];
const args = r => ({ price: Number(r.price), volume: Number(r.volume),
  variable: [r.c1, r.c2, r.c3, r.c4, r.c5].map(Number), fixed: [r.f1, r.f2, r.f3, r.f4, r.f5].map(Number) });

export default {
  workbook: 'G:\\My Drive\\5-Calculators\\Break Even Calculator V1.0.xlsx',
  sheet: 'Sheet1',
  inputs: { price: 'D6', volume: 'D7', c1: 'D11', c2: 'D12', c3: 'D13', c4: 'D14', c5: 'D15', f1: 'D23', f2: 'D24', f3: 'D25', f4: 'D26', f5: 'D27' },
  outputs: { totalSales: 'D8', varPerUnit: 'D16', totalVariable: 'D17', margin: 'D19', gross: 'D20', totalFixed: 'D28',
    net: 'D30', breakEven: 'D34', beyondProfit: 'D45', t0units: 'D36', t0profit: 'D42', t5profit: 'I42', t10profit: 'N42' },
  cases,
  run: row => {
    const r = analyse(args(row));
    return { ...r, breakEven: r.breakEven ?? '', beyondProfit: r.beyond?.profit ?? '#ERROR',
      t0units: r.table[0].units, t0profit: r.table[0].profit, t5profit: r.table[5].profit, t10profit: r.table[10].profit };
  },
  refuse: [
    { args: { price: null, volume: 10, variable: [], fixed: [] }, says: 'Enter the sales price per unit' },
    { args: { price: 10, volume: 10, variable: [-1], fixed: [] }, says: 'Values cannot be negative' },
  ],
  check: ({ args, says }) => (problem(args) ?? '').startsWith(says),
};
