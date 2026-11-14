# P4 — Bezrobocie rejestrowane z DBW (liczba w hero Przeglądu w dniu komunikatu GUS)

Data specyfikacji: 13.11.2026. Rozmiar: jeden krok, ~150–250 linii wraz z testami.

Status: zrobione 14.11.2026, PR #99 (review: SHIP).

## Problem i wartość
Stopa bezrobocia rejestrowanego stoi w hero Przeglądu i na `/praca`. Idzie z BDL (`bdl-series?start=461680`),
które dostaje odczyt tygodnie po komunikacie GUS. Freshness pokazuje `unemployment` = `lag`. Użytkownik widzi
„sierpień”, gdy GUS podał już wrzesień (komunikat z 23.10), a ranking hero (`rankHeroSignals`) nie daje temu
odczytowi „Nowy odczyt”. Ten sam wzorzec naprawiliśmy dla produkcji, budownictwa i sprzedaży (DBW zamiast BDL).

## Co widzi użytkownik
- Przegląd (390 i 1440 px): kafel „Stopa bezrobocia” ze stopą z najnowszego miesiąca komunikatu GUS, podpis
  `rejestrowane · wrzesień 2026` (dziś sierpień), zmiana w pp liczona względem poprzedniego miesiąca.
- `/praca?tab=bezrobocie`: ta sama seria, ta sama ostatnia liczba co na Przeglądzie (spójność).
- Wygląd bez zmian: zmienia się źródło, nie układ. Stopka źródła: „GUS DBW”.

## Dane (zweryfikowane na żywo 13.11.2026)
- Źródło: GUS DBW `https://api-dbw.stat.gov.pl/api/1.1.0`, bez klucza.
- Zmienna **875** „Stopa bezrobocia rejestrowanego”, przekrój **143** „Polska, województwa, powiaty”,
  pozycja Polska **33617** (`id-pozycja-1`; przekrój ma jeden wymiar, więc brak `id-pozycja-2` — trasa
  `/api/dbw-series` zakłada `poz` w `id-pozycja-2`, więc wymaga małego rozszerzenia, patrz Pliki).
- Miara: `id-sposob-prezentacji-miara` **95** = „[%]”, „relacja; szereg niewyrównany; nie dotyczy”.
- `id-okres` miesięczny = 246 + M (jak w trasie: 255 = wrzesień). Odpowiedź: ~397 wierszy (powiaty), jedna strona
  (`ile-na-stronie=5000`), ~100 KB.
- Ostatni odczyt: 2026-09 = **5,8%**, 2026-08 = **5,8%**. 2026-10 (okres 256) = 404 (jeszcze nie ma).
- Kontrola niezależna: wyszukiwanie 13.11 — komunikat GUS z 23.10.2026: wrzesień 5,8%, tyle samo co w sierpniu,
  rok wcześniej 5,6% (superbiz.se.pl, kadry.infor.pl, xyz.pl). **Do powtórzenia przez inżyniera** przy wdrożeniu
  (jedna krótka kontrola `curl` na okres 255).
- Kalendarz: `UNEMPLOYMENT_PUBLISH` (`src/lib/calendar-schedules.ts`) ma dla września datę 2026-10-26, a faktyczny
  komunikat był 23.10. Sprawdzić na stat.gov.pl (harmonogram) daty 11 i 12.2026 (dziś 25.11 i 23.12) i poprawić
  jawnie; błędna data o dzień nie psuje freshness (tolerancja), ale psuje „Nowy odczyt”.
- Świeżość: `DatasetSpec` `unemployment` zmienia `kind` na `gus-dbw`, `endpoint: dbwSeriesPath('unemployment', now)`
  (identyczny z hookiem), `selfHeal: false`, `expected` bez zmian. Rozważyć `maxAgeDays: 100`.
- Cron: dopisać `dbwSeriesPath('unemployment', R)` do grupy `dbw-3` (15:40 UTC, dziś ~48 → ~72 wywołania,
  w limicie ≤~80 na okno 15 min; **nie** nowa grupa, więc `vercel.json` i `CRON_SPECS` bez zmian). Zaktualizować
  komentarz o liczbie wywołań i `maxDuration` (reguła: limit crona ≥ suma limitów tras + 1,5 s × trasa + 10 s,
  `tests/function-limits.test.ts`).
- Klucz cache: `dbwSeriesCacheKey('unemployment', year)` (format `dbwser_875_143_33617_{rok}_m_95_v3`).
  Bez `prez` w `DbwSeriesConfig` domyślnie 5, tu potrzebne 95 — dodać pole lub użyć istniejącego `prez: 95`.
