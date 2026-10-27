# Savori — produkt

Dokument właściciela produktu (agent `product-manager`, `.claude/agents/product-manager.md`).
Każda zmiana w serwisie musi się dać obronić tym dokumentem. Backlog: `docs/ROADMAP.md`,
specyfikacje kroków: `docs/specs/`.

## Wizja

Najszybsze i najbardziej wiarygodne miejsce, w którym Polak sprawdza, co się dzieje w gospodarce —
najpierw w Polsce, potem w kolejnych krajach (zaczynając od Japonii). Nie „tabelka z GUS”, tylko
odpowiedź na pytanie „co się zmieniło i co to znaczy” — w dniu publikacji, na telefonie, w ≤2 tapnięciach.

## Dla kogo

- Osoby śledzące gospodarkę i rynki (inwestorzy indywidualni, analitycy, dziennikarze, studenci).
- Sprawdzają z telefonu, krótko, często w dniu publikacji danych.
- Chcą liczby, kontekstu (cel banku centralnego, poprzedni odczyt, historia) i pewności, że liczba
  jest oficjalna i aktualna.

## Zasady (w tej kolejności)

1. **Poprawność.** Na stronie jest liczba z komunikatu urzędu statystycznego — ta sama miara, ta sama
   metodologia/baza, to samo zaokrąglenie. Seria jest walidowana po nazwie u źródła; zła seria = błąd,
   nie cudze liczby.
2. **Świeżość.** Nowy odczyt jest na stronie w dniu publikacji. Każdy zbiór ma kalendarz publikacji
   (z godziną i strefą czasową), cron z wpisem w dzienniku i pozycję w kontroli świeżości.
3. **Czytelność.** Najpierw wniosek („inflacja powyżej celu”), potem liczba, potem kontekst i wykres.
   Każda liczba ma okres („dane za wrzesień 2026”) i źródło.
4. **Telefon pierwszy.** 320–430 px bez przewijania w bok, cele dotyku ≥44 px, dolny pasek nawigacji.
5. **Uczciwość.** Opóźnienia źródła, odczyty wstępne i zmiany metodologii są nazwane wprost.
6. **Spójność między krajami.** Ten sam typ ekranu wygląda i działa tak samo w Polsce i w Japonii;
   kraj wynika z adresu (`/japonia/...`).

## Architektura informacji

| Sekcja | Polska | Japonia (stan / plan) |
|---|---|---|
| Przegląd (hero z najważniejszą zmianą dnia) | `/` | `/japonia` |
| Ceny / inflacja + rozbicie | `/ceny` | `/japonia/inflacja` |
| Gospodarka (PKB, produkcja, sprzedaż) | `/gospodarka` | `/japonia/gospodarka` (produkcja, sprzedaż, PKB) |
| Rynek pracy | `/praca` | `/japonia/praca` (bezrobocie i płace) |
| Rynki (kursy, stopy, obligacje) | `/rynki` | `/japonia/rynki` (stopa BOJ, call, USD/JPY, JGB 10Y) |
| Stan danych | `/status` | wspólna (grupa „Japonia”) |

## Wzorzec wskaźnika kraju (każdy nowy wskaźnik przechodzi te kroki)

1. **Konfiguracja serii w jednym pliku** (np. `src/lib/jp/cpi.ts`): kody, nazwy, walidacja `mustInclude`.
2. **Pobranie + cache po stronie serwera** (`*-server.ts`): `no-store`, `withCache`, `refresh=1` najwyżej co 10 min.
3. **Kalendarz publikacji** z godziną i strefą czasową; wiek odczytu liczony od publikacji, z którą
   liczba trafia na stronę.
4. **Kontrola świeżości** (`FRESHNESS_DATASETS`) i **cron** z wpisem w `CRON_SPECS`.
5. **Strona**: liczby w HTML z serwera (ISR z cache, nigdy fetch źródła w renderze), wszystko zależne
   od „dziś” po hydratacji, wymagane dopiski źródła.
6. **Testy** na utrwalonych odpowiedziach źródła (`tests/fixtures/`).

## Lekcje z Polski — lista kontrolna do każdej specyfikacji

- [ ] Liczba = liczba z komunikatu (sprawdzona z niezależnym źródłem). *(sprzedaż detaliczna z BDL była
      w cenach bieżących i spóźniona o tygodnie; zmienna DBW 312 udawała produkcję)*
- [ ] Właściwa metodologia/baza (*ECOICOP 2 w HICP, baza 2025 w Japonii*).
- [ ] Kalendarz publikacji z godziną i strefą czasową; wiek od publikacji widocznej liczby (*CPI flash*).
- [ ] Upstream `no-store`; cron z `refresh=1`; dziennik cronów (*Data Cache Next.js zamrażał dane*).
- [ ] Crony wołają `SITE_URL` przez `internal-fetch` (*adres wdrożenia był za logowaniem Vercela*).
- [ ] `refresh=1` z limitem (*publiczne odświeżanie mogło wyczerpać limit GUS*).
- [ ] Publiczna trasa do źródła z limitem przyjmuje tylko znane parametry (rok, seria z listy). Zły parametr
      daje 400 bez wywołania źródła i bez zapisu do cache. (*`/api/gus-cpi-full?year=1` to 8152 wywołania DBW;
      `sub100=0` zapisywało surowy indeks pod kluczem Przeglądu*)
- [ ] Długa trasa ma `export const maxDuration` w pliku, a limit crona ≥ suma limitów jego tras. (*`vercel.json`
      bierze pierwszy pasujący wzorzec, więc wpisy pod globem 30 s były martwe, a CPI z crona dostawało 504*)
- [ ] Kontrola świeżości dla nowego zbioru.
- [ ] Nic zależnego od „dziś” przed hydratacją (*React #418*).
- [ ] Telefon 320/390 px i desktop 1280/1440 px — bez przewijania w bok (*nagłówek przy 1280 px*).
- [ ] Nowe źródło w przeglądarce → wpis w CSP.
- [ ] Dane użytkownika należą do konta, nie do przeglądarki: tożsamość wyłącznie z zweryfikowanego ciasteczka sesji
      (`requireSession`), zapis tylko z własnej domeny, `Cache-Control: private, no-store`, treść szyfrowana jak reszta
      bazy, nieudany odczyt konta nigdy nie kończy się nadpisaniem konta kopią lokalną, `/prywatnosc` w tym samym PR.
      (*watchlista w `localStorage` była wspólna dla kont w jednej przeglądarce i różna na urządzeniach*)

## Definicja „zrobione”

1. Kryteria akceptacji ze specyfikacji spełnione, z dowodem (test, polecenie, zrzut ekranu).
2. `tsc`, `npm test`, eslint zmienionych plików, `npm run build` — czysto.
3. Playwright 390 i 1440 px: 0 przewijania w bok, 0 błędów konsoli, 0 naruszeń CSP.
4. Recenzja PM: **SHIP**.
5. Na produkcji: liczby zgodne ze źródłem, zbiór `ok` w `/api/health/freshness`, cron z wpisem w dzienniku.
6. `docs/ROADMAP.md` zaktualizowany.
