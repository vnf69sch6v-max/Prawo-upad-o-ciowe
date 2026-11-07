# PS2a — parser: RZiS i przepływy z 10-Q SpaceX zgodne z dokumentem

Status: **w toku** (07.11.2026). Roadmapa: PS2 → PS2a. Następne: PS2b (bilans), PS2c (UI).

## Problem i wartość
Właściciel wgrał 07.11 prawdziwy raport (10-Q SpaceX za Q3 2026). Na ekranie: „Pozostałe przychody” 140 885 632 mln USD,
zysk operacyjny z tabeli segmentu Connectivity, podatek bez znaku (4,0 − 0,4 ≠ 4,4), puste FCF, SG&A „nie znaleziono”.
Użytkownik parsera pyta „ile spółka zarobiła i ile gotówki wygenerowała”. Liczba inna niż w sprawozdaniu jest błędem.
Pewnie podana zła liczba jest gorsza niż „—”. Ten krok naprawia logikę parsera dla RZiS i przepływów, bez zmian w UI.

## Co widzi użytkownik (/parser, 390 px i 1440 px, układ bez zmian)
- Tabela RZiS: wszystkie wiersze jak w sprawozdaniu (tabela niżej). Podatek ujemny tam, gdzie jest korzyść podatkowa.
- Przepływy: kolumny Q3 „—” (10-Q nie podaje przepływów za kwartał), kolumny 9M z liczbami. Kafel FCF: „9M FY26”, −35,0 mld USD (−34 972 mln).
- Widok „wszystkie wiersze”: żadnych liczb sklejonych ze spacji („3 278” → 3 | 278).
- Kafel „Gotówka netto” bez zmian (51,7 mld USD, wynik przypadkowo bliski prawdy). Naprawa w PS2b, z powodem niżej.

