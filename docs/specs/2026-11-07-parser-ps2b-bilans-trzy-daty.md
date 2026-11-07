# PS2b-1 — parser: bilans z trzema datami, numery not, liczby sklejone spacją

Status: **REVIEW** (07.11.2026). Zakres i przykłady: wpis PS2b w `docs/ROADMAP.md` (zdefiniowany przez PM po PS2a).
Ten krok robi część bilansową i numery not; reszta PS2b przechodzi do PS2b-2 (niżej).

## Problem i wartość
Polskie i europejskie sprawozdania (PZU, PKO BP, ORLEN) po przekształceniu danych mają w bilansie trzy daty:
31.12 roku bieżącego, 31.12 roku poprzedniego (przekształcone) i 1 stycznia roku poprzedniego. Parser zakładał dwie,
z wiersza „Wartość firmy 27 2 792 2 801 2 808” brał dwie ostatnie liczby i pokazywał **rok poprzedni jako bieżący**:
- Orlen SSF: aktywa 255 395 zamiast 265 048;
- PKO BP: kapitał 45 227 zamiast 52 370.

Do tego liczby powyżej 99 999 zlewały się w jedną. „Aktywa, razem 503 257 467 945 429 205” to jedna „liczba” 503 bln.
Ktoś, kto zrobi na tym DCF albo porówna rok do roku, dostanie złe wnioski bez żadnego ostrzeżenia.

## Zakres (logika parsera, UI bez zmian)
1. **Liczba dat bilansu z nagłówka sprawozdania.** Tytuł (linia zaczynająca się od „[skonsolidowane] sprawozdanie
   z sytuacji finansowej”, „statement of financial position”, „bilans”), daty do pierwszego wiersza danych. Trzy daty
   → trzy kolumny bilansu („Current”, „Prior”, „Prior 2”), także gdy okresy wykryto inaczej, a dat jest 3 (PKO BP).
   Spis treści („……… 8”) i proza są pomijane.
2. **Numer noty przed kolumnami, gdy wiersz ma N+1 liczb.** Nota z kropką („12.4”, „5.2”) jest odcinana zawsze;
   w dokumencie US tylko wtedy, gdy kwoty nie mają części dziesiętnej (wiersz EPS zostaje). Nota całkowita
   („27”, „25”, „37”) jest odcinana dopiero przy co najmniej 2 kolumnach. Przy jednej kolumnie każdy „label 82 (554)”
   by pasował.
3. **Liczby sklejone spacją w dokumencie europejskim** (`resegmentEuropean`). Ciągi 3+ grup („503 257 467 945 429 205”)
   są dzielone na tyle kolumn, ile ma tabela. Wybierany jest podział z najbardziej zbliżonymi rzędami wielkości
   (różnica ≤ 2 cyfry, bez noty). Ciągi 2-grupowe („525 225”) nie są dzielone. Wiersz PLN + EUR
   („262 742 264 463 61 489 60 824”), który „pasował” tylko dzięki sklejeniu, przestaje pasować.
4. Synonimy PZU dopisane na końcu list (rangi bez zmian): „Aktywa, razem”, „Kapitały, razem”, „Zobowiązania, razem”.

## Poza zakresem → PS2b-2
- Liczba kolumn RZiS w raportach europejskich (Platige: 4 kolumny, parser widzi 3; Orlen SSF: 1). Próba
  w tym kroku pogorszyła Orlen Q (koszt sprzedaży), więc ją wycofałem.
- Suma aktywów PKO BP (wiersz „AKTYWA 525 225 495 389 417 797” bez synonimu; dziś wygrywa tabela przekształceń).
- „Wszystkie wiersze” dalej pokazują sklejone liczby; podział dotyczy tylko metryk, bo tam znana jest liczba kolumn.
- SpaceX: przychody z RZiS, nie z noty (te same liczby).

## Kryteria akceptacji
1. PZU (fixture `pzu-2024-statements.txt`), 3 daty bilansu:
   - wartość firmy 2 792 / 2 801 / 2 808;
   - rzeczowe aktywa trwałe 4 256 / 4 445 / 4 304;
   - gotówka 15 127 / 17 702 / 15 960;
   - aktywa 503 257 / 467 945 / 429 205, kapitał 65 257 / 60 552 / 48 431, zobowiązania 438 000 / 407 393 / 380 774;
   - podatek 3 484 / 3 626;
   - kontrola aktywa = pasywa przechodzi.
2. ORLEN 2025 EN (`orlen-2025-balance-en.txt`):
   - aktywa 265 048 / 255 395 / 264 082;
   - kapitał 144 543 / 146 750 / 152 117;
   - zobowiązania 120 505 / 108 645 / 111 965 (suma się zgadza w każdej kolumnie);
   - wartość firmy 3 812 / 4 372 / 2 179.
3. PKO BP (`pkobp-2024-balance.txt`): rzeczowe aktywa trwałe 3 320 / 3 203 / 2 917, kapitał 52 370 / 45 227 / 35 707.
4. `resegmentEuropean`:
   - test podziału;
   - nie rusza „3 072 764 2 711 820” (tysiące zł), „525 225” ani liczb z przecinkiem;
   - wiersz PLN + EUR ma 4 kolumny.
5. Wszystkie testy z pkt 1–4 oblewają na main (sprawdzone) i przechodzą po zmianie.
6. Hashe parytetu 6 fixture'ów bez zmian (żadna metryka ani wiersz).
7. 7 tekstów zestawu PS2: tabela przed → po w PR; żadna wartość zgodna z dokumentem nie staje się błędna.
8. `/parser` przy 390 i 1440 px:
   - bilans z 3 kolumnami;
   - tabela przewija się w swoim kontenerze, strona nie;
   - 0 żądań do `/api/parser`, 0 błędów konsoli.
9. `tsc`, eslint, `npm test` i `npm run build` przechodzą.
