# Japonia: przegląd

- **Krok:** J3 z `docs/ROADMAP.md`. Inflacja, rynki i praca już są, więc strona kraju może działać jak polski Przegląd.
- **Nie to:** newsy z polskich RSS na hero Japonii. Nie ma tu japońskiego źródła wiadomości.

## Co widzi użytkownik

`/japonia` to przegląd. Inflacja jest na `/japonia/inflacja` (zakładka Inflacja nie świeci się na przeglądzie).

- Hero: dwa sygnały. Kolejność = świeżość publikacji × skala zmiany. Jen i JGB 10Y wchodzą tylko przy ruchu ≥2σ i notowaniu z ostatnich 3 dni.
- Zdania o inflacji liczą cel BOJ 2%, nie cel NBP.
- Wiek odczytu bierze japoński kalendarz (CPI krajowy, Labour Force Survey), nie kalendarz GUS.
- Pod hero: kafle CPI, bezrobocia (sezonowo), USD/JPY, stopy BOJ i JGB 10Y, każdy z linkiem do sekcji.
- „Dziś” dopiero po hydratacji. Dopiski Statistics Dashboard i Banku Japonii są na stronie.

## Kryteria

1. CPI za wrzesień 2026 ma datę publikacji 2026-10-23 i przy „dziś” 2026-10-27 wygrywa ze starszym bezrobociem.
2. Spokojny jen i płaska 10-latka nie wchodzą do hero. Skok jena wchodzi.
3. Zakładka Inflacja jest aktywna na `/japonia/inflacja`, Przegląd na `/japonia`.
4. `tsc` i `npm test` zielone.
