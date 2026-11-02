// Szybki szacunek CPI GUS — spec docs/specs/2026-11-02-cpi-szybki-szacunek.md (kryteria 1–7, 9–11).
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it, vi } from 'vitest';
import {
    expectedCpiFlashPeriod, cpiFlashBehind, findXlsxHref, flashRevision, mergeCpiHeadline, parseCpiFlashGrid,
    parseCpiFlashHtml, pickLatestFlashLink, type CpiFlash,
} from '@/lib/cpi-flash';
import { workbookToGrid } from '@/lib/jp/contributions-xlsx';
import { generateMacroCalendar } from '@/lib/calendar';
import { evaluateSignal, nextPublication, type HeroCandidate } from '@/lib/hero-signals';
import { validateGusPath } from '@/lib/gus-params';

const fx = (f: string) => path.join(process.cwd(), 'tests/fixtures', f);
const html = (f: string) => readFileSync(fx(f), 'utf8');
const URL_OCT = 'https://stat.gov.pl/x,21,46.html';
const NOV_2 = new Date('2026-11-02T12:00:00Z');

describe('parser komunikatu (HTML)', () => {
    it('październik 2026 → 3,5 r/r i −0,4 m/m (kryterium 1)', () => {
        const r = parseCpiFlashHtml(html('gus-cpi-flash-2026-10.html'), { url: URL_OCT, now: NOV_2 });
        expect(r).toMatchObject({ period: '2026-10', yoy: 3.5, mom: -0.4, indexYoy: 103.5, indexMom: 99.6, publishedOn: '2026-10-30', fullReleaseOn: '2026-11-13' });
    });

    it('wrzesień 2026 i grudzień 2025 („niezmienionym”, &nbsp;, „ana-logicznym”) (kryterium 2)', () => {
        expect(parseCpiFlashHtml(html('gus-cpi-flash-2026-09.html'), { url: 'u', now: new Date('2026-10-01T10:00:00Z') }))
            .toMatchObject({ period: '2026-09', yoy: 4.0, mom: 0.7, publishedOn: '2026-09-30' });
        expect(parseCpiFlashHtml(html('gus-cpi-flash-2025-12.html'), { url: 'u', now: new Date('2026-01-05T10:00:00Z') }))
            .toMatchObject({ period: '2025-12', yoy: 2.4, mom: 0, publishedOn: '2025-12-31' });
    });

    it('grudniowy flash przyjęty w lutym i marcu (za I i II GUS go nie publikuje)', () => {
        const dec = html('gus-cpi-flash-2025-12.html');
        expect(parseCpiFlashHtml(dec, { url: 'u', now: new Date('2026-02-15T12:00:00Z') }).period).toBe('2025-12');
        expect(parseCpiFlashHtml(dec, { url: 'u', now: new Date('2026-03-15T12:00:00Z') }).period).toBe('2025-12');
        // 31.03 po 10:00 jest już flash za marzec → grudzień to stary komunikat.
        expect(() => parseCpiFlashHtml(dec, { url: 'u', now: new Date('2026-04-02T12:00:00Z') })).toThrow(/spoza/);
    });

    it('rzuca zamiast zgadywać (kryterium 4)', () => {
        const oct = html('gus-cpi-flash-2026-10.html');
        const p = (h: string, now = NOV_2) => () => parseCpiFlashHtml(h, { url: 'u', now });
        expect(p(oct.replaceAll('Szybki szacunek wskaźnika cen towarów i usług konsumpcyjnych w październiku', 'Wskaźniki cen produkcji sprzedanej przemysłu w październiku'))).toThrow(/obcy tytuł/);
        expect(p(oct.replace('szybkiego szacunku w październiku 2026', 'szybkiego szacunku we wrześniu 2026'))).toThrow(/miesiąc/);
        expect(p(oct.replace('wskaźnik cen 103,5', 'wskaźnik cen 135,5').replace('o 3,5%', 'o 35,5%'))).toThrow(/r\/r poza/);
        expect(p(oct.replace('wskaźnik cen 99,6', 'wskaźnik cen 90,6').replace('o 0,4%', 'o 9,4%'))).toThrow(/m\/m poza/);
        expect(p(oct.replace(' (wskaźnik cen 99,6)', ''))).toThrow(/2 wskaźników/);
        expect(p(oct.replace('o 3,5% (wskaźnik', 'o 3,7% (wskaźnik'))).toThrow(/≠ wskaźnik/);
        // Okres sprzed dwóch miesięcy to nie „najnowszy szybki szacunek”.
        expect(p(oct, new Date('2027-01-05T10:00:00Z'))).toThrow(/spoza/);
    });

    it('tablica XLSX: podgrupy z „Tablice w formacie XLSX”, nie „Dane do wykresów” (kryterium 3)', async () => {
        const oct = html('gus-cpi-flash-2026-10.html');
        expect(findXlsxHref(oct)).toMatch(/w_pazdzierniku_2026\.xlsx$/);
        const flash = parseCpiFlashHtml(oct, { url: 'u', now: NOV_2 });
        const groups = parseCpiFlashGrid(await workbookToGrid(readFileSync(fx('gus-cpi-flash-2026-10.xlsx'))), flash);
        expect(groups).toEqual([
            { name: 'Żywność i napoje bezalkoholowe', yoy: -0.1, mom: 0.3 },
            { name: 'Energia elektryczna, gaz i inne paliwa', yoy: 6, mom: 1.6 },
            { name: 'Paliwa do prywatnych środków transportu', yoy: 21.7, mom: -9.7 },
        ]);
        const sep = parseCpiFlashHtml(html('gus-cpi-flash-2026-09.html'), { url: 'u', now: new Date('2026-10-01T10:00:00Z') });
        const sepGroups = parseCpiFlashGrid(await workbookToGrid(readFileSync(fx('gus-cpi-flash-2026-09.xlsx'))), sep);
        expect(sepGroups.map((g) => [g.yoy, g.mom])).toEqual([[-0.5, 0.1], [4.9, 0.9], [36.1, 9.2]]);
        // Tablica innego miesiąca → bez podgrup (headline zostaje).
        expect(parseCpiFlashGrid(await workbookToGrid(readFileSync(fx('gus-cpi-flash-2026-09.xlsx'))), flash)).toEqual([]);
    });

    it('strona działu: najnowszy szybki szacunek, nie czerwiec 2022 (kryterium 5)', () => {
        const link = pickLatestFlashLink(html('gus-wskazniki-cen-2026-11-02.html'));
        expect(link?.period).toBe('2026-10');
        expect(link?.url).toMatch(/w-pazdzierniku-2026-r-,21,46\.html$/);
    });
});

