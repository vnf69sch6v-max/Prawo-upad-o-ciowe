# 1b: wymuszone odświeżenie GUS DBW/BDL tylko z `CRON_SECRET`

- **Pozycja w backlogu:** ROADMAP 1b (Bezpieczeństwo i niezawodność, priorytet 3: limit, który może zatrzymać dane).
- **Dlaczego teraz, choć API jest za bramką:** okres próbny dostaje każdy zweryfikowany e-mail, a do wyczerpania
  limitu nie trzeba nadużycia. Jedno „Aktualizuj” na CPI to ~64 wywołania DBW (`gus-cpi-full`, `no-store` na
  wszystkich okresach), na PPI ~53. Razem 117 > ~100 / 15 min — dwa uczciwe kliknięcia rano w dniu publikacji wystarczą,
  żeby `dbw-1` dostał 429. `withCache` zostawia wtedy stary wpis, a następne wymuszenie to cron następnego dnia.
  Pozycja 2 (częściowe awarie na `/status`) tylko to wykrywa, 1b temu zapobiega.
- **Status:** wdrożone 25.10.2026 z odstępstwem w R4 (niżej). Źródło danych się nie zmienia, więc weryfikacja na żywo nie jest potrzebna.

## 1. Problem i wartość dla użytkownika

Użytkownik w dniu publikacji GUS chce zobaczyć nową inflację, produkcję albo sprzedaż. Dociera ona przez crony
`dbw-1..4` i `bdl` z `?refresh=1`. Dziś ten sam `?refresh=1` może wysłać każdy zalogowany z dostępem (przycisk
„Aktualizuj” na CPI i PPI albo pętla w konsoli). Limit 10 min na klucz z 24.10 nie jest budżetem: po 1a wszystkie
klucze bieżącego roku dają razem ~279 wywołań DBW / 10 min. Po zmianie wymuszone pobranie u źródła GUS zostaje tylko
dla automatyki. Użytkownik niczego nie traci poza przyciskiem, który i tak mógł zepsuć cron.

## 2. Reguły

- **R1 `canForceUpstream(request)`** (czysta funkcja w `src/lib/access.ts`, obok `sameSecret`, działa też na Edge):
  bez `CRON_SECRET` → `true` (dev, demo i produkcja bez sekretu — crony nie wysyłają wtedy nagłówka). Z sekretem
  → `true` tylko wtedy, gdy `Authorization` == `Bearer ${CRON_SECRET}` (`sameSecret`, porównanie w stałym czasie).
- **R2 Trasy.** `force = refresh=1 && canForceUpstream(request)`, w trasach z rokiem dodatkowo `y.current` (reguła 1a
  zostaje). `forcedRefresh(sp, y, request)` w `src/lib/gus-params.ts` dla: `gus-cpi-full`, `gus-ppi-full`,
  `gus-koniunktura`, `dbw-series`, `gus-cpi`. Bezpośrednio w `gus-monthly`, `bdl-series`, `regional-gus`.
  `force` steruje i TTL-em (`-1`), i `gusFetchInit(force)`. Pozostałe trasy GUS (`dbw`, `gus-labor-extra`, `smup`,
  `gus-regional`) nie czytają `refresh` — bez zmian.
- **R3 Publiczne `refresh=1` to zwykłe żądanie:** 200 z cache (zwykły TTL, `gusFetchInit(false)`), nie 400/403 —
  stare skrypty w otwartych kartach dalej działają. `refresh` ani `Authorization` nie trafiają do klucza cache.
- **R4 Interfejs (wdrożone z odstępstwem).** Plan: usunąć „Aktualizuj” z CPI/PPI i `RefreshButton.tsx`. Granica
  rutyny („nie usuwaj funkcji”) nie pozwala usunąć funkcji bez zgody właściciela, więc: `refreshFromSource` usunięty
  z `useCpiFull`/`usePpiFull`, przycisk woła `refetch()` (ponowny odczyt cache, który odświeża cron) i nigdzie
  w przeglądarce nie ma `refresh=1`. Przycisk niczego już nie obiecuje (komentarz komponentu; brak tekstu „z GUS”).
  PM w recenzji: SHIP, przycisk zostaje — zapytania GUS mają `staleTime` 24 h, więc bez `refetch()` otwarta karta
  nie zobaczy odczytu z crona do przeładowania strony.
- **R5 Poza GUS bez zmian:** NBP, Yahoo/Stooq, Eurostat, news, `jp/cpi` mają własne limity, a samonaprawa kontroli
  świeżości (`selfHeal`, z `internalInit`) nadal ich potrzebuje.

## 3. Co widzi użytkownik

- **Telefon (320–430 px) i desktop:** `/ceny` → nagłówek wykresu CPI: przełącznik r/r–m/m, „dane za …”, plakietka
  świeżości. Nie ma przycisku. Tak samo w sekcji PPI. Poza tym strona się nie zmienia.
- **Dzień publikacji:** liczba przychodzi z crona `dbw-1` o 09:40 UTC, czyli od dziś (koniec czasu letniego)
  o 10:40 w Warszawie. Na Hobby start może się przesunąć o ±1 h. Liczba jest więc na stronie tego samego dnia
  (zasada 2), do ~1,5 h później, niż dałoby kliknięcie o 10:05. Świadomy koszt: wyczerpane okno DBW = cron z 429 =
  CPI dopiero następnego dnia.
- **Wyjście awaryjne właściciela:** Vercel → projekt → Settings → Cron Jobs → `dbw-1` → **Run** (wywołanie z sekretem).

