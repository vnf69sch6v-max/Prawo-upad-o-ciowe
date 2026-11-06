# Brief: naprawa odrzuconych punktów (opcja C) — 2026-11-06

Decyzja PM: **C TAK, na poziomie punktu, z jedną naprawą na przebieg briefu.** Bramka `validateBrief` zostaje bez zmian.
Dane nie są nowym źródłem — spec nie dodaje serii, więc bez `DatasetSpec` (freshness `news-brief` już istnieje).

## Problem i wartość
Brief (DeepSeek flash) pada na pojedynczym słowie: 31.10 „6”, 2.11 „pięciu”, 3.11 „obu”, 5.11 „pierwszy”. Cała reszta tekstu
jest poprawna, a użytkownik traci kartę briefu na cały dzień (`news-brief` stale). Prompt już zakazuje tych słów wprost,
więc kolejna pełna próba „losuje od nowa” (3 z 3 padły 5.11). Naprawa jednego punktu to mały, wąski zakres zmiany:
model nie komponuje briefu od zera, tylko przepisuje 1–4 zdania bez zakazanego słowa.

## Czy C osłabia zasadę „liczby i fakty tylko z wejścia”?
Nie, pod warunkiem trzech rzeczy (kryteria 3–5):
1. Bramka jest ta sama i niezmieniona; po naprawie walidowana jest CAŁOŚĆ (`validateBrief(body, allowed)`), nie tylko podmieniony punkt.
2. Lokalny bezpiecznik ostrzejszy niż bramka: poprawiony punkt może zawierać wyłącznie liczby, które były w punkcie
   pierwotnym (bez obcej liczby, zakazanej też już w wejściu innego punktu), nie może być dłuższy niż 130% oryginału
   i nie może zawierać słowa-powodu. Inaczej naprawa jest odrzucona i brief idzie dalej starą ścieżką.
3. Model naprawy NIE dostaje wejścia briefu (tylko punkt + zakazany token), więc nie ma skąd wziąć nowych faktów.
Granica uczciwości: bramka nigdy nie sprawdzała faktów, tylko liczby i liczebniki — C tego nie zmienia ani nie pogarsza.

## Punkt czy zdanie?
Punkt. Punkty (`teza`, elementy `dane|polska|swiat|kalendarz`) są już jednostkami struktury (JSON, ≤500 zn.), zdań nie da się
bezpiecznie podzielić po polsku (skróty, „godz.”, „ok.”). Wywołanie jest jedno, zbiorcze dla ≤4 punktów.

## Kiedy naprawiamy (tylko te powody)
`validateBrief` zwraca `reason`; naprawa tylko dla prefiksów `liczebnik słowny spoza wejścia` i `liczby spoza wejścia`.
NIE naprawiamy: `markdown`, `meta`, `za mało punktów`, `powtórzenie`, niepoprawny JSON, pusty `teza` (po `cleanBriefBody`).
Powód `powtórzenie` wychodzi dopiero po powyższych w `validateBrief` — jeśli po naprawie wyjdzie, brief jest odrzucony jak dziś.

## Przepływ (w `runBrief`, pętla prób)
Po `validateBrief` z `!v.ok`: jeśli powód jest naprawialny i `repairsLeft > 0` (start: 1 na wywołanie `runBrief`):
1. `repairsLeft--`; `findOffendingPoints(body, allowed)` → ≤4 punkty `{ field, index, token }` (token = pierwszy zakazany liczebnik
   lub obca liczba w tym punkcie). Brak punktów (np. token tylko na styku punktów) → bez naprawy.
2. `callDeepseek(key, JSON.stringify({ punkty }), 700, fetchImpl, '', BRIEF_REPAIR_PROMPT)`; koszt `costUsd(reply.usage, now)` do `cost`.
   Błąd/timeout wywołania naprawy NIE przerywa — wpada w zwykłe `continue` z `feedback = reason` (następna pełna próba).
