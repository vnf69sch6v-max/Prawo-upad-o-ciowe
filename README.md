# Savori

Platforma danych o polskiej gospodarce: **makro + rynki + newsy**. Wszystkie liczby pochodzą
z oficjalnych źródeł i odświeżają się automatycznie — bez danych wpisanych „na sztywno".

## Zakres

| Sekcja | Co zawiera |
|---|---|
| **Przegląd** | Kluczowe wskaźniki makro + pas rynków i newsów |
| **Ceny** | CPI (13 działów COICOP + podkategorie, 10 lat) i PPI (33 pozycje PKD, 10 lat) |
| **Gospodarka** | Aktywność, koniunktura, finanse publiczne, widok partii rządzących, korelacje |
| **Rynki** | WIG20 / mWIG40 / sWIG80, spółki WIG20, kursy NBP, WIBOR, surowce, obligacje |
| **Praca / Regiony** | Rynek pracy, mapa województw, płace, bezrobocie |
| **Prognozy** | Nowcast CPI z koszyka, nowcast PKB, reguła Taylora, symulator kredytu |
| **Newsy** | Agregat polskich feedów finansowych, zwijanie przedruków, dopasowanie do wskaźników |
| **Publikacje / Samorząd** | Kalendarz publikacji GUS/NBP, dane usług publicznych (SMUP) |

## Źródła danych

- **GUS BDL** (`/api/gus*`, `/api/bdl-series`) — wskaźniki makro i regionalne
- **GUS DBW** (`/api/dbw*`, `/api/gus-cpi-full`, `/api/gus-ppi-full`) — CPI, PPI, koniunktura
- **Eurostat** (`/api/eurostat`) — HICP, PKB, dług i deficyt, rentowności
- **NBP** (`/api/nbp`, `/api/nbp-rates`, `/api/wibor`) — kursy, stopy, złoto
- **Yahoo/Stooq** (`/api/stooq`, `/api/wig20`) — indeksy, spółki, surowce
- **SMUP** (`/api/smup`) — usługi publiczne w samorządach
- **RSS** (`/api/news`) — newsy finansowe z 8 zweryfikowanych feedów

## Automatyczne odświeżanie

Crony Vercela (`vercel.json`) rozgrzewają cache, żeby użytkownik nigdy nie czekał na zimne pobranie:

- `cron/dbw-1|2|3` — 03:00 / 03:30 / 04:00, **rozłączne okna**. GUS DBW ma globalny limit
  ~100 żądań/15 min wspólny dla całej aplikacji, więc ciężkie pobrania są rozbite na trzy grupy
  (≤77 żądań każda). **Nie łącz ich z powrotem w jedno** — to gwarantowany sztorm 429.
- `cron/refresh` — 06:00, źródła spoza DBW (osobne limity, równolegle)
- `cron/nbp`, `cron/stooq` — w dni robocze po sesji

Endpointy DBW przyjmują `?refresh=1` (wymusza pobranie, pomija cache) — używa tego wyłącznie cron;
użytkownik czyta 48-godzinny cache.

## Stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS 4 (tokeny `--color-mk-*`) ·
Recharts · React Query · Firebase Auth (opcjonalny) · cache w Firestore · Vercel

## Uruchomienie

```bash
npm install
npm run dev
```

Klucze API (`SMUP_API_KEY`, `SDP_API_KEY`, konfiguracja Firebase) trzymaj w `.env.local` —
plik jest w `.gitignore` i **nigdy nie trafia do repozytorium**. Bez kluczy Firebase aplikacja
działa w trybie demo (logowanie wyłączone), a cache serwerowy się nie zapisuje.

## Struktura

```
src/
├── app/
│   ├── page.tsx              # Przegląd
│   ├── ceny|gospodarka|rynki|praca|regiony|prognozy|newsy|publikacje|samorzad/
│   ├── spolki/[ticker]/      # Strona spółki
│   └── api/                  # Proxy do źródeł + crony (cache-through)
├── components/
│   ├── shell/                # Nagłówek, nawigacja, stopka, paleta ⌘K
│   ├── ui/                   # KpiCard, wykresy, tabele, eksport CSV
│   └── sections/             # Sekcje merytoryczne stron
└── lib/
    ├── hooks.ts              # Hooki React Query dla wszystkich źródeł
    ├── dbw-fetch.ts          # Pobieranie z GUS DBW (limity, backoff 429)
    ├── server-cache.ts       # Cache-through na Firestore
    ├── calculations/         # Koszyk CPI, nowcasty, Taylor, kredyt
    └── news/                 # Źródła RSS, parser, dopasowanie do wskaźników
```

Trasy `/macro`, `/rates`, `/fx`, `/market`, `/trade`, `/labor`, `/nowcast`, `/dane`, `/tools`
to przekierowania na nową strukturę (zachowane dla starych linków).

## Plan rozwoju

Kolejka zadań i historia zmian: [`ROADMAP.md`](ROADMAP.md).
