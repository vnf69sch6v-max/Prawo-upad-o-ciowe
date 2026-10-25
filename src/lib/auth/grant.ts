// Nadawanie dostępu przy logowaniu (/api/auth/session). Część decyzyjna bez I/O (testy: tests/access.test.ts),
// zapis „okres próbny wykorzystany” w Firestore — `claimTrial`.
//
// Zasady (recenzja bezpieczeństwa PR #34):
//  - okres próbny tylko dla zweryfikowanego e-maila (rejestracja e-mail/hasło przez REST jest otwarta dla
//    każdego z publicznym kluczem API — bez weryfikacji każdy wyrzucany adres dawałby kolejne 7 dni);
//  - jeden okres próbny na adres e-mail, także po usunięciu konta i ponownym logowaniu: `trials/{HMAC(e-mail)}`
//    zapisywane w transakcji (identyfikator to HMAC kluczem szyfrowania — bez klucza nie da się sprawdzić,
//    czy dany adres miał konto);
//  - ADMIN_EMAILS: dostęp bez końca, odbierany po usunięciu adresu z listy.
import { createHash, createHmac } from 'node:crypto';
import type { Firestore } from 'firebase-admin/firestore';
import { docLegacy, toStored } from '@/lib/data-seal';

/** Dostęp administratora: rok 2100 (sekundy). */
export const ADMIN_UNTIL = 4_102_444_800;

export interface TokenFacts {
    email?: string;
    email_verified?: boolean;
    accessUntil?: unknown;
}

export type GrantDecision =
    /** Token ma już właściwy dostęp — od razu sesja. */
    | { kind: 'none' }
    | { kind: 'admin' }
    /** Adres zniknął z ADMIN_EMAILS — odbierz dostęp „do 2100”. */
    | { kind: 'revoke-admin' }
    /** Nowe konto ze zweryfikowanym e-mailem — okres próbny, jeśli adres go jeszcze nie miał. */
    | { kind: 'trial' }
    /** Nowe konto bez zweryfikowanego e-maila — bez okresu próbnego (od razu cennik). */
    | { kind: 'no-trial' };

export function adminEmails(env: Record<string, string | undefined> = process.env): Set<string> {
    return new Set((env.ADMIN_EMAILS ?? '').split(',').map((e) => e.trim().toLowerCase()).filter(Boolean));
}

export function grantDecision(t: TokenFacts, admins: Set<string>): GrantDecision {
    const verified = !!t.email && t.email_verified === true;
    if (verified && admins.has(t.email!.toLowerCase())) return t.accessUntil === ADMIN_UNTIL ? { kind: 'none' } : { kind: 'admin' };
    if (t.accessUntil === ADMIN_UNTIL) return { kind: 'revoke-admin' };
    if (typeof t.accessUntil === 'number') return { kind: 'none' };
    return verified ? { kind: 'trial' } : { kind: 'no-trial' };
}

/** Identyfikator wpisu okresu próbnego: HMAC(DATA_ENCRYPTION_KEY, e-mail), bez klucza — SHA-256 z solą. */
export function trialId(email: string, env: Record<string, string | undefined> = process.env): string {
    const norm = email.trim().toLowerCase();
    const key = env.DATA_ENCRYPTION_KEY?.trim();
    return key
        ? createHmac('sha256', Buffer.from(key, 'base64')).update(`trial:${norm}`).digest('hex')
        : createHash('sha256').update(`savori-trial-v1:${norm}`).digest('hex');
}

/** `true` = okres próbny przyznany teraz; `false` = ten adres już go wykorzystał. Bez Firestore (demo) — `true`. */
export async function claimTrial(db: Firestore | null, email: string, now = Date.now()): Promise<boolean> {
    if (!db) return true;
    const id = trialId(email);
    const ref = db.collection('trials').doc(id);
    return db.runTransaction(async (tx) => {
        const snap = await tx.get(ref);
        if (snap.exists) return false;
        tx.set(ref, toStored(`trials/${id}`, { at: new Date(now).toISOString() }, now, docLegacy.write));
        return true;
    });
}
