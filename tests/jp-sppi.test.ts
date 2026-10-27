import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { JP_SPPI_SERIES, expectedJpSppi, nextSppiRelease, parseSppiSeries, sppiMom, sppiSentence, type JpSppiPayload } from '@/lib/jp/sppi';
import { datasetById, extractJpSppi } from '@/lib/freshness';

const fixture = (name: string) => JSON.parse(readFileSync(`tests/fixtures/jp/${name}.json`, 'utf8'));
const cfg = (id: 'yoy' | 'index' | 'exYoy') => JP_SPPI_SERIES.find((s) => s.id === id)!;

describe('Japan services producer prices', () => {
    it('reads the September preliminary year-on-year rate', () => {
        const s = parseSppiSeries(fixture('boj-sppi-yoy'), cfg('yoy'));
        expect(s.name).toContain('Year-on-year');
        expect(s.points.at(-1)).toEqual({ date: '2026-09', value: 3.7 });
        expect(s.points.at(-2)).toEqual({ date: '2026-08', value: 3.5 });
    });

    it('reads the index, the month-on-month move, and rejects the rate series', () => {
        const s = parseSppiSeries(fixture('boj-sppi-index'), cfg('index'));
        expect(s.name).toBe('[Basic grouping index] All items');
        expect(s.points.at(-1)).toEqual({ date: '2026-09', value: 115.5 });
        expect(s.points.at(-2)?.value).toBe(115.2);
        expect(sppiMom(s.points)).toBe(0.3);
        const json = fixture('boj-sppi-index');
        json.RESULTSET[0].NAME_OF_TIME_SERIES = '[Basic grouping index] All items (excluding International transportation)';
        expect(() => parseSppiSeries(json, cfg('index'))).toThrow(/excluding/);
    });

    it('reads the rate excluding international transportation', () => {
        const s = parseSppiSeries(fixture('boj-sppi-ex-yoy'), cfg('exYoy'));
        expect(s.name).toContain('excluding International transportation');
        expect(s.points.at(-1)).toEqual({ date: '2026-09', value: 2.9 });
        expect(s.points.at(-2)).toEqual({ date: '2026-08', value: 2.9 });
        const stripped = fixture('boj-sppi-ex-yoy');
        stripped.RESULTSET[0].NAME_OF_TIME_SERIES = '[Basic grouping index] All items/ Year-on-year change';
        expect(() => parseSppiSeries(stripped, cfg('exYoy'))).toThrow(/excluding International transportation/);
        const swapped = fixture('boj-sppi-yoy');
        swapped.RESULTSET[0].NAME_OF_TIME_SERIES = '[Basic grouping index] All items (excluding International transportation)/ Year-on-year change';
        expect(() => parseSppiSeries(swapped, cfg('yoy'))).toThrow(/excluding/);
    });

    it('switches at 8:50 JST on the release day', () => {
        expect(expectedJpSppi(new Date('2026-10-26T23:49:00Z'))).toBe('2026-08');
        expect(expectedJpSppi(new Date('2026-10-26T23:50:00Z'))).toBe('2026-09');
        expect(expectedJpSppi(new Date('2026-10-27T22:00:00Z'))).toBe('2026-09');
        expect(nextSppiRelease(new Date('2026-10-27T22:00:00Z'))).toBeNull();
    });

    it('states the annual rate, the index and that the newest month is preliminary', () => {
        const payload = {
            series: {
                yoy: [{ date: '2026-08', value: 3.5 }, { date: '2026-09', value: 3.7 }],
                index: [{ date: '2026-08', value: 115.2 }, { date: '2026-09', value: 115.5 }],
                exYoy: [{ date: '2026-08', value: 2.9 }, { date: '2026-09', value: 2.9 }],
            },
            names: { yoy: '', index: '', exYoy: '' },
            source: '',
            fetchedAt: '',
        } satisfies JpSppiPayload;
        expect(sppiSentence(payload)).toBe('Dane za wrzesień 2026: ceny usług dla firm wzrosły o 3,7% wobec roku wcześniej. Indeks wynosi 115,5 (baza 2020). Wobec poprzedniego miesiąca indeks wzrósł o 0,3%. Bez transportu międzynarodowego: +2,9%, tyle samo co miesiąc wcześniej. Odczyt jest wstępny.');
    });

    it('is a monthly freshness check on the year-on-year series', () => {
        const spec = datasetById('jp-sppi');
        expect(spec?.endpoint(new Date())).toBe('/api/jp/sppi');
        expect(extractJpSppi({ series: { yoy: [{ date: '2026-09', value: 3.7 }] } })).toBe('2026-09');
    });
});
