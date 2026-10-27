# Japonia: skład nowych mieszkań

- **Krok:** trzy grupy z komunikatu, pod łączną liczbą.
- **Liczba:** ten sam komunikat z 30.09.2026. Sierpień.

## Co widzi użytkownik

Na `/japonia/gospodarka`, przy nowych mieszkaniach:

- Własne: **17 713**, **+1,0%** rok do roku.
- Na wynajem: **28 309**, **+6,5%**.
- Na sprzedaż: **16 838**, **+6,4%**.

17 713 + 28 309 + 16 838 = 62 860. Do 63 974 brakuje 1 114 mieszkań służbowych.

## Dane

| Grupa | Kod | Sierpień 2026 | Sierpień 2025 |
|---|---|---|---|
| Własne | `0802010103010010010` | 17 713 | 17 532 |
| Na wynajem | `0802010103010010020` | 28 309 | 26 585 |
| Na sprzedaż | `0802010103010010030` | 16 838 | 15 819 |

Nazwa własnych musi zawierać `持家`. Najem pod tą konfiguracją jest odrzucany.

Cache `jp_data/housing_v2`. Ta sama trasa i świeżość.

## Kryteria

1. Parser czyta 17 713, 28 309 i 16 838 za 2026-08.
2. Stopy rok do roku: 1,0, 6,5 i 6,4.
3. Najem odrzucony konfiguracją domów własnych.
4. `tsc` i `npm test` zielone.

## Recenzja

Sierpień: 17 713 (+1,0%), 28 309 (+6,5%), 16 838 (+6,4%). Telefon 320 bez przewijania w bok, trzy grupy widoczne. Werdykt: SHIP.
