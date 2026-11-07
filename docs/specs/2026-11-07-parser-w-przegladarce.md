# Parser sprawozdań — krok 1: duże pliki analizowane w przeglądarce

- **Pozycja:** `docs/ROADMAP.md` → „Parser sprawozdań” PS1. Prośba właściciela 07.11.2026: „zajmijmy się tylko parserem”.
  Dwa problemy: (a) można wrzucać tylko małe pliki, (b) parser „średnio działa”. **Ten krok = tylko (a).**
- **Gałąź:** `claude/parser-w-przegladarce`.
- **Krok 2 (następny, osobna specyfikacja):** pomiar jakości na prawdziwych raportach z ręcznie sprawdzonymi liczbami (PS2).
- **Bez kodu poza `/parser`, bez nowych płatnych usług, bez nowego źródła danych, crona ani `DatasetSpec`.**

## Problem i wartość dla użytkownika

Kto: inwestor indywidualny, analityk, student. Wgrywa raport roczny albo kwartalny spółki i chce zobaczyć przychody,
zysk, marże i bilans bez przepisywania tabel. Pytanie: **„co jest w tym raporcie, w liczbach, w minutę, także na telefonie?”**

Dziś (sprawdzone w kodzie i pomiarem 07.11):
- Plik ≤ 4 MB leci binarnie na `/api/parser/parse`. Większy PDF (≤ 40 MB) jest czytany w przeglądarce, ale
  z limitem **250 stron i 45 s**, a tekst i tak leci POST-em (limit 3,5 MB tekstu, Vercel 4,5 MB na ciało, twardo).
- **Limit 250 stron odrzuca typowe raporty roczne:** PZU SSF 2024 ma 299 stron, Orlen Sprawozdanie Zarządu 2025 — 309,
  Orlen Raport Zintegrowany 2023 — 533. Limit tekstu 3,5 MB nie jest wąskim gardłem (300 stron ≈ 0,8–1,2 MB tekstu).
- Przeglądarka ładuje **nowoczesny** build pdfjs (`import "pdfjs-dist"` → `build/pdf.mjs`, worker `build/pdf.worker.min.mjs`).
  Ten build woła `Promise.withResolvers` (30 wywołań w `pdf.min.mjs`), którego nie ma Safari < 17.4. Na starszym iPhonie
  ścieżka przeglądarkowa pada. Serwer już używa buildu `legacy` (z polyfillem).
- Parsowanie raportu polskiego jest wolne: `normalizeLabel` liczy tę samą etykietę setki razy (dla każdego synonimu
  każdego wzorca). Profil PKO BP (9671 linii): 3,35 s z 8,0 s w samym `normalizeLabel`.

Wartość: raport roczny 300–800 stron i do 100 MB działa na telefonie i komputerze, a plik nie opuszcza urządzenia.

## Pomiar (07.11.2026, ta sama maszyna: VM 4 vCPU; Chromium 141 headless; pdfjs 4.10.38 legacy)

| Plik (publiczny) | MB | Stron | Tekst MB | Ekstrakcja (przegl.) | Parsowanie dziś | Parsowanie z pamięcią `normalizeLabel` | To samo przy CPU 4× | Szczyt pamięci karty |
|---|---|---|---|---|---|---|---|---|
| Microsoft 10-Q (próbka) | 2,4 | 95 | 0,30 | 0,9 s | 0,8 s (Node) | 0,3 s | 1,6 s | 164 MB |
| PKO BP SSF 2024 | 3,7 | 192 | 0,59 | 2,8 s | 8,3 s (Node) | 1,8 s | — | 234 MB |
| PZU SSF 2024 | 10,8 | 299 | 0,80 | 2,6 s | 8,5 s | 2,5 s | 11,2 s | 277 MB |
| Orlen Sprawozdanie Zarządu 2025 | 10,75 | 309 | 1,20 | 2,2 s | 11,5 s | 3,5 s | 14,8 s | 237 MB |
| Orlen SSF 2024 | 15,3 | 134 | 0,51 | 1,6 s | 5,1 s (Node) | 1,3 s | — | 221 MB |
| Żabka raport roczny 2024 | 10,8 | 207 | 1,08 | 2,2 s | 11,3 s (Node) | 2,9 s | — | 293 MB |
| Orlen Raport Zintegrowany 2023 | 74,3 | 533 | 0,01* | 0,4 s | — | 0,07 s | — | 224 MB |

