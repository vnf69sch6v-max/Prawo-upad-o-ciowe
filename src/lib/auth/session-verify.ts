// Weryfikacja ciasteczka sesji Firebase na Edge (middleware) — bez Admin SDK. Ciasteczko to JWT RS256
// podpisany kluczami Google z publicznego endpointu (certyfikaty X.509 w JSON, rotowane — cache wg
// Cache-Control). Sprawdzamy podpis, wystawcę (`https://session.firebase.google.com/<projekt>`),
// odbiorcę (projekt), ważność i `sub`. Unieważnienie (revoke) sprawdza dopiero serwer
// (`verifySessionCookie(..., true)`) — na Edge byłoby to zapytanie do Google przy każdej stronie.
//
// Trzy wyniki: claims (ważna sesja), `null` (podróbka, wygasła, inny projekt) i `'unavailable'` (nie da się
// pobrać kluczy Google) — chwilowa awaria nie może wylogować płacących użytkowników.
import { importX509, jwtVerify, type JWTPayload, type KeyLike } from 'jose';
import type { AccessClaims } from '@/lib/access';

const CERTS_URL = 'https://www.googleapis.com/identitytoolkit/v3/relyingparty/publicKeys';
/** Nieznany `kid` (np. podróbka z losowym nagłówkiem) nie może co żądanie odpytywać Google. */
const UNKNOWN_KID_REFETCH_MS = 60_000;

export class KeysUnavailable extends Error {}

/** Klucz dla `kid`, `null` = takiego klucza Google nie ma; rzuca KeysUnavailable, gdy nie da się ich pobrać. */
export type KeyResolver = (kid: string) => Promise<KeyLike | null>;

let certCache: { at: number; ttlMs: number; keys: Map<string, KeyLike> } | null = null;

async function fetchKeys(): Promise<void> {
    let res: Response;
    let pems: Record<string, string>;
    try {
        res = await fetch(CERTS_URL, { cache: 'no-store' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        pems = (await res.json()) as Record<string, string>;
    } catch (err) {
        throw new KeysUnavailable(String(err));
    }
    const keys = new Map<string, KeyLike>();
    for (const [k, pem] of Object.entries(pems)) keys.set(k, await importX509(pem, 'RS256'));
    const maxAge = Number(/max-age=(\d+)/.exec(res.headers.get('cache-control') ?? '')?.[1] ?? 3600);
    certCache = { at: Date.now(), ttlMs: Math.min(maxAge, 6 * 3600) * 1000, keys };
}

/** Klucze Google, cache wg `max-age` (do 6 h); przy awarii — ostatnie znane klucze. */
export const googleSessionKeys: KeyResolver = async (kid) => {
    const age = certCache ? Date.now() - certCache.at : Infinity;
    const stale = !certCache || age > certCache.ttlMs;
    const unknownKid = !!certCache && !certCache.keys.has(kid) && age > UNKNOWN_KID_REFETCH_MS;
    if (stale || unknownKid) {
        try {
            await fetchKeys();
        } catch (err) {
            if (!certCache?.keys.has(kid)) throw err;
        }
    }
    return certCache?.keys.get(kid) ?? null;
};

export interface SessionClaims extends AccessClaims {
    uid: string;
    email?: string;
}

/** Zweryfikowane claims, `null` (brak / podróbka / wygasła / inny projekt) albo `'unavailable'`. */
export async function verifySessionCookie(
    cookie: string | undefined,
    projectId: string | undefined,
    keys: KeyResolver = googleSessionKeys,
): Promise<SessionClaims | null | 'unavailable'> {
    if (!cookie || !projectId) return null;
    try {
        const { payload } = await jwtVerify(
            cookie,
            async (header) => {
                const key = header.kid ? await keys(header.kid) : null;
                if (!key) throw new Error('nieznany klucz');
                return key;
            },
            {
                issuer: `https://session.firebase.google.com/${projectId}`,
                audience: projectId,
                algorithms: ['RS256'],
                requiredClaims: ['exp', 'iat', 'sub'],
            },
        );
        const p = payload as JWTPayload & { accessUntil?: unknown; plan?: unknown; email?: unknown };
        if (typeof p.sub !== 'string' || !p.sub) return null;
        return {
            uid: p.sub,
            email: typeof p.email === 'string' ? p.email : undefined,
            accessUntil: typeof p.accessUntil === 'number' ? p.accessUntil : undefined,
            plan: p.plan === 'trial' || p.plan === 'm1' || p.plan === 'm3' || p.plan === 'm6' ? p.plan : undefined,
        };
    } catch (err) {
        return err instanceof KeysUnavailable ? 'unavailable' : null;
    }
}
