# PS3 — parser: raporty HTML z danymi XBRL (iXBRL) jako ścieżka główna

Status: **PLAN 07.11.2026 (PM), w toku.** Pierwszy krok do wdrożenia: **PS3a**. PS3b i PS3c dostają osobne REVIEW.

## Decyzja właściciela do potwierdzenia
Właściciel (07.11, dosłownie): „czytajmy tylko html, jebac to PDF gowniane, i zrobmy to na grubo … zeby html byl domyslny
i zeby wygladalo to rewelacyjnie … w pelni profesjonalne narzedzie”. Korekta PM do potwierdzenia:
1. **HTML iXBRL jest ścieżką domyślną i główną**: formularz, teksty, jakość, testy. PDF/TXT zostaje bez dalszego rozwoju heurystyk
   (PS2b-2 wstrzymane) i **bez kasowania kodu** (rutyna nie usuwa funkcji bez zgody).
2. Powód, żeby PDF nie znikał: obowiązek ESEF dotyczy **rocznych** sprawozdań skonsolidowanych (IFRS). Raporty kwartalne i półroczne
   spółek z GPW, NewConnect, polskie PAS i starsze 10-K nie mają znaczników. Cały zestaw PS2 to głównie takie raporty.
3. Przy braku znaczników: jasny komunikat „to nie jest iXBRL”, odsyłacz do instrukcji pobrania, PDF jako druga zakładka.

## Problem i wartość
Parser PDF zgaduje liczby z tekstu. Efekt na prawdziwych raportach (PS2): zły okres, sklejone kolumny, wiersz z noty zamiast z
bilansu, wiarygodnie wyglądające błędy. Pliki `.htm` z EDGAR i `.xhtml` z ESEF niosą **fakty XBRL**: dokładna wartość, okres,
jednostka, skala, znak, wymiary (segmenty). Użytkownik pyta „ile spółka zarobiła i skąd ta liczba” i dostaje odpowiedź bez zgadywania.

## Dane (zweryfikowane 07.11.2026 na dwóch plikach od właściciela)
| | SpaceX 10-Q Q3 2026 | Cipher Digital 10-K FY2025 |
|---|---|---|
| Plik | 2 366 623 B, sha256 `0b790160…` | 2 318 067 B, sha256 `8116bbe1…` |
| Źródło | EDGAR CIK 1181412, acc. 0001628280-26-066880, złożony 22.10.2026 | CIK 1819989, acc. 0001819989-26-000009, złożony 24.02.2026 |
| Format | XHTML (poprawny XML, `xmllint` 0 błędów), generator Workiva | to samo |
| Zawartość | 1 592 `ix:nonFraction` (29 zagnieżdżonych), 111 `ix:nonNumeric`, 487 kontekstów, 72 tabele | 1 347 / 196 / 262 / 76 |
| Formaty | `ixt:num-dot-decimal` 626, `ixt:fixed-zero` 182, bez formatu 732, `numwordsen` 18 (słowa, nie kwoty) | + `fixed-true/false`, `durday` |
| Skale | `scale` 6 w 1 415 faktach (mln), −2 (procenty), 0 | `scale` 3 (tys.) |

- Niezależne źródło 1: SEC `data.sec.gov/api/xbrl/companyconcept` (bez klucza, z nagłówkiem User-Agent). Zgodne co do dolara:
  Cipher przychody 223 942 000, `ProfitLoss` −822 244 000, aktywa 4 291 908 000, OCF −207 938 000, capex 487 921 000,
  dług długoterminowy 2 711 648 000, kapitał 805 535 000. SpaceX przychody Q3 14 575 mln, netto 4 404 mln, OCF 9M 13 097 mln.
- Niezależne źródło 2 (komunikaty): Cipher FY2025 przychody 223,942 mln USD, strata 822,244 mln, −2,15 USD/akcję
  (ciphermining.gcs-web.com, 24.02.2026). SpaceX Q3 2026: przychody 14,58 mld, zysk operacyjny 2,791 mld, netto 4,404 mld;
  segmenty Space 1,767 mld, Connectivity 5,25 mld, Super Intelligence (w pliku „SI”) 7,560 mld.
- Kalendarza, crona i zbioru w Firestore **nie ma**: plik wgrywa użytkownik, wszystko w jego przeglądarce. Sekcja
  `FRESHNESS_DATASETS` nie dotyczy. Atrybucja: „Dane: SEC EDGAR / spółka”, nazwa pliku i okres są w nagłówku wyniku.
