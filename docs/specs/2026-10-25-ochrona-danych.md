# Ochrona danych: zero dostępu z przeglądarki i drugie szyfrowanie w Firestore

- **Prośba właściciela (25.10.2026):** „maksymalna protekcja, podwójne szyfrowanie danych, żeby nikt nie mógł nic
  czytać — wszystko przemyśleć”.
- **Zakres:** reguły Firestore i Storage, szyfrowanie treści dokumentów po stronie aplikacji, kod klienta
  Firebase, CSP, trasa sesji logowania. Poza zakresem (wymaga właściciela): ustawienie klucza, wdrożenie reguł,
  zabezpieczenie kont administratora, uprawnienia konta serwisowego.

## Co chronimy i przed kim (model zagrożeń)

| Dane | Gdzie | Kto mógł czytać / zmieniać przed zmianą |
|---|---|---|
| Cache danych (GUS, NBP, Eurostat, Japonia…), archiwum newsów, dziennik cronów, kontrola świeżości | Firestore | `firestore.rules` w repo: **każdy** (`allow read: if true`, klucz API jest publiczny w kodzie strony). Wdrożone reguły produkcji są inne: odczyt bez logowania → `PERMISSION_DENIED` (sprawdzone REST-em 25.10). Plik w repo był bombą: pierwszy `firebase deploy` otworzyłby bazę. Czy wdrożone reguły wpuszczają zalogowanych — nieznane (konto można założyć REST-em publicznym kluczem, jeśli dostawca e-mail/hasło na to pozwala) |
| Pliki | Storage | w projekcie nie ma bucketu (404, 25.10); reguły w repo pozwalały zalogowanym zapisywać do 10 MB |
| Konta (e-mail, hasło) | Firebase Auth | Google; hasła hashowane przez Firebase (scrypt) |
| Raporty wgrane do parsera | pamięć funkcji | nikt — przetwarzane w pamięci, nigdzie nie zapisywane (tak zostaje) |

Uczciwie: większość treści w bazie to dane publiczne (te same liczby są na stronie). Szyfrowanie daje im przede
wszystkim **integralność**: bez klucza nikt z dostępem do bazy nie podmieni liczb (np. inflacji), bo podmiana jest
wykrywana. Poufność dotyczy dziennika cronów, kontroli świeżości i wszystkiego, co kiedyś trafi do bazy (dane kont).

## Warstwy

1. **Minimalizacja:** nie przechowujemy plików ani danych z parsera.
2. **Dostęp:** `firestore.rules` i `storage.rules` = `allow read, write: if false` dla wszystkiego. Serwer używa
   Admin SDK (konto serwisowe), które reguł nie podlega — strona działa bez zmian. Kod przeglądarki nie importuje
   `firebase/firestore`, `firebase/storage` ani `firebase/database` (test).
3. **Transport:** HTTPS + HSTS (już było); CSP `connect-src` zawężony do `'self'` + logowanie Firebase
   (`identitytoolkit`, `securetoken`). Usunięte `*.googleapis.com` (każdy może mieć bucket pod
   `storage.googleapis.com` — kanał wycieku dla wstrzykniętego skryptu) i nieużywane `*.firebaseio.com`.
4. **Szyfrowanie u Google:** dyski Firestore — AES-256, domyślnie.
5. **Drugie szyfrowanie (nasze, tylko dane Savori — kolekcje `CACHE_COLLECTIONS` i `health/*`; projekt może mieć dane
   innej aplikacji, których migracja nie dotyka):** `src/lib/data-seal.ts` — treść każdego dokumentu: JSON → deflate →
   AES-256-GCM, losowy IV, AAD = wersja | ścieżka dokumentu | `updatedAt`. W bazie zostaje `{ sealed: Bytes,
   updatedAt }` (cache dodatkowo `payload: null`, żeby wycofane wdrożenie widziało brak wpisu, nie `undefined`).
   Identyfikator klucza = HMAC(klucz, etykieta)[0..4]. Klucz tylko w env serwera (`DATA_ENCRYPTION_KEY`), nigdy w bazie ani repo.
