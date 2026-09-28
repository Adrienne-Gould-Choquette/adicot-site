# Handoff

For Miles, picking up the rebuilt adicot.com. The site is finished and checked;
what is left needs accounts or credentials, or a deploy. Each task says what to
change, how to check it worked, and when it is done. The full launch checklist is
in `README.md` under **Before launch**; this file is the part that is yours or
needs an account.

## Start here

```bash
npm ci            # installs exactly what package-lock.json records
npm run serve     # local preview at http://localhost:8080
npm run build     # writes the site to _site/
npm test          # every calculator against its answer key (Excel workbooks, captured standards, worked examples)
npm run verify    # every legacy Wix URL still resolves; forms post somewhere real
```

Build from a folder on a local disk, not Google Drive: npm installs on a synced
drive come out with empty `package.json` files and fail in confusing ways.

Run `npm run verify` after any of the tasks below. It fails on any form whose
action is empty or a placeholder, under **forms that would lose what people
type**. `FORMS_PENDING` in `verify-urls.mjs` is empty, and should stay that way.

---

## 1. Calculator Updates list (assigned: Miles)

The footer form and `/calculator-updates` post to `/api/updates/subscribe`, which
`functions/api/[[path]].js` forwards to the Flask app (see section 4 for its env
vars). Flask appends a row to the `Subscribers` tab of the Projects spreadsheet,
emails admin@adicot.com, and sends the visitor to `/calculator-updates/thanks`,
or to `/form-error` if the write fails. The form's action, field names and the
`website` honeypot all come from the `updates` block of `src/_data/site.json`.

There is no mailing service yet. Calculator Updates is an occasional announcement
(new calculators and corrections to published ones, a few times a year), so
announcements go out by hand from Gmail until one is chosen. When it is, import
the `Subscribers` tab into it (Buttondown or similar) and point `updates.action`
at it.

### The subscribers

**Ask Adrienne to export the current list from Wix** just before the cutover, so
nobody who signs up in the meantime is missed, and paste it into the
`Subscribers` tab. It is people's email addresses, so it is never kept in this
repo. Before pasting:

- **Remove the contacts Wix registered as site members.** Adrienne flags those
  as spam or scam signups that never asked for updates.
- Ignore Wix's "subscriber status" column: it tracks Wix Email Marketing, which
  the site never used, so it reads NEVER SUBSCRIBED for everyone.

### Done when

A real address submitted through the footer form on the deployed site lands in
the `Subscribers` tab, the notification reaches admin@adicot.com, and the
filtered Wix list is in the tab.

---

## 2. Quote page (assigned: Miles, done)

The instant-quote page is in at `/quote` (`src/pages/quote.njk`, script
`src/assets/js/quote.js`, styles in the quote section at the end of `site.css`).
`site.quoteUrl` in `src/_data/site.json` is `/quote`, and about 160 links across
the site point at it. If it moves, change `quoteUrl` and every link follows.

Its project types, services and jurisdictions come from `src/_data/quote.json`.
That file is generated: rerun the Flask repo's
`scripts/export_quote_options.py src/_data/quote.json` whenever `pricing.py`
changes, and rebuild.

The form posts to `/api/quote/price`, `/upload` and `/submit` on this domain.
`functions/api/[[path]].js`, a Cloudflare Pages Function, forwards every `/api/*`
request to the Flask app, so the quote, contact and sign-up forms all fail
without its env vars (section 4). `eleventy
serve` cannot run Functions, so to test the form locally build first and run
`npx wrangler pages dev _site`.

---

## 3. Contact form (assigned: Miles)

`/contact` posts to `/api/contact` through the same Pages Function. Flask appends
a row to the `Calculator Contact` tab, emails the message to admin@adicot.com,
and sends the visitor to `/contact/thanks`, or to `/form-error` if it fails. The
`_gotcha` field is a honeypot: a filled one gets the thanks page and no row.

Done when a test message through the deployed form reaches both the tab and the
inbox.

---

## 4. Deploy (Cloudflare Pages)

In `README.md` under **Before launch → Deploy**, in order: push the repo to
GitHub (it has no remote yet); `_headers` and `_redirects` already sit in `public/`, which the build copies
into `_site` where Pages reads them; connect Cloudflare Pages
(build command `npm run build`, output `_site`); set up the domain redirects
in the Cloudflare dashboard per `deploy/cloudflare/DOMAIN-REDIRECTS.md` (Pages'
`_redirects` cannot redirect whole domains, so adicot.com without www and the
old domains need a Redirect Rule and the Bulk Redirects list there); set the Pages environment variables
`API_ORIGIN=https://adicot-load-calc-doc.onrender.com` and `PROXY_TOKEN` (the same
value as `PROXY_TOKEN` on the Render service, which rejects forwarded requests
without it); confirm `/duct-size-calculator`
returns 200, not a 301; set up the scheduled rebuild (a deploy hook called
twice a month, so the years in business and the footer year stay current); then
point DNS.

**Export the Wix Inbox form submissions before Wix is cancelled.** They are a
separate export from the contacts and are not recoverable afterwards.

---

## 5. Duct calculator material spec sheets (assigned: Adrienne)

The old duct calculator had a button beside the material dropdown that opened a
specification sheet for the selected material. The rewritten calculator has the
same slot, but no URLs to put in it. Fill in `specUrl` for each entry in
`src/_data/ductMaterials.json`:

```json
{ "name": "Metal", "roughness": "0.0003 ft", "specUrl": "" }
```

A material with an empty `specUrl` shows no link, so partial answers are fine.
Do not change `name`: it is the key the model looks the roughness up by, and
`check-ductulator.mjs` fails if it stops matching.
