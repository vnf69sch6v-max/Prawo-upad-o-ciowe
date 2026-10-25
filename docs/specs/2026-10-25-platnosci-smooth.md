# Płatności i sesja: gładka ścieżka od wygaśnięcia do dostępu

- **Prośba właściciela (25.10.2026):** „sprawdzić cały proces i ponaprawiać płatności Stripe, żeby to tak smooth
  przechodziło”. Audyt w dwóch torach (bezpieczeństwo/poprawność księgowania; ścieżka użytkownika) — ustalenia
  poniżej, każde z poprawką w tym specu.
- **Zakres:** odnowienie ciasteczka sesji bez ponownego logowania, widoczność końca dostępu w aplikacji, silnik
  powrotu ze Stripe (BLIK/P24, logowanie na adresie powrotu, komunikaty z przyciskiem), księgowanie dwóch
  sesji naraz, ścisła klasyfikacja sesji, obserwowalność webhooka na `/status`, drobiazgi cennika i mobile.
  Poza zakresem: subskrypcje, faktury VAT, strona `/konto` (P-3), adres i NIP usługodawcy (właściciel).

## Ustalenia audytu (co dziś nie działa gładko)

| # | Waga | Problem | Dowód |
|---|---|---|---|
| A1 | BLOKER | Webhook nadaje dostęp w claims, ale bramka czyta tylko ciasteczko. Po BLIK/P24 (`unpaid` przy powrocie) klient kończy na pierwszym `pending`, ciasteczko zostaje stare, bramka odsyła na cennik „dostęp wygasł” mimo zapłaty. Nic poza `confirm` nie wystawia nowego ciasteczka; `/api/auth/session` wymaga `auth_time` ≤ 5 min. | `confirm/route.ts:76-77`, `LandingClient.tsx:149`, `access.ts:121`, `session/route.ts:64` |
| A2 | WYSOKA | Dwie różne sesje jednego użytkownika księgowane równolegle liczą od tej samej bazy (`claims` czytane przed transakcją) — jedna z nich ginie, a oba przelewy zeszły. | `fulfill.ts:83-87`, `:50-58` |
| A3 | ŚREDNIA | Każdy status ≠ `paid` to „pending”, także `expired` i `no_payment_required` (po których żaden webhook nie przyjdzie). Odrzuty bez identyfikatora sesji w logu. | `billing.ts:259-263`, `webhook/route.ts:47-49` |
| A4 | ŚREDNIA | Zły/brakujący sekret webhooka, zły `livemode`, `user-missing` — niewidoczne poza panelem Stripe. Brak `health/*` dla płatności. | `webhook/route.ts:17-24,40-42,58` |
| A5–A8 | NISKA | Klucz idempotencji per minuta zwraca ukończoną sesję przy drugim zakupie tego samego planu w tej samej minucie; rabat mniejszy od podatku przechodzi kontrolę kwoty; przyciski cennika zależą od ISR (30 min) a nie od żywej flagi; wywołanie Stripe bez limitu czasu ginie na 30 s platformy zamiast zwrócić 502. | `billing.ts:70-74,236-239`, `start/page.tsx:16,132`, `stripe/api.ts:28-39` |
| B1 | WYSOKA | Po powrocie ze Stripe baner stanu jest w `#cennik` (kilka ekranów niżej), a lepki przycisk „Przejdź do platformy” wyprowadza z `/start` zanim `confirm` skończy — drugie wywołanie jest przerywane (`cancel`). | `start/page.tsx:247-248`, `LandingClient.tsx:16-21,174` |
| B3 | WYSOKA | Logowanie na adresie powrotu odpala `confirm` z `onAuthStateChanged`, zanim serwer ustawi ciasteczko → 401 → komunikat „wyloguj się”, a `/start` nie ma wylogowania. 403 (inne konto) ma ten sam komunikat. | `use-auth.tsx:104-127`, `LandingClient.tsx:121-160` |
| B4 | WYSOKA | Ciasteczko żyje 5 dni i nic go nie odnawia; Firebase pamięta użytkownika, więc nagłówek mówi „Przejdź do platformy”, a bramka odsyła z powrotem. Dotyczy wszystkich, także płacących. | `session/route.ts:23,64`, `use-auth.tsx:100-108` |
| B5 | WYSOKA | Nigdzie nie widać, do kiedy jest okres próbny / dostęp, ani skąd go przedłużyć. Koniec dostępu to ściana. | `UserMenu.tsx`, `ustawienia/page.tsx` |
| B6 | ŚREDNIA | Wygasły dostęp gubi stronę, którą użytkownik otwierał (`/start?dostep=wygasl#cennik` bez `from`), i nie mówi, kto jest zalogowany. | `access.ts:121`, `LandingClient.tsx:25-31` |
| B7–B12 | ŚREDNIA/NISKA | Stany banera bez przycisku akcji; „Wchodzisz na platformę…” bez daty; `sessionStorage` poza `try`; admin może zapłacić bez efektu; copy prawne przy przycisku bez usługodawcy i linku do regulaminu; FAQ o okresie próbnym przy `TRIAL_DAYS=0` („0 dni”); trzykrotna lista cech; hero CTA `min-h-13` (klasa nie istnieje). | `LandingClient.tsx:65-85,178-185,188-195`, `start/page.tsx:122,174-175` |

