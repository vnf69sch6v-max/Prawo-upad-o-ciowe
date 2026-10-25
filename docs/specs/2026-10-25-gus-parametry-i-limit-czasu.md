# Trasy GUS DBW: tylko znane parametry i limit czasu, który naprawdę działa

- **Pozycja w backlogu:** ROADMAP 1a (Bezpieczeństwo i niezawodność). Dochodzi do niej naprawa 504 w cronach
  `dbw-1` i `dbw-3` (priorytet 1: cron, który nie działa). Dotyczy tych samych plików tras.
- **Zakres:** trasy `gus-cpi-full`, `gus-ppi-full`, `gus-koniunktura`, `dbw-series`, `gus-monthly` (część DBW);
  zablokowanie nieużywanych `/api/gus-cpi` i `/api/dbw` walidacją (bez usuwania, B5); `maxDuration` tras i cronów DBW; budowa ścieżek
  w hookach, cronach i kontroli świeżości.
- **Poza zakresem:** 1b, czyli wymuszone odświeżenie tylko z `CRON_SECRET` (czeka na właściciela). Trasy BDL to
  osobna pozycja 1c.
- **Status:** wdrożone 25.10.2026 (ROADMAP → „Zrobione”); kontrola 13.11.2026 w ROADMAP P0.
- **Ekrany:** wygląd stron się nie zmienia. `/status` przestaje pokazywać `gus-cpi-full → 504` i `gus-cpi → 504`.

## 1. Problem i wartość dla użytkownika

Ktoś otwiera Savori w dniu publikacji GUS, żeby zobaczyć nową inflację, produkcję albo sprzedaż. Liczba
dociera na stronę tylko wtedy, gdy przejdą dwa warunki:

1. **Cron musi zdążyć.** Dziś nie zdąża. `dbw-1` (CPI) i `dbw-3` dostają 504 (§2), więc wymuszone odświeżenie CPI
   nigdy nie zapisuje się w cache. Nowy odczyt trafia na stronę tylko przez żądania użytkowników. Te idą przez
   Data Cache Next.js (`revalidate` 24 h, stale-while-revalidate), czyli przez dokładnie tę pułapkę z AGENTS.md,
   przez którą publikacja GUS docierała z dniowym opóźnieniem.
2. **Wspólny limit DBW (~100 żądań / 15 min) nie może się wyczerpać.** Dziś wyczerpie go jedno żądanie GET
   z przeglądarki. Odświeżanie nie jest do tego potrzebne:

| Żądanie (publiczne, bez `refresh=1`) | Co robi dziś |
|---|---|
| `/api/gus-cpi-full?year=1` | `quarterlyPeriods(-9, 2025)`, czyli 8140 kwartałów i 12 miesięcy: **8152 wywołania DBW** na jedno GET (współbieżność 7). Funkcja ginie po 30 s, nic nie zapisuje, więc każde powtórzenie zaczyna od nowa. |
| `/api/gus-ppi-full?year=N`, `/api/gus-koniunktura?year=N` | każdy nowy `N` to nowy klucz cache: 60 lub 24 wywołania |
| `/api/dbw-series?var=…&przekroj=…&poz=…` | dowolna seria i dowolny rok to nowy klucz: 8–24 wywołania na klucz, bez górnej granicy |
| `/api/dbw-series?<parametry Przeglądu>&sub100=0` albo `&poz1=<inny region>` | **zatruwa cache Przeglądu.** Klucz `dbwser_…` nie zawiera `sub100` ani `poz1`, więc z `refresh=1` surowy indeks (np. „104,3”) albo liczby innego regionu zapisują się pod kluczem, który czyta hero („Produkcja +104,3%” przez 48 h) |
| `/api/gus-monthly?years=N` | każdy nowy `N` to 3 wywołania DBW i 12 BDL |
| `/api/dbw?var=…&przekroj=…&rok=…&okres=…` | otwarte proxy DBW: każda kombinacja to wywołanie i nowy klucz. **Żaden kod serwisu tego nie woła.** |
| `/api/gus-cpi` | **żadna strona tego nie czyta** (`useCpiNational` nie jest nigdzie użyty). Cron `dbw-3` zużywa na to 24 wywołania dziennie i dostaje 504. |

Wartość kroku: crony CPI naprawdę odświeżają dane w dniu publikacji (najbliższa: **13.11.2026**, CPI
za październik). Publiczne GET nie może już spalić limitu GUS ani podmienić liczb na Przeglądzie.

## 2. Ustalenia: skąd 504 w `dbw-1` i `dbw-3`

**Wniosek:** to przekroczenie czasu funkcji na Vercelu (FUNCTION_INVOCATION_TIMEOUT, 504) po **30 s**. Nie
jest to przepuszczony status GUS ani limit samego crona.

