# Japonia: rozbicie inflacji, krok 1 („schody miar”, bez klucza API)

- **Pozycja w backlogu:** ROADMAP 0, prośba właściciela z 24.10.2026 („ładne rozbicie inflacji w Japonii”).
- **Ten krok:** rozbicie CPI ogółem na różnice między **oficjalnymi miarami** Statistics Bureau. Źródło
  to Statistics Dashboard, bez klucza.
- **Następny krok (poza zakresem):** oficjalne wkłady ważone (寄与度) i kategorie koszyka miesięcznie z e-Stat API
  (`ESTAT_APP_ID`, akcja właściciela).
- **Ekran:** `/japonia` (`src/components/jp/JpInflation.tsx`).

## 1. Problem i wartość dla użytkownika

Dziś `/japonia` pokazuje, **ile** wynosi inflacja (2,1% we wrześniu 2026). Nie pokazuje, **co ją niesie**.
Czytelnik w dniu publikacji chce wiedzieć, czy inflacja jest „z ropy i ryżu”, czy z szerokiego wzrostu cen.
To drugie interesuje BOJ, a pierwsze nie. Szczególnie że:

- 2025: ceny ryżu, ponad 3% inflacji ciągniętej przez żywność;
- od 2026: zniesienie tymczasowej akcyzy na benzynę i dopłaty do energii.

Pytanie, na które odpowiada sekcja: **„Co we wrześniu podnosi, a co obniża inflację w Japonii i ile
wynosi inflacja bez żywności i energii?”**

## 2. Co pokazujemy, a czego nie: uczciwość metody

Statistics Dashboard daje miesięcznie tylko miary zbiorcze. Są to kolejne koszyki, z których Statistics Bureau
wyjmuje po jednej grupie:

```
bez żywności i energii (R) ──+ żywność poza świeżą──▶ bez świeżej żywności i energii (CC)
                           ──+ energia─────────────▶ bez świeżej żywności „bazowa” (C)
                           ──+ świeża żywność──────▶ CPI ogółem (T)
```

Każdy stopień to **różnica dwóch opublikowanych stóp r/r** w p.p.:

- żywność poza świeżą = CC − R;
- energia = C − CC;
- świeża żywność = T − C.

Z definicji R + trzy różnice = T **dokładnie**. Każdy poziom pośredni jest liczbą z komunikatu.

**To nie są wkłady (寄与度).** Różnica mówi, o ile stopa się zmienia, gdy grupę dołączamy do koszyka.
Zależy ona od tego, czy grupa drożeje szybciej, czy wolniej niż reszta koszyka. Wkład z komunikatu mówi,
ile punktów dodaje sama zmiana cen grupy. Wrzesień 2026 dobrze pokazuje, że to inne liczby (komunikat MIC
z 23.10.2026, 第2表 i 表5):

| Grupa | Różnica miar (pokażemy) | Wkład 寄与度 (komunikat) | Dynamika grupy r/r (komunikat) |
|---|---|---|---|
| Świeża żywność (waga 379/10000) | ±0,0 p.p. | +0,08 p.p. | +2,1% (≈ tempo reszty koszyka, stąd 0,0) |
| Energia (749) | −0,3 p.p. | −0,04 p.p. | −0,6% (dużo wolniej niż reszta 2,4%) |
| Żywność poza świeżą, bez alkoholu (~2264) | +0,2 p.p. | ok. +0,68 p.p. | +2,9% (szybciej niż reszta 2,2%) |
| Bez żywności i energii (6609) | poziom 2,2% | 1,43 p.p. | +2,2% |

Wnioski dla tekstów na stronie (obowiązujące):

1. Nigdzie w sekcji nie używamy słowa „wkład” na nasze liczby. Mówimy „różnica miar” i „podnosi / obniża
   inflację o X p.p.”, a w „Jak czytać” jest wyjaśnienie, czym to się różni od wkładu.
