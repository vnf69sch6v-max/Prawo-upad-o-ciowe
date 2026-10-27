import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { parseDashboardData } from '@/lib/jp/stat-dashboard';
import {
    JP_TERTIARY_SERIES, expectedJpTertiary, nextTertiaryRelease, tertiaryMom, tertiarySentence, tertiaryYoy,
    type JpTertiaryPayload,
} from '@/lib/jp/tertiary';
import { datasetById, extractJpTertiary } from '@/lib/freshness';

const fixture = (name: string) => JSON.parse(readFileSync(`tests/fixtures/jp/${name}.json`, 'utf8'));
const cfg = (id: 'sa' | 'nsa') => JP_TERTIARY_SERIES.find((s) => s.id === id)!.query;

describe('tertiary industry activity', () => {
    it('reads the preliminary seasonal index, 106.8 in August 2026', () => {
        const s = parseDashboardData(fixture('dashboard-tertiary-sa'), cfg('sa'));
        expect(s.name).toContain('2020年基準');
        expect(s.points.at(-1)).toEqual({ date: '2026-08', value: 106.8, provisional: true });
        expect(s.points.find((p) => p.date === '2026-07')?.value).toBe(106.9);
        expect(tertiaryMom(s.points)).toBe(-0.1);
    });

    it('reads the unadjusted index and its year-on-year rate', () => {
        const s = parseDashboardData(fixture('dashboard-tertiary-nsa'), cfg('nsa'));
        expect(s.points.at(-1)).toEqual({ date: '2026-08', value: 103.7, provisional: true });
        expect(s.points.find((p) => p.date === '2025-08')?.value).toBe(102);
        expect(tertiaryYoy(s.points)).toBe(1.7);
    });

    it('rejects a seasonal series asked for as unadjusted', () => {
        expect(() => parseDashboardData(fixture('dashboard-tertiary-sa'), cfg('nsa'))).toThrow(/季調値|znacznik sezonowy/);
    });

    it('rejects an older base hiding in the same code slot', () => {
        const raw = fixture('dashboard-tertiary-sa');
        const classes = raw.GET_STATS.STATISTICAL_DATA.CLASS_INF.CLASS_OBJ as Array<{ '@id': string; CLASS: Array<{ '@name': string }> }>;
        const indicator = classes.find((c) => c['@id'] === 'indicator')!.CLASS[0];
        indicator['@name'] = '第３次産業活動指数　2015年基準';
        expect(() => parseDashboardData(raw, cfg('sa'))).toThrow(/2020年基準|2015年基準/);
    });

    it('switches at 13:30 JST on the release day', () => {
        expect(expectedJpTertiary(new Date('2026-10-19T04:29:00Z'))).toBe('2026-07');
        expect(expectedJpTertiary(new Date('2026-10-19T04:30:00Z'))).toBe('2026-08');
        expect(expectedJpTertiary(new Date('2026-09-15T04:29:00Z'))).toBe('2026-06');
        expect(expectedJpTertiary(new Date('2026-09-15T04:30:00Z'))).toBe('2026-07');
        expect(expectedJpTertiary(new Date('2026-11-17T04:29:00Z'))).toBe('2026-08');
        expect(expectedJpTertiary(new Date('2026-11-17T04:30:00Z'))).toBe('2026-09');
        expect(nextTertiaryRelease(new Date('2026-10-27T20:00:00Z'))).toEqual({ period: '2026-09', date: '2026-11-17' });
    });

    it('states the month-on-month dip, the index and the year-on-year rise', () => {
        const sa = parseDashboardData(fixture('dashboard-tertiary-sa'), cfg('sa')).points;
        const nsa = parseDashboardData(fixture('dashboard-tertiary-nsa'), cfg('nsa')).points;
        const payload = {
            series: { sa, nsa },
            names: { sa: '', nsa: '' },
            source: '',
            fetchedAt: '',
        } satisfies JpTertiaryPayload;
        expect(tertiarySentence(payload)).toBe('Dane za sierpień 2026, wstępne: aktywność usług, wyrównana sezonowo, spadła o 0,1% wobec poprzedniego miesiąca. Indeks wynosi 106,8 (baza 2020). Bez korekty sezonowej rok do roku: +1,7%.');
    });

    it('is a monthly freshness check on the seasonal index', () => {
        const spec = datasetById('jp-tertiary');
        expect(spec?.endpoint(new Date())).toBe('/api/jp/tertiary');
        expect(spec?.selfHeal).toBe(true);
        expect(extractJpTertiary({ series: { sa: [{ date: '2026-08', value: 106.8, provisional: true }] } })).toBe('2026-08');
    });
});
