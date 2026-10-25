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
1. **Publiczne trasy GUS mogą wyczerpać limit DBW** (~100 żądań / 15 min, crony dostają wtedy 429).
   **Crony CPI nie kończą się w czasie.** Limit 10 min na klucz (zrobiony 24.10) ogranicza tylko powtórzenia
   na jednym kluczu i nie jest budżetem GUS. Kroki:
   - **1a (bez klucza, w toku; specyfikacja `docs/specs/2026-10-25-gus-parametry-i-limit-czasu.md`).**
     Walidacja: `year` = bieżący i poprzedni rok wg Warszawy (31.12 także następny) w `gus-cpi-full`,
     `gus-ppi-full`, `gus-koniunktura` i `dbw-series`. `dbw-series` przyjmuje tylko 6 serii z konfiguracji.
     `gus-monthly` przyjmuje tylko `years=4`. Zły parametr daje 400 bez GUS i bez cache. Nieużywane
     `/api/gus-cpi` i `/api/dbw` (otwarte proxy DBW) zablokowane walidacją, nie usunięte — usunięcie czeka
     na decyzję właściciela. Do tego naprawa 504:
     - `dbw-1` (`gus-cpi-full`) i `dbw-3` (`gus-cpi`) są ucinane po 30 s. `vercel.json` bierze pierwszy pasujący
       wzorzec, więc wpis 120 s pod globem 30 s był martwy.
     - Działa tylko `export const maxDuration`.
     - Wymuszone odświeżenie CPI z crona nie zapisywało się, a CPI docierało przez Data Cache przy wizytach.

     Dziś `/api/gus-cpi-full?year=1` to 8152 wywołania DBW na jedno GET. `sub100=0` / `poz1` w `dbw-series`
     nadpisywały cache Przeglądu.
   - **1b: wymuszone odświeżenie GUS DBW/BDL tylko z `CRON_SECRET`** (`Authorization` z `internalInit`).
     Publiczne `refresh=1` ma wtedy zwykły TTL, a przycisk „Aktualizuj” na CPI/PPI nie wysyła `refresh=1`.
     Po 1a `refresh=1` na kluczach bieżącego roku daje nadal ~279 wywołań DBW / 10 min. Wymaga ustawienia
     `CRON_SECRET` przez właściciela.
   - **1c: walidacja tras GUS BDL** (limit BDL bez klucza: ~5 żądań/s, ~100 / 15 min):
     - `bdl-series`: dowolne `start`/`step`/`year`/`freq` tworzą dowolne klucze;
     - `gus-labor-extra` `year`, `regional-gus`, `gus-regional`, `smup`;
     - cron `bdl`: 8 tras × 30 s > `maxDuration` 120 s. Przy wolnym BDL cron zostanie ucięty, zanim zapisze
       przebieg (ta sama reguła co A3 w 1a).
2. **`/status` ukrywa częściowe awarie cronów.** `evaluateCronRuns` daje „ok” przy `ok ≥ total/2`, więc
   `dbw-1` z `gus-cpi-full → 504` był zielony, choć CPI z crona się nie odświeżało. Potrzebny stan pośredni
   („częściowo”) przy każdej nieudanej trasie i ostrzeżenie w `/api/health/freshness`. Do tego czas każdej
   trasy w dzienniku (dziś jest tylko suma).
3. **CORS na `/api/*`:** `Access-Control-Allow-Origin: *` z metodami POST/PUT/DELETE/PATCH
   (`vercel.json`). Zawęzić do GET/OPTIONS; POST tylko dla parsera z własnej domeny.
4. **`news-digest` nie zapisuje przebiegu** w `health/cron_runs` — `/status` nie pokazuje, czy działa.
5. **Lint:** ~21 starych błędów w `src/lib/firebase/*` i hookach — wyczyścić, potem lint w CI.
6. **`/api/news?refresh=1` przy każdym wywołaniu zapisuje archiwum dzienne do Firestore**, także wtedy,
   gdy feed przyszedł z cache. Pętla zjada limit zapisów Firestore. Scalać tylko przy świeżym pobraniu
   albo najwyżej raz na N minut.

### Polska: terminy i kontrole
P0. **13.11.2026 (CPI za październik, komunikat 10:00):** po wdrożeniu 1a, do 11:00 UTC przebieg `dbw-1` ma
    `failed: []`, a świeżość `cpi` = ok z okresem 2026-10. Liczba zgodna z komunikatem GUS (kryterium 19
    specyfikacji 1a). Wynik dopisać tutaj.
P1. **Kalendarz GUS 2027 do 31.12.2026.** `CPI_PRELIMINARY_PUBLISH` i pozostałe harmonogramy w
    `src/lib/calendar-schedules.ts` mają tylko 2026. Od stycznia świeżość i ranking hero przejdą na heurystykę
    dni. Źródło: kalendarz roczny GUS (stat.gov.pl), zwykle publikowany w grudniu.
