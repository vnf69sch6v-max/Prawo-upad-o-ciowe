# Polska na tle UE, krok 1: inflacja HICP r/r. Polska, strefa euro, Niemcy, Czechy, Węgry

- **Pozycja:** ROADMAP 11 („Polska na tle UE”), krok 1 z 3. Kolejne kroki to bezrobocie i PKB, każdy z osobnym spec.
- **Dlaczego teraz:** właściciel 02.11.2026: „nie widzę realnych ulepszeń strony”. Jedna liczba z GUS nie mówi,
  czy inflacja w Polsce jest wysoka. Ten krok to pierwsza na stronie odpowiedź na pytanie „wysoka względem czego?”.
  Dane są już sprawdzone, źródło nie wymaga klucza, a cała praca mieści się w jednym PR.
- **Nie to:** szybki szacunek strefy euro (uzasadnienie w punkcie „Flash”), bezrobocie, PKB, wszystkie 27 krajów,
  wybór krajów przez użytkownika, inflacja bazowa i składowe.

## Problem i wartość dla użytkownika

Inwestor, analityk albo dziennikarz widzi w dniu publikacji GUS „inflacja 4,1%” i od razu pyta, czy to dużo na tle
Europy. Dziś musi otworzyć tabelę Eurostatu. Po tym kroku dostaje odpowiedź w jednym zdaniu, z liczbą i okresem.
Wyjdzie z niego na przykład, że Polska ma najwyższą inflację w zestawieniu, ale tylko 0,2 p.p. powyżej strefy euro,
a luka zwęziła się z 2,3 p.p. dwa lata temu.

Porównanie musi używać tej samej miary dla wszystkich krajów, czyli HICP. Do CPI GUS go nie mieszamy (patrz „Jak czytać”).

## Gdzie: `/ceny/na-tle-ue` (nowa podstrona, komponent serwerowy, ISR)

Decyzja i uzasadnienie:
- **Nie sekcja w `/ceny`.** `/ceny/page.tsx` to strona kliencka z zakładkami (`'use client'`) i nie ma liczb
  w HTML z serwera. Równolegle edytują ją gałęzie `claude/cpi-flash` (zakładka inflacji) i `claude/twoja-inflacja`.
  Sekcja w środku gwarantowałaby konflikty i liczby dopiero po hydratacji.
- **Nie `/ue` jako sekcja najwyższego poziomu.** Nagłówek 1440 px już się nie mieścił (AGENTS: „Header from `xl`”),
  a dolny pasek ma 4 + „Więcej”. Kolejna sekcja w `NAV_ITEMS` kosztuje miejsce za jeden wskaźnik.
- **`/ceny/na-tle-ue`:** `isActive` dopasowuje prefiks, więc zakładka „Ceny” świeci się na telefonie i na desktopie.
  Kraj zostaje `pl`, bo `countryOf()` patrzy tylko na `/japonia`. Nowy katalog nie dotyka plików innych gałęzi.
  Kroki 2–3 (bezrobocie, PKB) będą rodzeństwem pod wspólnym hubem. Ewentualna przeprowadzka na `/na-tle-ue`
  to wtedy jedno przekierowanie, decyzja po kroku 3.
- **Wejścia (≤2 tapnięcia):**
  - (a) arkusz „Więcej”: nowa grupa „Porównania” z pozycją „Polska na tle UE”, `mobile-nav.ts`, tylko `MORE_GROUPS`;
  - (b) `CommandPalette`: wpis w grupie „Wskaźniki”, `sub: 'Ceny'`, słowa kluczowe `ue unia strefa euro hicp
    eurostat niemcy czechy węgry porównanie`;
  - (c) jedna linia na `/ceny`: link „Polska na tle UE →” jako osobny komponent `EuCompareLink`, wstawiony jednym
    importem i jednym elementem JSX pod `MobileTabs`. Konflikt z innymi gałęziami jest wtedy trywialny
    (1 linia). Kto scala drugi, rozwiązuje go.

## Co widzi użytkownik

Kolejność: wniosek → liczby → wykres → szczegóły. Dane trafiają do HTML na serwerze, z `peekEuHicp()`.

