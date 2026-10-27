import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { dashboardUrl, parseDashboardData } from '@/lib/jp/stat-dashboard';
import { formatDecimalPL, formatNumber } from '@/lib/formatters';
import {
    JP_TRADE_SERIES, expectedJpTrade, formatMldYen, nextTradeRelease, okuToMld, primaryIncomeYoyOku, tradeMldSeries, tradeSentence, type JpTradePayload,
} from '@/lib/jp/trade';
import { datasetById, extractJpTrade } from '@/lib/freshness';

const fixture = (name: string) => JSON.parse(readFileSync(`tests/fixtures/jp/${name}.json`, 'utf8'));
const cfg = (id: 'current' | 'primary' | 'trade' | 'services') => JP_TRADE_SERIES.find((s) => s.id === id)!.query;

function withName(name: string, file: string) {
    const json = fixture(file);
    const classes = json.GET_STATS.STATISTICAL_DATA.CLASS_INF.CLASS_OBJ;
    const indicator = classes.find((c: { '@id': string }) => c['@id'] === 'indicator');
    const row = Array.isArray(indicator.CLASS) ? indicator.CLASS[0] : indicator.CLASS;
    row['@name'] = name;
    return json;
}

describe('Japan balance of payments', () => {
    it('reads the August preliminary trade deficit in units of 100 million yen', () => {
        const s = parseDashboardData(fixture('dashboard-trade'), cfg('trade'));
        expect(s.name).toBe('貿易収支');
        expect(s.points.at(-1)).toEqual({ date: '2026-08', value: -6877, provisional: true });
        expect(okuToMld(-6877)).toBe(-687.7);
        const url = new URL(dashboardUrl(cfg('trade')));
        expect(url.searchParams.get('Cycle')).toBe('1');
        expect(url.searchParams.get('TimeFrom')).toBe('20180100');
        expect(url.searchParams.get('IsSeasonalAdjustment')).toBe('1');
    });

    it('reads the August current-account surplus beside it', () => {
        const s = parseDashboardData(fixture('dashboard-ca'), cfg('current'));
        expect(s.name).toBe('経常収支');
        expect(s.points.at(-1)).toEqual({ date: '2026-08', value: 40620, provisional: true });
        expect(okuToMld(40620)).toBe(4062);
        expect(tradeMldSeries(s.points).at(-1)).toEqual({ date: '2026-08', value: 4062 });
        expect(formatMldYen(40620)).toBe(formatNumber(4062, 0));
        expect(formatMldYen(-6877)).toBe(formatDecimalPL(-687.7, 1));
    });

    it('reads the August primary-income surplus that widened the current account', () => {
        const s = parseDashboardData(fixture('dashboard-primary'), cfg('primary'));
        expect(s.name).toBe('第一次所得収支');
        expect(s.points.at(-1)).toEqual({ date: '2026-08', value: 51332, provisional: true });
        expect(okuToMld(51332)).toBe(5133.2);
        expect(primaryIncomeYoyOku([
            { date: '2025-08', value: 42227 },
            { date: '2026-08', value: 51332, provisional: true },
        ])).toBe(9105);
        const goodsServices = fixture('dashboard-primary');
        const indicator = goodsServices.GET_STATS.STATISTICAL_DATA.CLASS_INF.CLASS_OBJ.find((c: { '@id': string }) => c['@id'] === 'indicator');
        const row = Array.isArray(indicator.CLASS) ? indicator.CLASS[0] : indicator.CLASS;
        row['@name'] = '第二次所得収支';
        expect(() => parseDashboardData(goodsServices, cfg('primary'))).toThrow(/第一次所得収支|第二次/);
    });

    it('reads the August services deficit and rejects the combined goods-and-services name', () => {
        const s = parseDashboardData(fixture('dashboard-services'), cfg('services'));
        expect(s.name).toBe('サービス収支');
        expect(s.points.at(-1)).toEqual({ date: '2026-08', value: -1158, provisional: true });
        expect(okuToMld(-1158)).toBe(-115.8);
        const json = fixture('dashboard-services');
        const indicator = json.GET_STATS.STATISTICAL_DATA.CLASS_INF.CLASS_OBJ.find((c: { '@id': string }) => c['@id'] === 'indicator');
        const row = Array.isArray(indicator.CLASS) ? indicator.CLASS[0] : indicator.CLASS;
        row['@name'] = '貿易・サービス収支';
        expect(() => parseDashboardData(json, cfg('services'))).toThrow(/貿易/);
    });

    it('rejects a seasonally adjusted trade name and a dollar or ratio current account', () => {
        expect(() => parseDashboardData(withName('貿易収支（季節調整値）', 'dashboard-trade'), cfg('trade'))).toThrow(/季節調整値/);
        expect(() => parseDashboardData(withName('経常収支（米ドル）', 'dashboard-ca'), cfg('current'))).toThrow(/米ドル/);
        expect(() => parseDashboardData(withName('経常収支（比率）', 'dashboard-ca'), cfg('current'))).toThrow(/比率/);
        const json = fixture('dashboard-trade');
        const unit = json.GET_STATS.STATISTICAL_DATA.CLASS_INF.CLASS_OBJ.find((c: { '@id': string }) => c['@id'] === 'unit');
        const cls = Array.isArray(unit.CLASS) ? unit.CLASS[0] : unit.CLASS;
        cls.$ = '%';
        expect(() => parseDashboardData(json, cfg('trade'))).toThrow(/億円/);
    });

    it('switches at 8:50 JST on the preliminary release day', () => {
        expect(expectedJpTrade(new Date('2026-10-07T23:49:00Z'))).toBe('2026-07');
        expect(expectedJpTrade(new Date('2026-10-07T23:50:00Z'))).toBe('2026-08');
        expect(expectedJpTrade(new Date('2026-10-27T20:00:00Z'))).toBe('2026-08');
        expect(expectedJpTrade(new Date('2026-11-09T23:49:00Z'))).toBe('2026-08');
        expect(expectedJpTrade(new Date('2026-11-09T23:50:00Z'))).toBe('2026-09');
        expect(nextTradeRelease(new Date('2026-10-27T20:00:00Z'))).toEqual({ period: '2026-09', date: '2026-11-10' });
        expect(expectedJpTrade(new Date('2027-04-20T00:00:00Z'))).toBe('2027-02');
    });

    it('states the surplus and the deficit in billions of yen, and names the preliminary print', () => {
        const payload = {
            series: {
                current: [{ date: '2026-08', value: 40620, provisional: true }],
                primary: [
                    { date: '2025-08', value: 42227 },
                    { date: '2026-08', value: 51332, provisional: true },
                ],
                trade: [{ date: '2026-08', value: -6877, provisional: true }],
                services: [
                    { date: '2025-08', value: -2667 },
                    { date: '2026-08', value: -1158, provisional: true },
                ],
            },
            names: { current: '経常収支', primary: '第一次所得収支', trade: '貿易収支', services: 'サービス収支' },
            source: '',
            fetchedAt: '',
        } satisfies JpTradePayload;
        expect(tradeSentence(payload)).toBe(
            `Dane za sierpień 2026: nadwyżka obrotów bieżących wyniosła ${formatNumber(4062, 0)} mld jenów. Nadwyżka dochodu pierwotnego wyniosła ${formatDecimalPL(5133.2, 1)} mld jenów, wobec roku wcześniej więcej o ${formatDecimalPL(910.5, 1)} mld. Deficyt handlu towarami wyniósł ${formatDecimalPL(687.7, 1)} mld jenów. Deficyt usług wyniósł ${formatDecimalPL(115.8, 1)} mld jenów, o ${formatDecimalPL(150.9, 1)} mld mniejszy niż rok wcześniej. Odczyty są wstępne.`,
        );
    });

    it('is a monthly freshness check on the current account', () => {
        const spec = datasetById('jp-trade');
        expect(spec?.endpoint(new Date())).toBe('/api/jp/trade');
        expect(spec?.frequency).toBe('monthly');
        expect(spec?.maxAgeDays).toBe(100);
        expect(extractJpTrade({ series: { current: [{ date: '2026-08', value: 40620, provisional: true }] } })).toBe('2026-08');
    });
});
