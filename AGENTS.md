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

There is no automated test runner configured (no `test` script, no test files).

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
