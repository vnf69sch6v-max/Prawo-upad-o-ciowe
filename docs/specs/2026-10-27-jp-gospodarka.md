# Japonia: produkcja przemysłowa

- **Krok:** po płacach. Polska ma gospodarkę; Japonia dostaje pierwszy wskaźnik tej sekcji.
- **Nie to:** wstępny odczyt z 30 września (indeks 102,6, −1,7%). Na stronie jest korekta.

## Co widzi użytkownik

`/japonia/gospodarka`, zakładka „Gospodarka”. Na przeglądzie ta zakładka się nie świeci.

- Duża liczba: zmiana wobec poprzedniego miesiąca, indeks wyrównany sezonowo. Sierpień 2026: −2,4%.
- Obok: poziom indeksu 101,9 (baza 2020) i rok do roku +2,7% z indeksu bez korekty.
- Wykres obu indeksów.
- Termin następnego komunikatu końcowego (13:30 JST) po hydratacji.
- Dopisek Statistics Dashboard.

## Dane (sprawdzone 27.10.2026 z komunikatem METI z 15.10.2026, 13:30 JST)

Kod `0502070301000090010`, nazwa zawiera `鉱工業生産指数` i `2020年基準`. Stara baza jest odrzucana.

| Szereg | IsSeasonal | Sierpień 2026 |
|---|---|---|
| Wyrównany sezonowo | 2 | 101,9 (lipiec 104,4 → −2,4% m/m) |
| Surowy | 1 | 90,8 (sierpień 2025: 88,4 → +2,7% r/r) |

Wrzesień jako 確報: 16.11.2026, 13:30 JST. Wstępny: 30.10, 8:50 — Dashboard go zastępuje.

Cache `jp_data/industry_v1`, trasa `/api/jp/industry`, świeżość `jp-industry`, cron `jp` i `refresh`.

## Kryteria

1. Parser czyta 101,9 i 90,8; zmiana miesiąca to −2,4%, rok do roku +2,7%.
2. Szereg sezonowy odrzucony, gdy prosimy o surowy.
3. `expectedJpIndustry` przełącza się o 13:30 JST w dniu korekty, nie w dniu wstępnego.
4. Zakładka Przegląd nie jest aktywna na `/japonia/gospodarka`.
5. `tsc` i `npm test` zielone.
