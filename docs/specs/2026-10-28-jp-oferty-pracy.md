# Japonia: oferty pracy

- **Krok:** po dochodzie wtórnym. Bezrobocie jest na stronie. Obok niego w tym samym porannym oknie wychodzi liczba ofert na osobę w urzędzie pracy.
- **Nie to:** stopa bezrobocia jeszcze raz. To inna statystyka, z urzędów pracy, nie z ankiety gospodarstw.

## Co widzi użytkownik

`/japonia/praca`, pod bezrobociem.

- Duża liczba: 1,18 oferty na osobę, po sezonie. Sierpień 2026, tyle samo co miesiąc wcześniej.
- Obok: bez korekty 1,16 i nowe oferty 2,06, o 0,04 mniej.
- Wykres obu szeregów po sezonie.
- Termin następnego komunikatu po hydratacji. Wrzesień: 30 października, 8:30.
- W „Jak czytać”: to urzędy pracy, z pracą na część etatu. Powyżej 1 ofert jest więcej niż szukających.

## Dane (sprawdzone 28.10.2026 z komunikatem ministerstwa z 2.10.2026, 8:30 JST)

Kod `0301020001000010010`, nazwa `有効求人倍率`, jednostka 倍. Ta sama nazwa dla obu klas sezonowych.

| Szereg | IsSeasonal | Sierpień 2026 |
|---|---|---|
| Po sezonie | 2 | 1,18 (lipiec 1,18) |
| Surowy | 1 | 1,16 (sierpień 2025: 1,18) |
| Nowe oferty, po sezonie | 2 | 2,06 (lipiec 2,10 → −0,04) |

Kod nowych ofert: `0301020002000010010`.

Kalendarz e-Stat `00450222`, 8:30 JST, te same poranki co Labour Force Survey. Wrzesień: 2026-10-30.

Cache `jp_data/jobs_v1`, trasa `/api/jp/jobs`, świeżość `jp-jobs`, cron `jp` i `refresh`.

## Kryteria

1. Parser czyta 1,18 i różnicę 0 wobec lipca. Surowy szereg to 1,16. Sezonowy odrzucony, gdy prosimy o surowy.
2. Nowe oferty: 2,06 i −0,04. Szereg ofert na osobę odrzucony jako nowe oferty.
3. `expectedJpJobs` przełącza się 2.10 o 8:30 JST z lipca na sierpień. Następny komunikat: wrzesień, 30.10.
4. Sekcja stoi pod bezrobociem. Kredyt Dashboardu jest widoczny.
5. `tsc` i `npm test` zielone.

## Recenzja

Spełnione. 1,18 bez zmiany, surowe 1,16 i nowe oferty 2,06 (−0,04) są w teście i na stronie pod bezrobociem. Werdykt: SHIP.
