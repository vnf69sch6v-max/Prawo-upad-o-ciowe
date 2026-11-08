# PS3b-2a — parser: kontrole spójności widoczne dla użytkownika

Status: **wdrożone 08.11.2026, czeka na REVIEW PM** (jeden przebieg, ~250 linii zmian; kryteria 1–7 i 9 sprawdzone, 8 w opisie PR). Następne kroki PS3b-2 są w ROADMAP (2b klik liczby → arkusz z faktem, 2c „wyliczone”, 2d reszta).

## Dlaczego ten krok (3 zdania)
Parser XBRL liczy już kontrole spójności (zysk op. + pozaoperacyjne = przed podatkiem, przed podatkiem − podatek = netto, aktywa = zobowiązania + mezzanine + kapitał
na każdą datę bilansu, suma segmentów = przychody; SpaceX 5/5, Cipher 4/4 — zmierzone 08.11.2026 na fixture'ach), ale **użytkownik ich nigdy nie widzi**: `result.validation` trafia tylko do eksportu („Uzgodnienia”), a `pl.validation` i
`validationNamePl()` w `copy.pl.ts` nie mają żadnego odbiorcy w UI. Strona obiecuje „dane z XBRL”, a gdy plik jest nietypowy (inny emitent, błąd znaku, zła kolumna),
pokazuje kafle i tabele bez ostrzeżenia, więc cichy błąd jest gorszy niż brak wyniku; ten sam element pokazuje też dowód poprawności (np. 5/5), czyli jest jedyną rzeczą,
która odróżnia „narzędzie” od „zgadywanki” po wgraniu pliku. Odrzucone w tym kroku: (a) klik liczby → arkusz (największy: wymaga referencji do faktu w `Metric.values`,
zmiany typu i rozmiaru eksportu JSON, osobny krok 2b), (b) „wyliczone” (plakietka `badgeXbrlHint` już mówi, że FCF, dług netto i marże są wyliczone; szlifowanie,
krok 2c), (d) „Current/Prior” — **nie dotyczy ścieżki HTML**: `durationPeriod`/`pointPeriod` w XBRL dają „Q3 FY26”, „FY25 close”; „Current/Prior” pochodzi wyłącznie
z `parser.ts` (PDF, wstrzymane), więc pozycja wypada z PS3b-2 i wraca do PS2c.

## Problem i wartość
Pytanie użytkownika po wgraniu `.htm`: „czy mogę temu wierzyć?”. Odpowiedź ma być na pierwszym ekranie (Przegląd), nie w pliku CSV.

## Co widzi użytkownik
Miejsce: sekcja „Przegląd” (`id="przeglad"` w `src/app/parser/page.tsx`), nowy komponent `ValidationStatus` (`src/components/parser/ValidationStatus.tsx`).

**Stan OK (wszystkie kontrole przeszły, `total ≥ 1`)** — jedna linia pod kaflami `HeroKpis`:
„✓ Kontrole spójności: 5/5 zgodne” (SpaceX) + przycisk „Pokaż” (zwija/rozwija, `aria-expanded`, cel dotyku ≥ 44 px poniżej `lg`). Rozwinięta lista: nazwa po polsku, jedna linia
równania z liczbami (np. „2 791 + 1 223 = 4 014 vs 4 014”; ujemne ze znakiem − i w nawiasie po operatorze: „−421 563 + (−403 994) = −825 557 vs −825 557”), znacznik zgodne. Pod listą jedno zdanie: „Kwoty w mln USD (jednostka raportu). Kontrola sprawdza, czy liczby
z różnych tabel dają się do siebie dodać; nie dowodzi, że spółka podała prawdę.”

**Stan BŁĄD (≥ 1 kontrola nie przeszła)** — baner **nad** kaflami (nagłówek wyniku nie może wyglądać na pewny): ramka w tokenach `rp-warn` jak `OneOffBanner`,
tytuł „Kontrole spójności: nie przeszło N z M”, dla każdej nieudanej kontroli nazwa po polsku + równanie z liczbami, zdanie „Liczby z tej kontroli mogą być przypisane
do złej kolumny albo źle odczytane. Nie opieraj na nich decyzji, dopóki nie sprawdzisz ich w oknie źródła (ikona lupy przy wierszu) lub w oryginalnym pliku.” Poniżej
przycisk „Pokaż wszystkie kontrole” (jak wyżej). Baner nie znika po kliknięciu; nie jest toastem.

**Brak kontroli (`total === 0`)** — nic nie jest renderowane (np. PDF bez danych do uzgodnienia). Nie pokazujemy „0/0”.

Telefon (320–430 px): jedna kolumna, równanie łamie się w obrębie karty (`break-words`, brak przewijania w bok), liczby w klasie `num`. Desktop (1440): ta sama
komponentowa szerokość co `HeroKpis` (kolumna dokumentu max 860 px).

## Dane
Brak nowego źródła, crona, cache, zbioru Firestore ani zmiany CSP. Wejście: istniejący `ParseResult.validation` (`{ checks: {name, passed, detail}[], passed, total }`),
`detection.unitScale`, `detection.currency`. `FRESHNESS_DATASETS` nie dotyczy (plik użytkownika). `/prywatnosc` bez zmian (nic nowego nie jest przetwarzane ani wysyłane).

Zweryfikowane 08.11.2026 w kodzie i uruchomieniem `parseIxbrl` na obu fixture'ach: nazwy kontroli XBRL (`to-result.ts`): „Operating income + Other = Pre-tax income”, „Pre-tax − Tax = Net income”,
„Assets = Liabilities + Equity (<okres>)” (sufiks z `balance[i].short`: „FY26 · Sep 30”, „FY25 close”), „Sum of segments = Total revenue”. `VALIDATION_PL` zna tylko 9 nazw ścieżki PDF
(bez sufiksu okresu i bez „Sum of segments…”), więc **dziś 3 z 5 kontroli SpaceX (dwa bilanse i segmenty) wyświetliłyby się po angielsku**. Pozostałe fakty: `detail` jest formatowane `toLocaleString("en-US")`
(„38,752”), co dla polskiego czytelnika znaczy „38,752” = trzydzieści osiem i trzy czwarte tysiąca — **wymaga przeformatowania na wyświetleniu** (eksport CSV bez zmian).
Surowe `detail` zawiera też „4,014 − -390” i „-421,563 + -403,994” (podwójny minus) — też do poprawienia na wyświetleniu.
Wartości referencyjne (z testów PS3a, zgodne z API SEC i komunikatami): SpaceX 5/5 (przed podatkiem 4 014 = 2 791 − 675 + 873 + 1 025; mezzanine 38 752 mln
przy 31.12.2025), Cipher 10-K 4/4 (mezzanine 30 319 tys.; zysk op. −421 563 + pozaoperacyjne −403 994 = −825 557).

## Pliki do zmiany
1. `src/lib/parser/validation-view.ts` (nowy, czysty, bez React): `summarizeValidation(validation, detection)` → `{ state: "none" | "ok" | "fail", passed, total, items: { namePl, equationPl, passed }[], failed: typeof items, unitNote }`.
   `equationPl` = `detail` z przeformatowanymi liczbami (`/-?\d{1,3}(,\d{3})+(\.\d+)?|-?\d+(\.\d+)?/` → grupy tysięcy twardą spacją U+00A0, przecinek dziesiętny, minus U+2212; ujemna liczba po operatorze w nawiasie).
2. `src/lib/parser/copy.pl.ts`: `validationNamePl` rozszerzony o prefiks (`/^Assets = Liabilities \+ Equity \((.+)\)$/` → „Aktywa = Zobowiązania + mezzanine + Kapitał (okres)”)
   oraz wpis „Sum of segments = Total revenue” → „Suma segmentów = Przychody razem”; teksty banera i linii OK w obiekcie `pl.validation` (zastępują nieużywane `title`/`passed`
   albo je reużywają). Nie zmieniać `name` w `to-result.ts` (testy i eksport na nich polegają).
3. `src/components/parser/ValidationStatus.tsx` (nowy, `"use client"`): stan OK / BŁĄD / brak, przycisk rozwijania.
4. `src/app/parser/page.tsx`: wstawić `<ValidationStatus result={result} />` w `DocSection id="przeglad"` — baner (stan BŁĄD) przed `HeroKpis`, linia OK po `OneOffBanner`; jeden komponent
   decyduje o pozycji przez dwa propsy albo dwa wywołania. Bez zmian w spisie treści.
5. `tests/parser-validation-view.test.ts` (nowy).
Bez zmian: `to-result.ts`, `types.ts`, `export.ts`, `validate.ts`, `parser-parity` (hashe nietknięte).

## Lekcje zastosowane (`docs/PRODUCT.md`)
- [x] Źródło i okres przy liczbie: równanie podaje okres (sufiks kontroli bilansu) i jednostkę raportu. [x] Interpretacja, nie tabela: wniosek („nie opieraj decyzji…”) przed szczegółem.
- [x] Mobile: banner nad kaflami, 44 px cel dotyku, 0 przewijania w bok. [x] Nic z „teraz” przed hydratacją (wynik tylko po wyborze pliku).
- [x] Brak nowego zbioru: freshness/cron nie dotyczą. [x] CSP: bez nowych źródeł. [x] Spójność z PL/JP: nie dotyczy (narzędzie, nie zbiór danych).

## Kryteria akceptacji
1. `tests/parser-validation-view.test.ts`: dla `parseIxbrl` fixture'u SpaceX i Cipher `summarizeValidation(...).state === "ok"`, `passed === total`, `total === 5` (SpaceX) / `total === 4` (Cipher).
2. Ten sam test: **każda** nazwa kontroli z wyników SpaceX, Cipher i próbek PDF/TXT z `tests/fixtures/` (te, które istniejące testy już parsują) ma `validationNamePl(name) !== name` — zero angielskich nazw w UI.
3. Test mutacji: w kopii tekstu fixture'u SpaceX zmienić wartość jednego faktu `us-gaap:Assets` (31.12.2025; zamienić wartość we wszystkich faktach `Assets` z tym kontekstem, by nie powstał duplikat o różnej wartości) o +1 000 mln (w pamięci, plik w repo bez zmian) → `state === "fail"`, `failed.length === 1`,
   `failed[0].namePl` zawiera „Aktywa” i „FY25 close”, `equationPl` zawiera „93 079” (92 079 + 1 000, grupa tysięcy spacją, nie przecinkiem).
4. Test formatu: `"38,752 vs 1,234.5"` → `"38 752 vs 1 234,5"` (twarda spacja U+00A0); `"4,014 − -390"` → `"4 014 − (−390)"`; `"-421,563 + -403,994"` → `"−421 563 + (−403 994)"`; liczba bez separatora („2791”) bez zmian; `total === 0` → `state === "none"`.
5. `npx tsc --noEmit`, `npm test` (wszystkie dotychczasowe zielone, `parser-parity` bez zmiany hashy), `npx eslint` zmienionych plików, `npm run build` — czysto.
6. Playwright 390 i 1440 px, `/parser` → „Wczytaj SpaceX (HTML)”: linia „Kontrole spójności: 5/5 zgodne” pod kaflami; po kliknięciu „Pokaż” 5 pozycji po polsku, w tym „Aktywa = Zobowiązania + mezzanine + Kapitał (FY25 close)”; 0 przewijania w bok
   (`scrollWidth ≤ clientWidth`), 0 błędów konsoli, 0 naruszeń CSP (`next start`), 0 żądań do `/api/parser`. Zrzuty: stan OK zwinięty i rozwinięty.
7. Ten sam przegląd ze zmutowanym plikiem z kryterium 3 wgranym przez UI: baner z tytułem „nie przeszło 1 z 5” stoi **nad** kaflami, widać równanie z „93 079”; zrzuty 390 i 1440; przycisk rozwijania ≥ 44×44 px na 390.
8. Próbka PDF z `public/parser-samples` (Microsoft, Cipher PDF, CoreWeave) i TXT (Kombinat Konopny): wyniki nie zmieniają się poza dodaną linią/banerem; dla każdej próbki zapisać w opisie PR stan (`ok`/`fail`/`none`).
   Jeśli któraś próbka PDF daje `fail`, baner pokazuje się uczciwie, ale PR ma to wymienić — nie wyciszać.
9. Eksport CSV/JSON bez zmian bajt w bajt dla SpaceX (porównanie przed/po) — krok nie rusza `export.ts`.

## Poza zakresem
Klik liczby → arkusz z faktem (2b); oznaczenie „wyliczone” (2c); „wszystkie fakty” z wyszukiwarką, scalanie rozciętych tabel, 10-Q na 390 px bez pustych kolumn Q3, nazwy produktów po polsku,
instrukcja „Filing Detail” (2d); nowe kontrole (np. przepływy: OCF + inwestycyjne + finansowe = zmiana gotówki); zmiana tolerancji `tol()`; zmiana nazw w `to-result.ts`; PDF-owe „Current/Prior”.

## Ryzyka
1. **Fałszywy alarm**: tolerancja `max(2, 0,5%)` dobrana pod 2 pliki; pierwszy obcy emitent (np. bez mezzanine, z `Liabilities` wyliczanym) może dać `fail` mimo poprawnych liczb. Baner jest wtedy
   uciążliwy, ale uczciwy; tekst mówi „sprawdź”, nie „błąd”. Dalsze próbki dopiero z prawdziwych plików właściciela.
2. **Brak kontroli ≠ poprawnie**: stan `none` nic nie mówi; nie dodajemy komunikatu „nie sprawdzono”, bo przy PDF byłby stale widoczny — do rozważenia w 2d po zobaczeniu, ile plików ma `total < 3`.
3. **Format liczb w `detail`** zależy od `toLocaleString("en-US")`; zmiana tamtego formatu bez zmiany regexu cicho zepsuje wyświetlanie — stąd test z kryterium 4 na prawdziwym wyniku (kryterium 3).
4. **Dwa miejsca w sekcji** (baner nad kaflami, linia pod): pilnować, by nie powstały dwa rozwijane stany; jeden `useState` w komponencie.
5. **Dostępność**: baner nie jest `aria-live` (statyczny po załadowaniu wyniku); nagłówek jako `p` z `font-semibold`, przycisk z `aria-expanded`.

## Wymaga właściciela
Nic blokującego ten krok. **Musisz to zrobić, żeby być najlepszym:** wgraj na produkcji (po wdrożeniu) 3 prawdziwe pliki `.htm` z EDGAR innych spółek niż SpaceX i Cipher — najlepiej jedną
spółkę dużą (np. 10-K Microsoft lub Apple), jedną bankową/finansową i jedną z ujemnym kapitałem — i napisz, które pokazują baner. To jedyny sposób, żeby tolerancję kontroli sprawdzić na czymś innym niż dwa pliki, na
których ją dobrano.
