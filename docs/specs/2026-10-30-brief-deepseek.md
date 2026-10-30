# Brief dnia i tygodnia generowany przez DeepSeek (2026-10-30)

## Problem i wartość
Płacący użytkownik rano chce w 1 minutę wiedzieć: jakie dane wyszły, co się zmieniło i co ważnego w newsach PL
i świata. Mamy liczby (cache) i newsy, brak jednej strony interpretacji. Brief dzienny (~1 strona) codziennie,
tygodniowy w poniedziałek (podsumowanie tygodnia + kalendarz publikacji na bieżący tydzień).

## Co widzi użytkownik
- Telefon: na /newsy karta **Brief dnia · {data}**: 1 zdanie-teza, 3–5 punktów z liczbami
  (każda z okresem i źródłem w nawiasie), „Na świecie” 2–3 punkty, „Dziś w kalendarzu”. Rozwijane „Cały brief”.
  Stopka: „Wygenerowane automatycznie przez model DeepSeek z danych GUS/NBP/… i nagłówków mediów; liczby
  sprawdzone z naszymi danymi. {godzina generacji}”. W poniedziałek zakładka **Brief tygodnia**.
- Desktop 1440: ta sama karta w kolumnie czytelnej (max ~70 zn./wiersz). UI wg `mobile-designer`.
- Brak briefu z dziś → pokazujemy ostatni z wyraźną datą; brak żadnego / brak klucza → karta ukryta (bez błędu).

## Dane i model (sprawdzone 2026-10-30, api-docs.deepseek.com/quick_start/pricing)
- Endpoint `POST https://api.deepseek.com/chat/completions` (OpenAI-kompatybilny), model **`deepseek-flash`**
  (= DeepSeek-V4.1-Flash-1017; stara nazwa `deepseek-v4-flash` jest przyjmowana, ale model wycofany — nie używać).
  **Domyślnie tryb thinking** — trzeba go jawnie wyłączyć (parametr wg „Thinking Mode guide”; implementacja weryfikuje,
  że odpowiedź nie zawiera `reasoning_content`, inaczej odrzuca).
- Ceny USD/1M tokenów (flash): wejście cache-miss 0,15 off-peak / 0,30 peak, cache-hit 0,003 / 0,006; wyjście 0,60 / 1,20.
  Peak: 01–04 i 06–10 UTC pn–pt. Cron **05:10 UTC** (off-peak; jitter Hobby mieści się w 05:00–05:59).
  Szacunek: 10k wej. + 1,5k wyj. ≈ 0,0024 USD/dzień; tydzień ~0,005 USD → < 0,10 USD/mies.
- Twarde limity: wejście ≤ 12 000 tokenów (szacunek znaki/3, przycinamy newsy, nie liczby), `max_tokens` 1 200
  (dzień) / 2 000 (tydzień), `temperature` ≤ 0,3, timeout 30 s, 1 próba + 1 retry. Koszt z `usage` zapisany w logu crona.
- Wejście: wyłącznie zweryfikowane liczby z cache (jak `src/lib/news/summary.ts` / `daily-macro.ts`: wartość, okres,
  źródło) + top 15 newsów PL i 10 zagranicznych (tytuł + lead, z feedu wg spec `2026-10-30-newsy-zagraniczne`).
- **Walidator liczb**: każda liczba w odpowiedzi (po normalizacji 4,9 / 4.9 / „4,9%”) musi wystąpić we wejściu
  (daty briefu dozwolone; liczebniki słowne — „trzeci”, „dwa” — tylko te obecne we wejściu, jak w `summary.ts`). Brief z obcą liczbą → **nie publikujemy**, zostaje poprzedni, log `partial`.
- Zapis: Firestore przez `setServerCache` (`toStored`), klucze `digest/brief_daily_v1` i `digest/brief_weekly_v1`. Strona/route tylko czyta (`peek`); żadnego wywołania DeepSeek w renderze.
- Bez `DEEPSEEK_API_KEY` funkcja wyłączona: cron odpowiada `skipped`, UI ukryte, `npm test`/build bez klucza zielone.
- Cron `brief` w `vercel.json` + grupa w `CRON_SPECS`, `maxDuration` ≥ suma (testy `cron-runs`, `function-limits`).
  Freshness: `DatasetSpec` `news-brief` — **nie w tym PR**, osobny krok (ROADMAP 4a). Do tego czasu brak digestu
  przy ustawionym kluczu = `error` → przebieg „Częściowo” w dzienniku cronów.
- Grok zostaje bez zmian. Serwer → DeepSeek, przeglądarka nic nie woła → CSP bez zmian.
- /prywatnosc w tym samym PR: DeepSeek (Chiny) jako dostawca generowania tekstu; wysyłamy tylko publiczne dane
  statystyczne i publiczne nagłówki, **żadnych danych użytkowników** (test: wejście promptu budowane bez dostępu do sesji/uid).

## Lekcje zastosowane
- [x] Liczby tylko z naszego zweryfikowanego cache, okres + źródło przy każdej.  - [ ] Freshness (ROADMAP 4a)  - [x] log crona.
- [x] Generacja tylko w cronie, strona czyta Firestore.  - [x] `toStored`.  - [x] Nic z „teraz” przed hydracją.

## Kryteria akceptacji
1. `npm test`: walidator odrzuca odpowiedź z liczbą spoza wejścia, akceptuje „4,9%” gdy wejście ma 4.9; daty przepuszcza.
2. `npm test`: budowa promptu respektuje limit 12k tokenów (przycina newsy, zachowuje wszystkie liczby).
3. `npm test`: bez `DEEPSEEK_API_KEY` funkcja zwraca `skipped`, nie rzuca; z mockiem `fetch` wysyła model
   `deepseek-flash`, `max_tokens` ≤ limit, wyłączony thinking; odpowiedź z `reasoning_content` odrzucona.
4. `npm test`: koszt liczony z `usage` wg tabeli cen (peak/off-peak) i zapisany w wpisie crona.
5. `npm test`: cron w `vercel.json` ma grupę w `CRON_SPECS`; limity funkcji zgodne.
6. Ręcznie z kluczem: `curl -H "Authorization: Bearer $CRON_SECRET" /api/cron/brief` → zapis w Firestore (sealed), wpis w `health/cron_runs` z kosztem.
7. Każda liczba w opublikowanym briefie zgadza się z wartością na odpowiedniej stronie serwisu (PM sprawdza ręcznie 3).
8. Playwright 390/1440 /newsy: karta widoczna, 0 przewijania w bok, 0 błędów konsoli, 0 naruszeń CSP; bez klucza karta ukryta.
9. /prywatnosc zawiera DeepSeek i zakres danych; `tsc`, eslint, `npm run build` czyste.

## Poza zakresem
Link do briefu z Przeglądu (osobny krok), archiwum briefów po dacie, brief per użytkownik/watchlista, czat, tłumaczenie newsów, brief JP osobno, e-mail/push.

## Akcje właściciela
Założyć konto na platform.deepseek.com, doładować saldo (np. 2 USD), utworzyć klucz i wpisać `DEEPSEEK_API_KEY`
w Vercel → Project → Settings → Environment Variables (Production), redeploy.
