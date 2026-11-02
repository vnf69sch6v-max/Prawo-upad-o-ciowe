import { describe, expect, it } from 'vitest';
import { relationsLabel } from '@/components/ui/NewsRow';

describe('relationsLabel', () => {
    it('odmienia „relacje” po polsku', () => {
        expect(relationsLabel(1)).toBeNull();
        expect(relationsLabel(2)).toBe('2 niezależne relacje');
        expect(relationsLabel(4)).toBe('4 niezależne relacje');
        expect(relationsLabel(5)).toBe('5 niezależnych relacji');
        expect(relationsLabel(12)).toBe('12 niezależnych relacji');
        expect(relationsLabel(22)).toBe('22 niezależne relacje');
    });
});
