import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { dashboardUrl, parseDashboardData } from '@/lib/jp/stat-dashboard';
import { JP_CGPI_SERIES, cgpiMom, cgpiSentence, expectedJpCgpi, nextCgpiRelease, type JpCgpiPayload } from '@/lib/jp/cgpi';
import { datasetById, extractJpCgpi } from '@/lib/freshness';

const fixture = (name: string) => JSON.parse(readFileSync(`tests/fixtures/jp/${name}.json`, 'utf8'));
const cfg = (id: 'yoy' | 'index') => JP_CGPI_SERIES.find((s) => s.id === id)!.query;

describe('Japan producer prices', () => {
    it('reads the September preliminary year-on-year rate, 2020 base', () => {
        const s = parseDashboardData(fixture('dashboard-cgpi-yoy'), cfg('yoy'));
        expect(s.name).toContain('前年同月比');
        expect(s.name).toContain('2020年基準');
        expect(s.points.at(-1)).toEqual({ date: '2026-09', value: 6.8, provisional: true });
        expect(s.points.at(-2)).toEqual({ date: '2026-08', value: 7.6 });
        const url = new URL(dashboardUrl(cfg('yoy')));
        expect(url.searchParams.get('IsSeasonalAdjustment')).toBe('1');
        expect(url.searchParams.get('TimeFrom')).toBe('20180100');
    });

    it('reads the index and the month-on-month move from the release', () => {
        const s = parseDashboardData(fixture('dashboard-cgpi-index'), cfg('index'));
        expect(s.name).toBe('国内企業物価指数（総平均）2020年基準');
        expect(s.points.at(-1)).toEqual({ date: '2026-09', value: 135.7, provisional: true });
        expect(s.points.at(-2)?.value).toBe(136.1);
        expect(cgpiMom(s.points)).toBe(-0.3);
        expect(() => parseDashboardData(fixture('dashboard-cgpi-yoy'), cfg('index'))).toThrow(/前年/);
    });

    it('switches at 8:50 JST on the release day', () => {
        expect(expectedJpCgpi(new Date('2026-10-12T23:49:00Z'))).toBe('2026-08');
        expect(expectedJpCgpi(new Date('2026-10-12T23:50:00Z'))).toBe('2026-09');
        expect(expectedJpCgpi(new Date('2026-10-27T20:00:00Z'))).toBe('2026-09');
        expect(expectedJpCgpi(new Date('2026-11-11T23:49:00Z'))).toBe('2026-09');
        expect(expectedJpCgpi(new Date('2026-11-11T23:50:00Z'))).toBe('2026-10');
        expect(nextCgpiRelease(new Date('2026-10-27T20:00:00Z'))).toEqual({ period: '2026-10', date: '2026-11-12' });
    });

    it('states the annual rate, the index and the preliminary flag', () => {
        const payload = {
            series: {
                yoy: [{ date: '2026-08', value: 7.6 }, { date: '2026-09', value: 6.8, provisional: true }],
                index: [{ date: '2026-08', value: 136.1 }, { date: '2026-09', value: 135.7, provisional: true }],
            },
            names: { yoy: '', index: '' },
            source: '',
            fetchedAt: '',
        } satisfies JpCgpiPayload;
        expect(cgpiSentence(payload)).toBe('Dane za wrzesień 2026: ceny producenta wzrosły o 6,8% wobec roku wcześniej. Indeks wynosi 135,7 (baza 2020). Wobec poprzedniego miesiąca indeks spadł o 0,3%. Odczyt jest wstępny.');
    });

    it('is a monthly freshness check on the year-on-year series', () => {
        const spec = datasetById('jp-cgpi');
        expect(spec?.endpoint(new Date())).toBe('/api/jp/cgpi');
        expect(spec?.frequency).toBe('monthly');
        expect(extractJpCgpi({ series: { yoy: [{ date: '2026-09', value: 6.8, provisional: true }] } })).toBe('2026-09');
    });
});