2. Znak różnicy interpretujemy tylko tak, jak na to pozwala matematyka: „drożeje szybciej / wolniej niż reszta
   koszyka”. Nie piszemy „ceny energii spadły”, bo tego z tych danych nie wiemy.
3. Stopy są publikowane z dokładnością 0,1. Różnica dwóch zaokrąglonych stóp ma więc błąd do ±0,1 p.p.:
   - |d| ≤ 0,1 opisujemy jako „tempo zbliżone do reszty koszyka”;
   - za czynnik napędzający uznajemy dopiero |d| ≥ 0,3.
4. Kolejność stopni jest narzucona przez miary, które publikuje Statistics Bureau, i mówimy to wprost.
5. Grupy nazywamy zgodnie z definicjami japońskimi:
   - **świeża żywność** (生鮮食品) = świeże ryby i owoce morza, świeże warzywa, świeże owoce;
   - **żywność poza świeżą** = 食料 bez 生鮮食品 i bez napojów alkoholowych, czyli ryż i zboża, mięso,
     żywność przetworzona, napoje, słodycze, **gastronomia (外食)**;
   - **energia** = prąd, gaz miejski, LPG, nafta, benzyna;
   - **bez żywności i energii** (食料（酒類を除く）及びエネルギーを除く総合) = alkohol zostaje w koszyku,
     gastronomia nie. Miara jest zbliżona do inflacji bazowej NBP (bez żywności i energii), ale nie identyczna,
     bo w Polsce restauracje zostają w koszyku. Nazywamy ją „bez żywności i energii”, **nie** „bazowa”.
     „Bazowa” to na tej stronie już CPI bez świeżej żywności (japoński „core”).

## 3. Co widzi użytkownik

### Telefon (320–430 px), kolejność od góry

1. **Hero** (bez zmian w układzie). Opis: „CPI ogółem wynosi 2,1% r/r przy celu BOJ 2%.” + **zdanie-wniosek**
   z rozbicia (pkt 4 niżej) + istniejące zdanie o wstępnym Tokio. Dotychczasowe zdanie wyliczające bazową
   i miarę bez energii wypada z opisu, bo te liczby są w wierszach panelu hero i w kaflach.