6. **Sesja logowania:** `/api/auth/session` przyjmuje tylko żądania z własnej domeny (`Origin`) z
   `Content-Type: application/json` (login CSRF), sprawdza unieważnienie tokenu i świeże logowanie (≤ 5 min),
   nie zwraca treści wyjątków.

## Zachowanie

- Bez klucza (tryb demo, przed ustawieniem): zapis jawny jak dawniej — nic się nie psuje.
- Z kluczem: nowe zapisy szyfrowane; jawne wpisy sprzed włączenia nadal czytane (brak przerwy w danych).
  Migracja w cronie `freshness` (najwyżej co 6 h; blokada zapisywana przed skanem) szyfruje resztę, w tym stare dni
  archiwum newsów. Czyta stronami po 50, kończy najpóźniej 95 s od startu crona (po zapisie przebiegu w dzienniku),
  resztę zostawia na kolejny przebieg (`truncated`).
- `DATA_ENCRYPTION_STRICT=1`: jawne wpisy odrzucane (podrzucony jawny dokument nie przejdzie). Włączyć, gdy
  `encryption.lastSweep` ma `legacy: 0`, `truncated: false` i `failed: 0` w dwóch kolejnych przebiegach (ucięty
  przebieg też pokazuje `legacy: 0`; za wcześnie = nieczytelne stare dni archiwum newsów).
- Wpis nie do odszyfrowania (podmiana, inny dokument, zły klucz) = brak wpisu: cache pobiera dane ze źródła
  i nadpisuje dokument.
- Zły format klucza: `encryption.mode = "error"`, zapis wstrzymany (nie piszemy jawnie, skoro miało być
  szyfrowanie), odczyt jawnych wpisów działa.
- Rotacja: nowy klucz w `DATA_ENCRYPTION_KEY`, stary w `DATA_ENCRYPTION_KEY_PREVIOUS`; migracja przepisuje wpisy
  (`lastSweep.rotated`); gdy `rotated: 0`, `truncated: false` i `failed: 0`, stary klucz można usunąć.
- Stan: `/api/health/freshness` → `encryption` (`mode`, `kid` = 8 znaków skrótu SHA-256 klucza, `strict`,
  `lastSweep`).

## Kryteria akceptacji

1. `tests/data-seal.test.ts`: round-trip; brak jawnego tekstu w bajtach; losowy IV; wykrycie podmiany bajtu,
   przeniesienia do innego dokumentu i zmiany `updatedAt`; cudzy klucz; rotacja; kompresja dużego wpisu
   (< 1/3 JSON); Uint8Array; tryby off/error/strict; status bez klucza.
2. `tests/data-protection.test.ts`: `withCache`, archiwum, dziennik cronów i historia świeżości trzymają w bazie
   tylko szyfrogram; podmieniony wpis zastąpiony danymi ze źródła; jawny wpis czytany; bez klucza zapis jawny;
   migracja i rotacja; reguły bez wyjątków; brak importu Firestore/Storage/Database w `src`; CSP `connect-src`.
3. `tsc`, `npm test`, eslint zmienionych plików, `npm run build` bez błędów; `next start` 390 i 1440 px:
   0 naruszeń CSP i 0 błędów konsoli na `/`, `/ceny`, `/japonia`, `/status`, `/parser`, `/login`, `/ustawienia`.
4. Produkcja po wdrożeniu (bez klucza): 15/15 ok, `encryption.mode = "off"`.
5. Po ustawieniu klucza przez właściciela: `encryption.mode = "on"`, po przebiegu `freshness`
   `lastSweep.legacy` maleje do 0, 15/15 ok.

## Wymaga właściciela

Kolejność i polecenia: `docs/ROADMAP.md` → „Wymaga właściciela” → „Ochrona danych”.