P2. **CPI pełne w 2027 do 13.02.2027.** `gus-cpi-full` ma na sztywno `rok: 2026` dla działów i klas
    (przekrój 1698) oraz miesięczny nagłówek od 2026. Od publikacji CPI za styczeń 2027 działy i podkategorie
    stanęłyby na 2026-12, a nagłówek pokazywałby 2027-01. Przed zmianą sprawdzić w katalogu DBW przekroje
    na 2027.
P3. **Przekrój DBW 1698 jest ucięty do 5000 wierszy.** DBW ignoruje `ile-na-stronie=9000` (zwraca `page-size`
    5000, `page-count` 3, 2,44 MB na miesiąc). Czytamy tylko stronę 0, a 4 ze 142 klas COICOP
    (`src/lib/coicop-subcategories.ts`) jej nie mają. Sprawdzić strony 1–2 (2 zapytania) i albo pobierać
    wszystkie strony, albo opisać te klasy jako niepublikowane. Odpowiedź > 2 MB nie trafia też do Data Cache.
   - **Bramka logowania sprawdza tylko obecność ciasteczka** (`src/middleware.ts`): dowolne `__session=x` ją omija,
     gdy `NEXT_PUBLIC_AUTH_ENABLED=true`. Dziś bez skutku (strony to dane publiczne, bramka wyłączona), ale przed
     funkcjami dla zalogowanych: weryfikacja podpisu ciasteczka sesji (JWT, klucze publiczne Google) na Edge albo
     w trasach z danymi użytkownika (`verifySessionCookie(..., true)`).

### Produkt
7. **Szybki szacunek CPI** (ostatni dzień roboczy miesiąca) na Przeglądzie w dniu publikacji —
   dziś strona pokazuje inflację ~15 dni po rynku. DBW go nie dostaje; źródło: komunikat GUS.
8. **CI na GitHub Actions:** `tsc`, `npm test`, `eslint` na każdym PR (może wymagać uprawnienia
   `workflow` dla tokenu — jeśli push odrzuci, przenieść do „Wymaga właściciela”).
9. **SEO:** metadane i opisy per strona, `sitemap.xml`, `robots.txt`, obrazy OG z aktualnymi
   liczbami (`next/og`), liczby w HTML z serwera, nie tylko po hydratacji.
10. **Kalkulator „Twoja inflacja”:** własny koszyk na wagach COICOP z DBW.
11. **Polska na tle UE:** HICP, bezrobocie, PKB z Eurostatu dla PL / strefy euro / sąsiadów.
12. **Monitoring błędów przeglądarki** bez zewnętrznych usług: `/api/client-errors` → Firestore,
    licznik na `/status`.
13. **Dostępność:** kontrasty, `aria-*`, nawigacja klawiaturą, czytniki ekranu na wykresach.
14. **Wydajność:** Lighthouse mobile, rozmiar bundla, leniwe ładowanie wykresów.

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
- **Logowanie przez Google — włączenie** (kod gotowy, strona zostaje publiczna):
  1. Konsola Firebase (`aplikacja-prawnicy`) → Authentication → Sign-in method → Google → Enable, e-mail pomocy → Save.
  2. Authentication → Settings → Authorized domains: dodać `savori.space` (i `www.savori.space`, jeśli używany).
  3. Vercel → Environment Variables → `NEXT_PUBLIC_AUTH_ENABLED=true` (Production) → Redeploy.
     NIE ustawiać `NEXT_PUBLIC_AUTH_REQUIRED` — ona zamyka całą stronę za logowaniem.
  4. Konto serwisowe musi mieć rolę „Firebase Authentication Admin” (punkt 2 niżej), inaczej sesja = 401.
  5. **Przed ustawieniem flagi** (Google = otwarta rejestracja: każde konto Google tworzy użytkownika):
     informacja o prywatności (RODO art. 13: Firebase/Google jako podmiot przetwarzający; na Safari i telefonach
     przy włączonym logowaniu każda strona ładuje `apis.google.com` i ukryty iframe authDomain — jak Google Fonts,
     ale trzeba to napisać), klucz API ograniczony po Referer do `savori.space/*` **i** `aplikacja-prawnicy.firebaseapp.com/*` (handler okna
     Google na authDomain używa tego klucza — bez niego logowanie Google przestanie działać), App Check,
     z Authorized domains usunąć `localhost` i nieużywane domeny.
  6. `NEXT_PUBLIC_AUTH_REQUIRED` (cała strona za logowaniem) ma sens dopiero z listą dozwolonych kont w
     `/api/auth/session` (custom claim albo lista e-maili) i weryfikacją podpisu sesji — inaczej wejdzie każdy
     z kontem Google.
