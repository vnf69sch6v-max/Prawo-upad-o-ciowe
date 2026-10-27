# Japonia: przegląd widzi gospodarkę i płace

- **Krok:** po PKB. Hero na `/japonia` powstało, zanim były płace, produkcja, sprzedaż i PKB.
- **Nie to:** nowe źródło. Te same cache, co strony sekcji.

## Co widzi użytkownik

Na `/japonia` hero nadal bierze dwa sygnały. Kandydaci doszli:

- płace nominalne (r/r, komunikat końcowy),
- produkcja (zmiana indeksu sezonowego wobec poprzedniego miesiąca — ta liczba jest w komunikacie),
- sprzedaż detaliczna (r/r z poziomów),
- PKB realny (wobec poprzedniego kwartału, nie w skali roku).

Daty publikacji są z ich kalendarzy, nie z GUS. Jen i JGB dalej tylko przy ruchu ≥2σ.

Pod spodem drugi rząd kafli: płace, produkcja, sprzedaż, PKB.

## Kryteria

1. Płace za sierpień mają datę 23.10, produkcja 15.10, PKB za II kwartał 8.09.
2. Spadek indeksu z 104,4 do 101,9 daje nagłówek „Produkcja spadła” i tekst z 101,9.
3. `tsc` i `npm test` zielone.
