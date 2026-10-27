# Japonia: nowe mieszkania

- **Krok:** liczba rozpoczętych budów mieszkań. Wskaźnik inwestycji mieszkaniowych.
- **Liczba:** komunikat Ministerstwa Ziemi, Infrastruktury, Transportu i Turystyki z 30.09.2026, 14:00.

## Co widzi użytkownik

Na `/japonia/gospodarka`:

- Sierpień 2026: **63 974** mieszkań, **+6,1%** rok do roku.
- Skala roku, po sezonie: **753 108**, **−2,7%** wobec lipca.
- Następny komunikat: 30 października, dane za wrzesień.

## Dane

| Szereg | Kod | Sierpień 2026 |
|---|---|---|
| Liczba, bez korekty | `0802010103000010000` | 63 974 (rok wcześniej 60 275) |
| Skala roku, sezonowo | `0802010103000010001` | 753 108 (lipiec 773 916) |

Nazwa skali roku zawiera `年率換算`. Zwykła liczba mieszkań tej nazwy nie ma i jest odrzucana.

Cache `jp_data/housing_v1`, trasa `/api/jp/housing`, świeżość `jp-housing`, cron `jp` i `refresh`.

## Kryteria

1. Parser czyta 63 974 i stopę +6,1% wobec sierpnia 2025.
2. Skala roku czyta 753 108 i zmianę −2,7%.
3. Zwykła liczba odrzucona konfiguracją skali roku.
4. `expectedJpHousing` przełącza się 30.09 o 14:00 JST.
5. `tsc` i `npm test` zielone.

## Recenzja

Sierpień: 63 974 mieszkań, +6,1% r/r, skala roku 753 108 i −2,7% m/m. Telefon i desktop bez przewijania w bok. Dopisek Dashboard jest na stronie. Werdykt: SHIP.