Dowody:

- **Nasz kod nigdy nie zwraca 504.** Błąd DBW (`!res.ok`) daje `null`, a trasa odpowiada 200 (częściowe dane)
  albo 500 (`withCache` bez wpisu). Status GUS nie przechodzi dalej.
- **Dziennik cronów z produkcji** (`/api/health/freshness`, 25.10 00:40 UTC):

  | Grupa | Koniec przebiegu | Czas | Wynik |
  |---|---|---|---|
  | `dbw-1` | 24.10 09:53:39 | 36,7 s | `gus-cpi-full → 504`, `dbw-series` (310) ok |
  | `dbw-2` | 24.10 13:55:07 | **65,5 s** | 2/2 ok, w tym `gus-ppi-full` (≈50 s, czyli ponad 30 s) |
  | `dbw-3` | 24.10 15:58:48 | 51,8 s | `gus-cpi → 504`, `gus-koniunktura` i `dbw-series` (324) ok |
  | `dbw-4` | 24.10 12:16:13 | 36,8 s | 3/3 ok (≈11 s na serię) |

  `dbw-1`: 36,7 s = około 30 s (`gus-cpi-full` ucięte) + 1,5 s odstępu + 8 wywołań serii 310 + 1,5 s.
  Same crony mają `export const maxDuration = 120` i kończą się normalnie, więc to nie one są ucinane.
- **Dlaczego 30 s, skoro `vercel.json` daje `gus-cpi-full` 120?** Sprawdzone w kodzie buildera Vercela:
  - `@vercel/build-utils` 15.0.2, `findMatchingFunction`: pętla po `Object.entries(functions)` zwraca
    **pierwszy** pasujący wzorzec. Pierwszy klucz w `vercel.json` to `src/app/api/**/*.ts` (30 s), a on pasuje do
    każdej trasy. Wszystkie wpisy pod nim (`gus-cpi-full` 120, `cron/*` 120, `jp/cpi` 60, `parser/parse` 60…)
    **są martwe**.
  - `@vercel/next` 26.0.2, `getPageLambdaGroups`: `opts = { ...vercelConfigOpts, ...opts }`, gdzie `opts` pochodzi
    z `export const maxDuration` trasy (functions-config-manifest Next.js). **Eksport w pliku wygrywa.**
  - Stąd: `gus-ppi-full` ma eksport 120 i działa. `gus-cpi-full` go nie ma, więc dostaje 30 s i 504.
    `gus-cpi` dostaje 30 s z globu przy 24 wywołaniach po kolei i też 504. Glob działa od 23.08.2026 (wcześniej
    `app/api/**` bez `src/` nie pasował do niczego). Od 03.10 cron idzie z `no-store`, bez Data Cache,
    więc jest wolniejszy.
  - **AGENTS.md mówi odwrotnie** („każda długa trasa potrzebuje własnego wpisu w `functions`, bez względu na
    eksport”). Do poprawy w tym kroku.
- **Pomiary pojedynczych zapytań** (4 zapytania z piaskownicy, nie z fra1, więc wolniej niż na Vercelu):
  305/1722 (CPI, nagłówek 2026-09): 105 KB, 4,8–5,4 s. 305/739 (2025-09): 5 KB, 3,8 s. **305/1698 (działy
  i klasy 2026-09): 2,44 MB, 6,4 s, `page-size` 5000 mimo `ile-na-stronie=9000`, `page-count` 3.** Odpowiedź
  > 2 MB nie trafia do Data Cache Next.js, a 4 ze 142 klas COICOP nie ma na stronie 0 (osobna pozycja w ROADMAP).
- **Dlaczego mimo to świeżość jest 15/15 ok:** wrześniowe CPI jest już w cache, bo zbudowały go żądania
  użytkowników. `/status` pokazuje `dbw-1` jako „ok”, bo `evaluateCronRuns` uznaje przebieg za udany przy
  `ok ≥ total/2`. Częściowa awaria jest więc niewidoczna (osobna pozycja w ROADMAP).

**Czy mieści się w tym kroku:** tak, w tych samych plikach tras. Warunek: **limitu `gus-cpi-full` nie wolno
podnieść bez walidacji `year`.** Przy 120 s `?year=1` spaliłoby limit DBW cztery razy mocniej niż dziś. Obie
zmiany muszą wejść w jednym wdrożeniu.

## 3. Co widzi użytkownik

- **Telefon (320–430 px) i desktop (1280–1440 px):** bez zmian wizualnych na `/`, `/ceny`, `/gospodarka`, `/praca`.
  Liczby te same, bo klucze cache się nie zmieniają (§4 B8).
