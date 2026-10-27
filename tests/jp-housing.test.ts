import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { formatNumber } from '@/lib/formatters';
import { dashboardUrl, parseDashboardData } from '@/lib/jp/stat-dashboard';
import {
    JP_HOUSING_SERIES, expectedJpHousing, housingAnnMom, housingSentence, housingYoy, nextHousingRelease, type JpHousingPayload,
} from '@/lib/jp/housing';
import { datasetById, extractJpHousing } from '@/lib/freshness';

const fixture = (name: string) => JSON.parse(readFileSync(`tests/fixtures/jp/${name}.json`, 'utf8'));
const cfg = (id: 'count' | 'annual') => JP_HOUSING_SERIES.find((s) => s.id === id)!.query;

describe('Japan housing starts', () => {
    it('reads the August count and the 6.1% rise versus a year earlier', () => {
        const s = parseDashboardData(fixture('dashboard-housing-count'), cfg('count'));
        expect(s.name).toBe('新設住宅着工戸数（総戸数）');
        expect(s.points.at(-1)).toEqual({ date: '2026-08', value: 63974 });
        expect(s.points.find((p) => p.date === '2025-08')?.value).toBe(60275);
        expect(housingYoy(s.points)).toBe(6.1);
        const url = new URL(dashboardUrl(cfg('count')));
        expect(url.searchParams.get('IsSeasonalAdjustment')).toBe('1');
    });

    it('reads the annualized rate and the 2.7% monthly drop, and rejects the plain count', () => {
        const s = parseDashboardData(fixture('dashboard-housing-annual'), cfg('annual'));
        expect(s.name).toContain('年率換算');
        expect(s.points.at(-1)).toEqual({ date: '2026-08', value: 753108 });
        expect(s.points.at(-2)?.value).toBe(773916);
        expect(housingAnnMom(s.points)).toBe(-2.7);
        expect(() => parseDashboardData(fixture('dashboard-housing-count'), cfg('annual'))).toThrow(/年率|季調|2/);
    });

    it('switches at 14:00 JST on the release day', () => {
        expect(expectedJpHousing(new Date('2026-09-30T04:59:00Z'))).toBe('2026-07');
        expect(expectedJpHousing(new Date('2026-09-30T05:00:00Z'))).toBe('2026-08');
        expect(expectedJpHousing(new Date('2026-10-27T20:00:00Z'))).toBe('2026-08');
        expect(expectedJpHousing(new Date('2026-10-30T04:59:00Z'))).toBe('2026-08');
        expect(expectedJpHousing(new Date('2026-10-30T05:00:00Z'))).toBe('2026-09');
        expect(nextHousingRelease(new Date('2026-10-27T20:00:00Z'))).toEqual({ period: '2026-09', date: '2026-10-30' });
    });

    it('states the count, the annual rate and both comparisons', () => {
        const payload = {
            series: {
                count: [{ date: '2025-08', value: 60275 }, { date: '2026-08', value: 63974 }],
                annual: [{ date: '2026-07', value: 773916 }, { date: '2026-08', value: 753108 }],
            },
            names: { count: '', annual: '' },
            source: '',
            fetchedAt: '',
        } satisfies JpHousingPayload;
        expect(housingSentence(payload)).toBe(
            `Dane za sierpień 2026: rozpoczęto budowę ${formatNumber(63974, 0)} mieszkań, o 6,1% więcej niż rok wcześniej. W skali roku, po wyrównaniu sezonowym: ${formatNumber(753108, 0)} mieszkań, mniej o 2,7% niż w poprzednim miesiącu.`,
        );
    });

    it('is a monthly freshness check on the dwelling count', () => {
        const spec = datasetById('jp-housing');
        expect(spec?.endpoint(new Date())).toBe('/api/jp/housing');
        expect(extractJpHousing({ series: { count: [{ date: '2026-08', value: 63974 }] } })).toBe('2026-08');
    });
});
