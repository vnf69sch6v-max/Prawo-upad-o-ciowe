// Jedyne miejsce, w którym powstają ścieżki do tras GUS z walidacją parametrów (`src/lib/gus-params.ts`).
// Hooki, crony (`src/lib/cron-endpoints.ts`) i kontrola świeżości biorą je stąd, więc trafiają w ten sam klucz
// cache i nie mogą wysłać parametru, który trasa odrzuci (test: tests/gus-params.test.ts). Rok nie jest
// wysyłany — ustala go serwer w strefie Europe/Warsaw, więc zły zegar telefonu nie kończy się błędem 400.
import { dbwSeriesParams, type DbwSeriesId } from '@/lib/gus-dbw-series';

type Extra = Record<string, string>;

function withQuery(path: string, qs: URLSearchParams, extra: Extra): string {
    for (const [k, v] of Object.entries(extra)) qs.set(k, v);
    const s = qs.toString();
    return s ? `${path}?${s}` : path;
}

export const cpiFullPath = (extra: Extra = {}) => withQuery('/api/gus-cpi-full', new URLSearchParams(), extra);
export const ppiFullPath = (extra: Extra = {}) => withQuery('/api/gus-ppi-full', new URLSearchParams(), extra);
export const koniunkturaPath = (extra: Extra = {}) => withQuery('/api/gus-koniunktura', new URLSearchParams(), extra);
export const gusMonthlyPath = (extra: Extra = {}) => withQuery('/api/gus-monthly', new URLSearchParams(), extra);
/** Trasa bez czytelnika (nieużywany `useCpiNational`) — zablokowana walidacją, poza cronami. */
export const gusCpiPath = (extra: Extra = {}) => withQuery('/api/gus-cpi', new URLSearchParams(), extra);

/** `/api/dbw-series?...` dla serii z listy dozwolonych; `extra` dokleja np. `refresh=1` (cron). */
export const dbwSeriesPath = (id: DbwSeriesId, extra: Extra = {}) => withQuery('/api/dbw-series', dbwSeriesParams(id), extra);
