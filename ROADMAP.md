# ROADMAP — Makro Data Platform

**Cel produktowy:** w pełni funkcjonalna platforma danych **makro + rynkowych + newsowych** z Polski,
wyraźnie lepsza niż stooq.pl i bankier.pl.

**Nasza przewaga (utrzymać i pogłębiać):** głębia danych GUS, której konkurencja nie ma — CPI (13 działów
+ podkategorie, 10 lat), PPI (33 pozycje PKD), korelacje międzywskaźnikowe, widok partii rządzących,
nowcasty, mapy regionalne, SMUP. Stooq i Bankier nie mają nic w tym stylu.

**Nasze luki (nadrobić):** newsy (całkowity brak), pojedyncze spółki, watchlista, alerty.

## Zasady pracy

1. **Jedna pozycja na raz, od początku do końca.** Nie zaczynaj nowej, dopóki bieżąca nie trafi do ZROBIONE.
2. Tylko prawdziwe dane, zweryfikowane u źródła. Zero mocków i zmyślonych liczb.
3. Każda pozycja ma **kryterium ukończenia** — dopóki nie jest spełnione, pozycja zostaje W TOKU.
4. Repo zawsze zielone (`npx tsc --noEmit` + `npm run build`).

---

## W TOKU

_(puste — weź pierwszą pozycję z KOLEJKI, przenieś ją tutaj i rozpisz kroki)_

---

## KOLEJKA (priorytet malejąco)

### 1. Rynki — więcej indeksów

- Obok WIG20 dodaj WIG, mWIG40, sWIG80. **Zweryfikuj tickery u źródła, zanim podepniesz.**
- **Kryterium:** indeksy z żywym kursem i zmianą %, na wspólnym wykresie porównawczym.

### 2. Rynki — pojedyncze spółki

- Tabela spółek WIG20: kurs, zmiana %, sortowanie. Szuflada/strona spółki z wykresem historii.
- **Kryterium:** ≥20 spółek z żywymi danymi, sortowanie działa.

### 3. Watchlista

- Zapis w `localStorage`; dodawanie wskaźników i spółek; pas „Obserwowane" na Przeglądzie.
- **Kryterium:** wybór przeżywa odświeżenie strony.

---

## ZROBIONE

- Jasny design system `mk-`, powłoka aplikacji, nawigacja, paleta ⌘K
- Przegląd (KPI makro + pas rynków)
- Ceny: CPI (pełny audyt danych) + PPI (33 pozycje PKD, 10 lat)
- Gospodarka: aktywność, koniunktura, finanse publiczne + widok partii rządzących, korelacje
- Rynki, Praca, Regiony (mapa + rynek pracy), Prognozy (koszyk CPI, nowcast PKB, Taylor, symulatory)
- Publikacje (kalendarz), Samorząd (SMUP)
- Responsywność mobile; sprzątanie legacy (bb-/JetBrains); rozbicie cronów DBW na 3 okna; audyt /prognozy
- **Newsy — backend (agregator RSS)** — 2026-07-16, commit `7316f35`
  `/api/news`: 8 zweryfikowanych feedów → parse → dedup → sort. Na żywo: **8/8 źródeł, 175 pozycji**,
  0 braków w polach, 0 dat w przyszłości, ~400 ms. Pliki: `src/lib/news/{sources,parse}.ts`,
  `src/app/api/news/route.ts`; warm w `/api/cron/refresh`; TTL 15 min (`news` w `server-cache.ts`).
  - **Odrzucone po realnym teście** (nie przywracać bez ponownej weryfikacji — szczegóły w `sources.ts`):
    Parkiet (404), Forsal (404), PAP Biznes (404/HTML), Bankier Gospodarka (200 ale 0 pozycji),
    Rzeczpospolita (każde `rss/{id}` zwraca ten sam ogólny feed Polityka/Film/Wojsko — brak kanału
    ekonomicznego). Puls Biznesu działa TYLKO pod `/rss/najnowsze.xml` (`/rss` serwuje HTML).
  - **Bankier deklaruje błędną strefę** — pubDate stale `+0100` mimo CEST, a `lastBuildDate` to czas
    warszawski podpisany jako „GMT". Dosłowna interpretacja dawała artykuły ~5 min w PRZYSZŁOŚCI i
    przesuwała Bankiera o +1h na górę listy. Stąd flaga `warsawWallClock` (offset liczony przez Intl,
    poprawnie w CET i CEST). Money.pl/BI/Interia deklarują strefę poprawnie → bez flagi.
