# CPI — szybki szacunek GUS w dniu publikacji (ROADMAP 7, krok 1)

Prośba właściciela z 02.11.2026. Status: **w toku** (PLAN 02.11.2026).

## Problem i wartość
GUS 30.10.2026 podał szybki szacunek: październik **3,5% r/r, −0,4% m/m** (wrzesień, pełne dane: 4,1%; konsensus PAP 3,7%).
Trzy dni później `/ceny` i hero Przeglądu dalej pokazują 4,1% za wrzesień, bo DBW dostaje tylko pełny odczyt (13.11).
`/api/health/freshness` mówi `cpi = ok` — z punktu widzenia użytkownika serwis jest 14 dni za rynkiem i o tym nie wie.
Użytkownik w dniu flasha pyta: „ile wyniosła inflacja i czy spada?” — odpowiedź ma być tego samego dnia, podpisana jako wstępna.

## Co widzi użytkownik
**Przegląd `/` (telefon 320–430 px, potem desktop):** karta CPI w hero pokazuje `3,5%` z plakietką „Wstępne” i podpisem
„Październik 2026 · szybki szacunek GUS, 30.10 · pełne dane 13.11”. Delta: „−0,6 pp vs wrzesień (4,1%)”. W dniu flasha
CPI dostaje „Nowy odczyt” (recency od 30.10, nie od 13.11).
**`/ceny` (zakładka inflacja):** nagłówek: wniosek („Inflacja spadła do 3,5% — w górnej granicy pasma celu NBP 1,5–3,5%”),
liczba 3,5% r/r i −0,4% m/m z tym samym podpisem, pod nią 3 wiersze z komunikatu (żywność i napoje bezalkoholowe −0,1% r/r /
+0,3% m/m; energia elektryczna, gaz i inne paliwa +6,0% / +1,6%; paliwa do prywatnych środków transportu +21,7% / −9,7%).
Na wykresie ostatni punkt jest odróżniony (pusty znacznik / przerywany odcinek) z tooltipem „szybki szacunek”. Działy i klasy
COICOP zostają na wrześniu z podpisem „Rozbicie: wrzesień 2026 (pełne dane)” — nie mieszamy miesięcy bez podpisu.
Link „Komunikat GUS” do strony komunikatu. Desktop 1280/1440: ten sam porządek, podgrupy w jednym rzędzie.
**Po pełnym odczycie** (DBW ma 2026-10): wszystko wraca do DBW, plakietka znika, a jeśli pełna liczba ≠ flash, podpis
„Szybki szacunek: 3,5%” przy liczbie przez 7 dni (rewizje się zdarzają: wrzesień flash 4,0% → pełne 4,1%).

## Dane (sprawdzone 02.11.2026)
- **Źródło:** stat.gov.pl, komunikat „Szybki szacunek wskaźnika cen towarów i usług konsumpcyjnych w październiku 2026 r.”
  `https://stat.gov.pl/obszary-tematyczne/ceny-handel/wskazniki-cen/szybki-szacunek-wskaznika-cen-towarow-i-uslug-konsumpcyjnych-w-pazdzierniku-2026-r-,21,46.html`
  (data na stronie: 30.10.2026). Bez klucza, bez limitu deklarowanego; nie DBW, więc nie zjada limitu ~100/15 min.
- **Wzorzec URL:** `…/wskazniki-cen/szybki-szacunek-wskaznika-cen-towarow-i-uslug-konsumpcyjnych-{w|we}-{miesiąc w miejscowniku bez
  ogonków}-{rrrr}-{r-|roku},21,{n}.html`; `n` rośnie o 1 (wrzesień 2026 = 45, październik = 46). **Nie budować URL-a** (końcówka
  `r-`/`roku` i `w`/`we` się zmieniają, a nazwy załączników też: `…_2026.xlsx` vs `…_2026_r_tablice.xlsx`). Odkrywanie: strona działu
  `https://stat.gov.pl/obszary-tematyczne/ceny-handel/wskazniki-cen/` → linki `szybki-szacunek-wskaznika-cen-towarow-i-uslug-konsumpcyjnych-…`,
  miesiąc/rok z tytułu, **bierzemy maksimum (rok, miesiąc), nie pierwszy link** (strona działu linkuje też czerwiec 2022).
  Strona komunikatu ma też pełną listę archiwum. RSS GUS (`/rss/pl/rss.xml`) — 0 pozycji, nieużywalne. DBW/BDL wariantu
  wstępnego nie mają (`cpi` w świeżości = 2026-09 po crone `no-store` 30.10–02.11).
