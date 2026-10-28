import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
    JP_TANKAN_SERIES, expectedJpTankan, nextTankanRelease, parseTankanSeries, tankanDelta, tankanSentence,
    type JpTankanPayload,
} from '@/lib/jp/tankan';
import { datasetById, extractJpTankan } from '@/lib/freshness';

const fixture = (name: string) => JSON.parse(readFileSync(`tests/fixtures/jp/${name}.json`, 'utf8'));
const cfg = (id: 'mfg' | 'non') => JP_TANKAN_SERIES.find((s) => s.id === id)!;

describe('Japan Tankan', () => {
    it('reads large manufacturers at 24 in the September survey, up 2 from June', () => {
        const s = parseTankanSeries(fixture('boj-tankan-mfg'), cfg('mfg'));
        expect(s.name).toContain('Manufacturing');
        expect(s.points.at(-1)).toEqual({ date: '2026-Q3', value: 24 });
        expect(s.points.at(-2)).toEqual({ date: '2026-Q2', value: 22 });
        expect(tankanDelta(s.points)).toBe(2);
        expect(s.points.some((p) => p.date === '2026-Q4')).toBe(false);
    });

    it('reads large nonmanufacturers at 35, down 2, and rejects the manufacturing series', () => {
        const s = parseTankanSeries(fixture('boj-tankan-non'), cfg('non'));
        expect(s.name).toContain('Nonmanufacturing');
        expect(s.points.at(-1)).toEqual({ date: '2026-Q3', value: 35 });
        expect(s.points.at(-2)?.value).toBe(37);
        expect(tankanDelta(s.points)).toBe(-2);
        const swapped = fixture('boj-tankan-mfg');
        swapped.RESULTSET[0].NAME_OF_TIME_SERIES = 'D.I./Business Conditions/Large Enterprises/Manufacturing/Nonmanufacturing/Actual result';
        expect(() => parseTankanSeries(swapped, cfg('mfg'))).toThrow(/Nonmanufacturing/);
    });

    it('switches at 8:50 JST on the release morning', () => {
        expect(expectedJpTankan(new Date('2026-06-30T23:49:00Z'))).toBe('2026-Q1');
        expect(expectedJpTankan(new Date('2026-06-30T23:50:00Z'))).toBe('2026-Q2');
        expect(expectedJpTankan(new Date('2026-09-30T23:49:00Z'))).toBe('2026-Q2');
        expect(expectedJpTankan(new Date('2026-09-30T23:50:00Z'))).toBe('2026-Q3');
        expect(expectedJpTankan(new Date('2026-10-27T20:00:00Z'))).toBe('2026-Q3');
        expect(nextTankanRelease(new Date('2026-10-27T20:00:00Z'))).toEqual({ period: '2026-Q4', date: '2026-12-14' });
    });

    it('states both moves from the September survey', () => {
        const mfg = parseTankanSeries(fixture('boj-tankan-mfg'), cfg('mfg')).points;
        const non = parseTankanSeries(fixture('boj-tankan-non'), cfg('non')).points;
        const payload = {
            series: { mfg, non },
            names: { mfg: '', non: '' },
            source: '', fetchedAt: '',
        } satisfies JpTankanPayload;
        expect(tankanSentence(payload)).toBe('Badanie z września 2026: nastroje dużych firm przemysłowych wynoszą 24, o 2 punkty wyżej niż w poprzednim badaniu. Duże firmy spoza przemysłu: 35, o 2 punkty niżej niż w poprzednim badaniu.');
    });

    it('is a quarterly freshness check on the manufacturing survey', () => {
        const spec = datasetById('jp-tankan');
        expect(spec?.endpoint(new Date())).toBe('/api/jp/tankan');
        expect(spec?.frequency).toBe('quarterly');
        expect(spec?.selfHeal).toBe(true);
        expect(extractJpTankan({ series: { mfg: [{ date: '2026-Q3', value: 24 }] } })).toBe('2026-Q3');
    });
});
