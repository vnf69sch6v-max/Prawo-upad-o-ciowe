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

### 1. Newsy — backend (agregator RSS)

Największa luka wobec konkurencji: Bankier i Stooq mają newsy, my zero.

- Zweryfikuj realnie (np. `curl`), które polskie feedy RSS finansowe działają. Kandydaci do sprawdzenia:
  Bankier, Money.pl, Business Insider PL, Puls Biznesu, Parkiet, Forsal, PAP Biznes, Interia Biznes.
  **Użyj tylko tych, które faktycznie zwracają poprawny XML.** Martwe odrzuć i zapisz w komentarzu, które i dlaczego.
- `src/app/api/news/route.ts`: pobierz → sparsuj → scal → odduplikuj → posortuj po dacie. `withCache` (TTL ~15 min).
- Warm: dopisz do `/api/cron/refresh` (RSS ma osobny limit niż DBW — bezpiecznie).
- **Kryterium ukończenia:** endpoint zwraca ≥3 działające źródła i ≥30 świeżych pozycji, każda z tytułem,
  linkiem, datą i nazwą źródła; `tsc` + `build` zielone.

### 2. Newsy — zakładka `/newsy`

- Lista: tytuł, źródło, czas względny („12 min temu"), link zewnętrzny (`target="_blank" rel="noopener noreferrer"`).
- Filtry: po źródle + wyszukiwarka tekstowa. Dodaj pozycję do `TopNav`.
- **Kryterium:** zakładka renderuje żywe newsy, filtry działają, układ responsywny na mobile.

### 3. Newsy w kontekście danych (nasz wyróżnik)

Tego nie ma ani Stooq, ani Bankier: news postawiony przy wskaźniku, którego dotyczy.

- Dopasowanie newsów do wskaźników po słowach kluczowych: inflacja/CPI → Ceny; stopy/RPP → Rynki;
  PKB → Gospodarka; bezrobocie/płace → Praca.
- Pas „Newsy powiązane" w tych sekcjach + najnowsze newsy na Przeglądzie.
- **Kryterium:** Ceny, Gospodarka, Praca i Rynki pokazują trafnie dopasowane newsy (bez przypadkowych trafień).

### 4. Rynki — więcej indeksów

- Obok WIG20 dodaj WIG, mWIG40, sWIG80. **Zweryfikuj tickery u źródła, zanim podepniesz.**
- **Kryterium:** indeksy z żywym kursem i zmianą %, na wspólnym wykresie porównawczym.

### 5. Rynki — pojedyncze spółki

- Tabela spółek WIG20: kurs, zmiana %, sortowanie. Szuflada/strona spółki z wykresem historii.
- **Kryterium:** ≥20 spółek z żywymi danymi, sortowanie działa.

### 6. Watchlista

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
