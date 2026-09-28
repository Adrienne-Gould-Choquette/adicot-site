# adicot.com

Static site for adicot.com — engineering calculators, blog and company pages.
Built with [Eleventy](https://www.11ty.dev/). No client-side framework, no Wix.
The only JavaScript is two small progressive-enhancement files: site search and
favorites on `/calculators`.

```bash
npm install
npm run serve     # http://localhost:8080, live reload
npm run build     # -> _site/
```

## Picking this up

Start here, then read **Before launch** for what is outstanding.

```bash
npm ci       # package-lock is committed; this matches the original install exactly
npm run serve
```

Three things that are easy to get wrong:

1. **URLs are load-bearing.** 71 legacy Wix URLs have to keep resolving, and
   `verify-urls.mjs` is the gate. Run it after any change that moves a page.
   Retire a page by redirecting it, never by deleting it — see `/junk`.
2. **The site is static, with no backend.** The contact form and the Calculator
   Updates signup both post to third-party endpoints configured in
   `src/_data/site.json`. Both are written so that an unconfigured endpoint
   degrades to a visible mailto rather than a control that silently fails.
3. **Every calculator is held to an answer key.** `npm test` checks each one
   against its Excel workbook (or, for the few with none, against worked
   examples). Run it after any change to a calculator's maths.

`build-logo.mjs` will not run outside Adrienne's machine; it reads the master
artwork from her Google Drive and exits with a message if it is missing. The
generated logo assets are committed, so this only matters if the logo changes.

## What's here

| Path | Purpose |
|---|---|
| `src/pages/*.md` | 47 content pages. Front matter carries the title, meta description, permalink and which calculator to embed. |
| `src/posts/*.md` | 12 blog posts, with real publish dates and categories. |
| `src/_data/taxonomy.json` | Calculator categories that drive the nav, `/calculators`, and the "Related calculators" block. **Edit this to re-group calculators.** |
| `src/_data/blogCategories.json` | Blog category slugs and display names. |
| `src/_data/site.json` | Site name, company, canonical URL, author, quote URL, and the two straplines. |
| `src/_includes/` | Layouts and partials. |
| `src/_data/searchIndex.js` | Builds the client-side search index at build time. |
| `src/assets/js/search.js` | Site search combobox (progressive enhancement). |
| `src/assets/js/favorites.js` | Visitor-set favorites on `/calculators` (progressive enhancement). |
| `src/assets/css/site.css` | The entire stylesheet. Tokens at the top, with light and dark themes. |
| `public/images/` | 263 images. |
| `deploy/` | Host configs — pick one, copy to the repo root. |
| `verify-urls.mjs` | Checks every legacy URL still resolves and no internal link is broken. |
| `check-contrast.mjs` | WCAG contrast check for the palette. |
| `build-logo.mjs` | Regenerates the logo assets from the master TIF on Google Drive. |
| `build-icon-review.mjs` | Writes a local `icon-review.html` for checking calculator icons. |

## URLs are load-bearing

Every page is emitted as a flat file (`_site/duct-size-calculator.html`) so that
`https://www.adicot.com/duct-size-calculator` — the exact URL Google already has
indexed — is served **200 with no redirect hop**. Canonical tags and every
internal link use the same extensionless form.

Run this after any change that touches permalinks:

```bash
node verify-urls.mjs
```

Run it as a separate step, not chained onto the build — Eleventy's passthrough
copy finishes asynchronously after the CLI returns, so an immediately-chained run
can report assets missing that are in fact there.

It checks all 71 live URLs against `deploy/wix-url-inventory.csv`, plus
internal links and any stray third-party references. It exits non-zero on a
missing URL, so it works as a CI gate.

Note for deployment: hosts differ on trailing slashes. With flat files,
Cloudflare Pages, Netlify and Render all serve `/foo` from `foo.html` directly.
Confirm on the real host after the first deploy that `/duct-size-calculator`
returns 200 and not a 301.

## Calculators

All 39 calculators are written into their pages by hand: no iframes, and nothing
fetched from Wix or spreadsheethosting.com at runtime. The SpreadsheetConverter
exports that the Wix site framed are gone, and so is `public/calculators/`. Each
calculator is a port of its Excel workbook in `G:\My Drive\5-Calculators` (named in
the page's `calcSource`), held to it by an answer key, except the few with no
workbook, which `check-handworked.mjs` holds to worked examples instead.

A page's front matter wires its calculator in:

```yaml
calcInclude: "partials/calc-duct-size.njk"
calculatorName: "Duct Size Calculator V1.26"
pageModule: calc-duct-size.js
```

`calcInclude` names the form partial that `layouts/page.njk` includes. `pageModule`
loads the page script as an ES module, which imports the shared maths from
`/assets/js/`; `pageScript` still exists for ordinary scripts that import nothing.

Why not the old iframes: the embed for one calculator was 597 KB (233 KB of
JavaScript, 137 KB of theme CSS, 177 KB of Glyphicons, and an `offline.appcache`
for a browser feature that no longer exists) inside a fixed 533x638 frame that
could not resize, could not follow the light/dark toggle, and could not be read
by a search engine. Inline it is a few KB and does all three. The diagrams the
workbooks used to load from Wix's CDN are local images now, so republishing a
workbook from SpreadsheetConverter has no bearing on the site.

The `/calculators/<slug>/` bundle paths only ever existed on this unlaunched
site, so nothing outside links to them and there is nothing to redirect. After
launch, the usual retire-by-redirect rule applies to anything a visitor may have
bookmarked.

#### Converting a calculator: the pieces

The temperature converter shows every piece:

| piece | file |
|---|---|
| the maths, a port of the workbook | `src/assets/js/tempconv.js` |
| the form | `src/_includes/partials/calc-temperature.njk` |
| the form behaviour | `src/assets/js/calc-temperature.js` |
| the answer key: cases, cells, and how to ask the port | `calc-cases/temperature-converter.spec.mjs` |
| the workbook's own answers | `calc-cases/temperature-converter.csv` |
| a reference table built from the same module | `src/_data/temperatureTable.js` |

Shared by every calculator:

- **`src/assets/js/calc-kit.js`**: live recalculation (no Calculate button),
  number parsing, `fmt()` (fixed decimals, never `-0.00`), the results table,
  and `shareable()`, a "Copy link to this result" button that puts the inputs in
  the query string and reads them back on load.
- **The `.calcform` / `cf-` styles** in `site.css`: the two-column form and
  results panel, empty required fields shaded, 44px targets on touch, and
  print styles that print the calculator and its method without the site
  around them.
- **Structured data**: `layouts/base.njk` gives every calculator page, framed or
  not, a `WebApplication` and a `BreadcrumbList` in JSON-LD.

**The answer key.** The workbook stays the reference. `calc-cases/<slug>.spec.mjs`
names the workbook, its input and output cells, and the cases to run; this runs
them through Excel (Windows, via COM) and writes the CSV:

```bash
node tools/gen-cases.mjs temperature-converter
```

`check-calculators.mjs` runs the same cases through the page's module and fails
the build (it is part of `npm run verify` and `npm test`) if any output differs
from the workbook by more than 1e-12 relative. It also checks that the page
refuses the inputs the spec lists, such as a temperature below absolute zero.
Commit the CSV; never edit it by hand. Change a calculator in its workbook first,
regenerate the key, then port the change.

The form is progressively enhanced only as far as it can be — arithmetic needs
JavaScript. Without it the `<noscript>` note points at the methodology below the
calculator, which is written out fully enough to size a duct by hand.

### The duct sizing model

`src/assets/js/ductulator.js` is the first calculator written by hand rather
than published from SpreadsheetConverter. It is a port of `ductulator.py`, which
lives beside the workbook in `G:\My Drive\5-Calculators\Duct Size Calculator
(Python)` and was validated against workbook V1.26 over a 576-case grid.

**The Python is the reference implementation.** The JavaScript is a copy of it,
and `check-ductulator.mjs` proves that on every build — 4,672 comparisons across
576 cases, plus the structural checks ported from `test_ductulator.py`. Both
languages compute in IEEE-754 doubles, so they agree to within one unit in the
last place; anything above 1e-12 relative fails the build.

Change the model in the Python first, re-run its own `validate.ps1` against the
workbook, then port the change here and regenerate the grid:

```powershell
python3 gen_cases.py
Copy-Item cases.csv <repo>\ductulator-cases.csv
```

```bash
node check-ductulator.mjs
```

Both sides write a metric friction rate to one decimal and a US one to three.
Three decimals of in. wg per 100 ft is about a quarter of a Pa per 30 m, so
`20.000 Pa/30 m` claimed a resolution nothing in the calculation has. That lives
in `formatDrop` here and in `format_result` there; change one and change the
other, or the CLI and the page will describe the same duct differently.

Do not edit `ductulator-cases.csv` by hand. It is the Python's own output, and
its only value is that it was not written by the thing it checks.

**The published numbers change when this ships.** The site currently embeds
V1.23. V1.26 put duct sizing and friction loss on one model (Swamee-Jain in both
directions, so sizing on a rate and entering the resulting diameter returns that
rate), and fixed a metric friction-loss input that was scaled by about 1/3.33 and
oversized every metric duct. Flex sizing moves about -3.4%, fabric about -7.8%,
metal and duct board well under 1%. The rectangular duct also changes from
equal-area to the Manual D equal-friction equivalent — 530 cfm of flex at 0.1
goes from 10.71 in. square to 10.98.

The methodology prose on `/duct-size-calculator` still describes the old model —
it cites Colebrook-White and a simplified sizing form that is not what runs, and
its worked example gives an equal-area rectangle. Rewrite it from the docstrings
in `ductulator.js` when the new calculator goes live.


## Branding

**One theme, site-wide, chosen by the visitor.** A toggle in the header switches
between light and dark; the choice is stored in `localStorage` under
`adicot:theme` and applies to every page. Default is light. A tiny inline script
in `<head>` sets `data-theme` before first paint, so a visitor who chose dark
gets no white flash on navigation, and `theme.js` only draws the control and
handles the click. The button ships `hidden` and is revealed by that script,
because without JavaScript it could do nothing. The dark block in `site.css` is a
token swap only, so no component carries a second set of rules.

**`practice` is a separate, path-based idea** and no longer touches color. It is
true for anything under `/services` and for pages carrying `side: practice`
(`/about`, `/contact`), and it selects the strapline, where the logo links, and
and where the logo links. Both logos ship on every page and
CSS shows the right one, because the theme is now a runtime choice rather than
something known at build time.

The dark theme is a warm near-black, `#262624` — matched to Claude's, at
Adrienne's request, rather than the blue-tinted `#12161b` it started as. The
greys carry a little red and drop a little blue so they sit with the brand
orange instead of fighting it. On that ground the real brand orange `#EF7C00`
clears AA (5.45:1), so the
dark theme uses it directly rather than the darkened `--accent` the light theme
needs. The light logo art carries a baked white plate; the dark artwork is
remapped (white letterforms, orange wordmark, transparent ground), not an
inversion, so on dark the plate is dropped. Calculator and related-list icons are
black line art, so dark inverts them. The calculators are the site's own markup,
so they follow the theme like everything else.

Both themes were swept for WCAG contrast across every page type and neither has a
text element below its threshold.

Logo assets are generated from the master on Google Drive:

```bash
node build-logo.mjs
```

Master: `G:\My Drive\4-Logo\_Current\Adicot-Logo-2017.tif` (5115 × 3663, 300 dpi,
white background — **not** the `.psd` or `.jpg` beside it, which are the dark-gray
version with a tagline). The script trims the wide white margin, then writes
`src/assets/logo.png`, `logo.webp` (225 × 124, served at 52px tall),
`logo-dark.png`/`.webp` and `og-default.png` for social cards.

**The dark logo is a remap, not an inversion.** Inverting would turn the orange
wordmark blue. The script walks the pixels: achromatic ones (the black A/I and the
white ground) become white art with alpha taken from the original darkness, so the
anti-aliased edges stay smooth; saturated ones (the orange wordmark) are left
exactly as they are. The result is transparent-backed and sits on any dark value.

The same script builds the favicons from the initials mark,
`Adicot-Logo-Initials.gif` (the .psd beside it is not readable by libvips; the
gif is the same artwork at 511 × 366, ample for a 180px icon). They are a solid
brand-orange tile with the initials knocked out in white — a shrunken black
logo turns to gray mush at 16px, and a transparent one vanishes against a dark
tab strip. Outputs: `favicon-32.png`, `favicon-48.png` (rounded), and
`apple-touch-icon.png` (full-bleed; Apple applies its own mask). Outputs are committed, so the build does not
need Drive to be online; the script exits with an error rather than clobbering
them if the master is unreachable.

The palette is orange, derived from the logo. Two tokens, deliberately different:

| Token | Value | Use |
|---|---|---|
| `--brand` | `#EF7C00` | The logo orange, straight off the master. **Decorative only** — 2.78:1 on white, so it must never carry text or be the only signal of state. |
| `--accent` | `#A8500A` | Everything interactive: links, hover borders, current-page, focus rings. Same family, darkened until it clears WCAG AA. |

`--accent` passes 5.50:1 on white, 5.17:1 on `--surface` and 5.07:1 on
`--accent-soft` (`#FEF4EA`), and white-on-accent is 5.50:1 for the skip link.

If you change any of these, check the result first:

```bash
node check-contrast.mjs "#a8500a" "#fef4ea"
```

## Search

There is no server, so search is entirely client-side. `src/_data/searchIndex.js`
reads the Markdown sources at build time and emits `/search-index.json` (59
entries, ~75 KB). `src/assets/js/search.js` fetches it **once, on first focus** —
it is not part of the initial page weight.

Body text is indexed as a **deduplicated term list**, not a prose excerpt. A
prefix would miss anything past the first screen, and the terms engineers
actually search for sit deep in the methodology sections — searching
`huebscher` or `colebrook` finds the Ductulator only because of this.

Ranking is weighted so a name match always beats a body mention:

| Match | Score |
|---|---|
| Exact title or calculator label | 120 |
| Title/label starts with the term | 80 |
| Title contains / label contains | 60 / 50 |
| Meta description | 25 |
| Category | 15 |
| Body term | 8 |

Every term must match somewhere (AND, not OR). Ties break toward the shorter
title, so "Psychrometric Chart" outranks "Psych Chart – 2 Cond." Pages holding an
actual calculator get a small nudge over blog posts about them.

The control is an ARIA combobox: arrow keys move, Enter opens, Escape closes, and
`/` focuses it from anywhere. The markup ships `hidden` and the script reveals
it, so visitors without JavaScript never see a search box that cannot work.

`/junk` and `/images` are excluded from the index (see `HIDDEN` in
`searchIndex.js`) — they stay live so no URL 404s, but they are scratch pages and
should not surface in results.

## Engineering services

`adicotengineeringinc.com` is folded in here. Its copy was extracted to
`../adicot-export/services-export/` (raw HTML plus Markdown for all four of its
pages) and rebuilt under `/services`.

The site is positioned as **HVAC load calculations and energy code compliance for
industrial, commercial and multi-family** work. Those two services have their own
pages; Mechanical Design, Forensics + Design Review and Specialty Utility appear
as summary cards on the overview only.

| Path | Source |
|---|---|
| `/services` | `src/services/index.njk` + `src/_data/services.json` |
| `/services/cooling-load-calculations` | Markdown, `layouts/service.njk` |
| `/services/energy-code-compliance` | Markdown, `layouts/service.njk` |

### Gated services

Mechanical Design, Forensics + Design Review and Specialty Utility are not sold
self-serve. Clicking one opens a native `<dialog>` saying it is available to
existing clients, with a link to `/contact` — see `src/assets/js/services.js`.

The links themselves point at `/contact`, so without JavaScript a click just goes
there, which is where the message would have sent them anyway. Modified clicks
(ctrl, middle) are left alone so the link still opens in a new tab. Each card also
carries a quiet "Existing clients" badge, so the gate is not a surprise.

A service is gated purely by `page: false` in `services.json`. Give it a page and
it stops being gated.

Stats, project examples, the service list and the state license list all live in
`services.json` — edit there, not in the template. To promote one of the three
card-only services to its own page, set `page: true`, add a `slug`, and drop a
Markdown file in `src/services/`.

**The quote page is `src/pages/quote.njk`.** Every "Get a Quote" button reads
`site.quoteUrl` (`/quote`); if the page moves, set that one value and all the
references follow. Its options come from `src/_data/quote.json`, regenerated
from the Flask repo with `scripts/export_quote_options.py`. The fee is priced
server-side: the page posts to `/api/quote/*` on this domain, and
`functions/api/quote/[[path]].js` forwards that to the Flask app.

**Copy note:** the old site said "nine states" in its prose but listed eleven and
claimed 11 active licenses. The rebuild uses **11** throughout, matching the
explicit list (AR FL IL LA MA NE OK PA TX WV WY). Worth confirming before launch.

### Header strapline

The line beside the logo changes with the section. Both are **arrays of lines** in
`site.json`, one array entry per rendered line, so the break is deliberate rather
than left to the browser:

```json
"strapline":         ["Engineering Calculators"],
"straplineServices": ["Professional Engineering", "HVAC Load and Energy"]
```

It is decorative and `aria-hidden`, so it is hidden below 1080px rather than
squeezing the search field — measured, the bar needs 1063px with it in. The nav
collapses to the menu button below 900px, where six items stop fitting.

## Home page

`/` is a split landing page: white for the calculator library, dark for the
engineering practice, matching the theme convention used everywhere else. It is
deliberately sparse — a heading and one sentence per side, and one link each.

The panes break out of the centred column with `margin-inline: calc(50% - 50vw)`
and run to the viewport edges, while their outer padding keeps the text aligned
with the nav above. `overflow-x: clip` on `html, body` lets that bleed happen
without a horizontal scrollbar; `clip` rather than `hidden` so nothing becomes a
scroll container.

The dark pane re-declares the theme tokens locally, so the button and text inside
it adapt with no second set of rules.

The logo in the header goes to `/calculators` or `/services` depending which side
you are on, not to `/`.

## Contact form

`/contact` posts to **Formspree**. The site is static, so mail delivery needs a
third-party endpoint; Formspree works on any host, which keeps the hosting choice
open.

**To switch it on** (about two minutes, and only you can do it — it needs an account):

1. Sign up at formspree.io and create a form that delivers to `admin@adicot.com`
2. Copy the 8-character form ID from its endpoint URL
3. Put it in `src/_data/site.json`:

   ```json
   "contact": { "email": "admin@adicot.com", "formspreeId": "xxxxxxxx" }
   ```

That is the only change. Until the ID is set the form still renders but carries
`data-unconfigured`, and the page shows a notice pointing at the mailto address
instead — so the page is never silently broken.

Details worth knowing:

- **Honeypot** is a field named `_gotcha`, positioned off-screen rather than
  `display:none` (some bots skip hidden fields). Formspree discards anything that
  arrives with it filled in.
- **`_next`** redirects to `/contact/thanks` on success — a real page, `noindex`.
- **Validation** uses `:user-invalid`, not `:invalid`. An untouched required field
  is invalid the moment it renders, so `:invalid` painted the form red before
  anyone typed a character.
- The form asks for **project location**, since licensure and energy code vary by
  state and that is the first thing a services inquiry needs.

Note that submissions pass through Formspree. For client inquiries that is worth
being aware of; their free tier is 50/month.

## Calculator Updates

The name-and-email signup that sat in the Wix header. It is an announcement
blast — new calculators, and corrections to published ones — not a newsletter,
and the copy says so.

It renders in a band above the footer on every page (the header here already
carries brand, search, theme toggle and six nav items, so it does not fit there),
and again at full width on `/calculator-updates`, which is the page to link when
something needs to explain what the list is.

| Path | Purpose |
|---|---|
| `src/_includes/partials/updates-signup.njk` | The form. Set `nlWide` before including for the wide variant. |
| `src/pages/calculator-updates.md` | What the list is, and the wide form. |
| `src/pages/calculator-updates-thanks.md` | Post-signup page, `noindex`. |

**The list host is not baked into the markup.** Every provider names its inputs
differently, so the action URL and the field names live in `site.updates` in
`src/_data/site.json`:

```json
"updates": {
  "listName": "Calculator Updates",
  "action": "https://buttondown.com/api/emails/embed-subscribe/YOUR-BUTTONDOWN-USERNAME",
  "emailField": "email",
  "nameField": "",         // see below - off until the real parameter is known
  "redirectField": "",     // hidden field for the post-signup URL, if supported
  "honeypotField": ""      // spam-trap field name, if supported
}
```

The provider is **Buttondown**, chosen for an announcement list sent a few times
a year. Read the field names off the account's own embed code rather than
trusting anything written here.

`nameField` is empty on purpose, so the rendered form is email-only. The Wix box
asked for a name and can again, but Buttondown carries extra fields as metadata
and the exact parameter has to be read off the embed code — a guessed name is
accepted by the POST and then silently dropped. Set it and the name input
appears; the template renders that field only when the config names it.

**An unfinished form is caught by the build.** `verify-urls.mjs` scans every
rendered `<form>` and reports any whose action is empty, still holds a
placeholder, or is missing a provider id — because the failure mode is invisible
otherwise: the visitor types an address, submits, and gets an error page. Two
actions are waiting on accounts only Adrienne can open, so they are listed in
`FORMS_PENDING` and reported rather than fatal; anything not on that list fails
the run. Delete an entry as soon as its provider is wired up, or the check stops
having teeth. See `HANDOFF.md`.

About **450 existing subscribers** must be exported from Wix before cancellation
and imported into Buttondown directly — they never live in this repo. `*.csv` is
gitignored so a stray export cannot be committed.

## Domains

`www.adicot.com` is canonical. `adicot.com` and `adicotengineering.com` 301 to
it, path preserved. On Cloudflare these domain-level redirects are set in the
dashboard (a Redirect Rule and a Bulk Redirects list), because Pages'
`_redirects` supports paths only: see `deploy/cloudflare/DOMAIN-REDIRECTS.md`.
The Netlify copy of `_redirects` carries them in the file.

`adicotengineeringinc.com` is still a **separate 4-page Wix site** (home, about,
contact, quote), linked from every page as "Engineering Services". When its
content is folded in:

1. Add its pages under `src/pages/services/`.
2. Change `servicesUrl` in `src/_data/site.json` to `/services` and set
   `servicesExternal` to `false` — the header and footer pick this up
   automatically.
3. Add its old URLs to the redirects file so the existing links keep working.

## The calculator index

`/calculators` is a template (`src/calculators.njk`) driven by two curated data
files. It does not replicate the old Wix layout — the grid is uniform, every
category is a labeled section with an anchor, and there is a jump nav.

- **`src/_data/taxonomy.json`** — the 8 calculator categories, transcribed from
  the real page. `fav: true` puts a star on a card; `isNew: true` adds the NEW
  badge. Edit this to re-group, rename or re-order anything.
- **`src/_data/links.json`** — the 41 Helpful Links (manufacturers, codes,
  product approvals), grouped and rendered at the bottom of the same page.

`taxonomy.extracted.json.txt` is the machine-extracted version, kept only for
reference. The generator **never overwrites `taxonomy.json`**.

### Favorites

Visitors star their own calculators. The set in `taxonomy.json` (`fav: true`) is
the **starting point** — a first-time visitor sees exactly the stars you curated,
and adjusts from there. Once they change anything, their list is stored and takes
over; "Reset to suggested" clears it and hands control back to `taxonomy.json`.

The list lives in `localStorage` under `adicot:favorites:v1`, so it is per
browser, per device. It never reaches the server — there isn't one — and it is
not shared between a visitor's phone and their laptop.

`src/assets/js/favorites.js` is progressive enhancement, loaded `defer` and only
on this page:

- **Without JavaScript**, the curated stars render as static gold markers and the
  "Show favorites only" filter still works. The filter is pure CSS — a checkbox
  plus `:has()` — and the script only toggles the `is-fav` class, so the two stay
  in step with no duplicated logic.
- **With JavaScript**, each star becomes a real `<button>` with `aria-pressed`,
  a 44px target on touch, and a visible focus ring.

A calculator listed in two categories (Dehumidifier Sizer, Vent-ASHRAE 62.1,
Condensate Converter, the power converter) is stored once by path and its cards
toggle together — the script indexes by `data-path` rather than by card.

Every storage read and write is wrapped in `try`/`catch`. In private mode or with
site data blocked, starring still works for the session; it just does not persist.

### How related calculators are chosen

Computed once at build time in `src/_data/relatedIndex.js`, layered so the
strongest signal always wins:

| Tier | Signal | Why |
|---|---|---|
| 1 | **Curated pairs** (`related.json`) | Recovered from the hand-picked strips on the old Wix site: 31 of 37 calculators had one. Engineering-workflow judgement no similarity measure reproduces. Kept in original order. |
| 2 | Shared categories, weighted **inversely by category size** | Sharing Electrical (2 members) is evidence; sharing Equipment (10) is weak. Without this the category signal is close to arbitrary. |
| 3 | Term overlap, **IDF weighted** | Catches what categories miss: duct sizing and temperature loss share friction, velocity, roughness. IDF is essential, or every pair ranks on calculator and ASHRAE. |
| 4 | Small favourites nudge | Breaks ties toward the tools you actually rate. |

Filled to six. **To override a page, edit `src/_data/related.json`** — anything
listed there is used first and in the order given, and the scorer only fills what
is left.

Recovering tier 1 was worth the effort: the old hrefs carried no signal at all
(every Wix page linked to all 40 calculators through the nav), but the strip text
survived in the export and matched back against the taxonomy. Re-run
`node ../adicot-export/recover-related.mjs` to rebuild it from the export.

Reciprocity is deliberately not enforced. Ductulator is a sensible follow-on from
ACH to CFM; the reverse is much less useful, and forcing symmetry degrades both.

### Related calculators on a calculator page

The list sits beside the calculator at the top of the page, with each entry’s icon
from `taxonomy.json`, and drops below it on narrow screens. (`layouts/page.njk`
still has an `is-wide` variant, a row of chips underneath, for a framed embed wider
than 820px; no page uses one now that every calculator is inline.)

The card count in the page subtitle is derived from `taxonomy.json`
(`src/_data/calculatorCount.js`), so it cannot drift.

Card descriptions come from each page's meta description, with the repeated SEO
lead-in stripped by the `cardBlurb` filter ("Our Online, Easy-to-Use Calculator
allows Users to …"). If a card reads oddly, fix that page's `description`.

## Before launch

Open items, roughly in order. Nothing here is started unless it says so.

**Off Wix (irreversible — do before cancelling the Wix account)**

- [ ] Export contacts: Adrienne exports the current list from Wix when Miles is
      ready to import it (an export was taken in September 2026, but people have
      signed up since, so it is out of date). These are the Calculator Updates
      signups: Wix's "subscriber status" column tracks opt-in to *Wix Email
      Marketing*, which the site never used, so everyone reads NEVER SUBSCRIBED
      and the "Email subscribers: 0" tile is misleading. The form signups are the
      contact list itself. Never commit the export: it is people's email addresses.
- [ ] **Export the contact-form submissions** from Wix Inbox. Separate export
      from the contacts above, equally unrecoverable, and it holds the actual
      message text people sent.

**Calculator Updates list**

- [ ] Filter the export before importing anywhere. Contacts Wix registered as
      site members look like spam signups and never asked for calculator
      updates; importing them is what gets a new sending domain flagged in its
      first week, when it has no reputation to absorb complaints.
- [ ] Create the list host and import the filtered file. **Buttondown** is the
      pick (chosen Sep 2026, over EmailOctopus). Worth knowing what that costs:
      at ~450 subscribers Buttondown is a paid tier, since its free tier stops
      at 100, whereas EmailOctopus would have been free to 2,500. Buttondown is
      the simpler tool for an announcement list sent a few times a year, and its
      embed is a plain HTML form POST, which is what a static site can use.
      (MailerLite is out: its free tier dropped to 250 subscribers in mid-2026.)
- [ ] Set `updates.action` and the field names in `src/_data/site.json`, read off
      Buttondown's own embed code. **Assigned to Miles — see `HANDOFF.md`.**
      Until then the placeholder address keeps the form hidden and every page shows
      an email-us note instead; `verify-urls.mjs` reports it under pending forms.
      `/calculator-updates/thanks` is only reached if something sends people
      there: fill `updates.redirectField` if Buttondown's embed accepts a redirect
      field, or set the redirect in Buttondown's settings. Otherwise Buttondown
      shows its own confirmation page and ours goes unused.

**Still placeholder**

- [ ] `contact.formspreeId` in `site.json` — `/contact` falls back to a mailto
      notice until it is set. The form's `_next` field sends people to
      `/contact/thanks`, but Formspree honours a custom redirect only on a paid
      plan (confirm on its pricing page); on the free plan visitors see Formspree's
      own thank-you page instead.
- [x] The quote page, at `/quote` (160 links point there).
- [ ] The 9 calculator icons marked `iconGuess` — see **Things to review**.

**Deploy**

- [x] Optimise images before first deploy. Done in the September audit: photos
      re-encoded at 2,400 px and 96 px copies for the icon slots, so pages load
      small files. The full-size files stay in `public/images/` (74 MB); five Wix
      photos no page used were removed, with the originals in `adicot-export/images`.
      Two large photos that look unused are the sources `build-service-images.mjs` reads.
- [ ] Push this repo to GitHub. It has no remote.
- [ ] Copy `deploy/cloudflare/_headers` and `deploy/cloudflare/_redirects` to the
      repo root and connect Cloudflare Pages (build command `npm run build`,
      output `_site`). `_redirects` there holds the path redirects only.
- [ ] In the Pages project's environment variables, set
      `QUOTE_API_ORIGIN=https://adicot-load-calc-doc.onrender.com`. The quote
      form's `/api/quote/*` calls go through the Pages Function in `functions/`,
      which forwards them there. `eleventy serve` cannot run Functions, so test
      the form locally with `npx wrangler pages dev _site` after a build.
- [ ] **Set up the domain redirects in the Cloudflare dashboard**, per
      `deploy/cloudflare/DOMAIN-REDIRECTS.md`: Always Use HTTPS, one Redirect
      Rule (the old engineering site's home page to /services) and the Bulk
      Redirects list in `bulk-redirects.csv`. Cloudflare Pages ignores
      domain-level rules in `_redirects`, so without this adicot.com (no www)
      and the old domains do not redirect, and search engines see duplicates.
- [ ] After the first deploy, confirm `/duct-size-calculator` returns **200, not
      a 301** — hosts differ on trailing slashes.
- [ ] Only then point DNS and cancel Wix.
- [ ] **Schedule a rebuild.** Some text is computed at build time, not in the
      browser: the About page's years in business (`src/_data/business.js`, from
      the 15 October 2014 founding date) and the footer's copyright year
      (`src/_data/buildYear.js`). Cloudflare Pages only rebuilds on a push, so
      without one these stay stale — "eleven years" past 15 October, last
      year's copyright past 1 January. Create a deploy hook (Pages project →
      Settings → Builds → Deploy hooks) and call it on a schedule: a GitHub
      Actions workflow with `on: schedule: - cron: '0 9 1,16 * *'` that POSTs
      to the hook, the hook URL stored as a repository secret. Twice a month
      covers both dates within a day or so.

## Things to review

- **`/about` is hand-authored** and rebuilt from adicotengineeringinc.com/about,
  reframed for the current positioning. Two things to confirm: the source said
  "nine states" while listing eleven, so **11** is used throughout; and the EOHLC
  entry is corrected — joined 2025, chair since 2026 — where the old page said only
  "Selection Committee".
- **The work orders and FBC energy calculations were retired** in September
  2026: the services they took orders for are no longer offered. They were in the
  Wix sitemap, so `_redirects` sends `/work-order-residential` and
  `/work-order-commercial` to `/contact`, and `/energy-calculation-residential`
  and `/energy-calculation-commercial` to `/services/energy-code-compliance`.
  Do not bring them back.
- **`/condensate-pump-size-calculator`** is a working calculator now, no longer
  the "COMING SOON!!" page carried over from Wix. It is ported from Condensate
  Pump Specifier V5.3 (Little Giant catalog 995505 rev 01-26) and held to it by
  its answer key; listed under Equipment and marked new in `taxonomy.json`.
- **Calculator icons — 9 need a glance.** The hand-drawn icons are back. Every
  icon on the old index carried descriptive alt text ("Cooling Coil", "Pass
  Through", "Leaves"), so they were matched on that rather than guessed from
  filenames. 30 are confident and 9 are marked `"iconGuess": true` in
  `taxonomy.json`; every calculator has one.

  ```bash
  node build-icon-review.mjs   # writes icon-review.html, open it directly
  ```

  That page shows the uncertain ones first, at a readable size. To change one,
  edit `icon` and `iconAlt` on that entry and drop the `iconGuess` flag; any file
  in `public/images/` is fair game. `icon-review.html` is gitignored — it is a
  local scratch page, not part of the site.

  Note: proximity matching in the markup does *not* work for this. Wix does not
  keep a card's image next to its link, so a positional match confidently pairs
  Ohm's Law with the air-change-rate icon. Alt text is the reliable signal.
- **`/junk` is retired.** It was a Wix scratch page, and was in the old sitemap,
  so it 301s to `/calculators` in the deploy configs rather than 404ing.
  `verify-urls.mjs` keeps a `RETIRED` list so the inventory check reports it as
  retired rather than missing. Retire another page the same way.
- **`/images`** was the other Wix scratch page, holding an old mobile copy of the
  mixed air calculator. Retired Sep 2026 the same way, with a 301 to
  `/air-mixing-calculator`.
- **Images total 163 MB**, straight from Wix at original resolution. Nothing
  resizes them yet. Worth running them through an optimizer before launch.

## Service card images

The two primary services each have a card, generated rather than laid out by
hand:

```bash
node build-service-images.mjs
```

It writes `og-load-calculations` and `og-energy-code-compliance` as PNG and WebP
into `src/assets` at 1200x630. They appear two-up on `/services` as the way into
each service page, are the `ogImage` for those pages, and are the files to hand
to any external listing that wants a thumbnail.

Each card is a photograph on the right, cut with a diagonal, and type on the
left over white. **The photographs are the firm's own**, from `public/images`
carried over from Wix, so they are already licensed to Adicot and there is no
stock agency to account to. Load calculations uses the drafting-desk shot;
energy code compliance uses the mid-rise under construction, which suits the
industrial, commercial and multi-family positioning better than the residential
interiors that make up most of that library.

Three rules are worth keeping when editing it:

- **The drafting photo is cropped, not trusted to blur.** The full frame shows a
  rolled drawing whose title block carries the firm's old Osprey address, and it
  stayed legible at card size. The `extract` box on that card exists to keep it
  out of frame. If you change that crop, check the title block.
- **Nothing is sized by guessing how wide a string is.** SVG cannot measure
  text. An earlier pass estimated character widths, and the title overflowed its
  plate while two labels printed on top of each other. Type sits in a fixed safe
  column that clears the diagonal at its narrowest point.
- **Only unqualified facts go on an image.** The 99% first-pass approval figure
  is deliberately absent. On the page it carries a footnote saying what it
  excludes; an image gets reposted without its footnote, so the claim would
  travel alone. The figures that are on there need no such qualifier.

## Header navigation

Six items: Engineering Services, Calculators, Get a Quote, About, Blog, Contact.
The first two carry a mega menu.

**The top level of each menu is a real link.** Without JavaScript the nav still
reaches `/services` and `/calculators`, and nothing in `nav.js` is needed. The
disclosure button beside the link ships `hidden` and is revealed by that script,
because a control that cannot do anything should not sit in the tab order. The
panels ship `hidden` too.

**Menu contents come from the data the pages are built from** — `services.items`
for the services menu, `taxonomy` for the calculator categories, with counts. A
new category or a new service page appears in the nav without anyone
remembering to add it there.

Opening is on click, not hover. Hover menus are awkward with a trackpad,
unusable on touch, and they open when someone is only passing through on the way
to the item below. Escape closes and returns focus to the button that opened the
menu; clicking outside or tabbing out closes it; opening one closes the other.

On a phone the nav is already a stacked panel behind the Menu button, so the
mega menus open inline within it rather than floating over it, and the
disclosure gets the same 44px touch target as the favourite stars.

This replaced the `catnav` strip, a second row of category links under the
header that only appeared on calculator pages. The mega menu carries the same
links on every page, so keeping both would have been two rows of chrome saying
the same thing.

## Post thumbnails

The blog index and the category pages show a thumbnail per post:

```bash
node build-post-thumbs.mjs
```

It reads each post's `ogImage` front matter, writes a 400x300 WebP and JPEG to
`src/assets/thumbs/<fileSlug>.*`, and records what it produced in
`src/_data/postThumbs.json`. Both listings render through
`_includes/partials/postlist.njk`, which draws a thumbnail only for slugs in
that manifest, so a post whose lead image is missing gets a row without a
picture rather than a broken image.

**Resizing is the whole point.** The `ogImage` files are Wix originals: twelve
posts come to 5.1 MB, one of them 4032x3024. Pointing the listing at those
directly would have downloaded several megabytes to draw a column of 180px
pictures. The generated set is about 170 KB of WebP.

The thumbnail is a second link to the same post, so it is `aria-hidden` and out
of the tab order with empty alt text. The heading beside it is the real link and
already names the post; without that, every row would be announced twice.
