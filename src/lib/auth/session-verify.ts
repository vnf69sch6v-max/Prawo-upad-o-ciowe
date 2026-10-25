// Weryfikacja ciasteczka sesji Firebase na Edge (middleware) — bez Admin SDK. Ciasteczko to JWT RS256
// podpisany kluczami Google z publicznego endpointu (certyfikaty X.509 w JSON, rotowane — cache wg
// Cache-Control). Sprawdzamy podpis, wystawcę (`https://session.firebase.google.com/<projekt>`),
// odbiorcę (projekt), ważność i `sub`. Unieważnienie (revoke) sprawdza dopiero serwer
// (`verifySessionCookie(..., true)`) — na Edge byłoby to zapytanie do Google przy każdej stronie.
import { importX509, jwtVerify, type JWTPayload, type KeyLike } from 'jose';
import type { AccessClaims } from '@/lib/access';

const CERTS_URL = 'https://www.googleapis.com/identitytoolkit/v3/relyingparty/publicKeys';

export type KeyResolver = (kid: string) => Promise<KeyLike | null>;

let certCache: { at: number; ttlMs: number; keys: Map<string, KeyLike> } | null = null;

/** Klucze Google, cache wg `max-age` (domyślnie 1 h). */
export const googleSessionKeys: KeyResolver = async (kid) => {
    if (!certCache || Date.now() - certCache.at > certCache.ttlMs || !certCache.keys.has(kid)) {
        const res = await fetch(CERTS_URL, { cache: 'no-store' });
        if (!res.ok) return certCache?.keys.get(kid) ?? null;
        const pems = (await res.json()) as Record<string, string>;
        const keys = new Map<string, KeyLike>();
        for (const [k, pem] of Object.entries(pems)) keys.set(k, await importX509(pem, 'RS256'));
        const maxAge = Number(/max-age=(\d+)/.exec(res.headers.get('cache-control') ?? '')?.[1] ?? 3600);
        certCache = { at: Date.now(), ttlMs: Math.min(maxAge, 6 * 3600) * 1000, keys };
    }
    return certCache.keys.get(kid) ?? null;
};

export interface SessionClaims extends AccessClaims {
    uid: string;
    email?: string;
}

/** Zweryfikowane claims sesji albo `null` (brak, zły podpis, inny projekt, wygasła). */
export async function verifySessionCookie(
    cookie: string | undefined,
    projectId: string | undefined,
    keys: KeyResolver = googleSessionKeys,
): Promise<SessionClaims | null> {
    if (!cookie || !projectId) return null;
    try {
        const { payload } = await jwtVerify(
            cookie,
            async (header) => {
                const key = header.kid ? await keys(header.kid) : null;
                if (!key) throw new Error('nieznany klucz');
                return key;
            },
            { issuer: `https://session.firebase.google.com/${projectId}`, audience: projectId, algorithms: ['RS256'] },
        );
        const p = payload as JWTPayload & { accessUntil?: unknown; plan?: unknown; email?: unknown };
        if (typeof p.sub !== 'string' || !p.sub) return null;
        return {
            uid: p.sub,
            email: typeof p.email === 'string' ? p.email : undefined,
            accessUntil: typeof p.accessUntil === 'number' ? p.accessUntil : undefined,
            plan: p.plan === 'trial' || p.plan === 'm1' || p.plan === 'm3' || p.plan === 'm6' ? p.plan : undefined,
        };
    } catch {
        return null;
    }
}
