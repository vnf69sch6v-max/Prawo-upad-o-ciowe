/**
 * Data kalendarzowa Europe/Warsaw (YYYY-MM-DD) — NIE UTC.
 * Ten sam wzorzec Intl co `parse.ts` / warsawWallClock.
 */
export function warsawDateKey(when: Date | number | string = Date.now()): string {
    const d = typeof when === 'object' && when instanceof Date ? when : new Date(when);
    const parts = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Europe/Warsaw',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    }).formatToParts(d);
    const p: Record<string, string> = {};
    for (const part of parts) p[part.type] = part.value;
    return `${p.year}-${p.month}-${p.day}`;
}

/** Jutro względem podanej daty kalendarzowej YYYY-MM-DD (Warsaw wall-clock +24h przez UTC noon). */
export function nextCalendarDate(yyyyMmDd: string): string {
    const [y, m, d] = yyyyMmDd.split('-').map(Number);
    // Południe UTC → bezpiecznie w obrębie dnia Warsaw niezależnie od DST.
    const noon = Date.UTC(y, m - 1, d, 12, 0, 0);
    return warsawDateKey(noon + 24 * 3600 * 1000);
}

/** Wczoraj względem podanej daty kalendarzowej YYYY-MM-DD. */
export function prevCalendarDate(yyyyMmDd: string): string {
    const [y, m, d] = yyyyMmDd.split('-').map(Number);
    const noon = Date.UTC(y, m - 1, d, 12, 0, 0);
    return warsawDateKey(noon - 24 * 3600 * 1000);
}
