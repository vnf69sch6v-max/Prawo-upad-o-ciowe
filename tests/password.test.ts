import { describe, expect, it } from 'vitest';
import { MIN_PASSWORD_LENGTH, passwordProblem } from '@/lib/auth/password';

describe('passwordProblem', () => {
    it('krótsze niż 8 znaków i różne hasła nie przechodzą', () => {
        expect(MIN_PASSWORD_LENGTH).toBe(8);
        expect(passwordProblem('krotkie', 'krotkie')).toBe('Hasło musi mieć co najmniej 8 znaków.');
        expect(passwordProblem('haslo-raz', 'haslo-dwa')).toBe('Hasła nie są takie same.');
        expect(passwordProblem('haslo-ok', 'haslo-ok')).toBeNull();
    });
});
