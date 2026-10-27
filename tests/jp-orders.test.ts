import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { dashboardUrl, parseDashboardData } from '@/lib/jp/stat-dashboard';
import { formatDecimalPL } from '@/lib/formatters';
import {
    JP_ORDERS_SERIES, expectedJpOrders, formatOrdersMld, nextOrdersRelease, ordersMom, ordersMld, ordersSentence, type JpOrdersPayload,
} from '@/lib/jp/orders';
import { datasetById, extractJpOrders } from '@/lib/freshness';

const fixture = (name: string) => JSON.parse(readFileSync(`tests/fixtures/jp/${name}.json`, 'utf8'));
const cfg = (id: 'sa' | 'yoy') => JP_ORDERS_SERIES.find((s) => s.id === id)!.query;

describe('Japan machinery orders', () => {
    it('reads the seasonally adjusted August level and the 5.2% monthly rise', () => {
        const s = parseDashboardData(fixture('dashboard-orders-sa'), cfg('sa'));
        expect(s.name).toContain('船舶・電力を除く民需');
        expect(s.points.at(-1)).toEqual({ date: '2026-08', value: 1069779 });
        expect(s.points.at(-2)?.value).toBe(1016877);
        expect(ordersMom(s.points)).toBe(5.2);
        expect(ordersMld(1069779)).toBe(1069.8);
        expect(formatOrdersMld(1069779)).toBe(formatDecimalPL(1069.8, 1));
        const url = new URL(dashboardUrl(cfg('sa')));
        expect(url.searchParams.get('IsSeasonalAdjustment')).toBe('2');
    });

    it('reads the unadjusted 18.6% year-on-year rate and rejects it as the seasonal level', () => {
        const s = parseDashboardData(fixture('dashboard-orders-yoy'), cfg('yoy'));
        expect(s.name).toContain('前年同月比');
        expect(s.points.at(-1)).toEqual({ date: '2026-08', value: 18.6 });
        expect(() => parseDashboardData(fixture('dashboard-orders-yoy'), cfg('sa'))).toThrow(/前年同月比/);
    });

    it('switches at 8:50 JST on the Cabinet Office release day', () => {
        expect(expectedJpOrders(new Date('2026-10-14T23:49:00Z'))).toBe('2026-07');
        expect(expectedJpOrders(new Date('2026-10-14T23:50:00Z'))).toBe('2026-08');
        expect(expectedJpOrders(new Date('2026-10-27T20:00:00Z'))).toBe('2026-08');
        expect(expectedJpOrders(new Date('2026-11-18T23:49:00Z'))).toBe('2026-08');
        expect(expectedJpOrders(new Date('2026-11-18T23:50:00Z'))).toBe('2026-09');
        expect(nextOrdersRelease(new Date('2026-10-27T20:00:00Z'))).toEqual({ period: '2026-09', date: '2026-11-19' });
    });

    it('states the monthly rise and the year-on-year rate', () => {
        const payload = {
            series: {
                sa: [{ date: '2026-07', value: 1016877 }, { date: '2026-08', value: 1069779 }],
                yoy: [{ date: '2026-08', value: 18.6 }],
            },
            names: { sa: '', yoy: '' },
            source: '',
            fetchedAt: '',
        } satisfies JpOrdersPayload;
        expect(ordersSentence(payload)).toBe('Dane za sierpień 2026: zamówienia maszyn wzrosły o 5,2% wobec poprzedniego miesiąca, po wyrównaniu sezonowym. Rok do roku, bez korekty sezonowej: +18,6%. To popyt prywatny bez statków i energetyki.');
    });

    it('is a monthly freshness check on the seasonal series', () => {
        const spec = datasetById('jp-orders');
        expect(spec?.endpoint(new Date())).toBe('/api/jp/orders');
        expect(extractJpOrders({ series: { sa: [{ date: '2026-08', value: 1069779 }] } })).toBe('2026-08');
    });
});
