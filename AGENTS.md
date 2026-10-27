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
- Data protection (`docs/specs/2026-10-25-ochrona-danych.md`). `firestore.rules` / `storage.rules` deny every
  client read and write; the server uses the Admin SDK, which bypasses rules. Rules are deployed manually by
  the owner, not by Vercel. The browser uses Firebase only for Auth: never import `firebase/firestore`,
  `firebase/storage` or `firebase/database` in `src` (enforced by `tests/data-protection.test.ts`).
  Every Firestore document the app writes goes through `toStored()` / `fromStored()` (`src/lib/data-seal.ts`;
  `withCache` and `readServerCacheEntry` already do this). Never write or read raw `payload` fields.
  - With `DATA_ENCRYPTION_KEY` (32 bytes, base64), content is JSON → deflate → AES-256-GCM, with
    AAD = doc path + `updatedAt`. The document holds `{ sealed, updatedAt }`.
  - Without the key (demo, before the owner sets it), documents keep the old plaintext shape.
  - A document that cannot be decrypted (tampered, moved, wrong key) reads as a cache miss.
  - `cron/freshness` seals leftover plaintext docs and re-seals docs from `DATA_ENCRYPTION_KEY_PREVIOUS`
    (`maybeSweep`, every 6 h at most).
  - `DATA_ENCRYPTION_STRICT=1` rejects plaintext docs.
  - Status: `/api/health/freshness` → `encryption`.
  - Merge-writes (`set(..., { merge: true })`) can't work on sealed docs. Do read-modify-write in a
    transaction, like `recordCronRun`.
- Paid platform (`src/lib/access.ts`, `src/middleware.ts`, `src/app/start`). The gate is on by default (`src/lib/auth/flags.ts`,
  whenever Firebase is configured), so signed-out visitors are redirected to `/start`, the landing with login and pricing (`PLANS`:
  10/20/30 zł for 1/3/6 months, one-time, no auto-renewal). Signed-in users without valid access go to
  `/start?dostep=wygasl#cennik`. Public: `/start`, `/login`, `/prywatnosc`, `/regulamin`, `/status`, `/api/*`, files.
  - The middleware verifies the `__session` cookie cryptographically (`src/lib/auth/session-verify.ts`: jose,
    Google session-cookie certs, issuer/audience = project). A forged cookie is rejected and deleted. Revocation is
    checked only on the server.
  - Access is held in custom claims (`accessUntil` in seconds, `plan`) inside the signed cookie, so the gate needs
    no DB read. `/api/auth/session` grants a trial (`TRIAL_DAYS`, default 7, `0` = none) on first sign-in, and
    permanent access for verified `ADMIN_EMAILS`. It then answers `{ refresh: true }` and the client re-sends a
    refreshed token, because claims reach a token only after refresh.
  - Use a redirect, not a rewrite, for `/` → `/start`: `ShellFrame` keys off `usePathname()`, so a rewrite would
    wrap the landing in the app chrome. `/start`, `/prywatnosc`, `/regulamin` are `BARE_ROUTES`.
  - `/api/*` is behind the gate only when `CRON_SECRET` is set: crons and the freshness check call our own
    endpoints with `Authorization: Bearer CRON_SECRET` (`internalInit`), the browser with the session cookie.
    Without a session the API answers 401, without access 403. Public API: `/api/auth/session`, `/api/health/*`,
    `/api/cron/*`, `/api/stripe/checkout`, `/api/stripe/confirm`, `/api/stripe/webhook`.
  - Payments are one-time Stripe Checkout (no stripe.js, no publishable key in the browser). The secret is
    read server-side from `STRIPE_SECRET_KEY` (also `STRIPE_PRIVATE_KEY`, `STRIPE_API_KEY`, `STRIPE_SECRET`;
    `pk_` and `whsec_` are ignored). `STRIPE_WEBHOOK_SECRET` verifies `checkout.session.completed` and
    `checkout.session.async_payment_succeeded`. Granting access is `fulfillPaidSession` (`payments/{sessionId}`
    via `toStored`, then `setCustomUserClaims`); a replay does not add months twice. Checkout and confirm stay
    on the public-API list so an expired user can pay, but both routes require the session cookie themselves.
    The webhook has no cookie — a bad signature is 400 and grants nothing. Success returns to
    `/start?platnosc=ok`, which refreshes `__session` (`iat` of a forced token, not the 5-minute `auth_time`
    rule on `/api/auth/session`). Do not add `checkout.stripe.com` to `connect-src`; the browser only navigates there.
  - `isPublicPath` uses an allowlist of real files, not "anything with a dot". On Vercel `/ceny.rsc` and
    `/ceny.segments/…` are the rendered page (RSC) and used to slip through as "files".
  - If Google's certs are unreachable, the result is `'unavailable'` → 503 + `Retry-After`. The cookie is not
    deleted, so a blip doesn't log paying users out.
  - Trial: verified e-mail only, once per address (`trials/{HMAC(e-mail)}` via `claimTrial`, `src/lib/auth/grant.ts`).
  - Legal pages read the owner's data from env `NEXT_PUBLIC_OWNER_NAME|ADDRESS|NIP`, `NEXT_PUBLIC_CONTACT_EMAIL`
    (`src/lib/legal.ts`; name and e-mail also have defaults in code). A missing address is the placeholder
    `[do uzupełnienia przez właściciela]` inside the document — there is no draft banner. Any change to what
    data the app processes must update `/prywatnosc` in the same PR.
  - Inter comes from `next/font` (self-hosted, `--font-inter`). Don't add `fonts.googleapis.com` back: it sent
    every visitor's IP to Google.