2. **Kafle KPI**: bez zmian (4 kafle). Nowa seria **nie** dostaje kafla.
3. **NOWA sekcja „Co napędza inflację”** (`SectionCard editorial`, podtytuł: „dane za wrzesień 2026 · różnice
   oficjalnych miar CPI, p.p.”):
   1. **Zdanie-wniosek** (pogrubione, maks. 3 linie przy 320 px). Dla 09.2026: „Energia obniża inflację
      o 0,3 p.p.; ceny bez żywności i energii rosną 2,2% r/r (miesiąc wcześniej 1,6%).”
   2. **Schody** (lista HTML `<ol>`, nie wykres SVG — liczby w HTML z serwera, czytelne przy 320 px), 5 wierszy.
      W każdym wierszu: etykieta, wartość (wyrównana do prawej, `tabular-nums`), pod spodem drobny opis
      i pasek. Paski leżą na wspólnej skali [min(0, poziomy), max(poziomy)]. Odcinek biegnie od poprzedniego
      poziomu do nowego, tak jak w wodospadzie. Kolory jak w polskiej „Dekompozycji CPI”: podnosi —
      czerwony, obniża — zielony, poziomy i suma — granat. |d| ≤ 0,1 to szary znacznik 2 px. Wrzesień 2026:

      | Wiersz | Wartość | Opis (druga linia) |
      |---|---|---|
      | Bez żywności i energii | 2,2% | punkt wyjścia · miesiąc wcześniej 1,6% |
      | + żywność poza świeżą | +0,2 p.p. | → 2,4% bez świeżej żywności i energii · drożeje szybciej niż reszta koszyka |
      | + energia | −0,3 p.p. | → 2,1% bez świeżej żywności (bazowa) · drożeje wolniej niż reszta koszyka albo tanieje |
      | + świeża żywność | ±0,0 p.p. | → 2,1% CPI ogółem · tempo zbliżone do reszty koszyka |
      | = CPI ogółem | 2,1% | (wiersz sumy, pogrubiony) |

      Wiersze nie są interaktywne, więc reguła 44 px ich nie dotyczy. Nic nie jest ucinane przy 320 px:
      opis zawija się do drugiej linii, wartość zostaje w pierwszej.
   3. **Wykres „Od miary bez żywności i energii do CPI ogółem”**, domyślnie 24 miesiące (10.2024–09.2026):
      - słupki skumulowane miesiąc po miesiącu, dodatnie nad zerem, ujemne pod zerem. Segmenty:
        - „Bez żywności i energii (%)”, kolor neutralny;
        - „Żywność poza świeżą (p.p.)”;
        - „Energia (p.p.)”;
        - „Świeża żywność (p.p.)”;
      - linia „CPI ogółem (%)” w kolorze `#2563EB`, jak na wykresie trendu. Przechodzi dokładnie przez sumę
        słupków;
      - linia odniesienia 0 i cel BOJ 2%;
      - zakres: przyciski 2L / 5L (domyślnie 2L; dopuszczalne dodanie `'2L'` do `RangeKey`);
      - legenda pod wykresem;
      - dymek tylko po dotknięciu (telefon) albo najechaniu (mysz). Treść dymka, np.:
        „wrzesień 2026 · Bez żywności i energii 2,2% · Żywność poza świeżą +0,2 p.p. · Energia −0,3 p.p. ·
        Świeża żywność ±0,0 p.p. · = CPI ogółem 2,1%”;
      - jednostki: poziomy w %, stopnie w p.p.
   4. **Stopka sekcji (atrybucja przetworzenia):**
      - „Opracowanie Savori na podstawie danych Statistics Bureau of Japan (CPI, baza 2025, Statistics Dashboard).
        Różnice miar policzone przez Savori.”
      - po japońsku, `lang="ja"`: 「出典：総務省統計局「消費者物価指数」（統計ダッシュボード）を加工して作成」.
4. Wykres trendu, „Kolejne publikacje”: bez zmian.
5. **„Jak czytać”** — dochodzą trzy punkty (treść obowiązująca, redakcja dopuszczalna):
   - „Rozbicie to różnice między oficjalnymi miarami: o ile zmienia się stopa inflacji, gdy do koszyka
     dołączamy kolejno żywność poza świeżą, energię i świeżą żywność. Kolejność wynika z miar, które publikuje
     Statistics Bureau.”
   - „To nie są wkłady (寄与度) z komunikatu. Grupa, która drożeje w tym samym tempie co reszta koszyka, ma różnicę
     0,0 p.p., nawet jeśli jej ceny rosną. Oficjalne wkłady pokażemy w kolejnym kroku.”
   - „Bez żywności i energii: alkohol zostaje w koszyku, a gastronomia nie. To miara bliska inflacji bazowej
     NBP, ale nie identyczna. Różnice stóp zaokrąglonych do 0,1 mają dokładność ±0,1 p.p.”

### Desktop (1280–1440 px)

Sekcja „Co napędza inflację” zajmuje całą szerokość. Zdanie-wniosek idzie na górze, na całą szerokość.
Pod nim siatka `2fr / 1fr`, jak w rzędzie trendu: wykres po lewej, schody po prawej. W DOM schody są
**przed** wykresem (kolejność na telefonie), a na `lg` trafiają do prawej kolumny. Brak przewijania w bok
przy 1280 px.

### Stany

- **Brak serii `exFoodEnergy`** (stary wpis cache) **albo brak wspólnego miesiąca czterech miar:**
  - sekcja pokazuje stan „Brak danych do rozbicia”;
  - nigdy zera i nigdy liczb z różnych miesięcy;
  - reszta strony działa jak dziś.
