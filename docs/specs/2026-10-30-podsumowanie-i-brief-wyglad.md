# Podsumowanie dnia i brief: data, język, wygląd (2026-10-30)

## Problem
Zrzuty z produkcji z 30.10, godz. 20:22 (/newsy i Przegląd). Właściciel ocenił: „wygląda jak kupa”. Konkretnie:
- Na jednym ekranie stoją dwa różne kursy EUR/PLN: 4,3955 (+0.01%) w podsumowaniu i 4,3951 (−0,32%) w briefie. Brief nie ma daty, więc nie widać, że jest z danych z 29.10.
- Model komentuje własne wejście: „nie z danych serwisu”, „brak … w wejściu”, „źródło: serwis Savori”.
- Format liczb jest angielski: kropka dziesiętna, „-”, daty ISO, „4181” bez spacji tysięcy.
- Brief to wąska kolumna, a prawa połowa karty jest pusta.
- Na Przeglądzie są czerwone kropki, czerwone tagi, przy każdym newsie ten sam zielony badge i samotna ikona linku.

Użytkownik rano pyta: co wyszło i co z tego wynika. Ma to przeczytać w 1 minutę bez rozszyfrowywania.

## Co widzi użytkownik
Na telefonie (320–430 px) kolejność od góry:
1. **Rząd kafelków KPI** z `digest.dane` (świeży digest). Na kafelku: nazwa, wartość, zmiana ze znakiem „+” lub „−” i strzałką (kolor tylko jako dodatek do znaku), okres (np. „29.10”) i instytucja (NBP / GPW / GUS). Zastępuje „W liczbach: …” w akapicie. Akapit zostaje, ale bez liczb.
2. **Brief** z nagłówkiem „Brief na 30.10 · dane z 29.10”, czyli data briefu i data digestu wejściowego. Godzina generacji jest w stopce. Brief z danymi starszymi od dzisiejszego digestu **pokazujemy z datą, nie ukrywamy**. Sekcja nazywa się „Dane z 29.10”.
   - Teza jako lead (większy font).
   - Dane: każdy punkt to liczba i wniosek, bez powtarzania „odczyt RRRR-MM-DD”.
   - Polska i Świat. Pusta sekcja się nie renderuje.
   - Kalendarz jako jeden wiersz: „30.10 · GUS · CPI flash (październik)”, z godziną, jeśli kalendarz ją ma.
3. **Newsy** (Przegląd, `DailyDigestCard`):
   - cały wiersz jest linkiem o wysokości ≥ 44 px, bez osobnej ikony;
   - tagi neutralne (`mk-muted`), bez czerwieni;
   - badge „N niezależne relacje” tylko przy N ≥ 2, dyskretny (tekst w kolorze muted, nie zielona pigułka).

Od lg: kafelki w jednym rzędzie, brief ma Polskę i Świat w 2 kolumnach, kolumna tekstu ma ≤ 70 znaków, a karta nie zostawia pustej połowy.

## Dane i tekst
- `MacroChange` dostaje pole `source` (np. 'NBP' | 'GPW' | 'GUS'), ustawiane w `daily-macro.ts`. Linia wejścia briefu ma postać „EUR/PLN 4,3951, zmiana −0,32%, 29.10, NBP”.
- Delty formatowane po polsku od źródła (`daily-macro.ts`: przecinek, „−” U+2212, spacja tysięcy). Stare digesty w Firestore mają kropki, więc normalizację robi też UI przy renderze.
- Prompt briefu:
  - źródło to instytucja z wejścia;
  - zakaz komentowania wejścia i serwisu;
  - pusta sekcja to `[]` (świat 0–4);
  - liczby po polsku, daty „DD.MM”.
- Wyjście modelu przechodzi przez `normalizeBriefText` przed walidacją i zapisem: „-0.32%” → „−0,32%”, „2026-10-29” → „29.10”. Walidator liczb działa na tekście po normalizacji.
- Kalendarz w briefie: „DD.MM · nazwa wydarzenia” — `DailyDigestTomorrowEvent` nie ma instytucji ani godziny.
- Walidator odrzuca meta-frazy (lista w kodzie i w teście): „nie z danych serwisu”, „nie prognoza serwisu”, „w wejściu”, „w materiale”, „serwis Savori”, „danych wejściowych”. Odrzucenie oznacza, że zostaje poprzedni brief, jak dotąd.
- Bez nowych źródeł, cronów i zapytań przeglądarki, więc CSP bez zmian.

## Lekcje zastosowane
- [x] Liczba = liczba z cache (walidator bez zmian co do zasady).  - [x] Nic z „dziś” przed hydratacją (`useIsClient`).
- [x] 320/390 i 1280/1440 bez przewijania w bok.  - [ ] Świeżość briefu — osobno, ROADMAP 4a.

## Kryteria akceptacji
1. `npm test`: prawdziwa odpowiedź z 30.10 (fixture w `tests/fixtures/`) z „nie z danych serwisu” / „serwis Savori” / „w wejściu” — surowa zostaje odrzucona z powodem `meta`; po `cleanBriefBody` nie ma w niej żadnej meta-frazy.
   (Zmiana po wdrożeniu, zaakceptowana w REVIEW: cron najpierw czyści — wycina dopiski o pochodzeniu i usuwa całe
   punkty komentujące wejście — a odrzuca dopiero, gdy meta jest w tezie albo zostaje po czyszczeniu. Czyszczenie
   tylko usuwa tekst, więc nie wprowadza liczb; odrzucenie całości za jeden nawyk modelu zostawiałoby brief z wczoraj.)
2. `npm test`: `normalizeBriefText("EUR/PLN 4.3951 (-0.32%), 2026-10-29")` zwraca „EUR/PLN 4,3951 (−0,32%), 29.10”. Ten tekst przechodzi walidator, gdy wejście ma 4,3951 i −0,32.
3. `npm test`: wejście briefu ma przy każdej linii danych instytucję (NBP/GPW/GUS) i nie zawiera „serwis Savori”.
4. `npm test`: `daily-macro` formatuje deltę jako „−0,56%” i „+0,01%”. Akapit `summary.ts` nie zawiera już „W liczbach:”.
5. `npm test`: walidator przyjmuje brief z `swiat: []`.
6. Zrzut 390 px /newsy i Przegląd:
   - kafelki KPI z okresem i instytucją;
   - nagłówek „Brief na DD.MM · dane z DD.MM”;
   - brak kropek dziesiętnych, „-” i dat ISO w widocznym tekście;
   - `scrollWidth == clientWidth`.
7. Zrzut 1440 px: Polska i Świat w 2 kolumnach, brak pustej prawej połowy karty.
8. Przegląd: wiersz newsa jest jednym linkiem o wysokości ≥ 44 px, nie ma czerwonych tagów ani kropek, badge pojawia się tylko przy N ≥ 2.
9. 0 błędów konsoli (bez #418) i 0 naruszeń CSP. `tsc`, eslint i `npm test` są zielone.

## Poza zakresem / akcje właściciela
Świeżość briefu (4a), nowe źródła zagraniczne, brief JP, zmiana modelu lub cronu. Właściciel: brak.