Poprawne i nie do ruszenia (oba audyty): uid z ciasteczka, cena z `PLANS`, literalne `{CHECKOUT_SESSION_ID}`,
`safeCheckoutOrigin`, 403 dla cudzego `metadata.uid`, podpis webhooka (surowe body, okno 300 s, `timingSafeEqual`),
statusy webhooka (200 dla deterministycznych odrzutów, 500 tylko gdy Firestore/Auth padnie), `extendAccess`
z `max(teraz, koniec)`, admin nietykalny, `PUBLIC_API` z trzema trasami Stripe, `sameSite` + JSON jako CSRF.

## Co widzi użytkownik po zmianie

1. **Nie wypada z sesji.** Aktywny użytkownik nigdy nie trafia na ścianę po 5 dniach: ciasteczko starsze niż dobę
   aplikacja odnawia po cichu (ważne ciasteczko + świeży token tej samej osoby). Po ponad 5 dniach nieobecności
   widzi na `/start` „Sesja wygasła — zaloguj się ponownie” z przyciskiem Google, nie pętlę „Przejdź do platformy”.
2. **Wie, do kiedy ma dostęp.** W menu konta (desktop i arkusz na telefonie) i w `/ustawienia`: „Okres próbny do
   1 listopada 2026, 09:40” / „Dostęp do 25 stycznia 2027” + „Przedłuż” → `/start#cennik`. Poniżej 48 h: „Kończy się
   jutro o 09:40”. Administrator: „Dostęp administratora”, bez „Przedłuż” i bez przycisków „Zapłać”.
3. **Po wygaśnięciu wraca tam, skąd wyszedł.** Bramka zachowuje `from`; komunikat: „Zalogowano jako {email}. Dostęp
   się skończył — wybierz plan, a po płatności wrócisz do {strony}”. Jeśli w międzyczasie webhook nadał dostęp
   (np. BLIK doszedł w nocy), strona sama odnawia ciasteczko i wraca na `from` — bez cennika.
4. **Powrót ze Stripe ma jeden pasek stanu pod nagłówkiem**, widoczny od razu na telefonie i desktopie. Karta:
   „Płatność przyjęta. Dostęp aktywny do {data}.” (1,5 s) → wejście na zapamiętaną stronę. BLIK/P24: „Czekamy na
   zaksięgowanie BLIK-a lub przelewu. Zostaw tę kartę otwartą.” z odpytywaniem co 4 s przez ~3 minuty, potem
   „Płatność jeszcze nie doszła. Sprawdź ponownie za chwilę — nic nie przepada.” i przycisk „Sprawdź ponownie”.
   Każdy stan błędu ma przycisk (ponów / zaloguj / wyloguj i zaloguj właściwe konto) i adres kontaktowy.
   W czasie potwierdzania lepki przycisk nie prowadzi do `/`.