- **Miary na różne miesiące** (Dashboard zaktualizował jedną serię później):
  - schody i zdanie-wniosek pokazują **najnowszy miesiąc wspólny wszystkim czterem miarom**, z jego okresem
    („dane za sierpień 2026”);
  - hero dalej pokazuje najnowsze CPI ogółem;
  - kontrola świeżości zgłasza `lag`.

### Zdanie-wniosek: reguły (czysta funkcja, testowana)

Wejście: miesiąc M z wartościami T, C, CC, R oraz R z M−1, jeśli jest. Wszystko liczymy w dziesiątych
(`Math.round(x*10)`), bez błędów zmiennoprzecinkowych.

1. S = grupy z |d| ≥ 0,3 p.p., posortowane malejąco po |d|. Przy remisie stała kolejność: żywność poza świeżą,
   energia, świeża żywność. Bierzemy co najwyżej dwie.
2. Czasownik: d > 0 → „podnosi”, d < 0 → „obniża”. Druga grupa: „podnosi ją” / „obniża ją”.
3. Fraza R:
   - R > 0: „ceny bez żywności i energii rosną R% r/r”;
   - R < 0: „… spadają o |R|% r/r”;
   - R = 0: „… stoją w miejscu (0,0% r/r)”.

   Plus „ (miesiąc wcześniej X%)”, jeśli jest M−1.
4. Szablony:
   - S puste: „Inflację niesie koszyk bez żywności i energii: {fraza R}.”
   - |S| = 1: „{Grupa} {podnosi|obniża} inflację o |d| p.p.; {fraza R}.”
   - |S| = 2: „{Grupa1} {…} inflację o |d1| p.p., {grupa2} {…} ją o |d2| p.p.; {fraza R}.”

Oczekiwane wyniki (dane z API, zgodne z komunikatami):

| Miesiąc | T / C / CC / R | Różnice (żywn. / energia / świeża) | Zdanie |
|---|---|---|---|
| 09.2026 | 2,1 / 2,1 / 2,4 / 2,2 | +0,2 / −0,3 / 0,0 | „Energia obniża inflację o 0,3 p.p.; ceny bez żywności i energii rosną 2,2% r/r (miesiąc wcześniej 1,6%).” |
| 08.2026 | 1,9 / 1,7 / 1,9 / 1,6 | +0,3 / −0,2 / +0,2 | „Żywność poza świeżą podnosi inflację o 0,3 p.p.; ceny bez żywności i energii rosną 1,6% r/r (miesiąc wcześniej 1,4%).” |
| 02.2026 | 1,3 / 1,5 / 2,4 / 1,5 | +0,9 / −0,9 / −0,2 | „Żywność poza świeżą podnosi inflację o 0,9 p.p., energia obniża ją o 0,9 p.p.; ceny bez żywności i energii rosną 1,5% r/r (miesiąc wcześniej 1,5%).” |
| 05.2025 | 3,5 / 3,7 / 3,3 / 1,6 | +1,7 / +0,4 / −0,2 | „Żywność poza świeżą podnosi inflację o 1,7 p.p., energia podnosi ją o 0,4 p.p.; ceny bez żywności i energii rosną 1,6% r/r (miesiąc wcześniej 1,6%).” |

Przypadek „S puste” testujemy na danych syntetycznych, np. T 2,0 / C 2,0 / CC 2,1 / R 1,9, R(M−1) 1,8 →
„Inflację niesie koszyk bez żywności i energii: ceny bez żywności i energii rosną 1,9% r/r (miesiąc wcześniej 1,8%).”

## 4. Dane

### Źródło i serie

Statistics Dashboard API (`getData`, bez klucza). Zapytanie jak dla istniejących serii:

```
Cycle=1, RegionalRank=2, RegionCode=00000, IsSeasonalAdjustment=1 (dane surowe), MetaGetFlg=Y, SectionHeaderFlg=2
```

Sprawdzone 24.10.2026 (`TimeFrom=20240900`). Wszystkie punkty mają `@isProvisional = 0`.