- **Newsy — zakładka `/newsy`** — 2026-07-16, commit `a36d322`
  Lista + filtr po źródle (z licznikami) + wyszukiwarka bez diakrytyków; stany: ładowanie/błąd/pusty.
  Zakładka wpięta w `TopNav` i paletę ⌘K. Zweryfikowane na żywo: 150 newsów z 8/8 źródeł, filtr i szukanie
  działają, mobile 375 px bez scrolla poziomego, konsola czysta (zero hydration mismatch).
  Pliki: `src/app/newsy/page.tsx`, `formatRelativeTime()` w `formatters.ts`, `useNews()` w `hooks.ts`.
  - **Naprawione przy okazji:** `/api/news` zwracał `count` = liczba PRZED przycięciem do 150, więc UI
    pokazywał „175 pozycji", a lista miała 150. Teraz `count` = to, co realnie wraca, a `countBeforeLimit`
    trzyma wartość sprzed limitu.
  - **Pułapka CSS (na przyszłość):** `.mk-input` ustawia `padding` skrótem w `globals.css`, co **bije
    utility Tailwinda** — `pl-9`/`pr-9` nie zadziała (ikona nachodzi na placeholder). Nadpisywać stylem
    inline, tak jak robi to `Segmented.tsx`.
  - **Pułapka i18n:** polskie „ł" (U+0142) NIE rozkłada się pod NFD, więc samo usuwanie diakrytyków nie
    wystarcza — bez podmiany „ł"→„l" szukanie „zloty" nie znajdzie „złoty". Patrz `norm()` w `lib/news/match.ts`.
- **Newsy w kontekście danych** — 2026-07-16, commit `b6b3414`
  Pas „Newsy powiązane" na Cenach, Gospodarce, Pracy i Rynkach + „Najnowsze newsy" na Przeglądzie.
  Pliki: `src/lib/news/match.ts` (silnik), `src/lib/news/types.ts` (wspólne typy), `RelatedNews.tsx`
  (eksportuje `RelatedNews` i `LatestNews`). Pas ukrywa się przy 0 trafień — przy nastawieniu na precyzję
  to normalny stan, a pusta ramka „brak" byłaby gorsza niż jej brak.
  Zweryfikowane na żywo: Ceny 6 trafień, Rynki 23, Praca 5, Gospodarka 2 (ze 150 newsów) — wszystkie na temat.
  - **Trafność wymusiła projekt silnika — nie upraszczać go z powrotem.** Audyt na żywych danych wykrył
    fałszywe trafienia, każde z innej przyczyny:
    - prefiks „zloty" łapał „setki milionów **złotych**" (kwota, nie waluta) → PAŻP i bursztyn w Rynkach;
    - prefiks „pensj" łapał „**pensj**onariusza" → szpitalny parking w Pracy;
    - „pracownikow" było zbyt ogólne (każdy artykuł o firmie);
    - „stopa" samo w sobie łapie „stopę bezrobocia", czyli CUDZY temat.
    Stąd: **prefiksy vs całe słowa** (granica z obu stron) — patrz komentarze w `match.ts`.
  - **Główne odkrycie:** większość fałszywek brała się z OPISU, nie z tytułu — opis tylko wspomina
    („restrukturyzował zadłużenie i **zatrudnienie**" w newsie o wynikach spółki), tytuł mówi, o czym
    artykuł JEST. Stąd dwa poziomy pewności: `strong` (tytuł + opis) i `titleOnly` (tylko tytuł).
    Samo dopasowanie po tytule odpadło — Gospodarka schodziła wtedy do **0** trafień na 150.
  - Skrypty audytowe były jednorazowe (scratchpad) — przy zmianie słowników powtórzyć: wypisać trafienia
    per temat z żywego `/api/news` i przejrzeć ręcznie.
