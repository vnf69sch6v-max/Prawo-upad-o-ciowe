# Japonia: przegląd widzi nastroje

- **Krok:** po samym Tankanu. Liczba jest na gospodarce. Przegląd ma ją pokazać obok płac, produkcji, sprzedaży, PKB i bilansu.
- **Nie to:** drugi wskaźnik Tankanu (firmy spoza przemysłu) na kafelku przeglądu. Zostaje na stronie gospodarki.

## Co widzi użytkownik

`/japonia`, rząd „Praca i gospodarka”.

- Kafel „Nastroje firm”: 24, zmiana +2 p.p., dopisek „wrzesień 2026 · duże firmy przemysłowe”.
- Hero może wybrać ten sygnał, gdy badanie jest świeże. Tekst: „Nastroje firm przemysłowych lepsze”, data publikacji 1 października, kolejny odczyt 14 grudnia.
- Na kafelku hero okres brzmi „wrzesień 2026”, nie „III kwartał”.

## Kryteria

1. `rankJpHero` dla 22 → 24 i dnia 2.10 daje publikację 1.10, wiek 1 dzień, zmianę +2 i nagłówek o lepszych nastrojach.
2. Zdanie podaje 24 i +2,0 p.p. oraz „wrzesień 2026”.
3. Kafel jest w rzędzie gospodarki. Siatka ma 6 kolumn i na telefonie nie wychodzi poza ekran.
4. `tsc` i `npm test` zielone.

## Recenzja

Spełnione. Test datuje badanie na 1.10 i zmianę +2. Kafel 24 jest w rzędzie gospodarki, na 320, 390 i 1440 bez poziomego przewijania. Werdykt: SHIP.
