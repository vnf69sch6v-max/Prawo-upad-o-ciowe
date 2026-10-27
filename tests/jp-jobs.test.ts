import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { parseDashboardData } from '@/lib/jp/stat-dashboard';
import { JP_JOBS_SERIES, expectedJpJobs, jobsDelta, jobsSentence, nextJobsRelease, type JpJobsPayload } from '@/lib/jp/jobs';
import { datasetById, extractJpJobs } from '@/lib/freshness';

const fixture = (name: string) => JSON.parse(readFileSync(`tests/fixtures/jp/${name}.json`, 'utf8'));
const cfg = (id: 'sa' | 'nsa' | 'fresh') => JP_JOBS_SERIES.find((s) => s.id === id)!.query;

describe('Japan job openings', () => {
    it('reads 1.18 openings per seeker in August, unchanged from July', () => {
        const s = parseDashboardData(fixture('dashboard-jobs-sa'), cfg('sa'));
        expect(s.name).toBe('有効求人倍率');
        expect(s.points.at(-1)).toEqual({ date: '2026-08', value: 1.18 });
        expect(s.points.find((p) => p.date === '2026-07')?.value).toBe(1.18);
        expect(jobsDelta(s.points)).toBe(0);
    });

    it('reads the unadjusted ratio and rejects a seasonal series asked for as raw', () => {
        const s = parseDashboardData(fixture('dashboard-jobs-nsa'), cfg('nsa'));
        expect(s.points.at(-1)).toEqual({ date: '2026-08', value: 1.16 });
        expect(s.points.find((p) => p.date === '2025-08')?.value).toBe(1.18);
        expect(() => parseDashboardData(fixture('dashboard-jobs-sa'), cfg('nsa'))).toThrow(/季調値|znacznik sezonowy/);
    });

    it('reads 2.06 new openings, down 0.04 from July', () => {
        const s = parseDashboardData(fixture('dashboard-jobs-fresh'), cfg('fresh'));
        expect(s.name).toBe('新規求人倍率');
        expect(s.points.at(-1)).toEqual({ date: '2026-08', value: 2.06 });
        expect(s.points.at(-2)?.value).toBe(2.1);
        expect(jobsDelta(s.points)).toBe(-0.04);
        expect(() => parseDashboardData(fixture('dashboard-jobs-sa'), cfg('fresh'))).toThrow(/新規求人倍率/);
    });

    it('switches at 8:30 JST on the release morning', () => {
        expect(expectedJpJobs(new Date('2026-10-01T23:29:00Z'))).toBe('2026-07');
        expect(expectedJpJobs(new Date('2026-10-01T23:30:00Z'))).toBe('2026-08');
        expect(expectedJpJobs(new Date('2026-10-27T20:00:00Z'))).toBe('2026-08');
        expect(expectedJpJobs(new Date('2026-10-29T23:29:00Z'))).toBe('2026-08');
        expect(expectedJpJobs(new Date('2026-10-29T23:30:00Z'))).toBe('2026-09');
        expect(nextJobsRelease(new Date('2026-10-27T20:00:00Z'))).toEqual({ period: '2026-09', date: '2026-10-30' });
    });

    it('states the flat ratio and the drop in new openings', () => {
        const sa = parseDashboardData(fixture('dashboard-jobs-sa'), cfg('sa')).points;
        const nsa = parseDashboardData(fixture('dashboard-jobs-nsa'), cfg('nsa')).points;
        const fresh = parseDashboardData(fixture('dashboard-jobs-fresh'), cfg('fresh')).points;
        const payload = {
            series: { sa, nsa, fresh },
            names: { sa: '', nsa: '', fresh: '' },
            source: '', fetchedAt: '',
        } satisfies JpJobsPayload;
        expect(jobsSentence(payload)).toBe('Dane za sierpień 2026: na osobę szukającą pracy w urzędzie pracy przypada 1,18 oferty, tyle samo co miesiąc wcześniej. Bez korekty sezonowej: 1,16. Nowe oferty: 2,06 na osobę, o 0,04 mniej niż miesiąc wcześniej.');
    });

    it('is a monthly freshness check on the seasonal ratio', () => {
        const spec = datasetById('jp-jobs');
        expect(spec?.endpoint(new Date())).toBe('/api/jp/jobs');
        expect(spec?.selfHeal).toBe(true);
        expect(extractJpJobs({ series: { sa: [{ date: '2026-08', value: 1.18 }] } })).toBe('2026-08');
    });
});
