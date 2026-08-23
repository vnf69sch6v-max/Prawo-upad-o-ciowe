/**
 * Lekkie testy czystych helperów makro (bez Firestore).
 * Uruchom: npx tsx src/lib/news/daily-macro.selftest.ts
 */
import { fmtDelta, readingDateKey } from './daily-macro';

function assert(cond: boolean, msg: string) {
    if (!cond) throw new Error(msg);
}

assert(fmtDelta(3995, 3977, 'pct') === '+0.45%', `pct relative, got ${fmtDelta(3995, 3977, 'pct')}`);
assert(fmtDelta(3.0, 2.5, 'pp') === '+0.5 pp', `pp, got ${fmtDelta(3.0, 2.5, 'pp')}`);
assert(readingDateKey('2026-08-21') === '2026-08-21', 'plain date');
assert(readingDateKey('2026-08-21T15:15:00.000Z') === '2026-08-21', 'iso → Warsaw day');
assert(readingDateKey(null) === null, 'null');

console.log('daily-macro.selftest: ok');
