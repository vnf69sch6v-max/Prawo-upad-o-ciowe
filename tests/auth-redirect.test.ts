import { describe, expect, it } from 'vitest';
import { safeRedirectTarget } from '@/lib/auth/redirect';

const O = 'https://savori.space';

describe('safeRedirectTarget — powrót po logowaniu tylko na własną domenę', () => {
    it('przepuszcza ścieżki serwisu z zapytaniem i kotwicą', () => {
        expect(safeRedirectTarget('/rynki', O)).toBe('/rynki');
        expect(safeRedirectTarget('/ceny?zakres=1R#wykres', O)).toBe('/ceny?zakres=1R#wykres');
        expect(safeRedirectTarget(null, O)).toBe('/');
        expect(safeRedirectTarget('', O)).toBe('/');
    });

    it('odrzuca obce domeny we wszystkich znanych przebraniach', () => {
        for (const evil of ['//evil.com', '/\\evil.com', '/\t/evil.com', '\\\\evil.com', 'https://evil.com', 'http://savori.space.evil.com/x',
            'javascript:alert(1)', 'data:text/html,x', ' //evil.com', '/%5Cevil.com'.replace('%5C', '\\')]) {
            expect(safeRedirectTarget(evil, O), evil).toBe('/');
        }
    });
});