- Atrybucja: bez zmian („Źródło: GUS”). Seria BDL 461680 zostaje jako fallback tylko jeśli hook tak już działa;
  w przeciwnym razie usunąć z `bdl` crona (oszczędza 12 wywołań BDL).

## Pliki (szacunek)
- `src/lib/gus-dbw-series.ts`: wpis `unemployment` w `DBW_SERIES` (var 875, przekroj 143, poz [], prez 95).
  Trasa `/api/dbw-series/route.ts`: gdy `poz` puste, brak filtra `id-pozycja-2`; test na tej gałęzi.
- `src/lib/gus-params.ts`: nic (allowlista = `DBW_SERIES`), ale `tests/gus-params.test.ts` ma przejść z nową serią.
- `src/lib/hooks.ts` (`useGusRegisteredUnemployment`, ew. `useUnemploymentMonthly`) → `dbwSeriesPath('unemployment')`.
- `src/app/page.tsx` i `PracaDashboard.tsx`: brak zmian, jeśli kształt `{date, value}` zgodny.
- `src/lib/freshness.ts`, `src/lib/cron-endpoints.ts`, `src/lib/calendar-schedules.ts`.
- Testy: `tests/gus-params.test.ts`, `tests/freshness.test.ts`, nowy test mapowania wierszy DBW → seria
  (fixture JSON utrwalony z dzisiejszej odpowiedzi, bez sieci).

## Lekcje zastosowane (PRODUCT.md)
- [x] Hooki, cron i freshness budują ścieżkę w jednym miejscu (`dbwSeriesPath`).
- [x] Walidacja parametrów przed cache i GUS (allowlista `DBW_SERIES`), brak nowych parametrów zapytania.
- [x] Nazwa zmiennej zweryfikowana w katalogu (875 „Stopa bezrobocia rejestrowanego”), nie zgadnięta.
- [x] Budżet DBW policzony (~72 w oknie 15:40), bez nowego crona.
- [x] Nic od „teraz” przed hydratacją; podpis okresu z danych.

## Kryteria akceptacji
1. `curl` na okres 255 (zm. 875, przekrój 143, Polska) daje 5,8 — zapisane w opisie PR wraz z linkiem do komunikatu.
2. `DBW_SERIES.unemployment` istnieje; `GET /api/dbw-series?...unemployment` (ścieżka z `dbwSeriesPath`) przechodzi walidację,
   a inne nieznane serie nadal 400 (`npm test`, `tests/gus-params.test.ts`).
3. Test na fixturze: wiersze z 397 pozycjami → seria zawiera `{ date: '2026-09', value: 5.8 }`, brak punktu dla 2026-10
   (404 pominięty, nie zero).
4. Przegląd i `/praca`: ostatni punkt i podpis okresu pochodzą z tej samej serii; podpis `wrzesień 2026` (Playwright 390 i 1440,
   zrzuty do review). Zmiana w pp = 0,0 (5,8 vs 5,8) wyświetlona poprawnie, nie „—”.
5. `DatasetSpec` `unemployment`: `endpoint` równy ścieżce hooka (test w `tests/freshness.test.ts`), status `ok` przy 2026-09 i dacie
   2026-11-13; `lag`/`stale` po dacie komunikatu 25.11 bez nowego miesiąca.
6. `dbw-3` zawiera nową ścieżkę; `tests/cron-runs.test.ts`, `tests/function-limits.test.ts` i `tests/gus-params.test.ts` zielone;
   liczba wywołań w komentarzu ≤ ~80.
7. `UNEMPLOYMENT_PUBLISH` poprawione wg harmonogramu GUS albo opisane w PR, że nie znaleziono źródła.
8. Po wdrożeniu: `/api/health/freshness` → `unemployment` = `ok`, `crons.attention` puste; kolejny przebieg `dbw-3` w `/status` bez `partial`.
9. `npm run lint`, `npm test`, `npm run build` bez nowych błędów.

## Ryzyka
- Trasa zakłada `id-pozycja-2` — przekrój 143 go nie ma; łatwo wczytać pustą serię (test z fixturą to łapie).
- Większa odpowiedź na wywołanie (~100 KB × 24) niż inne serie: sprawdzić czas trasy (`maxDuration` 30 s, `sleep` 120 ms).
- Powiaty w tym samym przekroju — nie wyciągać ich teraz (poza zakresem), ale to furtka do mapy powiatów.
- Rewizje: DBW może poprawić poprzedni miesiąc; cache TTL jak inne serie DBW.

## Poza zakresem
Bezrobocie wg województw/powiatów, BAEL, liczba bezrobotnych, zmiana nazw w UI, ceny nowego crona.

## Wymaga właściciela
Nic (źródło bez klucza). Opcjonalnie: potwierdzić terminy komunikatów GUS 11 i 12.2026, jeśli inżynier ich nie znajdzie.