- ESEF (PS3c): xhtml z `ifrs-full:`; paczka ZIP z `META-INF/` i `reports/` (podręcznik KNF). Tagowane są skonsolidowane roczne
  sprawozdania IFRS, noty blokami tekstu. Raportów kwartalnych ESEF nie ma. Próbek polskich nie mam: **PS3c wymaga 2 plików od właściciela**.

## Czytnik: wybór techniczny
- **Regex po tagach w Web Workerze**, nie `DOMParser`. `DOMParser` nie istnieje w workerze, a na głównym wątku zamraża stronę
  i trzeba by dociągać jsdom do testów. EDGAR i ESMA wymagają poprawnego XML-a, więc tokenizer jest bezpieczny, o ile:
  atrybuty czytane z uwzględnieniem cudzysłowów (`>` w wartości), zagnieżdżone `nonFraction` obsługiwane **stosem**, komentarze
  wycięte, prefiksy (`ix`, `xbrli`) rozpoznane z `xmlns`, pojęcia rozpoznane po **przestrzeni nazw**, nie po prefiksie.
  Niezbalansowany stos = błąd „plik uszkodzony”, nie wynik.
- Pomiar prototypu (Node 22, 07.11): SpaceX kontekstów 487 + faktów 1 592 + tabel 72 w **104 ms**, Cipher **28 ms**. Syntetyczny
  plik 23,7 MB (225 740 tagów) 122 ms, RSS 85 MB. Telefon ma być ~5–10× wolniejszy: typowy plik < 1 s, 50 MB ~ 3 s.
- Plik trafia do workera jako `File` (bez kopii stringa na głównym wątku). Limit HTML: **50 MB**, czas łączny jak dziś 240 s.
- Fakt = `{ concept, family, contextId, period, dims[], unit, value, scale, sign, decimals, factId, row, rowLabel, nil }`.
  Wartość: najpierw `format` (fixed-zero/zerodash → 0; num-dot-decimal; num-comma-decimal i `numcommadecimal`; numspace*),
  potem `scale` i `sign="-"`. **Nieznany format = pominięty i policzony w ostrzeżeniu, nigdy zgadywany.** Bez `format` wartość musi
  być zapisem dziesiętnym; przecinek = pominięty. Duplikaty (ten sam pojęcie, kontekst, jednostka) zostają jako jeden fakt
  z licznikiem; różna wartość poza dokładnością `decimals` = ostrzeżenie w kontrolach.
- Konteksty: instant / duration; każdy kontekst z wymiarem to segment lub produkt, **bez wymiarów = skonsolidowane**.

## Mapowanie na `MetricKey` (PS3a, tabela w jednym pliku `src/lib/parser/ixbrl/concepts.ts`)
Kolejność w liście = priorytet; pierwszy wynik wygrywa; tylko fakty bez wymiarów; bierzemy pierwszy w dokumencie (rachunek przed notami).
Znak wg XBRL: koszt, podatek i wypływy (capex, wykup akcji) dodatnie; `sign="-"` zdejmuje czytnik.
- Przychody: `Revenues` > `RevenueFromContractWithCustomerExcludingAssessedTax` > `…IncludingAssessedTax` > `SalesRevenueNet`
  (Cipher: `Revenues`; SpaceX: ten drugi). Ostrzeżenie, gdy inne pojęcie przychodów w rachunku jest większe.
- Wynik netto: `NetIncomeLoss` (przypisany akcjonariuszom, jak w komunikatach), potem `ProfitLoss`. Kontrole spójności liczą na
  `ProfitLoss` (skonsolidowany), jeśli jest.
- Dług: `currentDebt` = `LongTermDebtAndCapitalLeaseObligationsCurrent` > `LongTermDebtCurrent` > `ShortTermBorrowings`;
  `longTermDebt` = `LongTermDebtAndCapitalLeaseObligations` > `LongTermDebtNoncurrent`; `totalDebt` = suma (jak PDF), bez leasingu
  operacyjnego; leasing finansowy tylko gdy jest w tych pojęciach (SpaceX tak, Cipher nie).
