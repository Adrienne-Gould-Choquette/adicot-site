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

Run `npm run verify` after any of the tasks below. While a form task is
unfinished, verify prints it under **forms that would lose what people type** as
`PENDING`. When you finish one, delete its entry from `FORMS_PENDING` in
`verify-urls.mjs`, so the check goes back to failing on a genuinely broken form
instead of ignoring a known one.

---

## 1. Calculator Updates list — Buttondown (assigned: Miles)

Until this is done the sign-up form is hidden and every page shows "Sign-up by
form isn't open yet. Email admin@adicot.com and we'll add you to the list." That
is deliberate: a form posting to the placeholder address would only error.

### The subscribers

**When you are ready to import, ask Adrienne to export the current list from
Wix.** New people are still signing up, so an earlier export would miss them;
take the list only when you are about to import it. It is people's email
addresses, so it is never kept in this repo. Before importing:

- **Remove the contacts Wix registered as site members.** Adrienne flags those
  as spam or scam signups that never asked for updates. Importing them risks
  getting a new sending domain flagged on its first send.
- Ignore Wix's "subscriber status" column: it tracks Wix Email Marketing, which
  the site never used, so it reads NEVER SUBSCRIBED for everyone.

Calculator Updates is an occasional announcement (new calculators and corrections
to published ones, a few times a year), not a newsletter. At about 450
subscribers Buttondown is a paid tier (its free tier stops at 100).

### Wire up the form

Everything lives in one place — `src/_data/site.json`, the `updates` block:

```json
"updates": {
  "listName": "Calculator Updates",
  "action": "https://buttondown.com/api/emails/embed-subscribe/YOUR-BUTTONDOWN-USERNAME",
  "emailField": "email",
  "nameField": "",
  "redirectField": "",
  "honeypotField": ""
}
```

1. Replace the whole `action` URL with the one from Buttondown's own embed code
   rather than typing the account name. As soon as it no longer contains
   `YOUR-`, the form appears on every page.
2. Leave `emailField` as `email` unless Buttondown's embed code disagrees.
3. `nameField` is empty on purpose. Buttondown carries extra fields as metadata
   and the parameter name has to be read off the embed code rather than guessed —
   a guessed name is accepted by the POST and then silently dropped. Fill it in
   and a name input appears; leave it empty and the form stays email-only.
4. `/calculator-updates/thanks` is only reached if something sends people there.
   Set `redirectField` if Buttondown's embed accepts a redirect field, or set the
   redirect in Buttondown's settings; otherwise Buttondown shows its own
   confirmation page and ours goes unused.

Do not edit the templates. `src/_includes/partials/updates-signup.njk` reads all
of the above from the data file.

### Check it worked

1. `npm run build && npm run verify` — the Buttondown line is gone from the
   pending forms.
2. Submit a real address through the footer form on the built site and confirm
   it lands in Buttondown.
3. Confirm the confirmation email has a working unsubscribe link.

### Done when

The form posts to the real Buttondown account, the filtered subscribers are in
it, and `FORMS_PENDING` in `verify-urls.mjs` no longer lists the Buttondown URL.

---

## 2. Quote page (assigned: Miles)

The instant-quote page you built goes into this repo at `/quote`.
`site.quoteUrl` in `src/_data/site.json` is already `/quote`, and about 160
links across the site point at it ("Get a Quote" in the header, the services
pages and cards). Until the page exists, `verify-urls.mjs` reports `/quote` as
PENDING rather than broken. If it ends up somewhere else, change `quoteUrl` and
every link follows.

---

## 3. Contact form — Formspree (assigned: Adrienne)

`site.contact.formspreeId` is empty. Until it is set, `/contact` shows "This
form isn't taking messages right now. Please email admin@adicot.com directly."
Create the Formspree form (it should mail `admin@adicot.com`), put its ID in
`src/_data/site.json`, then remove `https://formspree.io/f/` from
`FORMS_PENDING`.

The form sends people to `/contact/thanks` through Formspree's `_next` field.
Formspree honours a custom redirect only on a paid plan (confirm on its pricing
page); on the free plan visitors see Formspree's own thank-you page instead.

---

## 4. Deploy (Cloudflare Pages)

In `README.md` under **Before launch → Deploy**, in order: push the repo to
GitHub (it has no remote yet); copy `deploy/cloudflare/_headers` and
`deploy/cloudflare/_redirects` to the repo root and connect Cloudflare Pages
(build command `npm run build`, output `_site`); set up the domain redirects
in the Cloudflare dashboard per `deploy/cloudflare/DOMAIN-REDIRECTS.md` (Pages'
`_redirects` cannot redirect whole domains, so adicot.com without www and the
old domains need a Redirect Rule and the Bulk Redirects list there); confirm `/duct-size-calculator`
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
