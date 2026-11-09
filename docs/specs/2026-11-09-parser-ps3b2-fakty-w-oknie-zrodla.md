# PS3b-2b-1 — parser: okno źródła pokazuje fakty XBRL (okres, kontekst, factId, skala, dokładność)

Status: **ZROBIONE 09.11.2026, PR #95 (REVIEW: SHIP)**; plan z 09.11.2026 (jeden przebieg, ok. 150–200 linii zmian razem z testem). Krok 2b z ROADMAP podzielony: **2b-1 = ten spec**, 2b-2 = klik w komórkę (zostaje).

## Dlaczego ten krok (3 zdania)
Pełne 2b (klik w liczbę → okno) wymaga klikalnych komórek w `StatementTable` i rozstrzygnięcia, co robi komórka bez faktu (Δ, wyliczone, kolumny PDF), więc nie mieści się w jednym przebiegu; wycinek „okno źródła pokazuje fakty całego wiersza” daje 80% wartości
(użytkownik widzi dla każdej kolumny okres, `contextId`, `factId`, skalę i `decimals`, więc może znaleźć tę samą liczbę w oryginalnym `.htm` i w wyszukiwarce SEC) przy zerowej zmianie tabel i kafli. Dane o fakcie **nie są dziś w wyniku** (`Metric.values` ma tylko `periodKey` i liczbę po `scale`/`sign`;
`rawText` to wiersz „etykieta | pojęcie | 51294 · 24747” bez kolumn i bez id), więc krok dodaje je w **bocznej mapie** `ParseResult.factRefs`, a nie w `Metric.values` — dzięki temu typ `MetricValue` i wszystkie jego odbiorcy (`deltaChange`, `HeroKpis`, `derived.ts`, tabele) zostają nietknięte, a eksport JSON ma te same bajty (mapa jest wycinana). Odrzucone: 2c („wyliczone”, mniejsze, ale to szlif, nie dowód) i samo
wyświetlenie `note` (to już jest — pojęcie XBRL w nagłówku okna).

## Problem i wartość
Pytanie użytkownika: „skąd dokładnie ta liczba w pliku i czy skala jest dobra?”. Dziś okno źródła pokazuje wiersz z `rawText` ±2 linie (liczby po przeskalowaniu, bez wskazania, która liczba to który okres) i nazwę pojęcia. Nie da się z niego dojść do faktu w oryginale ani sprawdzić, że „14 575” to mln USD za 1.07–30.09.2026.

## Co widzi użytkownik
Tylko dla metryk z XBRL, które mają fakty (`result.factRefs?.[metric.key]` niepuste). Dla PDF/TXT i dla `totalDebt` (bez faktu, wyliczone — 2c) okno wygląda **dokładnie jak dziś**.

Okno źródła (`SourceModal`), nowa sekcja **pod** plakietkami, **nad** fragmentem wierszy (wniosek przed szczegółem): nagłówek „Fakty XBRL (n)”, jedna linia wyjaśnienia „Każda kolumna tabeli to osobny fakt w pliku. `factId` i `contextId` znajdziesz w kodzie źródłowym pliku (Ctrl+F).”
Dla każdego okresu z faktem (kolejność jak kolumny tabeli; okresy bez faktu pomijane) jedna karta:
- tytuł: etykieta okresu z `detection.periods` (np. „Q3 FY26 · 3M ended Sep 30, 2026” — jak w nagłówku kolumny, `Period.label`), po prawej wartość w jednostkach raportu jak w tabeli;
- wiersze klucz/wartość (klasa `num`, `break-all` dla id): „Wartość pełna” (`value` w jednostkach, np. 14 575 000 000 USD — format `pl-PL`, twarda spacja), „Skala” („10^6 · mln”), „Dokładność” (`decimals` z objaśnieniem: „−6 = do miliona”, „INF = dokładnie”, brak = „nie podano”), „factId” (np. f-137), „contextId” (c-14) + okres kontekstu „2026-07-01 → 2026-09-30” (albo data dla bilansu), „Pojęcie” (`us-gaap:Revenue…` — już jest w nagłówku, tu pełne).
- telefon (390 px): karty jedna pod drugą, klucz nad wartością lub dwie kolumny w karcie, **zero przewijania w bok** (id łamią się); desktop (1440, okno max-w-2xl): ta sama karta, dwie kolumny klucz/wartość. Okno nie rośnie ponad `max-h-[85dvh]`, przewija się w środku (jak dziś). Przycisk zamknięcia 44×44 px bez zmian; nowych elementów interaktywnych **nie ma** (sam tekst), więc nowych celów dotyku brak. Jeśli implementacja doda przycisk „kopiuj factId” — musi mieć `touch:min-h-11 touch:min-w-11`.