- **W dniu publikacji GUS (10:00 czasu PL):** nowy odczyt CPI pojawia się po cronie `dbw-1` (09:40 UTC, na Hobby
  do +1 h), czyli około 10:40–11:40 czasu polskiego zimą. Nie trzeba czekać, aż Data Cache wygaśnie przy
  wizycie użytkownika.
- **`/status`, grupa GUS:** `dbw-1` bez `gus-cpi-full → 504`, `dbw-3` bez `gus-cpi → 504` (zostają 2 trasy:
  koniunktura i ceny rolne).
- **Ktoś wywołuje API z błędnym parametrem:** HTTP 400 i krótki JSON (§4 B6). Odpowiedź przychodzi w milisekundach,
  bez wywołania GUS.

## 4. Wymagania

### A. Limit czasu: jedno źródło prawdy

- **A1.** Limit trasy ustala `export const maxDuration` w pliku trasy (zgodnie z dokumentacją Vercela dla
  Next.js ≥ 13.5). Wartości: `gus-cpi-full` **120**, `gus-ppi-full` **120** (bez zmian), `gus-koniunktura`
  i `dbw-series` **≥ 60**. Te dwie robią 24 wywołania po kolei, a przy kilku 429 (3,5 s każde) przekraczają 30 s.
- **A2.** `vercel.json` → `functions` bez martwych wpisów. Żaden wzorzec nie może być przesłonięty przez
  wcześniejszy dla pliku, do którego pasuje. Glob `src/app/api/**/*.ts` (30 s) zostaje jako domyślny limit dla
  tras bez eksportu. Sposób wybiera inżynier: usunąć wpisy, które dublują eksporty, albo przenieść glob na koniec.
- **A3.** Cron zawsze zdąży zapisać przebieg: dla `dbw-1…4` `maxDuration` crona ≥ suma efektywnych limitów
  wywoływanych tras + odstępy + 10 s (Hobby pozwala do 300 s). Przykład: `dbw-1` = 120 + 60 + 2 × 1,5 + 10 →
  ≥ 193 s.
- **A4.** AGENTS.md: poprawić punkt o `maxDuration`. Źródłem prawdy jest eksport. `vercel.json` bierze pierwszy
  pasujący wzorzec. Dopisać lekcję: wpisy pod globem były martwe i CPI dostawało 504.

### B. Walidacja parametrów (przed czymkolwiek innym w handlerze)

**B1. `year`. Reguła wspólna dla `gus-cpi-full`, `gus-ppi-full`, `gus-koniunktura`, `dbw-series`.**
`W` = rok kalendarzowy w strefie **Europe/Warsaw** w chwili żądania (serwer, `warsawDateKey`/`warsawClock`).
Funkcja przyjmuje `now: Date`, żeby dało się ją testować.

| `year` w żądaniu | Wynik |
|---|---|
| brak albo pusty (`year=`) | `W`. Dziś domyślny jest rok UTC; różnica tylko 31.12 23:00–24:00 UTC. |
| `^\d{4}$` i wartość ∈ {`W−1`, `W`} | przyjęty |
| `W+1`, gdy data w Warszawie to **31 grudnia** | przyjęty. Tolerancja dla urządzeń na wschód od Polski (do UTC+14) i starych kart przeglądarki. |
| każda inna wartość: `1`, `0`, `-1`, `2024`, `2030`, `2026abc`, `2026.0`, ` 2026`, `02026`, `1e3`, `abc` | **400** |
| `year` podany więcej niż raz | **400** |

**Styczeń i dane za poprzedni rok.** Każda z tych tras sama pobiera poprzedni rok w kluczu bieżącego roku:
- `gus-koniunktura`, `dbw-series`: lata [Y−1, Y];
- `gus-ppi-full`: 10 lat;
- `gus-cpi-full`: kwartały do 2025 i miesiące 2026…Y.

Grudzień `W−1`, publikowany w połowie stycznia, jest więc w kluczu `W`. Klucz `W−1` nie jest potrzebny do danych.
Zostaje tylko jako tolerancja dla urządzeń na zachód od Polski rano 1 stycznia. Pierwsze żądanie po północy
w Warszawie (albo cron `dbw-1` 1.01) buduje klucz `W` od zera. Przy limicie 120 s zdąży, bo wcześniejsze okresy
są w Data Cache. **Znany problem poza zakresem:** `gus-cpi-full` ma na sztywno `rok: 2026` dla działów
i klas, więc od publikacji CPI za styczeń 2027 (~13.02.2027) działy stanęłyby na 2026-12. To osobna pozycja
w ROADMAP z terminem.

**B2. Trasy, parametry i wartości, które dziś wysyła nasz kod.** Wszystkie poniższe muszą dalej przechodzić.

