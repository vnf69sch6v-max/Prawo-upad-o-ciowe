# Savori — backlog autonomicznego rozwoju

Rutyna co 5 h (zgoda właściciela z 24.10.2026) dowozi **jeden** krok na przebieg. Każdy krok przechodzi
przez agenta PM (`.claude/agents/product-manager.md`): PLAN → specyfikacja w `docs/specs/` z kryteriami
akceptacji i sprawdzonym źródłem danych → wdrożenie → REVIEW PM (SHIP / FIX / BLOCK) → produkcja.
Zasady produktu i definicja „zrobione”: `docs/PRODUCT.md`. Awaria danych lub cronów ma zawsze
pierwszeństwo. Rzeczy, których nie da się zrobić z kodu, trafiają do „Wymaga właściciela”.

## Do zrobienia (od najważniejszego)

### Prośby właściciela
0. **Rozbicie inflacji w Japonii — „ładne”** (prośba z 24.10.2026). Co napędza CPI: świeża żywność,
   energia, żywność bez świeżej, usługi/towary, kategorie koszyka; wkłady w p.p. tam, gdzie da się je
   policzyć uczciwie. Ustalone: Statistics Dashboard ma kategorie koszyka **tylko rocznie** — miesięcznie
   są tylko miary zbiorcze (ogółem, bez świeżej żywności, bez świeżej żywności i energii, bez żywności
   i energii). Pierwszy krok bez klucza: rozbicie z różnic tych miar (wpływ świeżej żywności, energii,
   żywności przetworzonej — opisane jako różnice miar, nie wagi). Pełne kategorie miesięczne: e-Stat API
   (`ESTAT_APP_ID`, darmowa rejestracja — właściciel) albo pliki Statistics Bureau — PM ustala w specyfikacji.
   **Krok 1 zrobiony 24.10** (różnice miar, PM: SHIP). **Krok 2** — oficjalne wkłady 寄与度 i kategorie
   koszyka miesięcznie — czeka na `ESTAT_APP_ID` (właściciel).

### Bezpieczeństwo i niezawodność
1. **Publiczne trasy GUS nadal mogą wyczerpać limit DBW** (~100 żądań / 15 min; crony dostają wtedy 429).
   Limit 10 min na klucz (zrobiony 24.10) ogranicza tylko powtórzenia na jednym kluczu i nie jest budżetem GUS.
   Pętla po jednym kluczu `gus-cpi-full` daje 64–128 wywołań DBW / 15 min, po wszystkich kluczach DBW
   ~440–590 / 15 min. Dwa kroki:
   - **1a (bez klucza, najpierw): walidacja parametrów tras GUS.** `year` tylko bieżący i poprzedni rok
     w `gus-cpi-full`, `gus-ppi-full`, `gus-cpi`, `gus-koniunktura`, `dbw-series`. `dbw-series` wpuszcza
     tylko serie z konfiguracji (zebrać wszystkie używane `var`/`przekroj`/`poz`/`prez` z kodu:
     `src/lib/gus-dbw-series.ts`, `DbwPriceSection` na `/ceny` itd.). Dziś `/api/gus-cpi-full?year=1`
     buduje ~8140 okresów, więc jedno GET to setki wywołań DBW bez żadnego `refresh=1`. Dowolne
     `var`/`przekroj` tworzą też dowolne klucze cache.
   - **1b: wymuszone odświeżenie GUS DBW/BDL tylko z `CRON_SECRET`** (`Authorization` z `internalInit`).
     Publiczne `refresh=1` ma wtedy zwykły TTL, a przycisk „Aktualizuj” na CPI/PPI nie wysyła `refresh=1`.
     Wymaga ustawienia `CRON_SECRET` przez właściciela.
2. **CORS na `/api/*`:** `Access-Control-Allow-Origin: *` z metodami POST/PUT/DELETE/PATCH
   (`vercel.json`). Zawęzić do GET/OPTIONS; POST tylko dla parsera z własnej domeny.
3. **`news-digest` nie zapisuje przebiegu** w `health/cron_runs` — `/status` nie pokazuje, czy działa.
4. **Lint:** ~21 starych błędów w `src/lib/firebase/*` i hookach — wyczyścić, potem lint w CI.
5. **`/api/news?refresh=1` przy każdym wywołaniu zapisuje archiwum dzienne do Firestore**, także wtedy,
   gdy feed przyszedł z cache. Pętla zjada limit zapisów Firestore. Scalać tylko przy świeżym pobraniu
   albo najwyżej raz na N minut.

### Produkt
6. **Szybki szacunek CPI** (ostatni dzień roboczy miesiąca) na Przeglądzie w dniu publikacji —
   dziś strona pokazuje inflację ~15 dni po rynku. DBW go nie dostaje; źródło: komunikat GUS.
7. **CI na GitHub Actions:** `tsc`, `npm test`, `eslint` na każdym PR (może wymagać uprawnienia
   `workflow` dla tokenu — jeśli push odrzuci, przenieść do „Wymaga właściciela”).