## Dane (zweryfikowane 07.11.2026)
- Źródło: SEC EDGAR, Space Exploration Technologies Corp., CIK 1181412, 10-Q za okres do 30.09.2026, złożony 22.10.2026,
  accession 0001628280-26-066880, https://www.sec.gov/Archives/edgar/data/1181412/000162828026066880/spcx-20260930.htm
  (HTTP 200, 2,37 MB; wiersze RZiS, CF i noty o długu zgodne z tekstem fixture'u).
- Kontrola krzyżowa (komunikat i 8-K, prasa 20–21.10): przychody 14,58 mld USD, zysk netto 4,404 mld, zysk operacyjny 2,791 mld,
  capex 9M 48,069 mld, gotówka 51,3 mld i papiery wartościowe 38,6 mld. Zgodne z dokumentem.
- Fixture: `tests/fixtures/spacex-10q-q3-2026.txt`. To tekst z pdfjs (legacy) z wydruku HTML do PDF w Chromium (61 stron),
  sha256 `e445a3de…92666a34`, 205 KB. Dokument SEC jest publiczny, jak `microsoft-10q.txt`.
- Numery linii poniżej liczone od 1. RZiS: l. 172–204, przepływy: l. 303–362, kapitał własny: l. 224–299.
- Brak zbioru, crona, kalendarza i nowego źródła w przeglądarce. Parsowanie zostaje lokalne (PS1).

## Zakres PS2a (decyzja PM)
a. **Przecinek oksfordzki**: w `normalizeLabel` „, and ” = „ and ” (SG&A, PP&E, capex).
b. **Notki „(related party …)”** i „(including related party …)” są usuwane z etykiety, także gdy zajmują do 4 linii.
   Liczby z linii zamykającej nawias trafiają do linii etykiety. Linie kontynuacji stają się puste, więc liczba linii,
   `sourceLine` i surowy tekst się nie zmieniają.
c. **Synonimy**: „Income (loss) from operations” przed „Income from operations”. „Income (loss) before income taxes” przed
   „Income before income taxes”. Bez ogólnego przestawiania kandydatów między synonimami. Kolejność synonimów jest
   celowa (np. „Total cost of revenue” przed „Cost of revenue”), a zmiana ruszyłaby wszystkie fixture'y.
d. **Format liczb na poziomie dokumentu**: w dokumencie z amerykańskim zapisem spacja nigdy nie łączy cyfr.
   Reguła per wiersz (wiersz z „1,025” i bez przecinka dziesiętnego) nie wystarcza. Nie naprawia „3 278 (6) 472” (SpaceX l. 182)
   ani D&A „997 611” w `nvidia-10q` (l. 91; dziś 997 611 zamiast 997 | 611). Polskie raporty („349 072”) bez zmian.
e. **Znak podatku z uzgodnienia, osobno w każdej kolumnie.** Jeśli zysk brutto − |podatek| = netto, podatek jest dodatni.
   Jeśli zysk brutto + |podatek| = netto, podatek jest ujemny (korzyść). Gdy żaden znak się nie uzgadnia albo brakuje
   zysku brutto lub netto: wartość bezwzględna i flaga. Kontrola „Pre-tax − Tax = Net income” i efektywna stopa podatku
   (`derived.ts`) używają podatku ze znakiem.
f. **Przepływy w 10-Q**: wiersz CF z liczbą wartości równą liczbie okresów najdłuższych (9M) trafia do tych kolumn.
   Krótsze kolumny dostają `null`. Metryki CF (OCF, capex, D&A, SBC, skup akcji) pochodzą z rachunku przepływów,
   jeśli go wykryto. Pułapka: „Share-based compensation — — — — 2,421 — — 2,421” (zestawienie zmian w kapitale, l. 234)
   ma dwie liczby, a stoi przed CF. Tabele segmentów (l. 1366–1369) też nie mogą wygrać. Skup akcji: ogólny synonim
   „Payments for repurchase of common” (prefiks, drugi stopień). Microsoft ma CF w 4 kolumnach (3M/3M/9M/9M) — bez zmian.
h. **EPS**: nagłówek „Net income (loss) per share …” rozpoznany. Pułapka: „Weighted average shares used in computing net
   income (loss) per share” musi zostać nagłówkiem liczby akcji, inaczej zgubimy średnią liczbę akcji.

**Przeniesione.** (g) dług → **PS2b**. Samo (g) pogarsza wynik. Usunięcie wykluczeń „lease” i synonimy „Debt and finance
leases, current / net of current” dają dług 38 844. Papiery wartościowe zostają wtedy 557 zamiast 38 561: parser wybiera
wiersz z dwiema liczbami z alokacji ceny przejęcia (l. 1503) zamiast wiersza bilansu „38,561 —”, bo kreska nie liczy się
jako kolumna. Kafel pokazałby 51 294 + 557 − 38 844 = **13,0 mld** zamiast **51,0 mld** (dziś 51,7).
Dlatego PS2b obejmuje razem: dług z bilansu, kreskę jako kolumnę (z pozycją), papiery wartościowe i gotówkę netto.
Do tego wiersz „Total debt 38,006 145 37,861” (3 liczby, a okresy bilansu są 2) przestaje być „direct total”. Notatka
„reconciles with current + long-term” nie może się pojawić, gdy obu składników brak. Kontrola 1c (odsetki), Δ% od ujemnej
bazy i baner nieudanych kontroli → **PS2c**.

## Lekcje zastosowane
- [x] Liczba = liczba z dokumentu, sprawdzona z komunikatem i prasą (wyżej).
- [x] Telefon 390 px i desktop 1440 px: zrzuty z wynikami (bez zmian układu).
- [x] Dane użytkownika: nic nie trafia na serwer ani do bazy, `/prywatnosc` bez zmian.
- [ ] Pozostałe nie dotyczą: brak zbioru, crona, kontroli świeżości, CSP i renderu zależnego od „dziś”.

## Kryteria akceptacji
Wartości w mln USD, kolumny Q3'26 / Q3'25 / 9M'26 / 9M'25. Test: `tests/parser-spacex-10q.test.ts`.
1. Nagłówek testu podaje URL, accession, datę złożenia, metodę ekstrakcji i sha256 fixture'u.
2. RZiS, wartości dokładne:

   | metryka | Q3'26 | Q3'25 | 9M'26 | 9M'25 |
   |---|---|---|---|---|
   | revenue | 14 575 | 5 576 | 27 083 | 13 714 |
   | costOfRevenue | 5 478 | 2 705 | 11 361 | 6 949 |
   | rAndD | 4 596 | 2 291 | 11 658 | 5 806 |
   | sga | 1 707 | 575 | 3 365 | 1 674 |
   | totalOpEx | 11 784 | 5 849 | 26 378 | 14 930 |
   | operatingIncome | 2 791 | −273 | 705 | −1 216 |
   | interestExpense | 675 | 514 | 1 968 | 1 372 |
   | otherIncome | 1 025 | 140 | −937 | 342 |
   | incomeBeforeTax | 4 014 | −492 | −774 | −1 876 |
   | incomeTax | −390 | 562 | −361 | 714 |
   | netIncome | 4 404 | −1 054 | −413 | −2 590 |

   `interestExpense` jest wartością bezwzględną (`magnitude`), jak dziś.
3. `sourceLine` dla operatingIncome, interestExpense, otherIncome, incomeBeforeTax i incomeTax leży w RZiS (l. 172–204).
   Dla wierszy z notką to linia początku etykiety (np. odsetki: l. 186).
4. EPS podstawowy: 0,37 / −0,36 / −0,15 / −0,89. EPS rozwodniony: 0,35 / −0,36 / −0,15 / −0,89.
   Średnia liczba akcji bez zmian: podstawowa 11 942 / 2 941 / 7 274 / 2 915, rozwodniona 12 475 / 2 941 / 7 274 / 2 915.
5. Przepływy w kolumnach 9M'26 / 9M'25, obie kolumny Q3 `null`, każdy `sourceLine` w l. 303–362: OCF 13 097 / 4 120,
   capex 48 069 / 13 846, D&A 8 934 / 4 784, SBC 3 833 / 1 044, skup akcji 4 426 / 525.
   `derived.fcf`: 9M'26 −34 972, 9M'25 −9 726, Q3 `null`.
6. Znak podatku, testy jednostkowe na danych syntetycznych: żaden znak się nie uzgadnia → wartość bezwzględna i flaga;
   korzyść przy zysku brutto 100 → efektywna stopa −10%, nie +10%.
7. Format liczb w `extractedRows` SpaceX: l. 182 → [3, 278, −6, 472], l. 189 → [873, 155, 1 426, 370]. W całym wyniku
   nie występuje żadna z wartości 140 885 632, 873 155, 3 278, 278 278, 472 472. `nvidia-10q`: D&A = 997 / 611.
8. Kontrole SpaceX:
   - „Pre-tax − Tax = Net income” i „Assets = Liabilities + Equity” przechodzą;
   - „Operating income + Other = Pre-tax income” nie przechodzi, przy poprawnych wejściach 2 791 + 1 025 wobec 4 014.
     To znana luka: kontrola pomija odsetki. Test to opisuje, a PS2c to odwraca.
9. Bilans SpaceX bez zmian względem wyniku sprzed zmiany, z jednym wyjątkiem: ppeNet = 89 483 / 42 602.
   Bez zmian zostają totalDebt, currentDebt, longTermDebt, shortTermInvestments i netCash. Cele PS2b są w teście jako
   `it.fails`: dług 38 844 / 22 896, papiery 38 561, gotówka netto z papierami 51 011.
10. Parytet:
    - `kombinat-konopny-2q2026` i `polish-ifrs-slash`: hash bez zmian;
    - `microsoft-10q`, `nvidia-10q`, `cipher-digital-10q`: nowe hashe. Opis PR ma tabelę każdej zmienionej wartości
      metryki: klucz, kolumna, przed → po, wartość i linia w fixturze;
    - żadna wartość wcześniej zgodna z dokumentem się nie zmienia;
    - wszystkie kontrole, które dziś przechodzą, nadal przechodzą: Microsoft 9, NVIDIA 8, Cipher 4.
11. Czas `parseReport` na 6 fixture'ach przed i po (w opisie PR): wzrost ≤ 10%.
12. Czysto: `tsc --noEmit`, `npm test` (w tym `parser-browser-path`, bez sieci), eslint zmienionych plików, `npm run build`.
13. Zrzuty `/parser` z PDF-em SpaceX, 390 px i 1440 px: tabela RZiS jak w kryterium 2, kafel FCF „9M FY26”.
    Bez przewijania w bok, 0 błędów konsoli.

## Poza zakresem
- PS2b: bilans (dług, kreska jako kolumna, papiery wartościowe, gotówka netto).
- PS2c: UI. Δ% od ujemnej bazy (dziś „▲517,8%”) i baner nieudanych kontroli. Kontrola 1c z odsetkami (metryka
  `interestIncome`), żeby baner nie dawał fałszywego alarmu.
- Zmiana sortowania kandydatów między synonimami; ogólne notki w nawiasach poza „related party”.
- Kwartalne przepływy (Q3 = 9M − 6M z poprzedniego 10-Q): wymaga dwóch dokumentów.

## Działania właściciela
Brak blokujących. Po wdrożeniu: wgraj ten sam PDF SpaceX na telefonie i potwierdź liczby z kryterium 2 i 5.
Dalej przysyłaj raporty, na których parser zawodzi (ROADMAP → „Wymaga właściciela”).
