import { describe, expect, it } from 'vitest';
import { buildJgbPayload, jgbSentence, parseJapaneseEraDate } from '@/lib/jp/jgb';
import { datasetById, extractJpJgb } from '@/lib/freshness';

const history = `Interest Rate,,,,,,,,,,,,,,,(Unit : %)
Date,1Y,2Y,3Y,4Y,5Y,6Y,7Y,8Y,9Y,10Y,15Y,20Y,25Y,30Y,40Y
2026/9/29,1.692,1.976,2.116,2.302,2.425,2.545,2.662,2.818,2.946,3.082,3.603,3.887,4.144,4.126,4.127
2026/9/30,1.684,1.952,2.086,2.273,2.399,2.525,2.639,2.796,2.926,3.057,3.583,3.877,4.131,4.098,4.099
`;

const month = `国債金利情報
基準日,1年,2年,3年,4年,5年,6年,7年,8年,9年,10年,15年,20年,25年,30年,40年
R8.10.26,1.649,1.888,1.988,2.131,2.241,2.323,2.425,2.574,2.699,2.824,3.361,3.63,3.928,3.884,3.9
※キャッシュ
`;

describe('JGB yields', () => {
    it('reads a Reiwa date', () => {
        expect(parseJapaneseEraDate('R8.10.26')).toBe('2026-10-26');
        expect(parseJapaneseEraDate('H31.4.30')).toBe('2019-04-30');
    });

    it('lets the current month override history and keeps the 10-year yield', () => {
        const payload = buildJgbPayload(history, month, new Date('2026-10-27T12:00:00Z'));
        expect(payload.latest.date).toBe('2026-10-26');
        expect(payload.latest.yields['10']).toBe(2.824);
        expect(payload.latest.yields['2']).toBe(1.888);
        expect(payload.latest.yields['30']).toBe(3.884);
        expect(payload.history.map((p) => p.date)).toEqual(['2026-09-29', '2026-09-30', '2026-10-26']);
        expect(jgbSentence(payload)).toContain('2,824%');
    });

    it('is on the freshness check', () => {
        expect(datasetById('jp-jgb')?.endpoint(new Date())).toBe('/api/jp/jgb');
        expect(extractJpJgb({ latest: { date: '2026-10-26' } })).toBe('2026-10-26');
    });
});
