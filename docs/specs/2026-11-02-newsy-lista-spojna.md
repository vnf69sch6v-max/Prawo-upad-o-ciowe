# Lista /newsy spójna z Przeglądem (2026-11-02)

ROADMAP 4c, z REVIEW PM z 30.10. Bez nowych danych, źródeł i cronów. To tylko wygląd listy.

## Problem
Od 30.10 newsy na Przeglądzie (`DailyDigestCard`) są spokojne: neutralne tagi, cały wiersz jest linkiem, ikona stoi przy tytule, relacje są dyskretne. Ten sam news na `/newsy` wygląda inaczej:
- „Pozostałe” (`NewsRow`): czerwone obrysowane tagi (`CategoryTag` → `mk-tag-brand`), czerwone „X godz. temu” (`text-mk-brand`) w lewej kolumnie i w linii źródła, zielone pigułki relacji (`CorroborationBadge`, `bg-mk-positive/10`), samotna ikona `ExternalLink` przy prawej krawędzi.
- „Najważniejsze” (`LeadStory`): czerwona wypełniona pigułka (`mk-tag-brand-fill`), czerwony tag kategorii, czerwony czas, `ExternalLink` na końcu linii.

Przy 15–30 wierszach czerwień jest wszędzie, więc nic się nie wyróżnia i całość czyta się jak lista błędów. Zieleń przy relacjach sugeruje „dobrą wiadomość”, a znaczy tylko „kilka redakcji o tym pisze”. Użytkownik przegląda nagłówki i pyta: co jest ważne i skąd to jest. Hierarchia ma to pokazać bez kolorów alarmowych.

## Co widzi użytkownik
Wspólny komponent `src/components/ui/NewsRow.tsx` eksportuje:
- `NEUTRAL_TAG`;
- `NewsTag`;
- `Corroboration({ n, wire?, alsoIn?, compact? })`;
- `ExternalMark` (ikona `ArrowUpRight` przy tytule, `aria-label` „(otwiera się w nowej karcie)”).

`DailyDigestCard` i `/newsy` importują te eksporty, a lokalne kopie znikają.

**Wiersz listy, telefon (320–430 px).** Cały wiersz to jeden `<a>` o wysokości ≥ 44 px, a dla `touch:` zostaje `min-h-11`. Od góry:
1. Tytuł (15 px, semibold) i `ExternalMark` na końcu tytułu.
2. Linia „źródło · czas”: `text-mk-muted`, czas `tabular-nums`, bez pogrubienia czerwienią.
3. Tagi: `NewsTag` (neutralny), `LangTag`, `Corroboration`, `Flags` (promocja, opinia).

`Corroboration`:
- przy N ≥ 2: ikona `Layers` i tekst `corroborationLabel(n)`, kolor muted, bez tła; `compact` może dać „N relacje”, ale nie samą cyfrę;
- przy `wire` i N < 2: ikona `Copy` i „depesza”, muted;
- `title` z `alsoIn` zostaje.

Brak ikony przy prawej krawędzi.

**Wiersz listy, od sm.** Lewa kolumna czasu (`w-12`) zostaje, ale jest szara (`text-mk-faint` lub `text-mk-muted`, `tabular-nums`, bez `font-semibold`). Pozostała kolejność jak wyżej.

**Karta „Najważniejsze”.** Akcent marki zostaje tylko w dwóch miejscach: pasek lewej krawędzi (`border-l-mk-brand`) i etykieta.
- **Decyzja:** etykieta to tekst „Najważniejsze” z ikoną `Flame`, w kolorze `text-mk-brand`, uppercase 11 px, bez wypełnionej pigułki. Dwa wypełnione czerwone elementy (pasek i pigułka) obok siebie krzyczały. Sam tekst w kolorze marki wystarcza, bo leży przy pasku.
- Tag kategorii to `NewsTag`, a relacje to `Corroboration` (pełna etykieta).
- Czas jest muted. „także: …” zostaje.
- `ExternalMark` stoi przy tytule, a nie na końcu linii meta.

**Desktop 1440 px.** Układ (lewy panel, filtry, sortowanie, „Pokaż kolejne”) bez zmian, z tymi samymi kolorami wierszy co wyżej. Hover tytułu może nadal być `group-hover:text-mk-brand`, bo to stan interakcji, a nie stały kolor.

