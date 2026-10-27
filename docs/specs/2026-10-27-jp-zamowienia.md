# Japonia: zamówienia maszyn

- **Krok:** popyt prywatny na maszyny, bez statków i energetyki. Wskaźnik wyprzedzający inwestycji.
- **Liczba:** komunikat Gabinetu z 15.10.2026, 8:50.

## Co widzi użytkownik

Na `/japonia/gospodarka`:

- Wobec poprzedniego miesiąca, sezonowo: **+5,2%**, sierpień 2026.
- Rok do roku, bez korekty: **+18,6%**.
- Poziom sezonowy: **1 069,8 mld jenów** (1 069 779 mln jenów; w komunikacie 1兆698億円).
- Następny komunikat: 19 listopada, 8:50 JST, dane za wrzesień.

## Dane

| Szereg | Kod | Sierpień 2026 |
|---|---|---|
| Poziom, sezonowo, mln jenów | `0701030000000010010` | 1 069 779 |
| Rok do roku, bez korekty | `0701030000000030010` | 18,6% |

Nazwa poziomu z `getData` nie ma dopisku 季節調整値. Rozróżnia ją klasa sezonowa `2`. Szereg rok do roku jest odrzucany konfiguracją poziomu, bo nazwa zawiera `前年同月比`.

Cache `jp_data/orders_v1`, trasa `/api/jp/orders`, świeżość `jp-orders`, cron `jp` i `refresh`.

## Kryteria

1. Parser czyta 1 069 779 i zmianę +5,2% wobec lipca.
2. Rok do roku czyta 18,6%.
3. Szereg rok do roku odrzucony konfiguracją poziomu sezonowego.
4. `expectedJpOrders` przełącza się 15.10 o 8:50 JST.
5. `tsc` i `npm test` zielone.

## Recenzja

Sierpień: +5,2% m/m sezonowo i +18,6% r/r. Poziom 1 069,8 mld jenów. Telefon i desktop bez przewijania w bok. Dopisek Dashboard jest na stronie. Werdykt: SHIP.
