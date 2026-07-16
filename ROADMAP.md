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

### 1. Newsy — zakładka `/newsy`

Backend gotowy: `GET /api/news` → `{ timestamp, sourcesOk, sourcesTotal, count, sources[], items[] }`,
gdzie `items[] = { title, link, publishedAt (ISO UTC), description, sourceId, source, section }`,
posortowane malejąco po dacie, limit 150. Typ `NewsItem` eksportowany z `src/app/api/news/route.ts`.

- Lista: tytuł, źródło, czas względny („12 min temu"), link zewnętrzny (`target="_blank" rel="noopener noreferrer"`).
- Filtry: po źródle (użyj `sourceId`; `sources[]` z endpointu daje gotową listę + status) + wyszukiwarka tekstowa.
  Dodaj pozycję do `TopNav`.
- Uwaga z weryfikacji: feed główny Bankiera („Wiadomości") miesza finanse ze światem/polityką — filtr
  po źródle jest tu realną wartością dla użytkownika. Dopasowanie tematyczne przyjdzie z pozycją 2.
- **Kryterium:** zakładka renderuje żywe newsy, filtry działają, układ responsywny na mobile.

### 2. Newsy w kontekście danych (nasz wyróżnik)

Tego nie ma ani Stooq, ani Bankier: news postawiony przy wskaźniku, którego dotyczy.

- Dopasowanie newsów do wskaźników po słowach kluczowych: inflacja/CPI → Ceny; stopy/RPP → Rynki;
  PKB → Gospodarka; bezrobocie/płace → Praca.
- Pas „Newsy powiązane" w tych sekcjach + najnowsze newsy na Przeglądzie.
- **Kryterium:** Ceny, Gospodarka, Praca i Rynki pokazują trafnie dopasowane newsy (bez przypadkowych trafień).

### 3. Rynki — więcej indeksów

- Obok WIG20 dodaj WIG, mWIG40, sWIG80. **Zweryfikuj tickery u źródła, zanim podepniesz.**
- **Kryterium:** indeksy z żywym kursem i zmianą %, na wspólnym wykresie porównawczym.

### 4. Rynki — pojedyncze spółki

- Tabela spółek WIG20: kurs, zmiana %, sortowanie. Szuflada/strona spółki z wykresem historii.
- **Kryterium:** ≥20 spółek z żywymi danymi, sortowanie działa.

### 5. Watchlista

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
- **Newsy — backend (agregator RSS)** — 2026-07-16, commit `b96c5c2`
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