3. Parsuj `{"punkty":[...]}` (ta sama długość, same stringi). Każdy punkt przez lokalny bezpiecznik (wyżej).
4. Podmień punkty w kopii `body`, `cleanBriefBody`, `validateBrief` CAŁOŚCI. `ok` → zapis jak dziś, z `repaired: <liczba punktów>`.
   Nadal odrzucone → `reason = nowy powód`, `feedback = reason`, `continue` (kolejna pełna próba, bez drugiej naprawy).

Prompt naprawy (`BRIEF_REPAIR_PROMPT`, `brief.ts`): „Przepisz każdy punkt po polsku, usuwając zakazane słowo/liczbę (`token`),
zachowaj sens, wszystkie cyfry, daty i nazwy z punktu, nie dodawaj nowych liczb, faktów ani liczebników słownych i porządkowych
(pierwszy, drugi, pięciu, obu…; zamiast tego „kolejny”, „w każdym z nich”, „ostatni” albo po prostu pomiń słowo). Zwróć JSON {"punkty":[…]} w tej samej kolejności, tyle samo elementów.”

## Budżet czasu i kosztu
Dziś `maxDuration` 210 = 2 briefy × 3 próby × 30 s + 10 (190 wymagane). Nowy najgorszy przypadek (niedziela):
2 × (3 próby + 1 naprawa) × 30 s + 10 = **250 s**. `maxDuration` crona brief 210 → **260** (≤ 300 Hobby; zapas 10 s).
Wywołanie naprawy ma `TIMEOUT_MS` = 30 s jak reszta (jedna stała). Koszt: wejście ~300 tok, wyjście ~300 tok ≈ 0,0002 USD;
najgorszy przebieg dziennie +0,0002 USD, tygodniowy +0,0004. Pomijalne. Bez zmiany `ATTEMPTS`.

## Zmiany (≤150 linii)
1. `src/lib/news/brief.ts` (~55 linii)
   - `BRIEF_REPAIR_PROMPT` (stała, po `BRIEF_SYSTEM_PROMPT`).
   - `isRepairableReason(reason: string): boolean` — prefiksy z sekcji „Kiedy naprawiamy”.
   - `findOffendingPoints(body, allowed): { field: 'teza'|'dane'|'polska'|'swiat'|'kalendarz'; index: number; text: string; token: string }[]`
     — dla każdego punktu: pierwszy `WORD_NUMERALS_G` spoza `allowed.words` albo pierwsza `extractNumbers` spoza `allowed.numbers`; ≤4.
   - `applyRepairs(body, points, repaired: string[]): BriefBody | null` — `null`, gdy długość/typ się nie zgadza lub lokalny
     bezpiecznik (liczby ⊆ liczb oryginału, ≤130% długości, brak tokenu) odrzuca którykolwiek punkt; zwraca NOWY obiekt (bez mutacji).
   - `BriefDoc.repaired?: number` (opcjonalne, wstecznie zgodne).
2. `src/lib/news/brief-server.ts` (~35 linii)
   - Funkcja `repairBrief(key, body, allowed, fetchImpl, now): Promise<{ body: BriefBody | null; cost: number; n: number }>` — kroki 1–3 przepływu; łapie własne wyjątki (liczy koszt z `DeepseekError.usage`).
   - W `runBrief`: `let repairsLeft = 1;` i po `!v.ok` blok kroków 1–4; `repaired` do `doc`; log `[brief] … naprawiono N pkt`.
3. `src/app/api/cron/brief/route.ts`: `maxDuration = 260`.
4. `tests/function-limits.test.ts`: test crona brief liczy `2 * (attempts + 1) * timeoutS + 10` (naprawa = jedna dodatkowa
   próba; odczyt `REPAIRS = 1` z `brief-server.ts` jako stała `const REPAIRS = 1` zamiast magicznej jedynki).
