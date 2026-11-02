# Twoja inflacja — krok 1: własne udziały 13 działów COICOP 2018 vs CPI GUS

- **Pozycja:** `docs/ROADMAP.md` 10 (W3), krok 1 z 3. Zakres ustalony przez właściciela 02.11.2026.
- **Gałąź:** `claude/twoja-inflacja`.
- **Krok 1 (ten):** 13 działów, start = oficjalne wagi GUS 2026, wynik dla najnowszego pełnego miesiąca,
  wkład działów w p.p., reset, stan w adresie, bez konta. Plus naprawa przybliżonych wag na `/ceny` (niżej, D1).
- **Krok 2 (później):** zapis koszyka na koncie (`savori_users/{uid}`, `/prywatnosc`).
- **Krok 3 (później, do sprawdzenia):** gotowe profile z oficjalnych indeksów GUS dla grup gospodarstw domowych.
  Przekrój DBW 1698 ma trzeci wymiar `id-pozycja-3` (6902025 = ogółem oraz 630869, 630876, 630877, 630878, 630880,
  630882, 631528). Wrzesień 2026, transport m/m: od 104,1 do 106,4 zależnie od grupy. Nazwy grup trzeba
  potwierdzić w słowniku DBW przed użyciem.

## Problem i wartość dla użytkownika

CPI to średnia dla przeciętnego koszyka. Wrzesień 2026: 4,1% r/r, ale transport +17,9%, a żywność −0,4%.
Ktoś, kto dojeżdża autem i mało wydaje na jedzenie, ma wyraźnie wyższą inflację niż 4,1%. Emeryt
z dużym udziałem żywności i zdrowia ma niższą. Pytanie użytkownika: **„ile wynosi inflacja dla mojego koszyka
i który dział robi różnicę?”**. Odpowiedź ma przyjść w 2 tapnięciach z `/ceny`, na telefonie. Link do wyniku
można wysłać dalej.

Dziś `/ceny` pokazuje wkłady działów na wagach oznaczonych w kodzie jako przybliżone (`weightsApprox: true`).
Część z nich jest wyraźnie zła (D1). Kalkulator na złych wagach nie odtworzyłby CPI, więc naprawa wag wchodzi w ten krok.

## Dane — sprawdzone 02.11.2026

### Wagi GUS 2026 (COICOP 2018)

Źródło: GUS, „Wskaźniki cen towarów i usług konsumpcyjnych we wrześniu 2026 r.”, informacja sygnalna
z 14.10.2026, **Wykres 2 „System wag stosowany w obliczeniach wskaźników cen towarów i usług konsumpcyjnych
w 2026 r., wg klasyfikacji COICOP 2018 (w %)”**. Tę samą tabelę mają wszystkie komunikaty miesięczne 2026.
Po raz pierwszy była w komunikacie za luty, z porównaniem do 2025.

- Strona komunikatu: https://stat.gov.pl/obszary-tematyczne/ceny-handel/wskazniki-cen/wskazniki-cen-towarow-i-uslug-konsumpcyjnych-we-wrzesniu-2026-r-,2,179.html
- Dane do wykresów (xlsx, arkusz „Arkusz1”, wiersze pod „Wykres 2”): https://stat.gov.pl/download/gfx/portalinformacyjny/pl/defaultaktualnosci/5464/2/179/1/wskazniki_cen_towarow_i_uslug_konsumpcyjnych_we_wrzesniu_2026_r_wykresy.xlsx
- PDF, str. 2: https://stat.gov.pl/download/gfx/portalinformacyjny/pl/defaultaktualnosci/5464/2/179/1/wskazniki_cen_towarow_i_uslug_konsumpcyjnych_we_wrzesniu_2026_r.pdf

