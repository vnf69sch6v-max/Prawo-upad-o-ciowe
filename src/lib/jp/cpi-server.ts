// Japonia — CPI po stronie serwera: pobranie z Statistics Dashboard i cache w Firestore.
import { peekServerCache, withCache } from '@/lib/server-cache';
import { fetchDashboardSeries, type DashboardPoint } from './stat-dashboard';
import { JP_CPI_SERIES, JP_CPI_SOURCE, jpCpiIsEmpty, type JpCpiId, type JpCpiPayload } from './cpi';

const CACHE = { collection: 'jp_data', doc: 'cpi_v1' } as const;

/** Odczyt użytkownika: wpis młodszy niż 6 h; crony i tak odświeżają po każdej publikacji. */
const USER_TTL_MS = 6 * 3_600_000;

/**
 * Wymuszone odświeżenie (`?refresh=1`) trafia do źródła najwyżej raz na 10 min. W PL `refresh=1` było
 * publiczne bez limitu — każdy mógł wyczerpać wspólny limit GUS i zatrzymać crony.
 */
export const FORCED_REFRESH_MIN_AGE_MS = 10 * 60_000;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Wszystkie serie po kolei (z odstępem — API prosi o niewielki ruch). Błąd którejkolwiek = błąd całości:
 *  `withCache` zostawia wtedy poprzedni, spójny komplet zamiast mieszać stare serie z nowymi. */
export async function fetchJpCpi(): Promise<JpCpiPayload> {
    const series = {} as Record<JpCpiId, DashboardPoint[]>;
    for (const [i, cfg] of JP_CPI_SERIES.entries()) {
        if (i) await sleep(300);
        series[cfg.id] = (await fetchDashboardSeries(cfg.query)).points;
    }
    return { series, source: JP_CPI_SOURCE, fetchedAt: new Date().toISOString() };
}

export function getJpCpi({ force = false }: { force?: boolean } = {}): Promise<JpCpiPayload> {
    return withCache(CACHE.collection, CACHE.doc, fetchJpCpi, 'Statistics Dashboard',
        force ? FORCED_REFRESH_MIN_AGE_MS : USER_TTL_MS, { isEmpty: jpCpiIsEmpty });
}

/** Ostatnie zapisane dane bez wołania źródła — dla strony renderowanej na serwerze (ISR). */
export async function peekJpCpi(): Promise<JpCpiPayload | null> {
    const p = await peekServerCache<JpCpiPayload>(CACHE.collection, CACHE.doc);
    return p && !jpCpiIsEmpty(p) ? p : null;
}
