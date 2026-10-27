# Japonia: aktywność usług

- **Krok:** po składzie nowych mieszkań. Produkcja przemysłowa ma już swój indeks; usługi (trzeci sektor) dostają odpowiednik.
- **Nie to:** ocena słowna z komunikatu. Na stronie zostaje liczba. Nie to też: szeregi „usługi dla osób” i „usługi dla firm” — to rozbicie, nie nagłówek.

## Co widzi użytkownik

`/japonia/gospodarka`, zaraz pod produkcją przemysłową.

- Duża liczba: zmiana wobec poprzedniego miesiąca, indeks wyrównany sezonowo. Sierpień 2026: −0,1%.
- Plakietka „wstępne”, bo punkt sierpnia ma znacznik 速報.
- Obok: poziom indeksu 106,8 (baza 2020) i rok do roku +1,7% z indeksu bez korekty.
- Wykres obu indeksów.
- Termin następnego komunikatu (13:30 JST) po hydratacji. Wrzesień: 17 listopada.
- Dopisek Statistics Dashboard.
- W „Jak czytać”: baza 2020 to średnia z 2019 i 2020 równa 100. Bez cytatu oceny ministerstwa.

## Dane (sprawdzone 28.10.2026 z komunikatem METI z 19.10.2026, 13:30 JST)

Kod `0603100300000090010`. Nazwa zawiera `第３次産業活動指数` i `2020年基準`. Ta sama nazwa dla obu klas sezonowych — rozróżnia je klasa `isSeasonal`. e-Stat `00550360`, publikacja 2026-10-19 13:30 (sierpień). Reuters: 106,8 i −0,1% m/m. Następny termin w harmonogramie METI: 17.11.

| Szereg | IsSeasonal | Sierpień 2026 |
|---|---|---|
| Wyrównany sezonowo | 2 | 106,8, wstępny (lipiec 106,9 → −0,1% m/m) |
| Surowy | 1 | 103,7, wstępny (sierpień 2025: 102,0 → +1,7% r/r) |

Cache `jp_data/tertiary_v1`, trasa `/api/jp/tertiary`, świeżość `jp-tertiary`, cron `jp` i `refresh`.

## Kryteria

1. Parser czyta 106,8 ze znacznikiem wstępnym i 103,7; zmiana miesiąca to −0,1%, rok do roku +1,7%.
2. Szereg sezonowy odrzucony, gdy prosimy o surowy. Stara baza jest odrzucana.
3. `expectedJpTertiary` przełącza się o 13:30 JST 19.10 z lipca na sierpień. Następny komunikat: wrzesień, 17.11.
4. Sekcja stoi pod produkcją. Kredyt Dashboardu jest widoczny. Ocena słowna nie wchodzi do trwałego tekstu.
5. `tsc` i `npm test` zielone.

## Recenzja

Spełnione. Parser, kalendarz 13:30 i zdanie z liczbami 106,8 / −0,1% / +1,7% / wstępne są w teście. Sekcja stoi pod produkcją, kredyt Dashboardu jest w stopce sekcji, oceny słownej nie ma. Werdykt: SHIP.
