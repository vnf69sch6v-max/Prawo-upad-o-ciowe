# Japonia: sprzedaż detaliczna

- **Krok:** dokończenie gospodarki po produkcji. PKB zostaje na później.
- **Nie to:** wstępny odczyt z 30 września (13 052 mld jenów, +2,7%). Nie to też stopa wobec 2024 — od stycznia 2025 poziomy są po spisie i bez współczynnika łączenia nie da się jej uczciwie policzyć.

## Co widzi użytkownik

Na `/japonia/gospodarka`, pod produkcją:

- Rok do roku: **+2,9%** za sierpień 2026.
- Poziom: **13 072 mld jenów** (jednostka źródła 10億円).
- Wykres stopy od stycznia 2026, gdy oba miesiące są już po spisie.
- Zdanie, że to komunikat końcowy i ceny bieżące.

## Dane (sprawdzone 27.10.2026)

Kod `0601010201010010000`, nazwa `小売業販売額（名目）`, jednostka `10億円`. Sierpień 2026: 13 072, sierpień 2025: 12 706, czyli +2,9% po zaokrągleniu do 0,1. Komunikat końcowy 15.10.2026, 13:30 JST. Dashboard zaktualizowany tego dnia do 13 072.

Ministerstwo liczy stopę z kwot w jenach, nie z poziomów zaokrąglonych do 10 mld. Różnica bywa 0,1 p.p. W sierpniu 2026 zaokrąglenie poziomów i tak daje 2,9.

Cache `jp_data/retail_v1`, trasa `/api/jp/retail`, świeżość `jp-retail`, cron `jp` i `refresh`.

## Kryteria

1. Parser czyta 13 072 i wymaga jednostki `10億円`.
2. Rok do roku sierpnia 2026 to 2,9. Wobec sierpnia 2024 stopa nie powstaje.
3. `expectedJpRetail` przełącza się 15.10 o 13:30 JST, a 15.07 (dzień inny niż produkcja) przełącza maj.
4. `tsc` i `npm test` zielone.
