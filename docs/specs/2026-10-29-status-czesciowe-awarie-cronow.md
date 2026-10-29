# 2: `/status` pokazuje częściowe awarie cronów i czas każdej trasy

- **Pozycja w backlogu:** ROADMAP 2 (Bezpieczeństwo i niezawodność, priorytet 3: wykrycie, że dane przestały się
  odświeżać). **Status:** w toku od 29.10.2026.
- **Dlaczego przed 1c:** 1c usuwa jedną przyczynę (limit BDL), ten krok wykrywa każdą. Daje też czasy tras. Bez nich
  nie da się uczciwie ustawić limitu crona `bdl` (1c) ani `jp`: 17 tras, suma limitów 640 s, `maxDuration` 120 s,
  28.10 przebieg trwał 78,1 s. Nadużycie z 1c wymaga dziś konta z dostępem (API jest za bramką od 25.10).
- **Stan produkcji 29.10, 19:21 UTC** (`/api/health/freshness`): 12/12 grup „Działa”, wszędzie `failed: []`. `dbw-1`:
  2/2 w 27,1 s, `refresh`: 55/55, `jp`: 17/17. Dziś nic nie jest zepsute. To przygotowanie przed P0 (13.11, CPI za październik).
- **Dane:** źródło się nie zmienia (dziennik `health/cron_runs`, szyfrowany `toStored`), więc weryfikacja na żywo nie jest potrzebna.

## 1. Problem i wartość
Właściciel patrzy na `/status`, żeby wiedzieć, czy dane odświeżają się same. `evaluateCronRuns` (`src/lib/cron-runs.ts`)
daje „Działa” przy `ok ≥ total/2`. Przez to `dbw-1` z `gus-cpi-full → 504` był zielony (1/2), `refresh` może zgubić
27 z 55 tras, a `jp` 8 z 17. Lista nieudanych tras jest ukryta przy „Działa”. Nagłówek strony mówi tylko o zbiorach.
Skutek dla czytelnika: odczyt GUS nie wchodzi w dniu publikacji i nikt tego nie widzi, dopóki zbiór nie zrobi się `stale`.

## 2. Reguły
- **R1 Stan `partial`** („Częściowo”, kolor i ikona `mk-warn` jak `lag`). Kolejność: brak wpisu → `never`. Wiek
  > `maxAgeHours` → `late`. `total > 0 && ok < total/2` → `failing`. `ok < total` → `partial`. Inaczej `ok`.
- **R2 `CronRun.routes?: { ep: string; ms: number }[]`** to czas każdego wywołania w kolejności listy crona.
  Mierzony wokół `internalCall`, bez odstępu `CRON_SPACING_MS`. `ep` bez parametru `refresh=1`, pozostałe parametry
  zostają (`bdl` ma pięć różnych `bdl-series`). Najwyżej 30 pozycji. Zapisuje `warmEndpoints`.
  `summarizeResults` dostaje opcjonalny czwarty argument, a wywołanie w `cron/refresh/route.ts` się nie zmienia (bez `routes`).
  Stare wpisy bez `routes` czytają się bez błędu. Rozmiar: ~60 pozycji × ~60 B w jednym dokumencie.
- **R3 `/api/health/freshness` → `crons.attention: string[]`** to grupy w stanie `partial`, `failing` i `late`. Bez `never`,
  bo nowa grupa czeka na pierwszy przebieg. Liczy je czysta funkcja `cronAttention(items)` w `cron-runs.ts`. Kod HTTP
  dalej zależy tylko od zbiorów (200/503, AGENTS.md). Typ `CronRunsSummary` jest w `cron-runs.ts`. W `src/lib/freshness.ts`
  zmienia się jedna linia: `crons?: CronRunsSummary`.
- **R4 Etykieta `jp`** zmienia się na „Japonia — wszystkie wskaźniki”, bo cron woła 17 tras JP, nie samo CPI.
- **R5 Pokrycie:** każdy cron z `vercel.json` ma grupę w `CRON_SPECS` albo jest na jawnej liście wyjątków w teście,
  z powodem: `gus` (cotygodniowe zapytanie do BDL, nic nie zapisuje) i `news-digest` (ROADMAP 4). Grupę odczytuje się
  z pliku trasy: `warmEndpoints(…, '<grupa>'` albo `recordCronRun('<grupa>'`.

## 3. Co widzi użytkownik (właściciel na `/status`)
Najpierw telefon 390 px, potem desktop 1440 px. Wszystko renderuje się po hydratacji (`StatusView` już czeka na `useIsClient`).
1. **Karta podsumowania** (góra strony). Gdy `attention` nie jest puste, pod „Sprawdzono …” pojawia się linia „Automat: 1 z 12 cronów
   wymaga uwagi — GUS — inflacja CPI”. Najwyżej 2 etykiety, dalej „i N innych”. Linia prowadzi do `#status-crons` i ma
   cel dotyku ≥44 px na telefonie. Tytuł o zbiorach się nie zmienia. Przy pustym `attention` linii nie ma.
2. **Wiersz crona.** Pigułka „Częściowo”. Linia „Ostatnio dziś 11:40 · 2/3 źródeł odświeżonych · 34,1 s” (`run.ms`).
   Przy `partial`, `failing` i `late` widać do 3 nieudanych tras (jak dziś przy „Błędy”). Gdy wpis ma `routes`, dochodzi
   „Najdłużej: /api/gus-cpi-full 24,9 s” (jedna trasa, przecinek dziesiętny, `[overflow-wrap:anywhere]`).
