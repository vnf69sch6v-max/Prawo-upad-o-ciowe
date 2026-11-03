# Newsy: polski tytuł i lead dla pozycji zagranicznych (DeepSeek) (2026-11-03)

ROADMAP N3. Prośba właściciela z 03.11: „mocno skup się na newsach”. Poprzedni krok: `2026-10-30-newsy-zagraniczne.md`
(PR #70, kanały `lang:'en'`). Model i koszt jak w `2026-10-30-brief-deepseek.md`.

## Problem i wartość
Na /newsy jest do 40 pozycji po angielsku (EBC, Fed, BOJ, BBC, MarketWatch, Guardian, FT, Japan Times). Czytelnik
z telefonu przewija listę po polsku i angielski tytuł wybija go z rytmu. Część osób w ogóle go pomija, a to są
właśnie decyzje banków centralnych, które ruszają PLN i WIG. Pytanie użytkownika: „o czym jest ta wiadomość ze świata
i czy mam ją otworzyć?”. Odpowiedź: polski tytuł i jedno-, dwuzdaniowy lead. Oryginał jest zawsze widoczny pod
spodem, z jawnym dopiskiem „tłum. maszynowe”. Nigdy nie podmieniamy faktów: liczba, której nie ma w oryginale,
oznacza odrzucenie tłumaczenia i wtedy pokazujemy oryginał.

Skala (sprawdzone 03.11.2026 06:42 UTC, curl 7 kanałów medialnych i bankowych): 47 pozycji z ostatnich 24 h przed
limitami per źródło i filtrem BOJ. Średni tytuł ma 71 zn., średni opis 219 zn., najdłuższy 1767 zn. (dlatego lead
przycinamy do 300 zn.). W feedzie po limicie `MAX_FOREIGN_ITEMS = 40` jest typowo **15–40 nowych pozycji EN na dobę**.

## Co widzi użytkownik
**Telefon (320–430 px), wiersz listy (`NewsRow`):**
- Nagłówek `h3 lang="pl"` = `titlePl`, z ikoną linku zewnętrznego jak dziś.
- Pod nim mniejsza szara linia `lang="en"`: „tłum. maszynowe · {oryginalny tytuł}”. Na telefonie zajmuje 1 wiersz
  i ma ucięcie (`truncate`), od `sm` jest pełna (zawija się). Oryginał jest częścią tego samego linku, więc nie
  powstaje nowy cel dotyku.
- Wiersz źródło · czas · tagi bez zmian, tag `EN · USA` zostaje. Tag mówi, skąd jest wiadomość, a dopisek mówi,
  że tytuł jest tłumaczony. To dwie różne informacje.
- Bez `titlePl` wiersz wygląda **dokładnie jak dziś**: tytuł angielski, `lang="en"`.

**Blok „Najważniejsze” (`LeadStory`)**, gdy prowadzi pozycja zagraniczna:
- `h2` = `titlePl`, pod nim ta sama linia „tłum. maszynowe · oryginał”.
- W miejscu dzisiejszego opisu (`line-clamp-2`) stoi `leadPl`, `lang="pl"`. Gdy nie ma `leadPl` (lead odrzucony
  albo pusty opis), zostaje opis oryginalny z `lang="en"`, jak dziś.

**Wyszukiwarka** szuka w `title`, `description`, `titlePl` i `leadPl`. Wpisanie „stopy” znajduje „Fed cuts rates”
przetłumaczone jako „Fed obniża stopy”.

**Grupowanie i deduplikacja** (`collapseClusters`, `norm(title)`) działają na oryginalnym `title`. Tłumaczenie nie
może skleić angielskiej pozycji z polską ani zmienić rankingu.

**Desktop 1440:** to samo w obecnym układzie, bez nowych kolumn. Linia oryginału jest pełna.

Zmiana wiersza jest minimalna, bo równolegle inna sesja (N1/N2) zmienia `NewsRow`. Dochodzą tylko: wybór tytułu,
linia oryginału i lead w `LeadStory`. Bez zmiany struktury znaczników ani klas.

Nic tu nie zależy od „teraz”: tłumaczenie przychodzi w odpowiedzi `/api/news` jak reszta pól, a strona jest
kliencka (`useNews`). Względny czas zostaje po `useIsClient`, jak dziś.

## Dane i model
**Model** (cennik sprawdzony ponownie 03.11.2026 na api-docs.deepseek.com/quick_start/pricing, bez zmian od 30.10):
- Endpoint `POST https://api.deepseek.com/chat/completions`, model **`deepseek-flash`** (DeepSeek-V4.1-Flash-1017).
- `thinking: { type: 'disabled' }`. Odpowiedź z `reasoning_content` jest odrzucana, jak w `callDeepseek`.
- `response_format: json_object`, `temperature` 0,3, `max_tokens` 3000, timeout 30 s, `cache: 'no-store'`.
  W tym samym przebiegu nie ma retry.
- Ceny za 1M tokenów (off-peak / peak): wejście cache-miss 0,15 / 0,30 USD, cache-hit 0,003 / 0,006 USD,
  wyjście 0,60 / 1,20 USD. Szczyt: 01–04 i 06–10 UTC pn–pt. Koszt liczy `costUsd(usage, now)` z `brief.ts`.
  Chińskie święta są u DeepSeek poza szczytem, a my liczymy je jak szczyt, więc szacunek jest zawyżony, czyli
  bezpieczny.
- Wspólne wywołanie: `callDeepseek` dostaje parametr promptu systemowego (dziś ma na sztywno `BRIEF_SYSTEM_PROMPT`).
  Zachowanie briefu się nie zmienia, co potwierdzają istniejące testy briefu.

**Prompt** (system, po polsku):
- Przetłumacz tytuł na polski w stylu nagłówka prasowego.
- Lead to 1–2 zdania, najwyżej 200 zn., wyłącznie z podanego opisu.
- Nie dodawaj faktów ani liczb. Liczby przepisuj cyframi; wolno zmienić tylko separator („2.5%” → „2,5%”,
  „1,200” → „1200” lub „1 200”).
- Nazwy własne zostaw. Skróty walut i jednostek tłumacz bez przeliczania („$5bn” → „5 mld USD”).
- Bez markdownu i bez komentarzy.
- Odpowiedź ma postać `{"items":[{"id","t","l"}]}`. `l` pomijasz, gdy opis jest pusty.

**Wejście:** wyłącznie publiczne pola feedu: `id` (klucz niżej), tytuł i opis ucięty do 300 zn. Bez sesji, uid
i danych konta. Moduł budujący wejście nie importuje niczego z `auth`/`user-data`, co sprawdza test.

**Wybór pozycji w przebiegu:**
1. Cron czyta feed z cache `news/rss_pl`, gdy wpis jest młodszy niż 20 min. Starszy albo brak → sam składa feed
   `buildNewsFeed()` (RSS równolegle, 8 s timeout na źródło, bez zapisu feedu). (Zmiana przy wdrożeniu wobec wersji PM
   z `internal-fetch` `/api/news`: bez wywołania własnej trasy przez bramkę i `SITE_URL`, a czas jest i tak
   ograniczony timeoutem RSS — mieści się w 20 s budżetu.)
2. Bierze pozycje `lang === 'en'`, których klucza nie ma w dokumencie tłumaczeń. Przechodzi też pozycja z `rej`
   zapisanym przy innej wersji reguł (`rv`, opis niżej).
3. Kolejność: banki centralne pierwsze, potem od najnowszych.
4. Pozycje dzieli na partie: **≤ 15 pozycji i szacowane wejście ≤ 4000 tokenów** (`estimateTokens` = znaki/3,
  razem z promptem systemowym).
5. W jednym przebiegu idą **najwyżej 3 partie** (45 pozycji, czyli więcej niż limit 40 EN w feedzie). Reszta
  czeka na następny przebieg.
6. Budżet wyjścia: przy około 130 tokenach na pozycję (polski tytuł do 90 zn. i lead do 220 zn. plus klucze JSON)
   15 pozycji to około 1950 tokenów, więc limit 3000 ma około 50% zapasu.

**Walidator** (czysty moduł `src/lib/news/translate.ts`, testy vitest). Zasady liczą się dla każdej pozycji osobno:
- **Liczby.** Każda liczba w `t` i `l` (`extractNumbers`, bez znaku) musi wystąpić w oryginale (tytuł + opis).
  Oryginał przed ekstrakcją przechodzi przez ujednolicenie angielskich separatorów tysięcy: `(\d),(\d{3})(?!\d)`
  → `$1$2`, w pętli, więc „1,200,000” daje 1200000. Polskie „2,5” i „1 200” normalizuje istniejące `canonical`
  i `joinThousands`.
- **Dodatkowa zasada PM.** Każda liczba z oryginalnego **tytułu** musi być w `t`. Tytuł bez „0.25%” z oryginału
  wprowadza czytelnika w błąd tak samo jak obca liczba. Lead jest skrótem, więc tam ta zasada nie obowiązuje.
- **Odrzucenie tytułu.** Tytuł pozycji podejrzanej zostaje w oryginale, a pozycja dostaje `rej` z powodem.
  Pozycja jest podejrzana, gdy jej tłumaczenie:
  - jest puste albo identyczne z oryginałem (po `norm`);
  - ma znaki CJK albo cyrylicę, których nie ma w oryginale;
  - ma markdown (`**`, `#`, backtick) albo nową linię w tytule;
  - ma meta-komentarz („tłumaczenie:”, „nie mogę”, „as an AI”, „translation”);
  - ma długość tytułu poza zakresem od 0,3× do 3× oryginału + 20 zn.
- **Zły lead przy dobrym tytule.** Zostaje sam tytuł, bez `l`. Lead odpada, gdy ma ponad 220 zn., obcą liczbę,
  markdown, meta-komentarz albo obce pismo.
- **Słowne liczebniki** nie są bramką: „three” → „trzy” to poprawne tłumaczenie. „three” → „3” odpada przez
  regułę liczb. To konserwatywne i akceptowane.

**Cache tłumaczeń:** jeden zapieczętowany dokument `news/translations_v1` (`setServerCache` → `toStored`).
Kolekcja `news` jest już objęta szyfrowaniem i sweepem.
- Struktura: mapa `key → { t, l?, at }` albo `{ rej: powód, rv, at }` (model jest jeden, `deepseek-flash`, i stoi w logu crona).
- `key` = `sha256(znormalizowany tytuł)` (NFKC, małe litery, zwinięte białe znaki), pierwsze 16 znaków hex.
- Odrzucona pozycja jest zapisana, więc nie płacimy drugi raz za to samo odrzucenie.
- `rv` (`TRANSLATE_RULES_VERSION`, dodane przez PM): po zmianie walidatora albo promptu podbijamy wersję i stare
  odrzucenia wracają do kolejki. Dobre tłumaczenia zostają.
- Przycinanie przy zapisie: wpisy starsze niż 14 dni wypadają, zostaje najwyżej 600 najnowszych. Szacunek:
  600 × ~400 B ≈ 240 KB JSON przed deflate, daleko od limitu 1 MiB dokumentu Firestore.
- Zapis to cały dokument po odczycie. Merge na zapieczętowanym dokumencie nie działa (AGENTS.md). Przebiegi dzielą
  godziny, więc wyścig ogranicza się do ręcznego curl w trakcie crona. Najgorszy skutek to ponowne tłumaczenie.
- Błąd całej partii (HTTP ≠ 2xx, timeout, zły JSON, `finish_reason: 'length'`, `reasoning_content`) nie zapisuje
  z tej partii nic, także `rej`. Następny przebieg spróbuje ponownie. Pozycje, których model w poprawnej
  odpowiedzi nie zwrócił, też niczego nie zapisują.

**Nakładanie (`/api/news`):**
- Po `withCache` i **po** `appendFeedToTodayArchive` trasa dokłada `titlePl`/`leadPl` wyłącznie pozycjom
  `lang === 'en'` z trafieniem `t` w dokumencie.
- Feed w cache `news/rss_pl` i archiwum dzienne zostają czyste, jak `applyOfficialWeights` w `gus-cpi-full`.
  Brief i digest widzą oryginały.
- Dokument tłumaczeń jest trzymany w pamięci instancji przez 5 min, czyli najwyżej 1 dodatkowy odczyt Firestore
  na 5 min na instancję. Nieudany odczyt daje odpowiedź bez tłumaczeń, a nie 500.
- W żądaniu użytkownika nie ma żadnego wywołania DeepSeek.
- Demo bez Firebase: brak dokumentu, więc odpowiedź jak dziś.

**Cron `news-translate`:**
- Trasa `/api/cron/news-translate`: 401 bez `Bearer CRON_SECRET`, gdy sekret jest ustawiony, jak `brief`.
- `export const maxDuration = 120` ≥ 3 partie × 30 s + 20 s na feed + 10 s na Firestore i zapis.
- Wpis w `CRON_SPECS` z `maxAgeHours` 26: jeden udany przebieg na dobę wystarcza, żeby `/status` był zielony.
- W `vercel.json` są **3 wpisy z tą samą ścieżką**: `15 5`, `15 11` i `15 19 * * *` UTC. Hobby uruchamia każdy
  wpis raz dziennie z jitterem w obrębie godziny, więc okna to 05:00–05:59, 11:00–11:59 i 19:00–19:59. Wszystkie
  leżą poza szczytem DeepSeek.
- 19:xx UTC łapie popołudnie w USA (Fed, MarketWatch). 05:xx łapie noc w USA i poranek w Japonii, przed
  użytkownikiem o 6–7 Warszawy. 11:xx łapie poranek w Europie (EBC, BBC, Guardian).
- Każdy przebieg zapisuje się w `health/cron_runs` (`recordCronRun('news-translate', …)`):
  - `ok`/`total` = partie udane / wysłane;
  - `failed` = powód nieudanej partii, do 120 zn.;
  - `costUsd` = suma z `usage`;
  - `ms` = czas przebiegu.
- Odpowiedź JSON crona niesie też pokrycie: ile pozycji EN, ile przetłumaczonych, ile odrzuconych.
  Te liczby PM sprawdza po wdrożeniu.
- Przebieg bez nowych pozycji = ok 0/0, bez wywołania modelu.
- Bez `DEEPSEEK_API_KEY` = `skipped`, bez żadnego `fetch` do DeepSeek. Przebieg zapisany jako 0/0, UI jak dziś,
  `npm test` i build zielone bez klucza.

**Dlaczego osobna grupa, a nie dokładka do `news-digest`:**
- Digest idzie raz dziennie o 16:05 UTC, więc wiadomości z wieczora w USA czekałyby na polski tytuł prawie dobę.
- Digest ma `maxDuration` 60 s i robi już RSS, makro i Groka. Trzy wywołania po 30 s ucięłyby go przed zapisem
  przebiegu, a to ta sama klasa błędu co 504 w `dbw-1`.
- Osobna grupa daje osobny wpis kosztu i stanu na `/status`. Awaria tłumaczenia nie zaczerwieni digestu i odwrotnie.

**Świeżość:** bez `DatasetSpec`. Tłumaczenia nie mają kalendarza publikacji i nie są liczbą na stronie.
Brak tłumaczenia to oryginał, czyli dzisiejszy stan, nie zła dana. Awarię pokazuje dziennik crona (`late` po 26 h,
`partial` przy nieudanej partii) na `/status` i w `crons.attention`.

**Szacunek kosztu** (off-peak, bo crony stoją poza szczytem):
| Wariant | Wejście | Wyjście | Koszt |
|---|---|---|---|
| Typowo 15–40 nowych pozycji na dobę, około 100 tokenów wejścia i 130 wyjścia na pozycję, plus prompt systemowy około 450 tokenów na partię | 2,5–6 tys. tokenów | 2–5,2 tys. tokenów | **0,0015–0,004 USD na dobę**, czyli około 0,05–0,12 USD na miesiąc |
| Przy 47 pozycjach jak 03.11 | – | – | około 0,005 USD na dobę |
| Górny limit techniczny: 3 przebiegi × 3 partie × (4000 wejścia + 3000 wyjścia) | 36 tys. tokenów | 27 tys. tokenów | **0,022 USD na dobę**, około 0,65 USD na miesiąc |

W górnym limicie wejście kosztuje 0,0054 USD, a wyjście 0,0162 USD. Osiągnąć go mogą tylko powtarzające się nieudane
partie, a te widać jako `partial`. Cache-hit daje 0 USD.

**Prywatność i CSP:** `/prywatnosc`, akapit DeepSeek, w tym samym PR. Dopisujemy, że dostawca dostaje też publiczne
nagłówki i leady zagranicznych mediów i banków centralnych do tłumaczenia maszynowego, po stronie serwera, bez danych
osobowych. CSP bez zmian: woła serwer, przeglądarka niczego nie woła.

## Lekcje zastosowane
- [x] Liczba = liczba z oryginału: walidator liczb w obie strony dla tytułu, oryginał zawsze widoczny, przy wątpliwości oryginał zamiast tłumaczenia.
- [ ] Metodologia/baza: nie dotyczy.
- [ ] Kalendarz publikacji: nie dotyczy (nie jest to zbiór danych). Wiek odczytu nie jest pokazywany, czas pozycji jest czasem oryginału.
- [x] Upstream `no-store` (DeepSeek). Dziennik crona z `costUsd`.
- [x] Cron nie woła własnych tras (feed z Firestore albo wprost z RSS), więc nie trafia w adres wdrożenia za logowaniem Vercela.
- [x] Brak publicznego wyzwalacza kosztu: DeepSeek tylko z crona za `CRON_SECRET`, cache-hit nic nie kosztuje.
- [x] `export const maxDuration` w pliku crona, limit sprawdzany w `tests/function-limits.test.ts`.
- [ ] Kontrola świeżości: świadomie bez `DatasetSpec` (uzasadnienie wyżej). Zamiast tego `CRON_SPECS` i `maxAgeHours` 26.
- [x] Nic zależnego od „dziś” przed hydratacją: brak nowych wyliczeń z „teraz” w UI.
- [x] Telefon 320/390 i desktop 1440 bez przewijania w bok: linia oryginału `truncate` na telefonie.
- [x] CSP bez zmian: brak nowego originu w przeglądarce.
- [x] Dane w Firestore przez `toStored` (sealed). Do modelu nie idą żadne dane użytkownika. `/prywatnosc` w tym samym PR.

## Kryteria akceptacji
1. `npm test` (walidator liczb):
   - `t` z liczbą spoza oryginału → `rej`, oryginał zostaje;
   - „2.5%” → „2,5%” przechodzi;
   - „1,200 jobs” → „1200 miejsc pracy” i „1 200 miejsc pracy” przechodzi;
   - „1,200” → „1,2 tys.” odpada;
   - tytuł oryginału z „0.25%” bez tej liczby w `t` → `rej`.
2. `npm test` (reguły podejrzanej pozycji): każda z reguł daje `rej` z czytelnym powodem. Reguły to: pusta,
   identyczna, CJK/cyrylica spoza oryginału, markdown, nowa linia w tytule, meta-komentarz, długość poza
   0,3×–3× + 20 zn. Zły lead (> 220 zn. albo obca liczba) przy dobrym tytule → wpis z `t` bez `l`.
3. `npm test` (partie): z 50 pozycji EN wychodzą najwyżej 3 partie, każda ≤ 15 pozycji i ≤ 4000 szacowanych
   tokenów. Leady są ucięte do 300 zn. Pozycje PL nigdy nie trafiają do partii. Banki centralne są pierwsze.
4. `npm test` (cache-hit): gdy wszystkie pozycje EN mają wpis `t` albo `rej` z bieżącym `rv`, przebieg robi
   **0 wywołań** zamockowanego `fetch` do DeepSeek i kończy się ok 0/0. `rej` ze starszym `rv` wraca do kolejki.
5. `npm test` (brak klucza): bez `DEEPSEEK_API_KEY` → `skipped`, 0 wywołań `fetch`, bez wyjątku.
6. `npm test` (zapytanie): mock `fetch` dostaje `model: 'deepseek-flash'`, `thinking: { type: 'disabled' }`,
   `max_tokens` 3000, `temperature` 0,3 i `response_format` JSON. Odpowiedź z `reasoning_content` odrzuca partię.
7. `npm test` (koszt): `costUsd` przebiegu = suma `costUsd(usage, now)` partii i trafia do wpisu
   `recordCronRun('news-translate', …)` (mock).
8. `npm test` (błąd partii): HTTP 500, timeout, zły JSON i `finish_reason: 'length'` → dokument tłumaczeń
   niezapisany (`setServerCache` nie wołane dla tej partii, także bez `rej`), partia w `failed`, przebieg `partial`
   (wszystkie partie złe → `error`; w dzienniku `ok < total`, czyli „Częściowo” / „Nie działa” na `/status`).
   Inne, udane partie tego przebiegu się zapisują.
9. `npm test` (przycinanie): wpisy starsze niż 14 dni wypadają, z 700 świeżych zostaje 600 najnowszych.
10. `npm test` (nakładanie):
    - `applyTranslations` dokłada `titlePl`/`leadPl` tylko pozycjom `lang:'en'` z trafieniem `t`;
    - pozycje polskie (z `lang` i bez) są głęboko równe wejściu;
    - `rej` nic nie dokłada;
    - kolejność i liczba pozycji bez zmian.
11. `npm test` (prywatność wejścia): moduł budujący partię nie importuje `auth`, `user-data` ani `session`
    (test na źródle jak `tests/data-protection.test.ts`).
12. `npm test` (`cron-runs`): `/api/cron/news-translate` w `vercel.json` (3 wpisy) mapuje się na grupę
    `news-translate` w `CRON_SPECS`.
13. `npm test` (`function-limits`): `maxDuration` crona ≥ `MAX_BATCHES` × `TIMEOUT_MS` + 20 s na feed + 10 s,
    stałe czytane ze źródła, jak test `brief`.
14. Kod: `/api/news` zapisuje do archiwum **przed** nakładaniem (sprawdzone w recenzji diffu). Trasa nie importuje
    `callDeepseek`.
15. Playwright, `next start`, przechwycenie `/api/news` z fixture: 3 pozycje EN z `titlePl`, w tym jedna prowadząca
    w „Najważniejsze”, oraz 1 EN bez tłumaczenia. Zrzuty /newsy 390 i 1440 px przed i po.
    - 0 przewijania w bok (`scrollWidth ≤ clientWidth`), 0 błędów konsoli, 0 naruszeń CSP;
    - polski tytuł ma `lang="pl"`, linia „tłum. maszynowe · …” ma `lang="en"`, na 390 px 1 wiersz;
    - pozycja bez tłumaczenia jest identyczna jak przed zmianą;
    - wyszukanie polskiego słowa z `titlePl` znajduje pozycję.
16. `/prywatnosc` zawiera zdanie o tłumaczeniu publicznych nagłówków i leadów zagranicznych przez DeepSeek.
17. `tsc --noEmit`, eslint zmienionych plików, `npm test`, `npm run build` czyste.
18. Po wdrożeniu (PM):
    - `health/cron_runs` → `news-translate` ma wpis z `costUsd` w ciągu 26 h;
    - pokrycie z odpowiedzi crona ≥ 70% pozycji EN;
    - 5 losowych tytułów sprawdzonych ręcznie z oryginałem: sens i liczby zgodne.

## Poza zakresem
- Tłumaczenie w briefie i digeście (brief nadal dostaje oryginały).
- Pełne teksty artykułów i streszczenia ponad lead.
- Inne języki: japoński i niemiecki, gdy pojawią się takie kanały.
- Tłumaczenie na Przeglądzie i w „Najnowszych” (tam są tylko polskie pozycje).
- Przełącznik „pokaż oryginał”, ocena tłumaczeń przez użytkownika.
- Tłumaczenie na żądanie z przeglądarki.
- `DatasetSpec` dla tłumaczeń.

## Akcje właściciela
Brak. `DEEPSEEK_API_KEY` jest już ustawiony w produkcji (cron `brief` działa). Dodatkowy koszt to typowo poniżej
0,15 USD na miesiąc przy obecnym saldzie. Opcjonalnie, jak w poprzednim kroku: potwierdzić, że pokazanie
maszynowego tłumaczenia tytułu i leadu z linkiem i nazwą źródła jest dla Ciebie akceptowalne prawnie
(FT, Guardian, BBC).
