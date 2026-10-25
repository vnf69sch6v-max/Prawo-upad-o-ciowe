// Dokument użytkownika w Firestore — wyłącznie przez Admin SDK, treść szyfrowana jak cache i `health/*`
// (`src/lib/data-seal.ts`; AAD = ścieżka dokumentu, więc szyfrogramu nie da się przenieść na inne konto).
// Dokument jest jednym szyfrogramem, więc zmiana pola to odczyt + zapis całości w transakcji.
import type { Firestore } from 'firebase-admin/firestore';
import { docLegacy, fromStored, toStored } from '@/lib/data-seal';
import { ACCESS_COLLECTION, USER_COLLECTION, parseWatchItems, userDocPath, type UserData } from '@/lib/user-data';

/** `null` = konto nie ma jeszcze dokumentu (pierwsze logowanie) albo wpis jest nie do odczytania (zły klucz). */
export async function readUserData(db: Firestore, uid: string): Promise<UserData | null> {
    const snap = await db.collection(USER_COLLECTION).doc(uid).get();
    return snap.exists ? decode(uid, snap.data()) : null;
}

export async function writeUserData(db: Firestore, uid: string, patch: Partial<UserData>, now = Date.now()): Promise<UserData> {
    const ref = db.collection(USER_COLLECTION).doc(uid);
    return db.runTransaction(async (tx) => {
        const snap = await tx.get(ref);
        const current = snap.exists ? decode(uid, snap.data()) : null;
        const next: UserData = { watchlist: [], ...current, ...patch };
        tx.set(ref, toStored(userDocPath(uid), next, now, docLegacy.write));
        return next;
    });
}

/**
 * Dane konta do usunięcia z kontem: lista obserwowanych i koniec dostępu (`/prywatnosc` §7). Dokumenty
 * `payments/{cs_…}` zostają — to dokumenty sprzedaży (obowiązek podatkowy), nie dane konta.
 */
export async function deleteUserData(db: Firestore, uid: string): Promise<void> {
    await Promise.all([
        db.collection(USER_COLLECTION).doc(uid).delete(),
        db.collection(ACCESS_COLLECTION).doc(uid).delete(),
    ]);
}

function decode(uid: string, data: Record<string, unknown> | undefined): UserData | null {
    const stored = fromStored<Record<string, unknown>>(userDocPath(uid), data, (d) => docLegacy.read(d));
    if (!stored) return null;
    return { watchlist: parseWatchItems(stored.value.watchlist) ?? [] };
}
