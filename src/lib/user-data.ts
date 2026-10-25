// Dane użytkownika przypięte do konta (nie do przeglądarki) — część wspólna bez I/O dla trasy
// `/api/me/*`, hooka `useWatchlist` i migracji szyfrowania. Dziś jedyne takie dane to watchlista.
//
// Jeden dokument na konto: `savori_users/{uid}`. Nazwa z przedrostkiem, bo projekt Firebase
// (`aplikacja-prawnicy`) ma też kolekcje innej aplikacji — zwykłe `users` mogłoby się zderzyć, a migracja
// szyfrowania przeglądałaby cudze dokumenty. Przeglądarka nie ma dostępu do bazy (firestore.rules);
// czyta i pisze wyłącznie serwer po zweryfikowaniu ciasteczka sesji.

export type WatchKind = 'wskaznik' | 'spolka';
export interface WatchItem { kind: WatchKind; id: string }

/** Treść dokumentu użytkownika (po odszyfrowaniu). Nowe pola dopisywać tutaj — zapis idzie całością. */
export interface UserData {
    watchlist: WatchItem[];
}

export const USER_COLLECTION = 'savori_users';
export const userDocPath = (uid: string) => `${USER_COLLECTION}/${uid}`;

/** Górny limit — watchlista to kilkadziesiąt pozycji, nie magazyn; dokument Firestore ma 1 MiB. */
export const MAX_WATCH_ITEMS = 200;
/** Identyfikatory to slugi z `lib/watch-ids.ts` i tickery (np. `PKO.WA`) — nic więcej nie wpuszczamy do bazy. */
const WATCH_ID = /^[A-Za-z0-9][A-Za-z0-9._:-]{0,63}$/;

const isKind = (k: unknown): k is WatchKind => k === 'wskaznik' || k === 'spolka';

/**
 * Walidacja listy z zewnątrz (localStorage, treść żądania PUT): tylko znane kształty, bez duplikatów,
 * najwyżej `MAX_WATCH_ITEMS`. `null` = to nie jest lista (zły typ) — trasa odpowiada 400.
 */
export function parseWatchItems(raw: unknown): WatchItem[] | null {
    if (!Array.isArray(raw)) return null;
    if (raw.length > MAX_WATCH_ITEMS) return null;
    const seen = new Set<string>();
    const out: WatchItem[] = [];
    for (const x of raw) {
        if (!x || typeof x !== 'object') return null;
        const { kind, id } = x as { kind?: unknown; id?: unknown };
        if (!isKind(kind) || typeof id !== 'string' || !WATCH_ID.test(id)) return null;
        const key = `${kind}:${id}`;
        if (seen.has(key)) continue;
        seen.add(key);
        out.push({ kind, id });
    }
    return out;
}

/** Jak `parseWatchItems`, ale śmieci pomija zamiast odrzucać całość — do odczytu z localStorage. */
export function sanitizeWatchItems(raw: unknown): WatchItem[] {
    if (!Array.isArray(raw)) return [];
    const kept = raw.filter((x) => x && typeof x === 'object' && isKind((x as WatchItem).kind)
        && typeof (x as WatchItem).id === 'string' && WATCH_ID.test((x as WatchItem).id));
    return parseWatchItems(kept.slice(0, MAX_WATCH_ITEMS)) ?? [];
}

export const sameWatchlist = (a: WatchItem[], b: WatchItem[]) =>
    a.length === b.length && a.every((x, i) => x.kind === b[i].kind && x.id === b[i].id);

/**
 * Pierwsze wejście zalogowanego użytkownika: co pokazać i czy wysłać coś na konto.
 * - konto ma dokument → wygrywa konto (to samo na każdym urządzeniu; lokalna kopia to tylko cache);
 * - konto bez dokumentu, a przeglądarka ma listę sprzed logowania → przenosimy ją na konto (raz);
 * - nic nigdzie → pusta lista, bez zapisu (nie tworzymy dokumentów za samo wejście).
 */
export function reconcileWatchlist(account: WatchItem[] | null, local: WatchItem[]): { items: WatchItem[]; pushToAccount: boolean } {
    if (account !== null) return { items: account, pushToAccount: false };
    return local.length > 0 ? { items: local, pushToAccount: true } : { items: [], pushToAccount: false };
}