8. **SEO:** metadane i opisy per strona, `sitemap.xml`, `robots.txt`, obrazy OG z aktualnymi
   liczbami (`next/og`), liczby w HTML z serwera, nie tylko po hydratacji.
9. **Kalkulator „Twoja inflacja”:** własny koszyk na wagach COICOP z DBW.
10. **Polska na tle UE:** HICP, bezrobocie, PKB z Eurostatu dla PL / strefy euro / sąsiadów.
11. **Monitoring błędów przeglądarki** bez zewnętrznych usług: `/api/client-errors` → Firestore,
    licznik na `/status`.
12. **Dostępność:** kontrasty, `aria-*`, nawigacja klawiaturą, czytniki ekranu na wykresach.
13. **Wydajność:** Lighthouse mobile, rozmiar bundla, leniwe ładowanie wykresów.

### Japonia (krok po kroku, każdy krok porządnie od początku)
J0. **20.11.2026 (CPI za październik):** do 15:00 JST `jp-cpi` i `jp-cpi-breakdown` = ok z okresem 2026-10,
    cron `jp` z wpisem (kryterium 17 specyfikacji rozbicia) — wynik dopisać tutaj.
J1. **30.10.2026 (Tokio, wstępne za październik):** sprawdzić, czy Statistics Dashboard dostaje odczyt
    wstępny (`@isProvisional = 1`) tego samego dnia. Jeśli nie — wstępne Tokio z e-Stat API
    (wymaga `ESTAT_APP_ID`, darmowa rejestracja — właściciel) albo z komunikatu Statistics Bureau.
J2. **Kolejne wskaźniki Japonii** (po jednym na krok): stopa BOJ i USD/JPY (API Banku Japonii, bez
    klucza, dopisek + e-mail do BOJ przy starcie), bezrobocie, rentowność JGB 10Y (CSV Ministerstwa Finansów).
J3. **Przegląd Japonii** (hero jak w PL), gdy będą ≥3 wskaźniki.

## Wymaga właściciela (nie da się z kodu)
- **`CRON_SECRET`** w Vercelu (Settings → Environment Variables) — bez niego crony może wywołać każdy.
- **`ALERT_WEBHOOK_URL`** (Slack/Discord) — alert, gdy kontrola świeżości wykryje problem.
- **savori.com:** przypięte do projektu w Vercelu, ale DNS wskazuje na inny serwer (Linode) —
  usunąć z projektu albo przepiąć DNS na Vercel (wtedy dostanie też certyfikat).
- **HSTS preload** (opcjonalnie, praktycznie nieodwracalne): po tygodniu bez problemów z nagłówkiem
  HSTS dopisać `preload` i zgłosić domenę na hstspreload.org.
- **`GUS_BDL_KEY`** — wyższy limit BDL (rejestracja na api.stat.gov.pl).

## Zrobione
- **24.10.2026 — `?refresh=1` z limitem na klucz** (`docs/specs/2026-10-24-refresh-limit.md`): wymuszone
  odświeżenie w `withCache` idzie do źródła najwyżej raz na 10 min na klucz cache (`FORCED_REFRESH_MIN_AGE_MS`),
  bez sekretu. Dotyczy wszystkich tras z `refresh=1`, także `/api/news`. Testy w `tests/server-cache.test.ts`.
  Zmiana ogranicza powtórzenia na jednym kluczu, ale nie jest budżetem GUS (dalsze kroki: pozycja 1a/1b).
- **24.10.2026 — Japonia: „Co napędza inflację”** (krok 1 rozbicia, PM: FIX → SHIP): schody od miary bez
  żywności i energii do CPI ogółem (różnice oficjalnych miar, nie wkłady), zdanie-wniosek w sekcji i hero,
  wykres 2L/5L, seria `exFoodEnergy`, świeżość `jp-cpi-breakdown`, limit czasu 51,2 s < 60 s.
- **24.10.2026 — Japonia: inflacja CPI** (`/japonia`): przełącznik PL/JP w nagłówku, 4 miary (ogółem,
  bazowa, bez energii, Tokio), cel BOJ 2%, kalendarz publikacji 8:30 JST, kontrola świeżości `jp-cpi`,
  cron `jp`, walidacja serii, refresh=1 z limitem 10 min, liczby w HTML (ISR). Przy okazji naprawiony
  nagłówek desktopu, który przy 1280 px wychodził poza ekran.
- **24.10.2026 — nagłówki bezpieczeństwa:** CSP (tylko źródła, których strona używa), HSTS
  z subdomenami, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`,
  `Permissions-Policy`, `Cross-Origin-Opener-Policy` (`next.config.ts`). Certyfikat TLS
  (`*.savori.space`, Let's Encrypt) był już wcześniej — Vercel odnawia go automatycznie.
- **15.10.2026 — CPI „Nowy odczyt” w dniu publikacji; kursy NBP odświeżane po 12:15** (PR #25).
- **03–05.10.2026 — crony naprawdę odświeżają dane** (PR #22–#24): dziennik przebiegów, publiczna
  domena zamiast adresu za logowaniem Vercela.
