import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { dashboardUrl, parseDashboardData } from '@/lib/jp/stat-dashboard';
import { formatDecimalPL, formatNumber } from '@/lib/formatters';
import {
    JP_TRADE_SERIES, expectedJpTrade, formatMldYen, nextTradeRelease, okuToMld, tradeMldSeries, tradeSentence, type JpTradePayload,
} from '@/lib/jp/trade';
import { datasetById, extractJpTrade } from '@/lib/freshness';

const fixture = (name: string) => JSON.parse(readFileSync(`tests/fixtures/jp/${name}.json`, 'utf8'));
const cfg = (id: 'current' | 'trade') => JP_TRADE_SERIES.find((s) => s.id === id)!.query;

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
                trade: [{ date: '2026-08', value: -6877, provisional: true }],
            },
            names: { current: '経常収支', trade: '貿易収支' },
            source: '',
            fetchedAt: '',
        } satisfies JpTradePayload;
        expect(tradeSentence(payload)).toBe(
            `Dane za sierpień 2026: nadwyżka obrotów bieżących wyniosła ${formatNumber(4062, 0)} mld jenów. Deficyt handlu towarami wyniósł ${formatDecimalPL(687.7, 1)} mld jenów. Oba odczyty są wstępne.`,
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