### Telefon (320–430 px)

1. **Nagłówek** `PageHeader` „Polska na tle UE · Inflacja HICP” i link powrotny „← Ceny” (≥44 px).
2. **Wniosek (hero)**, jedno zdanie z danych, z funkcji czystej `euHicpHeadline()`:
   „Inflacja HICP w Polsce: **4,0%** we wrześniu 2026, 0,2 p.p. powyżej strefy euro (3,8%), najwyżej w zestawieniu.”
   Pod spodem wiersz kontekstu: „Luka wobec strefy euro: 0,2 p.p., dwa lata temu 2,3 p.p. (październik 2024).”
   - Reguły słów: różnica PL−EA > 0,05 → „powyżej”, < −0,05 → „poniżej”, inaczej „na poziomie strefy euro”.
   - Miejsce 1 → „najwyżej w zestawieniu”, miejsce 5 → „najniżej w zestawieniu”, inaczej „N. miejsce z 5”.
   - Zaokrąglenie do 0,1, przecinek dziesiętny, różnice ze znakiem (`+0,5 p.p.`, `−0,3 p.p.`, minus typograficzny).
3. **Okres i źródło pod wnioskiem:** „Dane za wrzesień 2026 · Eurostat, aktualizacja 16.10.2026”. Data pochodzi
   z pola `updated` odpowiedzi, przeliczonego na Europe/Warsaw, a nie z zegara. Dzięki temu renderuje się na serwerze
   bez ryzyka #418.
4. **Karty krajów** zamiast tabeli (≤4 kolumny, wzorzec (a) z `mobile-designer.md`), w kolejności miejsca:
   - kraj po polsku po lewej, wartość po prawej (tabular-nums, ≥20 px);
   - pod spodem „+0,5 p.p. m/m · 1. miejsce”;
   - karta Polski wyróżniona (obwódka/tło akcentu), strefa euro z dopiskiem „średnia strefy euro (21 państw)”.
   - Nazwy: Polska, Strefa euro, Niemcy, Czechy, Węgry.
5. **Wykres liniowy, 24 miesiące** (Recharts), wysokość 240 px:
   - Polska grubsza linia (2,5–3 px) w kolorze akcentu, pozostałe 1,5 px w stonowanych, rozróżnialnych kolorach
     z tokenów `mk-*`;
   - przerywana linia odniesienia „cel EBC 2%” z podpisem;
   - ≤5 etykiet osi X (`MM.RR` albo „paź 24”), oś Y z „%”, legenda pod wykresem, zawija się;
   - tooltip na tapnięcie pokazuje wszystkie 5 wartości miesiąca i nie wychodzi poza kartę. Hover tylko dla precyzyjnego
     wskaźnika (`useCanHover()`);
   - bez przełącznika zakresów, okres jest stały (24 mies.).
6. **„Jak czytać”** (rozwijane, zwinięte domyślnie):
   - HICP to zharmonizowany indeks cen Eurostatu, liczony tą samą metodą w każdym kraju UE. Dlatego nadaje się
     do porównań.
   - Dla Polski różni się od CPI GUS (inny koszyk i wagi), więc liczba na tej stronie może się różnić o kilka
     dziesiątych od nagłówka na `/ceny`. Link do `/ceny`.
   - „Zmiana m/m” to zmiana stopy rocznej względem poprzedniego miesiąca w punktach procentowych, a nie inflacja
     miesiąc do miesiąca.
   - Strefa euro od 01.01.2026 obejmuje 21 państw (z Bułgarią). Eurostat łączy skład łańcuchowo.
   - Cel EBC (2%) dotyczy strefy euro. Cel NBP (2,5% ±1 p.p.) jest określony dla CPI, nie HICP, więc nie jest
     rysowany.
   - Bez liczb wpisanych na sztywno w tekst.
7. **Następna publikacja:** „Następny odczyt Eurostatu: 18 listopada 2026, 11:00”, z `EU_HICP_RELEASES`. Zależy od
   „dziś”, więc renderuje się tylko po `useIsClient()`.
