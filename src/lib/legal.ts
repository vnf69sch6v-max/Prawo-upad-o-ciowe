// Dane usługodawcy do polityki prywatności i regulaminu — ze zmiennych środowiskowych (Vercel), nie z repo:
// to dane osobowe właściciela, a strony i tak je pokazują (obowiązek z ustawy o świadczeniu usług drogą
// elektroniczną i RODO art. 13). Wstawiane przy buildzie; zmiana = redeploy.
export const OWNER = {
    /** Imię i nazwisko albo firma. */
    name: process.env.NEXT_PUBLIC_OWNER_NAME?.trim() ?? '',
    /** Adres (ulica, kod, miasto). */
    address: process.env.NEXT_PUBLIC_OWNER_ADDRESS?.trim() ?? '',
    /** NIP (jeśli działalność zarejestrowana). */
    nip: process.env.NEXT_PUBLIC_OWNER_NIP?.trim() ?? '',
    /** E-mail kontaktowy (reklamacje, RODO, odstąpienie). */
    email: process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim() ?? '',
};

/** Wszystkie obowiązkowe dane uzupełnione — dopiero wtedy wolno włączyć płatny dostęp. */
export const LEGAL_READY = !!(OWNER.name && OWNER.address && OWNER.email);

export const MISSING = '[do uzupełnienia przez właściciela]';
export const field = (v: string) => v || MISSING;

/** Data wejścia w życie bieżącej wersji dokumentów. */
export const LEGAL_VERSION_DATE = '25.10.2026';
