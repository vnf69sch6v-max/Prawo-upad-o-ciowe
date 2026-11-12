# PS3b-2c — parser: oznaczenie „wyliczone” przy liczbach, których nie ma w sprawozdaniu

Status: **do wdrożenia** (PLAN 12.11.2026). Rozmiar: ≤ ~250 linii, bez zmian w `parser.ts`, `ixbrl/*` i `ParseResult` (hashe parytetu bez zmian).

## Problem i wartość
Analityk wgrywa raport i widzi FCF, dług netto, marże i kafle `HeroKpis`. Dziś nie odróżnia liczby przepisanej ze sprawozdania
od liczby policzonej przez nas (tylko zdanie w podpowiedzi plakietki „dane z XBRL”). Liczba bez pochodzenia to defekt
(PRODUCT: źródło i okres przy każdej liczbie). Krok jest też warunkiem 2b-2: klik w komórkę wyliczoną nie ma faktu źródłowego,
więc musi otwierać „jak policzono”, nie okno faktu.

## Co widzi użytkownik
- **390 px:** kafel `HeroKpis`, który jest wyliczony (FCF, dług netto, marże), ma przy etykiecie małą plakietkę „wyliczone”
  (tekst, nie sama ikona; kontrast AA, wysokość dotyku ≥ 44 px przez `touch:`). Dotknięcie otwiera `Drawer`/popover z jedną linią
  wzoru, np. „FCF = przepływy operacyjne − nakłady inwestycyjne (CapEx)” i z wartościami składników oraz okresem.
- **Tabele (`StatementTable`, `Profitability`, `CashAndReturns`):** wiersze Δ%, marża, FCF, dług netto z tą samą plakietką
  (kolumna etykiet), bez zmiany układu liczb. Liczby wprost ze sprawozdania bez plakietki.
- **1440 px:** to samo, wzór w popoverze/tooltipie (hover tylko dla `useCanHover()`).
- Wzór jest polski i zawiera nazwy pozycji z raportu (jeśli składnik ma `sourceLine`/`factRefs`, ma lupę jak dziś).

## Dane
Bez nowych źródeł i bez crona. Źródłem jest istniejący `result.derived` (`DerivedResult`: `fcf`, `ratios`, `capexIntensityFlag`)
oraz kafle z `HeroKpis`. Jedna mapa pochodzenia `DERIVED_FORMULAS` (nowy plik `src/lib/parser/derived-meta.ts`, czysty TS, bez React):
klucz → `{ labelPl, formulaPl, inputs: (result, periodKey) => {label, value}[] }`. Pokrycie: FCF, dług netto, marża brutto/operacyjna/netto,
capex intensity, wypłata z FCF, Δ% okres do okresu. Nie wolno dopisywać pola do `ParseResult` ani zmieniać `toJSON`/eksportu.
Prywatność: bez zmian (przetwarzanie w przeglądarce, brak nowych danych; `/prywatnosc` nie wymaga zmiany).

## Lekcje (PRODUCT / AGENTS)
- [x] Liczby w UI w polskim formacie; `detail` z `validate.ts` zostaje `en-US` (kontrakt PS3b-2a).
- [x] Nic z „teraz” przed hydracją (nie dotyczy, brak dat względnych).
- [x] Cel dotyku ≥ 44 px (`touch:`), CSP bez zmian (brak nowych źródeł).
- [x] `tests/parser-parity.test.ts` i hash eksportu bez zmian — krok tylko UI + mapa metadanych.

## Kryteria akceptacji
1. `DERIVED_FORMULAS` pokrywa FCF, dług netto, 3 marże, capex intensity, wypłatę z FCF, Δ%; test jednostkowy: każdy klucz ma `labelPl`, `formulaPl` i dla SpaceX i Cipher `inputs` zwraca wartości, z których przeliczenie daje wartość z `derived` (±0,05 pp / ±1 jednostka skali).
2. Test: żaden klucz liczby wprost ze sprawozdania (przychody, zysk netto, aktywa) nie ma plakietki (lista dozwolonych kluczy = lista wyliczonych, równość zbiorów).
3. Screenshot 390 px i 1440 px SpaceX (HTML): kafle FCF/dług netto/marże mają „wyliczone”; przychody i zysk netto nie.
4. Dotknięcie plakietki na 390 px pokazuje wzór i składniki z okresem; zamykanie Esc/tapnięcie poza; fokus wraca na plakietkę.
5. `npm test` zielone, w tym `tests/parser-parity.test.ts` bez zmiany hashy; `toJSON` SpaceX/Cipher bajt w bajt jak na `main` (SHA-256 w opisie PR).
6. `npm run build` i `npm run lint` bez nowych błędów w zmienionych plikach; brak `fetch` w ścieżce przeglądarkowej (`tests/parser-browser-path.test.ts`).
7. PDF/TXT (stary parser): plakietki tam, gdzie wiersz jest wyliczany w `derived`; brak regresji układu tabeli.
8. ROADMAP: 2c do „Zrobione” z PR; 2b-2 odblokowane z notatką „wyliczone = okno ‘jak policzono’”.

## Poza zakresem
Klik w komórkę (2b-2), wyszukiwarka faktów (2d), zmiany heurystyk PDF, nowe wskaźniki, zmiany w eksporcie.

## Ryzyka
- Rozjazd wzoru z faktycznym kodem w `derived` → kryterium 1 przeliczeniem, nie opisem.
- Plakietki zagęszczają 390 px (kafle 2 kolumny): plakietka ma się zawijać pod etykietą, nie poszerzać kafla.
- Rozszerzenie zakresu o 2b-2 — nie w tym kroku.

## Owner actions
Brak.