- Reszta (RZiS, bilans, przepływy, EPS, akcje): pełna tabela w kodzie, zbudowana z nazw potwierdzonych w obu plikach: m.in.
  `CostOfRevenue`, `ResearchAndDevelopmentExpense`, `SellingGeneralAndAdministrativeExpense`, `CostsAndExpenses`, `OperatingIncomeLoss`,
  `InterestExpenseNonoperating`, `OtherNonoperatingIncomeExpense`, `IncomeTaxExpenseBenefit`, `Assets`, `Liabilities`,
  `StockholdersEquity`, `AccountsReceivableNetCurrent`, `PropertyPlantAndEquipmentNet` lub `…AndFinanceLeaseRightOfUseAsset…`,
  `NetCashProvidedByUsedInOperatingActivities`, `PaymentsToAcquirePropertyPlantAndEquipment`, `DepreciationDepletionAndAmortization`,
  `ShareBasedCompensation`, `PaymentsForRepurchaseOfEquity`, `EarningsPerShareBasic|Diluted`, `WeightedAverage…`.
- Jednostka tabeli: najczęstszy `scale` pieniężnych faktów rachunków (SpaceX 6 → „in millions”, Cipher 3 → „in thousands”).
  Wartości metryk dzielone przez tę skalę (jak w PDF), akcje tak samo, EPS bez zmian. Surowa wartość zostaje w fakcie.
- Kolumny: RZiS = konteksty pierwszego (w dokumencie) wiersza `Revenue*` lub `NetIncomeLoss`/`ProfitLoss` w kolejności faktów
  w wierszu (SpaceX: Q3'26, Q3'25, 9M'26, 9M'25). Bilans = konteksty pierwszego wiersza `Assets`. Przepływy: dopasowanie po datach do
  kolumn RZiS (SpaceX: Q3 puste, 9M wypełnione, jak w teście PS2a). **Nic nie opiera się na granicach `<table>`**: bilans Cipher
  jest rozcięty na dwie tabele (pozycje do „Accumulated deficit” w jednej, kapitał w drugiej).
- Kontrole: A = L + kapitał mezzanine (`TemporaryEquity…`, `RedeemableNoncontrollingInterest…`) + E. SpaceX 31.12.2025:
  50 754 + 38 752 + 2 573 = 92 079; Cipher: 3 456 054 + 30 319 + 805 535 = 4 291 908. Zysk operacyjny + pozaoperacyjne = przed
  opodatkowaniem: z `NonoperatingGainsLosses`, jeśli jest (Cipher −403 994), inaczej −odsetki + przychody odsetkowe + pozostałe
  (SpaceX 2 791 − 675 + 873 + 1 025 = 4 014). Brak składników = kontrola ukryta, nie „zła”.

## PS3a — pierwszy krok (~300 linii kodu + test, jeden przebieg)
Efekt dla właściciela: na produkcji wgrywa `.htm` z EDGAR i dostaje poprawny RZiS, bilans, przepływy, kafle i eksport.
Dokładny zakres:
- `src/lib/parser/ixbrl/read.ts` (czytnik), `concepts.ts` (tabela), `to-result.ts` (okresy, metryki, `Detection`, `extractedRows`,
  `rawText`, `pipeline`; reuse `computeDerived`, `computeNetCash`, `computeCapitalReturns`, `buildPerShareHeadline`, `validate`).
- `ParseResult` **bez zmian typu**. `segments` i `productRevenue` = `null` w PS3a (UI chowa sekcje; PS3b je wypełnia z wymiarów).
  `rawText` = „wyciąg faktów” (linia na wiersz: etykieta | pojęcie | wartości), więc `sourceLine` i okno źródła działają bez zmian.
  `matchedLabel` = etykieta wiersza z HTML, `note` = pojęcie + kontekst. Pewność HIGH tylko dla wartości wprost z faktu; wyliczone
  (`totalDebt`, FCF) bez zmian jako pochodne.
- Wejście: `.htm/.html/.xhtml` w `upload-strategy.ts` (limit 50 MB), `parse.worker.ts` przyjmuje `{ file }`, `UploadZone` `accept`,
  jedno zdanie w tekstach i w `/prywatnosc` (plik HTML też jest czytany tylko w przeglądarce).
- Poza zakresem PS3a: nowy wygląd, segmenty, produkty, ZIP/ESEF, `ixt` poza trzema rodzinami z tabeli, `continuedAt`.

### Kryteria akceptacji PS3a
1. Czytnik: testy syntetyczne na `>` w atrybucie, zagnieżdżonym `nonFraction`, `sign="-"`, `scale`, `xsi:nil`, `fixed-zero`, `num-comma-decimal`
   („1 234,5” → 1234,5), nieznanym formacie (pominięty + ostrzeżenie), innym prefiksie niż `ix:`, niezbalansowanym stosie (błąd).
