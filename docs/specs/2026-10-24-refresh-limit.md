# `?refresh=1` z limitem (bez sekretu)

- **Pozycja w backlogu:** ROADMAP 1 („`?refresh=1` jest publiczne”), Bezpieczeństwo i niezawodność.
- **Zakres:** `withCache` w `src/lib/server-cache.ts`. Ten jeden punkt obsługuje wszystkie trasy z `refresh=1`.
  Strony, Vercel i zmienne środowiskowe się nie zmieniają.

## 1. Problem

Trasy API przyjmują `?refresh=1`, które ustawia `maxAgeMs = -1`. Do tej pory `withCache` omijało wtedy cache
zawsze, a parametr był publiczny. Każdy mógł więc wołać np. `/api/gus-cpi-full?refresh=1` w pętli. Każde takie
wywołanie szło do GUS DBW, który ma wspólny limit około 100 żądań na 15 minut. Po wyczerpaniu limitu crony
dostawały 429 i dane na stronie przestawały się odświeżać. Ten sam wektor dotyczył BDL, NBP, Yahoo/Stooq,
Eurostatu i RSS.

## 2. Rozwiązanie

- `withCache`: przy `maxAgeMs < 0` (wymuszone odświeżenie) wpis młodszy niż
  `FORCED_REFRESH_MIN_AGE_MS = 10 * 60_000` (stała eksportowana) jest oddawany z cache. Do źródła
  idziemy tylko wtedy, gdy wpis jest starszy albo go nie ma. Pozostałe reguły się nie zmieniają: błąd źródła
  oddaje ostatni wpis, a pusta odpowiedź nie nadpisuje dobrej.
- Japonia (`src/lib/jp/cpi-server.ts`) miała ten wzorzec lokalnie. Teraz przekazuje `-1`, a stała jest
  w jednym miejscu.
- `/api/news` przekazywało przy `refresh=1` wartość `0`, która omija limit. Teraz przekazuje `-1`.
  Scalanie archiwum dziennego przy `refresh=1` działa dalej. Przy wpisie młodszym niż 10 min scala
  te same pozycje, a scalanie jest idempotentne.
- Nie wprowadzamy sekretu. Ścieżka „bez limitu z `CRON_SECRET`” z backlogu wypada, bo crony jej nie
  potrzebują (patrz §3). Sam `CRON_SECRET` nadal czeka na właściciela, bo chroni wywołania `/api/cron/*`.

## 3. Trasy z wymuszonym odświeżeniem: przegląd

`force ? -1 : …` stosują: `nbp`, `stooq`, `wig20`, `eurostat` (2×), `wibor`, `gus-cpi`, `gus-cpi-full`,
`gus-ppi-full`, `gus-koniunktura`, `gus-monthly`, `dbw-series`, `bdl-series`, `regional-gus`, `regional-eu`
i `jp/cpi`. Po zmianie dochodzi do nich `news`.

Żadna z tych tras nie wymaga ponownego pobrania w ciągu 10 min:

- **Crony:** każdy woła dany klucz najwyżej raz na przebieg. Kolejne przebiegi tego samego klucza dzieli
  co najmniej około 20 min (`stooq` 16:20, a samonaprawa w `freshness` 16:40), zwykle kilka godzin
  (`dbw-1…4` co 2 h).
- **Samonaprawa świeżości** (`selfHeal` w `src/lib/freshness-check.ts`, tylko NBP, Yahoo i Eurostat):
  przy wpisie młodszym niż 10 min `refresh=1` dostaje cache. Taki wpis to odpowiedź, którą źródło
  dało przed chwilą, zwykle przy odczycie kontroli świeżości tuż przed samonaprawą. Ponowne pobranie
  nie dałoby nowszego okresu, więc to zachowanie jest akceptowalne.
- **NBP po 12:15** (`nbpBehindToday`): drugi `withCache` z `NBP_RECHECK_MS` to zwykły dodatni TTL.
  Nie dotyczy go ta zmiana.

## 4. Kryteria akceptacji

Testy w `tests/server-cache.test.ts` (Firestore w pamięci, mock `@/lib/firebase/admin`):

1. Force i wpis sprzed 2 min: fetcher nie jest wołany, zwracany jest cache.
2. Force i wpis sprzed 11 min: fetcher jest wołany, a nowy wpis zapisany.
3. Bez force normalny TTL działa jak wcześniej. Dotyczy to też TTL krótszego niż 10 min.
4. Force, stary wpis i fetcher, który rzuca: zwracany jest stary wpis.
5. Pusta odpowiedź nie nadpisuje dobrego wpisu.

Oraz: `npx tsc --noEmit -p .`, `npm test`, eslint zmienionych plików i `npm run build` przechodzą bez błędów.
Strony się nie zmieniają, więc Playwright nie jest potrzebny.