## Dane
Brak nowego źródła, crona, cache, Firestore, CSP, zmiany `/prywatnosc` (nic nowego nie jest przetwarzane ani wysyłane; wszystko w przeglądarce — `tests/parser-browser-path.test.ts` bez zmian). `FRESHNESS_DATASETS` nie dotyczy (plik użytkownika).

Wejście: `IxFact` z `read.ts` — pola `qname`, `contextId`, `sig`, `unit`, `value` (po `scale` i `sign`, w jednostkach), `scale`, `decimals`, `factId`. **Wartości surowej sprzed `sign`/`scale` czytnik nie przechowuje** — krok jej nie dodaje (wartość pełna = `value`; nie obiecujemy tekstu z komórki HTML).
Kształt (w `types.ts`, opcjonalny — PDF/TXT go nie ma, więc hashe `tests/parser-parity.test.ts` nie ruszają się: `JSON.stringify` pomija `undefined`; `parseReport` nie dostaje tego pola wcale):
`FactRef = { periodKey, factId: string | null, contextId, qname, period: string /* sig */, unit: string | null, value: number, scale: number, decimals: string | null }`;
`ParseResult.factRefs?: Partial<Record<MetricKey, FactRef[]>>`. Wypełniane w `ixbrlToResult` z `best.hits` (te same fakty, z których liczone są wartości — nie drugie wyszukiwanie), tylko dla `confidence: "HIGH"`.

Zweryfikowane 09.11.2026 w fixture'ach (grep po znacznikach): SpaceX 10-Q, przychody Q3 FY26: `id="f-137"`, `contextRef="c-14"`, `decimals="-6"`, `scale="6"`, `unitRef="usd"`, tekst „14,575” (inne okresy: f-138 5 576, f-139 27 083, f-140 13 714); Cipher 10-K, `us-gaap:Revenues` FY25: `f-171`, `c-1`, `decimals="-3"`, `scale="3"`, 223,942 tys. USD (f-172 151 270, f-173 126 842). Wartości zgodne z komunikatami spółek i API SEC (PS3a). Rozmiar: JSON wyniku bez `rawText` to dziś 49,7 kB (SpaceX) i 40,3 kB (Cipher) na przyciętych fixture'ach; mapa dodałaby szacunkowo ≤ 30 kB — nieistotne wobec limitu 4 MB, ale i tak jest wycinana z eksportu (kryterium 6).

## Pliki do zmiany
1. `src/lib/parser/types.ts`: `FactRef`, opcjonalne `ParseResult.factRefs` (nie ruszać `MetricValue`/`Metric`).
2. `src/lib/parser/ixbrl/to-result.ts`: w pętli metryk (`best.hits`) zbierać `FactRef[]`; dołączyć `factRefs` do zwracanego obiektu tylko gdy niepuste.
3. `src/lib/parser/export.ts` (`toJSON`): `const { rawText, factRefs, ...rest }`; `src/components/parser/ExportMenu.tsx`: `{ ...result, rawText: "", factRefs: undefined }` (mniejsze body). Eksport CSV/XLSX nie czyta mapy — bez zmian.
4. `src/components/parser/SourceModal.tsx`: nowe propsy `factRefs?: FactRef[]`, `periods: Period[]` (income + balance z `detection.periods`); sekcja kart nad fragmentem wierszy. Czyste formatowanie (`describeDecimals`, `formatFullValue`) w `src/lib/parser/fact-view.ts` (bez React, testowalne).
5. `src/app/parser/page.tsx` (linia ~542): przekazać `factRefs={result.factRefs?.[sourceMetric.key]}` i `periods`.
6. `src/lib/parser/copy.pl.ts`: `pl.source.facts*` (nagłówek, wyjaśnienie, etykiety kluczy, objaśnienia `decimals`).
7. `tests/parser-fact-refs.test.ts` (nowy).
Bez zmian: `read.ts`, `concepts.ts`, `StatementTable.tsx`, `HeroKpis.tsx`, `derived.ts`, `validate.ts`, `parser.ts`, `MetricValue`.

