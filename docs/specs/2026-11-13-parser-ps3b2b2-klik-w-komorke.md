# PS3b-2b-2 — parser: klik w komórkę tabeli otwiera okno źródła na wybranym okresie

Status: zrobione 13.11.2026, PR #97 (REVIEW: SHIP). Rozmiar: ≤ ~200 linii, tylko UI (`StatementTable`, `SourceModal`, `page.tsx`) + jedna czysta funkcja.
Bez zmian w `parser.ts`, `ixbrl/*`, `ParseResult`, eksporcie (hashe parytetu i `toJSON` bez zmian). Bez sieci, bez nowych źródeł, bez crona.

## Problem i wartość
Analityk widzi w tabeli „14 575" w kolumnie „Q3 FY26" i chce wiedzieć, skąd dokładnie ta liczba. Dziś lupa jest na wierszu, a okno
pokazuje karty faktów WSZYSTKICH okresów wiersza — trzeba samemu zgadnąć, która karta jest tą komórką (2b-1 dał dane, nie wskazanie).
Liczba bez widocznego pochodzenia to defekt (PRODUCT). Krok zamyka pytanie „skąd ta komórka" jednym tapnięciem.

## Co widzi użytkownik
- **390 px:** komórka wartości w `StatementTable` (tylko wiersz z `sourceLine`, tak jak dziś lupa) jest przyciskiem: tap otwiera arkusz
  `SourceModal` z kartą faktu tego okresu na górze, z obwódką/tłem akcentu i etykietą „Ta komórka" (tekst, nie sam kolor); pozostałe karty niżej.
  Cel dotyku komórki ≥ 44 px wysokości przez `touch:` (komórka ma dziś ~32 px; powiększyć padding tylko pod `touch:`, bez przesuwania układu na desktopie).
  Przycisk nie zmienia wyglądu liczby (wyrównanie do prawej, `DataCell` bez zmian); focus-visible widoczny.
- **1440 px:** ten sam przycisk; kursor pointer i delikatne podkreślenie przy hover (`pointer-fine:`). Lupa w kolumnie etykiet zostaje (otwiera okno bez wyróżnionego okresu).
- **Komórka bez faktu** (`factRefs` nie ma wpisu dla tego `periodKey` — np. ścieżka PDF/TXT albo okres bez faktu): tap otwiera okno wiersza jak lupa,
  bez „Ta komórka"; w oknie, gdy są karty faktów, jedna linia „Dla okresu {short} brak faktu XBRL" (komórka pusta lub wyliczona).
