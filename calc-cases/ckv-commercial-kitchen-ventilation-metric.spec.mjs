// Answer key for Commercial Kitchen Exhaust Calculation V1.9, metric units: the
// same cases as the US key with lengths in metres.
import us, { buildCases, asWorkbook } from './ckv-commercial-kitchen-ventilation.spec.mjs';

export default {
  ...us,
  cases: buildCases('Metric'),
  run: asWorkbook,
};
