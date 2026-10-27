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
   **Krok 1 zrobiony 24.10** (różnice miar, PM: SHIP). **Krok 2 zrobiony 26.10** — oficjalne wkłady
   寄与度 z publicznego pliku e-Stat (tabela 5, bez `ESTAT_APP_ID`): 10 grup, towary/usługi, świeża żywność,
   energia, ryż. Dalsze pozycje koszyka (setki) zostają w pliku, nie na stronie.

### Bezpieczeństwo i niezawodność
1. **Publiczne trasy GUS mogą wyczerpać limit DBW** (~100 żądań / 15 min, crony dostają wtedy 429).
   **Crony CPI nie kończą się w czasie.** Limit 10 min na klucz (zrobiony 24.10) ogranicza tylko powtórzenia
   na jednym kluczu i nie jest budżetem GUS. Kroki:
   - **1a — zrobione 25.10.2026** (specyfikacja `docs/specs/2026-10-25-gus-parametry-i-limit-czasu.md`, wpis
     w „Zrobione”). Kontrola produkcyjna crona CPI 13.11.2026 — pozycja P0.
   - **1b — zrobione 25.10.2026** (specyfikacja `docs/specs/2026-10-25-gus-odswiezanie-tylko-cron.md`, wpis
     w „Zrobione”). Kontrola przebiegów cronów 26.10 po 16:40 UTC i 13.11 (P0).
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

### Płatna platforma
P-2. ~~API za bramką~~ — działa od 25.10.2026 (`CRON_SECRET` ustawiony, `/api/*` bez sesji = 401). Wymuszone
     odświeżenie GUS tylko dla cronów — 1b, zrobione 25.10.2026.
P-3. **Konto**: strona „Mój dostęp” (plan, do kiedy, przedłuż), usunięcie konta (RODO), automatyczne usuwanie kont
     nieaktywnych (np. 24 mies.) — wtedy zaktualizować `/prywatnosc` §7. Część „plan, do kiedy, przedłuż” zrobiona
     25.10 w menu konta i `/ustawienia` (`AccessLine`); zostaje strona, usunięcie konta i auto-usuwanie.
P-4. **Dostęp zamrożony w ciasteczku sesji — została połowa „blokada”.** Kierunek „nadanie dostępu” zamknięty 25.10
     (`docs/specs/2026-10-25-platnosci-smooth.md`): `GET /api/auth/session` czyta claims ciasteczka, `PUT` odnawia je
     po cichu po dobie (ważne ciasteczko + świeży token tej samej osoby; `revoke-admin` wykonuje), `/start?dostep=wygasl`
     sam odnawia i wraca na `from`, `confirm` wystawia nowe ciasteczko po płatności. Zostaje kierunek „odebranie”:
     Edge nie sprawdza unieważnienia, więc po `revokeRefreshTokens` / wyłączeniu konta stare ciasteczko przechodzi
     bramkę do 5 dni (GET/PUT widzą unieważnienie od razu — UI pokaże „sesja wygasła”, ale strony się otworzą);
     ciche odnowienie sprawia, że ciasteczko żyje, dopóki użytkownik odwiedza serwis co ≤5 dni. Do zrobienia:
     krótsze ciasteczko (np. 24 h) skoro odnawianie już jest, a blokada konta = `revokeRefreshTokens` + wpis
     w `/status`. Znane: po BLIK-u przy zamkniętej karcie etykieta „Dostęp do …” odświeża się do 24 h.
