// Godziny sesji i okien publikacji w strefie Europe/Warsaw — współdzielone przez klienta i API.

const TZ = 'Europe/Warsaw';

function warsawWeekday(date: Date): string {
    return new Intl.DateTimeFormat('en-US', { timeZone: TZ, weekday: 'short' }).format(date);
}

/** Minuty od północy w Warszawie (0–1439). */
export function warsawMinutes(date = new Date()): number {
    const parts = new Intl.DateTimeFormat('en-GB', {
        timeZone: TZ,
        hour: 'numeric',
        minute: 'numeric',
        hour12: false,
    }).formatToParts(date);
    const h = parseInt(parts.find((p) => p.type === 'hour')?.value ?? '0', 10);
    const m = parseInt(parts.find((p) => p.type === 'minute')?.value ?? '0', 10);
    return h * 60 + m;
}

export function isWeekdayInWarsaw(date = new Date()): boolean {
    return !['Sat', 'Sun'].includes(warsawWeekday(date));
}

/** Sesja GPW: pn–pt 9:00–17:05 CET/CEST. */
export function isGpwSession(date = new Date()): boolean {
    if (!isWeekdayInWarsaw(date)) return false;
    const mins = warsawMinutes(date);
    return mins >= 9 * 60 && mins < 17 * 60 + 5;
}

/** NBP publikuje tabelę A ok. 12:15 — okno intensywnego odświeżania. */
export function isNbpPublishWindow(date = new Date()): boolean {
    if (!isWeekdayInWarsaw(date)) return false;
    const mins = warsawMinutes(date);
    return mins >= 12 * 60 + 15 && mins < 14 * 60;
}

/** TTL cache serwera dla notowań GPW — krótszy w trakcie sesji. */
export function marketCacheTtlMs(date = new Date()): number {
    return isGpwSession(date) ? 5 * 60 * 1000 : 2 * 3600 * 1000;
}

/** TTL cache serwera dla kursów NBP — krótszy po publikacji tabeli. */
export function nbpCacheTtlMs(date = new Date()): number {
    return isNbpPublishWindow(date) ? 10 * 60 * 1000 : 6 * 3600 * 1000;
}
