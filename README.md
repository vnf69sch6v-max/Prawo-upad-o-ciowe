# Savori

Platforma danych o polskiej gospodarce: **makro + rynki + newsy**. Wszystkie liczby pochodzą
z oficjalnych źródeł i odświeżają się automatycznie — bez danych wpisanych „na sztywno".

## Zakres

| Sekcja | Co zawiera |
|---|---|
| **Przegląd** | Kluczowe wskaźniki makro + pas rynków i newsów |
| **Ceny** | CPI (13 działów COICOP + podkategorie, 10 lat) i PPI (33 pozycje PKD, 10 lat) |
| **Gospodarka** | Aktywność, koniunktura, finanse publiczne, widok partii rządzących, korelacje |
| **Rynki** | Spółki WIG20 (kurs, opis, dopasowane newsy, nastroje rynku), indeksy WIG20 / mWIG40 / sWIG80, kursy NBP, WIBOR, surowce, obligacje, handel zagraniczny |
| **Praca / Regiony** | Rynek pracy, mapa województw, płace, bezrobocie |
| **Newsy** | Agregat polskich feedów finansowych, zwijanie przedruków, dopasowanie do wskaźników |
| **Publikacje / Samorząd** | Kalendarz publikacji GUS/NBP, dane usług publicznych (SMUP) |
| **Parser raportów** | Regułowa ekstrakcja metryk ze sprawozdań (10-Q / 10-K / NewConnect) wgranych jako PDF |

## Źródła danych

- **GUS BDL** (`/api/gus*`, `/api/bdl-series`) — wskaźniki makro i regionalne
- **GUS DBW** (`/api/dbw*`, `/api/gus-cpi-full`, `/api/gus-ppi-full`) — CPI, PPI, koniunktura
- **Eurostat** (`/api/eurostat`) — HICP, PKB, dług i deficyt, rentowności
- **NBP** (`/api/nbp`, `/api/nbp-rates`, `/api/wibor`) — kursy, stopy, złoto
- **Yahoo/Stooq** (`/api/stooq`, `/api/wig20`) — indeksy, spółki, surowce
- **SMUP** (`/api/smup`) — usługi publiczne w samorządach
- **RSS** (`/api/news`) — newsy finansowe z 8 zweryfikowanych feedów

## Parser raportów (`/parser`)