8. **Stopka źródła:** „Źródło: Eurostat, zbiór prc_hicp_minr (HICP, ECOICOP ver. 2), stopa roczna, `coicop18=TOTAL`.”
   Link do strony zbioru w przeglądarce danych Eurostatu. Tekst stale widoczny, nie w rozwijanym.

### Desktop (1280/1440 px)

- Wniosek w pełnej szerokości, pod nim siatka `lg:grid-cols-3`: wykres 2/3 (wysokość 320 px) i lista krajów 1/3.
- Lista krajów od `md` jako tabela: Kraj | Wrzesień 2026 | Zmiana m/m (p.p.) | Miejsce. Nagłówek kolumny z nazwą
  miesiąca, nie „ostatni”.
- Reszta jak na telefonie. Spójność z Japonią: ten sam `PageHeader`, ta sama karta/typografia liczb, co w sekcjach
  `/japonia/*`. Japonia nie ma odpowiednika, więc nie wymaga zmian.

### Stany

- **Brak wpisu w cache** (pierwsze wdrożenie przed cronem): karta z „Dane Eurostatu jeszcze się ładują. Pierwsze
  pobranie wykona automat (codziennie 06:00 UTC)”, bez liczb i bez „0,0%”. Strona nie woła źródła w renderze.
- **Brak wartości kraju w ostatnim miesiącu:** okresem nagłówka jest ostatni miesiąc wspólny dla wszystkich 5 serii.
  Nowszy punkt pojedynczego kraju widać tylko na wykresie.

## Dane (sprawdzone na żywo 02.11.2026)

**Zapytanie** (jedno, bez klucza):
`https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/prc_hicp_minr?format=JSON&lang=en&coicop18=TOTAL&unit=RCH_A&geo=PL&geo=EA&geo=CZ&geo=HU&geo=DE&sinceTimePeriod=<26 mies. wstecz>`

Odpowiedź z 02.11.2026 jest utrwalona w `tests/fixtures/eurostat-hicp-minr-2026-09.json` (6558 B, `sinceTimePeriod=2024-09`, 25 miesięcy).
- `label`: „Harmonised index of consumer prices (HICP) - ECOICOP ver.2 - indices and rates of change, monthly data”
- `updated`: `2026-10-16T23:00:00+0200`, `source`: `ESTAT`
- `id`: `[freq, unit, coicop18, geo, time]`, `size`: `[1, 1, 1, 5, 25]`, 125 wartości, brak `status` (bez flag)
- `unit`: `RCH_A` = „Annual rate of change”, `coicop18`: `TOTAL` = „Total”, `freq`: `M`
- `geo.EA`: „Euro area (EA11-1999, …, EA20-2023, EA21-2026)”. To agregat o **zmiennym składzie** i właściwy wybór:
  bieżący skład to EA21 od 01.2026, łańcuchowo. Nie używamy `EA20`/`EA21` o stałym składzie.

| Kraj | 2024-10 | 2026-07 | 2026-08 | 2026-09 | m/m (p.p.) | Miejsce |
|---|---|---|---|---|---|---|
| Polska (PL) | 4,3 | 3,1 | 3,5 | **4,0** | +0,5 | 1 |
| Strefa euro (EA) | 2,0 | 2,9 | 3,2 | **3,8** | +0,6 | 2 |
| Niemcy (DE) | 2,4 | 2,8 | 2,9 | **3,3** | +0,4 | 3 |
| Czechy (CZ) | 3,0 | 1,3 | 1,5 | **2,2** | +0,7 | 4 |
| Węgry (HU) | 3,4 | 1,6 | 1,8 | **2,1** | +0,3 | 5 |

PL−EA: 2024-10 = +2,3 p.p., 2026-09 = +0,2 p.p.