2. Parytet SpaceX z `tests/parser-spacex-10q.test.ts` (kolumny Q3'26, Q3'25, 9M'26, 9M'25, mln USD): przychody 14575/5576/27083/13714;
   koszt 5478/2705/11361/6949; R&D 4596/2291/11658/5806; SG&A 1707/575/3365/1674; koszty razem 11784/5849/26378/14930; zysk operacyjny
   2791/−273/705/−1216; odsetki 675/514/1968/1372; pozostałe 1025/140/−937/342; przed podatkiem 4014/−492/−774/−1876;
   podatek −390/562/−361/714; netto 4404/−1054/−413/−2590; EPS 0,37/−0,36/−0,15/−0,89 (rozwodniony 0,35 w Q3'26); akcje 11942/2941/7274/2915.
   Przepływy `[null,null,9M'26,9M'25]`: OCF 13097/4120, capex 48069/13846, D&A 8934/4784, SBC 3833/1044, wykup 4426/525, FCF −34972/−9726.
   Bilans (30.09.2026, 31.12.2025): dług bieżący 2698/928, długoterminowy 36146/21968, razem 38844/22896, należności 4772/1579,
   papiery 38561/**0** (PDF dawał „—”, XBRL mówi 0 i to jest wzorzec), gotówka 51294/24747, aktywa 254045/92079.
3. Cipher 10-K (tys. USD, 2025/2024/2023, wartości odczytane z dokumentu i zgodne z komunikatem oraz API SEC): przychody 223942/151270/126842;
   koszt 81216/62364/50309; zysk operacyjny −421563/−43699/−20115; przed podatkiem −825557/−44317/−22210; podatek −3313/318/3567;
   netto −822244/−44635/−25777; EPS −2,15/−0,14/−0,10; D&A 198973/102448/59093; SBC 52787/42132/38470; OCF −207938/−87511/−94241;
   capex 487921/139495/20480; FCF −695859/−227 006/−114 721. Bilans (31.12.2025/2024): gotówka 628263/5585; aktywa 4291908/855446;
   zobowiązania razem 3456054/173493; kapitał 805535/681953; dług krótki 37793/32330, długi 2711648/0, razem 2749441/32330.
4. Obie próbki: `validation.passed === validation.total`, bez kontroli „znanej luki”. Kontrole mezzanine z sekcji wyżej.
5. `detection`: SpaceX „SEC 10-Q · Space Exploration Technologies Corp.”, USD, `unitScale` 1e6; Cipher „SEC 10-K · Cipher Digital Inc.”, 1e3.
   Okresy: 4 kolumny RZiS SpaceX w kolejności dokumentu, `current` = Q3'26; 3 kolumny Cipher; 2 daty bilansu każdy.
6. Wejście: plik HTML bez `ix:` → komunikat „to nie jest raport iXBRL” (nie „parser nie poradził sobie”); `.pdf` i `.txt` bez zmian
   (`parser-parity` i istniejące testy zielone, hash niezmieniony). Nowe pliki dopisane do listy `tests/parser-browser-path.test.ts` (brak sieci).
7. Wydajność: pełny plik SpaceX 2,3 MB — odczyt + mapowanie ≤ 1 500 ms w Node; Playwright z CPU 4×: wynik na ekranie ≤ 5 s od wyboru pliku.
8. Eksport CSV/JSON z wyniku XBRL działa bez zmian (`toCSV` zawiera przychody; JSON bez `rawText`, ≤ 4 MB — sprawdzić rozmiar `extractedRows`).
9. Fixture'y: `tests/fixtures/ixbrl/*.htm` ≤ 200 KB każdy, generowane skryptem `scripts/make-ixbrl-fixture.mjs` (bez `style=`, tylko konteksty
   użyte przez zachowane fakty, tabele RZiS/bilansu/przepływów/segmentów w oryginalnej kolejności) + README z numerem accession,
   sha256 oryginału i datą. Test na pełnych plikach uruchamia się tylko, gdy ustawiono `IXBRL_FULL_DIR` (inaczej `skip`).
10. `tsc`, `npm test`, eslint zmienionych plików, `npm run build` czysto. Playwright 390 i 1440 px, pełny plik SpaceX wgrany przez UI:
    0 przewijania w bok, 0 błędów konsoli, 0 naruszeń CSP, 0 żądań do `/api/parser`.
11. Produkcja: właściciel wgrywa swój plik SpaceX na telefonie; kafle zgodne z komunikatem (przychody 14,6 mld USD, netto 4,4 mld).

### REVIEW PS3a (07.11.2026, commit 185e0e9): FIX, odchylenia przyjęte
Przyjęte: (1) pojęcie RZiS i bilansu = największe pokrycie kolumn kotwicy, remis wg kolejności tabeli; przepływy i dane na akcję wg
kolejności tabeli (deterministyczne, bo liczy się tylko pokrycie kolumn kotwicy; sprawdzone na `otherIncome`, `intangiblesNet`,
`ppeNet`, `totalEquity`, `currentDebt`, `stockComp` obu plików); (2) `current` = najnowszy okres każdej długości (Q3'26 i 9M'26);
(3) etykieta = pierwsza niepusta z trzech pierwszych komórek, kolumny RZiS z pierwszego wiersza z ≥2 kontekstami; (4) 4 kontrole
w SpaceX (mezzanine dla obu dat). Do poprawienia przed SHIP: (a) duplikat faktu (ten sam pojęcie+kontekst+jednostka) zostawia
**wartość o większej precyzji** (`decimals`), a ostrzeżenie tylko przy różnicy większej niż grubsza precyzja (dziś: fałszywe
„12 duplicate facts differ” w Cipher, bo MD&A tnie 628 263 do 628,3 mln; wygrywa pierwszy w dokumencie, więc w pliku z MD&A
przed sprawozdaniem wygrałaby wartość zaokrąglona); (b) `tests/fixtures/ixbrl/README.md` (accession, sha256 oryginału, data,
komenda skryptu) — kryterium 9; (c) test eksportu CSV/JSON z wyniku XBRL — kryterium 8.

## PS3b — profesjonalny wygląd (2 przebiegi; projekt z agentem `mobile-designer`)
b1: formularz HTML domyślny („Wgraj raport z SEC lub ESEF”, instrukcja: EDGAR → „Filing Detail” → plik `.htm` z typem 10-K/10-Q;
GPW/IR → ZIP ESEF), PDF/TXT za zwijanym „Masz tylko PDF?”; plakietka „Dane z XBRL: dokładne wartości ze sprawozdania, bez OCR”;
pełne sprawozdania w kolejności raportu (tabele scalone, gdy bilans jest rozcięty); kliknięcie liczby otwiera arkusz: pojęcie, okres,
kontekst, jednostka, skala, `factId`, wartość surowa; przykład „Wczytaj SpaceX (HTML)” z fixture'u ≤ 150 KB.
b2: segmenty (oś segmentów, także para z `ConsolidationItemsAxis=OperatingSegmentsMember`: Space 1767, Connectivity 5248, SI 7560 = 14575)
i produkty (`ProductOrServiceAxis`: produkty 771 + usługi 13804); „wszystkie fakty” z wyszukiwarką po pojęciu; baner, gdy kontrola
nie przechodzi. **Przeniesione z PS2c (nie dublować):** Δ% od ujemnej bazy = „n/d” (dziś „▲517,8%”), Δ r/r w wierszach neutralnych ze znakiem
i strzałką (błąd `Math.abs`), „wypłata z FCF” ukryta przy ujemnym FCF, 10-Q na 390 px bez pustych kolumn Q3, nazwy kolumn bez
„Current/Prior”. Zostają w PS2c tylko pozycje wyłącznie PDF-owe (wstrzymane).
## PS3c — ESEF i IFRS (2 przebiegi; **projekt i REVIEW mocniejszym modelem**)
`.xhtml` i `.zip` (czytnik katalogu centralnego + `DecompressionStream('deflate-raw')`, Safari 16.4+; ~80 linii, bez nowej zależności),
mapowanie `ifrs-full:` (`Revenue`, `CostOfSales`, `ProfitLossFromOperatingActivities`, `ProfitLossBeforeTax`, `ProfitLoss`,
`ProfitLossAttributableToOwnersOfParent`, `Equity`, `CashFlowsFromUsedInOperatingActivities`, …), przecinek dziesiętny, nazwa spółki bez `dei:`
(LEI, `<title>`), banki i ubezpieczyciele bez „przychodów”, wynik funkcjonalny a rodzajowy. Dotyczy też 20-F z SEC. Wejście: 2 pliki od właściciela.
## PS3d (opcjonalny) — HTML bez XBRL: tabele HTML → tekst → istniejący parser PDF, z etykietą „wynik zgadywany, nie z XBRL”.

## Lekcje zastosowane (`docs/PRODUCT.md`)
- [x] Liczba = liczba z komunikatu (dwa źródła wyżej). [x] Właściwa baza/okres: kolumny z kontekstów, nie z nagłówka tekstu.
- [x] Nic zależnego od „dziś” przed hydratacją (wynik tylko po wyborze pliku). [x] 320/390/1440 px (kryterium 10).
- [x] Nowe źródło w przeglądarce → CSP: brak (brak `fetch`, worker z własnego pochodzenia, bez `'unsafe-eval'`).
- [x] `/prywatnosc` w tym samym PR. [ ] Cache/cron/freshness: nie dotyczy (brak zbioru serwerowego).

## Ryzyka
1. **Wiele pojęć na przychody** (Revenues vs RevenueFromContract…): lista priorytetów + ostrzeżenie; banki (`InterestAndDividendIncomeOperating`) w PS3c.
2. **Tabela rozcięta na strony** (Cipher): PS3a nie zależy od tabel; PS3b scala sąsiednie tabele aż do następnego tytułu.
3. **Mezzanine**: bez niego A = L + E oblewa SpaceX 31.12.2025 o 38 752 mln i Cipher o 30 319 tys. (stąd kontrola z sekcji wyżej).
4. **Brak `Liabilities`** u części spółek: wyliczyć jako `LiabilitiesAndStockholdersEquity` − mezzanine − kapitał i oznaczyć „wyliczone”.
5. **Wykup akcji Cipher** (`PaymentsForRepurchaseOfCommonStock` 89 585) to podatek od akcji pracowniczych, nie buyback: pojęcie mówi
   „wykup”, etykieta wiersza co innego. W PS3a kafel pokazuje etykietę wiersza; PS3b rozważa wyłączenie z „zwrotów dla akcjonariuszy”.
6. **Znak**: podatek Cipher 2025 = −3 313 (korzyść), `sign="-"` w 7 % faktów SpaceX i 13 % Cipher; błąd znaku oblewa kontrole, więc test na obu plikach.
7. **Formaty `ixt`**: widziane 3 rodziny; ESEF doda `num-comma-decimal`/`numcommadecimal` i daty. Nieznane = ostrzeżenie, nie zgadywanie.
8. **Plik niewłaściwy**: HTML zapisany z przeglądarkowego podglądu EDGAR (JS) lub wyciąg 8-K nie ma `ix:`; komunikat z instrukcją.
9. **Pamięć**: 50 MB HTML to ~100 MB stringa UTF-16 w workerze; stąd `File` do workera i limit 50 MB (typowy 10-K 2–15 MB).
10. **Obietnica „dokładne”**: wartości wyliczone (dług, FCF, marże) są oznaczone jako wyliczone; plakietka nie obejmuje ich.
11. **Kwartał Q4** nie istnieje w 10-K (FY − 9M): poza zakresem, UI pokazuje tylko kolumny z dokumentu.
12. **`continuedAt`/`ix:exclude`**: tylko teksty; 0 `ix:exclude` w obu plikach; PS3a ignoruje bloki tekstowe.

## Poza zakresem / Wymaga właściciela
- Pobieranie raportów po tickerze z SEC (sieć z przeglądarki, CSP, limity) — kierunek po PS3c. Teczka raportów i DCF — bez zmian w „PS4+”.
- **Musisz to zrobić, żeby być najlepszym:** wyślij 2 polskie raporty roczne ESEF (paczka `.zip` z IR, np. spółka WIG20 i spółka
  finansowa — bank albo ubezpieczyciel) oraz 1 raport roczny 20-F w iXBRL (spółka zagraniczna na IFRS). Bez nich PS3c mierzy tylko mapowanie z podręcznika.
- Potwierdź punkt 1 „Decyzja właściciela”: PDF zostaje jako zakładka, a nie znika.
- Model: PS3a i PS3b na Sonnet 5.5 (wąski zakres, parytet z istniejącym testem). Mocniejszy model: **jednorazowy REVIEW tabeli
  pojęć PS3a** (pliki `concepts.ts` i testy znaku/mezzanine) oraz **projekt i REVIEW PS3c** (IFRS, banki, ZIP).