P-5. **Watchlista — drobiazgi z recenzji PM 25.10** (niewstrzymujące). Zrobione w tym samym PR: `localStorage`
     w `try` (getter rzuca `SecurityError` przy zablokowanej pamięci), ścieżka `dirty` przy koncie bez dokumentu bierze
     listę sprzed logowania (`account ?? legacy`, test), wspólny `sameOrigin` dla `/api/auth/session` i `/api/me/*`;
     „istnieje, nie otwiera się” loguje już `fromStored` (`[data-seal] savori_users/…`). Zostaje: `activate` ma wysłać
     zaległe kliknięcia także, gdy zapis właśnie trwa (wymaga kolejki per konto). Po wdrożeniu: kryterium 7
     specyfikacji (konsola Firebase → `savori_users/{uid}` z `sealed`; drugie urządzenie = ta sama lista; drugie
     konto = pusta) — wynik dopisać tutaj.

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
J2. **Kolejne wskaźniki Japonii.** Stopa BOJ, call, USD/JPY, JGB 10Y (`/japonia/rynki`) i bezrobocie
    (`/japonia/praca`) — zrobione 27.10. Właściciel: jednorazowy e-mail do Banku Japonii, że używamy BOJ Time-Series Data Search.
    Kalendarz Labour Force Survey w `src/lib/jp/labour.ts` sięga lutego 2027 — dopisać przed majem 2027.
J3. **Przegląd Japonii** — zrobione 27.10. `/japonia` rankinguje CPI, bezrobocie, jen i JGB
    (świeżość z kalendarzy Japonii, cel BOJ 2%). Inflacja jest na `/japonia/inflacja`.
    Ceny producenta też 27.10: wrzesień, wstępne, +6,8% r/r, indeks 135,7.
    Ceny usług dla firm też 27.10: wrzesień, wstępne, +3,7% r/r, indeks 115,5.
J4. **Płace w Japonii** — zrobione 27.10. Na `/japonia/praca` nominalne 3,9% i realne 1,6% za sierpień
    (komunikat końcowy, zakłady od 5 osób). Kalendarz 確報 w `src/lib/jp/wages.ts` sięga grudnia 2026.
J5. **Gospodarka Japonii** — produkcja zrobiona 27.10 (`/japonia/gospodarka`: sierpień 101,9, −2,4% m/m).
    Sprzedaż detaliczna też 27.10: 13 072 mld jenów, +2,9% r/r z poziomów (komunikat końcowy 15.10).
    PKB też 27.10: II kwartał 2026, drugi komunikat, realny +0,4% i nominalny +1,3% wobec poprzedniego kwartału.
    Przegląd od 27.10 rankinguje też płace, produkcję, sprzedaż, PKB i obroty bieżące.
    Dochód pierwotny też 27.10: sierpień, 5 133,2 mld jenów, +910,5 mld r/r.
    Usługi też 27.10: sierpień, deficyt 115,8 mld jenów, o 150,9 mld mniejszy niż rok wcześniej.
    Zamówienia maszyn też 27.10: sierpień, +5,2% m/m sezonowo, +18,6% r/r.
    Nowe mieszkania też 27.10: sierpień, 63 974, +6,1% r/r, skala roku 753 108.

