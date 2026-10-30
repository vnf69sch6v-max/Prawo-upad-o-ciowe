# Brief po digeście: jedna karta „Dzień w gospodarce” (2026-10-30)

## Problem
Zrzut /newsy z 30.10 (#72): kafelki pokazują WIG20 z 30.10 (−2,42%), a brief pod nimi pisze „WIG20 wzrósł” (4284, +1,01%) na danych z 29.10. Przyczyna: cron `brief` (05:10 UTC) bierze wczorajszy digest, a digest powstaje o 16:05 UTC. Przez większość dnia dwie karty opisują więc dwa różne dni. Użytkownik ma dostać jedną spójną odpowiedź na pytanie „co się dziś stało i co z tego wynika”.

## Co widzi użytkownik
- Gdy `brief.dataDate === digest.date`, /newsy pokazuje JEDNĄ kartę „Dzień w gospodarce · DD.MM”. Kolejność treści:
  - kafelki KPI;
  - teza;
  - „Co mówią liczby” (2–3 wnioski);
  - „Cały brief”: Polska | Świat (2 kolumny od lg) i kalendarz „Jutro” / „W tym tygodniu”;
  - stopka DeepSeek.
- W tej karcie nie ma akapitu-szablonu ani akapitu Groka. Link „Całe podsumowanie” zostaje.
- Gdy daty się różnią (np. 16:05–17:20 UTC albo awaria crona), widok zostaje jak dziś: dwie karty, każda ze swoją datą.
- Na telefonie ta sama kolejność w jednej kolumnie. Bez przewijania w bok przy 320/390 px.

## Dane i harmonogram
Korekty względem planu koordynatora:
- **Cron dzienny** `brief` o 17:20 UTC. `news-digest` (16:05) kończy się najpóźniej przed 17:00 mimo jittera Hobby. Obie godziny są poza szczytem DeepSeek.
  - Bierze WYŁĄCZNIE dzisiejszy digest Warsaw (zapisany jako `dataDate`).
  - **Bez fallbacku na wczorajszy digest.** Wczorajszy brief już go opisuje, więc fallback płaciłby drugi raz za ten sam dzień. Brak dzisiejszego digestu daje `error`, przebieg „Częściowo” i zostawia poprzedni brief.
  - Kalendarz: najbliższy dzień roboczy („Jutro”), nie dzisiejszy, bo o 18:20 dzisiejsze publikacje już były.
- **Brief tygodniowy w niedzielę o 17:20 UTC**, nie w poniedziałek:
  - wejście: 7 digestów pn–nd;
  - kalendarz: pn–pt nadchodzącego tygodnia;
  - pokazywany do następnej soboty;
  - w poniedziałek rano jest już gotowy.
- Prompt: `dane` = 2–3 wnioski z liczb, bez przepisywania wartości (są w kafelkach).
- Walidator: ta sama liczba w więcej niż jednym punkcie `dane` daje odrzucenie z powodem `powtórzenie`. Teza może powtórzyć jedną liczbę.
- Zmiany techniczne:
  - `vercel.json`: `20 17 * * *`;
  - `CRON_SPECS.brief`: etykieta i harmonogram (`maxAgeHours` 26);
  - ROADMAP 4a: oczekiwana data briefu = dziś po 18:30 Warsaw, wcześniej wczoraj.
- Porównanie dat (`dataDate` vs `digest.date`) dotyczy samych danych, nie zegara. Etykiety „Jutro” / „dziś” renderujemy dopiero po `useIsClient`.

## Kryteria akceptacji
1. `npm test`: o 17:20 UTC `runBrief('daily')` bez dzisiejszego digestu zwraca `error` i nie woła `fetch`. Z dzisiejszym digestem `dataDate` = dzisiejsza data.
2. `npm test`: tygodniowy brief odpala się w niedzielę (Warsaw), bierze 7 digestów, a jego kalendarz obejmuje pn–pt następnego tygodnia.
3. `npm test`: brief z tą samą liczbą w 2 punktach `dane` zostaje odrzucony (`powtórzenie`).
4. `npm test`: `cron-runs` i `function-limits` są zielone, a `vercel.json` ma `20 17 * * *`.
5. Zrzut 390 i 1440 px przy równych datach: jedna karta „Dzień w gospodarce · DD.MM”, bez akapitu-szablonu, `scrollWidth == clientWidth`.
6. Zrzut przy różnych datach: dwie karty z dwiema różnymi datami. 0 błędów konsoli, w tym #418.
7. Po pierwszym przebiegu (30.10 lub 31.10, 17:20 UTC): `health/cron_runs.brief` = ok. PM sprawdza 3 liczby briefu z kafelkami tego samego dnia.

## Poza zakresem
Wyłączenie generacji Groka, gdy karta jest scalona (do decyzji po tygodniu, przy porównaniu kosztów), oraz świeżość (4a, tylko reguła zaktualizowana tutaj).