| Kod | Nazwa GUS | Waga 2026 (%) | Dziś w kodzie (`weight`, przybliżona) |
|---|---|---|---|
| 01 | Żywność i napoje bezalkoholowe | 25,91 | 25,9 |
| 02 | Napoje alkoholowe i wyroby tytoniowe | 4,81 | **6,1** |
| 03 | Odzież i obuwie | 3,75 | **4,2** |
| 04 | Użytkowanie mieszkania lub domu, zaopatrzenie w wodę, energię elektryczną, gaz i inne paliwa | 20,35 | **19,5** |
| 05 | Wyposażenie mieszkania i prowadzenie gospodarstwa domowego | 5,18 | 5,1 |
| 06 | Zdrowie | 6,20 | 6,3 |
| 07 | Transport | 10,18 | **9,8** |
| 08 | Informacja i komunikacja | 5,02 | **5,5** |
| 09 | Rekreacja, sport i kultura | 6,37 | **5,9** |
| 10 | Edukacja | 1,03 | 1,0 |
| 11 | Restauracje i usługi zakwaterowania | 5,55 | **6,4** |
| 12 | Ubezpieczenia i usługi finansowe | 1,24 | 1,3 |
| 13 | Higiena osobista, ochrona socjalna oraz pozostałe towary i usługi | 4,41 | **3,0** |
| | **Suma** | **100,00** (dokładnie) | 100,0 |

**DBW nie ma wag.** Jedno zapytanie (`id-zmienna=305&id-przekroj=1698&id-rok=2026&id-okres=255`) zwraca tylko
miary prezentacji 2 (poprzedni miesiąc = 100), 5 (analogiczny miesiąc roku poprzedniego = 100) i 8 (grudzień
roku poprzedniego = 100). Wagi trzeba więc wpisać w kodzie jako stałą z rokiem i linkiem do źródła. Co rok
w lutym–marcu dochodzi nowa tabela (pozycja P2 w ROADMAP: przejście na 2027).

### Dynamiki działów i CPI — wrzesień 2026 (najnowszy pełny miesiąc)

Październik: 30.10 był tylko szybki szacunek (bez działów). Pełne dane za październik GUS publikuje 13.11.2026 o 10:00.

DBW, przekrój 1698, miara 5, `id-pozycja-3` = 6902025 (ogółem). Wszystkie 13 działów jest na stronie 0
odpowiedzi, więc obcięcie P3 ich nie dotyczy. Liczby są **identyczne** z Tablicą 1 komunikatu z 14.10.2026:

| Kod | r/r (%) | m/m (%) |
|---|---|---|
| 01 | −0,4 | +0,1 |
| 02 | +6,9 | +0,8 |
| 03 | −3,7 | +2,9 |
| 04 | +5,1 | +0,8 |
| 05 | −0,5 | +0,1 |
| 06 | +4,6 | +0,4 |
| 07 | +17,9 | +4,7 |
| 08 | +3,5 | −0,5 |
| 09 | +5,5 | −1,9 |
| 10 | +4,5 | +1,9 |
| 11 | +4,1 | +0,2 |
| 12 | +0,6 | +0,2 |
| 13 | +2,4 | −0,2 |
| **CPI ogółem** | **+4,1** | +0,7 |

Niezależne potwierdzenie 4,1%: finwire.pl („Inflacja wrzesień 2026 — odczyt finalny GUS”), analizy.pl
(„Inflacja w Polsce wrzesień 2026 — drugi odczyt”). Szybki szacunek wynosił 4,0%, GUS skorygował go w górę.

### Test odtworzenia CPI z wag GUS (zrobiony na 8 komunikatach 2026)

`Σ w_i × r/r_i / 100` dla oficjalnych wag i dynamik działów z tablic xlsx komunikatów:

| Miesiąc 2026 | CPI GUS r/r | Σ w·r/r | Różnica (p.p.) |
|---|---|---|---|
| luty | 2,1 | 2,146 | +0,046 |
| marzec | 3,0 | 3,007 | +0,007 |
| kwiecień | 3,2 | 3,208 | +0,008 |
| maj | 3,1 | 3,150 | +0,050 |
| czerwiec | 2,5 | 2,494 | −0,006 |
| lipiec | 3,0 | 2,986 | −0,014 |
| sierpień | 3,4 | 3,356 | −0,044 |
| **wrzesień** | **4,1** | **4,122** | **+0,022** |