\* tekst zamieniony na krzywe — parser nie ma czego czytać (to sprawa kroku 2 / OCR, nie limitów).
Pamięć karty bazowo: 92 MB. „CPU 4×” = spowolnienie DevTools jak profil „mid-tier mobile” Lighthouse (telefon średniej klasy).
W tym Chromium spowolnienie działa tylko na główny wątek, więc dla telefonu przyjmujemy ×4 dla obu faz.

Wnioski:
- Tekst: 1,8–5,4 kB na stronę (mediana ~3,9). 800 stron ≈ 3–4,3 MB tekstu.
- pdfjs 4.10 **przekazuje** bufor pliku do swojego workera (`sendWithPromise("GetDocRequest", …, [data.buffer])`),
  więc w karcie jest jedna kopia pliku. 74 MB → +132 MB szczytu; 100 MB ≈ +180 MB, czyli ok. 270–300 MB na kartę.
- Pamięć dla `normalizeLabel` (`Map`, ograniczona) daje 3,1–5,3× szybsze parsowanie (Node; w przeglądarce 3,3–3,4×) i **identyczny wynik**
  (porównany `JSON.stringify` całego `ParseResult` na 6 tekstach: 3 fixture'y + PKO, PZU, Żabka).
- Parsowanie w Web Workerze nie blokuje głównego wątku. W głównym wątku to jedno zadanie 3,5 s (desktop) / 14,8 s
  (CPU 4×), czyli zamrożona strona i na telefonie komunikat „strona nie odpowiada”.
- Telefon średniej klasy, szacunek ×4: raport 300 stron ≈ 10 s ekstrakcji + 10–14 s parsowania ≈ **20–25 s** (dziś parsowanie
  bez pamięci: ~45 s). 800 stron ≈ 60–90 s.
- Eksport: ciało `{ result bez rawText }` = 0,55–0,89 MB dla 192–309 stron (~0,7× tekstu). Przy 6 MB tekstu może przekroczyć 4 MB.
- Parser w workerze to 54 KB / 17 KB gzip. Legacy pdfjs: 114 KB gzip zamiast 99 KB (+15 KB), worker 417 KB gzip — tylko przy PDF.

## Decyzje

1. **Każdy plik (PDF i TXT) analizujemy w przeglądarce.** Ekstrakcja zostaje w obecnym module (pdfjs i tak liczy w swoim
   workerze, główny wątek dostaje stronę po stronie i może raportować postęp). **Parsowanie przenosimy do własnego
   Web Workera** (`parseReport` jest czystym TS — sprawdzone: bez `process`, `Buffer`, `window`, `document` w `src/lib/parser`
   poza `extract.ts`). Bez zagnieżdżonego workera pdfjs w naszym workerze (Safari, ryzyko bez zysku).
2. **Build `legacy` pdfjs w przeglądarce** (`pdfjs-dist/legacy/build/pdf.mjs` + `legacy/build/pdf.worker.min.mjs`) — ta sama
   ekstrakcja co na serwerze, więc wynik przeglądarki = wynik serwera. Worker pod nową nazwą
   (`/pdfjs/pdf.worker.legacy.min.mjs`), żeby przeglądarka nie dostała z pamięci podręcznej starego, nowoczesnego pliku.
3. **Nowe limity (`src/lib/parser/limits.ts`):**

   | Stała | Było | Będzie | Uzasadnienie |
   |---|---|---|---|
   | `MAX_CLIENT_FILE_BYTES` | 40 MB | **100 MB** | 74 MB → +132 MB pamięci karty; 100 MB ≈ 270–300 MB na kartę. Większe pliki to raporty pełne zdjęć. |
   | `MAX_CLIENT_PAGES` | 250 | **800** | Obejmuje 533-stronicowy raport zintegrowany. 800 stron ≈ 60–90 s na telefonie. |
   | `MAX_CLIENT_TEXT_BYTES` (nowa) | 3,5 MB (ciało POST) | **6 MB** | Chroni czas i pamięć workera (6 MB ≈ 18 s desktop / ~75 s telefon), dotyczy też TXT. |
   | `MAX_CLIENT_EXTRACT_MS` 45 s | 45 s ekstrakcji | **`MAX_CLIENT_TOTAL_MS` = 240 s** na ekstrakcję + parsowanie | 800 stron na telefonie ≤ 90 s → zapas ≥ 2,5×. Zamiast ucinać w 45 s: postęp i „Anuluj”. |
   | `MAX_BINARY_UPLOAD_BYTES`, `MAX_EXTRACTED_TEXT_BYTES`, `VERCEL_BODY_LIMIT_BYTES` | 4 MB / 3,5 MB / 4,5 MB | **bez zmian** | Dotyczą już tylko awaryjnej ścieżki serwerowej. Limitu Vercela nie „podnosimy”. |

4. **Postęp:** „Czytam stronę X z Y” z paskiem określonym (strona/stron), potem „Analizuję tabele i liczby…” z paskiem
   nieokreślonym. Aktualizacja najwyżej ~10 razy na sekundę. Przycisk **„Anuluj”** zatrzymuje pdfjs (`destroy`) i worker
   (`terminate`), wraca do ekranu startowego bez komunikatu błędu.
5. **Awaryjnie serwer — tylko na kliknięcie, nigdy automatycznie.** Obietnica „plik nie opuszcza urządzenia” ma być prawdziwa.

   | Co padło | Co proponujemy |
   |---|---|
   | Worker parsera nie wstał / padł (`error`, `messageerror`, wyjątek w konstruktorze), tekst ≤ 3,5 MB | „Przetwórz na serwerze” → POST JSON `{ text, pages, fileName, fileSize }` (obecny tryb trasy). Wysyłamy tekst, nie plik. |
   | Ekstrakcja padła technicznie (worker pdfjs się nie załadował, brak pamięci, nieznany błąd) albo minęło 240 s w fazie ekstrakcji, plik ≤ 4 MB | „Przetwórz na serwerze” → POST multipart z plikiem (obecny tryb). |
   | 240 s w fazie parsowania, tekst ≤ 3,5 MB | jak w pierwszym wierszu (tekst). |
   | To samo, ale plik > 4 MB / tekst > 3,5 MB | Brak przycisku. „Spróbuj w aktualnej przeglądarce na komputerze.” |
   | Hasło, uszkodzony PDF, < 200 znaków tekstu (skan), > 800 stron, > 6 MB tekstu, wyjątek w `parseReport` | Brak przycisku — serwer zrobiłby to samo. Komunikat mówi, co zrobić. |
   | „Anuluj” | Nic. Powrót do startu. |

   Trasa `/api/parser/parse` zostaje bez zmian (oba tryby), `maxDuration = 60`.
6. **Eksport:** w tym kroku bez zmiany miejsca. XLSX potrzebuje `exceljs`; jego build przeglądarkowy to 925 KB / 252 KB gzip
   i zawiera `Function("return this")`, `new Function(""+e)` i `Function("r","regeneratorRuntime = r")`. Bez `'unsafe-eval'`
   w CSP to ryzyko naruszeń, więc XLSX zostaje na serwerze. CSV i JSON (`toCSV`, `toJSON` są czyste) przenosimy
   do przeglądarki w osobnym, małym kroku (PS1b), żeby zmieścić ten krok w budżecie linii. **W tym kroku:** strażnik
   rozmiaru — jeśli ciało eksportu > 4 MB, nie wysyłamy, tylko komunikat „Ten raport jest za duży na eksport — skróć plik
   do samego sprawozdania finansowego”. Dla raportów do ~800 stron ciało mieści się z zapasem (pomiar: ~0,7× tekstu).
7. **„Surowy tekst” przy dużym raporcie:** `RawTextInspector` renderuje dziś wszystkie linie (PZU: 13 878 linii ≈ 42 tys.
   węzłów DOM po otwarciu, każde naciśnięcie klawisza w wyszukiwarce renderuje je ponownie). Pokazujemy najwyżej 2000
   pasujących linii i notkę „Pokazano 2000 z 13 878 wierszy — zawęź wyszukiwaniem”. Wyszukiwanie dalej przeszukuje wszystkie linie.
8. **Pamięć dla `normalizeLabel`** (`src/lib/parser/patterns.ts`): `Map` etykieta → wynik, czyszczona po przekroczeniu
   ~50 tys. wpisów. Zero zmian w wyniku (kryterium 3) — zmiany zachowania parsera to krok 2, nie ten.

## Co widzi użytkownik

### Telefon (320–430 px)

**Start (`/parser`):**
1. Tytuł „Parser raportów”. Lead: „Wgraj PDF sprawozdania: 10-Q, 10-K, raport kwartalny lub roczny. Analiza odbywa się
   w Twojej przeglądarce — plik nie jest wysyłany na serwer.”
2. Strefa wgrywania: „Upuść PDF lub kliknij, aby wybrać · do 100 MB i 800 stron”. Przykłady jak dziś (siatka 2×2, ≥ 44 px).
3. Odznaki: „plik zostaje na urządzeniu”, „reguły, nie model”.

**Postęp (zastępuje dzisiejszy ekran „Duży plik — odczytuję lokalnie…”):**
1. Karta na całą szerokość: nazwa pliku (ucinana) i rozmiar („10,8 MB”).
2. Duża linia fazy: „Czytam stronę 132 z 309” → „Analizuję tabele i liczby…”.
3. Pasek 8 px, `role="progressbar"` z `aria-valuenow` w fazie 1, nieokreślony w fazie 2. Zmianę fazy ogłasza region
   `aria-live="polite"`, pojedynczych stron nie.
4. Linia pomocnicza: „Plik nie opuszcza Twojego urządzenia. Duży raport roczny na telefonie: zwykle do minuty.”
5. „Anuluj” — przycisk na całą szerokość, min. 44 px.
6. Pod kartą zostaje dzisiejszy szkielet wyniku.

**Błąd:** karta z komunikatem w zwykłych słowach. Jeśli jest ścieżka awaryjna: przycisk główny „Przetwórz na serwerze”
i pod nim, co dokładnie wyślemy: „Wyślemy plik (3,2 MB) / odczytany tekst (1,2 MB, bez pliku PDF), przeanalizujemy
w pamięci i nie zapiszemy.” Drugi przycisk: „Wybierz inny plik”. Napis w strefie wgrywania „Przesyłanie nie powiodło się”
zmienia się na „Nie udało się odczytać pliku” (nic nie było przesyłane).

**Wynik:** bez zmian w układzie. „Surowy tekst” — patrz decyzja 7.

### Desktop (1280/1440 px)

Ten sam układ w kolumnie 720 px na środku, jak dziś ekran startowy. „Anuluj” i „Przetwórz na serwerze” w jednym rzędzie
z treścią karty (do prawej), nie na całą szerokość.

## Dane

Brak zewnętrznego źródła. Źródłem liczb jest plik użytkownika. Nie ma kalendarza, crona, cache, `DatasetSpec`
ani dopisku źródła. Jedyny „kontrakt danych”: ta sama liczba w przeglądarce i na serwerze dla tego samego pliku
(kryterium 7), bo obie strony używają tego samego `reconstructPage`, tego samego buildu `legacy` pdfjs i tego samego `parseReport`.

Pliki do pomiarów i kryteriów (publiczne, nie commitujemy ich — pobierać w teście/ręcznie):
- PZU SSF 2024 (299 str., 10,8 MB): https://www.pzu.pl/_fileserver/item/1559098
- Orlen Sprawozdanie Zarządu 2025 (309 str., 10,75 MB): https://raportroczny.orlen.pl/pliki/Sprawozdanie_Zarzadu_2025.pdf
- PKO BP SSF 2024 (192 str., 3,7 MB): https://www.pkobp.pl/api/public/4166eb69-3e68-49a4-8a1f-418cd82b88f3.pdf
- Orlen Raport Zintegrowany 2023 (533 str., 74,3 MB): https://www.orlen.pl/content/dam/internet/orlen/pl/pl/zrownowazony-rozwoj/archiwum/archiwalne-raporty-niefinansowe/Raport-Zintegrowany-Grupy_ORLEN-2023.pdf.coredownload.pdf

## Prywatność — nowe brzmienie `/prywatnosc` §3 (ten sam PR)

Zamiast „Pliki wgrane do parsera sprawozdań przetwarzamy wyłącznie w pamięci w czasie analizy — nie zapisujemy ich ani ich treści.”:

> Pliki wgrane do parsera sprawozdań analizujemy w Twojej przeglądarce — ani plik, ani jego treść nie trafiają do Savori.
> Wyjątki, zawsze po Twoim kliknięciu: „Przetwórz na serwerze” (gdy przeglądarka nie poradzi sobie z plikiem) wysyła plik
> do 4 MB albo odczytany z niego tekst, a eksport (CSV, XLSX, JSON) wysyła wynik analizy — liczby oraz nazwy wierszy
> i okresów, bez pliku i bez jego pełnego tekstu. Te dane przetwarzamy wyłącznie w pamięci w czasie operacji i nie zapisujemy ich.

Po PS1b (CSV i JSON w przeglądarce) zdanie o eksporcie zawęża się do XLSX.

## Lekcje zastosowane (`docs/PRODUCT.md`)

- [x] Nic zależnego od „dziś” przed hydratacją — postęp i błędy pojawiają się dopiero po działaniu użytkownika.
- [x] Telefon 320/390 px i desktop 1280/1440 px — bez przewijania w bok (kryterium 6).
- [x] Nowe źródło w przeglądarce → CSP: nowego originu nie ma. Worker parsera ładuje się z `'self'` albo `blob:`
      (Turbopack 16.1 uruchamia workery przez `blob:`); `worker-src 'self' blob:` już jest. Sprawdzić w `next start`,
      bo w `next dev` CSP jest wyłączona. **Nie poluzowywać CSP** (`'unsafe-eval'`) bez decyzji PM.
- [x] Dane użytkownika → `/prywatnosc` w tym samym PR (sekcja wyżej).
- [x] Limit Vercela 4,5 MB na ciało — bez zmian, strażnik w eksporcie.
- [x] Długa trasa ma `maxDuration` w pliku — `/api/parser/parse` zostaje z 60 s (już tylko ścieżka awaryjna).
- [ ] Nie dotyczy: liczba z komunikatu, metodologia, kalendarz, `no-store`/cron, `internal-fetch`, `refresh=1`, parametry GUS, świeżość.

## Kryteria akceptacji

Testy jednostkowe (`npm test`):
1. `tests/parser-upload-limits.test.ts` po aktualizacji: stałe 100 MB / 800 stron / 6 MB / 240 s;
   `VERCEL_BODY_LIMIT_BYTES` = 4,5 MB i `MAX_BINARY_UPLOAD_BYTES` < limit (bez zmian). `chooseParseStrategy` zwraca
   ścieżkę przeglądarkową dla PDF 0,6 MB, 4 MB, 4,5 MB + 1 B, 40 MB i 100 MB; odrzuca 100 MB + 1 B; TXT ≤ 6 MB → przeglądarka,
   > 6 MB → odrzucenie; inny typ → odrzucenie. Istniejące testy trasy (JSON i multipart, 413 powyżej 4 MB) przechodzą bez zmian.
2. Test macierzy ścieżki awaryjnej (czysta funkcja, np. `serverFallbackFor(kind, { fileBytes, textBytes })`): każdy wiersz
   tabeli z decyzji 5 → `'file'` / `'text'` / brak, łącznie z granicami 4 MB i 3,5 MB.
3. Parytet parsera: sha256 z `JSON.stringify(parseReport(...))` bez `rawText` dla 5 fixture'ów (`microsoft-10q`,
   `cipher-digital-10q`, `kombinat-konopny-2q2026`, `nvidia-10q`, `polish-ifrs-slash`) jest równy hashom policzonym na
   `main` przed zmianą i zapisanym w teście. Istniejące `tests/parser.test.ts` przechodzą bez zmian.