- Per-user data (`docs/specs/2026-10-25-dane-uzytkownika.md`) lives in one sealed Firestore doc per account,
  `savori_users/{uid}` (`src/lib/user-data.ts` = shape + validation, `src/lib/user-data-server.ts` = read /
  transactional read-modify-write). The prefix matters: the Firebase project is shared with another app, so a plain
  `users` collection could collide and the seal sweep (which now also walks `savori_users`) would touch foreign docs.
  Identity comes only from the `__session` cookie verified server-side (`requireSession`,
  `src/lib/auth/require-session.ts`) — never from a `uid` in the request body or query. Routes under `/api/me/*`
  answer `Cache-Control: private, no-store`, 501 without Admin SDK (demo), 401 without a session, and validate the
  body with `parseWatchItems`-style allowlists (400, nothing written). Today the only such data is the watchlist:
  the sync engine is `src/lib/watchlist-store.ts` (no React, no `window`; `fetch`/storage injected, tested in
  `tests/watchlist-store.test.ts`), wired by `useWatchlist` (`src/lib/watchlist.ts`). It keys `localStorage` by `uid`
  (`mk:watchlist:u:{uid}`; anonymous/demo keeps `mk:watchlist:v1`), pulls the account list on sign-in (account wins;
  a pre-login list migrates once), debounces `PUT /api/me/watchlist` 400 ms with retry, and **never PUTs before a
  successful GET for the current account** — a failed pull is retried (15 s, `online`) while clicks wait locally and
  merge with the account list afterwards; otherwise one star on a new phone with bad signal would wipe the list.
  501 is not transient (demo). Adding a new per-user field = extend `UserData`, pass it through `writeUserData`
  (whole-doc), and update `/prywatnosc`.