**Cross-check:** komunikat Eurostatu „Annual inflation up to 3.8% in the euro area”, Euro indicators,
16.10.2026 (`2-16102026-ap`), tabela HICP: strefa euro 3,2 → 3,8, Niemcy 2,9 → 3,3, Czechy 1,5 → 2,2, Węgry 1,8 → 2,1,
Polska 3,5 → 4,0 (sierpień → wrzesień). Wszystko zgodne z API. W tekście komunikatu Węgry (2,1%) są wśród trzech
najniższych w UE. Dla kontekstu: CPI GUS za wrzesień 2026 to 4,1% (odczyt końcowy, wg finwire.pl), czyli inna miara.
To uzasadnia dopisek w „Jak czytać”.

**Metodologia:** HICP ECOICOP ver. 2 od danych za styczeń 2026. `prc_hicp_manr` jest zamrożony na 2025-12 i jest
zakazany. Stopa roczna `RCH_A` z indeksu 2025=100. Wartości do 0,1, jak w komunikacie.

**Kalendarz:** komunikat Euro indicators o 11:00 czasu Luksemburga (CET/CEST = strefa Warszawy).
- Wrzesień: 16.10.2026 (opublikowany).
- Październik: **18.11.2026** („Next release: 18 November 2026” w komunikacie z 16.10, potwierdzone u źródła).
- Listopad: 17.12.2026 tylko wg kalendarzy zewnętrznych. Wpisać do mapy dopiero po potwierdzeniu w kalendarzu
  Euro indicators Eurostatu. Bez potwierdzenia mapa kończy się na październiku i działa heurystyka.
- Pole `updated` w bazie pokazało 23:00 dnia publikacji, więc baza może dostać nowy miesiąc później niż komunikat.
  Stąd druga przebieżka crona po południu (niżej) i kontrola 18.11.

**Flash strefy euro: odkładamy (krok 2 lub osobna pozycja).** Powody:
1. Szybki szacunek za październik wychodzi **04.11.2026** (komunikat z 16.10: „next flash estimate … scheduled for
   4 November 2026”). Dziś go nie ma, nie ma więc czego zweryfikować.
2. Nie potwierdziłem zbioru API z flashem. `prc_hicp_fmmr`, `prc_hicp_flsh` i `prc_hicp_fl` zwracają 404
   „not available for dissemination”. `teicp000` i `ei_cphi_m` mają EA tylko do 2026-09 (`updated` 16.10).
   Nie wiadomo, czy flash w ogóle tam trafia.
3. Flash jest tylko dla strefy euro. Postawienie EA za październik obok PL/DE/CZ/HU za wrzesień miesza okresy
   w jednym porównaniu, wbrew zasadom 3 i 5.

Do zrobienia przy kroku flash: 04.11 po 11:00 sprawdzić, które zbiory/`unit` dostały EA 2026-10, i dopiero wtedy
napisać spec. Wartość ma być oznaczona „szybki szacunek” poza tabelą rankingu.

**Dostęp i atrybucja:** API Eurostatu działa bez klucza i bez rejestracji, ponowne użycie jest dozwolone z podaniem
źródła („Source: Eurostat”). Limitu żądań w praktyce nie odczuwamy: jedno wywołanie na przebieżkę crona.

### Implementacja danych (wzorzec kraju z `PRODUCT.md`)

- `src/lib/eu/hicp.ts`, moduł czysty bez `fetch`. Zawiera `EU_HICP_GEOS = ['PL','EA','DE','CZ','HU']`, polskie
  nazwy, `parseEuHicp(raw)` → `{ updated, latest: 'YYYY-MM', series: Record<geo, {date, value}[]>, rows:
  [{ geo, value, prev, changePp, rank }] }` oraz `euHicpHeadline()`, `EU_HICP_RELEASES`, `expectedEuHicp(now)`.
  **Walidacja (throw):**
  - `label` zawiera „HICP” i „ECOICOP ver.2”;
  - `dimension.unit` ma dokładnie `RCH_A`, `coicop18` dokładnie `TOTAL`, `freq` dokładnie `M`;
  - `geo` zawiera wszystkie 5 kodów i żadnego innego, a etykieta `EA` zaczyna się od „Euro area”;
  - jest ≥13 miesięcy wspólnych dla wszystkich 5 geo.

  Ranking liczy się po wartości malejąco. Remisy dzielą miejsce (1, 2, 2, 4). W remisie kolejność kart jest
  alfabetyczna po polskiej nazwie.