Jedyna sekcja, która **nie** pobiera danych z zewnętrznego źródła — czyta plik wgrany przez
użytkownika. PDF trafia do `/api/parser/parse`, gdzie `src/lib/parser/extract.ts` odtwarza układ
tabel z pozycji glifów (pdfjs, build „legacy", bez workera przeglądarkowego), a dalej regułowy
silnik dopasowuje pozycje sprawozdania po synonimach z `patterns.ts`. **Bez modelu językowego w
runtime i bez gałęzi per emitent** — te same reguły czytają 10-Q Microsoftu, stratny 10-Q Cipher
Digital i raport kwartalny NewConnect po polsku.

- Nic nie jest zapisywane: plik żyje tylko w pamięci żądania, w cache nie ląduje.
- Eksport (CSV / XLSX / JSON) idzie przez `/api/parser/export` — klient odsyła wynik, który już ma.
- `npm test` (vitest) sprawdza parser wobec czterech utrwalonych sprawozdań w `tests/fixtures/`, reguły świeżości danych (`tests/freshness.test.ts`) i ranking sygnałów hero na Przeglądzie (`tests/hero-signals.test.ts`).
  To jedyne testy w repozytorium; uruchamiaj je po każdej zmianie w `src/lib/parser/`.

## Automatyczne odświeżanie

Crony Vercela (`vercel.json`) rozgrzewają cache, żeby użytkownik nigdy nie czekał na zimne pobranie:

- `cron/dbw-1|4|2|3` — 09:40 / 11:40 / 13:40 / 15:40 UTC, czyli **po** komunikatach GUS (10:00 czasu PL),
  więc nowy odczyt trafia na stronę tego samego dnia. GUS DBW ma globalny limit ~100 żądań/15 min
  wspólny dla całej aplikacji, więc ciężkie pobrania są rozbite na grupy (≤77 żądań każda) co 2 h
  (odstęp wytrzymuje godzinną tolerancję startu cronów na Hobby). **Nie łącz ich w jedno** — to
  gwarantowany sztorm 429. `dbw-1` = CPI, `dbw-4` = produkcja, budowlanka, sprzedaż detaliczna.
- `cron/bdl` — 05:00, GUS BDL (bezrobocie, płace, regiony) **sekwencyjnie** (BDL bez klucza ~5 żądań/s)
- `cron/refresh` — 06:00, źródła spoza GUS (Eurostat, NBP, Yahoo, newsy; osobne limity, równolegle)
- `cron/freshness` — 16:40 UTC, kontrola świeżości wszystkich zbiorów + samonaprawa NBP/Yahoo/Eurostat
  i alert na `ALERT_WEBHOOK_URL`; wynik na stronie `/status` i pod `/api/health/freshness`
- każdy cron zapisuje swój przebieg w Firestore (`health/cron_runs`); `/status` pokazuje, kiedy
  który działał ostatnio i ile źródeł odświeżył — dowód, że dane aktualizują się same
- `cron/nbp` (13:00 UTC), `cron/stooq` (16:20 UTC, po zamknięciu GPW także zimą) — w dni robocze

Endpointy GUS przyjmują `?refresh=1` (wymusza pobranie z `no-store`, pomija Firestore i Data Cache
Next.js) — używa tego wyłącznie cron; użytkownik czyta 48-godzinny cache. Nieudane albo puste pobranie
nie nadpisuje poprzednich danych (`withCache`).

## Stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS 4 (tokeny `--color-mk-*`) ·
Recharts · React Query · Firebase Auth (opcjonalny) · cache w Firestore · Vercel

## Uruchomienie

```bash
npm install
npm run dev
npm test        # parser raportów, świeżość danych, ranking hero
```

Klucze API (`SMUP_API_KEY`, `SDP_API_KEY`, konfiguracja Firebase) trzymaj w `.env.local` —
plik jest w `.gitignore` i **nigdy nie trafia do repozytorium**. Bez kluczy Firebase aplikacja
działa w trybie demo (logowanie wyłączone), a cache serwerowy się nie zapisuje.

## Struktura

```
src/
├── app/
│   ├── page.tsx              # Przegląd
│   ├── ceny|gospodarka|rynki|praca|regiony|newsy|publikacje|samorzad/
│   ├── spolki/[ticker]/      # Strona spółki
│   └── api/                  # Proxy do źródeł + crony (cache-through)
├── components/
│   ├── shell/                # Nagłówek, nawigacja, stopka, paleta ⌘K
│   ├── ui/                   # KpiCard, wykresy, tabele, eksport CSV
│   ├── sections/             # Sekcje merytoryczne stron
│   └── parser/               # Widoki parsera raportów (tokeny `rp-*` w globals.css)
└── lib/
    ├── hooks.ts              # Hooki React Query dla wszystkich źródeł
    ├── dbw-fetch.ts          # Pobieranie z GUS DBW (limity, backoff 429)
    ├── server-cache.ts       # Cache-through na Firestore
    ├── calculations/         # Koszyk CPI, nowcasty, Taylor, kredyt
    ├── news/                 # Źródła RSS, parser, dopasowanie do wskaźników
    └── parser/               # Silnik parsera sprawozdań (ekstrakcja, wzorce, walidacja)
```

Trasy `/macro`, `/rates`, `/fx`, `/market`, `/trade`, `/labor`, `/nowcast`, `/dane`, `/tools`
oraz wycofane `/prognozy` to przekierowania na nową strukturę (zachowane dla starych linków).

## Plan rozwoju

Kolejka zadań i historia zmian: [`ROADMAP.md`](ROADMAP.md).