5. **Logowanie na adresie powrotu dokańcza płatność samo.** `confirm` rusza dopiero, gdy ciasteczko jest na
   miejscu (`sessionReady`); inne konto niż płacące → „To inne konto niż to, które płaciło. Wyloguj się i zaloguj
   właściwe.” z przyciskiem.
6. **Właściciel widzi na `/status`, czy webhook dochodzi**: ostatnie zdarzenie, wynik (ok / zły podpis / brak
   sekretu / zły tryb / brak użytkownika), czas ostatniego udanego księgowania.

## Architektura zmian (trzy pakiety, rozłączne pliki)

### WP1 — sesja i dostęp (rdzeń; pozostałe pakiety UI zależą od jego kontraktu)

Pliki: `src/app/api/auth/session/route.ts`, `src/lib/auth/use-auth.tsx`, nowy `src/lib/auth/session-info.ts`,
`src/lib/access.ts`, `tests/access.test.ts`, nowe testy `tests/session-info.test.ts`, `tests/session-route.test.ts`.

- `GET /api/auth/session` → `{ signedIn: false }` albo `{ signedIn: true, accessUntil, plan, iat }` z
  `verifySessionCookie(cookie, true)` (te same claims, które czyta bramka). Nagłówek `Cache-Control: private, no-store`.
  Bez Admin SDK → 501 `auth-not-configured`.
- `PUT /api/auth/session` (odnowienie) — `sameOrigin` + JSON `{ idToken }`: wymaga **ważnego** ciasteczka
  (`verifySessionCookie(…, true)`) i tokenu `verifyIdToken(…, true)` **tej samej osoby** z `freshToken(iat)`
  (≤ 5 min, import z `@/lib/stripe/billing`). Bez `accessToGrant`, bez zapisu claims. Wystawia nowe `__session`
  (5 dni) z bieżącymi claims tokenu i odpowiada `{ ok: true, accessUntil, plan }`. Brak/zepsute ciasteczko → 401;
  inny uid → 403; stary `iat` → `{ refresh: true }` (klient woła `getIdToken(true)` i ponawia raz).
  Uzasadnienie bezpieczeństwa: odnowienie wymaga posiadania ważnego ciasteczka httpOnly **i** świeżego tokenu —
  stary przechwycony token nadal nie wyrobi sesji (`POST` zostaje przy `auth_time` ≤ 5 min).
- `POST /api/auth/session` dodatkowo zwraca `{ ok: true, accessUntil, plan }` (z claims tokenu), żeby klient nie
  musiał od razu robić sondy.
- `src/lib/auth/session-info.ts` (czyste, bez React/`window`): `type SessionInfo = { status: 'unknown' | 'none' | 'ok'; accessUntil: number | null; plan: 'trial' | PlanId | null; iat: number | null }`,
  `accessState(info, nowS)` → `'unknown' | 'none' | 'active' | 'expired' | 'admin'`, `secondsLeft`, `endsSoon(…, 48 h)`,
  `formatAccessUntil(unixS)` → `Intl.DateTimeFormat('pl-PL', { timeZone: 'Europe/Warsaw', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })`,
  `accessLabel(info, nowS)` → „Okres próbny do …” / „Dostęp do …” / „Kończy się jutro o …” / „Dostęp administratora” / `null`,
  `needsRenewal(iat, nowS)` → `true`, gdy ciasteczko starsze niż 24 h.
- `AuthProvider` (`use-auth.tsx`) — kontrakt dla UI:
  ```ts
  interface AuthContextValue {
      user; loading; enabled; signIn; signInWithGoogle; signOut;           // bez zmian
      /** Stan ciasteczka serwera (bramki), nie Firebase. `status: 'unknown'` do pierwszej sondy. */
      session: SessionInfo;
      /** `true`, gdy ciasteczko jest potwierdzone (sonda GET albo POST/PUT zakończone sukcesem). */
      sessionReady: boolean;
      /** Odnowienie ciasteczka: PUT z `getIdToken(force)`; przy `{ refresh }` ponawia raz z `true`. Zwraca nowy stan. */
      refreshSession: (opts?: { force?: boolean }) => Promise<SessionInfo>;
  }
  export function useAccess(): { state: 'unknown' | 'none' | 'active' | 'expired' | 'admin'; accessUntil: number | null; plan; label: string | null; endsSoon: boolean }
  ```
  Zachowanie: po `onAuthStateChanged` z użytkownikiem → jedna sonda `GET`; jeśli `signedIn` i `needsRenewal(iat)`
  → `refreshSession()` po cichu (błąd ignorowany). `createSession` ustawia `session` z odpowiedzi POST i dopiero
  wtedy `sessionReady`. `signOut` zeruje `session` na `none`. Tryb demo: `session = { status: 'ok', accessUntil: null, plan: null }`,
  `sessionReady = true`, `useAccess().state = 'unknown'` (nic nie pokazujemy). Wszystko w efektach — zero różnic SSR/klient.
