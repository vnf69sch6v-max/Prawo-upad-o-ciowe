import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { parseDashboardData } from '@/lib/jp/stat-dashboard';
import {
    JP_INDUSTRY_SERIES, expectedJpIndustry, industryMom, industrySentence, industryYoy, nextIipRelease,
    type JpIndustryPayload,
} from '@/lib/jp/industry';
import { activeNavHref, type NavItem } from '@/components/shell/TopNav';
import { datasetById, extractJpIndustry } from '@/lib/freshness';

const fixture = (name: string) => JSON.parse(readFileSync(`tests/fixtures/jp/${name}.json`, 'utf8'));
const cfg = (id: 'sa' | 'nsa') => JP_INDUSTRY_SERIES.find((s) => s.id === id)!.query;

describe('industrial production', () => {
    it('reads the revised seasonal index, 101.9 in August 2026', () => {
        const s = parseDashboardData(fixture('dashboard-iip-sa'), cfg('sa'));
        expect(s.name).toContain('2020年基準');
        expect(s.points.at(-1)).toEqual({ date: '2026-08', value: 101.9 });
        expect(s.points.find((p) => p.date === '2026-07')?.value).toBe(104.4);
        expect(industryMom(s.points)).toBe(-2.4);
    });

    it('reads the unadjusted index and its year-on-year rate', () => {
        const s = parseDashboardData(fixture('dashboard-iip-nsa'), cfg('nsa'));
        expect(s.points.at(-1)).toEqual({ date: '2026-08', value: 90.8 });
        expect(industryYoy(s.points)).toBe(2.7);
    });

    it('rejects a seasonal series asked for as unadjusted', () => {
        expect(() => parseDashboardData(fixture('dashboard-iip-sa'), cfg('nsa'))).toThrow(/季調値|znacznik sezonowy/);
    });

    it('switches at 13:30 JST on the final-release day, not at the flash', () => {
        expect(expectedJpIndustry(new Date('2026-10-15T04:29:00Z'))).toBe('2026-07');
        expect(expectedJpIndustry(new Date('2026-10-15T04:30:00Z'))).toBe('2026-08');
        expect(expectedJpIndustry(new Date('2026-09-30T00:00:00Z'))).toBe('2026-07');
        expect(expectedJpIndustry(new Date('2026-11-16T04:29:00Z'))).toBe('2026-08');
        expect(expectedJpIndustry(new Date('2026-11-16T04:30:00Z'))).toBe('2026-09');
        expect(nextIipRelease(new Date('2026-10-27T20:00:00Z'))).toEqual({ period: '2026-09', date: '2026-11-16' });
    });

    it('states the month-on-month drop and the year-on-year rise', () => {
        const sa = parseDashboardData(fixture('dashboard-iip-sa'), cfg('sa')).points;
        const nsa = parseDashboardData(fixture('dashboard-iip-nsa'), cfg('nsa')).points;
        const payload = {
            series: { sa, nsa },
            names: { sa: '', nsa: '' },
            source: '',
            fetchedAt: '',
        } satisfies JpIndustryPayload;
        expect(industrySentence(payload)).toBe('Dane za sierpień 2026: produkcja przemysłowa, wyrównana sezonowo, spadła o 2,4% wobec poprzedniego miesiąca. Indeks wynosi 101,9 (baza 2020). Bez korekty sezonowej rok do roku: +2,7%.');
    });

    it('does not light the overview tab on the economy page', () => {
        const items = [
            { label: 'Przegląd', href: '/japonia', icon: () => null },
            { label: 'Gospodarka', href: '/japonia/gospodarka', icon: () => null },
        ] as unknown as NavItem[];
        expect(activeNavHref('/japonia/gospodarka', items)).toBe('/japonia/gospodarka');
        expect(activeNavHref('/japonia', items)).toBe('/japonia');
    });

    it('is a monthly freshness check on the seasonal index', () => {
        const spec = datasetById('jp-industry');
        expect(spec?.endpoint(new Date())).toBe('/api/jp/industry');
        expect(spec?.selfHeal).toBe(true);
        expect(extractJpIndustry({ series: { sa: [{ date: '2026-08', value: 101.9 }] } })).toBe('2026-08');
    });
});