| id | Kod | Nazwa u źródła (walidacja `mustInclude`) | 08.2026 | 09.2026 |
|---|---|---|---|---|
| `headline` (jest) | 0703010601010030000 | （前年同月比）消費者物価指数（総合）2025年基準 | 1,9 | 2,1 |
| `core` (jest) | 0703010601010030010 | （前年同月比）消費者物価指数（生鮮食品を除く総合）2025年基準 | 1,7 | 2,1 |
| `coreCore` (jest) | 0703010601010030040 | （前年同月比）消費者物価指数（生鮮食品及びエネルギーを除く総合）2025年基準 | 1,9 | 2,4 |
| **`exFoodEnergy` (nowa)** | **0703010601010030020** | （前年同月比）消費者物価指数（**食料（酒類を除く）及びエネルギーを除く総合**）2025年基準 | 1,6 | 2,2 |

Konfiguracja nowej serii w `src/lib/jp/cpi.ts`:

```
indicator 0703010601010030020, rank 2, region 00000, from JP_CPI_FROM
mustInclude [YOY, '（食料（酒類を除く）及びエネルギーを除く総合）', BASE]
```

Fragmenty `mustInclude` czterech serii wzajemnie się wykluczają: żadna nazwa nie zawiera fragmentu innej
serii, więc podmiana kodu kończy się błędem.

Nowa seria **nie** trafia do kafli, wykresu trendu ani listy „Jak czytać” serii. Osobna lista albo flaga to
wybór inżyniera.

**Weryfikacja krzyżowa** (niezależna publikacja, nie Dashboard): 総務省統計局, „2025年基準 消費者物価指数 全国
2026年(令和8年)9月分”, 23.10.2026, https://www.stat.go.jp/data/cpi/sokuhou/tsuki/pdf/zenkoku.pdf:

- 第1表: 2,1 / 2,1 / 2,4 za 09.2026 i cała historia 2025–2026, zgodna z API co do 0,1;
- 第2表: 食料（酒類を除く）及びエネルギーを除く総合 — waga 6609, 08.2026 1,6%, 09.2026 **2,2%**;
- wagi: 総合 10000, 生鮮食品を除く 9621, 生鮮食品及びエネルギーを除く 8872, 生鮮食品 379, エネルギー 749,
  生鮮食品を除く食料 2375, 酒類 111.

Strona podsumowania https://www.stat.go.jp/data/cpi/sokuhou/tsuki/index-z.htm też podaje 2,1 / 2,1 / 2,4.
**Wszystkie liczby schodów za 09.2026 są zgodne z komunikatem.**

Indeksy (…090xxx) i m/m (…040…) nie są potrzebne w tym kroku.

### Kalendarz, świeżość, cron, cache

- **Kalendarz:** komunikat krajowy, 8:30 JST (`JP_CPI_NATIONAL_RELEASES` w `src/lib/jp/calendar.ts`). Najbliższy
  20.11.2026 (dane za 10.2026), czyli 19.11 23:30 UTC, w Polsce 20.11 0:30 CET. Wiek rozbicia liczymy od
  komunikatu krajowego miesiąca, który pokazują schody.
- **Szybkość źródła:** dane za 09.2026 były w Dashboard 24.10 o 10:38 UTC. Godziny pojawienia się w dniu
  publikacji nie sprawdziliśmy — sprawdzamy 20.11.2026 (kryterium 17).
- **Pobranie:**
  - ta sama trasa `/api/jp/cpi` i ten sam komplet (wszystko albo nic). Błąd nowej serii = błąd całości,
    `withCache` zostawia ostatni spójny komplet, a kontrola `jp-cpi` to wykrywa;
  - upstream `no-store`, 300 ms odstępu, czyli +1 zapytanie na odświeżenie (5 zamiast 4).
- **Budżet czasu:** obecnie 4 serie × limit 20 s = 80 s, a to więcej niż `maxDuration` 60 s
  (`/api/jp/cpi` i `/api/cron/jp` w `vercel.json`). To istniejąca usterka. Po zmianie najgorszy przypadek
  musi się mieścić w 60 s:
  - albo limit na zapytanie ≤ 10 s (5 × 10 s + 4 × 0,3 s = 51,2 s);
  - albo wyższe `maxDuration` w kodzie **i** w `vercel.json` dla obu tras.
