// Stan ciasteczka sesji i etykiety dostępu. Czyste funkcje — bez Reacta i bez `window`,
// żeby bramka UI, menu konta i testy liczyły to samo. Świadomie NIE importujemy
// `@/lib/auth/grant`: ten moduł jest w paczce przeglądarki (`use-auth.tsx`), a `grant.ts`
// ciągnie `node:crypto` i Admin SDK. Próg administratora to ta sama chwila co `ADMIN_UNTIL`.

import type { PlanId } from '@/lib/access';

/** Rok 2100, sekundy — równe `ADMIN_UNTIL` w `src/lib/auth/grant.ts`. */
const ADMIN_ACCESS_S = 4_102_444_800;
/** Ciasteczko starsze niż doba jest odnawiane po cichu (samo żyje 5 dni). */
const RENEW_AFTER_S = 24 * 60 * 60;
/** „Kończy się…” gdy do końca zostało poniżej 48 h. */
const ENDS_SOON_S = 48 * 60 * 60;

export type AccessState = 'unknown' | 'none' | 'active' | 'expired' | 'admin';

export type SessionInfo = {
    status: 'unknown' | 'none' | 'ok';
    accessUntil: number | null;
    plan: 'trial' | PlanId | null;
    iat: number | null;
};

const ACCESS_FORMAT = new Intl.DateTimeFormat('pl-PL', {
    timeZone: 'Europe/Warsaw',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
});

function warsawParts(unixS: number): { day: string; month: string; year: string; hour: string; minute: string } {
    const parts = ACCESS_FORMAT.formatToParts(new Date(unixS * 1000));
    const pick = (type: Intl.DateTimeFormatPartTypes) => parts.find((part) => part.type === type)?.value ?? '';
    return { day: pick('day'), month: pick('month'), year: pick('year'), hour: pick('hour'), minute: pick('minute') };
}

/**
 * Koniec dostępu widziany w Warszawie, np. „1 listopada 2026, 09:40”.
 * Składamy części `Intl` (te opcje, ta strefa): samo `format()` w ICU pomija przecinek przed godziną.
 */
export function formatAccessUntil(unixS: number): string {
    const p = warsawParts(unixS);
    return `${p.day} ${p.month} ${p.year}, ${p.hour}:${p.minute}`;
}

function formatAccessDate(unixS: number): string {
    const p = warsawParts(unixS);
    return `${p.day} ${p.month} ${p.year}`;
}

function formatAccessTime(unixS: number): string {
    const p = warsawParts(unixS);
    return `${p.hour}:${p.minute}`;
}

/** `unknown` zanim znamy ciasteczko (albo demo bez daty); `none` bez sesji; `admin` od `ADMIN_UNTIL` wzwyż. */
export function accessState(info: SessionInfo, nowS: number): AccessState {
    if (info.status === 'unknown') return 'unknown';
    if (info.status === 'none') return 'none';
    if (info.accessUntil == null || !Number.isFinite(info.accessUntil)) return 'unknown';
    if (info.accessUntil >= ADMIN_ACCESS_S) return 'admin';
    if (info.accessUntil > nowS) return 'active';
    return 'expired';
}

/** Sekundy do `accessUntil` (ujemne po wygaśnięciu). `null` bez daty albo bez sesji. */
export function secondsLeft(info: SessionInfo, nowS: number): number | null {
    if (info.status !== 'ok' || info.accessUntil == null || !Number.isFinite(info.accessUntil) || !Number.isFinite(nowS)) return null;
    return info.accessUntil - nowS;
}

/** Aktywny dostęp, któremu zostało poniżej `withinS` (domyślnie 48 h). Administrator i wygasły — nie. */
export function endsSoon(info: SessionInfo, nowS: number, withinS = ENDS_SOON_S): boolean {
    if (accessState(info, nowS) !== 'active') return false;
    const left = secondsLeft(info, nowS);
    return left != null && left > 0 && left < withinS;
}

/**
 * Tekst do menu i ustawień. Poniżej 48 h zegar ma znaczenie („Kończy się jutro o 09:40”);
 * okres próbny niesie godzinę, dłuższy plan — samą datę („Dostęp do 25 stycznia 2027”).
 * Brak sesji, demo i wygasły dostęp → `null` (nic nie pokazujemy).
 */
export function accessLabel(info: SessionInfo, nowS: number): string | null {
    const state = accessState(info, nowS);
    if (state === 'admin') return 'Dostęp administratora';
    if (state !== 'active' || info.accessUntil == null) return null;
    if (endsSoon(info, nowS)) return `Kończy się jutro o ${formatAccessTime(info.accessUntil)}`;
    if (info.plan === 'trial') return `Okres próbny do ${formatAccessUntil(info.accessUntil)}`;
    return `Dostęp do ${formatAccessDate(info.accessUntil)}`;
}

/** `true`, gdy `iat` ciasteczka jest starsze niż 24 h. Brak `iat` (demo) nie wymusza odnowienia. */
export function needsRenewal(iat: number | null, nowS: number): boolean {
    if (iat == null || !Number.isFinite(iat) || !Number.isFinite(nowS)) return false;
    return nowS - iat > RENEW_AFTER_S;
}