## 4. Zastosowane lekcje (`docs/PRODUCT.md`)

- [x] `refresh=1` z limitem — wymuszenie GUS tylko z sekretem, limit 10 min na klucz zostaje.
- [x] Trasa do źródła z limitem przyjmuje tylko znane parametry — walidacja 1a bez zmian, kolejność: walidacja → `force`.
- [x] Crony wołają `SITE_URL` przez `internal-fetch` — `internalInit` już wysyła `Bearer`. Kryterium 5 wiąże listę cronów z `force`.
- [x] Upstream `no-store` tylko przy wymuszeniu (`gusFetchInit(force)`), ścieżka użytkownika zostaje przy Data Cache.
- [x] Telefon 390 px / desktop 1440 px — zrzuty po usunięciu przycisku.
- n/d: nowy zbiór, kontrola świeżości, CSP, dane użytkownika, `maxDuration` (czasy tras bez zmian).

## 5. Kryteria akceptacji (wszystkie bez sieci)

1. `tests/access.test.ts`: `canForceUpstream` — bez `CRON_SECRET` → `true`. Z `CRON_SECRET=s`: brak nagłówka,
   `Bearer x`, `bearer s`, `Bearer  s`, `s` → `false` (spacje na końcu obcina już `Headers`). Tylko `Bearer s` → `true`.
2. `tests/gus-routes.test.ts` (`withCache` zamockowany, `vi.stubEnv('CRON_SECRET', 's')`). Dla każdej z 8 tras z R2
   (`ROUTES` uzupełnione o `bdl-series` i `regional-gus`): `refresh=1` bez nagłówka → TTL (`withCache` arg. 5) `> 0`
   i równy TTL-owi bez `refresh`. Z `Authorization: Bearer s` → `-1`, z `Bearer x` → `> 0`. `fetch` wołany 0 razy.
3. Ten sam plik, bez `CRON_SECRET`: `refresh=1` → `-1` (dzisiejsze zachowanie dev/demo). Z sekretem
   `year=${W-1}&refresh=1` + `Bearer s` → `> 0` (reguła 1a zostaje). Istniejący test kryterium 10 z 1a przechodzi.
4. Klucz cache (`withCache` arg. 2) jest identyczny dla: bez `refresh`, publicznego `refresh=1` i `refresh=1` z sekretem.
5. Dla każdej ścieżki z `CRON_ENDPOINTS` (`dbw-1..4`, `bdl`), która trafia w trasę z R2, żądanie z nagłówkami
   `internalInit()` (przy `CRON_SECRET=s`) daje `-1`. Crony dalej wymuszają pobranie.
6. Test statyczny (wzór `tests/data-protection.test.ts`): w kodzie `src/components/**` i `src/lib/hooks.ts` (bez
   komentarzy) nie ma `refresh: '1'` ani `refresh=1`. W `src` nie ma `refreshFromSource` (`RefreshButton` zostaje — R4).
7. `npx tsc --noEmit`, `npm test`, eslint zmienionych plików, `npm run build` — czysto.
8. Playwright na `next start` (demo, bez Firebase; dane mogą być „—”): `/ceny` przy 390 i 1440 px — kliknięcie
   „Aktualizuj” nie wysyła żadnego żądania z `refresh=1`, `scrollWidth <= innerWidth`, brak błędu #418.
9. `AGENTS.md`: akapit „`?refresh=1` is public (no secret)” mówi, że w trasach GUS DBW/BDL wymuszenie działa tylko
   z `Bearer CRON_SECRET` (albo bez ustawionego sekretu), a publiczne `refresh=1` dostaje zwykły TTL.

**Po wdrożeniu (nie blokuje scalenia, wynik do ROADMAP):** 26.10.2026 po 16:40 UTC przebiegi `dbw-1..4` i `bdl`
na `/status` mają `failed: []`, a `/api/health/freshness` 15/15 ok. Kontrola P0 13.11 obejmuje już 1b.

## 6. Pliki

- `src/lib/access.ts` — `canForceUpstream`.
- `src/lib/gus-params.ts` — `forcedRefresh(sp, y, request)`.
- `src/app/api/{gus-cpi-full,gus-ppi-full,gus-koniunktura,dbw-series,gus-cpi,gus-monthly,bdl-series,regional-gus}/route.ts`.
- `src/lib/hooks.ts`, `src/components/sections/InflacjaFull.tsx`, `src/components/sections/PpiFull.tsx`;
  usunąć `src/components/ui/RefreshButton.tsx`. Komentarz w `src/lib/gus-api-paths.ts` (`refresh=1` = cron).
- `tests/access.test.ts`, `tests/gus-routes.test.ts`, test statyczny (nowy plik albo `tests/gus-params.test.ts`).
- `AGENTS.md` (kryterium 9), `docs/ROADMAP.md` (status 1b).

## 7. Poza zakresem

- 1c: walidacja parametrów tras BDL (`bdl-series` dalej tworzy dowolne klucze bez `refresh`) i czas crona `bdl`.
- Przycisk „Aktualizuj” dla `ADMIN_EMAILS` (sesja + `requireSession`). Wrócić do tego, jeśli kontrola 13.11 pokaże,
  że cron nie zdąża przed rynkiem.
- `/api/news?refresh=1` (pozycja 6) — może użyć `canForceUpstream` w osobnym kroku.
- `cron/gus` porównuje sekret przez `!==` — kosmetyka, nie wpływa na limit.

## 8. Akcje właściciela

Brak — `CRON_SECRET` jest ustawiony od 25.10.2026. Wyjście awaryjne opisane w §3.
