# Japonia: dochód wtórny

- **Krok:** po mieszkaniach służbowych. Bilans na stronie ma obroty bieżące, dochód pierwotny, handel i usługi. Brakuje drugiej pozycji dochodowej, którą ministerstwo podaje w tej samej tabeli.
- **Nie to:** osobna świeżość. To ten sam komunikat i ta sama trasa.

## Co widzi użytkownik

`/japonia/gospodarka`, w bilansie płatniczym.

- Kafel „Dochód wtórny”: deficyt 267,7 mld jenów, wstępny, o 174 mld mniejszy niż rok wcześniej.
- To samo w zdaniu pod nagłówkiem i w wierszu panelu.
- W „Jak czytać”: przekazy, darowizny i składki, osobno od dywidend.

## Dane (sprawdzone 28.10.2026 z tabelą Ministerstwa Finansów, komunikat 8.10.2026, 8:50 JST)

Kod `1601010103000010010`, nazwa `第二次所得収支`, jednostka 億円.

Sierpień 2026: ▲2 677億円, wstępne. Sierpień 2025: ▲4 417. Różnica +1 740億円, w komunikacie „赤字幅縮小”.

Na stronie: −267,7 mld i o 174 mld mniejszy deficyt.

Cache `jp_data/trade_v4`. Limit czasu trasy 70 s, bo serii jest pięć.

## Kryteria

1. Parser czyta −2 677 ze znacznikiem wstępnym i −4 417 rok wcześniej. Różnica to +1 740億円. Szereg dochodu pierwotnego jest odrzucany.
2. Zdanie mówi o deficycie 267,7 mld, mniejszym o 174 mld niż rok wcześniej.
3. Kafel jest na stronie obok pozostałych sald. Kredyt Dashboardu zostaje.
4. `tsc` i `npm test` zielone.

## Recenzja

Spełnione. Parser, zdanie i kafel mają deficyt 267,7 mld, mniejszy o 174 mld. Cztery linie salda sumują się do obrotów bieżących. Werdykt: SHIP.