Największa różnica to 0,050 p.p. Wejścia mają jedno miejsce po przecinku, więc samo zaokrąglenie dynamik
daje do ±0,05 p.p. Reszta to łańcuchowanie: GUS liczy Laspeyresa z wagami 2026 względem grudnia 2025, a r/r
jest iloczynem dwóch ogniw o różnych wagach. Kontrola tą samą metodą wobec grudnia 2025 (miara 8) daje we wrześniu
Σ w·I = 103,755 przy 103,7 w Tablicy 1.

Wniosek: przybliżenie jest dobre, ale **nie zawsze daje tę samą liczbę po zaokrągleniu**. W maju 3,150 to
„3,2” wobec oficjalnych 3,1. Dlatego wzór niżej kotwiczy wynik w oficjalnym CPI.

Wkłady GUS r/r z tekstu komunikatu wrześniowego to inna metoda (z łańcuchowaniem) i tylko kilka działów.
Transport: GUS 1,78, nasze w·r/r 1,82. Mieszkanie: 1,04 i 1,04. Rekreacja: 0,35 i 0,35. Alkohol i tytoń:
0,34 i 0,33. Zdrowie: 0,29 i 0,29. Odzież: −0,14 i −0,14. Żywność: −0,11 i −0,10. Różnice do 0,04 p.p.,
dlatego na stronie piszemy „wkład (przybliżenie)”, a nie „wpływ wg GUS”.

**Tolerancja w testach: |Σ w·r/r − CPI| ≤ 0,10 p.p.** To 2× największa zaobserwowana różnica. Na stronie
różnica jest pokazana jawnie. Gdy |r| > 0,15 p.p., karta wyniku dostaje linię „W tym miesiącu przybliżenie jest mniej dokładne (reszta X p.p.)” — wynik nadal widać.

### Wzór (decyzja)

- `w_i` = waga GUS 2026 (%), `u_i` = udział użytkownika po normalizacji (Σ u = 100),
  `y_i` = r/r działu (%), `CPI` = oficjalne r/r ogółem **za ten sam miesiąc**.
- Reszta metody: `r = CPI − Σ w_i·y_i/100` (wrzesień: 4,1 − 4,122 = **−0,02 p.p.**).
- **Twoja inflacja = Σ u_i·y_i/100 + r.**
- Wkład działu: `c_i = u_i·y_i/100` (p.p.). Wkłady plus `r` dają dokładnie wynik.
- Różnica względem CPI = `Σ (u_i − w_i)·y_i/100`. Dział z największym |(u_i − w_i)·y_i| wyjaśnia różnicę w zdaniu.

Dlaczego kotwica, a nie gołe Σ u·y: przy wagach GUS wynik ma być **równy oficjalnemu CPI** (4,1, nie 4,12).
Inaczej w maju strona pokazałaby „Twoja inflacja 3,2% vs CPI 3,1%” dla koszyka identycznego z GUS, a to
wygląda na błąd. Kotwica przesuwa każdy koszyk o tę samą małą resztę (≤0,05 p.p. w 2026). Różnica między
koszykami — jedyna rzecz, o którą pyta użytkownik — zostaje dokładnie Σ (u−w)·y. Resztę `r` podajemy
na stronie liczbą.

Miesiąc: najnowszy miesiąc, w którym **wszystkie 13** działów mają r/r **i** `headline` ma r/r za ten sam
`YYYY-MM`. Jeśli takiego nie ma, wynik to „—” z komunikatem „brak pełnych danych działów”. Nigdy nie
mieszamy miesięcy (działy z 1698 i nagłówek z 1722 to osobne przekroje DBW).

### Cache, trasa, świeżość, cron

- **Zero nowych wywołań DBW i zero nowych kluczy cache.** Strona czyta istniejący wpis `dbw/gus_cpi_full_{rok}_v5`
  (ten sam, co `/ceny` i Przegląd). Odświeża go cron `dbw-1` (09:40 UTC, `?refresh=1`).