- **Ochrona danych — po kolei** (specyfikacja `docs/specs/2026-10-25-ochrona-danych.md`; recenzja bezpieczeństwa):
  1. **Jeden projekt Firebase na aplikację — przed kluczem.** Produkcja Savori używa `aplikacja-prawnicy`
     (sprawdzone w kodzie strony 25.10). Repo wdraża się też do projektu Vercela `lexcapital-pro`: sprawdzić, czy ma
     te same `FIREBASE_*`. Jeśli tak — rozdzielić projekty albo dać mu ten sam klucz z kroku 3 (inaczej obie
     aplikacje nadpisują sobie cache). Migracja dotyka wyłącznie kolekcji Savori (`CACHE_COLLECTIONS` + `health`).
  2. **Konto serwisowe** (Google Cloud → IAM): zamiast Editor/Owner dwie role — „Cloud Datastore User” i
     „Firebase Authentication Admin” (bez tej drugiej `/api/auth/session` zawsze zwróci 401: `verifyIdToken` z
     `checkRevoked` i `createSessionCookie` jej wymagają). `FIREBASE_PRIVATE_KEY` jako *Sensitive*.
  3. **Klucz szyfrowania:** u siebie `openssl rand -base64 32` (losowy, nie z hasła) → Vercel → Settings →
     Environment Variables → `DATA_ENCRYPTION_KEY`, *Sensitive*, w **tych samych środowiskach co
     `FIREBASE_PRIVATE_KEY`** (jeśli Preview ma `FIREBASE_*`, to także Preview — inaczej podgląd nadpisuje
     produkcję jawną treścią). Kopia w menedżerze haseł; nigdy w czacie, mailu ani repo. Utrata klucza = utrata
     cache (dane wrócą ze źródeł, dziennik cronów zginie). Potem redeploy.
  4. **Reguły Firestore:** konsola Firebase → Firestore Database → Rules → wkleić `firestore.rules` → Publish
     (albo `firebase deploy --only firestore:rules --project aplikacja-prawnicy`). Storage w projekcie nie istnieje
     (bucket 404, 25.10) — nie trzeba nic wdrażać. Odczyt bez logowania produkcja blokowała już 25.10; nowe reguły
     blokują też zalogowanych.
  5. **Tryb ścisły:** gdy `/api/health/freshness` pokaże w `encryption.lastSweep` jednocześnie `legacy: 0`,
     `truncated: false` i `failed: 0` w **dwóch kolejnych** przebiegach (rutyna sprawdzi), dodać
     `DATA_ENCRYPTION_STRICT=1`. Samo `legacy: 0` nie wystarcza — ucięty przebieg też je pokazuje.
  6. **Konta administratora:** passkey albo klucz sprzętowy (2 sztuki) na GitHubie, w Vercelu, na koncie Google
     (Firebase), u rejestratora domeny (Name.com) i na skrzynce do resetów haseł; menedżer haseł; bez SMS.
  7. **Przed otwarciem rejestracji:** Identity Platform (MFA TOTP), App Check, klucz API ograniczony do
     savori.space (Google Cloud Console → Credentials).
- **`CRON_SECRET`** w Vercelu (projekt → Settings → Environment Variables → Production, losowy ciąg
  ≥ 32 znaków; Vercel sam dołącza go do wywołań cronów). Bez niego crony może wywołać każdy, a krok 1b
  (wymuszone odświeżenie GUS tylko dla cronów) nie ruszy. Po 1a publiczne `refresh=1` nadal może dać
  ~279 wywołań DBW / 10 min przy limicie ~100 / 15 min.
- **`ALERT_WEBHOOK_URL`** (Slack/Discord) — alert, gdy kontrola świeżości wykryje problem.
- **savori.com:** przypięte do projektu w Vercelu, ale DNS wskazuje na inny serwer (Linode) —
  usunąć z projektu albo przepiąć DNS na Vercel (wtedy dostanie też certyfikat).
- **HSTS preload** (opcjonalnie, praktycznie nieodwracalne): po tygodniu bez problemów z nagłówkiem
  HSTS dopisać `preload` i zgłosić domenę na hstspreload.org.
- **Decyzja: usunąć `/api/gus-cpi` i `/api/dbw`?** Nic w serwisie ich nie czyta (PM, 25.10). Po 1a są
  zablokowane walidacją; usunięcie to mniej kodu, ale rutyna nie usuwa funkcji bez zgody.
- **`GUS_BDL_KEY`** — wyższy limit BDL (rejestracja na api.stat.gov.pl).

## Zrobione
- **25.10.2026 — ochrona danych** (`docs/specs/2026-10-25-ochrona-danych.md`, prośba właściciela): reguły
  Firestore/Storage bez żadnego dostępu z przeglądarki, drugie szyfrowanie treści w Firestore (AES-256-GCM,
  wykrywa podmianę, rotacja kluczy, migracja jawnych wpisów w cronie `freshness`), klient Firebase tylko do
  logowania, CSP `connect-src` zawężony do logowania Firebase, sesja logowania odporna na login CSRF i stare tokeny.
  Szyfrowanie włącza się po ustawieniu `DATA_ENCRYPTION_KEY` (lista wyżej).
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