- **Frazy (HTML, akapit pod datą):** „Ceny towarów i usług konsumpcyjnych według szybkiego szacunku w październiku 2026 r. wzrosły
  o 3,5% (wskaźnik cen 103,5) w porównaniu z analogicznym miesiącem ub. roku, a w porównaniu z poprzednim miesiącem spadły o 0,4%
  (wskaźnik cen 99,6).” Parsować **wskaźniki** (1. „wskaźnik cen X” = r/r, 2. = m/m; wartość = X − 100), nie czasowniki: grudzień
  2025 ma „pozostały na niezmienionym poziomie (wskaźnik cen 100,0)”, `&nbsp;` i dzielenie „ana-logicznym”. Okres z frazy
  „w {miesiącu} {rrrr} r.” i z tytułu `<h1>` — muszą się zgadzać. Kontrola: |„o N%” − |X−100|| < 0,05, gdy „o N%” jest.
- **XLSX „Tablice”** (link po etykiecie „Tablice w formacie XLSX”, ~17 KB): `A1` „Tablica 1. Szybki szacunek … w październiku 2026 r.”,
  `B3` „10 2026”, `B4` „10 2025=100”, `C4` „09 2026=100”; wiersze `OGÓŁEM 103.5 / 99.6`, `Żywność i napoje bezalkoholowe 99.9 / 100.3`,
  `Energia elektryczna, gaz i inne paliwa 106 / 101.6`, `Paliwa i smary do prywatnych środków transportu 121.7 / 90.3`.
  `OGÓŁEM` z XLSX musi = wskaźniki z HTML, inaczej podgrupy pomijamy (headline zostaje).
- **Kontrola niezależna:** bank.pl 30.10.2026 09:56 („3,5% (wskaźnik cen 103,5)… −0,4% m/m”, żywność −0,1/+0,3, energia 6,0/1,6,
  paliwa 21,7/−9,7); finwire.pl (3,5% vs wrzesień 4,1%). Wrzesień 2026 flash (30.09): 4,0% r/r, +0,7% m/m (pełne: 4,1%).
- **Metodologia:** od 2026 COICOP 2018 (dopisek w PDF) — ta sama co DBW 2026 w `gus-cpi-full`.
- **Kalendarz:** flash = ostatni dzień roboczy miesiąca **tylko za marzec–grudzień** — za styczeń i luty GUS flasha nie publikuje
  (archiwum 2023–2026: grudzień → marzec). Dziś `generateMacroCalendar` tworzy flash dla 12 miesięcy — błąd do poprawy w tym kroku.
  Listopad 2026: **30.11 (pn)**, grudzień: **31.12 (cz)** (grudzień 2025 był 31.12). Pełny odczyt za październik: **13.11.2026 (pt)**
  — w kodzie i w finwire/bank.pl (wyszukiwarka); artykuł bank.pl pisze „14 listopada”, ale 14.11.2026 to sobota (data z 2025 r.).
  Kalendarz roczny GUS online sięga dziś tylko dni już minionych, więc 13.11 nie jest potwierdzone u źródła — dlatego powrót do DBW
  jest **sterowany danymi** (DBW ma miesiąc ≥ flash), nie datą. Godzina: przyjmujemy 10:00 Warszawy (`GUS_RELEASE_MINUTES`);
  kalendarium GUS pisze „Opracowania sygnalne od 18.03.2026 o 9:30”, artykuł bank.pl był o 09:56 — patrz Poza zakresem.