4. Statyczny test w stylu `data-protection.test.ts`: moduły ścieżki przeglądarkowej (`extract-browser.ts`, worker parsera
   i jego obsługa) nie zawierają `fetch(`, `XMLHttpRequest`, `sendBeacon` ani `WebSocket`; w `src/app/parser/page.tsx`
   `/api/parser/parse` występuje tylko w funkcji ścieżki awaryjnej. W `src` nie ma już importu `"pdfjs-dist"` bez `/legacy/`.
5. Wydajność: `parseReport` na tekście PZU SSF 2024 (URL wyżej) jest ≥ 3× szybszy niż na `main` na tej samej maszynie.
   Polecenie i oba czasy w opisie PR.

Playwright na buildzie produkcyjnym (`npm run build && npm run start`, CSP włączona), 390×844 i 1440×900:
6. Każda z 4 próbek z `/parser-samples`: wynik się pokazuje, w logu sieci od kliknięcia do wyniku **0 żądań do `/api/parser/*`
   i 0 żądań POST**, 0 błędów konsoli, 0 zdarzeń `securitypolicyviolation`, `scrollWidth ≤ innerWidth` na ekranie postępu
   i wyniku. Zrzuty: start, postęp, wynik — 390 i 1440 px.
7. Parytet przeglądarka = serwer: dla 3 PDF i TXT z próbek `toJSON` z wyniku w przeglądarce (np. pobrany eksport JSON) jest
   bajt w bajt równy `toJSON(result)` z `POST /api/parser/parse` (multipart) dla tego samego pliku.