- Strona to komponent serwerowy z ISR (`revalidate = 1800`): `peekServerCache('dbw', 'gus_cpi_full_{rok}_v5')`,
  najpierw bieżący rok warszawski, potem poprzedni (jak `plCpi()` w `src/app/start/page.tsx`). Nigdy fetch DBW
  w renderze. Bez Firestore (demo, dev) i przy pustym cache: komponent kliencki bierze `useCpiFull()`
  (ta sama trasa i ten sam klucz co `/ceny`, bez nowych kluczy).
- **Wagi poza cache.** Nowy moduł `src/lib/cpi-weights.ts`: `CPI_WEIGHTS_2026` (13 × `{ code, name, weight }`),
  rok, URL źródła. Trasa `gus-cpi-full` nadpisuje `weight` i `contribution` w odpowiedzi **po** `withCache`
  i ustawia `weightsApprox: false`. Dzięki temu poprawka działa od razu, bez podbijania klucza `v5`
  (podbicie = ~72 wywołania DBW przy pierwszym odczycie). Strona kalkulatora też bierze wagi z tego modułu,
  nie z payloadu.
- **Świeżość: nowy `DatasetSpec` `cpi-divisions`, nie tylko dziedziczenie z `cpi`.** `cpi` sprawdza wyłącznie
  `headline` (przekrój 1722). Działy idą z innego przekroju (1698), a ostatni miesiąc działów to `dataDate`.
  Gdyby 1698 się spóźnił albo urwał (P3), `cpi` byłoby `ok`, a kalkulator i wkłady na `/ceny` stałyby na
  starym miesiącu bez żadnego sygnału. Ten sam wzorzec co `jp-cpi` i `jp-cpi-breakdown` na jednej trasie.
  Kosztuje zero wywołań GUS: kontrola czyta naszą trasę z cache (`selfHeal: false`), a `freshness-check`
  grupuje cele po endpoincie, więc to nadal jedno zapytanie.
  - `id: 'cpi-divisions'`, etykieta „Inflacja CPI — działy (wkłady, Twoja inflacja)”, `kind: 'gus-dbw'`,
    `group: 'gus'`, `endpoint: () => cpiFullPath()`, `expected` jak `cpi` (`cpiPreliminaryDate`),
    `tolerance: MONTHLY`, `maxAgeDays: 100`, `selfHeal: false`.
  - Ekstraktor: najnowszy miesiąc, w którym `divisions[].history` ma r/r dla wszystkich 13 kodów (nie samo
    `dataDate`, które wystarczy, gdy ma go jeden dział).
- **Nowy cron:** brak. **CSP:** bez zmian (żadnego nowego originu w przeglądarce; schowek i `navigator.share` to API przeglądarki).
- **Dane użytkownika:** żadnych. Stan żyje tylko w adresie. Brak `localStorage`, brak zapisu na serwerze.
  `/prywatnosc` bez zmian. `Referrer-Policy: strict-origin-when-cross-origin` nie wysyła zapytania z `?w=` do obcych stron.
- **Podpis źródła (dosłownie, widoczny przy wyniku):** „Źródło: GUS — wskaźniki cen towarów i usług
  konsumpcyjnych (DBW), dane za {miesiąc rok}; wagi: GUS, system wag 2026 (COICOP 2018). Obliczenia: Savori.”

## Co widzi użytkownik

Adres: `/ceny/twoja-inflacja`. Zakładka „Ceny” jest aktywna (`isActive` łapie `/ceny/…`), więc nie dodajemy nowej pozycji nawigacji.
Wejścia: karta-link w zakładce „Inflacja CPI” na `/ceny` (przy „Kontrybucje do inflacji”) z tekstem
„Policz swoją inflację — ustaw udziały wydatków w 13 działach” oraz wpis w `CommandPalette`
(„Twoja inflacja”, słowa kluczowe: kalkulator, koszyk, moja inflacja, osobista).

### Telefon 320–430 px (kolejność od góry)

