import { peekServerCache, withCache } from '@/lib/server-cache';
import { fetchDashboardSeries, type DashboardPoint } from './stat-dashboard';
import { JP_JOBS_SERIES, JP_JOBS_SOURCE, jpJobsIsEmpty, type JpJobsId, type JpJobsPayload } from './jobs';

const CACHE = { collection: 'jp_data', doc: 'jobs_v1' } as const;
const USER_TTL_MS = 6 * 3_600_000;

export async function fetchJpJobs(): Promise<JpJobsPayload> {
    const series = {} as Record<JpJobsId, DashboardPoint[]>;
    const names = {} as Record<JpJobsId, string>;
    for (const [i, cfg] of JP_JOBS_SERIES.entries()) {
        if (i) await new Promise((r) => setTimeout(r, 300));
        const row = await fetchDashboardSeries(cfg.query);
        series[cfg.id] = row.points;
        names[cfg.id] = row.name;
    }
    return { series, names, source: JP_JOBS_SOURCE, fetchedAt: new Date().toISOString() };
}

export function getJpJobs({ force = false }: { force?: boolean } = {}): Promise<JpJobsPayload> {
    return withCache(CACHE.collection, CACHE.doc, fetchJpJobs, 'Statistics Dashboard',
        force ? -1 : USER_TTL_MS, { isEmpty: jpJobsIsEmpty });
}

export async function peekJpJobs(): Promise<JpJobsPayload | null> {
    const p = await peekServerCache<JpJobsPayload>(CACHE.collection, CACHE.doc);
    return p && !jpJobsIsEmpty(p) ? p : null;
}
