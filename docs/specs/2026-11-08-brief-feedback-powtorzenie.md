# Brief: właściwa wskazówka przy powodzie „powtórzenie” — 2026-11-08

Status: **zrobione 08.11.2026** (PR #94; kryterium 4 — odczyt po cronie 17:20 UTC — jeszcze do potwierdzenia).

Decyzja PM: **opcja (a)** — powód-specyficzna wskazówka dla ponownej próby. Opcja (b) (lokalne wycinanie liczby) odrzucona.
Bramka `validateBrief` bez zmian. Brak nowych serii danych, więc bez `DatasetSpec` (freshness `news-brief` już istnieje).

## Problem i wartość
Zdrowie 8.11.2026: `crons.attention: ['brief']`, cron `brief` (17:20 UTC) `partial` — dzienny brief odrzucony 3 próbami z 3
(`powtórzenie: 0.4`: ta sama liczba w dwóch punktach `dane`), tygodniowy ok. Skutek: 8.11 nie ma dziennego briefu,
`news-brief` stale (ostatni 2026-11-07). Użytkownik traci kartę briefu na cały dzień.

## Diagnoza (zweryfikowana w kodzie)
- `brief-server.ts` l.204: `feedback = reason`. `callDeepseek` l.57 składa:
  `POPRZEDNIA ODPOWIEDŹ ODRZUCONA: powtórzenie: 0.4. Napisz brief od nowa, używając wyłącznie liczb z danych.`
  Zdanie końcowe jest stałe i pasuje tylko do powodu „liczby spoza wejścia”. Dla „powtórzenie” nie mówi, co zmienić — a
  liczba 0.4 JEST w danych, więc model czyta „używaj liczb z danych” jako potwierdzenie, że może ją użyć znowu.
  Dodatkowo kanoniczny zapis `0.4` (kropka) różni się od polskiego `0,4` w tekście modelu.
- Prompt systemowy już mówi „każdą liczbę przywołaj najwyżej raz” (l.103), ale to jedna reguła z siedmiu; po odrzuceniu
  model dostaje sprzeczny sygnał i losuje od nowa.
- Naprawa z 6.11 (`isRepairableReason`) celowo nie obejmuje „powtórzenia” — i słusznie (patrz niżej). Tej decyzji nie zmieniamy.
- Jedyny test `callDeepseek` z feedbackiem: brak (tests/news-brief.test.ts nie sprawdza treści wiadomości).

## Wybór: (a) a nie (b)
(b) lokalne usunięcie powtórzonej liczby z drugiego punktu: wycięcie „0,4” z „wzrósł o 0,4 pkt proc.” psuje gramatykę i zmienia
sens (zostaje „wzrósł”), a wycięcie całego punktu kasuje wniosek. Zasadę „liczby tylko z wejścia” (b) nie osłabia — usuwa,
nie dopisuje — ale jakość tekstu spada, a to właśnie ona jest produktem. Nie robimy tego teraz.
Rezerwa, gdyby (a) nie wystarczyło (kryterium eskalacji niżej): (b′) usunięcie CAŁEGO drugiego punktu z powtórzeniem, jeśli
w `dane` zostaną ≥2 punkty; żadnej edycji tekstu. To osobna decyzja PM z nowym specem.

## Zmiany (~25 linii, bez testów)
1. `src/lib/news/brief.ts`: nowa czysta funkcja
   `export function briefRetryNote(reason: string): string` — zwraca pełne zdanie po `POPRZEDNIA ODPOWIEDŹ ODRZUCONA: <reason>.`:
   - `^powtórzenie: (.+)$` → liczba w zapisie polskim (kropka → przecinek, bez minusa):
     `Liczba 0,4 występuje w dwóch punktach „dane”. Napisz brief od nowa: w „dane” przywołaj każdą liczbę najwyżej w jednym
     punkcie; w drugim opisz zjawisko bez tej liczby. Nie dodawaj nowych liczb — tylko liczby z danych.`
   - każdy inny powód → dotychczasowe `Napisz brief od nowa, używając wyłącznie liczb z danych.` (bez zmiany bajt w bajt).
2. `src/lib/news/brief-server.ts` l.57: `${user}\n\nPOPRZEDNIA ODPOWIEDŹ ODRZUCONA: ${feedback}. ${briefRetryNote(feedback)}`.
   `callDeepseek` dla tłumaczeń i naprawy (feedback `''`) bez zmian. Nie ruszamy `validateBrief`, `ATTEMPTS`, `maxDuration`, promptu systemowego.

## Lessons applied (`docs/PRODUCT.md`)
- Bramka nie jest luzowana; model dostaje precyzyjniejszą instrukcję, nie większe uprawnienia (liczby tylko z wejścia).
- Nic z „teraz” przed hydracją: zmiana wyłącznie po stronie crona.
- Przebieg nadal w dzienniku crona (`recordCronRun`); freshness `news-brief` bez zmian; koszt prób bez zmian (3 × ~0,0005 USD).

## Kryteria akceptacji
1. `npm test` zielony, w tym nowe testy jednostkowe (bez sieci) w `tests/news-brief.test.ts` lub `tests/brief-schedule.test.ts`:
   a. `briefRetryNote('powtórzenie: 0.4')` zawiera „0,4”, „w jednym punkcie”, „dane” i NIE zawiera „używając wyłącznie liczb z danych”;
   b. `briefRetryNote('powtórzenie: 2.8')` → „2,8”; `briefRetryNote('powtórzenie: 4181')` → „4181”;
   c. dla `liczby spoza wejścia: 6 (…)`, `liczebnik słowny spoza wejścia: „pierwszy”`, `markdown`, `meta: „x”`, `niepoprawny JSON`
      wynik === dotychczasowe zdanie `Napisz brief od nowa, używając wyłącznie liczb z danych.`;
   d. `callDeepseek('k','wejście',100,fetch,'powtórzenie: 0.4')` (mock `fetch`): `messages[1].content` zawiera
      `POPRZEDNIA ODPOWIEDŹ ODRZUCONA: powtórzenie: 0.4.` i wskazówkę z (a); z `feedback=''` content === `user` (bez dopisku).
2. `git diff --stat` nie dotyka `validateBrief`, `isRepairableReason`, `BRIEF_SYSTEM_PROMPT`, `ATTEMPTS`, `vercel.json`, `maxDuration`.
3. Zmiana ≤60 linii poza testami; `npm run lint` bez nowych błędów w zmienionych plikach.
4. Po wdrożeniu (odczyt PM, nie „zielony test”): kolejny przebieg 17:20 UTC — `/status` → `brief` ok, `news-brief` fresh.

## Kryterium sukcesu produktowego i eskalacja
Miara: 7 kolejnych dni bez `powtórzenie` w `reason` odrzuconych przebiegów (dziennik crona + log Vercel `[brief] … odrzucony`).
Jeśli `powtórzenie` wróci ≥2 razy w 7 dni mimo (a) — spec (b′) (usunięcie całego drugiego punktu, ≥2 punkty `dane` zostają)
albo — razem z liczebnikami — eskalacja do właściciela o mocniejszy model (`DEEPSEEK_MODEL`, ROADMAP 4a').

## Ryzyka
- Model „flash” może zignorować wskazówkę (jak ignoruje regułę 7 z promptu) — (a) podnosi szanse, nie gwarantuje; stąd kryterium eskalacji.
- Model usunie liczbę z obu punktów i zrobi z `dane` pustą prozę — nie błąd bramki; to sprawdza kontrola 4c′ (punkty „dane” niosą wniosek).
- Wskazówka nie może zawierać przykładowej liczby spoza wejścia (stąd tylko liczba z powodu odrzucenia, już obecna w danych).
- `feedback` nie jest czyszczony po próbie z innym powodem bez `feedback = reason` (np. „niepoprawny JSON” zostawia stary feedback) —
  zachowanie sprzed zmiany, poza zakresem.
- Powtórzenie wychodzi ostatnie w `validateBrief`, więc brief z powtórzeniem jest poza naprawą 6.11 — świadomie.

## Poza zakresem
(b)/(b′), zmiana promptu systemowego, zmiana `ATTEMPTS`, naprawa „powtórzenia” osobnym wywołaniem, model.

## Akcje właściciela
Brak wymaganych. Opcjonalnie po wdrożeniu: uruchomić ręcznie cron `brief` w Vercel (Project → Settings → Cron Jobs → Run),
żeby dostać dzisiejszy dzienny brief przed 17:20 UTC następnego dnia (brak `CRON_SECRET` w naszym środowisku uniemożliwia
to z agenta). Uwaga: 8.11 to niedziela, więc ręczny przebieg wygeneruje też tygodniowy (koszt ≈ 0,002 USD).