1. **Nagłówek strony:** „Twoja inflacja”, link wstecz „← Ceny” (`/ceny?tab=inflacja`). Pod spodem jedna linia:
   „Dane za wrzesień 2026 · GUS”.
2. **Karta wyniku (najważniejsza):**
   - duża liczba „Twoja inflacja **5,1%**” i obok, mniejsza, „CPI GUS **4,1%**” (r/r, wrzesień 2026);
   - **zdanie-wniosek**, na przykład „O 1,0 p.p. wyżej niż CPI — głównie przez większy udział transportu
     (+17,9% r/r): +1,5 p.p.” (koszyk z kryterium 4). Przy |różnicy| < 0,05: „Tyle samo co CPI.” Przy wagach GUS: „To wagi koszyka GUS —
     wynik równy CPI. Zmień udziały poniżej.”;
   - przyciski „Wagi GUS” (reset; wyłączony, gdy już są wagi GUS) i „Kopiuj link”;
   - podpis źródła (wyżej) małą czcionką.
   - Gdy karta wyjedzie poza ekran, pod nagłówkiem 56 px przykleja się **pasek** „Twoja 5,1% · CPI 4,1%”
     (`sticky top-14` poniżej `lg`). Wynik widać przy przesuwaniu suwaków. Nic `fixed bottom-*`: dół ekranu należy do paska zakładek.
3. **„Twoje wydatki”** — 13 wierszy w **stałej kolejności COICOP 01–13**. Nie sortujemy przy przeciąganiu,
   bo wiersz uciekałby spod palca. Wiersz ma dwie linie:
   - linia 1: nazwa działu (skrócona, pełna w `title`/`aria-label`), r/r działu („+17,9% r/r”) w kolorze znaku;
   - linia 2: suwak 0–100 (krok 0,5) na całą szerokość i pole liczbowe „%” (szer. ~4,5 rem, `inputmode="decimal"`,
     przecinek i kropka, 0–100, do 2 miejsc, `.mk-input` = 16 px poniżej `lg`). Obszar dotyku suwaka i pola ≥ 44 px.
   - pod wierszem drobno: „waga GUS 10,18%”, gdy udział różni się od wagi GUS.
   - **Zasada normalizacji:** suwaki są niezależne. Wpisujesz, ile wydajesz w danym dziale (w % albo w złotych,
     liczy się tylko proporcja). Wynik liczymy z udziałów przeskalowanych do 100%. Nad listą stoi linia sumy:
     „Suma: 100%” albo „Suma: 112% — przeliczamy proporcjonalnie do 100%”. Przy sumie 0: „Ustaw co najmniej
     jeden udział”, wynik „—”.
   - Podpowiedź nad listą (jedno zdanie): „Udział = część Twoich miesięcznych wydatków na konsumpcję (bez
     oszczędności, rat kapitału i podatków).”
4. **„Co napędza Twoją inflację”** — wkład każdego działu w p.p., posortowany malejąco (dodatnie u góry,
   ujemne na dole). Poziomy słupek od zera, liczba „+1,82 p.p.” z dwoma miejscami. Domyślnie 5 pierwszych
   i „Pokaż wszystkie 13”. Ostatni wiersz: „Reszta metody −0,02 p.p.” (szary, z odnośnikiem do „Jak to liczymy”).
5. **„Jak to liczymy”** (zwinięte): wzór słowami; że to **przybliżenie — ważona średnia r/r działów** (GUS liczy
   indeks łańcuchowo, wagi 2026 względem grudnia 2025); tabela reszty z tego miesiąca („wagi GUS × r/r działów =
   4,12%, GUS podaje 4,1%; różnicę −0,02 p.p. dodajemy do każdego koszyka, żeby przy wagach GUS wynik był
   równy CPI”); **ograniczenie:** w środku działu struktura jest GUS-owska (np. „Transport” to średni koszyk
   paliwa, aut i biletów — kto jeździ tylko pociągiem, ma inną inflację niż +17,9%). Do tego link do komunikatu GUS
   i do tabeli wag.

### Desktop 1280–1440 px

