import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { parseDashboardData } from '@/lib/jp/stat-dashboard';
import { formatNumber } from '@/lib/formatters';
import { JP_RETAIL_QUERY, expectedJpRetail, retailSentence, retailYoy, retailYoySeries } from '@/lib/jp/retail';
import { datasetById, extractJpRetail } from '@/lib/freshness';

const fixture = () => JSON.parse(readFileSync('tests/fixtures/jp/dashboard-retail.json', 'utf8'));

describe('retail sales', () => {
    it('reads the revised August level in units of 1 billion yen', () => {
        const s = parseDashboardData(fixture(), JP_RETAIL_QUERY);
        expect(s.name).toBe('小売業販売額（名目）');
        expect(s.points.at(-1)).toEqual({ date: '2026-08', value: 13072 });
        expect(s.points.find((p) => p.date === '2025-08')?.value).toBe(12706);
        expect(retailYoy(s.points)).toBe(2.9);
    });

    it('rejects a series whose unit is not 10億円', () => {
        const json = fixture();
        const unit = json.GET_STATS.STATISTICAL_DATA.CLASS_INF.CLASS_OBJ.find((c: { '@id': string }) => c['@id'] === 'unit');
        const cls = Array.isArray(unit.CLASS) ? unit.CLASS[0] : unit.CLASS;
        cls.$ = '%';
        expect(() => parseDashboardData(json, JP_RETAIL_QUERY)).toThrow(/10億円/);
    });

    it('does not invent a year-on-year rate across the 2025 census break', () => {
        const points = [
            { date: '2024-08', value: 12000 },
            { date: '2025-08', value: 12706 },
        ];
        expect(retailYoy(points)).toBeNull();
        expect(retailYoySeries(points)).toEqual([]);
    });

    it('switches at 13:30 JST on the retail final day, which is not the industrial one in every month', () => {
        expect(expectedJpRetail(new Date('2026-10-15T04:29:00Z'))).toBe('2026-07');
        expect(expectedJpRetail(new Date('2026-10-15T04:30:00Z'))).toBe('2026-08');
        expect(expectedJpRetail(new Date('2026-09-30T00:00:00Z'))).toBe('2026-07');
        expect(expectedJpRetail(new Date('2026-07-15T04:29:00Z'))).toBe('2026-04');
        expect(expectedJpRetail(new Date('2026-07-15T04:30:00Z'))).toBe('2026-05');
    });

    it('states the level in billions of yen and the year-on-year rate', () => {
        const points = parseDashboardData(fixture(), JP_RETAIL_QUERY).points;
        expect(retailSentence(points)).toBe(`Dane za sierpień 2026: sprzedaż detaliczna wyniosła ${formatNumber(13072, 0)} mld jenów, więcej o 2,9% niż rok wcześniej.`);
    });

    it('is a monthly freshness check on the sales month', () => {
        const spec = datasetById('jp-retail');
        expect(spec?.endpoint(new Date())).toBe('/api/jp/retail');
        expect(extractJpRetail({ points: [{ date: '2026-08', value: 13072 }] })).toBe('2026-08');
    });
});