- Bramka (`access.ts`): wygasły dostęp → `/start?dostep=wygasl&from=${encodeURIComponent(pathname + search)}#cennik`
  (dla `/` bez `search` — bez `from`). Aktualizacja `tests/access.test.ts`.

### WP2 — powrót z płatności, strona startowa, konto (po WP1; koduje do kontraktu wyżej)

Pliki: nowy `src/lib/stripe/payment-return.ts` + `tests/payment-return.test.ts`, `src/components/landing/LandingClient.tsx`,
`src/app/start/page.tsx`, `src/components/shell/UserMenu.tsx`, `src/app/ustawienia/page.tsx`, `src/components/auth/LoginPanel.tsx`
(tylko jeśli konieczne).

- Silnik `payment-return.ts` bez React i `window` (wzór: `src/lib/watchlist-store.ts` + jego testy):
  ```ts
  type Phase =
    | { kind: 'idle' } | { kind: 'cancelled' } | { kind: 'badId' } | { kind: 'signedOut' } | { kind: 'waitingSession' }
    | { kind: 'confirming'; attempt: number } | { kind: 'pending'; polls: number }
    | { kind: 'ok'; accessUntil: number | null; redirectTo: string }
    | { kind: 'error'; code: 'network' | 'forbidden' | 'rejected' | 'timeout' | 'pendingTimeout' | 'server' | 'disabled'; retry: boolean };
  type Event =
    | { type: 'boot'; search: string; signedIn: boolean; sessionReady: boolean }
    | { type: 'response'; status: number; body: { ok?: boolean; refresh?: boolean; pending?: boolean; accessUntil?: number; error?: string } }
    | { type: 'throw' } | { type: 'tick' } | { type: 'retry' };
  type Effect = { kind: 'none' } | { kind: 'confirm'; forceToken: boolean } | { kind: 'wait'; ms: number } | { kind: 'redirect'; to: string; afterMs: number } | { kind: 'rewriteFrom' };
  reduce(phase, event, deps): { phase; effect }
  ```
  `deps`: `now`, `storage: Storage | null` (klucze `savori.checkoutPlan`, `savori.checkoutReturn`, nowy `savori.checkoutSession`
  do wznowienia po przeładowaniu bez query), `returnPath`, `pollLimit = 45`, `pollMs = 4000`, `refreshLimit = 5`, `refreshMs = 700`,
  `okDelayMs = 1500`. Token: `forceToken = true` przy pierwszym wywołaniu i po `{ refresh: true }`; przy odpytywaniu `pending` — `false`
  (serwer odpowie `{ refresh }`, gdy `iat` zbyt stary, wtedy następne z `true`). Mapowanie odpowiedzi: 401 → `waitingSession`
  (do 3 ponowień co 1 s, potem `signedOut`); 403 → `forbidden`; 400 `rejected`/`livemode-mismatch` → `rejected`; 404 → `rejected`;
  501 → `disabled`; 5xx/`fulfill-failed` → `server` (retry); `{ pending }` → `pending` (+1); `{ refresh }` → `confirming` (+1, do limitu → `timeout`, retry);
  `{ ok }` → `ok` (usunięcie trzech kluczy storage w `try`).
