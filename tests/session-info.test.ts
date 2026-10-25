import { describe, expect, it } from 'vitest';
import { ADMIN_UNTIL } from '@/lib/auth/grant';
import {
    accessLabel,
    accessState,
    endsSoon,
    formatAccessUntil,
    needsRenewal,
    secondsLeft,
    type SessionInfo,
} from '@/lib/auth/session-info';

const NOW = 1_792_900_000;
const DAY = 24 * 60 * 60;
const H48 = 48 * 60 * 60;

/** 1 listopada 2026, 09:40 Europe/Warsaw (CET, UTC+1). */
const NOV = Math.floor(Date.parse('2026-11-01T08:40:00Z') / 1000);
/** 1 sierpnia 2026, 09:40 Europe/Warsaw (CEST, UTC+2) — odróżnia strefę od UTC. */
const AUG = Math.floor(Date.parse('2026-08-01T07:40:00Z') / 1000);
/** 25 stycznia 2027, 12:00 Europe/Warsaw. */
const JAN = Math.floor(Date.parse('2027-01-25T11:00:00Z') / 1000);

function session(over: Partial<SessionInfo> = {}): SessionInfo {
    return { status: 'ok', accessUntil: NOW + 10 * DAY, plan: 'm1', iat: NOW, ...over };
}

describe('accessState', () => {
    it('administrator od ADMIN_UNTIL wzwyż, chwila wcześniej to zwykły dostęp', () => {
        expect(ADMIN_UNTIL).toBe(4_102_444_800);
        expect(accessState(session({ accessUntil: ADMIN_UNTIL, plan: 'm6' }), NOW)).toBe('admin');
        expect(accessState(session({ accessUntil: ADMIN_UNTIL + 1 }), NOW)).toBe('admin');
        expect(accessState(session({ accessUntil: ADMIN_UNTIL - 1 }), NOW)).toBe('active');
    });

    it('aktywny, gdy koniec jest po „teraz”; w tej samej sekundzie już wygasł', () => {
        expect(accessState(session({ accessUntil: NOW + 1 }), NOW)).toBe('active');
        expect(accessState(session({ accessUntil: NOW }), NOW)).toBe('expired');
        expect(accessState(session({ accessUntil: NOW - 1, plan: 'trial' }), NOW)).toBe('expired');
        expect(accessState(session({ accessUntil: 0 }), NOW)).toBe('expired');
    });

    it('brak sesji, brak daty i demo nie udają dostępu', () => {
        expect(accessState(session({ status: 'unknown', accessUntil: ADMIN_UNTIL }), NOW)).toBe('unknown');
        expect(accessState(session({ status: 'none', accessUntil: NOW + DAY }), NOW)).toBe('none');
        expect(accessState(session({ status: 'ok', accessUntil: null, plan: null, iat: null }), NOW)).toBe('unknown');
        expect(accessState(session({ status: 'none' }), NOW)).toBe('none');
    });
});

describe('endsSoon i secondsLeft', () => {
    it('poniżej 48 h, na granicy jeszcze nie', () => {
        expect(secondsLeft(session({ accessUntil: NOW + H48 }), NOW)).toBe(H48);
        expect(endsSoon(session({ accessUntil: NOW + H48 - 1 }), NOW)).toBe(true);
        expect(endsSoon(session({ accessUntil: NOW + 1 }), NOW)).toBe(true);
        expect(endsSoon(session({ accessUntil: NOW + H48 }), NOW)).toBe(false);
        expect(endsSoon(session({ accessUntil: NOW + H48 + 1 }), NOW)).toBe(false);
    });

    it('wygasły, brak sesji i administrator się nie „kończą”', () => {
        expect(endsSoon(session({ accessUntil: NOW }), NOW)).toBe(false);
        expect(endsSoon(session({ accessUntil: NOW - 10 }), NOW)).toBe(false);
        expect(endsSoon(session({ status: 'none', accessUntil: NOW + 60 }), NOW)).toBe(false);
        expect(endsSoon(session({ status: 'unknown' }), NOW)).toBe(false);
        expect(endsSoon(session({ accessUntil: ADMIN_UNTIL }), NOW)).toBe(false);
        expect(secondsLeft(session({ accessUntil: null }), NOW)).toBeNull();
        expect(secondsLeft(session({ status: 'none', accessUntil: NOW + 5 }), NOW)).toBeNull();
        expect(secondsLeft(session({ accessUntil: NOW - 5 }), NOW)).toBe(-5);
    });
});

describe('etykiety po polsku', () => {
    it('formatAccessUntil w Europe/Warsaw, z przecinkiem przed godziną', () => {
        expect(formatAccessUntil(NOV)).toBe('1 listopada 2026, 09:40');
        expect(formatAccessUntil(AUG)).toBe('1 sierpnia 2026, 09:40');
        expect(formatAccessUntil(JAN)).toBe('25 stycznia 2027, 12:00');
    });

    it('okres próbny z godziną, plan z samą datą, poniżej 48 h — „jutro o”', () => {
        const far = NOV - H48;
        expect(accessLabel(session({ accessUntil: NOV, plan: 'trial', iat: far }), far)).toBe('Okres próbny do 1 listopada 2026, 09:40');
        expect(accessLabel(session({ accessUntil: JAN, plan: 'm6' }), JAN - H48)).toBe('Dostęp do 25 stycznia 2027');
        expect(accessLabel(session({ accessUntil: JAN, plan: 'm1' }), JAN - 49 * 3600)).toBe('Dostęp do 25 stycznia 2027');
        expect(accessLabel(session({ accessUntil: JAN, plan: 'm3' }), JAN - 49 * 3600)).toBe('Dostęp do 25 stycznia 2027');
        expect(accessLabel(session({ accessUntil: NOV, plan: 'trial' }), NOV - (H48 - 1))).toBe('Kończy się jutro o 09:40');
        expect(accessLabel(session({ accessUntil: NOV, plan: 'm1' }), NOV - 3600)).toBe('Kończy się jutro o 09:40');
    });

    it('administrator, wygasły, demo i brak sesji — bez etykiety albo sam status admina', () => {
        expect(accessLabel(session({ accessUntil: ADMIN_UNTIL, plan: 'm6' }), NOW)).toBe('Dostęp administratora');
        expect(accessLabel(session({ accessUntil: NOW - 1, plan: 'trial' }), NOW)).toBeNull();
        expect(accessLabel(session({ status: 'none' }), NOW)).toBeNull();
        expect(accessLabel(session({ status: 'unknown' }), NOW)).toBeNull();
        expect(accessLabel(session({ status: 'ok', accessUntil: null, plan: null, iat: null }), NOW)).toBeNull();
    });
});

describe('needsRenewal', () => {
    it('na granicy 24 h jeszcze nie, sekundę później tak', () => {
        expect(needsRenewal(1_000_000, 1_000_000 + DAY)).toBe(false);
        expect(needsRenewal(1_000_000, 1_000_000 + DAY - 1)).toBe(false);
        expect(needsRenewal(1_000_000, 1_000_000 + DAY + 1)).toBe(true);
        expect(needsRenewal(1_000_000, 1_000_000)).toBe(false);
        expect(needsRenewal(1_000_000 + 10, 1_000_000)).toBe(false);
        expect(needsRenewal(null, 1_000_000)).toBe(false);
        expect(needsRenewal(Number.NaN, 1_000_000)).toBe(false);
        expect(needsRenewal(1_000_000, Number.NaN)).toBe(false);
    });
});
