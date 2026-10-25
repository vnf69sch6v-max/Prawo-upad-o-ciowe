// Watchlista zalogowanego użytkownika — dane konta, nie przeglądarki (ta sama lista na każdym urządzeniu).
// GET  → { items, account: true }  albo  { items: [], account: false }, gdy konto nie ma jeszcze dokumentu
//        (klient przenosi wtedy listę z localStorage — jedyny moment, w którym przeglądarka „wygrywa”).
// PUT  { items } → zapis całej listy (walidacja: znane kształty, ≤ MAX_WATCH_ITEMS). Zły kształt = 400 bez zapisu.
// Tożsamość wyłącznie z ciasteczka sesji (src/lib/auth/require-session.ts); bez Admin SDK (demo) — 501,
// klient zostaje przy pamięci przeglądarki. Odpowiedzi nigdy do cache (dane osobiste).
import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase/admin';
import { requireSession, sameOrigin } from '@/lib/auth/require-session';
import { parseWatchItems } from '@/lib/user-data';
import { readUserData, writeUserData } from '@/lib/user-data-server';

export const dynamic = 'force-dynamic';

const NO_STORE = { 'Cache-Control': 'private, no-store' };
const json = (body: unknown, status = 200) => NextResponse.json(body, { status, headers: NO_STORE });

export async function GET(request: NextRequest) {
    const session = await requireSession(request);
    if (!session.ok) return json({ error: session.error }, session.status);
    const db = getAdminDb();
    if (!db) return json({ error: 'auth-not-configured' }, 501);
    try {
        const data = await readUserData(db, session.uid);
        return json(data ? { items: data.watchlist, account: true } : { items: [], account: false });
    } catch (err) {
        console.error('[me/watchlist] odczyt:', String(err).slice(0, 200));
        return json({ error: 'storage' }, 503);
    }
}

export async function PUT(request: NextRequest) {
    if (!sameOrigin(request)) return json({ error: 'forbidden' }, 403);
    if (!request.headers.get('content-type')?.toLowerCase().startsWith('application/json')) return json({ error: 'unsupported-media-type' }, 415);
    const session = await requireSession(request);
    if (!session.ok) return json({ error: session.error }, session.status);
    const db = getAdminDb();
    if (!db) return json({ error: 'auth-not-configured' }, 501);

    let body: unknown;
    try {
        body = await request.json();
    } catch {
        return json({ error: 'bad-json' }, 400);
    }
    const items = parseWatchItems((body as { items?: unknown } | null)?.items);
    if (!items) return json({ error: 'bad-items' }, 400);

    try {
        const data = await writeUserData(db, session.uid, { watchlist: items });
        return json({ items: data.watchlist, account: true });
    } catch (err) {
        console.error('[me/watchlist] zapis:', String(err).slice(0, 200));
        return json({ error: 'storage' }, 503);
    }
}