## Wymaga właściciela (nie da się z kodu)
- **Płatna platforma — uruchomienie** (kod gotowy 25.10, bramka wyłączona do czasu flag):
  1. Vercel → Environment Variables (Production): `NEXT_PUBLIC_OWNER_NAME` (imię i nazwisko / firma),
     `NEXT_PUBLIC_OWNER_ADDRESS`, `NEXT_PUBLIC_CONTACT_EMAIL`, opcjonalnie `NEXT_PUBLIC_OWNER_NIP` — trafiają do
     `/prywatnosc` i `/regulamin` (brak adresu widać jako „do uzupełnienia” w treści; baneru „wersja robocza” nie ma). Przegląd obu dokumentów przez prawnika.
  2. `ADMIN_EMAILS` = Twój e-mail Google (stały dostęp), opcjonalnie `TRIAL_DAYS` (domyślnie 7) i `TRIAL_ID_KEY`
     (`openssl rand -base64 32`, stały — identyfikuje wykorzystane okresy próbne; bez niego używany jest klucz
     szyfrowania, a jego rotacja dałaby wszystkim drugi okres próbny).
  3. ~~Flagi~~ — od 25.10.2026 logowanie i bramka są domyślnie włączone w kodzie (`src/lib/auth/flags.ts`):
     niezalogowani widzą stronę startową z cennikiem. Awaryjne wyłączenie bez zmiany kodu:
     `NEXT_PUBLIC_AUTH_REQUIRED=false` (strona publiczna, logowanie zostaje) → Redeploy. **`CRON_SECRET`** zamyka też API (bez niego `/api/*` zostaje publiczne,
     bo crony wołają własne endpointy — z sekretem podpisują się nim).
  3a. Rejestracja e-mailem jest na `/start` i `/login` (zostaw „Enable create (sign-up)” włączone). Okres próbny
     tylko po potwierdzeniu adresu — surowe `accounts:signUp` bez kliknięcia linku nie dostaje `accessUntil`.
  4. **Stripe — dokończenie po stronie konta** (kod jest; bez sekretu webhooka płatność kartą wraca na stronę
     i księguje się przez `confirm`, ale zamknięta karta nie przedłuży dostępu, a **BLIK i Przelewy24 nie zadziałają
     wcale** — przy powrocie są jeszcze `unpaid`, dostęp nadaje dopiero drugi webhook):
     - Developers → Webhooks → endpoint `https://savori.space/api/stripe/webhook`, **oba** zdarzenia:
       `checkout.session.completed` **i** `checkout.session.async_payment_succeeded` (bez drugiego BLIK/P24 nigdy
       nie nadadzą dostępu — klient po 3 min zobaczy „płatność jeszcze nie doszła”, choć pieniądze zeszły).
       Nie podpinać innych zdarzeń — każde `checkout.session.*` poza tymi dwoma ląduje na `/status` jako „odrzucona sesja”.
     - Po wdrożeniu: Developers → Webhooks → „Send test webhook” i sprawdzić kartę „Płatności” na `/status`
       (zły podpis / brak sekretu / zły tryb widać tam od razu; „brak zdarzeń” = nic nie doszło).
     - Signing secret → Vercel `STRIPE_WEBHOOK_SECRET` (*Sensitive*) → Redeploy. Klucz prywatny czytamy z
       `STRIPE_SECRET_KEY` (albo `STRIPE_PRIVATE_KEY` / `STRIPE_API_KEY` / `STRIPE_SECRET`) — ma to być `sk_live_…`.
     - Włącz metody: karta, BLIK, Przelewy24. Włącz pokwitowania e-mail (Customer emails → successful payments).
     - Forma sprzedaży (działalność nierejestrowana albo JDG) zostaje po stronie księgowości.
- **Logowanie przez Google — włączenie** (kod gotowy, strona zostaje publiczna):
  1. Konsola Firebase (`aplikacja-prawnicy`) → Authentication → Sign-in method → Google → Enable, e-mail pomocy → Save.
  2. ~~Authorized domains~~ — `savori.space` jest na liście (sprawdzone 25.10, publiczny `getProjectConfig`). `www` robi 307 na apex, więc osobnego wpisu nie potrzebuje. Okno Google nadal mówi „aplikacja-prawnicy.firebaseapp.com”, bo handler OAuth stoi na authDomain Firebase, nie na Vercelu. Żeby było „savori.space”, potrzebna jest własna domena auth w Firebase Hosting (DNS) — sam `authDomain` w kodzie na Vercel zepsuje logowanie (brak `/__/auth/handler`).
  3. ~~Flaga~~ — logowanie jest domyślnie włączone w kodzie (25.10.2026), razem z bramką (patrz „Płatna platforma”).
  4. Konto serwisowe musi mieć rolę „Firebase Authentication Admin” (punkt 2 niżej), inaczej sesja = 401.
  5. **Przed ustawieniem flagi** (Google = otwarta rejestracja: każde konto Google tworzy użytkownika):
     informacja o prywatności (RODO art. 13: Firebase/Google jako podmiot przetwarzający; na Safari i telefonach
     przy włączonym logowaniu każda strona ładuje `apis.google.com` i ukryty iframe authDomain — jak Google Fonts,
     ale trzeba to napisać), klucz API ograniczony po Referer do `savori.space/*` **i** `aplikacja-prawnicy.firebaseapp.com/*` (handler okna
     Google na authDomain używa tego klucza — bez niego logowanie Google przestanie działać), App Check,
     z Authorized domains usunąć `localhost` i nieużywane domeny.
  6. ~~Bramka~~ — zrobione w PR #34 (claims `accessUntil` + weryfikacja podpisu sesji na Edge); włączona
     domyślnie 25.10.2026.