## Lekcje zastosowane (`docs/PRODUCT.md`)
- [x] Źródło i okres przy liczbie (id faktu, okres kontekstu, jednostka, skala). [x] Interpretacja przed szczegółem (jednozdaniowe objaśnienie nad kartami; `decimals` tłumaczone, nie surowe).
- [x] Mobile 390 px: karty, bez przewijania w bok, `max-h-[85dvh]`, portal bez zmian. [x] Nic z „teraz” przed hydratacją (okno otwiera się po kliknięciu).
- [x] Brak nowego zbioru: freshness/cron/CSP nie dotyczą. [x] Spójność z PL/JP: nie dotyczy (narzędzie).

## Kryteria akceptacji
1. `tests/parser-fact-refs.test.ts`, SpaceX: `result.factRefs.revenue` ma 4 pozycje, a dla `inc0`: `factId === "f-137"`, `contextId === "c-14"`, `decimals === "-6"`, `scale === 6`, `unit === "USD"` (lub `usd` — jak zwraca czytnik; test pinuje to, co jest), `value === 14_575_000_000`, `qname === "us-gaap:RevenueFromContractWithCustomerExcludingAssessedTax"`, `period` = `"<start>|2026-09-30"` zgodne z `contexts.get("c-14")`.
2. Ten sam plik, Cipher: `factRefs.revenue[0]` → `f-171`, `c-1`, `decimals "-3"`, `scale 3`, `value === 223_942_000`.
3. Spójność: dla **każdej** metryki z `factRefs` i dla każdej pozycji `FactRef`: `value / 10**scale` (dla kwot i akcji) równa się `metric.values[periodKey].value` (SpaceX i Cipher) — dowód, że mapa pokazuje dokładnie te fakty, z których wzięto liczby; metryki bez faktu (`totalDebt`, `LOW`) nie mają wpisu.
4. `describeDecimals("-6") ` zawiera „milion”, `("-3")` „tysi”, `("INF")` „dokładnie”, `(null)` „nie podano”; `formatFullValue(14_575_000_000, "USD")` = „14 575 000 000 USD” z twardymi spacjami (U+00A0).
5. Nietknięte: `npm test` w całości zielony, w tym `tests/parser-parity.test.ts` **bez zmiany hashy**; wynik `parseReport` dla każdego `tests/fixtures/*.txt` nie ma klucza `factRefs`. `npx tsc --noEmit`, `npx eslint` zmienionych plików, `npm run build` — czysto.
6. Eksport: `toJSON(parseIxbrl(SpaceX))` jest identyczny bajt w bajt z wersją z `main` f6d6e92 (porównanie przed/po, hash w opisie PR) — brak klucza `factRefs`; `JSON.stringify({ result: { ...r, rawText: "", factRefs: undefined }, format })` nie zawiera `factRefs`. Rozmiar `JSON.stringify(factRefs)` dla SpaceX zapisany w opisie PR.
7. Playwright 390 i 1440 px, `/parser` → „Wczytaj SpaceX (HTML)” → lupa przy „Przychody”: w oknie sekcja „Fakty XBRL (4)”, karta „Q3 FY26” z `f-137`, `c-14`, „2026-07-01 → 2026-09-30”, „14 575 000 000 USD”, „−6 = do miliona”; `scrollWidth ≤ clientWidth` okna na 390 px; 0 błędów konsoli, 0 naruszeń CSP (`next start`), 0 żądań do `/api/parser`. Zrzuty: 390 (okno otwarte, przewinięte do kart) i 1440.
8. Ten sam przebieg dla Cipher (10-K, 3 okresy dochodowe: `f-171`, `f-172`, `f-173`) i dla bilansu („Aktywa razem”: 2 daty, kontekst = instant, „2026-…”/data bez strzałki). Wiersz z `cash flow` w 10-Q SpaceX (tylko kolumny YTD): karty tylko dla okresów z faktem.
9. Regresja: okno źródła dla próbki PDF (Microsoft) i TXT (Kombinat Konopny) wygląda bez zmian (brak sekcji faktów, zrzut przed/po albo test: `factRefs` undefined → komponent nie renderuje nagłówka „Fakty XBRL”); okno dla `totalDebt` w XBRL — brak lupy jak dziś.
10. Cel dotyku: jeśli powstał jakikolwiek nowy przycisk, na 390 px ≥ 44×44 px (pomiar `getBoundingClientRect`); jeśli nie — stwierdzone w opisie PR.