| Trasa | Kto woła i z czym (stan na 6b7a32b) | Po zmianie |
|---|---|---|
| `gus-cpi-full` | `useCpiFull()` (Przegląd `src/app/page.tsx`, `InflacjaFull`, `PpiFull`, `PracaDashboard`, `macro-sections`, `GospodarkaAktywnosc`, `hooks.ts` ~729): `?year=<rok urządzenia>`. „Aktualizuj” w `InflacjaFull`: `?year=<rok>&refresh=1`. Świeżość `cpi`: `?year=<rok Warszawy>`. Cron `dbw-1`: `?refresh=1`. `daily-macro` czyta Firestore `gus_cpi_full_<rok daty>_v5` bezpośrednio. | `year` wg B1 |
| `gus-ppi-full` | `usePpiFull()`: bez parametrów. „Aktualizuj”: `?refresh=1`. Cron `dbw-2`: `?refresh=1`. `daily-macro` czyta `gus_ppi_full_<rok>_v2`. | `year` wg B1 |
| `gus-koniunktura` | `useKoniunktura()` (`/gospodarka`, `GospodarkaAktywnosc`): `?year=<rok urządzenia>`. Cron `dbw-3`: `?refresh=1`. | `year` wg B1 |
| `dbw-series` | Hooki (`useDbwSeries` przez `dbwSeriesParams`): `var, przekroj, year=<rok urządzenia>, freq, prez, poz1=33617, sub100=1, poz…`. `dbw-4` i świeżość `retail`/`industry` przez `dbwSeriesPath`: to samo z `year=<rok UTC serwera>`. `dbw-1/2/3`: literały bez `year/prez/poz1/sub100` (domyślne: `prez=5`, `poz1=33617`, `sub100` = prawda, `freq=m`, o ile nie podano `q`). | lista dozwolonych serii (B3) + `year` wg B1 |
| `gus-monthly` | `useGusMonthly()` i świeżość `wages`: `/api/gus-monthly`. Cron `bdl`: `?refresh=1`. Nikt nie wysyła `years`. | `years`: brak albo `4`, inaczej 400 |
| `gus-cpi` | tylko cron `dbw-3` (`?refresh=1`). `useCpiNational` nie jest użyty. | `year` wg B1, poza cronem (B5) |
| `dbw` | nikt | tylko serie z listy dozwolonych (B5) |

`refresh`: `1` = wymuszone odświeżenie jak dziś (limit 10 min na klucz zostaje). Nowe: **`refresh=1` działa tylko
dla klucza `W`.** Przy `year` ≠ `W` jest ignorowane i obowiązuje zwykły TTL. Żaden cron ani przycisk nie odświeża
innego roku, a to połowi budżet wymuszonych wywołań. Nieznane parametry (np. `_=123` z cache-bustera) są
ignorowane, bo nie wpływają na klucz ani okresy.

**B3. `dbw-series`: lista dozwolonych serii.** Żądanie jest przyjmowane tylko wtedy, gdy po uzupełnieniu
domyślnych (`freq=m`, `prez=5`, `poz1=33617`, `sub100=1`) **cała krotka** (`var`, `przekroj`, lista `poz`
w tej kolejności, `freq`, `prez`, `poz1`, `sub100`) jest równa jednej z sześciu konfiguracji. Konfiguracje
z `/ceny` przenieść do `src/lib/gus-dbw-series.ts` jako nazwane stałe. Strona, cron i lista dozwolonych mają
korzystać z tego samego obiektu. Hook ma przyjmować tylko serię z listy (typ albo identyfikator), żeby nie dało
się dodać serii z pominięciem listy.

| Seria | var | przekrój | poz (kolejność) | freq | prez | Gdzie | Klucz cache (Y = rok) |
|---|---|---|---|---|---|---|---|
| Produkcja sprzedana przemysłu | 814 | 807 | 6661769 | m | 7 | Przegląd, Gospodarka, `dbw-4`, świeżość `industry` | `dbwser_814_807_6661769_Y_m_7_v3` |
| Produkcja budowlano-montażowa | 392 | 93 | 6661787 | m | 7 | Gospodarka, `dbw-4` | `dbwser_392_93_6661787_Y_m_7_v3` |
| Sprzedaż detaliczna | 109 | 849 | 6661586 | m | 7 | Przegląd, Gospodarka, `dbw-4`, świeżość `retail` | `dbwser_109_849_6661586_Y_m_7_v3` |
| Ceny mieszkań | 310 | 484 | 4801795, 4801796 | q | 5 | `/ceny` → Nieruchomości, `dbw-1` | `dbwser_310_484_4801795-4801796_Y_q_5_v3` |
| Ceny robót budowlano-montażowych | 312 | 93 | 6661787 | m | 5 | `/ceny` → Budowlane, `dbw-2` | `dbwser_312_93_6661787_Y_m_5_v3` |
| Ceny skupu produktów rolnych | 324 | 775 | 7124703, 7124713, 7124724, 7189791, 7121981 | m | 5 | `/ceny` → Rolne, `dbw-3` | `dbwser_324_775_7124703-7124713-7124724-7189791-7121981_Y_m_5_v3` |

