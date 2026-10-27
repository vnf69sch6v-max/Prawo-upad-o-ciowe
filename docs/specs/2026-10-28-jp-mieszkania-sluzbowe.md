# Japonia: mieszkania służbowe

- **Krok:** po cenach usług bez transportu międzynarodowego. Trzy grupy nowych mieszkań nie sumują się do 63 974. Brakuje mieszkań służbowych, które komunikat podaje osobno.
- **Nie to:** rozbicie lokali na sprzedaż na bloki i domy. To osobny krok, gdy kody będą potwierdzone.

## Co widzi użytkownik

`/japonia/gospodarka`, w sekcji nowych mieszkań, obok własnych, na wynajem i na sprzedaż.

- Kafel „Służbowe”: 1114 mieszkań, +228,6% r/r.
- Zdanie pod nagłówkiem wymienia tę liczbę.
- W „Jak czytać”: cztery grupy sumują się do łącznej liczby, a służbowe są małą serią, więc procent bywa bardzo duży.

## Dane (sprawdzone 28.10.2026 z PDF MLIT kencha808, komunikat 30.09.2026)

Kod `0802010103010010040`, nazwa `新設住宅着工戸数（給与住宅）`, jednostka 戸.

Sierpień 2026: 1114. Sierpień 2025: 339. Rok do roku +228,6%, jak w tabeli komunikatu.

17 713 + 28 309 + 16 838 + 1114 = 63 974.

Cache `jp_data/housing_v3`. Trasa i świeżość bez zmian. Limit czasu trasy 75 s, bo serii jest sześć.

## Kryteria

1. Parser czyta 1114 i 339; rok do roku to +228,6%. Szereg własnych odrzucony jako służbowe.
2. Zdanie wymienia mieszkania służbowe z tą stopą, gdy seria jest w danych.
3. Na stronie jest kafel „Służbowe”. Cztery grupy są opisane jako suma całości.
4. `tsc` i `npm test` zielone.

## Recenzja

Spełnione. 1114 i +228,6% są w teście i na kafelku, cztery grupy sumują się do 63 974. Werdykt: SHIP.