8. Duży plik przez `setInputFiles`: Orlen Sprawozdanie Zarządu 2025 (309 str.) i PZU SSF 2024 (299 str.) dają wynik;
   tekst postępu przyjmuje co najmniej 3 różne wartości „Czytam stronę N z 309”; od wyboru pliku do pokazania wyniku
   w głównym wątku nie ma zadania dłuższego niż 200 ms (PerformanceObserver `longtask`, bez renderu samego wyniku).
   Ten sam test z CPU 4× (CDP `Emulation.setCPUThrottlingRate`) kończy się wynikiem; czas w opisie PR.
9. „Anuluj” w trakcie ekstrakcji 309-stronicowego pliku: w ≤ 1 s ekran startowy, bez komunikatu błędu, licznik stron
   przestaje rosnąć, kolejny plik działa normalnie.
10. PDF z 801 stronami (wygenerowany w teście): komunikat z liczbą stron i limitem 800, bez przycisku „Przetwórz na serwerze”,
    0 żądań sieci.
11. Ścieżka awaryjna:
    - `window.Worker` podmieniony tak, by rzucał (`addInitScript`), próbka Cipher → przycisk z „odczytany tekst”. Bez kliknięcia
      0 żądań. Po kliknięciu dokładnie 1 POST `/api/parser/parse` z `Content-Type: application/json` (w ciele brak `%PDF`)
      i wynik na ekranie.
    - Zablokowany `/pdfjs/*` (`page.route` → abort), próbka Cipher (0,6 MB) → przycisk „Wyślemy plik”. Kliknięcie = 1 POST
      multipart i wynik. To samo z plikiem 10,75 MB → brak przycisku, komunikat o komputerze.