- `PaymentReturn` renderuje mapę copy z przyciskami:
  - `cancelled`: „Płatność anulowana. Nic nie zostało pobrane — możesz wybrać plan ponownie.” + „Wróć do cennika” (`#cennik`).
  - `badId`: „Nie rozpoznaliśmy tej płatności. Wróć do cennika i wybierz plan ponownie. Jeśli kwota zeszła z konta, napisz na {OWNER.email}.”
  - `signedOut`: „Zaloguj się tym samym kontem Google. Po zalogowaniu włączymy dostęp z tej płatności.” + „Przejdź do logowania” (`#logowanie`); `rewriteFrom` jak dziś.
  - `waitingSession` / `confirming`: „Sprawdzam płatność…” ze spinnerem.
  - `pending`: „Czekamy na zaksięgowanie BLIK-a lub przelewu. Zostaw tę kartę otwartą.” + spinner.
  - `pendingTimeout`: „Płatność jeszcze nie doszła. Sprawdź ponownie za chwilę — nic nie przepada.” + „Sprawdź ponownie”; druga linia „Jeśli pieniądze zeszły, a dostępu nie ma, napisz na {OWNER.email}.”
  - `forbidden`: „To inne konto niż to, które płaciło. Wyloguj się i zaloguj właściwe.” + przycisk (signOut → `#logowanie`).
  - `server`: „Płatność jest przyjęta po stronie Stripe, ale nie udało się jej zaksięgować. Spróbuj ponownie za chwilę.” + „Spróbuj ponownie”.
  - `timeout`: „Płatność jest przyjęta, dostęp jeszcze się nie odświeżył. Spróbuj ponownie.” + „Spróbuj ponownie”.
  - `rejected`: „Ta sesja płatności wygasła lub nie została opłacona. Nic nie zostało pobrane — wybierz plan ponownie.” + „Wróć do cennika”.
  - `disabled`: „Płatności nie są jeszcze włączone.”
  - `network`: „Brak połączenia. Płatność nie przepada.” + „Spróbuj ponownie”.
  - `ok`: „Płatność przyjęta. Dostęp aktywny do {formatAccessUntil}.” → po 1,5 s `location.assign(redirectTo)`.
- `start/page.tsx`: pasek stanu (`PaymentReturn` + `AccessNotice`) w normalnym przepływie **bezpośrednio pod lepkim nagłówkiem**,
  `role="status"`, bez `fixed`. `StartCta`: w trakcie `platnosc=ok` (faza ≠ `ok`) — „Dokańczamy płatność…” i przewinięcie do paska,
  nie `/`; Firebase user + `session.status === 'none'` → „Zaloguj się ponownie” (Google popup, potem `from`/`/`); `useAccess().state === 'expired'`
  → „Wybierz plan” (`#cennik`). Sekcja logowania: gdy `user` i sesja `ok` → „Zalogowano jako {email}” + „Przejdź do platformy” + „Wyloguj”;
  gdy `user` i sesja `none` → „Sesja wygasła — zaloguj się ponownie” nad `LoginPanel`; nad panelem także „Wybrany plan: {name}, {cena} zł. Zaloguj się, żeby dokończyć.”, gdy czeka plan.
- `AccessNotice` (`dostep=wygasl`): po hydratacji i `sessionReady` — `refreshSession({ force: true })`; jeśli nowy `accessUntil > now`
  → `location.assign(safeRedirectTarget(from) || '/')`; inaczej „Zalogowano jako {email}. Dostęp się skończył — wybierz plan, a po płatności
  wrócisz do {etykieta `from` albo „platformy”}.” `rememberReturn` czyta `from` jak dziś.
- `PricingCards`: etykieta przy zapamiętanym planie „Dokończ płatność — {cena} zł”; helpery `sessionStorage` w `try/catch`;
  `useAccess().state === 'admin'` → zamiast przycisków „Dostęp administratora — płatność nic tu nie zmieni.”;
  `state === 'active'` → nad kartami „Masz dostęp do {data}. Płatność przedłuży go od tej daty, nie od dziś.”;
  po zamontowaniu `GET /api/stripe/checkout` (`no-store`) rozstrzyga o pokazaniu przycisków (ISR tylko jako wartość startowa).
