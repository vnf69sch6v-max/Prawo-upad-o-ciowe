import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { parseDashboardData } from '@/lib/jp/stat-dashboard';
import { JP_WAGE_SERIES, expectedJpWages, nextWageRelease, wageChangePp, wagesSentence, type JpWagesPayload } from '@/lib/jp/wages';
import { datasetById, extractJpWages } from '@/lib/freshness';

const fixture = (name: string) => JSON.parse(readFileSync(`tests/fixtures/jp/${name}.json`, 'utf8'));
const cfg = (id: 'nominal' | 'real') => JP_WAGE_SERIES.find((s) => s.id === id)!.query;

describe('Monthly Labour Survey wages', () => {
    it('reads the revised nominal rate from the final release', () => {
        const s = parseDashboardData(fixture('dashboard-wage-nominal'), cfg('nominal'));
        expect(s.name).toBe('（前年同月比）現金給与総額');
        expect(s.points.at(-1)).toEqual({ date: '2026-08', value: 3.9 });
        expect(s.points.find((p) => p.date === '2026-07')).toEqual({ date: '2026-07', value: 4.3 });
    });

    it('reads real wages deflated by CPI excluding imputed rent', () => {
        const s = parseDashboardData(fixture('dashboard-wage-real'), cfg('real'));
        expect(s.name).toContain('実質');
        expect(s.points.at(-1)).toEqual({ date: '2026-08', value: 1.6 });
    });

    it('rejects the real series when the nominal config is applied', () => {
        expect(() => parseDashboardData(fixture('dashboard-wage-real'), cfg('nominal'))).toThrow(/実質/);
    });

    it('switches to August at 8:30 JST on the final-release date, not the flash', () => {
        expect(expectedJpWages(new Date('2026-10-22T23:29:00Z'))).toBe('2026-07');
        expect(expectedJpWages(new Date('2026-10-22T23:30:00Z'))).toBe('2026-08');
        expect(expectedJpWages(new Date('2026-10-27T20:00:00Z'))).toBe('2026-08');
        expect(expectedJpWages(new Date('2026-11-24T23:29:00Z'))).toBe('2026-08');
        expect(expectedJpWages(new Date('2026-11-24T23:30:00Z'))).toBe('2026-09');
        expect(nextWageRelease(new Date('2026-10-27T20:00:00Z'))).toEqual({ period: '2026-09', date: '2026-11-25' });
    });

    it('states nominal and real growth for the same month', () => {
        const payload = {
            series: {
                nominal: [{ date: '2026-07', value: 4.3 }, { date: '2026-08', value: 3.9 }],
                real: [{ date: '2026-08', value: 1.6 }],
            },
            names: { nominal: '', real: '' },
            source: '',
            fetchedAt: '',
        } satisfies JpWagesPayload;
        expect(wagesSentence(payload)).toBe('Dane za sierpień 2026: płace nominalne wynoszą 3,9% r/r, realne 1,6% r/r.');
        expect(wageChangePp(payload.series.nominal)).toBe(-0.4);
    });

    it('is a monthly freshness check on the nominal series', () => {
        const spec = datasetById('jp-wages');
        expect(spec?.endpoint(new Date())).toBe('/api/jp/wages');
        expect(spec?.selfHeal).toBe(true);
        expect(extractJpWages({ series: { nominal: [{ date: '2026-08', value: 3.9 }] } })).toBe('2026-08');
    });
});
