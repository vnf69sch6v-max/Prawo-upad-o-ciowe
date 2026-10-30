import { describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));
import { fmtDelta } from '@/lib/news/daily-macro';
import { buildTemplateSummary } from '@/lib/news/summary';
import type { DailyDigest } from '@/lib/news/daily';

// Spec docs/specs/2026-10-30-podsumowanie-i-brief-wyglad.md, kryterium 4.
describe('liczby digestu po polsku', () => {
    it('delta: przecinek dziesiętny i minus U+2212', () => {
        expect(fmtDelta(3.9251, 3.9473, 'pct')).toBe('−0,56%');
        expect(fmtDelta(4.3955, 4.3951, 'pct')).toBe('+0,01%');
        expect(fmtDelta(6.23, 5.83, 'pp')).toBe('+0,4 pp');
        expect(fmtDelta(2.8, 2.8, 'pp')).toBe('0,0 pp');
    });

    it('szablon akapitu nie dubluje liczb z kafelków', () => {
        const digest = {
            date: '2026-10-30',
            punkty: [{ title: 'Rezygnacja prezesa JSW', corroboration: 3 }],
            dane: [{ id: 'eurpln', label: 'EUR / PLN', value: '4,3955', delta: '+0,01%', readingDate: '2026-10-30' }],
        } as unknown as DailyDigest;
        const text = buildTemplateSummary(digest)!;
        expect(text).toContain('Rezygnacja prezesa JSW');
        expect(text).not.toContain('W liczbach:');
    });
});
