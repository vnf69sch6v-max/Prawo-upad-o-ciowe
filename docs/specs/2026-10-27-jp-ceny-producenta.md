# Japonia: ceny producenta

- **Krok:** krajowy indeks cen przedsiębiorstw na stronie inflacji. Liczba z komunikatu Banku Japonii.
- **To nie jest CPI.** Ceny, po których firmy sprzedają sobie towary. Baza 2020.

## Co widzi użytkownik

Na `/japonia/inflacja`, pod CPI:

- Rok do roku: **+6,8%**, wrzesień 2026, wstępne.
- Indeks: **135,7**. Wobec sierpnia: **−0,3%**.
- Sierpień po korekcie: **+7,6%** r/r.
- Następny komunikat: 12 listopada, 8:50 JST, dane za październik.

## Dane (sprawdzone 27.10.2026 z PDF Banku Japonii z 13.10.2026, 8:50)

| Szereg | Kod | Wrzesień 2026 |
|---|---|---|
| Rok do roku, baza 2020 | `0703040400000030010` | 6,8%, wstępne |
| Indeks, baza 2020 | `0703040400000090010` | 135,7, wstępne |

Nazwa indeksu nie może zawierać `前年`. Nazwa tempa musi zawierać `前年同月比` i `2020年基準`.

Cache `jp_data/cgpi_v1`, trasa `/api/jp/cgpi`, świeżość `jp-cgpi`, cron `jp` i `refresh`.

## Kryteria

1. Parser czyta 6,8 i 135,7 za 2026-09, oba wstępne, oraz 7,6 za sierpień.
2. Zmiana indeksu wobec sierpnia wynosi −0,3%.
3. Szereg rok do roku odrzucony konfiguracją indeksu.
4. `expectedJpCgpi` przełącza się 13.10 o 8:50 JST.
5. `tsc` i `npm test` zielone.

## Recenzja

Wrzesień wstępny: +6,8% r/r i indeks 135,7, −0,3% m/m. Sierpień po korekcie 7,6%. Telefon i desktop bez przewijania w bok. Werdykt: SHIP.