const FLASH: CpiFlash = {
    period: '2026-10', yoy: 3.5, mom: -0.4, indexYoy: 103.5, indexMom: 99.6, publishedOn: '2026-10-30',
    fullReleaseOn: '2026-11-13', url: URL_OCT, groups: [], source: 'GUS, szybki szacunek',
};
const DBW_SEP = [{ date: '2025-Q4', yoy: 3.0, mom: null }, { date: '2026-08', yoy: 3.9, mom: 0.1 }, { date: '2026-09', yoy: 4.1, mom: 0.8 }];

describe('scalanie z DBW (kryterium 6)', () => {
    it('DBW do września + flash października → ostatni punkt wstępny 3,5', () => {
        const m = mergeCpiHeadline(DBW_SEP, FLASH);
        expect(m[m.length - 1]).toEqual({ date: '2026-10', yoy: 3.5, mom: -0.4, provisional: true });
        expect(m).toHaveLength(4);
    });
    it('DBW z październikiem → DBW bez punktu wstępnego; rewizja widoczna 7 dni', () => {
        const full = [...DBW_SEP, { date: '2026-10', yoy: 3.6, mom: -0.3 }];
        expect(mergeCpiHeadline(full, FLASH)).toBe(full);
        expect(flashRevision(full, FLASH, '2026-11-13')).toBe(3.5);
        expect(flashRevision(full, FLASH, '2026-11-21')).toBeNull();
        expect(flashRevision([...DBW_SEP, { date: '2026-10', yoy: 3.5, mom: -0.4 }], FLASH, '2026-11-13')).toBeNull();
    });
});

