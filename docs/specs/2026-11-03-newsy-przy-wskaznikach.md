# Newsy przy wskaźnikach — trafne dopasowanie i jedna karta (ROADMAP N4, krok 1)

Status: wdrożone 03.11.2026 (PR na gałęzi) · gałąź `claude/newsy-przy-wskaznikach` · właściciel 03.11.2026: „mocno skup się na newsach”.

## Problem i wartość

Czytelnik `/ceny`, `/rynki`, `/praca`, `/gospodarka` pyta: „co się dziś dzieje wokół tej liczby?”. Pas newsów
przy wykresie ma na to odpowiadać. Pomiar 03.11 (~06:30 UTC, prawdziwy `/api/news`: 150 pozycji, w tym 121 PL)
pokazuje, że dziś odpowiada źle:
- **ceny**: 7 trafień, w tym 2 fałszywe („Rodziny mogą stracić na zmianach w 800 plus”, „Kiepas: w polskiej
  gospodarce panuje optymizm”). Pomija paliwa, prąd i gaz, czyli to, co ludzie płacą najczęściej.
- **rynki**: 21 trafień, w tym 3 fałszywe (kredyty firm, dwa newsy o wyborach w USA). 4 kursy Money.pl
  („Ile kosztuje euro/frank/dolar/funt?”) zajmują 4 z 5 miejsc.
- **praca**: 10 trafień, w tym 3 fałszywe (Ryanair, transport drogowy, ropa). Za każdym razem trafienie dało
  jedno słowo w opisie.
- **gospodarka**: 7 trafień, w tym 2 fałszywe. Pomija obwieszczenie GUS o PKB na mieszkańca.

Do tego Kalendarium na tych stronach dubluje dane ze strony (godziny HH:MM, czerwone wpisy GUS). Wiersz nie
mówi też, dlaczego news stoi przy tym wskaźniku.

## Co widzi użytkownik

**Telefon (320–430 px).** Jedna karta „Newsy — <temat>” (np. „Newsy — ceny i inflacja”) w miejscu obecnego pasa,
pod wykresem. Pokazuje maksymalnie 3 wiersze i przycisk „Więcej (N)” (≥44 px), który rozwija listę do limitu
strony (5). Wiersz wygląda jak w `DailyDigestCard` / `NewsRow` z #79:
- neutralny tag podtematu (`NewsTag`), np. PALIWA, i źródło;
- tytuł z `ExternalMark`;
- `Corroboration` z poprawną odmianą (`relationsLabel`);
- data względna dopiero po hydratacji (`useIsClient`), przed nią data bezwzględna albo nic.

Cały wiersz jest linkiem o wysokości ≥44 px. Karta nie ma osi Kalendarium.

**Desktop (1280/1440 px).** Ta sama karta w kolumnie bocznej (`variant="rail"`, jak dziś), z limitem strony
i bez przycisku „Więcej”.

**Tag podtematu** pochodzi z grupy fraz, która dała trafienie:
- ceny: INFLACJA, PALIWA, ENERGIA;
- rynki: STOPY, ZŁOTY, GPW;
- praca: PŁACE, BEZROBOCIE;
- gospodarka: PKB, FINANSE PUBLICZNE;
- ewentualnie inne, każdy z co najmniej jedną frazą.

Tag mówi, dlaczego news tu stoi. Jest szary, nie czerwony (`mk-tag-brand*` w karcie = 0).

**Stan pusty: karta znika** (`null`), bez pustej ramki z napisem „brak newsów”. Powód: przy precyzji ponad
zasięgiem pusty temat to normalny poranek. Pusta ramka obok wykresu wygląda jak awaria i zostawia dziurę
w siatce (lekcja z `variant="rail"`). Tak samo działa dziś `DailyDigestCard`.

**Przegląd.** Chipy „Powiązane wskaźniki” przy leadzie (`RelatedIndicators` w `LatestNews variant=overview`)
liczą tematy tą samą funkcją co karty. News nie dostaje chipu tematu, przy którym karta by go nie pokazała.

## Reguły dopasowania (`src/lib/news/match.ts`)

