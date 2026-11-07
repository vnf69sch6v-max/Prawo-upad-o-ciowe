# PS2a — parser: RZiS i przepływy z 10-Q SpaceX zgodne z dokumentem

Status: **zrobione 07.11.2026, PR #89** (REVIEW 1: FIX → REVIEW 2: SHIP, commit 671751c). Kryteria 1–18 spełnione.
REVIEW 2: na 13 tekstach (6 fixture'ów i 7 z zestawu PS2) żadna wartość zgodna z dokumentem nie stała się błędna. Zmiany:
- PZU: zysk operacyjny, brutto i netto teraz poprawne;
- Orlen Q4 2024: dywidendy 4 819 / 4 818 / 6 385 / — (wcześniej z numerem noty);
- Orlen SSF i gotówka PZU: z błędnych na inne błędne (PS2b);
- PKO, Platige i Orlen SZ bez zmian wartości.

Format liczb ustalany jest tylko dla całego dokumentu: reguła per wiersz usunięta, bo rozbijała „39 119,801” u Orlenu.
Roadmapa: PS2 → PS2a. Następne: PS2b (numery not, bilans z trzema kolumnami), PS2c (UI).

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

**Odchylenia od zakresu, przyjęte w REVIEW 1 (07.11.2026).**
1. (c) „Income (loss) from operations” dopisany na końcu listy synonimów. `resolveMetric` ocenia kandydatów: 2 = liczba
   komórek pasuje do kolumn (dla przepływów 10-Q także liczba okresów 9M), 1 = nadmiarowe liczby pochodzą z etykiety,
   0 = inna tabela. Późniejszy synonim z wynikiem 2 wygrywa z wcześniejszym, który ma 0. Z wynikiem 1 wygrywa tylko wtedy,
   gdy stoi wcześniej w dokumencie. Na 6 fixture'ach żadna wartość metryki się nie zmienia. Na PZU to naprawia zysk
   operacyjny (15 697 / 16 135, było −3 342 / −4 183 z uzgodnienia segmentów) i zysk netto (12 221 / 12 519, było
   −2 562 / −3 235). Warunek: kryterium 15.
2. (g) i kreska jako kolumna wróciły do PS2a. Bez kreski wiersz z zestawienia zmian w kapitale („— — — — 2,421 — — 2,421”)
   wygrywał SBC, a samo (g) dawało gotówkę netto 13,0 mld. Razem: dług 38 844 / 22 896, papiery 38 561 / —, gotówka netto
   51 011, zgodnie z bilansem. Warunek: kryterium 16.
3. Cipher: synonim „Long-term borrowings, net” (bilans l. 225: 4 376 761 / 2 711 648). Wcześniej 4 597 (dyskonto
   z noty o długu), a kafel pokazywał gotówkę netto +355 mln USD zamiast długu netto 4,0 mld.
4. Pamięć `splitLeadingLabel` na jeden przebieg. `parseReport` jest 2–3× szybszy niż przed zmianą (pomiar PM:
   Microsoft 258 → 121 ms, SpaceX 297 → 127 ms, kombinat 104 → 34 ms).

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
9. Bilans SpaceX (zmienione w REVIEW 1, odchylenie 2; asercje wprost, bez `it.fails`):
   - ppeNet 89 483 / 42 602;
   - currentDebt 2 698 / 928 i longTermDebt 36 146 / 21 968 („Debt and finance leases”, leasing finansowy to dług, operacyjny nie);
   - totalDebt 38 844 / 22 896 jako suma z bilansu. Wiersz noty „Total debt 38,006 145 37,861” (3 liczby, 2 daty bilansu)
     przegrywa;
   - shortTermInvestments 38 561 / —, należności 4 772 / 1 579, gotówka netto z papierami 51 011.
10. Parytet:
    - `kombinat-konopny-2q2026` i `polish-ifrs-slash`: hash bez zmian;
    - `microsoft-10q`, `nvidia-10q`, `cipher-digital-10q`: nowe hashe. Opis PR ma tabelę każdej zmienionej wartości
      metryki: klucz, kolumna, przed → po, wartość i linia w fixturze;
    - żadna wartość wcześniej zgodna z dokumentem się nie zmienia;
    - wszystkie kontrole, które dziś przechodzą, nadal przechodzą: Microsoft 9, NVIDIA 8, Cipher 4.

    Zmiany metryk sprawdzone w REVIEW 1:
    - NVIDIA: D&A 997 / 611 i wartości niematerialne 700 / 807 (l. 91 i 59), wcześniej sklejone;
    - Cipher: longTermDebt 4 376 761 / 2 711 648 (odchylenie 3).
    - Microsoft: metryki bez zmian, a w „wszystkie wiersze” 29 wierszy rozklejonych, np. l. 1617 „$ 145 563%” → 145
      (563 to procent).
11. Czas `parseReport` na 6 fixture'ach przed i po (w opisie PR): wzrost ≤ 10%.
12. Czysto: `tsc --noEmit`, `npm test` (w tym `parser-browser-path`, bez sieci), eslint zmienionych plików, `npm run build`.
13. Zrzuty `/parser` z PDF-em SpaceX, 390 px i 1440 px: tabela RZiS jak w kryterium 2, kafel FCF „9M FY26”.
    Bez przewijania w bok, 0 błędów konsoli.

### FIX po REVIEW 1 (07.11.2026)
PM porównał wynik przed i po zmianie na 7 tekstach z pomiaru PS2 z 07.11: PZU SSF 2024, PKO BP, Platige i 4 dokumenty
Orlenu. Trzy nowe reguły psują liczby w raportach spoza fixture'ów. Każdy punkt wymaga testu w repo, który na obecnym
stanie nie przechodzi. Może to być fragment tekstu raportu albo pełny fixture, decyduje inżynier.

14. **Format liczb z tabel, nie z prozy.** Raport kwartalny Orlenu za Q4 2024 (EN) ma przecinki tylko w prozie, np.
    „PLN 296,947 million” (206 trafień). Tabele są ze spacjami (ok. 1 750 grup w wierszach z liczbami). Dziś
    `looksUsDocument` = true, a skutki są takie:
    - „Total assets 262 742 264 463 61 489 60 824” daje aktywa 60 / 824;
    - kapitał własny 35 / 285;
    - RZiS ma 9 okresów zamiast 4;
    - koszt własny sprzedaży, poprawny przed zmianą, jest przesunięty o kolumnę.

    Warunki po poprawce:
    - ten dokument nie jest „US”;
    - RZiS ma 4 okresy, a aktywa i kapitał są jak przed zmianą: 61 489 / 60 824 i 35 868 / 35 285. To kolumny EUR z tabeli
      „wybrane dane”, czyli błąd znany sprzed zmiany: „262 742 264 463” skleja się w jedną liczbę. Naprawa w PS2b;
    - SpaceX, Microsoft, NVIDIA, Cipher i Orlen SSF (EN, przecinki w tabelach) zostają „US”.
15. **Wynik 1 („liczby z etykiety”) tylko wtedy, gdy ostatnie N komórek stoi za ostatnim słowem wiersza.** Nagłówek dat
    nie może zostać wartością. Przykład z PZU: „Wartość firmy 31 grudnia 2024 31 grudnia 2023” daje dziś wartość firmy
    31 / 2023. Należności SpaceX zostają 4 772 / 1 579.
16. **Orlen Q4 2024: koszt własny sprzedaży 255 132 / 62 883 / 311 754 / 81 893**, tak jak przed zmianą. Źródło:
    sprawozdanie, wiersz „Cost of sales 5.2 (255 132) …”, albo nota „Cost of sales (255 132) …”. Po samej poprawce 14
    wygrywa wcześniejszy wiersz przekształcenia danych „Cost of sales (311 847) 93 - (311 754)”, bo kreska liczona jako
    kolumna daje mu 4 komórki. Uwaga z prototypu PM: pominięcie numeru noty („5.2”, „27”) przy N+1 komórkach naprawia ten
    wiersz i podatek PZU (3 484 / 3 626). Zmienia jednak też PKO BP (rzeczowe aktywa trwałe 3 203 / 2 917 → 18 / 41)
    i Platige, więc każdą zmianę trzeba sprawdzić w dokumencie.
17. **Tabela w PR: każda zmiana wartości metryki na 13 tekstach** (6 fixture'ów i 7 tekstów zestawu PS2), w formacie
    przed → po, z linią. Żadna wartość zgodna z dokumentem przed zmianą nie staje się błędna. Zmiana z błędnej na inną
    błędną jest dopuszczalna, ale musi być w tabeli.
18. Drobne:
    - test sprawdza `derived.fcf` dla 9M'25 (−9 726) i dla obu kolumn Q3 (`null`) oraz brak 873155, 278278 i 472472
      w wyniku (kryteria 5 i 7);
    - `AGENTS.md`, sekcja parsera: format liczb ustalany na poziomie dokumentu; w wierszu US „- 1,234” to pusta kolumna
      i liczba; kreska to kolumna; notki „related party” są wycinane.

## Poza zakresem
- PS2b: numery not przed liczbami i bilans z trzema datami (dane przekształcone). Dług, kreska jako kolumna, papiery
  wartościowe i gotówka netto weszły do PS2a (odchylenie 2).
- PS2c: UI. Δ% od ujemnej bazy (dziś „▲517,8%”) i baner nieudanych kontroli. Kontrola 1c z odsetkami (metryka
  `interestIncome`), żeby baner nie dawał fałszywego alarmu. Z REVIEW 1:
  - „Wypłata z FCF −12,7%” przy ujemnym FCF;
  - na 390 px w „Przepływy i dług” dwie kolumny „—” spychają jedyne liczby (9M) za krawędź;
  - „Koszty operacyjne razem” SpaceX to „Total costs and expenses” z kosztem własnym. Porównanie z R&D + SG&A obniża
    pewność poprawnej liczby do MEDIUM.
- Ogólne notki w nawiasach poza „related party”.
- Kwartalne przepływy (Q3 = 9M − 6M z poprzedniego 10-Q): wymaga dwóch dokumentów.

## Działania właściciela
Brak blokujących. Po wdrożeniu: wgraj ten sam PDF SpaceX na telefonie i potwierdź liczby z kryterium 2 i 5.
Dalej przysyłaj raporty, na których parser zawodzi (ROADMAP → „Wymaga właściciela”).
