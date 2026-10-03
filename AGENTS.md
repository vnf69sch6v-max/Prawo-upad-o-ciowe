# AGENTS.md

## Cursor Cloud specific instructions

Savori is a single Next.js 16 (App Router, Turbopack) application — a Polish
economy data platform. There is no separate backend; API routes under
`src/app/api/**` proxy external public data sources (GUS, NBP, Eurostat,
Stooq, RSS) and cache through Firestore when Firebase is configured.

### Running / building / linting

Standard scripts in `package.json`:

- `npm run dev` — dev server (Turbopack) on `http://localhost:3000`.
- `npm run build` — production build (used to validate compilation).
- `npm run lint` — ESLint (`eslint-config-next`).

- `npm test` — vitest: parser raportów (`tests/parser.test.ts` wobec utrwalonych
  sprawozdań w `tests/fixtures/`), reguły świeżości danych (`tests/freshness.test.ts`)
  i ranking sygnałów hero na Przeglądzie (`tests/hero-signals.test.ts`). Strony
  i trasy API nie mają testów — zielony `npm test` nie mówi nic o ich renderze.

### Non-obvious caveats

- Firebase is optional. With no `NEXT_PUBLIC_FIREBASE_*` / `FIREBASE_*` env
  vars, the app runs in demo mode: login is disabled (a `demo@makro.pl`
  account is assumed) and server-side caching is skipped. The dev server,
  build, and all pages work fully in this mode — no secrets are needed to run
  or test the app locally.
- `npm run lint` currently reports pre-existing errors/warnings in
  `src/lib/firebase/*` and hooks (unrelated to environment setup). The lint
  tooling itself works; these are code-level issues, not setup problems.
- API routes fetch from live external sources and require outbound network
  access. Data endpoints (e.g. `/api/nbp-rates`, `/api/wibor`) may be slow or
  fail if a source rate-limits; GUS DBW has a shared ~100 req/15 min limit
  (see `README.md`). Pages degrade gracefully and show `—` when a source is
  unavailable, so a missing data value is not necessarily a bug.
- The `middleware`-file deprecation warning from Next.js at startup is
  expected and harmless.
- Inside a `withCache(...)` fetcher, fetch upstream with `cache: 'no-store'`,
  not `next: { revalidate }`. The Next.js Data Cache is stale-while-revalidate,
  so the first request after expiry gets an old response that `withCache` then
  stores in Firestore with a fresh timestamp — even on cron `?refresh=1`. This
  froze NBP rates and Yahoo quotes for weeks in production. GUS BDL/DBW routes
  keep `revalidate` on purpose (shared rate limit). Never cache NBP `.../today`
  under a fixed key; use `exchangerates/tables/{t}/` (latest table).
- GUS DBW short-term indicators (industrial production, construction output,
  retail sales — y/y, constant prices, unadjusted = the GUS press-release
  number) are configured once in `src/lib/gus-dbw-series.ts` and requested via
  `dbwSeriesPath()` / `dbwSeriesParams()`, so hooks, the `dbw-4` warm cron and
  the freshness check hit the same `/api/dbw-series` cache key. DBW variable 312
  is the construction **price** index (used only on `/ceny`) — until Oct 2026 it
  was mislabelled as industrial production. BDL P3860 retail lags GUS releases
  by weeks and is in current prices; don't use it for the headline number.
  Before wiring a new DBW id, confirm its name in the catalogue
  (`variable/variable-section-periods?ile-na-stronie=5000&numer-strony=N`) and
  positions (`variable/variable-section-position?id-przekroj=`); the
  presentation-measure dictionary pages with `?page=N`, not `numer-strony`.
- The Przegląd hero is not fixed: `rankHeroSignals()` (`src/lib/hero-signals.ts`)
  orders CPI / industry / retail / unemployment by publication recency (GUS
  calendar in `src/lib/calendar-schedules.ts`) × size of the latest change in
  σ of its own history; WIG20 and EUR/PLN enter only on a ≥2σ move. Keep the
  publication calendar current — stale dates make fresh readings look old.
- `/api/bdl-series?count=N` counts consecutive BDL **variable ids** (one per
  month, or per quarter), not months — max 12 (monthly) / 4 (quarterly); the
  route clamps it. The route already returns two years (previous + current).
- Chart ranges (`3M`, `1R`, …) are time-based (`src/lib/chart-range.ts`) and
  tooltips open on hover only for fine pointers (`useCanHover()`); touch keeps
  tap-to-show.
- Pages are prerendered at build time. Anything derived from "now" (upcoming
  publication dates, "today") must wait for `useIsClient()`
  (`src/lib/use-is-client.ts`), otherwise React throws hydration error #418
  and visitors see build-day dates until hydration.
- `/parser` is the only route that takes user input instead of an external
  source. Its components use their own semantic colour tokens (`rp-*`), defined
  at the bottom of `src/app/globals.css` and mapped onto the light `mk-*`
  palette — change colours there, never inside the parser components. `pdfjs-dist`
  and `exceljs` are listed in `serverExternalPackages` and must stay there.
  PDF uploads on Vercel need `pdf.worker.mjs` in the serverless trace
  (`outputFileTracingIncludes` for `/api/parser/parse` plus an absolute
  `GlobalWorkerOptions.workerSrc` from `resolvePdfWorkerSrc()` in
  `src/lib/parser/extract.ts`). Do not call `require.resolve("literal")`
  — webpack rewrites that to a numeric module id and production 500s
  (`The "path" argument must be of type string. Received type number`).
  Split the module id and bind `require["resolve"]` so the bundler
  leaves it alone. TXT samples work without the worker; a missing
  worker is a 500 (`Setting up fake worker failed`), not an empty parse.
  Vercel Function request bodies are a hard 4.5 MB (`FUNCTION_PAYLOAD_TOO_LARGE`)
  on every plan — do not raise `MAX_BINARY_UPLOAD_BYTES` or add
  `bodyParser.sizeLimit`. PDFs above ~4 MB are extracted in the browser
  (`extractPdfTextInBrowser`, worker at `/pdfjs/pdf.worker.min.mjs`) and
  POSTed as JSON text (cap 40 MB file / 250 pages / 45 s).