1. **Opis liczy się tylko przy ≥2 różnych frazach jednoznacznych** tego samego tematu. Jedna fraza w opisie to
   wzmianka. Jedna fraza `strong` w tytule wystarcza jak dziś. Fraza `titleOnly` działa tylko w tytule.
2. **Nowe frazy** (bez diakrytyków, prefiks albo całe słowo, każda sprawdzona na fixture):
   - ceny: paliw*, ceny paliw, prąd*/energii elektrycznej, gaz (całe słowo + „taryf* za gaz”), rachunk* za, CPN;
   - praca: nadgodzin*, rąk do pracy, pracujący w gospodarce;
   - gospodarka: produktu krajowego (obok „produkt krajowy”), „polskiej gospodarki”/„polskiej gospodarce”
     (tylko tytuł);
   - rynki: rynki finansowe, polskich aktywów.

   „Kiepas: w polskiej gospodarce panuje optymizm” to opinia ogólna. Jeśli ta fraza wpuści go do cen, fraza
   zostaje tylko w gospodarce.
3. **Weto zagraniczne dla rynków.** Gdy w tytule jest marker zagraniczny (USA, S&P, Wall Street, Nasdaq, Dow,
   Fed bez NBP) i nie ma polskiej kotwicy (GPW, WIG*, złot*, NBP, RPP), dopasowanie słabe (`titleOnly`) jest
   odrzucane.
4. **Tylko polskie pozycje** (`lang === 'pl'`) na stronach PL i w chipach Przeglądu.
5. **Serie dzienne zwijane do jednej pozycji** (najnowszej): Money.pl „Ile kosztuje … Kurs … do złotego” oraz
   „Nowe ceny paliw na <dzień>”. Rozpoznanie po stałym wzorcu tytułu, niezależnie od `clusterId`.
6. **Ranking** w kolejności:
   - tytuł z frazą jednoznaczną;
   - tytuł z frazą słabą;
   - opis (≥2 frazy);
   - w obrębie poziomu: `importance`, potem data.
7. **Zwracany jest powód**: `matchNews` / `matchesTopic` zwraca podtemat, z którego wynika tag. Jedna funkcja
   służy kartom i chipom Przeglądu.

`matchTier="strong"` i `excludeOpinion` na `/praca` zostają.

## Dane

To nie jest nowy zbiór. Źródło to nadal `/api/news` (RSS, istniejąca świeżość `news` / `news-brief`). Bez nowego
crona, klucza cache i wpisu CSP, bo przeglądarka nie łączy się z niczym nowym. Fixture
`tests/fixtures/news-topics-2026-11-03.json`:
- 150 pozycji z ręcznymi etykietami;
- `expected` = musi pasować, `ok` = dopuszczalne, brak tematu = zakazane;
- liczba etykiet `expected` w tematach: rynki 14, ceny 8, praca 8, gospodarka 3.

## Lekcje zastosowane

- [x] Nic zależnego od „dziś” przed hydratacją: data względna, „dziś/wczoraj” po `useIsClient`.
- [x] 320/390/1440 bez przewijania w bok.
- [x] Nowe źródło w przeglądarce → CSP: nie dotyczy, brak nowego źródła.
- Liczby ze źródła, kalendarz, crony, świeżość: nie dotyczy, bo krok nie dodaje danych liczbowych.

## Kryteria akceptacji

1. Nowy `tests/news-topics.test.ts` na fixture liczy `matchesTopic` (przed zwijaniem i limitem), tylko PL.
   Precyzja (trafienia w `expected ∪ ok` / wszystkie trafienia) wynosi ≥95% dla każdego tematu. Przy obecnych
   liczbach dla cen i gospodarki oznacza to 0 fałszywych.
2. W tym samym teście recall na `expected` wynosi ≥90% dla każdego tematu. Przy 8 i 3 etykietach oznacza to
   komplet dla cen, pracy i gospodarki.