- `src/lib/eu/hicp-server.ts` odpowiada za fetch, `withCache` i peek:
  - własny `fetch(url, { cache: 'no-store' })` z sprawdzeniem `res.ok` i `raw.error`. `fetchEurostat` się nie nadaje,
    bo `parseJsonStat` gubi `updated` i etykiety potrzebne do walidacji;
  - `withCache('eurostat', 'eu_hicp_v1', …, 'Eurostat', force ? -1 : 12 h)` przez `toStored` (robi to `withCache`);
  - `getEuHicp({ force })` i `peekEuHicp()`. `sinceTimePeriod` = 26 miesięcy przed bieżącym miesiącem warszawskim,
    liczone w fetcherze na serwerze.
- **Trasa `GET /api/eu-hicp`** (`src/app/api/eu-hicp/route.ts`, `export const maxDuration = 30`):
  - jedyny parametr to `refresh=1` (wymuszenie najwyżej co 10 min dzięki `withCache`, `-1`, nigdy `0`);
  - inne parametry są ignorowane, a klucz cache jest stały, więc z parametrów nie powstaje żaden klucz;
  - odpowiedź = sparsowany payload, nagłówki cache jak w `/api/eurostat`.
- **Strona** `src/app/ceny/na-tle-ue/page.tsx`: komponent serwerowy, `export const revalidate = 1800`, tylko
  `peekEuHicp()`, `generateMetadata` z wnioskiem, `canonical` = `${SITE_URL}/ceny/na-tle-ue`.
- **Świeżość:** `DatasetSpec`
  - `id: 'eu-hicp'`, `label: 'Inflacja HICP — Polska na tle UE'`, `source: 'Eurostat'`, `kind: 'eurostat'`,
    `group: 'eurostat'`, `frequency: 'monthly'`;
  - `endpoint: () => '/api/eu-hicp'` (dokładnie ścieżka crona bez `refresh=1`);
  - `extract` = `latest` (ostatni miesiąc wspólny dla 5 geo);
  - `expected: expectedEuHicp`: mapa `EU_HICP_RELEASES` (`'2026-09': '2026-10-16'`, `'2026-10': '2026-11-18'`,
    godzina 11:00 Warszawa), poza mapą `expectedMonthlyByDay(now, 20)`;
  - `tolerance: { ok: 0, lag: 1 }`, `maxAgeDays: 100`, `lagNote: LAG_NOTES.eurostat`, `selfHeal: true`.
- **Cron:**
  - grupa `refresh` (06:00 UTC, równolegle, Eurostat nie dzieli limitu z GUS): `'/api/eu-hicp?refresh=1'` na liście
    `ENDPOINTS`;
  - druga przebieżka w dniu publikacji: ten sam endpoint na końcu listy crona `nbp` (pn–pt 13:00 UTC = 3 h po 11:00
    CET). Bez niej październik pojawiłby się dopiero 19.11 o 06:00 UTC: `lag` to tylko ostrzeżenie i self-heal
    z 16:40 go nie łapie;
  - oba crony mają już `maxDuration = 120`. Trasa ma 30 s, a pojedyncze wywołanie Eurostatu trwa ~1–3 s, więc limitów
    nie trzeba podnosić. Nowej grupy w `CRON_SPECS` nie trzeba, nowego wpisu w `vercel.json` też nie.
- **CSP:** bez zmian. Przeglądarka nie łączy się z Eurostatem, wszystko przechodzi przez serwer, a link do zbioru
  to zwykła nawigacja.
- **`/prywatnosc`:** bez zmian. Nie przetwarzamy żadnych nowych danych osobowych, nie ma per-user stanu, cookies,
  `localStorage` ani nowego odbiorcy danych, a do Eurostatu idzie żądanie serwera bez danych użytkownika.
  Potwierdzone.

## Zastosowane lekcje (`PRODUCT.md`)

