// Dane usługodawcy do polityki prywatności i regulaminu (obowiązek z ustawy o świadczeniu usług drogą
// elektroniczną i RODO art. 13 — strony i tak je pokazują publicznie). Imię i nazwisko oraz e-mail podał
// właściciel (25.10.2026) i są wpisane w kod; zmienne środowiskowe (Vercel) mają pierwszeństwo.
// Adres i NIP tylko ze zmiennych. Wstawiane przy buildzie; zmiana = redeploy.
export const OWNER = {
    /** Imię i nazwisko albo firma. */
    name: process.env.NEXT_PUBLIC_OWNER_NAME?.trim() || 'Mikołaj Marcinkowski',
    /** Adres (ulica, kod, miasto). */
    address: process.env.NEXT_PUBLIC_OWNER_ADDRESS?.trim() ?? '',
    /** NIP (jeśli działalność zarejestrowana). */
    nip: process.env.NEXT_PUBLIC_OWNER_NIP?.trim() ?? '',
    /** E-mail kontaktowy (reklamacje, RODO, odstąpienie). */
    email: process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim() || 'mikolaj.marcinkowski22@o2.pl',
};

/** Wszystkie obowiązkowe dane uzupełnione — dopiero wtedy wolno włączyć płatny dostęp. */
export const LEGAL_READY = !!(OWNER.name && OWNER.address && OWNER.email);

export const MISSING = '[do uzupełnienia przez właściciela]';
export const field = (v: string) => v || MISSING;

/** Data wejścia w życie bieżącej wersji dokumentów. */
export const LEGAL_VERSION_DATE = '25.10.2026';