- **Trasa:** `GET /api/gus-cpi-flash` (bez parametrów; nieznany parametr = 400 `no-store`, jak `gus-params`).
  Odpowiedź: `{ period:'2026-10', yoy:3.5, mom:-0.4, indexYoy:103.5, indexMom:99.6, publishedOn:'2026-10-30', fullReleaseOn:'2026-11-13',
  url, groups:[{ name, yoy, mom }], source:'GUS, szybki szacunek' }`. `withCache('macro_data', 'gus_cpi_flash_v1', …)` →
  `toStored`; fetcher `cache:'no-store'`, `User-Agent` serwisu, timeout 10 s, maks. 3 żądania (dział, komunikat, XLSX).
  TTL 6 h; w dzień flasha od 10:00 Warszawy wpis z okresem < miesiąc flasha jest sprawdzany ponownie najwyżej co 10 min
  (wzór `nbpBehindToday`). `refresh=1` → `-1` (limit 10 min na klucz, `FORCED_REFRESH_MIN_AGE_MS`). `export const maxDuration = 15`.
- **Walidacja (rzuca → `withCache` zwraca stary wpis):** tytuł zawiera „Szybki szacunek wskaźnika cen towarów i usług konsumpcyjnych”;
  miesiąc w tytule = miesiąc w akapicie; okres ≤ bieżący miesiąc Warszawy i ≥ poprzedni; r/r ∈ [−5, 30], m/m ∈ [−5, 5]; 2 wskaźniki.
- **Scalanie (czysta funkcja `src/lib/cpi-flash.ts`, bez React):** `mergeCpiHeadline(dbwHeadline, flash)` — jeśli `flash.period` >
  ostatni miesiąc DBW z r/r, dokłada punkt `{ date, yoy, mom, provisional:true }`; w przeciwnym razie zwraca DBW bez zmian.
  Jedna funkcja dla `/ceny`, hero, digestu i świeżości. Strony czytają przez hook `useCpiFlash` → własne API (jak `useCpiFull`);
  żadnego fetchu stat.gov.pl w renderze strony; CSP bez zmian (fetch tylko serwerowy).
- **Świeżość:** nowy `DatasetSpec` `cpi-flash` („Inflacja CPI — szybki szacunek”, źródło „GUS, komunikat”, grupa `gus`,
  `selfHeal: true` — to nie DBW/BDL), endpoint `/api/gus-cpi-flash`, `expected` = miesiąc ostatniego flasha, którego dzień
  (≥10:00 Warszawy) już minął; w styczniu–lutym = grudzień. `tolerance {ok:0, lag:0}` (brak flasha po 10:00 = `stale`),
  `maxAgeDays 100`. `cpi` (DBW) bez zmian — mierzy pełny odczyt (P0 13.11).
- **Cron:** `gusCpiFlashPath(R)` jako **pierwsza** pozycja `dbw-1` (09:40 UTC; okno Hobby 09:00–09:59 UTC = po 10:00 Warszawy
  w CET i CEST), więc wolny `gus-cpi-full` jej nie zablokuje. `dbw-1` `maxDuration` 200 → **220** (120+60+15+3×1,5+10 = 209,5;
  `tests/function-limits.test.ts`). Ścieżka tylko w `src/lib/gus-api-paths.ts`. Dziennik: `health/cron_runs.dbw-1.routes` ma 3 pozycje.
- **Atrybucja:** „Źródło: GUS, szybki szacunek (komunikat z DD.MM.RRRR)” + link do komunikatu, przy każdej liczbie z flasha.

## Lekcje zastosowane
- [x] Liczba = komunikat (3,5 / −0,4 sprawdzone w bank.pl i finwire). [x] Baza: COICOP 2018, jak DBW 2026.
- [x] Kalendarz z godziną; recency od publikacji widocznej liczby (flash dla punktu wstępnego, pełne dla DBW).
- [x] `no-store` w fetcherze; cron `refresh=1`; dziennik. [x] Cron przez `internal-fetch` (`dbw-1` już tak działa).
- [x] `refresh=1` z limitem 10 min. [x] Trasa bez parametrów (400 na nieznane). [x] `maxDuration` w pliku + suma crona.
- [x] Świeżość `cpi-flash`. [x] Daty „pełne dane DD.MM” i „Nowy odczyt” po `useIsClient()`. [x] 320/390/1440 px.
- [x] CSP bez zmian. [ ] Dane użytkownika — nie dotyczy.