Wszystkie mają `poz1 = 33617` (Polska) i `sub100 = 1`. Odrzucane (400): nieznany `var` lub `przekroj`, inna lista
`poz` (także inna kolejność albo dodatkowa pozycja), `freq` spoza {`m`, `q`} albo niezgodne z serią, inne `prez`,
`poz1` ≠ 33617, `sub100` ≠ `1`, parametr jednowartościowy podany kilka razy, brak `var`/`przekroj`/`poz`
(dziś też 400). Format liczb: `^\d+$`.

**B4. `gus-monthly`:** `years` brak albo dokładnie `4` (klucz `gus_monthly_v3_4`). Inna wartość daje 400.

**B5. Zablokować, nie usuwać** (granica rutyny: „nie usuwaj funkcji”; usunięcie to decyzja właściciela,
propozycja w raporcie i w ROADMAP). Trasy `src/app/api/dbw/route.ts` i `src/app/api/gus-cpi/route.ts` zostają:
- `gus-cpi`: `year` wg B1 (B6 przy złym), `export const maxDuration = 60`; wpis `/api/gus-cpi?refresh=1` wypada
  z `dbw-3` (zostają koniunktura i ceny rolne) — żadna strona go nie czyta, a cron palił 24 wywołania dziennie.
  Hook `useCpiNational` zostaje, ścieżkę bierze z funkcji budującej.
- `dbw`: przepuszcza tylko kombinacje `var`/`przekroj` z listy dozwolonych serii (B3) i `rok` wg B1; reszta
  dostaje 400 (B6) bez wywołania DBW. Otwarte proxy znika, trasa nie.
Poprawić komentarze w `dbw-1…3` (liczby wywołań) i wzmiankę w README (`/api/dbw*`).

**B6. Odpowiedź na błędny parametr:** HTTP **400**, nagłówek `Cache-Control: no-store`, ciało
`{ "error": "<krótki opis po polsku>", "param": "<nazwa>" }`, np.
`{ "error": "Nieprawidłowy rok: dozwolone 2025, 2026.", "param": "year" }` albo
`{ "error": "Nieznana seria DBW.", "param": "series" }`. Walidacja idzie **przed** `withCache`, więc przy
błędzie nie ma odczytu ani zapisu Firestore ani żadnego `fetch` do GUS. Kształt `{ error }` jest zgodny
z kontrolą świeżości (`fetchJsonWithTimeout` traktuje go jako błąd API).

**B7. Ścieżki do tych tras powstają w jednym miejscu.** Dziś hooki, crony i świeżość budują URL-e każde po
swojemu. Funkcje budujące (np. `cpiFullPath()`, `koniunkturaPath()`, `ppiFullPath()`, `gusMonthlyPath()`,
`dbwSeriesPath(seria)`) mają być czyste i eksportowane, a używać ich mają hooki, crony i `FRESHNESS_DATASETS`.
**Hooki nie wysyłają roku z zegara urządzenia.** Rok ustala serwer (Warszawa). Zły zegar telefonu nie może
skończyć się błędem 400, a w kodzie klienta znika wartość zależna od „dziś”. Listy endpointów cronów
`dbw-1…4` i `bdl` przenieść do modułu, który da się zaimportować w teście (np. `src/lib/cron-endpoints.ts`):
plik `route.ts` w App Routerze nie może eksportować nic poza handlerami i konfiguracją.

**B8. Klucze cache bez zmian.** Każde poprawne żądanie trafia w ten sam klucz co dziś:
`gus_cpi_full_Y_v5`, `gus_ppi_full_Y_v2`, `gus_koniunktura_Y_v2`, `gus_monthly_v3_4` i sześć kluczy `dbwser_…`
z B3. Po wdrożeniu nie ma zimnego cache ani dodatkowych wywołań DBW. `daily-macro` dalej czyta te same klucze.

**B9. Budżet DBW po zmianie** (do opisu w PR, bez testu):
- Bez `refresh` wszystkie poprawne klucze z obu lat to ≤ ~550 wywołań na 48 h (TTL). Dziś nie ma górnej granicy.
- Z `refresh=1` (tylko klucze `W`, najwyżej co 10 min) to 64 + 60 + 24 + 128 + 3 = **279 na 10 min**, nadal
  powyżej limitu ~100 / 15 min. Od 25.10.2026 `/api/*` jest za bramką, więc `refresh=1` może wysłać tylko
  zalogowany z dostępem — ale okres próbny dostaje każdy zweryfikowany e-mail, więc ryzyko zostaje. Domyka to
  dopiero 1b (wymuszone odświeżenie tylko z `CRON_SECRET`).
