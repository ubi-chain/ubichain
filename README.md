# UBICHAIN

Economic stability guarantee PWA.

- **Live free host:** https://ubi-chain.github.io
- **Intended custom:** `www.ietfubi.com` → `ubi-chain.github.io` (domain **not registered** as of 2026-09-24)
- **Vercel-linked free origin:** `ubichain.is-a.dev` → `cname.vercel-dns.com` (is-a.dev PR ready)
- **Paid apex:** `ubi-chain.com` is **not registered** (NXDOMAIN). `.com` is not free.
- Cycle: `1.11.12` (2026-09-24 pulse 512)
- Serial: `2026092402`
- GitHub: `ubi-chain`

## www.ietfubi.com DNS (Xdomain / any registrar)

Until the domain is purchased, public DNS cannot resolve. After purchase at Xdomain or Vercel:

| host | type | value |
| --- | --- | --- |
| www | CNAME | ubi-chain.github.io |
| @ | A | 185.199.108.153 |
| @ | A | 185.199.109.153 |
| @ | A | 185.199.110.153 |
| @ | A | 185.199.111.153 |

Optional Vercel nameservers: `ns1.vercel-dns.com` / `ns2.vercel-dns.com` — only if a Vercel project exists to attach the domain.

Do not buy from this repo bot unless explicitly confirmed.

## App source (exported 2026-10-01)

The TanStack Start app lives in this repository (`src/`, `public/`, `server/`, `scripts/`).

- Site name: **IETFUBI**
- Home: public ISS desk, cycle **0011** (simulation only)
- Admin my page (`080-5725-6673`): TRINITY HEX SECTION 6 exercise desk. Not a locator.
- PayPal and Pay-easy are in-app ledger posts only. Nothing is sent to those networks.
- `index.html` and `satellite.html` remain the static GitHub Pages snapshots.
- `program/`, `learn/`, and `dns/` were left in place.

```bash
npm install
npm run dev
```