- **Cache:** nowy kształt payloadu, więc klucz `jp_data/cpi_v2` albo wymuszenie odświeżenia wpisu bez
  `exFoodEnergy`. Wybór należy do inżyniera, kryterium 15 obowiązuje w obu wariantach.
- **Cron:** bez nowego crona.
  - Istniejący `jp` (00:30 UTC = 9:30 JST) woła `/api/jp/cpi?refresh=1` przez `internal-fetch`;
  - drugi przebieg w `refresh` (06:00 UTC = 15:00 JST);
  - wpis w dzienniku `health/cron_runs` jak dotąd (`CRON_SPECS.jp`). Rozbicie odświeża się razem z CPI, bo to ten sam klucz cache.
- **Kontrola świeżości:** nowy `DatasetSpec`:
  - id `jp-cpi-breakdown`, etykieta „Japonia — rozbicie inflacji”, `kind: 'jp-dashboard'`, `group: 'jp'`;
  - `endpoint: () => '/api/jp/cpi'`, czyli dokładnie ten sam klucz co hook i cron;
  - `extract` = najnowszy miesiąc wspólny dla `headline`, `core`, `coreCore`, `exFoodEnergy`;
  - `expected` = `expectedJpCpi(now).period`, `tolerance: MONTHLY`, `maxAgeDays: 70`, `selfHeal: true`.
- **Limity i warunki:**
  - API bez klucza, prośba o niewielki ruch: 5 zapytań na odświeżenie, najwyżej co 10 min (`refresh=1`)
    lub co 6 h;
  - wymagany dopisek Dashboard (`DASHBOARD_CREDIT_JA/PL`) zostaje w stopce strony;
  - warunki rządowe (政府標準利用規約) wymagają oznaczenia przetworzenia i zakazują przedstawiania obliczeń
    jako rządowych — stąd stopka sekcji (pkt 3.4).
- **CSP:** bez zmian. Przeglądarka woła tylko `/api/jp/cpi`.

## 5. Lekcje zastosowane (lista z `docs/PRODUCT.md`)

- [x] **Liczba = liczba z komunikatu.** Cztery miary sprawdzone z 第1表/第2表 komunikatu MIC z 23.10.2026.
  Poziomy pośrednie schodów to liczby z komunikatu. Różnice są oznaczone jako obliczenia Savori.
- [x] **Właściwa baza:** 2025, `BASE` w `mustInclude` nowej serii.
- [x] **Kalendarz z godziną i strefą** (8:30 JST). Wiek od komunikatu krajowego pokazanego miesiąca.
- [x] **Upstream `no-store`, cron `refresh=1`, dziennik cronów:** istniejący `jp`, ten sam klucz.
- [x] **Crony przez `SITE_URL`/`internal-fetch`:** bez zmian, istniejący `jp`.
- [x] **`refresh=1` z limitem 10 min:** bez zmian.
- [x] **Kontrola świeżości dla nowego zbioru:** `jp-cpi-breakdown`.
- [x] **Nic zależnego od „dziś” przed hydratacją:** schody, zdanie i wykres zależą tylko od danych.
  Sekcja nie ma plakietki „nowe”. Jeśli ją dostanie, to po `useIsClient()`.
- [x] **Telefon 320/390 i desktop 1280/1440** bez przewijania w bok (kryteria 8–9).
- [x] **CSP:** nie dotyczy, brak nowego źródła w przeglądarce.

## 6. Kryteria akceptacji