## Kryteria akceptacji
1. `tests/cpi-flash.test.ts`: parser z `tests/fixtures/gus-cpi-flash-2026-10.html` → `{ period:'2026-10', yoy:3.5, mom:-0.4, indexYoy:103.5, indexMom:99.6, publishedOn:'2026-10-30' }`.
2. Ten sam parser: `gus-cpi-flash-2026-09.html` → 2026-09, 4,0 / 0,7; `gus-cpi-flash-2025-12.html` → 2025-12, 2,4 / 0,0 („niezmienionym”, `&nbsp;`, „ana-logicznym”).
3. XLSX `gus-cpi-flash-2026-10.xlsx` → 3 grupy dokładnie jak w „Dane”; `…-2026-09.xlsx` → żywność 99,5/100,1, energia 104,9/100,9, paliwa 136,1/109,2.
4. Parser rzuca przy: innym tytule (np. komunikat PPI), miesiącu w tytule ≠ w akapicie, r/r spoza [−5, 30], m/m spoza [−5, 5], braku drugiego wskaźnika.
5. Odkrywanie z `gus-wskazniki-cen-2026-11-02.html` wybiera link października 2026 (`,21,46`), nie czerwca 2022.
6. `mergeCpiHeadline`: DBW do 2026-09 + flash 2026-10 → ostatni punkt 2026-10, 3,5, `provisional`; DBW z 2026-10 + flash 2026-10 → DBW bez punktu wstępnego.
7. Kalendarz: `generateMacroCalendar(2026)` nie ma flasha za styczeń i luty; flash za 10.2026 = 2026-10-30, za 11.2026 = 2026-11-30.
8. Świeżość (`tests/freshness.test.ts`): `cpi-flash` expected 2026-10 dla 30.10.2026 10:00 i 02.11; 2026-09 dla 30.10 09:59; 2025-12 dla 15.02.2026; odpowiedź z 2026-09 po 30.10 10:00 = `stale`.
9. Hero (`tests/hero-signals.test.ts`): CPI z punktem wstępnym 2026-10 ma `publicationDate` 2026-10-30 i plakietkę „Nowy odczyt” 30.10; ten sam okres z DBW → 2026-11-13.
10. Digest (`daily-macro`): 30.10.2026 daje `cpi-yoy` = „3,5%”, delta −0,6 pp, `source: 'GUS, szybki szacunek'`; 13.11 — wartość z DBW.
11. `GET /api/gus-cpi-flash?x=1` → 400 `no-store` bez zapisu; `tests/gus-params.test.ts` przepuszcza ścieżkę z `dbw-1`.
12. `tests/function-limits.test.ts` zielony z `dbw-1` = 220 s; `tests/cron-runs.test.ts` zielony.
13. Lokalnie (demo) `curl localhost:3000/api/gus-cpi-flash` → 3,5 / −0,4 / 2026-10 (źródło na żywo); drugi `refresh=1` w ciągu 10 min nie robi żądania do stat.gov.pl (log).
14. Zrzuty 390 i 1440 px Przeglądu i `/ceny`: 3,5% z „Wstępne” i „szybki szacunek GUS, 30.10 · pełne dane 13.11”, źródło z linkiem; 0 przewijania w bok, 0 błędów konsoli/CSP, 0 #418.
15. `npx tsc --noEmit`, `npm test`, eslint zmienionych plików, `npm run build` — czysto.
16. Produkcja: `/api/health/freshness` → `cpi-flash` = ok 2026-10; 13.11 po `dbw-1` strona pokazuje DBW (zapis w P0); 30.11 do 11:00 UTC flash za listopad na stronie.

## Poza zakresem
- Podgrupy flasha na wykresie historii (tylko 3 wiersze bieżącego miesiąca); flash PKB.
- Godzina publikacji GUS 9:30 vs 10:00 (`GUS_RELEASE_MINUTES`) — osobna pozycja ROADMAP (P1), dotyczy wszystkich zbiorów GUS.
- Błędy dat w `calendar-schedules.ts` znalezione przy weryfikacji (kalendarz roczny GUS): CPI 15.09 (kod 14.09) i 14.10 (kod 15.10);
  produkcja 18.09 (kod 21.09); sprzedaż 24.08, 22.09, 22.10 (kod 20.08, 21.09, 20.10) — ROADMAP P1, nie w tym kroku.

## Działania właściciela
Brak. Źródło publiczne, bez klucza; zmiana nie dotyczy danych użytkowników (bez zmian w `/prywatnosc`).