Dwie kolumny w kontenerze strony. Lewa (7/12): „Twoje wydatki”, 13 wierszy w jednej linii (nazwa | r/r | suwak |
pole). Prawa (5/12), `lg:sticky lg:top-[var(--mk-sticky-top)]`: karta wyniku, a pod nią „Co napędza Twoją
inflację” (wszystkie 13, bez zwijania). „Jak to liczymy” na całą szerokość pod spodem. Przyklejony pasek z telefonu
od `lg` się nie pokazuje.

### Stan w adresie

- Parametr `w`: **13 liczb całkowitych oddzielonych przecinkami**, kolejność kodów 01…13, jednostka = **setne
  części procenta wartości z suwaka** (0–10000), np. `?w=3000,200,375,2500,518,620,2000,502,300,0,300,124,441`.
  Setne, bo dopiero wtedy wagi GUS (25,91…) są dokładne. Przy naszych 13 działach to najwyżej 77 znaków.
- Zapisujemy surowe wartości suwaków, a nie wartości po normalizacji. Link odtwarza dokładnie to, co widział nadawca.
- Wagi GUS = **brak** parametru `w` (czysty adres). Reset usuwa `w`.
- **Walidacja (całość albo nic):** dokładnie 13 tokenów; każdy pasuje do `^\d{1,5}$` i jest ≤ 10000; suma > 0;
  `w` występuje raz. Cokolwiek innego oznacza, że cały parametr jest ignorowany: strona pokazuje wagi GUS
  i jedną linię „Link był niepełny — pokazujemy wagi GUS”. Bez wyjątku i bez częściowego koszyka. Inne parametry
  są ignorowane.
- Zmiana suwaka aktualizuje adres przez `history.replaceState` (debounce ~300 ms, bez wpisu w historii,
  bez przewinięcia, bez nawigacji routera).
- Odczyt `?w=` dopiero po hydratacji (`useEffect`/`useIsClient`). HTML z serwera zawsze ma wagi GUS i CPI,
  więc nie ma #418, a liczby są w HTML.
- „Kopiuj link”: `navigator.clipboard.writeText(location.href)`, potwierdzenie „Skopiowano link” (`aria-live`).
  Gdy schowek niedostępny: pole tylko do odczytu z zaznaczonym adresem.
- Bramka: `/ceny/twoja-inflacja?w=…` bez sesji prowadzi na `/start?from=%2Fceny%2Ftwoja-inflacja%3Fw%3D…`
  (`gate` zachowuje `search`). Po zalogowaniu odbiorca wraca na ten sam koszyk.

## Zmiany w istniejących miejscach (część kroku)

- **D1 — przybliżone wagi na produkcji (błąd poprawności).** `DIVISIONS[].weight` w `src/app/api/gus-cpi-full/route.ts`
  odbiega od GUS o 0,4–1,4 p.p. w 8 z 13 działów (tabela wyżej). Na `/ceny` przekłada się to na wkłady
  (np. alkohol i tytoń: 0,42 p.p. wobec 0,33 na wagach GUS), na „inflację bez żywności” (`InflacjaFull.tsx`, ważona
  średnia) i na „waga X% koszyka” w szczegółach działu. Wszystko ma brać wagi z `CPI_WEIGHTS_2026`, a `weightsApprox`
  ma być `false`. Wagi pokazujemy z dwoma miejscami („waga 10,18%”), bo tak publikuje GUS.
- „Wkłady w czasie” na `/ceny` stosują wagi 2026 do lat 2016–2025 (COICOP 1999). Podpis już mówi o przybliżeniu,
  zostaje bez zmian.

## Lekcje zastosowane (`docs/PRODUCT.md`)

