# Brief: bramka liczebników słownych — wąskie poluzowanie (2026-11-03)

## Problem i wartość
Cron `brief` odrzuca własne wyniki: 31.10 („6"), 2.11 („pięciu"), 3.11 („obu", 3 próby z 3, 0,0014 USD). Skutek:
`news-brief` = `stale`, `/api/health/freshness` 503, alarm, a użytkownik widzi stary brief. Brief to najwyżej
wyceniana funkcja (1 minuta rano), więc musi przechodzić stabilnie.

## Diagnoza (kod)
- `WORD_NUMERAL_SRC` (`src/lib/news/summary.ts`) łączy dwie różne rzeczy: (1) słowa, które **liczą lub twierdzą
  konkretną ilość/kolejność** (dwa, pięciu, trzeci, pierwszy…) — to jest zasada „liczby/fakty tylko z wejścia"
  (spec `2026-10-30-brief-deepseek.md`, walidator: liczebniki słowne tylko te z wejścia) i komentarz w summary.ts
  („trzeci miesiąc z rzędu"); (2) kwantyfikatory zbiorcze `oba|obie|obu`, które nie niosą nowego faktu —
  odsyłają do dwóch rzeczy wymienionych chwilę wcześniej w zdaniu („w obu przypadkach", „obu rynkach").
- Prompt (`brief.ts` ~l.89–90) zakazuje „oba", a model flash i tak pisze „obu" w naturalnej polszczyźnie. Zakaz
  na poziomie promptu przegrywa z idiomem; 3 próby tą samą pułapką nie pomagają (3.11).
- `validateSummary` i `collectBriefAllowed` używają tego samego regexu — zmiana w jednym miejscu.

## Decyzja: opcja A, wąska
Usunąć z `WORD_NUMERAL_SRC` tylko **`oba|obie|obu`**. Zostają: kardynalne (dwa…dziesięć), porządkowe
(pierwsz*, drug*, trzec*, czwart*), `połowa|połowę`.
Uzasadnienie:
- „obu" nie wprowadza nowej liczby ani kolejności; odwołuje się do dwóch obiektów obecnych w tekście. Najgorszy
  przypadek (model napisze „obu" o dwóch rzeczach, choć wejście ma trzy) jest drobną nieścisłością, a nie zmyśloną
  wartością — a liczby cyframi nadal są sprawdzane osobno.
- „połowa" zostaje: to twierdzenie o udziale (≈50%), czyli ukryta liczba, którą model sam policzył.
- Odrzucone B (sanityzacja/usuwanie zdań): usuwanie zdania z briefu psuje sens i punkty liczone w `za mało
  punktów`; dopisywanie zakazanych słów do wejścia to ta sama walka z idiomem, którą już przegraliśmy w PR #82.
  Odrzucone A-szerokie (kardynalne „bez konkretnej liczby"): nierozstrzygalne regexem — „dwa banki" to właśnie liczenie.
- Zmiana obejmuje też `validateSummary` (podsumowanie dnia) — ten sam wyraz, ta sama logika; to świadome.

## Zmiany do zrobienia (≈15 linii)
1. `src/lib/news/summary.ts`: z `WORD_NUMERAL_SRC` usunąć `|oba|obie|obu`; w komentarzu nad stałą dopisać akapit:
   „⚠ NIE dopisywać oba/obie/obu — kwantyfikator zbiorczy, nie liczenie; odrzucał brief 3.11 trzykrotnie".
2. `src/lib/news/brief.ts` (prompt, ~l.89–90): usunąć „oba" z listy zakazanych i dopisać zdanie, że „oba/obie/obu"
   wolno, gdy odnoszą się do dwóch rzeczy wymienionych w tym samym zdaniu. Zostawić frazę
   „liczebników słownych i porządkowych" (test l.62 w `tests/news-brief.test.ts` jej wymaga).
3. `tests/news-brief.test.ts` (obok testu z l.80):
   - `'w obu przypadkach'` / `'Obie waluty…'` w `teza`/`dane` → `validateBrief(...).ok === true`;
   - nadal odrzucone: „Inflacja spada trzeci miesiąc z rzędu." (istniejący), „pięciu spółek", „dwa banki", „połowa kategorii";
   - nadal przepuszczony cytat słowa z wejścia.
4. `tests/summary.test.ts` (jeśli jest test na `WORD_NUMERALS_G`/`validateSummary` z „oba/obu" jako odrzuconym — zmienić
   oczekiwanie; `grep -rn "oba\|obu" tests`).
5. ROADMAP: 4a' — dopisać „4.11: opcja A (oba/obie/obu dozwolone)". Po wdrożeniu: ręcznie `curl -H "Authorization:
   Bearer $CRON_SECRET" https://savori.space/api/cron/brief`, potem `/api/health/freshness` → `news-brief` nie `stale`.

## Kryteria akceptacji
1. `npm test` zielony; nowe testy z pkt 3 przechodzą, „trzeci miesiąc z rzędu" nadal odrzucone.
2. `grep -n "WORD_NUMERAL_SRC" src/lib/news/summary.ts` — brak `oba|obie|obu`, są `połowa|połowę`.
3. Ręczny przebieg crona `brief` po wdrożeniu: wpis `ok` w `health/cron_runs`, `/api/news/brief?kind=daily` z dzisiejszą datą.
4. `/api/health/freshness`: `news-brief` ≠ `stale`/`error` (200, jeśli reszta zielona).
5. Kontrola PM (4c'): 3 liczby z briefu zgodne ze stronami; przez tydzień 0 odrzuceń słownych w dzienniku crona.

## Poza zakresem
Zmiana modelu, sanityzacja tekstu, dopuszczanie kardynalnych („dwa") i „połowa", tłumaczenia, zmiana `ATTEMPTS`.

## Akcje właściciela
Brak (klucz DeepSeek jest). Jeśli odrzucenia słowne wrócą po 10.11 mimo A: rozważyć model z lepszym
przestrzeganiem instrukcji (decyzja właściciela — koszt).
