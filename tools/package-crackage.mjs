// Package the crack-method calculator as one self-contained HTML file, to send
// for review: the form, its method write-up, the site's stylesheet and the three
// scripts it runs (calc-kit.js, crackage.js, calc-crackage.js) merged into one
// inline script, since a page opened from disk cannot load modules. Works
// offline; nothing is fetched. Build the site first.
//
//   npm run build && node tools/package-crackage.mjs [out.html]
import fs from 'node:fs';

const out = process.argv[2] ?? 'Infiltration-and-Building-Pressurization-Calculator.html';
const page = fs.readFileSync('_site/infiltration-pressurization-calculator.html', 'utf8');
const css = fs.readFileSync('src/assets/css/site.css', 'utf8');
const js = f => fs.readFileSync(`src/assets/js/${f}`, 'utf8');

// The form (without the share button, whose link would point at the file) and
// the prose sections under it.
const form = page.slice(page.indexOf('<form class="calcform" id="cmcalc"'), page.indexOf('</form>', page.indexOf('id="cmcalc"')) + 7)
  .replace(/<button type="button" class="btn btn-quiet" id="cm-share" hidden>[^<]*<\/button>/, '')
  .replace(/<span class="cf-copied" id="cm-copied" role="status"><\/span>/, '');
const p0 = page.indexOf('<div class="prose">');
const prose = page.slice(p0, page.indexOf('</article>', p0)).replace(/href="\//g, 'href="https://www.adicot.com/');
if (!form.includes('cmcalc') || !prose.includes('Building pressurization')) throw new Error('page layout changed');

// One script: the modules in dependency order, imports dropped, exports made
// plain declarations. shareable() is given a null button, so no share link.
const strip = s => s.replace(/^import .*$/gm, '').replace(/^export (?=(const|function|let) )/gm, '');
const script = [strip(js('calc-kit.js')), strip(js('crackage.js')), strip(js('calc-crackage.js'))].join('\n')
  .replace("shareable(form, names, el('cm-share'), el('cm-copied'));", 'shareable(form, names, null, null);');
if (/^\s*(import|export) /m.test(script)) throw new Error('an import or export survived');

const date = new Date().toISOString().slice(0, 10);
const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Infiltration and Building Pressurization Calculator (Crack Method), review copy</title>
<style>
${css}
.review-note { max-width: 1100px; margin: 0 auto; padding: 12px 20px; font-size: 14px; color: var(--muted); }
</style>
</head>
<body>
<main id="main">
<p class="review-note">Review copy from Adicot, Inc., ${date}. This file runs entirely on your computer; nothing is sent anywhere.
The published version is at <a href="https://www.adicot.com/infiltration-pressurization-calculator">adicot.com/infiltration-pressurization-calculator</a>.</p>
<article class="page">
  <header class="page-head"><h1>Infiltration and Building Pressurization Calculator (Crack Method)</h1></header>
  <div class="calc-layout"><section class="calc-inline" aria-label="Crack method calculator">
${form}
  </section></div>
${prose}
</article>
</main>
<script type="module">
${script}
</script>
</body>
</html>
`;
fs.writeFileSync(out, html);
console.log(`${out}: ${(html.length / 1024).toFixed(0)} KB`);
