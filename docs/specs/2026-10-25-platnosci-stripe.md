# Płatności Stripe: jednorazowy Checkout 10/20/30 zł

- **Prośba właściciela (25.10.2026):** wdrożyć Stripe prywatnie — klucz jest już zmienną na Vercelu, w kodzie ma być trasa.
- **Zakres:** sesja Checkout, webhook, przedłużenie dostępu, odświeżenie ciasteczka po powrocie, przyciski na cenniku,
  dopisek w `/prywatnosc` i `/regulamin`. Poza zakresem: subskrypcja, własny formularz karty, faktury, adres usługodawcy.

## Co widzi użytkownik

Na `/start#cennik`, gdy serwer ma klucz Stripe: „Zapłać 10/20/30 zł”. Bez logowania przycisk prowadzi do sekcji logowania
i po zalogowaniu pokazuje „Dokończ płatność” (bez samoistnego przekierowania). Płatność odbywa się na
`checkout.stripe.com`. Powrót: „Sprawdzam płatność…”, potem wejście na platformę. Anulowanie nie pobiera pieniędzy.
Bez klucza zostaje dotychczasowe wezwanie do okresu próbnego.

## Zasady

- Jednorazowo, bez `recurring`. Kwota przed podatkiem = cena planu (10/20/30 zł). Niższa kwota nie przedłuża dostępu.
- `accessUntil` = później z (teraz, koniec obecnego dostępu) + miesiące kalendarzowe. Dostęp administratora (rok 2100)
  płatność nie zmienia i go nie przywraca.
- Jeden zapis `payments/{id sesji}` przez `toStored`. Powtórka webhooka nie dokłada miesięcy.
- Webhook bez podpisu (`STRIPE_WEBHOOK_SECRET`) nie nadaje dostępu. Klucz prywatny nie wychodzi do przeglądarki.
- Bramka wpuszcza te trzy trasy także przy wygasłym dostępie; checkout i confirm i tak wymagają ciasteczka sesji.

## Kryteria akceptacji

1. `npm test` — `tests/stripe.test.ts` i wpis tras Stripe w `tests/access.test.ts` są zielone.
2. `POST /api/stripe/checkout` bez ciasteczka → 401 i zero wywołań Stripe; z sesją → adres tylko na `checkout.stripe.com`,
   w body `mode=payment`, `unit_amount` 1000/2000/3000 i dosłowne `{CHECKOUT_SESSION_ID}`.
3. Webhook ze złym podpisem → 400, claims bez zmian. Z dobrym podpisem dostęp raz; druga dostawa nie przesuwa daty.
4. Confirm przy starym tokenie zwraca `{ refresh: true }`, po tokenie z nowym `accessUntil` ustawia `__session`.
5. `/prywatnosc` wymienia Stripe Payments Europe, Ltd. Baner „Wersja robocza” nie występuje na `/prywatnosc` ani `/regulamin`.

## Zostaje właścicielowi

`STRIPE_WEBHOOK_SECRET`, endpoint `https://savori.space/api/stripe/webhook`, metody karta/BLIK/Przelewy24, pokwitowania
e-mail. Szczegóły: `docs/ROADMAP.md`, punkt „Stripe — dokończenie po stronie konta”.
