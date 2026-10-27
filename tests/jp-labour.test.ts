import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { dashboardUrl, parseDashboardData } from '@/lib/jp/stat-dashboard';
import {
    JP_LABOUR_SERIES, expectedJpUnemployment, labourChangePp, labourSentence, nextLfsRelease, type JpLabourPayload,
} from '@/lib/jp/labour';
import { activeNavHref, type NavItem } from '@/components/shell/TopNav';
import { datasetById, extractJpLabour } from '@/lib/freshness';

// Utrwalone odpowiedzi Statistics Dashboard z 27.10.2026 (TimeFrom=202601, MetaGetFlg=Y).
const fixture = (name: string) => JSON.parse(readFileSync(`tests/fixtures/jp/${name}.json`, 'utf8'));
const cfg = (id: 'sa' | 'nsa') => JP_LABOUR_SERIES.find((s) => s.id === id)!.query;

describe('Labour Force Survey', () => {
    it('reads the seasonally adjusted rate quoted in the release', () => {
        const s = parseDashboardData(fixture('dashboard-labour-sa'), cfg('sa'));
        expect(s.name).toBe('完全失業率（男女計）');
        expect(s.points.at(-1)).toEqual({ date: '2026-08', value: 2.5 });
        expect(s.points[0]).toEqual({ date: '2026-01', value: 2.7 });
    });

    it('reads the unadjusted rate beside it', () => {
        const s = parseDashboardData(fixture('dashboard-labour-nsa'), cfg('nsa'));
        expect(s.points.at(-1)).toEqual({ date: '2026-08', value: 2.6 });
    });

    it('rejects a swapped seasonal flag even though the series name is identical', () => {
        expect(() => parseDashboardData(fixture('dashboard-labour-sa'), cfg('nsa'))).toThrow(/季調値|znacznik sezonowy/);
        expect(() => parseDashboardData(fixture('dashboard-labour-nsa'), cfg('sa'))).toThrow(/原数値|znacznik sezonowy/);
    });

    it('asks the API for seasonal adjustment 2 on the headline series', () => {
        const url = new URL(dashboardUrl(cfg('sa')));
        expect(url.searchParams.get('IsSeasonalAdjustment')).toBe('2');
        expect(url.searchParams.get('IndicatorCode')).toBe('0301010000020020010');
        expect(new URL(dashboardUrl(cfg('nsa'))).searchParams.get('IsSeasonalAdjustment')).toBe('1');
    });

    it('switches the expected month at 8:30 JST on the Statistics Bureau date', () => {
        // Sierpień wychodzi 2.10 o 8:30 JST (23:30 UTC dzień wcześniej).
        expect(expectedJpUnemployment(new Date('2026-10-01T23:29:00Z'))).toBe('2026-07');
        expect(expectedJpUnemployment(new Date('2026-10-01T23:30:00Z'))).toBe('2026-08');
        // 28.10 rano w Tokio wrzesień jeszcze nie wyszedł (30.10, 8:30).
        expect(expectedJpUnemployment(new Date('2026-10-27T20:19:00Z'))).toBe('2026-08');
        expect(expectedJpUnemployment(new Date('2026-10-29T23:29:00Z'))).toBe('2026-08');
        expect(expectedJpUnemployment(new Date('2026-10-29T23:30:00Z'))).toBe('2026-09');
        expect(nextLfsRelease(new Date('2026-10-27T20:19:00Z'))).toEqual({ period: '2026-09', date: '2026-10-30' });
    });

    it('falls back to a day-of-month heuristic after the calendar ends', () => {
        // Ostatni wpis: luty 2027, 30.03. Po 35 dniach kalendarz milczy.
        expect(expectedJpUnemployment(new Date('2027-04-20T03:00:00Z'))).toBe('2027-02');
        expect(expectedJpUnemployment(new Date('2027-06-10T03:00:00Z'))).toBe('2027-04');
        expect(expectedJpUnemployment(new Date('2027-06-28T03:00:00Z'))).toBe('2027-05');
    });

    it('states the adjusted rate and the raw one for the same month', () => {
        const payload = {
            series: {
                sa: [{ date: '2026-07', value: 2.4 }, { date: '2026-08', value: 2.5 }],
                nsa: [{ date: '2026-08', value: 2.6 }],
            },
            names: { sa: '', nsa: '' },
            source: '',
            fetchedAt: '',
        } satisfies JpLabourPayload;
        expect(labourSentence(payload)).toBe('Dane za sierpień 2026: stopa bezrobocia wyrównana sezonowo wynosi 2,5%. Bez korekty sezonowej: 2,6%.');
        expect(labourChangePp(payload.series.sa)).toBe(0.1);
    });

    it('does not light the inflation tab on the labour page', () => {
        const items = [
            { label: 'Inflacja', href: '/japonia', icon: () => null },
            { label: 'Rynki', href: '/japonia/rynki', icon: () => null },
            { label: 'Praca', href: '/japonia/praca', icon: () => null },
        ] as unknown as NavItem[];
        expect(activeNavHref('/japonia/praca', items)).toBe('/japonia/praca');
        expect(activeNavHref('/japonia', items)).toBe('/japonia');
        expect(activeNavHref('/japonia/rynki', items)).toBe('/japonia/rynki');
    });

    it('is a monthly freshness check on the adjusted series', () => {
        const spec = datasetById('jp-labour');
        expect(spec?.endpoint(new Date())).toBe('/api/jp/labour');
        expect(spec?.selfHeal).toBe(true);
        expect(spec?.frequency).toBe('monthly');
        expect(extractJpLabour({ series: { sa: [{ date: '2026-07', value: 2.4 }, { date: '2026-08', value: 2.5 }] } })).toBe('2026-08');
    });
});