12. Eksport na próbce Microsoft: CSV, XLSX i JSON pobierają się jak dziś (1 POST `/api/parser/export` na format, w ciele
    `rawText` pusty). Strażnik > 4 MB ma test jednostkowy (czysta funkcja) — bez wywołania sieci i z komunikatem.
13. „Surowy tekst” po PZU SSF 2024: w DOM najwyżej 2000 linii i notka „Pokazano 2000 z 13 878 wierszy…”. Wyszukanie frazy
    z linii > 2000 ją pokazuje.
14. WebKit (Playwright `webkit`), 390 px, próbka Microsoft: wynik, 0 błędów konsoli.
15. `/prywatnosc` ma zdanie z sekcji „Prywatność” (dosłownie), opis `/parser` (`copy.pl.ts`, metadane w `src/app/parser/layout.tsx`)
    nie mówi już „na serwer leci sam tekst”, „max 40 MB” ani „Duży plik — odczytuję lokalnie”. `AGENTS.md` (sekcja `/parser`)
    opisuje nowe limity, worker, build `legacy`, ścieżkę awaryjną i strażnik eksportu.
16. Definicja „zrobione”: `tsc`, `npm test`, eslint zmienionych plików, `npm run build` — czysto.
17. Po wdrożeniu (właściciel albo PM z kontem): `https://savori.space/pdfjs/pdf.worker.legacy.min.mjs` = 200, a wgranie
    Orlen Sprawozdanie Zarządu 2025 na telefonie daje wynik. Model telefonu i czas dopisać do `docs/ROADMAP.md` (PS1).

