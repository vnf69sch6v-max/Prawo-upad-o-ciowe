# Japonia: ceny usług bez transportu międzynarodowego

- **Krok:** po aktywności usług. Łączny indeks cen usług dla firm jest już na stronie. Wrześniowy skok z 3,5% do 3,7% widać dopiero przy mierze, która ten transport odcina.
- **Nie to:** osobna strona i osobna świeżość. To ten sam komunikat Banku Japonii. Nie to też: wkład frachtu w punktach procentowych wyliczany u nas.

## Co widzi użytkownik

`/japonia/inflacja`, w sekcji cen usług dla firm.

- Nagłówek zostaje: +3,7% r/r, indeks 115,5, +0,3% m/m, plakietka „wstępne”.
- Obok: +2,9% bez transportu międzynarodowego. W zdaniu: tyle samo co miesiąc wcześniej.
- Wykres ma dwie linie.
- W „Jak czytać”: co Bank wycina z tej miary (żegluga oceaniczna, loty międzynarodowe pasażerskie i towarowe, poczta międzynarodowa).

## Dane (sprawdzone 28.10.2026 z PDF Banku Japonii, komunikat 27.10.2026, 8:50 JST)

Kod `PRCS20_52B0000000%`, nazwa zawiera `excluding International transportation` i `Year-on-year`. API Banku: sierpień 2,9, wrzesień 2,9.

PDF `sppi2609.pdf`, wiersz września: łączny indeks 115,5 i +3,7% / +0,3%; bez transportu międzynarodowego indeks 114,4 i +2,9% / +0,2%. Sierpień tej miary po korekcie też +2,9%.

Cache `jp_data/sppi_v2` (stary dokument nie ma tej serii). Trasa, świeżość i cron bez zmian.

## Kryteria

1. Parser czyta 2,9 za wrzesień i 2,9 za sierpień. Łączny szereg odrzucony jako ta miara i odwrotnie.
2. Zdanie mówi, że bez transportu międzynarodowego jest +2,9%, tyle samo co miesiąc wcześniej.
3. Sekcja cen usług pokazuje tę liczbę obok +3,7%. Kredyt Banku Japonii zostaje.
4. `tsc` i `npm test` zielone.

## Recenzja

Spełnione. Parser i zdanie mają 2,9 za wrzesień i sierpień, obok nagłówka 3,7. Kredyt Banku zostaje w stopce sekcji. Werdykt: SHIP.