- [x] Liczba = liczba z komunikatu: 13 r/r z DBW = Tablica 1 komunikatu z 14.10; CPI 4,1 potwierdzone niezależnie; wagi z Wykresu 2.
- [x] Właściwa metodologia: COICOP 2018 (od 2026), wagi 2026; przybliżenie nazwane na stronie, reszta podana liczbą.
- [x] Kalendarz: bez nowego — CPI pełne wg `cpiPreliminaryDate` (13.11.2026 10:00 Warszawa za październik).
- [x] Upstream `no-store` / cron `refresh=1` / dziennik cronów: bez zmian, to istniejący wpis `gus-cpi-full`, cron `dbw-1`.
- [x] Crony przez `internal-fetch`: nie dotyczy (brak nowego crona).
- [x] `refresh=1` z limitem: strona nie ma przycisku „Aktualizuj” i nie woła trasy z `refresh=1`.
- [x] Publiczna trasa GUS tylko ze znanymi parametrami: brak nowej trasy i brak nowych parametrów dla GUS. `?w=` czyta wyłącznie przeglądarka.
- [x] `maxDuration`: bez zmian.
- [x] Kontrola świeżości: nowy `cpi-divisions` (uzasadnienie wyżej).
- [x] Nic z „dziś” przed hydratacją: `?w=` po hydratacji; rok cache ustala serwer.
- [x] 320/390/1440 bez przewijania w bok (kryteria 12–13).
- [x] CSP: brak nowych originów.
- [x] Dane użytkownika: nie przechowujemy żadnych (tylko adres). Zapis na koncie to krok 2, z całą listą z PRODUCT.md.

## Kryteria akceptacji

Testy (vitest, nowe pliki: `tests/cpi-weights.test.ts`, `tests/twoja-inflacja.test.ts`; fixture
`tests/fixtures/gus-cpi-divisions-2026.json` z r/r 13 działów i CPI za luty–wrzesień 2026 przepisanymi
z tablic xlsx komunikatów GUS, z URL-ami źródeł w polu `source`):

1. `CPI_WEIGHTS_2026` ma dokładnie 13 pozycji, kody `01`…`13` w kolejności, wartości z tabeli wyżej
   (25.91, 4.81, 3.75, 20.35, 5.18, 6.2, 10.18, 5.02, 6.37, 1.03, 5.55, 1.24, 4.41), a suma = 100 ± 0,005.
2. Odtworzenie CPI: dla każdego z 8 miesięcy fixture'a |Σ w·r/r/100 − CPI| ≤ 0,10 p.p. Dla września
   Σ = 4,122 (±0,001), reszta `r` = −0,022 (±0,001).
3. Kotwica: funkcja wyniku przy wagach GUS zwraca dokładnie CPI (różnica < 1e-9) dla każdego miesiąca fixture'a.
4. Przykład koszyka (wrzesień): `?w=3000,200,375,2500,518,620,2000,502,300,0,300,124,441` (suma 10880) daje
   wynik 5,098 (±0,001; `Σ u·y/100 + r`, r = −0,0221), czyli „5,1%” i +1,0 p.p. wobec CPI. Suma wkładów + `r` = wynik (< 1e-9). Kolejność
   wkładów jest malejąca. Zdanie-wniosek wskazuje dział z największym |(u−w)·y|: transport, +1,47 p.p.
5. URL round-trip: `decode(encode(x))` = `x` dla losowych 13-elementowych wektorów na siatce 0,01 (≥200 przypadków).
   `encode(wagi GUS)` = brak parametru, `decode(brak)` = wagi GUS.
6. Odrzucanie śmieci — każde z tych daje „ignoruj, wagi GUS”: 12 i 14 tokenów, `-1`, `10001`, `1.5`, `abc`,
   pusty token (`1,,2…`), same zera, `w` podane dwa razy, 2000 znaków. Żadne nie rzuca wyjątku.
7. `cpi-divisions` w `FRESHNESS_DATASETS`, endpoint === `cpiFullPath()`. Test w `tests/freshness.test.ts`:
   ekstraktor zwraca miesiąc, w którym jest 13/13 działów. Gdy ostatni miesiąc ma 12/13, zwraca poprzedni.
8. Trasa `gus-cpi-full` w odpowiedzi ma `weightsApprox: false` i `weight` z `CPI_WEIGHTS_2026` (test na funkcji
   nakładającej wagi, bez wywołań sieci).