- [x] Liczba = liczba z komunikatu: API = komunikat Eurostatu z 16.10.2026 dla wszystkich 5 serii.
- [x] Właściwa metodologia: `prc_hicp_minr`, ECOICOP ver. 2, nie zamrożony `prc_hicp_manr`. Walidacja etykiety zbioru.
- [x] Kalendarz z godziną i strefą (11:00 CET, `EU_HICP_RELEASES`). Wiek liczony od komunikatu, z którego liczba
      trafia na stronę, nie od flasha.
- [x] Upstream `no-store`, cron z `refresh=1`, dziennik cronów (`refresh`, `nbp`).
- [x] Crony przez `internal-fetch` / `warmEndpoints`, bez nowego mechanizmu.
- [x] `refresh=1` z limitem 10 min (`-1`, nie `0`).
- [x] Publiczna trasa przyjmuje tylko znane parametry. Klucz jest stały, z parametrów nie powstaje ani klucz, ani
      lista okresów.
- [x] `export const maxDuration` w pliku trasy. Limit crona (120 s) ≥ trasa (30 s).
- [x] Kontrola świeżości `eu-hicp`.
- [x] Nic zależnego od „dziś” przed hydratacją: tylko „Następny odczyt”, za `useIsClient()`.
- [x] 320/390/1440 bez przewijania w bok.
- [ ] Nowe źródło w przeglądarce → CSP: nie dotyczy (tylko serwer).
- [ ] Dane użytkownika: nie dotyczy.

## Kryteria akceptacji

1. **Parser na fixture:** `tests/eu-hicp.test.ts` czyta `tests/fixtures/eurostat-hicp-minr-2026-09.json`.
   - `latest === '2026-09'`, `updated` = 2026-10-16T21:00:00Z;
   - wiersze w kolejności PL 4.0 (+0.5, 1), EA 3.8 (+0.6, 2), DE 3.3 (+0.4, 3), CZ 2.2 (+0.7, 4), HU 2.1 (+0.3, 5);
   - różnice m/m zaokrąglone do 0,1, bez błędów zmiennoprzecinkowych typu 0.49999.
2. **Okno wykresu:** każda seria ma dokładnie 24 punkty, 2024-10 … 2026-09. Pierwszy punkt to PL 4.3 i EA 2.0.
3. **Wniosek:** `euHicpHeadline(parsed)` zwraca tekst zawierający „4,0%”, „wrzesień 2026”,
   „0,2 p.p. powyżej strefy euro (3,8%)” i „najwyżej w zestawieniu”. Zdanie kontekstu zawiera „2,3 p.p.” oraz
   „październik 2024”.
   Test z danymi syntetycznymi pokrywa „poniżej”, „na poziomie” (|różnica| ≤ 0,05), „najniżej” i „3. miejsce z 5”.
   Remis (dwa kraje 2,1) daje miejsca 1, 2, 3, 4, 4.
4. **Walidacja (throw), każdy przypadek osobnym testem na zmodyfikowanej kopii fixture:**
   - brak `HU` w `geo`;
   - dodatkowy `EU27_2020`;
   - `unit` = `I25`;
   - `coicop18` = `CP01`;
   - etykieta zbioru bez „ECOICOP ver.2”, czyli stary `prc_hicp_manr`;
   - <13 wspólnych miesięcy.
5. **Ostatni wspólny miesiąc:** gdy w kopii fixture usuniemy wartość `HU` za 2026-09, `latest === '2026-08'`, a ranking
   i m/m liczą się za sierpień (PL 3.5, EA 3.2).
6. **Świeżość:**
   - `FRESHNESS_DATASETS` zawiera `eu-hicp` z `endpoint() === '/api/eu-hicp'`;
   - `ENDPOINTS` crona `refresh` i `nbp` zawierają `'/api/eu-hicp?refresh=1'`, a test sprawdza zgodność endpointu
     po usunięciu `refresh`;
   - `expectedEuHicp`: 18.11.2026 10:59 Warszawa → `2026-09`, 18.11.2026 11:00 → `2026-10`;
   - poza mapą (np. 15.01.2027 → `2026-11`, 20.01.2027 → `2026-12`) działa heurystyka dnia 20;
   - `extract` na odpowiedzi trasy (fixture po parserze) daje `2026-09`.
