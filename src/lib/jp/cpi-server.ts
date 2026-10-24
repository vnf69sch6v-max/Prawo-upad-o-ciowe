// Japonia — CPI po stronie serwera: pobranie z Statistics Dashboard i cache w Firestore.
import { peekServerCache, withCache } from '@/lib/server-cache';
import { fetchDashboardSeries, type DashboardPoint } from './stat-dashboard';
import { JP_CPI_SERIES, JP_CPI_SOURCE, jpCpiIsEmpty, type JpCpiId, type JpCpiPayload } from './cpi';

// v2: komplet z serią `exFoodEnergy` (rozbicie). Nowy klucz zamiast łatania starego wpisu — strona nigdy
// nie dostaje kompletu bez serii potrzebnej do rozbicia.
const CACHE = { collection: 'jp_data', doc: 'cpi_v2' } as const;

/** Odczyt użytkownika: wpis młodszy niż 6 h; crony i tak odświeżają po każdej publikacji. */
const USER_TTL_MS = 6 * 3_600_000;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Wszystkie serie po kolei (z odstępem — API prosi o niewielki ruch). Najgorszy przypadek:
 *  5 serii × 10 s (`DASHBOARD_TIMEOUT_MS`) + 4 × 0,3 s = 51,2 s < maxDuration 60 s tras
 *  /api/jp/cpi i /api/cron/jp (kod + vercel.json). Przy kolejnej serii — przeliczyć. Błąd którejkolwiek = błąd całości:
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
        // force → -1: `withCache` idzie do źródła najwyżej raz na 10 min (FORCED_REFRESH_MIN_AGE_MS).
        force ? -1 : USER_TTL_MS, { isEmpty: jpCpiIsEmpty });
}

/** Ostatnie zapisane dane bez wołania źródła — dla strony renderowanej na serwerze (ISR). */
export async function peekJpCpi(): Promise<JpCpiPayload | null> {
    const p = await peekServerCache<JpCpiPayload>(CACHE.collection, CACHE.doc);
    return p && !jpCpiIsEmpty(p) ? p : null;
}
