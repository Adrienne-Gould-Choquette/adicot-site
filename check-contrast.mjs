// WCAG contrast check for the palette. AA needs 4.5:1 for body text,
// 3:1 for large text and for UI component boundaries.
const hex = h => h.replace('#', '').match(/../g).map(x => parseInt(x, 16));
const lin = c => { c /= 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
const lum = h => { const [r, g, b] = hex(h); return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b); };
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05); };
const fmt = (n, need) => n.toFixed(2).padStart(5) + ':1  ' + (n >= need ? 'PASS' : 'FAIL') + ' (need ' + need + ')';

const WHITE = '#ffffff', SURFACE = '#f7f5f2', FG = '#1d1b19';

console.log('--- candidate accents: link text on white (need 4.5) ---');
for (const c of ['#ef7c00', '#d96b00', '#c44800', '#bf4d00', '#ba5100', '#b05800', '#a8500a']) {
  console.log('  ' + c + '  ' + fmt(ratio(c, WHITE), 4.5) + '   on surface: ' + ratio(c, SURFACE).toFixed(2));
}

const ACCENT = process.argv[2] || '#bf4d00';
const SOFT = process.argv[3] || '#fef4ea';
console.log('\n--- chosen: accent ' + ACCENT + ', soft ' + SOFT + ' ---');
console.log('  accent on white        ' + fmt(ratio(ACCENT, WHITE), 4.5));
console.log('  accent on surface      ' + fmt(ratio(ACCENT, SURFACE), 4.5));
console.log('  accent on accent-soft  ' + fmt(ratio(ACCENT, SOFT), 4.5));
console.log('  white on accent        ' + fmt(ratio(WHITE, ACCENT), 4.5));
console.log('  body fg on accent-soft ' + fmt(ratio(FG, SOFT), 4.5));
console.log('  accent vs white (UI)   ' + fmt(ratio(ACCENT, WHITE), 3));

console.log('\n--- brand orange, decorative only ---');
console.log('  #ef7c00 on white       ' + fmt(ratio('#ef7c00', WHITE), 3) + '  <- fine for a logo/badge, not for text');