## Lista zmian (plik po pliku, szacunek kodu aplikacji ~300–340 linii bez testów)

| Plik | Zmiana | ~linii |
|---|---|---|
| `src/lib/parser/limits.ts` | stałe z decyzji 3; komentarz: limit Vercela dotyczy już tylko ścieżki awaryjnej | 15 |
| `src/lib/parser/upload-strategy.ts` | `chooseParseStrategy` → przeglądarka / odrzucenie (typ, rozmiar); `serverFallbackFor` (decyzja 5) | 35 |
| `src/lib/parser/extract-errors.ts` | rodzaj błędu (`kind`) obok komunikatu: hasło, uszkodzony, za dużo stron, za dużo tekstu, techniczny, czas, anulowano | 15 |
| `src/lib/parser/extract-browser.ts` | import `pdfjs-dist/legacy/build/pdf.mjs`, worker `/pdfjs/pdf.worker.legacy.min.mjs`, `onPage(page, pages)`, `AbortSignal`, limity 800 stron i 6 MB, bez własnego 45 s | 30 |
| `src/lib/parser/parse.worker.ts` (nowy) | `onmessage` → `parseReport` → `postMessage({ ok, result } \| { ok: false, message })` | 20 |
| `src/lib/parser/parse-in-worker.ts` (nowy) | `new Worker(new URL("./parse.worker.ts", import.meta.url), { type: "module" })`, obietnica, `terminate` przy anulowaniu/czasie, błąd rodzaju „worker” | 45 |
| `src/lib/parser/patterns.ts` | pamięć `normalizeLabel` (decyzja 8) | 10 |
| `src/app/parser/page.tsx` | ścieżka przeglądarkowa dla każdego pliku, stan postępu, `AbortController` + 240 s, stan błędu z plikiem/tekstem do ścieżki awaryjnej, dwie funkcje serwerowe (plik, tekst) | 70 |
| `src/components/parser/ParseProgress.tsx` (nowy) | karta postępu z „Anuluj” i karta błędu z „Przetwórz na serwerze” | 50 |
| `src/components/parser/ExportMenu.tsx` | strażnik 4 MB przed POST | 8 |
| `src/components/parser/RawTextInspector.tsx` | najwyżej 2000 linii + notka | 12 |
| `src/components/parser/UploadZone.tsx` | „Nie udało się odczytać pliku” | 3 |
| `src/lib/parser/copy.pl.ts` | teksty z sekcji „Co widzi użytkownik” i komunikaty błędów | 20 |
| `next.config.ts` | kopiowanie `legacy/build/pdf.worker.min.mjs` → `public/pdfjs/pdf.worker.legacy.min.mjs` | 3 |
| `src/app/parser/layout.tsx` | opis: analiza w przeglądarce, plik nie wychodzi z urządzenia | 2 |
| `src/app/prywatnosc/page.tsx` | §3 (sekcja „Prywatność”) | 8 |
| `AGENTS.md` | sekcja `/parser` (kryterium 15) | — |
| `tests/parser-upload-limits.test.ts`, `tests/parser-browser-path.test.ts` (nowy), `tests/parser.test.ts` lub nowy plik parytetu | kryteria 1–5 | testy |