## Poza zakresem (zostaje w PS3b-2)
- **2b-2:** klik w komórkę tabeli (okno otwarte na wybranym okresie, podświetlona karta), potrzebuje decyzji: komórki wyliczone (Δ, FCF) nie mają faktu — wtedy 2c.
- **2c:** oznaczenie „wyliczone” (FCF, dług netto, marże, `totalDebt`, kafle `HeroKpis`).
- **2d:** „wszystkie fakty” z wyszukiwarką, scalanie rozciętych tabel, 10-Q na 390 px bez pustych kolumn Q3, nazwy produktów po polsku, instrukcja „Filing Detail”.
- Wartość surowa tekstu komórki (`14,575`) i flaga `sign` — wymagałyby zmiany `read.ts`; nie obiecujemy.
- Fakty z wymiarami (segmenty, produkty) — okno dotyczy metryk konsolidowanych.

## Ryzyka
1. **Rozmiar wyniku/postMessage:** mapa dubluje dane z `IxFact` (≤ ~34 metryki × ≤ 6 okresów); przy pełnym 2,3 MB pliku nadal rzędu kilkudziesięciu kB. Jeśli pomiar w PR pokaże > 200 kB, ograniczyć do pól wymaganych przez UI.
2. **Wyciek do eksportu:** każde nowe miejsce, które serializuje `ParseResult` (np. przyszły eksport, log), pokaże `factRefs`; stąd kryterium 6 na bajty. Test w `tests/parser-fact-refs.test.ts` ma wołać `toJSON`.
3. **Mylące „wartość pełna”:** dla akcji i EPS skala nie dotyczy kwot — `formatFullValue` dostaje jednostkę (`USD`, `shares`, `USD/shares`); test dla EPS (SpaceX) wymagany: bez „USD” doklejonego do liczby akcji.
4. **`factId` bywa `null`** (fakty bez `id`) — karta pokazuje „brak id w pliku”, nie puste pole; test syntetycznym HTML-em.
5. **Ten sam fakt wybrany przez `byConcept.find`** może różnić się od faktu, który widzi czytelnik, jeśli plik ma dwa fakty o tym samym kontekście i różnej precyzji (czytnik zostawia dokładniejszy, `seen`) — okno pokazuje ten wybrany; nie sygnalizujemy duplikatów (2d).
6. Dwa nowe `useMemo`/mapowania w oknie — otwiera się rzadko, brak ryzyka wydajności; ale `SourceModal` jest wspólny z PDF, więc regresja PDF to kryterium 9.

## Wymaga właściciela
Nic blokującego. **Musisz to zrobić, żeby być najlepszym:** po wdrożeniu otwórz na produkcji okno źródła przy „Przychodach” w własnym pliku `.htm` z EDGAR (inny emitent niż SpaceX/Cipher), znajdź w oryginale `factId` pokazany w oknie i potwierdź, że to ta liczba — to jedyny test na pliku, którego nie było w fixture'ach; wynik (zgodne/niezgodne + nazwa spółki) wklej do rozmowy.
