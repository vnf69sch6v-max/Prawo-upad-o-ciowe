import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
    contributionSentence, findContributionFileId, formatContrib, parseContributionGrid,
} from '@/lib/jp/contributions';
import { workbookToGrid } from '@/lib/jp/contributions-xlsx';
import { datasetById, extractJpContributions } from '@/lib/freshness';

/** Układ jak w tabeli 5: nagłówki w różnych wierszach, obok kolumna Tokio z innymi liczbami. */
function grid(): string[][] {
    const rows: string[][] = [];
    const put = (r: number, c: number, v: string) => {
        rows[r] ??= [];
        rows[r][c] = v;
    };
    put(0, 0, '2025年基準消費者物価指数');
    put(1, 0, '第5表');
    put(3, 2, '全国');
    put(3, 3, '全国');
    put(3, 4, '全国');
    put(3, 5, '全国');
    put(3, 6, '東京都区部・確報');
    put(4, 4, '2026年9月');
    put(4, 6, '2026年9月');
    put(5, 0, '類・品目符号');
    put(5, 1, '類・品目');
    put(5, 2, 'ウエイト');
    put(5, 3, '前年同月比');
    put(5, 4, '総合指数の前年同月比に対する寄与度');
    put(5, 5, '総合指数の前月比に対する寄与度');
    put(5, 6, '総合指数の前年同月比に対する寄与度');
    const items: Array<[string, string, string, string, string]> = [
        ['総合', '10000', '2.1', '2.1', '9.9'],
        ['食料', '2754', '2.8', '0.77', '0'],
        ['住居', '2182', '1.1', '0.25', '0'],
        ['光熱・水道', '698', '0.8', '0.06', '0'],
        ['家具・家事用品', '372', '6.5', '0.24', '0'],
        ['被服及び履物', '299', '1.2', '0.04', '0'],
        ['保健医療', '466', '2.8', '0.13', '0'],
        ['交通・通信', '1444', '2.5', '0.36', '0'],
        ['教育', '311', '-3.8', '-0.12', '0'],
        ['教養娯楽', '906', '3.9', '0.36', '0'],
        ['諸雑費', '570', '1.2', '0.07', '0'],
        ['生鮮食品', '379', '2.1', '0.08', '0'],
        ['エネルギー', '749', '-0.6', '-0.04', '0'],
        ['米類', '101', '-20.6', '-0.21', '0'],
        ['財', '5036', '2.8', '1.39', '0'],
        ['サービス', '4964', '1.5', '0.76', '0'],
    ];
    items.forEach((item, i) => {
        const r = 6 + i;
        put(r, 1, item[0]);
        put(r, 2, item[1]);
        put(r, 3, item[2]);
        put(r, 4, item[3]);
        put(r, 6, item[4]);
    });
    return rows;
}

describe('CPI contributions from table 5', () => {
    const parsed = parseContributionGrid(grid());

    it('reads the national year-on-year column, not Tokyo and not month-on-month', () => {
        expect(parsed.period).toBe('2026-09');
        expect(parsed.headline).toMatchObject({ yoy: 2.1, contribution: 2.1 });
        expect(parsed.groups.map((g) => [g.id, g.contribution])).toEqual([
            ['food', 0.77], ['housing', 0.25], ['utilities', 0.06], ['furnishings', 0.24],
            ['clothing', 0.04], ['health', 0.13], ['transport', 0.36], ['education', -0.12],
            ['recreation', 0.36], ['misc', 0.07],
        ]);
        expect(parsed.fresh.contribution).toBe(0.08);
        expect(parsed.energy.contribution).toBe(-0.04);
        expect(parsed.rice).toMatchObject({ yoy: -20.6, contribution: -0.21 });
        expect(parsed.goods.contribution).toBe(1.39);
        expect(parsed.services.contribution).toBe(0.76);
    });

    it('says what adds and what subtracts, including the rice exception inside food', () => {
        expect(contributionSentence(parsed)).toBe(
            'Najwięcej dokłada żywność (+0,77 p.p.), potem transport i łączność oraz kultura i rozrywka (po +0,36 p.p.). '
            + 'Obniża ją edukacja (−0,12 p.p.). '
            + 'Sam ryż obniża inflację o 0,21 p.p. (ceny ryżu −20,6% r/r), choć żywność jako całość ją podnosi. '
            + 'Towary dokładają +1,39 p.p., usługi +0,76 p.p.',
        );
        expect(formatContrib(-0.04)).toBe('−0,04 p.p.');
    });

    it('finds the table 5 file id on the latest-month list page', () => {
        const html = '<div>品目別価格指数・寄与度（全国・東京都区部）</div><a href="/stat-search/file-download?statInfId=000040513578&fileKind=0">';
        expect(findContributionFileId(html)).toBe('000040513578');
        expect(findContributionFileId('<div>表番号 4</div>')).toBeNull();
    });

    it('is a freshness dataset on the same CPI calendar', () => {
        const spec = datasetById('jp-cpi-contributions');
        expect(spec?.endpoint(new Date())).toBe('/api/jp/cpi-contributions');
        expect(spec?.selfHeal).toBe(true);
        expect(extractJpContributions({ period: '2026-09' })).toBe('2026-09');
        expect(extractJpContributions({ period: 'wrzesień' })).toBeNull();
    });
});

const live = process.env.JP_XLSX;
describe.skipIf(!live)('September 2026 workbook', () => {
    it('matches the published contributions', async () => {
        const grid = await workbookToGrid(readFileSync(live!));
        const parsed = parseContributionGrid(grid);
        expect(parsed.period).toBe('2026-09');
        expect(parsed.headline.contribution).toBe(2.1);
        expect(parsed.groups.find((g) => g.id === 'food')?.contribution).toBe(0.77);
        expect(parsed.energy.contribution).toBe(-0.04);
        expect(parsed.rice.contribution).toBe(-0.21);
        expect(existsSync(live!)).toBe(true);
    });
});
