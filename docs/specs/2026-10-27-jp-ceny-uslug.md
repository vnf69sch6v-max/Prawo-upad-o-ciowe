# Japonia: ceny usług dla firm

- **Krok:** indeks cen usług sprzedawanych firmom, z komunikatu Banku Japonii z 27.10.2026, 8:50.
- **Źródło:** API szeregów Banku Japonii, baza PR02, bez klucza. Daty miesięczne to `YYYYMM`.

## Co widzi użytkownik

Na `/japonia/inflacja`, pod cenami towarów:

- Rok do roku: **+3,7%**, wrzesień 2026, wstępne.
- Indeks: **115,5**. Wobec sierpnia: **+0,3%**.
- Sierpień po korekcie: **+3,5%** r/r, indeks **115,2**.

## Dane

| Szereg | Kod | Wrzesień 2026 |
|---|---|---|
| Rok do roku, baza 2020 | `PR02` / `PRCS20_5200000000%` | 3,7% |
| Indeks, baza 2020 | `PR02` / `PRCS20_5200000000` | 115,5 |

Nazwa łącznego indeksu nie może zawierać `excluding`. Nazwa tempa musi zawierać `Year-on-year`.

Cache `jp_data/sppi_v1`, trasa `/api/jp/sppi`, świeżość `jp-sppi`, cron `jp` i `refresh`. Najnowszy miesiąc jest wstępny. Kalendarz sięga września 2026; datę października dopisać, gdy Bank ją ogłosi.

## Kryteria

1. Parser czyta 3,7 za 2026-09 i 3,5 za sierpień.
2. Indeks 115,5 i zmiana +0,3% wobec sierpnia.
3. Nazwa z wyłączeniem transportu międzynarodowego jest odrzucana.
4. `expectedJpSppi` przełącza się 27.10 o 8:50 JST.
5. `tsc` i `npm test` zielone.

## Recenzja

Wrzesień wstępny: +3,7% r/r, indeks 115,5, +0,3% m/m. Sierpień po korekcie 3,5% i 115,2. Telefon i desktop bez przewijania w bok. Dopisek Banku Japonii jest na stronie. Werdykt: SHIP.
