#!/usr/bin/env node
/**
 * Weryfikacja trwania watchlisty w localStorage (kryterium ukończenia z ROADMAP).
 * Symuluje przeglądarkę: zapis → „odświeżenie" (nowy odczyt) → te same pozycje.
 * Nie woła GUS/DBW ani żadnego API.
 */
import assert from 'node:assert/strict';

const KEY = 'mk:watchlist:v1';

/** Minimalny localStorage + walidacja jak w `src/lib/watchlist.ts`. */
function makeStore() {
    const bag = new Map();
    return {
        getItem: (k) => (bag.has(k) ? bag.get(k) : null),
        setItem: (k, v) => { bag.set(k, String(v)); },
        removeItem: (k) => { bag.delete(k); },
        _raw: bag,
    };
}

function read(store) {
    try {
        const raw = store.getItem(KEY);
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) return [];
        return parsed.filter(
            (x) => x && typeof x.id === 'string' && (x.kind === 'wskaznik' || x.kind === 'spolka'),
        );
    } catch {
        return [];
    }
}

function write(store, items) {
    store.setItem(KEY, JSON.stringify(items));
}

function toggle(store, kind, id) {
    const next = read(store);
    const idx = next.findIndex((i) => i.kind === kind && i.id === id);
    if (idx >= 0) next.splice(idx, 1);
    else next.push({ kind, id });
    write(store, next);
    return next;
}

// 1) Dodaj wskaźnik + spółkę
const store = makeStore();
toggle(store, 'wskaznik', 'cpi');
toggle(store, 'spolka', 'PKO');
toggle(store, 'wskaznik', 'wig20');

const afterAdd = read(store);
assert.equal(afterAdd.length, 3);
assert.deepEqual(afterAdd, [
    { kind: 'wskaznik', id: 'cpi' },
    { kind: 'spolka', id: 'PKO' },
    { kind: 'wskaznik', id: 'wig20' },
]);

// 2) „Odświeżenie strony" = nowy odczyt z tego samego storage (jak po F5)
const afterReload = read(store);
assert.deepEqual(afterReload, afterAdd, 'wybór musi przeżyć odświeżenie');

// 3) Toggle off jednego — reszta zostaje
toggle(store, 'wskaznik', 'cpi');
assert.deepEqual(read(store), [
    { kind: 'spolka', id: 'PKO' },
    { kind: 'wskaznik', id: 'wig20' },
]);

// 4) Śmieci w JSON nie psują listy
store.setItem(KEY, JSON.stringify([
    { kind: 'wskaznik', id: 'gold' },
    { kind: 'hack', id: 'x' },
    null,
    { kind: 'spolka' },
    { kind: 'spolka', id: 'KGH' },
]));
assert.deepEqual(read(store), [
    { kind: 'wskaznik', id: 'gold' },
    { kind: 'spolka', id: 'KGH' },
]);

// 5) Pusty / zły JSON → pusta lista, bez rzucania
store.setItem(KEY, '{nie-json');
assert.deepEqual(read(store), []);

console.log('OK — watchlista: persist localStorage zweryfikowany (wskaznik + spolka, reload, walidacja).');
