import { describe, expect, it } from 'vitest';
import { BOJ_SERIES, expectedUsdJpyDate, marketsSentence, parseBojSeries, type BojPayload } from '@/lib/jp/boj';
import { activeNavHref, type NavItem } from '@/components/shell/TopNav';
import { datasetById, extractJpUsdJpy } from '@/lib/freshness';

const fxCfg = BOJ_SERIES.find((s) => s.id === 'usdjpy')!;

const fxJson = {
    STATUS: 200,
    RESULTSET: [{
        SERIES_CODE: 'FXERD04',
        NAME_OF_TIME_SERIES: 'US.Dollar/Yen Spot Rate at 17:00 in JST, Tokyo Market',
        UNIT: 'Yen per U.S. Dollar',
        VALUES: { SURVEY_DATES: [20261022, 20261023, 20261024], VALUES: [157.23, 156.96, null] },
    }],
};

describe('BOJ markets', () => {
    it('parses the 17:00 Tokyo fix and drops empty days', () => {
        const parsed = parseBojSeries(fxJson, fxCfg);
        expect(parsed.points).toEqual([
            { date: '2026-10-22', value: 157.23 },
            { date: '2026-10-23', value: 156.96 },
        ]);
    });

    it('rejects a series whose name is not the 17:00 fix', () => {
        const wrong = structuredClone(fxJson);
        wrong.RESULTSET[0].NAME_OF_TIME_SERIES = 'US.Dollar/Yen Central Rate, Tokyo Market';
        expect(() => parseBojSeries(wrong, fxCfg)).toThrow(/17:00/);
    });

    it('expects the Tokyo print only after 18:00 JST, skipping the weekend', () => {
        // 27.10.2026 09:00 JST = 00:00 UTC, przed fixem — oczekiwany jest poniedziałek 26.10.
        expect(expectedUsdJpyDate(new Date('2026-10-27T00:00:00Z'))).toBe('2026-10-26');
        // 27.10.2026 21:00 JST = 12:00 UTC — wtorek jest już po 17:00.
        expect(expectedUsdJpyDate(new Date('2026-10-27T12:00:00Z'))).toBe('2026-10-27');
        // Sobota 18:00 JST cofa do piątku.
        expect(expectedUsdJpyDate(new Date('2026-10-24T09:00:00Z'))).toBe('2026-10-23');
    });

    it('states the yen, the policy rate and the call rate', () => {
        const payload = {
            series: {
                usdjpy: [{ date: '2026-10-22', value: 157.23 }, { date: '2026-10-23', value: 156.96 }],
                policy: [{ date: '2026-10-25', value: 1.5 }],
                call: [{ date: '2026-10-23', value: 1.227 }],
            },
            names: { usdjpy: '', policy: '', call: '' },
            source: '',
            fetchedAt: '',
        } satisfies BojPayload;
        expect(marketsSentence(payload)).toContain('156,96 jena');
        expect(marketsSentence(payload)).toContain('1,50%');
        expect(marketsSentence(payload)).toContain('1,227%');
    });

    it('does not light the inflation tab on the markets page', () => {
        const items = [
            { label: 'Inflacja', href: '/japonia', icon: () => null },
            { label: 'Rynki', href: '/japonia/rynki', icon: () => null },
        ] as unknown as NavItem[];
        expect(activeNavHref('/japonia/rynki', items)).toBe('/japonia/rynki');
        expect(activeNavHref('/japonia', items)).toBe('/japonia');
    });

    it('is a daily freshness check on the FX date', () => {
        const spec = datasetById('jp-usdjpy');
        expect(spec?.endpoint(new Date())).toBe('/api/jp/markets');
        expect(spec?.selfHeal).toBe(true);
        expect(extractJpUsdJpy({ series: { usdjpy: [{ date: '2026-10-23', value: 1 }] } })).toBe('2026-10-23');
    });
});