1. **Konfiguracja:** `exFoodEnergy` z kodem 0703010601010030020 i `mustInclude` jak w pkt 4. Fixture
   `tests/fixtures/jp/dashboard-cpi-exfoodenergy.json` to utrwalona odpowiedź API z 24.10.2026.
   - Parser zwraca nazwę z 「食料（酒類を除く）及びエネルギーを除く総合」 i 「2025年基準」.
   - Ostatnie punkty: `{date:'2026-08', value:1.6}` i `{date:'2026-09', value:2.2}`.
   - Odpowiedź `coreCore` parsowana z konfiguracją `exFoodEnergy` rzuca błąd, i odwrotnie (`npm test`).
2. **Fixtures `core` i `coreCore`** (utrwalone 24.10.2026) obok istniejących `headline` i `tokyo`. Testy
   rozbicia działają wyłącznie na utrwalonych odpowiedziach API.
3. **Funkcja rozbicia** (czysta, w `src/lib/jp/`) zwraca wiersze tylko dla miesięcy, w których są wszystkie
   cztery miary. Dla **każdego** miesiąca z fixture'ów R + d_żywn + d_energia + d_świeża = T, dokładnie
   w dziesiątych (test).
4. **Wartości (test):**

   | Miesiąc | R | d_żywn | d_energia | d_świeża | T | Poziomy pośrednie |
   |---|---|---|---|---|---|---|
   | 09.2026 | 2,2 | +0,2 | −0,3 | 0,0 | 2,1 | 2,4 i 2,1 |
   | 08.2026 | 1,6 | +0,3 | −0,2 | +0,2 | 1,9 | |
   | 05.2025 | 1,6 | +1,7 | +0,4 | −0,2 | 3,5 | |

5. **Rozjechane miesiące (test):** w danych `exFoodEnergy` kończy się na 2026-08, a reszta na 2026-09.
   - Rozbicie i zdanie dotyczą 2026-08 z etykietą „dane za sierpień 2026”.
   - `jp-cpi-breakdown` = `lag` dla `now` = 2026-10-24.
   - Ten sam payload bez serii `exFoodEnergy` = stan „Brak danych do rozbicia”, a nie zera.
6. **Zdanie-wniosek (test):** dokładne łańcuchy z tabeli w pkt 3 dla 09.2026, 08.2026, 02.2026, 05.2025
   i przypadku syntetycznego „S puste”. Do tego R < 0 („spadają o …”) i brak M−1 (bez nawiasu).
7. **Hero:** opis zawiera zdanie-wniosek za najnowszy wspólny miesiąc. Zrzut 390 px; w produkcji `curl` HTML
   z `/japonia` zawiera „obniża inflację o 0,3 p.p.”, dopóki najnowszy jest 09.2026.
   *Poprawka po REVIEW 24.10.2026:* w hero zdanie pojawia się tylko wtedy, gdy miesiąc rozbicia jest taki sam
   jak miesiąc CPI ogółem. Hero nie ma etykiety okresu dla zdania, więc w przeciwnym razie wraca dotychczasowy
   opis (bazowa, bez energii). Sekcja rozbicia pokazuje wtedy starszy miesiąc z własną etykietą. Wymagany test.
8. **Telefon 390 i 320 px** (Playwright, zrzuty):
   - kolejność: hero → kafle → „Co napędza inflację” (zdanie, schody, wykres) → trend;
   - 0 przewijania w bok;
   - wartości schodów nie są ucięte ani zawinięte, opisy się zawijają;
   - widoczne „+0,2 p.p.”, „−0,3 p.p.”, „±0,0 p.p.”, „2,2%”, „2,1%”.
9. **Desktop 1440 i 1280 px** (zrzuty): wykres po lewej (2/3), schody po prawej (1/3), zdanie na całą
   szerokość, 0 przewijania w bok.
10. **Wykres** (zrzut 390 px z otwartym dymkiem):
    - domyślnie 24 miesiące, od 10.2024 do 09.2026;
    - segmenty ujemne pod zerem;
    - linia CPI ogółem na sumie słupków w każdym miesiącu;
    - dymek pokazuje miesiąc, 4 składniki z właściwymi jednostkami (% / p.p.) i „= CPI ogółem”;
    - na dotyk dymek otwiera się po tapnięciu, nie po przewinięciu.
