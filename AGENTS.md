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
  pass `gusFetchInit(force)` (`src/lib/upstream-fetch.ts`): the user path keeps
  `revalidate` (shared DBW limit), the cron path `?refresh=1` is `no-store` —
  otherwise a fresh GUS release reached the site a day or two late. Never cache
  NBP `.../today` under a fixed key; use `exchangerates/tables/{t}/` (latest table).
- `withCache` never overwrites a good entry with a failure: if the fetcher
  throws it returns the last stored payload (any age), and an empty payload
  (`looksEmpty`: every top-level array empty) does not replace a non-empty one.
  An API can therefore answer 200 with old data — staleness is detected by the
  freshness check, not by HTTP errors.
- Data freshness: `/api/health/freshness` compares the latest period each page
  endpoint serves with the period the publication calendar says should exist
  (`src/lib/freshness.ts`, tests in `tests/freshness.test.ts`). 200 = no
  `stale`/`error` (`lag` = one period behind, e.g. BDL after a GUS release, is
  a warning); 503 otherwise; CDN 5 min. `/status` renders it. `cron/freshness`
  (16:40 UTC) re-checks, self-heals NBP/Yahoo/Eurostat with `refresh=1` (never
  GUS DBW/BDL), stores `health/freshness_latest|history` in Firestore and posts
  to `ALERT_WEBHOOK_URL` (optional; Slack `text` / Discord `content`). A new
  indicator on a page needs a `DatasetSpec` in `FRESHNESS_DATASETS` whose
  endpoint matches the hook exactly (DBW: `dbwSeriesPath(...)`).
- Warm crons: `dbw-1|4|2|3` (09:40 / 11:40 / 13:40 / 15:40 UTC — after the
  10:00 Warsaw GUS releases, so a release reaches the site the same day; 2 h
  apart so Hobby's ±1 h start jitter can't put two in one 15-min DBW window;
  ≤~80 calls each), `bdl` (05:00, sequential, BDL allows ~5 req/s without a
  key), `refresh` (06:00, everything non-GUS in parallel), `freshness` (16:40).
  Crons call our own endpoints through `src/lib/internal-fetch.ts` only:
  Vercel invokes crons on the `*.vercel.app` deployment URL, which in this
  project sits behind Vercel login (Deployment Protection); a plain
  `fetch(new URL(request.url).origin + ep)` followed the 302 to the login
  page, got HTTP 200 and the cron reported "ok" while refreshing nothing.
  `internalOrigin()` uses the public production domain
  (`VERCEL_PROJECT_PRODUCTION_URL`, override `INTERNAL_BASE_URL`),
  `redirect: 'manual'`, and only a 2xx JSON answer counts as success.
  Every cron records its run in Firestore `health/cron_runs`
  (`src/lib/cron-log.ts`; evaluation in `src/lib/cron-runs.ts`), shown on
  `/status` — the only proof the automation actually ran. `vercel.json` has
  `src/app/api/**/*.ts → maxDuration 30`; every long-running route also needs
  its own explicit `functions` entry, or it is cut at 30 s regardless of the
  `export const maxDuration` in code.
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
- Mobile is a first-class target (standard and workflow:
  `.claude/agents/mobile-designer.md`). Below `lg` the shell is a single 56 px
  header plus a fixed bottom tab bar (`MobileTabBar`, `MoreSheet`); the footer
  reserves `var(--mk-bottom-chrome)` so nothing hides under the bar — anything
  `fixed bottom-*` must add it too, and sticky panels use
  `lg:top-[var(--mk-sticky-top)]` (header is two rows between lg and xl).
  Touch targets are ≥44 px via the `touch:` variant (`pointer: coarse` OR
  `max-width: 1023px`). `.mk-btn`, `.mk-seg*`, `.mk-input` live in
  `@layer components`, so Tailwind utilities override them; `.mk-input` is
  16 px below lg (iOS zooms on focus under 16 px). `.mk-fade-in` uses
  `animation-fill-mode: backwards` — a lingering `transform` would make the
  wrapper the containing block for `position: fixed` children. Pickers and
  filters on phones open as bottom sheets (`Drawer`). PWA: manifest + icons
  only, deliberately no service worker (stale data/JS after deploys).
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
