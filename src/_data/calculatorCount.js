// Distinct calculator pages listed in taxonomy.json. Derived, so it can never
// drift from the curated taxonomy the way a hard-coded number would.
import { readFileSync } from 'node:fs';

export default function () {
  const taxonomy = JSON.parse(readFileSync('src/_data/taxonomy.json', 'utf8'));
  return new Set(taxonomy.flatMap(g => g.items.map(i => i.path))).size;
}