- **Ochrona danych — po kolei** (specyfikacja `docs/specs/2026-10-25-ochrona-danych.md`; recenzja bezpieczeństwa):
  1. **Jeden projekt Firebase na aplikację — przed kluczem.** Produkcja Savori używa `aplikacja-prawnicy`
     (sprawdzone w kodzie strony 25.10). Repo wdraża się też do projektu Vercela `lexcapital-pro`: sprawdzić, czy ma
     te same `FIREBASE_*`. Jeśli tak — rozdzielić projekty albo dać mu ten sam klucz z kroku 3 (inaczej obie
     aplikacje nadpisują sobie cache). Migracja dotyka wyłącznie kolekcji Savori (`CACHE_COLLECTIONS`, `health/*`
     i od 25.10 `savori_users` — kolekcja z przedrostkiem, więc cała jest nasza).
  2. **Konto serwisowe** (Google Cloud → IAM): zamiast Editor/Owner dwie role — „Cloud Datastore User” i
     „Firebase Authentication Admin” (bez tej drugiej `/api/auth/session` zawsze zwróci 401, `GET` odpowie
     `{ signedIn: false }`, a klient będzie pokazywał „Sesja wygasła — zaloguj się ponownie” w pętli:
     `verifyIdToken`/`verifySessionCookie` z `checkRevoked` i `createSessionCookie` jej wymagają). `FIREBASE_PRIVATE_KEY` jako *Sensitive*.
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
- **Usunięcie konta na prośbę użytkownika (RODO art. 17)** — do czasu P-3 ręcznie, w tej kolejności: konsola Firebase
  (`aplikacja-prawnicy`) → Authentication → Users → użytkownik → „Delete account” (skopiować wcześniej jego **UID**),
  potem Firestore Database → kolekcja `savori_users` → dokument o tym UID → usuń (to lista obserwowanych; `/prywatnosc`
  obiecuje „usuwamy ją razem z kontem”) **oraz** kolekcja `savori_access` → dokument o tym UID → usuń (koniec dostępu
  i plan; `/prywatnosc` §7: „dane konta — do usunięcia konta”). Dokumenty `payments/{cs_…}` zostają (dokument sprzedaży,
  5 lat). Dokument `trials/{HMAC(e-mail)}` zostaje celowo (okres próbny raz na adres —
  tak opisuje go `/prywatnosc`). Pomocnik w kodzie: `deleteUserData()` w `src/lib/user-data-server.ts`.
- **`ALERT_WEBHOOK_URL`** (Slack/Discord) — alert, gdy kontrola świeżości wykryje problem.
- **savori.com:** przypięte do projektu w Vercelu, ale DNS wskazuje na inny serwer (Linode) —
  usunąć z projektu albo przepiąć DNS na Vercel (wtedy dostanie też certyfikat).
- **HSTS preload** (opcjonalnie, praktycznie nieodwracalne): po tygodniu bez problemów z nagłówkiem
  HSTS dopisać `preload` i zgłosić domenę na hstspreload.org.
- **Decyzja: usunąć `/api/gus-cpi` i `/api/dbw`?** Nic w serwisie ich nie czyta (PM, 25.10). Po 1a są
  zablokowane walidacją; usunięcie to mniej kodu, ale rutyna nie usuwa funkcji bez zgody.
