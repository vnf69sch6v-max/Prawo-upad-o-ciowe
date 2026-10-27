# Japonia: przegląd widzi bilans płatniczy

- **Krok:** obroty bieżące, które są już na `/japonia/gospodarka`, wchodzą na przegląd.
- **Liczba:** ta sama co na stronie gospodarki. Sierpień 2026: nadwyżka 4062 mld jenów.

## Co widzi użytkownik

Na `/japonia`:

- Kafel „Obroty bieżące” w rzędzie pracy i gospodarki: **4062 mld**, podpis wstępny, obok deficyt handlu z tego samego miesiąca.
- Hero może postawić ten odczyt na górze, gdy komunikat jest świeży albo zmiana salda jest duża wobec własnej historii. Data świeżości to 8 października, nie dzień końca miesiąca.
- Zmiana wobec poprzedniego miesiąca jest w mld jenów.

## Kryteria

1. `publishedOn` dla 2026-08 to 2026-10-08. Dzień później odczyt jest świeży, 27.10 już nie.
2. Nagłówek nadwyżki nie mówi o punktach procentowych.
3. `tsc` i `npm test` zielone.

## Recenzja

Hero zostaje przy inflacji 2,1% (świeży odczyt). Kafel pokazuje 4062 mld, wstępne, i deficyt handlu 687,7 mld. Telefon 320/390 i desktop 1440 bez przewijania w bok. Werdykt: SHIP.