describe('kalendarz (kryterium 7)', () => {
    it('brak flasha za styczeń i luty; październik 30.10, listopad 30.11', () => {
        const flashes = generateMacroCalendar(2026).filter((e) => e.flash);
        expect(flashes.map((e) => e.dataPeriod)).not.toContain('2026-01');
        expect(flashes.map((e) => e.dataPeriod)).not.toContain('2026-02');
        expect(flashes.find((e) => e.dataPeriod === '2026-10')?.date).toBe('2026-10-30');
        expect(flashes.find((e) => e.dataPeriod === '2026-11')?.date).toBe('2026-11-30');
    });
    it('oczekiwany flash od 10:00 Warszawy w dniu publikacji', () => {
        expect(expectedCpiFlashPeriod(new Date('2026-10-30T09:00:00Z'))).toBe('2026-10'); // 10:00 CET
        expect(expectedCpiFlashPeriod(new Date('2026-10-30T08:59:00Z'))).toBe('2026-09');
        expect(expectedCpiFlashPeriod(NOV_2)).toBe('2026-10');
        expect(expectedCpiFlashPeriod(new Date('2026-02-15T12:00:00Z'))).toBe('2025-12');
        expect(cpiFlashBehind('2026-09', new Date('2026-10-30T09:30:00Z'))).toBe(true);
        expect(cpiFlashBehind('2026-10', new Date('2026-10-30T09:30:00Z'))).toBe(false);
        expect(cpiFlashBehind('2026-09', NOV_2)).toBe(false);
    });
});

describe('hero Przeglądu (kryterium 9)', () => {
    const series = (pts: { date: string; yoy: number | null }[]) => pts.filter((p) => p.yoy != null).map((p) => ({ date: p.date, value: p.yoy as number }));
    const cand = (pts: { date: string; yoy: number | null }[], provisional?: HeroCandidate['provisional']): HeroCandidate => ({
        id: 'cpi', kind: 'cpi', label: 'CPI', series: series(pts), unit: '%', decimals: 1, deltaMode: 'pp', href: '/ceny', provisional,
    });
    it('punkt wstępny datowany od flasha → „Nowy odczyt” 30.10', () => {
        const r = evaluateSignal(cand(mergeCpiHeadline(DBW_SEP, FLASH), { period: '2026-10', publishedOn: '2026-10-30', fullReleaseOn: '2026-11-13' }), '2026-10-30');
        expect(r?.publishedOn).toBe('2026-10-30');
        expect(r?.fresh).toBe(true);
        expect(r?.delta).toBe(-0.6);
        expect(r?.next?.date).toBe('2026-11-13');
    });
    it('ten sam okres z DBW → pełny odczyt 13.11; po nim kolejna zmiana to flash 30.11', () => {
        const r = evaluateSignal(cand([...DBW_SEP, { date: '2026-10', yoy: 3.5 }]), '2026-11-13');
        expect(r?.publishedOn).toBe('2026-11-13');
        expect(nextPublication('cpi', '2026-11-13')?.date).toBe('2026-11-30');
    });
});

describe('trasa (kryterium 11)', () => {
    it('tylko refresh=1; reszta 400', () => {
        expect(validateGusPath('/api/gus-cpi-flash')?.ok).toBe(true);
        expect(validateGusPath('/api/gus-cpi-flash?refresh=1')?.ok).toBe(true);
        expect(validateGusPath('/api/gus-cpi-flash?x=1')?.ok).toBe(false);
        expect(validateGusPath('/api/gus-cpi-flash?refresh=2')?.ok).toBe(false);
    });
});

describe('digest (kryterium 10)', () => {
    it('30.10 → „3,5%”, −0,6 pp, źródło „GUS, szybki szacunek”; 13.11 → DBW', async () => {
        const store: Record<string, unknown> = {
            'dbw/gus_cpi_full_2026_v5': { headline: DBW_SEP, dataDate: '2026-09' },
            'macro_data/gus_cpi_flash_v1': FLASH,
        };
        vi.resetModules();
        vi.doMock('@/lib/server-cache', () => ({
            readServerCacheEntry: async (c: string, d: string) => (store[`${c}/${d}`] ? { payload: store[`${c}/${d}`], updatedAt: Date.now() } : null),
        }));
        const { fetchMacroChangesWithDiagnostics } = await import('@/lib/news/daily-macro');
        const oct = (await fetchMacroChangesWithDiagnostics('2026-10-30')).changes.find((c) => c.id === 'cpi-yoy');
        expect(oct).toMatchObject({ value: '3,5%', source: 'GUS, szybki szacunek' });
        expect(oct?.delta).toMatch(/0,6 pp/);
        store['dbw/gus_cpi_full_2026_v5'] = { headline: [...DBW_SEP, { date: '2026-10', yoy: 3.6, mom: -0.3 }], dataDate: '2026-10' };
        const nov = (await fetchMacroChangesWithDiagnostics('2026-11-13')).changes.find((c) => c.id === 'cpi-yoy');
        expect(nov).toMatchObject({ value: '3,6%', source: 'GUS' });
        vi.doUnmock('@/lib/server-cache');
    });
});