- **`GUS_BDL_KEY`** — wyższy limit BDL (rejestracja na api.stat.gov.pl).

## Zrobione
- **28.10.2026 — Japonia: skład nowych mieszkań.** Pod sumą 63 974: własne 17 713 (+1,0% r/r), na wynajem 28 309 (+6,5%), na sprzedaż 16 838 (+6,4%). Reszta to mieszkania służbowe. Cache `jp_data/housing_v2`.
- **27.10.2026 — Japonia: nowe mieszkania.** Na `/japonia/gospodarka`: sierpień 2026, 63 974 rozpoczęte budowy, +6,1% r/r. Skala roku po sezonie: 753 108, −2,7% wobec lipca. Komunikat Ministerstwa Ziemi z 30.09, 14:00. Świeżość `jp-housing`. Wrzesień: 30 października.
- **27.10.2026 — Japonia: zamówienia maszyn.** Na `/japonia/gospodarka`: sierpień 2026, popyt prywatny bez statków i energetyki, +5,2% m/m po wyrównaniu sezonowym i +18,6% r/r bez korekty. Poziom 1 069,8 mld jenów. Komunikat Gabinetu z 15.10, 8:50. Świeżość `jp-orders`. Wrzesień: 19 listopada.
- **27.10.2026 — Japonia: ceny usług dla firm.** Na `/japonia/inflacja` pod cenami towarów: wrzesień 2026, wstępne, +3,7% r/r (sierpień po korekcie 3,5%). Indeks 115,5, baza 2020, +0,3% wobec sierpnia. Komunikat Banku Japonii z 27.10, 8:50. Świeżość `jp-sppi`.
- **27.10.2026 — Japonia: ceny producenta.** Na `/japonia/inflacja`: wrzesień 2026, wstępne, +6,8% r/r (sierpień po korekcie 7,6%). Indeks 135,7, baza 2020, −0,3% wobec sierpnia. Komunikat Banku Japonii z 13.10, 8:50. Świeżość `jp-cgpi`. Październik: 12 listopada.
- **27.10.2026 — Japonia: usługi w bilansie.** Na `/japonia/gospodarka`: sierpień 2026, deficyt usług 115,8 mld jenów, o 150,9 mld mniejszy niż rok wcześniej. Osobno od handlu towarami. Cache `jp_data/trade_v3`.
- **27.10.2026 — Japonia: dochód pierwotny.** Na `/japonia/gospodarka` obok handlu: sierpień 2026, 5 133,2 mld jenów nadwyżki, o 910,5 mld więcej niż rok wcześniej. To ta pozycja trzyma nadwyżkę obrotów bieżących przy deficycie handlu. Cache `jp_data/trade_v2`.
- **27.10.2026 — Japonia: przegląd widzi bilans.** Hero i rząd „Praca i gospodarka” dostają obroty bieżące w mld jenów, z datą wstępnego komunikatu Ministerstwa Finansów. Zmiana salda nie jest podpisana jako punkty procentowe. Kafel pokazuje też deficyt handlu z tego samego miesiąca.
- **27.10.2026 — Japonia: bilans płatniczy.** Na `/japonia/gospodarka` pod PKB: sierpień 2026, komunikat wstępny z 8.10. Nadwyżka obrotów bieżących 4 062 mld jenów, deficyt handlu towarami 687,7 mld. Jednostka źródła to 億円. Świeżość `jp-trade`. Wrzesień: 10 listopada, 8:50 JST.
- **27.10.2026 — Japonia: przegląd widzi gospodarkę.** Hero na `/japonia` dostaje płace, produkcję (zmiana indeksu), sprzedaż r/r i PKB realny, z datami ich własnych komunikatów. Jen i JGB dalej tylko przy ruchu ≥2σ.
- **27.10.2026 — Japonia: PKB.** Na `/japonia/gospodarka` pod sprzedażą: II kwartał 2026, drugi komunikat z 8.09. Realny +0,4% i nominalny +1,3% wobec poprzedniego kwartału (nie w skali roku). Świeżość `jp-gdp`. III kwartał, drugi komunikat: 8 grudnia.
- **27.10.2026 — Japonia: sprzedaż detaliczna.** Na `/japonia/gospodarka` pod produkcją: 13 072 mld jenów za sierpień 2026, +2,9% r/r liczone z poziomów po komunikacie końcowym z 15.10. Wstępne 13 052 mld i +2,7% nie wchodzą. Stopa wobec 2024 nie jest liczona — od stycznia 2025 jest nieciągłość po spisie. Świeżość `jp-retail`.
- **27.10.2026 — Japonia: produkcja przemysłowa.** `/japonia/gospodarka`: indeks METI, baza 2020. Sierpień 2026 po korekcie: 101,9, −2,4% wobec lipca, +2,7% r/r. Wstępne −1,7% nie wchodzi. Świeżość `jp-industry`. Komunikat końcowy o 13:30 JST.
- **27.10.2026 — Japonia: płace.** Na `/japonia/praca` płace z Monthly Labour Survey: nominalne 3,9% r/r i realne 1,6% r/r za sierpień 2026 (komunikat końcowy z 23.10, zakłady od 5 osób; realne wobec CPI bez czynszu właściciela). Wstępne 3,8% z 7.10 nie wchodzi. Świeżość `jp-wages`.
- **27.10.2026 — Japonia: przegląd.** `/japonia` pokazuje dwa najważniejsze sygnały (świeżość publikacji × skala zmiany; jen i JGB tylko przy ruchu ≥2σ) oraz kafle CPI, bezrobocia, USD/JPY, stopy BOJ i JGB 10Y. Inflacja przeniesiona na `/japonia/inflacja`.
- **27.10.2026 — Japonia: bezrobocie.** `/japonia/praca`: stopa z komunikatu Labour Force Survey, wyrównana sezonowo 2,5% za sierpień 2026, obok surowa 2,6%. Statistics Dashboard bez klucza; nazwa serii jest ta sama, więc parser wymaga znacznika sezonowego. Świeżość `jp-labour`, cron `jp` i `refresh`. Wrzesień wychodzi 30.10 o 8:30 JST.
- **27.10.2026 — Japonia: JGB 10Y.** Na `/japonia/rynki` krzywa i 10-latka z CSV Ministerstwa Finansów. 26.10.2026: 2,824%. Historia do września z pliku angielskiego, październik z pliku bieżącego miesiąca (daty Reiwa). Świeżość `jp-jgb`.
- **27.10.2026 — Japonia: rynki.** `/japonia/rynki`: USD/JPY o 17:00 Tokio (156,96 jena na 23.10.2026), stopa BOJ 1,50% (basic loan rate) i call overnight 1,227%. API Banku Japonii bez klucza, walidacja nazwy serii, świeżość `jp-usdjpy`, cron `jp` i `refresh`. Zakładka Inflacja nie świeci się na tej stronie.
- **26.10.2026 — Japonia: oficjalne wkłady CPI.** `/japonia` pokazuje 寄与度 z tabeli 5 (e-Stat, plik xlsx, bez klucza): 10 grup koszyka, towary i usługi, świeża żywność, energia, ryż. Wrzesień 2026: żywność +0,77 p.p., ryż −0,21 p.p. przy CPI 2,1%. Różnice miar zostają osobno i nie nazywają się wkładem. Cache `jp_data/cpi_contributions_v1`, świeżość `jp-cpi-contributions`, cron `jp` i `refresh`.
- **26.10.2026 — rejestracja e-mailem.** Na `/login` i `/start`: „Nie masz konta? Załóż je” (e-mail, hasło, powtórzenie, min. 8 znaków). Link weryfikacyjny, bez ciasteczka sesji do kliknięcia. Logowanie przed potwierdzeniem nie zapisuje `accessUntil` (inaczej okres próbny przepadłby). Po potwierdzeniu zwykłe logowanie nadaje trial jak dotychczas.
- **25.10.2026 — logowanie: od wejścia na stronę do formularza.** Niezalogowany z podstrony (`/ceny`) ląduje na `/start?from=…#logowanie`, nie na hero. Zablokowany popup Google przechodzi na przekierowanie w tej samej karcie (`getRedirectResult` dokleja ciasteczko po powrocie). „Nie pamiętam hasła” wysyła link; brak konta brzmi tak samo jak sukces. Nowe konto jest przez Google — formularz e-mail to mówi wprost. „Zaloguj się ponownie” przewija do formularza, nie otwiera od razu Google.
- **25.10.2026 — 1b: wymuszone pobranie z GUS DBW/BDL tylko z `CRON_SECRET`**
  (PR #39, `docs/specs/2026-10-25-gus-odswiezanie-tylko-cron.md`). `canForceUpstream` (`src/lib/access.ts`) w 8 trasach
  (`gus-cpi-full`, `gus-ppi-full`, `gus-koniunktura`, `dbw-series`, `gus-cpi`, `gus-monthly`, `bdl-series`,
  `regional-gus`): publiczne `refresh=1` = zwykły TTL i ten sam klucz, crony (`internalInit`) dalej wymuszają.
  Przycisk „Aktualizuj” na CPI/PPI **został** (granica rutyny: nie usuwać funkcji) — czyta już tylko cache
  odświeżany przez crony, bez `refresh=1`. PM w recenzji: **SHIP**, przycisk zostaje (zapytania GUS mają
  `staleTime` 24 h, więc bez niego otwarta karta nie zobaczy odczytu z crona do przeładowania). Propozycja usunięcia
  wycofana. Wyjście awaryjne przy spóźnionej publikacji: Vercel → Settings → Cron Jobs → `dbw-1` → Run.
- **25.10.2026 — `CRON_SECRET` ustawiony przez właściciela** (`/api/*` bez sesji odpowiada 401, crony przechodzą
  bramkę z `Authorization: Bearer`). Krok 1b odblokowany.
- **25.10.2026 — 1a: trasy GUS DBW przyjmują tylko znane parametry, crony CPI mieszczą się w czasie**
  (PR #38, `docs/specs/2026-10-25-gus-parametry-i-limit-czasu.md`, PM: SHIP). Walidacja przed cache i GUS (`src/lib/gus-params.ts`,
  400 + `no-store`): `year` = bieżący i poprzedni rok w Warszawie (31.12 także następny) w `gus-cpi-full`,
  `gus-ppi-full`, `gus-koniunktura`, `dbw-series`, `gus-cpi`; `dbw-series` tylko 6 serii z `DBW_SERIES`;
  `gus-monthly` tylko `years=4`; `refresh=1` wymusza tylko rok bieżący. `/api/gus-cpi` i `/api/dbw` zablokowane
  walidacją (bez usuwania), `gus-cpi` wypadło z crona `dbw-3`. Limity czasu z `export const maxDuration`
  (`gus-cpi-full` 120 s, `gus-koniunktura`/`dbw-series` 60 s, crony DBW 140–200 s); `vercel.json` ma już tylko
  domyślny glob — wpisy pod nim były martwe i `gus-cpi-full` dostawało 504 po 30 s. Ścieżki powstają tylko
  w `src/lib/gus-api-paths.ts` (hooki nie wysyłają roku z zegara urządzenia), listy cronów w
  `src/lib/cron-endpoints.ts`. Klucze cache bez zmian. Testy: `gus-params`, `gus-routes`, `function-limits`.
- **25.10.2026 — płatności i sesja „smooth”** (`docs/specs/2026-10-25-platnosci-smooth.md`, prośba właściciela;
  **PM: FIX → SHIP**): sesja nie wypada po 5 dniach — `GET /api/auth/session` (claims ciasteczka) i `PUT` (ciche
  odnowienie po dobie: ważne ciasteczko + świeży token tej samej osoby, 401/403/`{refresh}`, `revoke-admin`),
  `useAccess()` z etykietą „Okres próbny do … / Dostęp do … / Kończy się dziś/jutro o … / Przedłuż” w menu, arkuszu
  i `/ustawienia`; bramka zachowuje `from` przy wygaśnięciu, a `/start?dostep=wygasl` sam odnawia ciasteczko i wraca,
  gdy webhook już nadał dostęp. Powrót ze Stripe: silnik `payment-return.ts` (BLIK/P24 odpytywane co 4 s przez 3 min,
  logowanie na adresie powrotu dokańcza płatność po `sessionReady`, każdy stan z przyciskiem), pasek stanu pod
  nagłówkiem, lepki przycisk nie ucieka na `/`. Księgowanie: jedna transakcja `payments/{cs}` + `savori_access/{uid}`
  (dwie równoległe sesje sumują miesiące), `pending` tylko dla `unpaid`+`open|complete`, rabat odrzuca, limit 10 s
  na Stripe, klucz idempotencji z sufiksem przy ukończonej sesji. Obserwowalność: `health/stripe_webhook` i karta
  „Płatności” na `/status` (zły podpis / brak sekretu / zły tryb / brak użytkownika; zdarzenia bez podpisu najwyżej
  raz na 10 min). `deleteUserData()` usuwa też `savori_access`. Testy: `session-route`, `session-info`,
  `payment-return`, rozszerzone `stripe`. Zostało właścicielowi: punkt 4 listy „Płatna platforma” (oba zdarzenia webhooka).
- **25.10.2026 — P-1 płatności Stripe** (prośba właściciela: klucz prywatny już na Vercelu, dodać trasę): Checkout
  jednorazowy 10/20/30 zł (`/api/stripe/checkout`), webhook z podpisem i idempotencją (`/api/stripe/webhook`,
  zapis `payments/{session}` przez `toStored`), przedłużenie `accessUntil` od późniejszej z dat, odświeżenie
  ciasteczka po powrocie (`/api/stripe/confirm`). Pokwitowanie z informacją o odstąpieniu idzie przez Stripe
  (`receipt_email`). Zostało właścicielowi: `STRIPE_WEBHOOK_SECRET` i metody płatności (punkt 4 wyżej).
- **25.10.2026 — dane użytkownika na koncie** (`docs/specs/2026-10-25-dane-uzytkownika.md`, prośba właściciela;
  **PM: SHIP** po jednej rundzie FIX — PUT dopiero po udanym odczycie konta, `tests/watchlist-store.test.ts`):
  watchlista należy do konta (`savori_users/{uid}`, zapis tylko przez serwer po weryfikacji ciasteczka sesji,
  treść szyfrowana jak reszta bazy), ta sama na każdym urządzeniu; dwa konta w jednej przeglądarce nie widzą swoich
  list; lista sprzed logowania przenosi się na konto przy pierwszym logowaniu. `localStorage` tylko jako kopia.
  Przy usuwaniu konta na prośbę użytkownika usunąć też `savori_users/{uid}`.
- **25.10.2026 — płatna platforma, etap 1** (prośba właściciela): strona startowa `/start` z logowaniem i cennikiem
  10/20/30 zł (1/3/6 mies., jednorazowo), bramka z kryptograficzną weryfikacją sesji (podrobione ciasteczko nie
  przechodzi), okres próbny i dostęp administratora w claims, `/prywatnosc` (RODO) i `/regulamin`, czcionka z własnej
  domeny (koniec wysyłania IP do Google Fonts). Włączenie: lista „Płatna platforma — uruchomienie”.
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
