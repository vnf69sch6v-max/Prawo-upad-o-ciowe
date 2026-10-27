# Japonia: płace (Monthly Labour Survey)

- **Krok:** J4 z `docs/ROADMAP.md`. Na `/japonia/praca` obok bezrobocia.
- **Nie to:** wstępny odczyt (速報). Dashboard oddaje liczbę po korekcie (確報). Nie to też płace realne wobec CPI ogółem (w komunikacie 2,0% — osobna miara).

## Co widzi użytkownik

Na `/japonia/praca`, pod bezrobociem:

- Płace nominalne: 3,9% r/r za sierpień 2026 (zakłady od 5 pracowników).
- Płace realne: 1,6% r/r, ten sam miesiąc, wobec CPI bez przypisanego czynszu właściciela.
- Wykres obu szeregów.
- Zdanie mówi, że to komunikat końcowy.

## Dane (sprawdzone 27.10.2026 z komunikatem MHLW z 23.10.2026, 8:30 JST)

| Szereg | Kod | Ostatni odczyt | Komunikat |
|---|---|---|---|
| Nominalne | `0302020000000030000` | 3,9%, 2026-08 | 311 563 jenów, +3,9% (確報; wstępne 7.10 było +3,8%) |
| Realne | `0302030201010030010` | 1,6%, 2026-08 | +1,6% wobec CPI bez czynszu właściciela |

Nazwa nominalna nie może zawierać 実質. Wrzesień wychodzi jako 確報 25.11.2026 o 8:30 JST.

Cache `jp_data/wages_v1`, trasa `/api/jp/wages`, świeżość `jp-wages`, cron `jp` i `refresh`. Strona tylko zagląda do cache.

## Kryteria

1. Parser czyta 3,9% i 1,6% za sierpień 2026 z utrwalonych odpowiedzi.
2. Szereg realny odrzucony konfiguracją nominalną.
3. `expectedJpWages` przełącza się o 8:30 JST w dniu 確報, nie w dniu 速報.
4. `tsc` i `npm test` zielone.
