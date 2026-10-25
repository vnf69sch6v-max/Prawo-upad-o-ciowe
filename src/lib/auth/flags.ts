// Flagi logowania. Od 25.10.2026 domyślnie włączone — decyzja właściciela: savori.space wpuszcza tylko
// zalogowanych (niezalogowany trafia na /start z logowaniem i cennikiem). Wyłącza je wartość `false`
// w zmiennej (`NEXT_PUBLIC_AUTH_REQUIRED=false` = logowanie bez zamykania strony). Bez konfiguracji Firebase
// (dev, demo) obie są wyłączone — bramka bez działającego logowania zamknęłaby stronę dla wszystkich.
// Wstawiane przy buildzie: SSR, przeglądarka i middleware widzą to samo, zmiana wymaga redeployu.
// Uwaga: tylko literalne `process.env.NEXT_PUBLIC_*` — inaczej build nie wstawi wartości do przeglądarki.

export function authFlags(enabledEnv: string | undefined, requiredEnv: string | undefined, firebaseConfigured: boolean) {
    const on = (v: string | undefined) => v?.trim().toLowerCase() !== 'false';
    const enabled = firebaseConfigured && on(enabledEnv);
    return { enabled, required: enabled && on(requiredEnv) };
}

const FIREBASE_CONFIGURED = !!(
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN &&
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
);

export const AUTH_FLAGS = authFlags(
    process.env.NEXT_PUBLIC_AUTH_ENABLED,
    process.env.NEXT_PUBLIC_AUTH_REQUIRED,
    FIREBASE_CONFIGURED,
);