- `/api/dbw` (zablokowane proxy): 6 serii × 2 lata × do 18 okresów ≈ 216 kluczy po 1 wywołaniu DBW na 24 h.
  Nikt jej nie czyta — argument za decyzją właściciela o usunięciu (ROADMAP, „Wymaga właściciela”).

## 5. Dane

Ten krok nie dodaje zbioru. Zmienne DBW, których dotyczy: 305 (CPI, przekroje 736/739/1698/1722), 314 (PPI,
657), 184 (koniunktura, 803), 376 (płace, 16) oraz sześć serii z B3.

- **Sprawdzona liczba z nagłówka** (bez zmian po kroku, ma się zgadzać po wdrożeniu): CPI wrzesień 2026 =
  **4,1% r/r**. DBW 305/1722, poz 14916914, grupa `6902025` (ogółem), prez 5 = 104,1. Wcześniejsze grupy w tym
  przekroju dają 104,2 / 104,4, ale `pick()` poprawnie wybiera 6902025. Niezależnie:
  [finwire, 15.10.2026](https://finwire.pl/artykuly/inflacja-wrzesien-2026-odczyt-finalny-gus) podaje odczyt
  finalny 4,1% r/r i żywność −0,4% (DBW 1698, poz 14150568, grupa 6902025 = 99,6).
- **Kalendarz:** komunikaty GUS o 10:00 czasu PL. Najbliższe pełne CPI: **13.11.2026** (za październik,
  `CPI_PRELIMINARY_PUBLISH`). Crony `dbw-1` 09:40, `dbw-4` 11:40, `dbw-2` 13:40, `dbw-3` 15:40 UTC.
- **Świeżość:** bez nowego `DatasetSpec`. Istniejące `cpi`, `retail`, `industry`, `wages` muszą dalej trafiać
  w te same klucze (kryterium 11).
- **Dostęp:** DBW bez klucza, ~100 żądań / 15 min. Dopiski źródła na stronach bez zmian.

## 6. Lekcje zastosowane (lista z `docs/PRODUCT.md`)

- [x] Liczba = komunikat. CPI 09.2026 4,1% sprawdzone z DBW i niezależnym źródłem. Klucze cache się nie zmieniają.
- [ ] Metodologia/baza: nie dotyczy (bez zmian).
- [x] Kalendarz: kontrola produkcyjna 13.11.2026 (kryterium 19).
- [x] Upstream `no-store`, cron z `refresh=1`, dziennik cronów. Ten krok sprawia, że ścieżka `no-store` crona
  naprawdę się kończy.
- [x] Crony wołają `SITE_URL` przez `internal-fetch`. Bez zmian, listy tylko się przenoszą.
- [x] `refresh=1` z limitem zostaje, dochodzi „tylko klucz bieżącego roku”.
- [x] Kontrola świeżości: test, że żaden endpoint z `FRESHNESS_DATASETS` nie dostaje 400.
- [x] Nic zależnego od „dziś” przed hydratacją: hooki przestają liczyć rok z zegara urządzenia.
- [ ] Telefon / desktop: nie dotyczy, brak zmian UI. Klucze i liczby te same.
- [ ] CSP: nie dotyczy, brak nowego źródła w przeglądarce.
- [x] Nowe lekcje (dopisane do `docs/PRODUCT.md`): limit czasu z `export const maxDuration`, a cron ≥ suma tras;
  publiczna trasa do źródła z limitem przyjmuje tylko znane parametry.

## 7. Kryteria akceptacji

Testy bez sieci (vitest). Żaden test nie woła GUS.

**A. Limit czasu**

1. `tests/function-limits.test.ts` liczy efektywny `maxDuration` dla każdego `src/app/api/**/route.ts` tak jak
   Vercel: najpierw eksport w pliku, potem pierwszy pasujący wzorzec `vercel.json` w kolejności kluczy. Wymaga:
   `gus-cpi-full` = 120, `gus-ppi-full` = 120, `gus-koniunktura` ≥ 60, `dbw-series` ≥ 60.
2. Ten sam test: żaden wpis `vercel.json` → `functions` nie jest przesłonięty przez wcześniejszy wzorzec dla
   pliku, do którego pasuje (zero martwych wpisów).
3. Ten sam test: dla `dbw-1…4` efektywny `maxDuration` crona ≥ suma efektywnych limitów tras z jego listy
   + liczba tras × odstęp + 10 s.
4. AGENTS.md: punkt o `maxDuration` poprawiony zgodnie z A4. Recenzja sprawdza tekst.

**B. Walidacja**

5. `tests/gus-params.test.ts`, reguła `year` (B1) dla chwil:
   - `2026-10-25T12:00+02:00`: {2025, 2026}, `2027` daje 400;
   - `2026-12-31T10:00+01:00`: {2025, 2026, 2027};
   - `2026-12-31T22:59:00Z`: {2025, 2026, 2027};
   - `2026-12-31T23:30:00Z`: domyślnie 2027, przyjęte {2026, 2027}, `2025` daje 400;
   - `2027-01-01T12:00+01:00`: {2026, 2027}.

   Do tego wszystkie złe formaty z B1 dają 400, a podwójny `year` też 400.
6. `dbw-series` (B3): każda z 6 serii zbudowana przez funkcje z B7 jest przyjęta i rozpoznana jako właściwa
   seria. Dzisiejsze literały crona `dbw-1`, `dbw-2` i `dbw-3` (dokładnie te stringi z 6b7a32b) są przyjęte
   i dają te same klucze. Każdy przypadek odrzucenia z B3 ma test z wynikiem 400. Osobny przypadek:
   `sub100=0` i `poz1=1` przy parametrach Przeglądu.
7. `gus-monthly`: brak `years` i `years=4` są przyjęte. `years=5`, `years=abc` i `years=4&years=4` dają 400.
8. Test na poziomie trasy dla `gus-cpi-full`, `gus-ppi-full`, `gus-koniunktura`, `dbw-series`, `gus-monthly`
   (mock `@/lib/server-cache` i `fetch`):
   - ≥3 błędne żądania na trasę: status 400, `{ error, param }`, `Cache-Control: no-store`, `withCache`
     i `fetch` wywołane 0 razy;
   - jedno poprawne: `withCache` wywołane raz z oczekiwanym kluczem.
9. Klucze (B8): dla poprawnych żądań przy Y = 2026 klucze są dokładnie takie jak w B3/B8.
10. `refresh=1` z `year` ≠ `W` daje `withCache` z dodatnim TTL (bez wymuszenia). Z `year` = `W` albo bez
    `year` daje `-1`.
11. **„Nasze ścieżki nigdy nie dostają 400”:** test przechodzi po wszystkich listach endpointów cronów (wszystkie
    grupy z modułu z B7), po `FRESHNESS_DATASETS` (`endpoint(now)` i `withRefreshParam(endpoint(now))`)
    i po wynikach funkcji budujących używanych przez hooki, dla pięciu chwil z kryterium 5. Każda ścieżka do
    trasy objętej walidacją przechodzi walidator. Test pada, jeśli dowolny cron albo zbiór świeżości trafi
    w odrzucony parametr.
12. Test statyczny: w `src/**` poza modułem funkcji budujących i plikami samych tras nie ma literału ścieżki
    `/api/gus-cpi-full`, `/api/gus-ppi-full`, `/api/gus-koniunktura`, `/api/dbw-series` ani `/api/gus-monthly`
    zaraz po cudzysłowie, apostrofie albo backticku. Komentarze nie są liczone. W `src/app/ceny/page.tsx` nie ma
    `config={{`.

**C. Zablokowane trasy (bez usuwania)**

13. `src/app/api/dbw/route.ts` i `src/app/api/gus-cpi/route.ts` istnieją i walidują parametry (testy jak dla
    pozostałych tras: zły `year`/`rok` albo seria spoza listy → 400 bez wywołania GUS). `dbw-3` ma 2 endpointy,
    żaden cron nie woła `/api/gus-cpi`.

**Ogólne**

14. `npx tsc --noEmit -p .`, `npm test`, eslint zmienionych plików, `npm run build`: bez błędów.
15. Playwright nie jest wymagany, bo UI się nie zmienia, a budowę URL-i hooków pokrywają kryteria 11–12.
    Jeśli inżynier i tak sprawdza `/ceny` w `next dev`, przechwytuje `/api/dbw-series*` (`page.route`) i nie
    woła DBW.
16. Produkcja po wdrożeniu (pojedyncze żądania, po jednym na URL). Od 25.10.2026 `/api/*` jest za bramką
    (ustawiony `CRON_SECRET`): **bez uwierzytelnienia oczekiwane jest 401** `{"error":"unauthorized"}`, a 400
    widać tylko z `-H "Authorization: Bearer $CRON_SECRET"` (właściciel) albo z ciasteczkiem `__session` konta
    z dostępem. Wtedy:
    - `curl -s -o /dev/null -w '%{http_code} %{time_total}\n' -H "Authorization: Bearer $CRON_SECRET" 'https://savori.space/api/gus-cpi-full?year=1'`
      zwraca `400` + `{ error, param }` w < 2 s;
    - 400 zwracają też: `/api/gus-ppi-full?year=2030`, `/api/gus-koniunktura?year=abc`,
      `/api/dbw-series?var=1&przekroj=1&poz=1`, parametry sprzedaży z B3 z `&sub100=0`, `/api/gus-monthly?years=5`;
    - 400 zwracają też `/api/dbw?var=1&przekroj=1&rok=2026` i `/api/gus-cpi?year=1`.
17. Produkcja: `/api/health/freshness` zwraca 200 i 15/15 ok (`cpi` = 2026-09). `/api/gus-cpi-full?year=2026`
    (z uwierzytelnieniem jak w 16) ma ostatni punkt nagłówka `2026-09` z `yoy` 4,1 (do 13.11). Publiczny dowód bez
    logowania: `/start` czyta ten sam klucz `gus_cpi_full_2026_v5` i pokazuje CPI 4,1% za wrzesień 2026.
18. Produkcja: pierwszy przebieg `dbw-1` i `dbw-3` po wdrożeniu ma w `crons.items` `failed: []` i `ok == total`,
    a `ms` jest poniżej `maxDuration` crona. Samo `failed: []` niczego nie rozstrzyga — `dbw-1` 25.10 09:53 UTC,
    przed wdrożeniem, też miał 2/2 ok (33,8 s), gdy DBW odpowiadał szybko. Dowód rozstrzygający: Vercel →
    Deployment → Functions pokazuje `/api/gus-cpi-full` z limitem 120 s, crony `dbw-1/2/4` 200 s i `dbw-3` 140 s
    (lokalnie to samo daje `.next/server/functions-config-manifest.json` po `npm run build`).
19. **13.11.2026 (CPI za październik):** do 11:00 UTC przebieg `dbw-1` z tego dnia ma `failed: []`, świeżość `cpi`
    = ok z `2026-10`, a liczba zgadza się z komunikatem GUS (sprawdzona z niezależnym źródłem). Wynik dopisać
    w ROADMAP (pozycja P0).

## 8. Poza zakresem

- **1b:** wymuszone odświeżenie GUS tylko z `CRON_SECRET`. Do tego czasu `refresh=1` na kluczach `W` może dać
  ~279 wywołań na 10 min (B9).
- **1c:** walidacja tras BDL (`bdl-series` `start/count/step/year`, `gus-labor-extra` `year`, `regional-gus`,
  `gus-regional`) i limit BDL.
- Rok 2026 na sztywno w działach `gus-cpi-full`, stronicowanie przekroju 1698 (5000 wierszy), `/status`
  ukrywający częściowe awarie cronów, kalendarz GUS 2027: osobne pozycje w ROADMAP.
- Zmiana kluczy cache, formatu odpowiedzi, współbieżności DBW, CORS.

## 9. Akcje właściciela

Ten krok ich nie wymaga. Krok 1b, czyli jedyna pełna ochrona limitu GUS przed `refresh=1`, wymaga ustawienia
`CRON_SECRET` w Vercelu (Settings → Environment Variables, Production).

## 10. Pliki do zmiany (orientacyjnie, decyduje inżynier)

- nowe: `src/lib/gus-params.ts` (czysty walidator `year`/serii/`years` i odpowiedź 400),
  `src/lib/cron-endpoints.ts` (listy cronów), `tests/gus-params.test.ts`, `tests/gus-routes.test.ts`,
  `tests/function-limits.test.ts`;
- `src/lib/gus-dbw-series.ts`: 6 nazwanych serii, lista dozwolonych, funkcje budujące bez roku urządzenia,
  ewentualnie ścieżki pozostałych tras;
- trasy: `src/app/api/gus-cpi-full/route.ts` (walidacja, `maxDuration` 120, rok Warszawy),
  `gus-ppi-full/route.ts`, `gus-koniunktura/route.ts` (+ `maxDuration`), `dbw-series/route.ts` (+ `maxDuration`),
  `gus-monthly/route.ts`;
- zablokować walidacją (nie usuwać): `src/app/api/gus-cpi/route.ts`, `src/app/api/dbw/route.ts`;
- crony: `src/app/api/cron/dbw-1…4/route.ts` (listy z modułu, `maxDuration` wg A3), `src/app/api/cron/bdl/route.ts`
  (lista z modułu);
- klient: `src/lib/hooks.ts` (bez `useCpiNational`, bez roku urządzenia, ścieżki z funkcji budujących),
  `src/app/ceny/page.tsx` (nazwane serie), `src/components/sections/DbwPriceSection.tsx` (typ serii);
- `src/lib/freshness.ts` (ścieżki z funkcji budujących);
- `vercel.json` (bez martwych wpisów), `AGENTS.md` (A4, walidacja, zablokowane trasy), `README.md` (`/api/dbw*`).