5. `tests/brief-repair.test.ts` (nowy, `fetch` mockowany; `runBrief` z wstrzykniętym `fetchImpl`, digest i archiwum jak w istniejących testach briefu)
   - odrzucenie przez „pierwszy” → naprawa → ok, `repaired = 1`, cały `body` przeszedł `validateBrief`, łącznie 2 wywołania fetch;
   - naprawa nadal zła (zwraca „drugi” albo obcą liczbę) → kolejne pełne próby, końcowo `rejected`, koszt zawiera naprawę;
   - naprawa dodaje liczbę spoza punktu (np. „7”) → lokalny bezpiecznik, `rejected`/dalsza próba, bez zapisu;
   - powód nie-słowny (`markdown`, `meta`, `powtórzenie`, za mało punktów) → zero wywołań naprawy (liczba fetchy = `ATTEMPTS`);
   - tylko jedna naprawa na przebieg (druga naprawialna porażka nie wywołuje drugiej naprawy);
   - błąd HTTP naprawy → przejście do zwykłej próby, bez wyjątku.
   - `findOffendingPoints`/`applyRepairs` testy jednostkowe: obca liczba, liczebnik z wejścia (dozwolony) nie jest zgłaszany.

## Lessons applied (`docs/PRODUCT.md`)
- Bramka nie jest luzowana; tekst jest naprawiany, nie omijany (zasada „liczby tylko z wejścia”).
- Nic z „teraz” przed hydracją: zmiana wyłącznie po stronie crona.
- Każdy przebieg w dzienniku crona (`recordCronRun`, koszt łączny z naprawą); `news-brief` freshness bez zmian.
- Test limitów funkcji (`function-limits`) aktualizowany razem z `maxDuration`.

## Kryteria akceptacji
1. `npm test` zielony, w tym `tests/brief-repair.test.ts` (6 scenariuszy wyżej) i `tests/function-limits.test.ts` z 260 ≥ 250.
2. `git diff` nie dotyka `validateBrief`, `WORD_NUMERALS_G`, `collectBriefAllowed` ani `BRIEF_SYSTEM_PROMPT` (sprawdzenie `git diff --stat`/`grep`).
3. `runBrief` zapisuje brief tylko po `validateBrief(całość).ok`; test pokazuje, że body z obcą liczbą po naprawie NIE jest zapisane.
4. Lokalny bezpiecznik: test z poprawką dodającą „7” albo wydłużającą punkt >130% → naprawa odrzucona.
5. Maks. 1 naprawa na `runBrief`, maks. 1 dodatkowe wywołanie DeepSeek (test liczy `fetchImpl.mock.calls`).
6. `maxDuration` crona brief = 260, `≤ 300`; `function-limits` liczy z `ATTEMPTS` i `REPAIRS`.
7. Zmiana ≤150 linii (bez testów), `npm run lint` bez nowych błędów w zmienionych plikach.
8. Po wdrożeniu: najbliższy przebieg 17:20 UTC — `/status` → cron `brief` ok, `news-brief` fresh; w `health/cron_runs.brief` koszt
   rośnie o ≤0,0004 USD; jeśli brief przeszedł dzięki naprawie, w logu Vercel `naprawiono N pkt`. Odczytane przez PM, nie przez „zielony test”.

## Poza zakresem
Zmiana modelu (decyzja właściciela o koszcie, otwarta), dalsze luzowanie bramki (nie), naprawa markdownu/meta/powtórzeń,
naprawa na poziomie całego briefu, wyświetlanie „poprawiono automatycznie” w UI, retry naprawy.

## Akcje właściciela
Brak wymaganych. Opcjonalnie: decyzja o mocniejszym modelu (np. wariant z rozumowaniem), jeśli C nie zbije odrzuceń:
miarą jest liczba odrzuconych przebiegów `brief` w 7 dni po wdrożeniu (cel: 0 z 7; ≥2 z 7 = wracamy do pytania o model).

## Kryterium sukcesu produktowego
7 kolejnych dni `news-brief` = fresh. Jeśli C naprawi mniej niż połowę odrzuceń (log `naprawiono` vs `odrzucony`) — eskalacja
do właściciela z kosztem mocniejszego modelu (liczba z `costUsd` w `/status`).