Jeśli kod aplikacji przekroczy ~360 linii — najpierw wydzielić decyzję 7 (`RawTextInspector`) do PS1b, potem zgłosić PM.
Jeśli Turbopack 16.1 nie zbuduje działającego workera pod CSP w `next start` — stop i raport do PM (bez luzowania CSP).
Opcje do decyzji: worker zbudowany osobno do `public/` jak worker pdfjs albo aktualizacja Next do 16.2 (workery jako pliki, nie `blob:`).

## Poza zakresem

- Jakość parsowania (krok 2). Pomiar wstępny 07.11 na 6 polskich raportach: emitent wykryty w 0 z 6. Przychody poprawne
  tylko dla Żabki: 23 797 / 19 806 mln zł, zgodnie z komunikatem (23,797 mld zł, +20,2% r/r). Doklejone są jednak kolumny
  20,2 / 87,2 / 87 (20,2 to dynamika r/r), a zysk netto wyszedł 1,7 zamiast 593 mln zł. PZU: zysk netto −2562 zamiast
  ~5,3 mld zł dla akcjonariuszy. Orlen SSF: przychody 37. Platige: przychody 153 670 143 650 (dwie liczby sklejone w jedną).
  PKO BP: brak przychodów (układ bankowy).
- CSV i JSON w przeglądarce (PS1b), XLSX w przeglądarce (wymaga decyzji o CSP i 252 KB gzip).
- OCR skanów i PDF-ów z tekstem w krzywych, ESEF (xhtml/iXBRL), zapisywanie wyników na koncie, wiele plików naraz.
- Usuwanie trasy `/api/parser/parse` lub jej trybu JSON — zostają jako ścieżka awaryjna.
- Telemetria błędów parsera. Świadomy koszt: błędy z przeglądarki nie trafią do logów Vercela. Krok 2 opiera się
  na raportach od właściciela, nie na logach. Monitoring błędów przeglądarki to ROADMAP 12.

## Działania właściciela

1. **Przyślij raporty, na których parser zawiódł** (PDF albo link) i napisz, które liczby są złe i jakie są prawidłowe.
   To wejście do kroku 2 i test kroku 1 na Twoich plikach.
2. **Po wdrożeniu sprawdź na swoim telefonie** największy raport, jaki masz. Podaj model telefonu, wersję iOS/Androida,
   czas i czy wynik się pokazał (kryterium 17). Starszego iPhone'a (iOS < 17.4) nie da się odtworzyć w Playwright.