9. `tsc --noEmit`, `npm test`, eslint zmienionych plików, `npm run build` — czysto.

Strona (Playwright na `next start`, tryb demo; zrzuty 320, 390, 1440 px do recenzji):

10. `/ceny/twoja-inflacja` bez `w`: wynik = CPI za ten sam miesiąc co działy (dziś 4,1% i 4,1%, „Dane za wrzesień 2026”).
    Podpis źródła z tekstem z sekcji „Dane” jest widoczny przy wyniku.
11. Z `?w=` z kryterium 4: liczba w karcie = wynik testu 4 po zaokrągleniu do 0,1. Po przeładowaniu jest ten sam stan.
    „Wagi GUS” przywraca CPI i usuwa `w` z adresu. „Kopiuj link” kopiuje bieżący adres (sprawdzone przez `clipboard.readText` w Playwright z uprawnieniem).
12. 320, 390, 1440 px: `document.documentElement.scrollWidth <= innerWidth` (0 przewijania w bok), także po
    rozwinięciu „Pokaż wszystkie 13” i „Jak to liczymy”.
13. Przy 390 px każdy suwak i każde pole udziału ma `getBoundingClientRect().height >= 44`, a przyciski „Wagi GUS”
    i „Kopiuj link” też ≥ 44 px. Suwak ma `aria-label` z pełną nazwą działu i `aria-valuetext` w procentach.
14. 0 błędów konsoli, 0 #418, 0 `securitypolicyviolation` przy wejściu bez `w`, z poprawnym `w` i ze śmieciowym `w`.
    Przy śmieciowym `w` widać linię „Link był niepełny — pokazujemy wagi GUS”.
15. Przy 390 px po przewinięciu do działu 13 przyklejony pasek „Twoja … · CPI …” jest widoczny pod nagłówkiem
    i niczego nie zasłania paska zakładek.
16. Nawigacja: na `/ceny/twoja-inflacja` aktywna jest zakładka „Ceny” (dolny pasek i nagłówek). Karta-link jest
    w zakładce „Inflacja CPI” na `/ceny`. `CommandPalette` znajduje „Twoja inflacja” po słowie „koszyk”.
17. `/ceny` (zakładka Inflacja CPI): szczegóły działu 07 pokazują „waga 10,18%”, a wkład transportu = 1,82 p.p.
    (10,18 × 17,9 / 100), nie 1,75 (stare 9,8).
18. HTML z serwera (`curl` strony z cookie sesji na produkcji albo `next start` z cache) zawiera liczbę CPI i miesiąc
    przed wykonaniem JS. W demo bez Firestore strona pokazuje szkielet, a dane dociąga `useCpiFull()`.

Po wdrożeniu (produkcja, PM sprawdza):

19. `/api/health/freshness`: `cpi` i `cpi-divisions` = `ok` z okresem 2026-09. Po 13.11.2026 (P0) oba mają 2026-10
    tego samego dnia. Wtedy wynik przy wagach GUS = CPI październikowe z komunikatu.
20. Link z `?w=` otwarty bez sesji → `/start?from=…` → po zalogowaniu ten sam koszyk.

## Poza zakresem

- Zapis koszyka na koncie (krok 2) i gotowe profile gospodarstw domowych (krok 3, `id-pozycja-3`).
- Udziały na poziomie klas COICOP (142 pozycje). Historia „Twojej inflacji” w czasie. Miesiąc inny niż najnowszy.
- Kalkulator dla Japonii (spójność krajów: e-Stat ma wagi 10 grup w tabeli 5, `JpContributions`. Kandydat
  na osobną pozycję, gdy krok 1 PL się sprawdzi).
- Obraz OG z wynikiem (`next/og`) dla udostępnionego linku — należy do pozycji 9 (SEO).

## Wymaga właściciela

Nic do kroku 1. Na przełomie lutego i marca 2027 (komunikat za styczeń 2027) GUS opublikuje wagi 2027.
`CPI_WEIGHTS_2026` trzeba wtedy uzupełnić o rok 2027. Robi to kod, w ramach P2, nie właściciel.