- Auth flags (`src/lib/auth/flags.ts`): since 25.10.2026 both default to **on** when the Firebase client config is
  present (owner's decision: savori.space only for signed-in users). `NEXT_PUBLIC_AUTH_ENABLED=false` turns off
  sign-in (Google popup + e-mail/password, `src/lib/auth/use-auth.tsx`) and the gate; `NEXT_PUBLIC_AUTH_REQUIRED=false`
  keeps sign-in but leaves the site public (`src/middleware.ts`). Without Firebase config (dev, demo) both are off —
  a gate without working sign-in would lock everyone out. Both are inlined at build time (read them only as literal
  `process.env.NEXT_PUBLIC_*`): the SSR and the browser render agree, and changing them needs a redeploy.
  Google sign-in uses `signInWithPopup`, not redirect: redirect breaks with third-party storage blocking
  because the authDomain (`*.firebaseapp.com`) differs from savori.space. The popup needs:
  - `script-src https://apis.google.com` (gapi);
  - `frame-src https://<authDomain>`;
  - COOP `same-origin-allow-popups`.
- Security headers (CSP, HSTS, `X-Frame-Options`, …) are set for every route in
  `next.config.ts` (`SECURITY_HEADERS`; CSP only in production builds — check
  with `next start`, not `next dev`). The CSP allows only what the browser
  actually loads: own scripts (`'unsafe-inline'`, pages are prerendered so no
  nonce), Firebase Auth only (`connect-src` = `identitytoolkit` + `securetoken`, not
  `*.googleapis.com` where anyone can host a bucket; `*.firebaseapp.com` frames), https images, the
  `/pdfjs` worker. Any new
  browser-side script, iframe, font or `fetch` to another origin needs a CSP
  entry, or it is silently blocked (`securitypolicyviolation` in the console).
- Autonomous work follows `docs/ROADMAP.md` (backlog, owner-only actions, log)
  and goes through the product-manager agent (`.claude/agents/product-manager.md`):
  PLAN → spec in `docs/specs/` (verified data source, acceptance criteria) →
  implement → REVIEW (SHIP / FIX / BLOCK) → production. Product principles,
  the per-country indicator blueprint and the definition of done live in
  `docs/PRODUCT.md`.
- Japan (`/japonia`, Polish UI). `/japonia` is the overview (hero ranked like Poland,
  with Japanese release dates and the BOJ 2% target; the current account is in
  billions of yen and dated from `JP_BOP_RELEASES`, not as percentage points). Inflation lives at
  `/japonia/inflacja`. The country comes only from the URL
  (`countryOf()` in `src/components/shell/country.ts`); header switch
  `CountrySwitch` (segment from `lg`, 44 px button + sheet below), nav per
  country (`navItemsFor`, `tabItemsFor`, `moreGroupsFor`). Data: Statistics
  Dashboard API (no key) — series configured once in `src/lib/jp/cpi.ts`
  (official **2025 base** since 21.08.2026; every response is validated against
  `mustInclude` name fragments, so a wrong series or the old base throws instead
  of showing someone else's numbers); fetch + Firestore cache in
  `src/lib/jp/cpi-server.ts` (`?refresh=1` reaches the source at most every
  10 min — the shared `withCache` limit, same as the PL routes). Release calendar
  `src/lib/jp/calendar.ts` (8:30 JST = 23:30/00:30 UTC; extend it before
  03.2027, after that freshness falls back to a heuristic). The page is ISR
  (`revalidate = 1800`) and reads Firestore only (`peekJpCpi`) — never fetch an
  upstream source in a page render (Data Cache trap above). Cron `jp`
  00:30 UTC (9:30 JST) plus a second pass in `refresh`; freshness id `jp-cpi`.
  The Statistics Dashboard credit text must stay visible on the page. Official
  CPI contributions (寄与度) are a separate cache (`jp_data/cpi_contributions_v1`,
  `/api/jp/cpi-contributions`): the latest e-Stat table 5 xlsx from the stable
  list `lid=000001491870`, not the Dashboard. The page only peeks that cache.
  `/japonia/rynki` reads BOJ Time-Series Data Search (`/api/jp/markets`, no key).
  Daily `startDate` is `YYYYMM`, not `YYYYMMDD`. Series names are validated
  (`mustInclude`); the credit must stay on the page.
  `/japonia/praca` is the Labour Force Survey unemployment rate (`/api/jp/labour`,
  cache `jp_data/labour_v1`, freshness `jp-labour`). The press-release number is
  seasonally adjusted. `getData` returns the same series name for both, so
  `parseDashboardData` also requires `isSeasonal` class `2` (季調値) or `1`
  (原数値). Release dates live in `JP_LFS_RELEASES` (8:30 JST, through February
  2027 data on 30.03.2027); extend that map before May 2027 or freshness falls
  back to a day-of-month heuristic. The same page shows Monthly Labour Survey
  wages (`/api/jp/wages`, cache `jp_data/wages_v1`, freshness `jp-wages`):
  nominal total cash earnings y/y for establishments with 5 or more employees,
  and real wages versus CPI excluding imputed rent. The Dashboard print is the
  revised release (確報), not the flash. Dates are `JP_WAGE_FINAL_RELEASES`
  (8:30 JST, through December 2026 data on 26.02.2027). The page only peeks
  both caches. `/japonia/gospodarka` is METI industrial production
  (`/api/jp/industry`, cache `jp_data/industry_v1`, freshness `jp-industry`):
  the 2020-base seasonal index, month-on-month as in the revised release
  (13:30 JST, not the 8:50 flash), plus year-on-year from the unadjusted index.
  Dates are `JP_IIP_FINAL_RELEASES` through January 2027 data on 19.03.2027.
  The same page shows nominal retail sales (`/api/jp/retail`, cache
  `jp_data/retail_v1`, freshness `jp-retail`): the published level is in
  units of 1 billion yen. Year-on-year is computed from those levels only
  when both months are on or after January 2025 (census break). The retail
  final calendar is `JP_RETAIL_FINAL_RELEASES`, 13:30 JST, and it is not the
  same dates as industrial production. `/api/jp/gdp` (cache `jp_data/gdp_v1`,
  freshness `jp-gdp`) is real and nominal GDP, quarter-on-quarter, 2020 base,
  seasonally adjusted — the Cabinet Office headline, not the annualised rate.
  Quarterly `TimeFrom` is `20262Q00` (`Cycle=2`). Second-estimate dates are
  `JP_GDP_SECOND_RELEASES` at 8:50 JST. The same page shows the balance of
  payments (`/api/jp/trade`, cache `jp_data/trade_v3`, freshness `jp-trade`):
  current account, primary income, goods trade and services, not seasonally
  adjusted, in 億円 (divide by 10 for billions of yen). August 2026 preliminary
  (8 Oct, 8:50 JST) is a 4,062 billion yen surplus, a 5,133.2 billion yen
  primary-income surplus (+910.5 billion versus August 2025), a 687.7 billion
  yen trade deficit and a 115.8 billion yen services deficit (150.9 billion
  smaller than August 2025). The points stay `provisional`. The services name
  must exclude 貿易, because 貿易・サービス収支 contains サービス収支. Dates are
  `JP_BOP_RELEASES` at 8:50 JST through January
  2027 data on 08.03.2027. Extend that map before April 2027.
- Header from `xl`: sections inline, search is an icon (⌘K still works) — with
  the 220 px field the row did not fit the 1440 px container.
- Inside a `withCache(...)` fetcher, fetch upstream with `cache: 'no-store'`,
  not `next: { revalidate }`. The Next.js Data Cache is stale-while-revalidate,
  so the first request after expiry gets an old response that `withCache` then
  stores in Firestore with a fresh timestamp — even on cron `?refresh=1`. This
  froze NBP rates and Yahoo quotes for weeks in production. GUS BDL/DBW routes
  pass `gusFetchInit(force)` (`src/lib/upstream-fetch.ts`): the user path keeps
  `revalidate` (shared DBW limit), the cron path `?refresh=1` is `no-store` —
  otherwise a fresh GUS release reached the site a day or two late. Never cache
  NBP `.../today` under a fixed key; use `exchangerates/tables/{t}/` (latest table).
  After 12:15 on a working day `/api/nbp` re-checks an entry dated before today
  (`nbpBehindToday`, at most every 10 min): the 6 h TTL alone kept yesterday's
  table until the afternoon `nbp` cron whenever nobody visited 12:15–14:00.
- `withCache` never overwrites a good entry with a failure: if the fetcher
  throws it returns the last stored payload (any age), and an empty payload
  (`looksEmpty`: every top-level array empty) does not replace a non-empty one.
  An API can therefore answer 200 with old data — staleness is detected by the
  freshness check, not by HTTP errors. In GUS DBW/BDL routes `?refresh=1` forces the
  source only with `Authorization: Bearer CRON_SECRET` (`canForceUpstream`, `src/lib/access.ts`; crons and the
  freshness check send it via `internalInit`) or when no secret is set (dev, demo). A public `refresh=1` is a
  normal request: same cache key, normal TTL (ROADMAP 1b — two honest "Aktualizuj" clicks on CPI + PPI used to
  exceed the DBW limit and push a GUS release to the next day). The CPI/PPI "Aktualizuj" button only refetches
  our cache. Elsewhere `refresh=1` is still public. Either way a
  forced refresh (`maxAgeMs < 0`) reaches the source at most once per 10 min per
  cache key (`FORCED_REFRESH_MIN_AGE_MS`); a younger entry is served from cache.
  Routes pass `force ? -1 : ttl` — never `0`, which bypasses the limit.
  The per-key limit is not a GUS budget. A loop over one `gus-cpi-full` key still
  makes 64–128 DBW calls / 15 min, and all DBW keys together ~440–590 / 15 min
  against a limit of ~100. So GUS routes must never build a cache key or a period
  list from unvalidated query params. Since 1a (10.2026) they validate before any cache read or GUS call
  (`src/lib/gus-params.ts`, 400 + `no-store`): `year` only the current/previous Warsaw year (31.12 also the next),
  `/api/dbw-series` only the six series in `DBW_SERIES` (`src/lib/gus-dbw-series.ts`), `gus-monthly` only
  `years=4`, and `refresh=1` forces only the current year. Paths are built only in `src/lib/gus-api-paths.ts`
  (hooks send no year — the server decides, so a wrong phone clock can't get a 400); cron lists live in
  `src/lib/cron-endpoints.ts`; `tests/gus-params.test.ts` fails if a cron, freshness or hook path is rejected.
  `/api/gus-cpi` and `/api/dbw` have no reader and are blocked by validation, not deleted (owner's decision).
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
  `internalOrigin()` uses the canonical `SITE_URL` (https://savori.space,
  override `INTERNAL_BASE_URL`) — not `VERCEL_PROJECT_PRODUCTION_URL`, which
  picks the shortest production domain: savori.com, whose DNS is not on Vercel,
  `redirect: 'manual'`, and only a 2xx JSON answer counts as success.
  Every cron records its run in Firestore `health/cron_runs`
  (`src/lib/cron-log.ts`; evaluation in `src/lib/cron-runs.ts`), shown on
  `/status` — the only proof the automation actually ran. `vercel.json` → `functions` holds
  only the default `src/app/api/**/*.ts → maxDuration 30`. A long route sets its limit with
  `export const maxDuration` in its own file: Vercel prefers the export, and from `functions` it takes only the
  **first** matching pattern — every entry below the glob was dead, so `gus-cpi-full` ran with 30 s and the
  `dbw-1` cron got 504 until 10.2026. A cron's limit must be ≥ the sum of its routes' limits + 1.5 s spacing
  each + 10 s, or it is cut before it logs the run (`tests/function-limits.test.ts`).
- GUS DBW short-term indicators (industrial production, construction output,
  retail sales — y/y, constant prices, unadjusted = the GUS press-release
  number) are configured once in `src/lib/gus-dbw-series.ts` (`DBW_SERIES`, also the route's allowlist) and
  requested via `dbwSeriesPath(id)` (`src/lib/gus-api-paths.ts`), so hooks, the `dbw-4` warm cron and
  the freshness check hit the same `/api/dbw-series` cache key; a new series is a new `DBW_SERIES` entry. DBW variable 312
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
  Recency counts from the release that puts the number on the site: for CPI
  the full mid-month GUS release, not the end-of-month flash (events with
  `flash: true` are skipped — DBW never gets the flash, so dating CPI by it made
  a reading published today look 15 days old and it never got "Nowy odczyt").
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
