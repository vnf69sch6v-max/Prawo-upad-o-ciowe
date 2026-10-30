import { afterEach, describe, expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';

// Spec docs/specs/2026-10-30-brief-po-digescie.md — brief po digeście, kalendarz do przodu, bez powtórzeń.
vi.mock('server-only', () => ({}));
const digests = new Map<string, unknown>();
const saved: unknown[] = [];
vi.mock('@/lib/news/digest-store', () => ({ readDailyDigest: async (d: string) => digests.get(d) ?? null }));
vi.mock('@/lib/news/archive', () => ({ readNewsArchive: async () => null }));
vi.mock('@/lib/server-cache', () => ({
    peekServerCache: async () => null,
    setServerCache: async (_c: string, _id: string, doc: unknown) => { saved.push(doc); },
}));

import { gatherCalendar, runBrief } from '@/lib/news/brief-server';
import { buildBriefInput, collectBriefAllowed, validateBrief } from '@/lib/news/brief';
import type { BriefDoc } from '@/lib/news/brief';

const AT = new Date('2026-10-30T17:20:00Z'); // piątek, 18:20 Warszawa
const digest = {
    date: '2026-10-30',
    generatedAt: '2026-10-30T16:05:00Z',
    punkty: [{ title: 'Rezygnacja prezesa JSW', link: 'https://a.pl', source: 'wnp.pl', section: 'przemysl', publishedAt: '2026-10-30T12:00:00Z', description: '', importance: 90, corroboration: 3, topics: [] }],
    dane: [
        { id: 'wig20', label: 'WIG20', source: 'GPW', value: '4181', delta: '−2,42%', readingDate: '2026-10-30' },
        { id: 'eurpln', label: 'EUR / PLN', source: 'NBP', value: '4,3955', delta: '+0,01%', readingDate: '2026-10-30' },
    ],
    jutro: { date: '2026-10-31', events: [] },
};

describe('brief dzienny po digeście', () => {
    afterEach(() => { vi.unstubAllEnvs(); digests.clear(); saved.length = 0; });

    it('bez dzisiejszego digestu: error, zero wywołań (bez fallbacku na wczoraj)', async () => {
        vi.stubEnv('DEEPSEEK_API_KEY', 'k');
        digests.set('2026-10-29', { ...digest, date: '2026-10-29' });
        const f = vi.fn();
        const r = await runBrief('daily', AT, f as unknown as typeof fetch);
        expect(r.status).toBe('error');
        expect(f).not.toHaveBeenCalled();
    });

    it('z dzisiejszym digestem: dataDate = dziś', async () => {
        vi.stubEnv('DEEPSEEK_API_KEY', 'k');
        digests.set('2026-10-30', digest);
        const body = {
            teza: 'WIG20 spadł o 2,42%, a złoty stał w miejscu.',
            dane: ['Spadek WIG20 o 2,42% to najsłabsza sesja tygodnia w nagłówkach.', 'EUR/PLN 4,3955 bez większej zmiany.'],
            polska: ['Media piszą o rezygnacji prezesa JSW.'],
            swiat: [],
            kalendarz: [],
        };
        const f = vi.fn(async () => new Response(JSON.stringify({ choices: [{ message: { content: JSON.stringify(body) } }], usage: {} })));
        const r = await runBrief('daily', AT, f as unknown as typeof fetch);
        expect(r.status).toBe('ok');
        expect((saved[0] as BriefDoc).dataDate).toBe('2026-10-30');
    });
});

describe('kalendarz i harmonogram', () => {
    it('dzienny w piątek wieczorem patrzy na poniedziałek, tygodniowy w niedzielę na pn–pt', () => {
        for (const line of gatherCalendar('daily', '2026-10-30')) expect(line.startsWith('02.11 · ')).toBe(true);
        const week = new Set(['02.11', '03.11', '04.11', '05.11', '06.11']);
        const weekly = gatherCalendar('weekly', '2026-11-01');
        expect(weekly).toContain('04.11 · Decyzja RPP (stopy procentowe)');
        for (const line of weekly) expect(week.has(line.slice(0, 5))).toBe(true);
    });

    it('vercel.json: brief o 17:20 UTC, po news-digest (16:05)', () => {
        const crons = JSON.parse(readFileSync('vercel.json', 'utf8')).crons as { path: string; schedule: string }[];
        expect(crons.find((c) => c.path === '/api/cron/brief')?.schedule).toBe('20 17 * * *');
        expect(crons.find((c) => c.path === '/api/cron/news-digest')?.schedule).toBe('5 16 * * *');
    });
});

describe('„co mówią liczby” bez przepisywania', () => {
    const input = buildBriefInput({ kind: 'daily', date: '2026-10-30', digests: [digest as never], world: [], calendar: [] });
    const allowed = collectBriefAllowed(input, '2026-10-30');
    const base = { teza: 'WIG20 spadł o 2,42%.', polska: ['Media piszą o JSW.', 'Media piszą o paliwach.'], swiat: [], kalendarz: [] };

    it('ta sama liczba w dwóch punktach dane → powtórzenie', () => {
        const v = validateBrief({ ...base, dane: ['WIG20 4181 (−2,42%).', 'Spadek o 2,42% ciąży nastrojom.'] }, allowed);
        expect(v.reason).toMatch(/^powtórzenie/);
    });

    it('daty mogą się powtarzać, teza może powtórzyć liczbę', () => {
        const v = validateBrief({ ...base, dane: ['WIG20 spadł o 2,42% (30.10).', 'Złoty stabilny przy 4,3955 (30.10).'] }, allowed);
        expect(v).toEqual({ ok: true });
    });
});
