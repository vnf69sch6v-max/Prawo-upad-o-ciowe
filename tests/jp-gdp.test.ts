import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { dashboardUrl, parseDashboardData } from '@/lib/jp/stat-dashboard';
import { JP_GDP_SERIES, expectedJpGdp, gdpSentence, nextGdpRelease, type JpGdpPayload } from '@/lib/jp/gdp';
import { datasetById, extractJpGdp } from '@/lib/freshness';

const fixture = (name: string) => JSON.parse(readFileSync(`tests/fixtures/jp/${name}.json`, 'utf8'));
const cfg = (id: 'real' | 'nominal') => JP_GDP_SERIES.find((s) => s.id === id)!.query;

describe('Japan GDP', () => {
    it('reads the real quarter-on-quarter rate from the second estimate', () => {
        const s = parseDashboardData(fixture('dashboard-gdp-real'), cfg('real'));
        expect(s.name).toContain('実質');
        expect(s.name).toContain('2020年基準');
        expect(s.points.at(-1)).toEqual({ date: '2026-Q2', value: 0.4 });
        const url = new URL(dashboardUrl(cfg('real')));
        expect(url.searchParams.get('Cycle')).toBe('2');
        expect(url.searchParams.get('TimeFrom')).toBe('20151Q00');
        expect(url.searchParams.get('IsSeasonalAdjustment')).toBe('2');
    });

    it('reads nominal growth beside it and rejects a swapped series', () => {
        const s = parseDashboardData(fixture('dashboard-gdp-nominal'), cfg('nominal'));
        expect(s.points.at(-1)).toEqual({ date: '2026-Q2', value: 1.3 });
        expect(() => parseDashboardData(fixture('dashboard-gdp-nominal'), cfg('real'))).toThrow(/名目/);
    });

    it('switches at 8:50 JST on the second-estimate day', () => {
        expect(expectedJpGdp(new Date('2026-09-07T23:49:00Z'))).toBe('2026-Q1');
        expect(expectedJpGdp(new Date('2026-09-07T23:50:00Z'))).toBe('2026-Q2');
        expect(expectedJpGdp(new Date('2026-10-27T20:00:00Z'))).toBe('2026-Q2');
        expect(expectedJpGdp(new Date('2026-12-07T23:49:00Z'))).toBe('2026-Q2');
        expect(expectedJpGdp(new Date('2026-12-07T23:50:00Z'))).toBe('2026-Q3');
        expect(nextGdpRelease(new Date('2026-10-27T20:00:00Z'))).toEqual({ period: '2026-Q3', date: '2026-12-08' });
    });

    it('states real and nominal growth for the same quarter', () => {
        const payload = {
            series: {
                real: [{ date: '2026-Q1', value: 0.5 }, { date: '2026-Q2', value: 0.4 }],
                nominal: [{ date: '2026-Q2', value: 1.3 }],
            },
            names: { real: '', nominal: '' },
            source: '',
            fetchedAt: '',
        } satisfies JpGdpPayload;
        expect(gdpSentence(payload)).toBe('Dane za II kwartał 2026: PKB realny, wyrównany sezonowo, wzrósł o 0,4% wobec poprzedniego kwartału. Nominalny: 1,3%.');
    });

    it('is a quarterly freshness check on the real series', () => {
        const spec = datasetById('jp-gdp');
        expect(spec?.endpoint(new Date())).toBe('/api/jp/gdp');
        expect(spec?.frequency).toBe('quarterly');
        expect(extractJpGdp({ series: { real: [{ date: '2026-Q2', value: 0.4 }] } })).toBe('2026-Q2');
    });
});