- Lista cech jeden raz nad siatką kart; FAQ o okresie próbnym pomijane przy `days === 0`; hero CTA `min-h-12`; linki nagłówka `touch:min-h-11`;
  pod kartami: „Usługodawca: {OWNER.name}{, adres gdy jest}. Płatność jednorazowa, ceny brutto. Dostęp włączamy od razu po zaksięgowaniu.
  Pokwitowanie wysyła Stripe na e-mail konta (to nie jest faktura VAT). Odstąpienie i reklamacje: [regulamin](/regulamin#plany), [prywatność](/prywatnosc).”
- `UserMenu` (menu i arkusz) pod e-mailem: `useAccess().label` + „Przedłuż” → `/start#cennik` (ukryte dla admina i `unknown`);
  `/ustawienia` karta „Konto”: ten sam wiersz + przycisk „Przedłuż dostęp”. Cele dotyku ≥ 44 px.

### WP3 — księgowanie, webhook, obserwowalność (niezależne od WP1)

Pliki: `src/lib/stripe/fulfill.ts`, `src/lib/stripe/billing.ts`, `src/lib/stripe/api.ts`, `src/app/api/stripe/webhook/route.ts`,
`src/app/api/stripe/checkout/route.ts`, nowy `src/lib/stripe/health.ts`, `src/app/api/health/freshness/route.ts` (+ typ raportu),
`src/components/status/*`, `src/lib/data-seal-sweep.ts`, `tests/stripe.test.ts`, `src/app/prywatnosc/page.tsx` (jedno zdanie).

- `fulfillPaidSession`: w **jednej** transakcji czyta/zapisuje `payments/{cs}` **i** `savori_access/{uid}` (`{ accessUntil, plan, updatedAt }`,
  sealed `toStored`, ścieżka jako AAD). Baza przedłużenia = `savori_access.accessUntil` jeśli dokument istnieje, inaczej claims z Auth
  (seed tylko przy braku dokumentu). Istniejący `payments/{cs}` → dotychczasowe `already`. Admin bez zmian (komercyjna data w dokumencie, claims 2100).
  `syncClaims` czyta `savori_access/{uid}` tuż przed `setCustomUserClaims` i zapisuje tę wartość; `getUser` na świeżo (nie ze snapshotu sprzed transakcji).
  `savori_access` dopisane do listy sweepu w `data-seal-sweep.ts`.
- `classifySession`: `pending` **tylko** dla `payment_status === 'unpaid'` i `status ∈ {open, complete}`; `expired`, `no_payment_required`, reszta → `reject`.
  `readPaidSession`: `total_details.amount_discount` musi być 0/nieobecne.
- `stripe/api.ts`: `signal: AbortSignal.timeout(10_000)`; abort → dotychczasowe 502/500.
- `checkout/route.ts`: jeśli utworzona sesja ma `status: 'complete'` (zwrócona z cache idempotencji), utwórz ponownie z kluczem z sufiksem id tej sesji.
- Webhook: `console.error` z `event.id` i `cs_` (bez e-maila i payloadu) dla `bad-signature`, `stripe-not-configured`, `livemode`, `ignored`, `user-missing`, `fulfill-failed`.
  Nowy `src/lib/stripe/health.ts`: `recordPaymentEvent({ at, kind: 'ok' | 'already' | 'pending' | 'bad-signature' | 'not-configured' | 'livemode' | 'ignored' | 'user-missing' | 'failed', sessionId?, eventType? })`
  → `health/stripe_webhook` (sealed, transakcja jak `recordCronRun`; pola: `last`, `lastOk`, liczniki od początku); `readPaymentHealth()`.
  Zapis także przy 400/501 (żeby zły sekret był widoczny). `/api/health/freshness` dodaje `payments` do raportu; `/status` pokazuje wiersz
  „Płatności (webhook Stripe)”: ostatnie zdarzenie, wynik po polsku, ostatnie udane księgowanie, „brak zdarzeń” gdy pusto. Stan `bad-signature`/`not-configured`
  w ostatnim zdarzeniu podnosi `warn` (nie `stale`/503 — to nie dane).
- `withdrawalNote`: dopisać „Dostęp od razu po zaksięgowaniu.”
- `/prywatnosc`: zdanie, że koniec dostępu i plan są zapisane przy koncie (`savori_access`) i w dzienniku webhooka nie ma danych osobowych.

## Kryteria akceptacji

1. `npm test`, `npx tsc --noEmit`, `npm run lint` (bez nowych błędów), `npm run build` — zielone.
2. **Odnowienie sesji.** `PUT /api/auth/session` bez ciasteczka → 401, z ciasteczkiem i tokenem innego uid → 403, ze starym `iat` → `{ refresh: true }`
   bez `Set-Cookie`, poprawne → nowe `__session` i `{ ok, accessUntil, plan }` z claims tokenu. `POST` nadal odrzuca `auth_time` > 5 min.
   `GET` zwraca claims ciasteczka albo `{ signedIn: false }`, zawsze `private, no-store`.
3. **Bramka.** `gate()` dla wygasłego dostępu na `/ceny?x=1` → `/start?dostep=wygasl&from=%2Fceny%3Fx%3D1#cennik`; dla `/` → `/start?dostep=wygasl#cennik`.
   Trzy trasy Stripe nadal publiczne.
4. **Silnik powrotu** (`tests/payment-return.test.ts`), co najmniej: `anulowana` → zero `confirm`; zły id → `badId`, zero `confirm`; `signedIn` bez `sessionReady` →
   zero `confirm`, a `boot` z `sessionReady` → jedno; `pending, pending, ok` → dwa odpytania, `ok` z `redirectTo` ze storage i wyczyszczonymi kluczami;
   `pending` ponad limit → `pendingTimeout` z `retry`, a `retry` znów woła `confirm`; 5 × `{ refresh }` → `timeout`; 401 → `waitingSession` → po 3 → `signedOut`;
   403 → `forbidden`; storage rzucający → `ok` z `redirectTo: '/'`; `forceToken` `true` po `{ refresh }`, `false` przy odpytywaniu `pending`.
5. **Księgowanie.** Dwie różne sesje jednego uid księgowane tak, że oba odczyty Auth nastąpią przed zapisami → `accessUntil` = suma obu okresów
   (test z udawaną transakcją, która wymusza ponowienie przy konflikcie). Powtórka tej samej sesji → `already`, bez miesięcy. Admin bez zmian.
6. **Klasyfikacja.** `unpaid`+`complete` → `pending`; `expired` → `reject`; `no_payment_required` → `reject`; `subtotal 1000, discount 100, total 1107` → `null`.
   Confirm dla `expired` → 400 `rejected`. Webhook: brak sekretu → 501, zły → 400, `checkout.session.expired` → 200 bez nadania, wyjątek Firestore → 500 —
   każdy z wpisem w `health/stripe_webhook`.
7. **UI** (sprawdzenie w przeglądarce w trybie demo na 390 px i 1280 px): pasek stanu widoczny pod nagłówkiem bez przewijania dla `?platnosc=anulowana`
   i `?platnosc=ok&session_id=zly`; lista cech raz; brak `min-h-13`; przyciski ≥ 44 px; `/status` ma wiersz „Płatności” („brak zdarzeń” w demo);
   `/ustawienia` i menu konta renderują się bez błędów hydratacji (w demo wiersz dostępu ukryty).
8. **Regresja z poprzedniego specu** (`2026-10-25-platnosci-stripe.md`, kryteria 2–4) nadal zielona.

## Zostaje właścicielowi

Jak w `docs/ROADMAP.md` („Stripe — dokończenie po stronie konta”): `STRIPE_WEBHOOK_SECRET`, endpoint webhooka z **oboma** zdarzeniami
(`checkout.session.completed`, `checkout.session.async_payment_succeeded` — bez drugiego BLIK/P24 nigdy nie nadadzą dostępu), metody
płatności, e-maile z pokwitowaniem, `NEXT_PUBLIC_OWNER_ADDRESS`/`NEXT_PUBLIC_OWNER_NIP`, `savori.space` w Authorized domains Firebase.
Po wdrożeniu `/status` pokaże, czy webhook dochodzi.
