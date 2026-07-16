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

### 2. Spółki WIG20 — strona każdej spółki + newsy pod nią

Zlecone przez właściciela (2026-07-16). Każda spółka z WIG20 dostaje własne miejsce, a pod nią
dopasowane newsy.

- Tabela spółek WIG20: kurs, zmiana %, sortowanie. **Zweryfikuj tickery u źródła przed podpięciem.**
- Strona `/spolki/[ticker]`: kurs, wykres historii, kluczowe dane.
- **Newsy per spółka:** rozszerzyć `lib/news/match.ts` o słownik spółek — nazwa + warianty odmiany
  + ticker (np. „Orlen/Orlenu/PKN”, „KGHM”, „Żabka/Zabka”). UWAGA: tickery to ALL-CAPS, więc muszą
  trafić na whitelistę detektora clickbaitu, inaczej ukarzą własne newsy (patrz `score.ts`).
  Dopasowanie po nazwie spółki w tytule jest mocne; w opisie — słabsze (wzmianka mimochodem),
  więc użyć istniejącego podziału `strong` / `titleOnly`.
- **Kryterium:** ≥20 spółek z żywymi danymi, sortowanie działa, każda spółka ma trafne newsy
  (bez przypadkowych trafień — sprawdzić ręcznie na żywych danych, jak przy tematach).

### 3. Watchlista

- Zapis w `localStorage`; dodawanie wskaźników i spółek; pas „Obserwowane" na Przeglądzie.
- **Kryterium:** wybór przeżywa odświeżenie strony.

### 4. Spółki — sprawozdania finansowe (dalszy plan)

Zlecone przez właściciela jako etap po stronach spółek. Duża pozycja — rozpisać na osobne kroki
przy podejmowaniu.

- **Najpierw zweryfikuj źródło, zanim cokolwiek zbudujesz** (zasada nadrzędna: żadnych atrap).
  Kandydaci do sprawdzenia: raporty ESPI/EBI, sprawozdania w KRS/eKRS, Yahoo Finance
  (`financialData`/`incomeStatementHistory`), strony relacji inwestorskich spółek.
  Jeśli żadne darmowe źródło nie daje kompletnych danych — zapisz to w ROADMAP i NIE wstawiaj atrap.
- Zakres docelowy: rachunek zysków i strat, bilans, przepływy pieniężne; ujęcie roczne i kwartalne.
- Wskaźniki wyliczane z danych: C/Z, C/WK, marża, ROE, zadłużenie.
- **Kryterium:** dla ≥5 spółek WIG20 realne, zweryfikowane u źródła dane finansowe za ≥3 okresy;
  każda liczba ma podane źródło i datę.

---

## ZROBIONE