3. Lista kontrolna, 0 trafień w podanym temacie:
   - ceny: „Rodziny mogą stracić na zmianach w 800 plus”, „Kiepas: w polskiej gospodarce panuje optymizm”;
   - rynki: „Firmy znów ruszyły po kredyty” oraz oba newsy o wyborach w USA / S&P 500;
   - praca: „Droższe paliwo zmienia plany Ryanaira”, „Transport drogowy w Polsce”, „Kiepas: Ceny ropy wciąż
     postrachem inwestorów”;
   - gospodarka: „Polska spółka z branży stalowej wypracowała zysk”, „Polacy rozgościli się na hiszpańskim
     rynku nieruchomości”.
4. Lista kontrolna trafień:
   - ceny: oba newsy o cenach paliw, rachunki za gaz, oba newsy o prądzie;
   - praca: nadgodziny, „Pracujący w gospodarce narodowej…”, „Norwegia szuka rąk do pracy”;
   - gospodarka: obwieszczenie o PKB;
   - rynki: „Rynki nie spanikowały, ale Polska płaci”.
5. `matchNews(fixture, 'rynki', 5)` zawiera dokładnie 1 pozycję „Ile kosztuje … Kurs”.
   `matchNews(fixture, 'ceny', 5)` zawiera najwyżej 1 pozycję „Nowe ceny paliw na …”.
6. Każda pozycja zwrócona przez `matchNews` ma niepusty podtemat. Test sprawdza też odwzorowanie podtemat → etykieta.
7. Pozycje `lang !== 'pl'` nigdy nie są zwracane (test).
8. Chipy Przeglądu i karty używają tej samej funkcji. Test: dla każdej pozycji fixture zbiór tematów chipów =
   {t : `matchesTopic(item, t)`}.
9. `CategoryNewsPanel` / `RelatedNews` nie renderują Kalendarium (komponent `Kalendarium` bez użyć w `src`
   albo usunięty). Na zrzutach `/ceny`, `/ceny/ppi`, `/rynki`, `/praca`, `/gospodarka`, `/regiony` nie ma osi
   z godzinami HH:MM.
10. Przy 390 px karta ma ≤3 wiersze i przycisk „Więcej”. Po kliknięciu jest ≤ limit. Każdy wiersz-link ma
    wysokość ≥44 px (Playwright `boundingBox`).
11. Gdy temat nie ma trafień (np. `/api/news` zwraca pusto), karty nie ma w DOM. Nie ma ramki ani nagłówka.
12. W karcie `mk-tag-brand*` = 0. Etykieta relacji dla 5 brzmi „5 niezależnych relacji”.
13. Przy 320, 390 i 1440 px `/ceny`, `/rynki`, `/praca`, `/gospodarka` i `/` mają `scrollWidth ≤ innerWidth`.
    Konsola ma 0 błędów, w tym #418, i 0 naruszeń CSP (`next start`).
14. W raporcie są zrzuty 390 i 1440 px przed i po dla `/ceny` i `/rynki`.
15. `npx tsc --noEmit`, `npm test` i `npm run build` przechodzą czysto. `eslint` zmienionych plików nie daje
    nowych błędów.

## Ryzyko i utrzymanie

Feed zmienia się codziennie. Fixture jest zamrożony, więc zielony test nie gwarantuje trafności jutro. Procedura
przy zgłoszonym chybieniu (od właściciela, z recenzji albo z zrzutu):
- dopisać pozycję do fixture z etykietą (`expected` / `ok` / zakazane) albo dodać nowy plik
  `news-topics-RRRR-MM-DD.json` (test czyta wszystkie);
- poprawić frazę;
- sprawdzić, że kryteria 1–4 dalej przechodzą na wszystkich plikach.

Fraza nie trafia do `strong` bez sprawdzenia na fixture. Co miesiąc PM robi świeży pomiar i dopisuje fixture
(pozycja w ROADMAP).

## Poza zakresem

- `/podsumowanie` i `corroborationLabel` w wejściu briefu (ROADMAP 4d, osobno, z testem walidatora).
- Japonia (newsy JP to osobny krok).
- Model językowy do klasyfikacji.
- Zmiany `/newsy`.

## Działania właściciela

Brak.