- **Komórki Δ** i wiersze wyliczone: bez zmian (są oznaczone plakietką „wyliczone" z 2c w nagłówku/etykiecie); w tym kroku nie klikalne.
- Esc, tło i „Zamknij" zamykają okno jak dziś; fokus wraca na komórkę, z której otwarto (dziś wraca na nic — poprawka w tym kroku).

## Dane
Źródło: istniejące `result.factRefs[metricKey][].periodKey` (2b-1) i `Period.key`. Nowa czysta funkcja w `src/lib/parser/fact-view.ts`:
`orderFactRefs(refs: FactRef[], periodKey?: string): { ordered: FactRef[]; highlighted: string | null }` — wybrany okres pierwszy, reszta w oryginalnej kolejności;
`highlighted` = `periodKey`, gdy istnieje w `refs`, inaczej `null`. Stan strony: `sourceMetric` rozszerzony o `periodKey?: string`
(`onSource(m, periodKey?)`; istniejące wywołania z jednym argumentem działają bez zmian). Teksty w `copy.pl.ts` (`source.thisCell`, `source.noFactForPeriod(short)`).
Prywatność: bez zmian (przetwarzanie w przeglądarce).

## Lekcje (PRODUCT / AGENTS)
- [x] Cel dotyku ≥ 44 px (`touch:`), bez regresji układu tabeli na 390 px (tabela przewija się poziomo, kolumna etykiet sticky).
- [x] Polskie napisy; liczby bez zmian formatu; nic z „teraz".
- [x] `tests/parser-parity.test.ts`, `tests/parser-fact-refs.test.ts` i `toJSON` bez zmian; `tests/parser-browser-path.test.ts` zielony.
- [x] Dostępność: przycisk ma `aria-label` „{pozycja}, {okres}: pokaż źródło"; dialog zachowuje `aria-modal`.

## Kryteria akceptacji
1. Test jednostkowy `orderFactRefs` (bez sieci): wybrany okres pierwszy; nieistniejący `periodKey` → `highlighted: null`, kolejność bez zmian; `undefined` → bez zmian; pusta lista.
2. Test na prawdziwych fixturach: dla SpaceX HTML i Cipher każda komórka wiersza z `factRefs` ma w `orderFactRefs(refs, period.key)` kartę o tym `periodKey` na pozycji 0 (pętla po wszystkich wierszach i okresach).
3. Test luki z 2b-1 (`tests/parser-fact-refs.test.ts`): syntetyczny HTML iXBRL z faktem bez atrybutu `id` → `factRefs[...].factId === null`, a `describe`/UI daje „brak identyfikatora" (`pl.source.factNoId`).
4. Test luki z 2b-1: SHA-256 `JSON.stringify(toJSON)` SpaceX i Cipher przypięty w teście (wartości policzone na `main` 469c6bf przed zmianą; zmiana hasha = czerwony test).
5. Playwright 390 px na SpaceX (HTML): tap w komórkę „Przychody / Q3 FY26" otwiera arkusz; pierwsza karta ma „Ta komórka" i okres „Q3 FY26"; `factId`/`contextId` zgodne z kartą z lupy; screenshot w opisie PR.
6. Playwright 390 px: `getBoundingClientRect()` przycisku komórki ≥ 44 px wysokości; szerokość tabeli i pozycja kolumny etykiet bez zmian względem `main` (porównanie `scrollWidth`).
7. Playwright 1440 px: hover podkreśla komórkę; klik otwiera okno na środku; Esc zamyka, fokus wraca na tę samą komórkę (`document.activeElement`).
8. Przykład PDF/TXT (ścieżka bez `factRefs`): klik w komórkę otwiera okno wiersza jak lupa, bez „Ta komórka" i bez błędu w konsoli.
9. Wiersze bez `sourceLine` i komórki Δ nie są przyciskami (`button` count w tabeli = liczba komórek wartości wierszy z `sourceLine` + lupy).
10. `npm test`, `npm run build`, `npm run lint` bez nowych błędów w zmienionych plikach; brak nowych `fetch`.
11. ROADMAP: 2b-2 do „Zrobione" z PR; wpis o odłożonych Δ-komórkach w 2d.

## Poza zakresem
Okno „jak policzono" dla komórek Δ/FCF (osobny krok po tym, jeśli użytkownicy klikają Δ), `Profitability`/`CashAndReturns`/`HeroKpis` (wyliczone; mają plakietkę z 2c),
wyszukiwarka faktów (2d), heurystyki PDF, zmiany `ParseResult`/eksportu. Tabele segmentów/produktów (`SegmentsView`) — nie ruszać.

## Ryzyka
- Komórki jako przyciski zagęszczają tabelę i mogą zepsuć poziome przewijanie dotykiem (przycisk przechwytuje gest) → kryterium 6; przy problemie fallback: zostawić lupę, a klik obsłużyć tylko na `pointer-fine`.
- Fokus wracający na komórkę wymaga trzymania `ref` w stronie; `SourceModal` jest w portalu — nie zmieniać portalu.
- `periodKey` z `Period.key` musi się zgadzać z `FactRef.periodKey` (test 2 to wyłapie).
- Rozszerzenie zakresu o Δ/FCF — nie w tym kroku (2c dało plakietki; okno „jak policzono" tylko jeśli wyliczone komórki będą realnie klikane).

## Owner actions
Brak.