- Jasny design system `mk-`, powłoka aplikacji, nawigacja, paleta ⌘K
- Przegląd (KPI makro + pas rynków)
- Ceny: CPI (pełny audyt danych) + PPI (33 pozycje PKD, 10 lat)
- Gospodarka: aktywność, koniunktura, finanse publiczne + widok partii rządzących, korelacje
- Rynki, Praca, Regiony (mapa + rynek pracy), Prognozy (koszyk CPI, nowcast PKB, Taylor, symulatory)
- Publikacje (kalendarz), Samorząd (SMUP)
- Responsywność mobile; sprzątanie legacy (bb-/JetBrains); rozbicie cronów DBW na 3 okna; audyt /prognozy
- **Naprawa: wykresy nie renderowały się na mobile** — 2026-07-16, commit `bb9ab3f`
  Zgłoszenie właściciela: na telefonie karty wykresów pokazywały tytuł i przełączniki, ale w miejscu
  wykresu była biała pustka (produkcja). Bez błędu w konsoli — trzeba było zmierzyć DOM.
  - Przyczyna: **Recharts 3.7 + React 19 gubi pomiar szerokości** — jego wewnętrzny ResizeObserver
    przegrywa wyścig przy montowaniu i zostaje na zerze. SVG miał atrybut `width="309"`, ale realną
    szerokość 0, bo Recharts wstawiał własny `<div style="width: 0px">`.
  - Rozwiązanie: drop-in zamiennik `ResponsiveContainer` → `src/components/ui/ChartContainer.tsx`
    (własny pomiar: `useLayoutEffect` + ResizeObserver, wykres dostaje szerokość w pikselach).
    Podmieniony import w 5 plikach (7 wykresów). **Nie importować ResponsiveContainer z 'recharts'.**
  - Zweryfikowane na mobile 375px: surface 0x200 → 309x200, serie/osie/legenda widoczne.
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
- **Dopracowanie wyglądu — audyt mobile + dostępność** — 2026-07-16, commity `974aee9`, `0782390`, `f352032`
  Zlecone przez właściciela. Audyt mierzony w DOM (nie „na oko") na 375px: `/newsy`, `/rynki`,
  `/praca`, `/gospodarka`, `/regiony`.
  - **Ucinane KPI:** „23 248 EUR" pokazywało się jako „23 248 EU". `.mk-kpi-value` miało
    `clamp(2rem, 4.5vw, 3rem)`, gdzie **2rem jest PODŁOGĄ** — `4.5vw` przebija ją dopiero powyżej
    ~711px, więc na telefonie font miał zawsze 32px i wychodził 18px poza kartę (164px),
    a `overflow:hidden` obcinał go w połowie znaku.
    → karta KPI to teraz **kontener zapytań** (`.mk-kpi`, `container-type: inline-size`), a font
    skaluje się jednostkami `cqi` — do SZEROKOŚCI KARTY, nie okna (karty stoją w siatce, więc
    viewport nie mówi nic o ich szerokości). Reguły `cqi` są w `@container`, bo **poza kontenerem
    cqi liczy się względem viewportu** → fallback musi zostać. Desktop bez zmian (48px).
  - **Nawigacja:** „Rynek pracy" łamał się na 2 linie (54px vs 33px) i rozpychał pasek z 41 na 72px
    → `white-space: nowrap` w `.mk-tab`. Dodana `.mk-navrow`: schowany scrollbar + zanik po prawej
    (wcześniej pozycje wyglądały na ucięte przez błąd).
  - **Cele dotykowe:** stopka (16px) i „Wszystkie" w pasie newsów (20px) poniżej 24px z WCAG 2.2
    → padding, 28px.
  - **Kontrast:** `mk-faint` miał **2.31:1** przy wymaganych 4.5:1 (WCAG AA) — a to kolor dat,
    liczników i podpisów. Samo pociemnienie zrównałoby go z `muted`, więc przesunięta cała skala
    slate o stopień (muted 500→600, faint 400→500). Po zmianie: 17.85 / 10.35 / 7.58 / 4.76 — wszystko AA,
    hierarchia zachowana. Jeden token = 94 użycia `text-mk-faint` naprawione naraz.
- **Newsy — ranking (ważność/data/wiarygodność) + nowy wygląd** — 2026-07-16, commit `7c30a5d`
  Zlecone przez właściciela. `/newsy`: lead story, sortowanie Ważne/Najnowsze, słupek ważności,
  badge „N niezależnych redakcji", oznaczenia reklam i opinii. Przegląd pokazuje najważniejsze
  (nie najświeższe). Pliki: `lib/news/{score,cluster}.ts`, `sources.ts` (owner + OWNER_WEIGHT),
  ranking w `api/news/route.ts`.
  - **Klastry liczone po WŁAŚCICIELACH, nie domenach.** Bankier.pl i Puls Biznesu to jedna spółka
    (Bonnier) → ten sam temat u obu to JEDEN niezależny głos. 8 feedów = 5 właścicieli.
    Bez tego ważność byłaby systematycznie zawyżona.
  - **Brak publicznych ocen wiarygodności polskich mediów finansowych** (sprawdzone: NewsGuard nie
    pokrywa PL, MBFC nie ma Bankiera/Money.pl, Reuters DNR nie wymienia naszych źródeł) → `OWNER_WEIGHT`
    to NASZA ocena redakcyjna i tak jest opisana w kodzie. W UI mówimy „ważność" i „potwierdzenie
    przez niezależne redakcje", NIE „wiarygodność" — z tytułu i opisu nie da się zmierzyć rzetelności redakcji.
  - **Wzoru Hacker News nie da się tu użyć.** HN: głosy 1–1000 (~250× dynamiki), my: 1–5 właścicieli
    (~5×). Przy grawitacji 1.8 news sprzed 24h potrzebowałby ~370× więcej źródeł → czas zmiażdżyłby
    ważność i wyszłoby sortowanie po dacie. Stąd zanik wykładniczy, półokres H=10h (`score.ts`).
  - **Fałszywy alarm złapany na żywych danych:** wzorzec „we współpracy z" oznaczał jako reklamę
    prawdziwe newsy („Honda… we współpracy z General Motors", „GPW we współpracy z rynkiem").
    To zwykła polszczyzna biznesowa — reklamę zdradza dopiero formuła ujawnienia („artykuł powstał
    we współpracy z"). NIE rozluźniać tego wzorca z powrotem.
  - „materiał partnera"/„we współpracy z partnerem" karzemy tak ostro jak „artykuł sponsorowany" —
    UOKiK i Komisja Etyki uznały te formuły za NIEWYSTARCZAJĄCE oznaczenie reklamy (czyli reklama
    zamaskowana). UOKiK ma zarzuty wobec RASP (Business Insider) i WP (Money.pl).
  - **Parametry dobrane empirycznie**, nie z przeczucia: STEM=4 (przy 6 trzy newsy o tych samych
    danych inflacyjnych z 3 redakcji się NIE łączyły), próg 0.25 → 4 klastry wielo-właścicielskie,
    wszystkie trafne, największy klaster 4 pozycje (brak łańcuchowania).
  - Efekt na żywo: topka ważności zdominowana przez tematy potwierdzone (100/97/95/93 — wszystkie
    z 2 niezależnych redakcji), 0 fałszywych reklam.
  - Whitelist skrótowców (NBP/GUS/RPP/KGHM/WIG20…) w detektorze clickbaitu jest KONIECZNA — bez niej
    reguła ALL-CAPS karałaby najtwardsze newsy makro. Dodając spółki WIG20, dopisz ich tickery.
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
