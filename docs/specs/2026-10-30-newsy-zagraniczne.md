# Newsy: więcej feedów PL + zagraniczne media i banki centralne (2026-10-30)

## Problem i wartość
Czytelnik /newsy widzi dziś tylko polskie portale. Decyzje EBC/Fed/BOJ i światowe rynki (stopy, jen, dolar)
napędzają PLN i WIG, a Japonia jest już drugim krajem serwisu. Pytanie: „co ważnego stało się dziś na świecie
i w bankach centralnych, co rusza moje rynki?” — bez opuszczania /newsy i bez zalania polskiego feedu angielskim.

## Co widzi użytkownik
- Telefon (320–430 px): filtr sekcji dostaje dwie nowe etykiety: **ŚWIAT** (`swiat`) i **BANKI CENTRALNE** (`banki`).
  Pozycja zagraniczna ma tag `EN · USA` / `EN · STREFA EURO` / `EN · JAPONIA` / `EN · W. BRYTANIA` / `EN · ŚWIAT`
  przy nazwie źródła; tytuł w oryginale (bez tłumaczenia), lead ≤ 400 zn., data, link (nowa karta, `rel=noopener`).
  Tag nie łamie wiersza na 320 px (truncate nazwy źródła, nie tagu).
- Desktop 1440: to samo; filtr jako segment, bez nowych kolumn.
- Widok „Wszystkie” zostaje zdominowany przez PL: twardy limit zagranicznych pozycji (niżej).

## Dane (zweryfikowane curl przez zlecającego 2026-10-30: HTTP 200, `<item>` z datami)
PL (`lang:'pl'`, `region:'PL'`): Business Insider Gospodarka `businessinsider.com.pl/gospodarka.feed` (20, owner `rasp`
— ten sam właściciel co obecny BI, nie liczy się jako niezależny głos), Strefa Inwestorów `strefainwestorow.pl/rss.xml`
(10, nowy owner `strefa`), inwestycje.pl `/feed/` (10, nowy owner `inwestycjepl`).
Banki centralne (`section:'banki'`, waga 1,2): EBC `ecb.europa.eu/rss/press.html` (15, EU), Fed
`federalreserve.gov/feeds/press_all.xml` (20, US; `pubDate` w CDATA; odrzucać tytuły z „enforcement action”,
„approval of application”, „termination of enforcement”), BOJ `boj.or.jp/en/rss/whatsnew.xml` (51 poz., JP; **whitelista**
tytułów: Monetary Policy, Outlook, Tankan, Financial System Report, Summary of Opinions, Minutes — reszta odrzucana).
Media (`section:'swiat'`, waga 0,8–0,9): BBC Business (GB, 0,9), MarketWatch top stories
`feeds.content.dowjones.io/public/rss/mw_topstories` (US, 0,8), Guardian Economics (GB, 0,85), FT Global Economy
`?format=rss` (GLOBAL, 0,9; owner `nikkei` — FT należy do Nikkei, przygotować na przyszłość), Japan Times Business (JP, 0,8).
Odrzucone (dopisać do komentarza w `sources.ts`): Nikkei Asia (RDF bez dat), CNBC (403), NHK cat5 (stare daty), IMF (403),
NBP/MF/KNF/PAP/tvn24/Obserwator Finansowy (brak RSS), WSJ dj.com (daty 2025), Investing.com (brak strefy).
- Nowe pola `NewsSource`: `lang: 'pl'|'en'`, `region: 'PL'|'EU'|'US'|'JP'|'GB'|'GLOBAL'`, opcjonalnie `include?: RegExp` (whitelista),
  `exclude?: RegExp` (blacklista). Sekcje: `NewsSection` += `'swiat' | 'banki'`.
- Miks: limit per źródło jak dziś; **max 40 pozycji `lang:'en'` w feedzie 150**; dedup URL/tytuł bez zmian.
- Treść: tylko tytuł + lead (strip HTML, ≤ 400 zn.) + data + link. Nigdy pełny tekst (prawa autorskie, paywall FT).
- Cache/cron: klucz `news` bez zmian — nowe pola są opcjonalne (brak `lang` = polski), TTL 15 min.
  Freshness: istniejący `DatasetSpec` newsów; źródło z 0 pozycji przez 48 h → widoczne w logu crona.
- Klastrowanie: angielskie tytuły nie łączą się z polskimi (inny język) — akceptujemy; zagraniczne nie podbijają
  ważności tematów PL.

## Lekcje zastosowane
- [x] Tylko źródła zweryfikowane realnym żądaniem; odrzucone udokumentowane.
- [x] Strefy czasowe: każda nowa data parsowana z deklarowaną strefą; test na CDATA.
- [x] Niezależność liczona po właścicielu (BI Gospodarka = `rasp`).
- [x] Nic zależnego od „teraz” przed hydracją (względne „x godz. temu” po `useIsClient`).
- [x] Brak nowych originów w przeglądarce (fetch po stronie serwera) → CSP bez zmian.

## Kryteria akceptacji
1. `npm test`: parser czyta `pubDate` w `<![CDATA[...]]>` (fixture Fed) do poprawnego ISO UTC.
2. `npm test`: feed RDF bez dat (fixture Nikkei-like) → 0 pozycji, bez wyjątku.
3. `npm test`: filtr BOJ — z fixture 51 poz. przechodzą tylko tytuły z whitelisty; filtr Fed odrzuca enforcement/approval.
4. `npm test`: miks z 200 poz. EN i 200 PL → ≤ 40 EN w 150. Limit per źródło (`slice(0, src.limit)`) i dedup URL/tytuł to niezmieniony kod `feed.ts`.
5. `npm test`: lead obcięty do ≤ 400 zn., bez tagów HTML; każda pozycja ma `lang` i `region`.
6. `curl /api/news` (lokalnie): są pozycje z ≥ 3 nowych źródeł zagranicznych i ≥ 2 nowych PL, daty ≤ 7 dni.
7. Playwright 390/1440 na /newsy: filtry ŚWIAT i BANKI CENTRALNE działają, tag `EN · …` widoczny, 0 przewijania w bok,
   0 błędów konsoli, 0 naruszeń CSP (`next start`).
8. `/api/health/freshness` → zbiór newsów `ok` po wdrożeniu; cron z wpisem w `health/cron_runs`.
9. `tsc`, eslint zmienionych plików, `npm run build` czyste.

## Poza zakresem
Tłumaczenie tytułów, streszczenia AI (osobny spec: brief DeepSeek), pełne teksty, scraping HTML, dopasowanie
zagranicznych newsów do wskaźników JP (następny krok).

## Akcje właściciela
Brak. (Opcjonalnie: potwierdzić, że użycie tytułu+leadu FT/Guardian/BBC z linkiem jest akceptowalne w regulaminie.)