Bez zmian funkcjonalnych: filtry, wyszukiwarka, źródła, sortowanie, „Pokaż kolejne”, `NewsDayCard`, `LangTag`, `Flags`, czas względny dopiero po `mounted`.

## Dane
Brak zmian. Te same pola `NewsItem` (`corroboration`, `wire`, `alsoIn`, `section`, `lang`, `isAd`, `isOpinion`), bez nowych zapytań i bez zmian CSP oraz `FRESHNESS_DATASETS`.

## Lekcje zastosowane
- [x] Nic z „dziś” przed hydratacją: czas względny dalej za `mounted` (`useIsClient`).
- [x] 320/390 i 1440 px bez przewijania w bok.
- [—] Liczby, metodologia, kalendarz, świeżość, CSP: nie dotyczy, bo ten krok nie ma nowych danych ani źródeł.

## Kryteria akceptacji
1. Na `/newsy` (390 i 1440) `document.querySelectorAll('main .mk-tag-brand, main .mk-tag-brand-fill').length === 0`. Dotyczy to listy „Pozostałe” i karty „Najważniejsze”. `grep -n "mk-tag-brand" src/app/newsy/page.tsx src/components/ui/NewsRow.tsx` nic nie zwraca.
2. Na liście i w leadzie nie ma `bg-mk-positive` ani `text-mk-positive`. Elementy `<time>` w wierszach i w leadzie nie mają klasy `text-mk-brand`, tylko muted lub faint i `tabular-nums`.
3. Przy 390 px każdy wiersz listy to dokładnie jeden `<a>` (w `article` nie ma innych linków ani przycisków), a każdy `a.getBoundingClientRect().height >= 44`. Skrypt Playwright wypisuje minimum.
4. Na `/newsy` nie ma samotnej ikony linku: ikona zewnętrzna (`ExternalMark`) jest potomkiem elementu tytułu (`h2`/`h3`) w każdym wierszu i w leadzie. `ExternalLink` nie jest już importowany w `src/app/newsy/page.tsx`.
5. Etykieta „Najważniejsze” to tekst w kolorze marki bez tła (jej computed `background-color` jest przezroczysty). Lead zachowuje pasek `border-l-mk-brand`.
6. `src/components/ui/DailyDigestCard.tsx` importuje `NEUTRAL_TAG` (lub `NewsTag`), `Corroboration` i `ExternalMark` z `@/components/ui/NewsRow`. `grep -n "const NEUTRAL_TAG\|function Corroboration" src/components/ui/DailyDigestCard.tsx src/app/newsy/page.tsx` nic nie zwraca. Przegląd przy 390 wygląda jak przed zmianą (zrzut).
7. Wiersz z `corroboration >= 2` pokazuje tekst z `corroborationLabel` (nie samą cyfrę), a wiersz z `wire` i N < 2 pokazuje „depesza”. Oba są muted. Zrzut lub wyciąg z DOM pokazuje po jednym przykładzie, jeśli feed taki ma, a jeśli nie, mówi to wprost.
8. `document.documentElement.scrollWidth === document.documentElement.clientWidth` na `/newsy` przy 320, 390 i 1440 px oraz na Przeglądzie przy 390.
9. 0 błędów konsoli (w tym #418) i 0 `securitypolicyviolation` na `/newsy` i Przeglądzie w buildzie produkcyjnym (`npm run build && npx next start`).
10. Zrzuty przed i po: `/newsy` przy 390 (lead i 3 pierwsze wiersze) i 1440 (cały pierwszy ekran) dołączone do REVIEW.
11. Filtry kategorii i źródła, wyszukiwarka, sortowanie i „Pokaż kolejne” działają jak przed zmianą. Sprawdzenie ręczne lub Playwright: jedno kliknięcie każdego zmienia liczbę lub kolejność wierszy.
12. `npx tsc --noEmit -p .`, `npm test`, `npx eslint src/components/ui/NewsRow.tsx src/components/ui/DailyDigestCard.tsx src/app/newsy/page.tsx` i `npm run build` są zielone.

## Poza zakresem
- `RelatedNews` / `CategoryNews` (strony tematyczne) i `/podsumowanie`: też mają czerwone tagi i pigułki. To osobny krok, ROADMAP 4d, który ma użyć tych samych eksportów z `NewsRow.tsx`.
- Treść briefu: sprawdzenie, czy punkty „Dane” niosą wniosek, zostaje w 4c jako osobna kontrola PM.
- Nowe źródła i zmiana rankingu ważności.

## Akcje właściciela
Brak.

## Wynik / REVIEW (2.11.2026, PM: SHIP)
Gałąź `claude/newsy-lista`. Weryfikacja na buildzie produkcyjnym (`next start`, Playwright) i przegląd diffu.

| # | Kryterium | Wynik |
|---|---|---|
| 1 | `main .mk-tag-brand, .mk-tag-brand-fill` | 0 (przed: 32); grep w `page.tsx` i `NewsRow.tsx` pusty — PASS |
| 2 | brak `mk-positive`, `<time>` bez `text-mk-brand` | 0 elementów z `mk-positive`, 0 `<time>` z `mk-brand`; czas `tabular-nums`, faint/muted — PASS |
| 3 | jeden link na wiersz, ≥ 44 px | każdy `article` ma dokładnie 1 link; min. wysokość 88 / 68 / 63 px (320 / 390 / 1440) — PASS |
| 4 | ikona przy tytule | `ExternalMark` w `h3` każdego wiersza i w `h2` leada; `ExternalLink` nie jest importowany — PASS |
| 5 | etykieta „Najważniejsze” | `background-color: rgba(0,0,0,0)`, pasek `border-l-mk-brand` zostaje — PASS |
| 6 | wspólne eksporty | `DailyDigestCard` importuje `NewsTag`, `Corroboration`, `ExternalMark`; lokalne kopie usunięte. Zrzut Przeglądu 390 nie obejmuje karty newsów — zgodność oceniona z diffu (te same klasy, ten sam rozmiar ikon) — PASS z zastrzeżeniem |
| 7 | relacje | „Binance…” pokazuje „2 niezależne relacje” (muted, `Layers`). W feedzie nie było pozycji `wire` z N < 2 — „depesza” sprawdzona tylko w kodzie (`Corroboration`, `wire` + `compact`) — PASS z zastrzeżeniem |
| 8 | brak przewijania w bok | `/newsy` 320/320, 390/390, 1440/1440; Przegląd 390/390 — PASS |
| 9 | konsola | 0 błędów na `/newsy` i Przeglądzie (build produkcyjny) — PASS |
| 10 | zrzuty przed/po | 390 (lead + lista) i 1440 dołączone do REVIEW — PASS |
| 11 | funkcje | „Najnowsze” zmienia pierwszy wiersz; kategoria 30→14 wierszy; szukajka filtruje; „Wyczyść filtry”; „Pokaż kolejne” 30→60 — PASS |
| 12 | CI | `tsc --noEmit` OK, `npm test` 514 passed, eslint 3 plików OK, `npm run build` OK — PASS |

Poza specyfikacją, poprawione przy okazji: kolumna czasu od `sm` ma `w-[5.5rem] whitespace-nowrap`, bo przy `w-12` „1 godz. temu”
łamało się na dwie linie.

Znalezione, poza zakresem tego kroku (przeniesione do ROADMAP 4d): `corroborationLabel` daje „5 niezależne relacje” zamiast
„5 niezależnych relacji”. Błąd był wcześniej (lead na `/newsy`, Przegląd, `RelatedNews`). Po tej zmianie widać go też w wierszach
listy, bo pokazują pełną etykietę zamiast samej cyfry. Etykieta wchodzi do briefu i whitelist walidatora w `summary.ts`, więc trzeba
ją zmienić razem z tamtym kodem i testem, a nie przy zmianie wyglądu.
Kontrola treści briefu („Dane” z wnioskiem) jest teraz osobnym punktem ROADMAP 4c'.

Po REVIEW (2.11): wyświetlanie relacji w `Corroboration` odmienia `relationsLabel` (`src/components/ui/NewsRow.tsx`,
test `tests/news-row.test.ts`: 2/4/22 „niezależne relacje”, 5/12 „niezależnych relacji”). `corroborationLabel` bez zmian (brief, walidator).
