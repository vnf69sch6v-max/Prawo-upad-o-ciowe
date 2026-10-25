# Dane użytkownika przypięte do konta, nie do przeglądarki

- **Pozycja w backlogu:** prośba właściciela (25.10.2026): „każdy użytkownik ma być traktowany jako osobny
  użytkownik i mieć osobne dane”. Priorytet 2 (prośba właściciela), tuż po włączeniu logowania.
- **Zakres:** jedyne dane użytkownika w serwisie — watchlista (gwiazdki na kaflach KPI i spółkach WIG20, pas
  „Obserwowane” na Przeglądzie). Dokument konta w Firestore, trasa `/api/me/watchlist`, hook `useWatchlist`,
  migracja szyfrowania, `/prywatnosc`.
- **Poza zakresem:** własne pulpity / układ kafli (nie istnieją), usuwanie konta z poziomu strony (dziś na prośbę
  do właściciela), rozdzielenie projektu Firebase od drugiej aplikacji (decyzja właściciela: zostaje wspólny).

## Problem

Przed zmianą watchlista żyła w `localStorage` pod jednym kluczem `mk:watchlist:v1`. Skutki po włączeniu logowania
(PR #35):

1. Dwa konta w jednej przeglądarce widziały tę samą listę — gwiazdki „przechodziły” między użytkownikami.
2. To samo konto na telefonie i na komputerze miało dwie różne listy.
3. W Firestore nie było nic per użytkownik; jedyny ślad konta to claims w tokenie i `trials/{HMAC(e-mail)}`.

## Co widzi użytkownik

- Gwiazdki i pas „Obserwowane” wyglądają i działają jak dotąd (telefon: 44 px cel dotyku, bez zmian w UI).
- Po zalogowaniu na drugim urządzeniu lista jest ta sama. Po wylogowaniu i zalogowaniu innym kontem — lista tego
  konta, nie poprzedniego.
- Pierwsze logowanie na urządzeniu, na którym była już lista sprzed logowania: lista przenosi się na konto (raz).
  Jeśli konto ma już swoją listę, wygrywa konto.
- Offline / chwilowy błąd serwera: kliknięcia działają od razu (lokalna kopia), zapis na konto ponawia się
  (15 s, powrót sieci).

## Dane

| Element | Wartość |
|---|---|
| Kolekcja | `savori_users/{uid}` — przedrostek, bo projekt `aplikacja-prawnicy` ma kolekcje drugiej aplikacji (zwykłe `users` mogłoby się zderzyć, a migracja szyfrowania przeglądałaby cudze dokumenty) |
| Treść | `{ watchlist: Array<{ kind: 'wskaznik' \| 'spolka', id }> }`, ≤ 200 pozycji, `id` = `^[A-Za-z0-9][A-Za-z0-9._:-]{0,63}$` |
| Zapis | wyłącznie serwer (Admin SDK), szyfrowany `data-seal` z AAD = ścieżka dokumentu (szyfrogram z konta A nie otwiera się pod kontem B); `firestore.rules` bez zmian (`allow read, write: if false`) |
| Tożsamość | ciasteczko `__session` zweryfikowane `verifySessionCookie(cookie, true)` w `src/lib/auth/require-session.ts` — nie `uid` z treści żądania |
| Trasa | `GET /api/me/watchlist` → `{ items, account }` (`account: false` = konto bez dokumentu); `PUT { items }` → zapis całości; 400 zły kształt, 401 bez sesji, 403 obca domena, 415 nie-JSON, 501 bez Admin SDK (demo), 503 błąd bazy; `Cache-Control: private, no-store` |
| Klient | `src/lib/watchlist-store.ts` (silnik bez Reacta i `window`: `fetch`/pamięć wstrzykiwane, testy `tests/watchlist-store.test.ts`) + `src/lib/watchlist.ts` (`useSyncExternalStore`); klucz lokalny `mk:watchlist:u:{uid}` (zalogowany) albo `mk:watchlist:v1` (anonim / demo); zapis na konto 400 ms po ostatnim kliknięciu; **PUT nigdy przed udanym odczytem konta** |
| Migracja szyfrowania | `sweepLegacyDocs` przegląda też `savori_users` (kształt `doc`) |

## Lekcje zastosowane (docs/PRODUCT.md)

- [x] Publiczna trasa przyjmuje tylko znane kształty; zły parametr = 400 bez zapisu.
- [x] Nic zależnego od „dziś”/przeglądarki przed hydratacją — snapshot serwerowy pusty, `ready` po zamontowaniu.
- [x] Nowe źródło w przeglądarce → CSP: brak (ta sama domena).
- [x] Dane osobiste nie trafiają do cache CDN (`private, no-store`).

## Kryteria akceptacji

1. `tests/user-data.test.ts`: walidacja (znane kształty, duplikaty, limit 200, zły `id`), `reconcileWatchlist`
   (konto wygrywa; lista sprzed logowania przenosi się raz; pusto = brak dokumentu).
2. Dokument konta w bazie jest szyfrogramem (bez `cpi`/`wskaznik` w treści), każdy `uid` ma własny dokument,
   szyfrogram skopiowany pod inny `uid` nie otwiera się.
3. Trasa: 401 bez/z podrobionym ciasteczkiem, 501 bez Admin SDK, 400/403/415 bez zapisu, drugi użytkownik
   dostaje `{ items: [], account: false }`, PUT nadpisuje całość (usunięcie gwiazdki działa).
4. Migracja szyfrowania obejmuje jawny `savori_users/*`, a `users/*` innej aplikacji zostawia.
5. `tsc`, `npm test`, eslint zmienionych plików, `npm run build` — czysto.
6. `/prywatnosc` opisuje listę obserwowanych jako dane konta (zaszyfrowane, usuwane z kontem), a `localStorage`
   jako kopię.
7. Produkcja (po wdrożeniu): zalogowany klika gwiazdkę → w konsoli Firebase pojawia się `savori_users/{uid}` z polem
   `sealed`; drugie urządzenie po odświeżeniu pokazuje tę samą listę; drugie konto w tej samej przeglądarce — pustą.
8. *(z recenzji PM 25.10)* **Nieudany odczyt konta nie może skończyć się nadpisaniem konta.** Gdy `GET /api/me/watchlist`
   nie wróci 200 (brak sieci, 5xx, 429), klient: (a) ponawia odczyt jak zapis (15 s, zdarzenie `online`), (b) **nie wysyła
   `PUT`**, dopóki dla bieżącego konta nie udał się żaden odczyt — kliknięcia zostają w lokalnej kopii jako `dirty`
   i idą na konto przez istniejącą ścieżkę scalania po udanym odczycie. Dowód: test w `tests/` (store z podstawionym
   `fetch`/`localStorage`, bez jsdom — `vi.stubGlobal`) albo nagranie: DevTools → Offline → wejście zalogowanym na nowe
   urządzenie → gwiazdka → Online → w Firestore lista konta zawiera stare pozycje **i** nową.
   **Dowód (25.10):** `tests/watchlist-store.test.ts`, blok „kryterium 8”: offline przy wejściu → gwiazdka lokalnie, zero PUT →
   `onOnline()` → konto = `[cpi, pko, eur]`; 503 przy odczycie → ponowienie po 15 s, bez PUT do tego czasu; 401/501 →
   bez ponawiania i bez PUT. Do tego: zapis tuż przed wylogowaniem wychodzi przed zmianą konta (uwaga 1 z recenzji).

## Recenzja PM (25.10.2026) — werdykt końcowy: **SHIP** (po poprawce kryterium 8; pierwsza runda: FIX)

**Druga runda (po commicie „Watchlista: PUT dopiero po udanym odczycie konta…”):** kryterium 8 spełnione —
`src/lib/watchlist-store.ts`: `schedulePush` l. 93–99 ustawia `dirty`, ale bez `pulled` nie planuje PUT; `pull` l. 116–118
ponawia nieudany odczyt po 15 s tylko dla 429/5xx bez 501 (`isTransient` l. 38), `onOnline` l. 224–228 dokańcza odczyt
albo wysyła zaległy zapis; po udanym odczycie ścieżka `dirty` l. 125–134 scala konto + kliknięcia. Dowód:
`npx vitest run tests/watchlist-store.test.ts` → 11/11 (offline → `[cpi, pko, eur]`; 503 → drugi GET po 15 s, zero PUT;
401/501 → jeden GET, zero PUT). Uwaga 1 z pierwszej rundy też zrobiona (`activate` l. 203–204 wysyła zaległy zapis przed
zmianą konta; PUT rusza synchronicznie z ciasteczkiem, a `DELETE /api/auth/session` tylko kasuje ciasteczko, nie
unieważnia sesji — zapis dochodzi). Reszta kryteriów bez zmian: `tsc` 0, eslint 0 na zmienionych plikach, `npm test`
232/232, trasa/serwer/`/prywatnosc` nietknięte w tym commicie; hook nadal hydration-safe (`getServerSnapshot` =
`EMPTY_SNAPSHOT`, `activate` w `useEffect`). Kryterium 7 — do sprawdzenia po wdrożeniu.

Nowe uwagi niewstrzymujące (dziś nieosiągalne albo rzadkie; backlog ROADMAP P-5):
- `src/lib/watchlist.ts:25` czyta `window.localStorage` przy ładowaniu modułu, poza `try` — przy zablokowanych
  ciasteczkach (Safari „Blokuj wszystkie”, Chrome bez storage) getter rzuca `SecurityError` i wywala cały chunk strony.
  Dziś nieosiągalne: bez ciasteczek nie da się przejść bramki; przy `NEXT_PUBLIC_AUTH_REQUIRED=false` już tak.
  Poprzednia wersja dotykała `localStorage` tylko w `try`.
- `watchlist-store.ts:125–134`: ścieżka `dirty` przy koncie bez dokumentu bierze `snapshot.items`, nie listę sprzed
  logowania — kliknięcie w oknie pierwszego odczytu przy pierwszym logowaniu gubi migrację listy anonimowej
  (`base = account ?? legacy` naprawia).
- `activate` l. 204 nie wysyła zaległych kliknięć, gdy zapis właśnie trwa (`inflight && dirty`).

**Pierwsza runda:** kryteria 1–6 spełnione (dowody: `npx vitest run tests/user-data.test.ts` 12/12, `npm test` 221/221, `tsc` czysto;
`/prywatnosc` l. 44–48 i 77–80). Do poprawy przed wdrożeniem było — kryterium 8 (`src/lib/watchlist.ts`, `pullFromAccount`
l. 100–108 i `push` l. 143–155): nieudany odczyt konta jest cichy i nieponawiany, a następne kliknięcie wysyła lokalną
listę jako całą listę konta. Na nowym telefonie (pusta kopia lokalna, słaba sieć) jedna gwiazdka kasuje listę
z komputera — jedyne dane użytkownika, które przechowujemy. Ścieżka scalania przy `dirty` (l. 114–122) obejmuje tylko
okno, w którym odczyt jeszcze trwa, nie odczyt nieudany.

Uwagi niewstrzymujące (do zrobienia przy okazji, nie w tym PR):
- `activate()` (l. 86–98) przy wylogowaniu kasuje oczekujący zapis (`clearTimers`, `dirty = false`) — gwiazdka kliknięta
  <400 ms przed „Wyloguj” ginie. Rozwiązanie: wysłać zaległy zapis przed zmianą konta.
- `readUserData` (`user-data-server.ts` l. 9–12, 29–33) zwraca `null` zarówno dla braku dokumentu, jak i dla dokumentu
  nie do odczytania (zły klucz / tryb ścisły) → klient widzi `account: false` i nadpisuje szyfrogram lokalną kopią.
  Samonaprawa jest zamierzona, ale maskuje złą konfigurację klucza — warto `console.warn` dla „istnieje, nie otwiera się”.
- Scalanie przy `dirty` dodaje tylko nowe pozycje; odznaczenie w oknie odczytu wraca po scaleniu z kontem.
- Kopia `mk:watchlist:u:{uid}` zostaje w `localStorage` po wylogowaniu (współdzielony komputer) — `/prywatnosc` nazywa
  ją kopią, więc zgodne z opisem; czyszczenie przy wylogowaniu byłoby czystsze.
- `sameOrigin` jest zdublowane (`api/auth/session/route.ts` l. 41 i `auth/require-session.ts` l. 29) — trasa sesji
  powinna importować wspólną.
- `verifySessionCookie(cookie, true)` = jedno zapytanie do Firebase Auth na każdy GET/PUT (montaż strony + zapis co
  400 ms po serii kliknięć). Przy obecnej skali bez znaczenia; przy wzroście — cache weryfikacji na kilka minut.

## Działania właściciela

- Usuwając konto na prośbę użytkownika (RODO), usunąć też `savori_users/{uid}` (konsola Firebase → Firestore) —
  `/prywatnosc` to obiecuje. Pomocnik w kodzie: `deleteUserData()` w `src/lib/user-data-server.ts`.
- Bez zmian w zmiennych środowiskowych: trasa używa tych samych `FIREBASE_*` co reszta serwera.
