import { describe, expect, it } from 'vitest';
import { jpSignalHeadline, jpSignalText, rankJpHero } from '@/lib/jp/overview';
import type { Point } from '@/lib/hero-signals';

const monthly = (start: string, values: number[]): Point[] => {
    const [y0, m0] = start.split('-').map(Number);
    return values.map((value, i) => {
        const m = m0 - 1 + i;
        const y = y0 + Math.floor(m / 12);
        return { date: `${y}-${String((m % 12) + 1).padStart(2, '0')}`, value };
    });
};

const calm = [2.4, 2.3, 2.4, 2.2, 2.3, 2.2, 2.1, 2.2, 2.1, 2.0, 2.0];

describe('Japan overview hero', () => {
    const cpi = monthly('2025-11', [...calm, 2.1]);
    const unemployment = monthly('2025-10', [2.6, 2.6, 2.5, 2.5, 2.5, 2.5, 2.4, 2.5, 2.6, 2.5, 2.5]);
    const usdjpy = Array.from({ length: 20 }, (_, i) => ({ date: `2026-10-${String(i + 1).padStart(2, '0')}`, value: 150 + (i % 2 ? 0.2 : -0.2) }));
    const jgb = Array.from({ length: 20 }, (_, i) => ({ date: `2026-10-${String(i + 1).padStart(2, '0')}`, value: 2.1 }));

    it('dates unemployment from the Labour Force Survey calendar and drops an ordinary yen move', () => {
        const ranked = rankJpHero({ cpi: monthly('2025-10', [...calm, 2.1]), unemployment, usdjpy, jgb }, '2026-10-27');
        const jobs = ranked.find((r) => r.candidate.id === 'jp-unemployment')!;
        expect(jobs.period).toBe('2026-08');
        expect(jobs.publishedOn).toBe('2026-10-02');
        expect(jobs.fresh).toBe(false);
        expect(ranked.map((r) => r.candidate.id)).not.toContain('jp-usdjpy');
        expect(ranked.map((r) => r.candidate.id)).not.toContain('jp-jgb');
    });

    it('puts a fresh CPI print above an older unemployment reading', () => {
        const ranked = rankJpHero({
            cpi: monthly('2025-10', [...calm, 2.1]),
            unemployment, usdjpy, jgb,
        }, '2026-10-27');
        const price = ranked.find((r) => r.candidate.id === 'jp-cpi')!;
        expect(price.period).toBe('2026-09');
        expect(price.publishedOn).toBe('2026-10-23');
        expect(price.ageDays).toBe(4);
        expect(price.fresh).toBe(true);
        expect(ranked[0].candidate.id).toBe('jp-cpi');
        expect(ranked[1].candidate.id).toBe('jp-unemployment');
        expect(jpSignalHeadline(price)).toContain('cel BOJ');
        expect(jpSignalText(price)).toContain('2%');
        expect(price.next?.date).toBe('2026-11-20');
    });

    it('lets a two-sigma yen move into the hero', () => {
        const shock = usdjpy.map((p, i) => i === usdjpy.length - 1 ? { ...p, date: '2026-10-26', value: 160 } : p);
        const ranked = rankJpHero({ cpi, unemployment, usdjpy: shock, jgb }, '2026-10-27');
        const fx = ranked.find((r) => r.candidate.id === 'jp-usdjpy');
        expect(fx?.publishedOn).toBe('2026-10-26');
        expect(jpSignalHeadline(fx!)).toBe('Jen słabnie wobec dolara');
    });
});