3. Tekst linii i formatowanie czasu robią czyste funkcje w `cron-runs.ts`: `attentionLine(items)`, `slowestRoute(run)`
   i `formatSeconds(ms)`. Dzięki temu da się je sprawdzić testem bez przeglądarki.

## 4. Kryteria akceptacji (bez sieci)
1. `tests/cron-runs.test.ts`: 2/2 → `ok`; 1/2 → `partial` (dawny zielony `dbw-1`); 54/55 → `partial`; 30/40 → `partial`
   (dotychczasowa asercja „30/40 = ok” zmieniona świadomie); 10/40 → `failing`; 0/2 → `failing`; `partial` starszy
   niż 26 h → `late`; brak wpisu → `never`.
2. `summarizeResults` z czasami: `routes` w kolejności wywołań i bez `refresh=1` (`/api/bdl-series?start=461680&count=12`).
   Przy 31 trasach jest 30 pozycji. Bez czwartego argumentu wpis nie ma klucza `routes`.
3. `warmEndpoints` z podstawionymi `internalCall` i `recordCronRun` (vi.mock), z odstępem 0: zapisany przebieg ma po
   jednej pozycji w `routes` na endpoint, w kolejności listy, każda z `ms ≥ 0`.
4. `cronAttention`: zawiera grupy `partial`, `failing` i `late`, pomija `ok` i `never`. `attentionLine`: przy pustej
   liście `null`. Przy jednej grupie zdanie z p. 3.1. Przy 4 grupach 2 etykiety i „i 2 inne”, z poprawną odmianą
   (`pluralPl`). `formatSeconds(24_900)` → „24,9 s”. `slowestRoute` bez `routes` → `null`.
5. Test pokrycia (R5) jest dwustronny. Każda ścieżka `/api/cron/*` z `vercel.json` ma grupę w `CRON_SPECS` albo wyjątek
   z listy. Każda grupa `CRON_SPECS` ma swój cron (`rynki` ← `stooq`, `rynki-intraday` ← `stooq-intraday`). Nowy cron
   bez wpisu daje czerwony test.
6. `CRON_SPECS.jp.label` = „Japonia — wszystkie wskaźniki”. `STYLE` w `CronRuns.tsx` ma `partial`, co wymusza
   `Record<CronRunStatus, …>` przez `tsc`.
7. `npx tsc --noEmit`, `npm test` i eslint zmienionych plików przechodzą czysto. Przy recenzji: zrzut `/status` 390 i
   1440 px z podstawionym raportem (np. `?mock` tylko w dev albo test komponentu) **albo** uzasadnienie, że tekst
   pokrywają testy z p. 4.
8. **Po wdrożeniu** (produkcja, nie warunek merge): po najbliższym `dbw-1` (09:40 UTC) `crons.items[dbw-1].run.routes`
   ma 2 pozycje, a `crons.attention` = `[]`. 13.11 (P0) czas `gus-cpi-full` z `routes` trafia do ROADMAP.

## 5. Pliki
- **Zmieniane:** `src/lib/cron-runs.ts`, `src/lib/cron-warm.ts`, `src/components/status/CronRuns.tsx`,
  `src/components/status/StatusView.tsx` (tylko `Summary`), `src/app/api/health/freshness/route.ts`,
  `src/lib/freshness.ts` (tylko linia typu `crons`), `tests/cron-runs.test.ts`, nowy `tests/cron-coverage.test.ts`
  (albo w tym samym pliku), `AGENTS.md` (zdanie o `partial` i `attention` w punkcie o cronach), `docs/ROADMAP.md`.
- **Nie dotykać** (tu pracuje Cursor): `src/app/api/cron/refresh/route.ts`, `src/app/api/cron/jp/route.ts`,
  `src/lib/jp/**`, `src/app/api/jp/**` i `FRESHNESS_DATASETS` w `src/lib/freshness.ts`.

## 6. Lekcje z `docs/PRODUCT.md`
- [x] Dziennik cronów — ten krok go naprawia: przebieg z jedną padniętą trasą przestaje być „Działa”.
- [x] Crony przez `internal-fetch`: bez zmian. Mierzymy tylko czas `internalCall`.
- [x] Nic zależnego od „dziś” przed hydratacją: `formatStatusWhen` i nowa linia renderują się dopiero z `report`, czyli po `useIsClient`.
- [x] Telefon 320/390 px: długie ścieżki łamią się (`overflow-wrap`), link w karcie ma ≥44 px.
- n/d: liczba z komunikatu, metodologia, kalendarz, `refresh=1`, nowe źródło lub CSP, dane użytkownika.

## 7. Poza zakresem
- Alert `ALERT_WEBHOOK_URL` dla `attention` (krok 2b, gdy właściciel ustawi webhook) i zmiana kodu HTTP.
- Czasy tras crona `refresh`: wywołania równoległe, a plik należy do Cursora.
- Zapis przebiegu `news-digest` (ROADMAP 4), walidacja BDL i limit crona `bdl` (1c), podział crona `jp`.

## 8. Działania właściciela
Nic nie blokuje tego kroku. Opcjonalnie: darmowy monitor słowa kluczowego (np. UptimeRobot) na
`https://savori.space/api/health/freshness` ze słowem `"attention":[]`. `/api/health/*` jest publiczne.