11. **Słownictwo:**
    - w sekcji i hero nie ma słowa „wkład” poza zdaniem w „Jak czytać”, które wyjaśnia różnicę;
    - jest fraza „różnic(e) … miar”;
    - teksty trzech nowych punktów „Jak czytać” są obecne.

    Sprawdzenie: `grep` na komponencie plus zrzut.
12. **Atrybucja:** stopka sekcji z „Opracowanie Savori …” i japońskim 「…を加工して作成」 (`lang="ja"`).
    Dopisek Statistics Dashboard dalej jest w stopce strony (zrzut i HTML).
13. **Świeżość:**
    - `tests/freshness.test.ts` lub `tests/jp-cpi.test.ts` pokrywa `jp-cpi-breakdown`: `ok` dla kompletu
      do 2026-09 przy `now` = 2026-10-24 oraz `lag` jak w kryterium 5;
    - `/status` pokazuje pozycję w grupie „Japonia” (zrzut).
14. **Budżet czasu:** najgorszy przypadek pobrania (5 × limit na zapytanie + odstępy) < `maxDuration` tras
    `/api/jp/cpi` i `/api/cron/jp`. Wyliczenie jest w komentarzu w kodzie. Jeśli zmienia się `maxDuration`,
    to w kodzie i w `vercel.json`.
15. **Migracja cache:** po wdrożeniu i jednym `GET https://savori.space/api/jp/cpi?refresh=1`:
    - `jq '.series.exFoodEnergy[-1]'` daje `{"date":"2026-09","value":2.2}`;
    - strona nigdy nie pokazuje schodów z niepełnego kompletu (kryterium 5);
    - HTML `/japonia` ma liczby rozbicia najpóźniej po 35 min (ISR 1800 s).
16. **Definicja „zrobione”:**
    - `tsc`, `npm test`, eslint zmienionych plików i `npm run build` przechodzą czysto;
    - Playwright 390 i 1440 px: 0 błędów konsoli, 0 naruszeń CSP.
17. **Produkcja:**
    - po wdrożeniu `/api/health/freshness`: `jp-cpi` i `jp-cpi-breakdown` = `ok`;
    - **20.11.2026** do 15:00 JST oba `ok` z okresem 2026-10, a cron `jp` ma wpis w dzienniku.

    Wynik dopisać do ROADMAP przy J1.

## 7. Poza zakresem

- **Oficjalne wkłady ważone (寄与度)** dla świeżej żywności, energii, żywności poza świeżą i 10 grup koszyka
  (食料, 住居, 光熱・水道 … 教養娯楽), miesięcznie. Do tego dynamika r/r samych grup (np. energia −0,6%)
  i szacunek efektu polityki energetycznej (komunikat: −0,82 p.p. dla energii we wrześniu).
  - Krok 2, z e-Stat API (`ESTAT_APP_ID`).
  - Liczenie wkładów z zaokrąglonych indeksów Dashboard odrzucone: daje błąd rzędu ±0,05–0,1 p.p.
    Przykład: świeża żywność wychodzi ok. 0,0 zamiast +0,08 z komunikatu, czyli liczba inna niż oficjalna.
- **Towary vs usługi** (財・サービス), rozbicie Tokio, rozbicie m/m wyrównane sezonowo.
- **Zmiany na polskim `/ceny`.** Wspólny komponent wodospadu jest dopuszczalny, ale nie wymagany.

## 8. Akcje właściciela

- **`ESTAT_APP_ID`** (potrzebne do kroku 2 i do J1, wstępne Tokio):
  - darmowa rejestracja na https://www.e-stat.go.jp/mypage/user/preregister (e-mail);
  - w „マイページ” → „API機能（アプリケーションID発行）” wydać ID dla adresu `https://savori.space`;
  - wpisać w Vercel → Project → Settings → Environment Variables jako `ESTAT_APP_ID` (Production i Preview).
  - Krok 1 tego **nie** wymaga.
