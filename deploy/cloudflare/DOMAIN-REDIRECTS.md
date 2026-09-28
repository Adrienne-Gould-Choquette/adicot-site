# Domain redirects on Cloudflare

Cloudflare Pages' `_redirects` file handles paths only; it does not support
domain-level redirects (a source with a hostname). Those are set in the
Cloudflare dashboard instead, so every other domain and `adicot.com` without
`www` send visitors, and search engines, to `https://www.adicot.com` with a 301.
Without them the old domains stop working and search engines see two copies of
the site.

## 1. Always Use HTTPS

SSL/TLS → Edge Certificates → **Always Use HTTPS**: on. (http → https for every
host, before any rule below.)

## 2. One Redirect Rule (the old engineering site's home page)

Rules → Redirect Rules → Create rule (a Single Redirect; these run before Bulk
Redirects):

- **When:** Hostname is in `adicotengineeringinc.com`, `www.adicotengineeringinc.com`
  **and** URI Path equals `/`
- **Then:** Static redirect to `https://www.adicot.com/services`, status **301**

That domain was the engineering-services site, so its home page lands on
Services rather than on the calculator home page.

## 3. Bulk Redirects (every other path)

Rules → Bulk Redirects → create a list, import `bulk-redirects.csv` from this
folder, then create a Bulk Redirect rule that uses the list.

| Source | Target | Subdomains | Keeps the path |
|---|---|---|---|
| `adicot.com/` | `https://www.adicot.com/` | no (it would catch www.adicot.com and loop) | yes |
| `adicotengineering.com/` | `https://www.adicot.com/` | yes (also www.) | yes |
| `adicotengineeringinc.com/` | `https://www.adicot.com/` | yes (also www.) | yes |

All three are 301, keep the query string, match every path under the domain and
carry it over, so `adicotengineeringinc.com/quote` becomes
`https://www.adicot.com/quote`.

Each domain needs a proxied (orange-cloud) DNS record in Cloudflare for the rules
to see its requests.

## Check

```bash
curl -sI http://adicot.com/about | grep -i -E "^(HTTP|location)"
curl -sI https://www.adicotengineeringinc.com/ | grep -i -E "^(HTTP|location)"
curl -sI https://adicotengineeringinc.com/quote | grep -i -E "^(HTTP|location)"
curl -sI https://adicotengineering.com/duct-size-calculator | grep -i -E "^(HTTP|location)"
```

Each should answer `301` with a `location` on `https://www.adicot.com` (the
second one on `/services`), and `https://www.adicot.com/about` itself should
answer `200`.

The Netlify copy of `_redirects` keeps the domain rules in the file, because
Netlify does support them there.