7. **Trasa:**
   - `src/app/api/eu-hicp/route.ts` ma `export const maxDuration = 30`;
   - `GET /api/eu-hicp?foo=1&year=1999` daje ten sam klucz cache i tę samą odpowiedź co `/api/eu-hicp`, bez
     dodatkowego wywołania Eurostatu;
   - fetcher używa `cache: 'no-store'`, sprawdzane grepem lub testem;
   - `npm test` (`tests/function-limits.test.ts`, `tests/cron-runs.test.ts`) zielone.
8. **Strona bez upstreamu w renderze:** `src/app/ceny/na-tle-ue/page.tsx` ma `revalidate = 1800`, importuje tylko
   `peekEuHicp`, a grep nie znajduje w niej `fetch(` ani `getEuHicp`. Po `next build && next start` z danymi
   w cache HTML (`curl -s localhost:3000/ceny/na-tle-ue` z sesją albo w trybie demo) zawiera:
   - „4,0%”;
   - „wrzesień 2026”;
   - „Eurostat”;
   - „prc_hicp_minr”;
   - „16.10.2026”.
9. **Pusty cache:** w trybie demo bez Firestore strona renderuje stan „Dane Eurostatu jeszcze się ładują…”, bez „0,0%”
   i bez błędu 500. Dowód: zrzut 390 px.
10. **Zrzuty ekranu Playwright (`next start`):**
    - 320, 390 i 1440 px, z cache wypełnionym fixture (lub z `/api/eu-hicp` w dev);
    - `document.documentElement.scrollWidth === innerWidth` na każdej szerokości;
    - karty krajów na 390 px, tabela na 1440 px;
    - linia PL wyraźnie grubsza;
    - legenda pod wykresem;
    - cele dotyku (link „← Ceny”, pozycje wykresu) ≥44 px na 390 px.
11. **Konsola:** 0 błędów, 0 React #418/#423, 0 `securitypolicyviolation`. Zrzut lub log Playwright na 390 i 1440 px.
12. **Wejścia:**
    - arkusz „Więcej” (390 px) ma grupę „Porównania” → „Polska na tle UE”;
    - `⌘K` „strefa euro” znajduje wpis;
    - `/ceny` ma link „Polska na tle UE →”;
    - na `/ceny/na-tle-ue` aktywna jest zakładka „Ceny” (dolny pasek i nagłówek).
13. **`/prywatnosc` bez zmian:** `git diff --stat main -- src/app/prywatnosc` jest pusty, CSP w `next.config.ts` też
    bez zmian.
14. `tsc --noEmit`, `npm test`, eslint zmienionych plików i `npm run build` przechodzą czysto.
15. **Produkcja (po wdrożeniu, kontrola PM):**
    - `/api/health/freshness` → `eu-hicp` = `ok` z okresem `2026-09`, wpis crona `refresh` z `/api/eu-hicp` w `routes`;
    - **18.11.2026**: do 13:30 UTC `eu-hicp` = `ok` z okresem `2026-10` (przebieżka `nbp` 13:00 UTC);
    - wartości październikowe zgadzają się z komunikatem Eurostatu z 18.11. Wynik dopisać w ROADMAP.

## Poza zakresem

- Szybki szacunek HICP strefy euro (powody wyżej). Osobny spec po 04.11.2026.
- Bezrobocie (`une_rt_m`) i PKB (`namq_10_gdp`) na tle UE, czyli kroki 2 i 3 pozycji 11.
- Średnia UE27 i pozostałe kraje (Słowacja, Rumunia…), wybór krajów, HICP bazowy i składowe, porównanie poziomów cen.
- Pozycja „UE” w hero Przeglądu (`rankHeroSignals`).
- Przeniesienie na hub `/na-tle-ue`, decyzja po kroku 3.

## Działania właściciela

Brak. Źródło jest bezkluczowe, a crony już istnieją. `ALERT_WEBHOOK_URL` (opcjonalny) obejmie nowy zbiór automatycznie.
