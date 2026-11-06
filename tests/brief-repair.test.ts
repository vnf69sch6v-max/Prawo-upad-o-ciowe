import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));

import type { DailyDigest } from '@/lib/news/daily';

const digest = {
    date: '2026-10-29',
    generatedAt: '2026-10-29T16:05:00Z',
    punkty: [{ title: 'RPP zostawia stopy bez zmian', link: 'https://a.pl/1', source: 'Bankier.pl', section: 'ogolne', publishedAt: '2026-10-29T12:00:00Z', description: '', importance: 90, corroboration: 3, topics: [] }],
    dane: [{ id: 'cpi', label: 'Inflacja CPI', source: 'GUS', value: '2,8%', delta: '−0,1 pp', readingDate: '2026-10-15' }],
    jutro: { date: '2026-10-30', events: [] },
} as DailyDigest;

const setServerCache = vi.fn<(...args: unknown[]) => Promise<undefined>>(async () => undefined);
vi.mock('@/lib/news/digest-store', () => ({ readDailyDigest: vi.fn(async () => digest) }));
vi.mock('@/lib/news/archive', () => ({ readNewsArchive: vi.fn(async () => null) }));
vi.mock('@/lib/server-cache', () => ({ peekServerCache: vi.fn(async () => null), setServerCache: (...a: unknown[]) => setServerCache(...a) }));

import {
    BRIEF_REPAIR_PROMPT, applyRepairs, buildBriefInput, collectBriefAllowed, findOffendingPoints, isRepairableReason, type BriefBody,
} from '@/lib/news/brief';
import { runBrief } from '@/lib/news/brief-server';

const NOW = new Date('2026-10-30T17:20:00Z');

const good = {
    teza: 'Inflacja CPI wynosi 2,8% (GUS, odczyt 15.10).',
    dane: ['Inflacja CPI 2,8%, zmiana −0,1 pp (GUS, 15.10).'],
    polska: ['Media piszą, że RPP zostawia stopy bez zmian.'],
    swiat: ['Banki centralne czekają na kolejne dane.'],
    kalendarz: ['Dziś szybki szacunek inflacji.'],
};
const ORDINAL = 'Pierwszy raz od miesięcy media piszą, że RPP zostawia stopy bez zmian.';
const bad = { ...good, polska: [ORDINAL] };
const FIXED = 'Media piszą, że RPP zostawia stopy bez zmian.';

type Reply = { status?: number; content?: string };
const wrap = ({ status = 200, content = '{}' }: Reply) =>
    new Response(JSON.stringify({ choices: [{ message: { content }, finish_reason: 'stop' }], usage: { prompt_tokens: 1000, completion_tokens: 200 } }), { status });

/** Fetch rozróżnia wywołanie naprawy (osobny prompt) od zwykłej próby i podaje odpowiedzi z kolejek. */
function mockFetch(main: Reply[], repair: Reply[]) {
    const m = [...main];
    const r = [...repair];
    const calls = { main: 0, repair: 0 };
    const f = vi.fn(async (_url: unknown, init?: RequestInit) => {
        const sys = JSON.parse(init!.body as string).messages[0].content as string;
        const isRepair = sys === BRIEF_REPAIR_PROMPT;
        calls[isRepair ? 'repair' : 'main']++;
        const next = (isRepair ? r : m).shift() ?? { status: 500 };
        return wrap(next);
    });
    return { f: f as unknown as typeof fetch, calls, mock: f };
}

const json = (o: unknown): Reply => ({ content: JSON.stringify(o) });

describe('naprawa odrzuconych punktów w runBrief', () => {
    beforeEach(() => { vi.stubEnv('DEEPSEEK_API_KEY', 'k'); setServerCache.mockClear(); });
    afterEach(() => vi.unstubAllEnvs());

    it('porządkowe „pierwszy” → naprawa → brief zapisany z repaired=1, całość po bramce', async () => {
        const { f, calls } = mockFetch([json(bad)], [json({ punkty: [FIXED] })]);
        const r = await runBrief('daily', NOW, f);
        expect(r.status).toBe('ok');
        expect(calls).toEqual({ main: 1, repair: 1 });
        const doc = setServerCache.mock.calls[0][2] as { body: BriefBody; repaired?: number };
        expect(doc.body.polska[0]).toBe(FIXED);
        expect(doc.repaired).toBe(1);
        expect(r.costUsd).toBeGreaterThan(0);
    });

    it('naprawa nadal zła (porządkowe „drugi”) → rejected, bez zapisu, koszt liczy naprawę', async () => {
        const { f, calls } = mockFetch([json(bad), json(bad), json(bad)], [json({ punkty: ['Drugi raz media piszą, że RPP zostawia stopy.'] })]);
        const r = await runBrief('daily', NOW, f);
        expect(r.status).toBe('rejected');
        expect(setServerCache).not.toHaveBeenCalled();
        expect(calls).toEqual({ main: 3, repair: 1 });
        expect(r.costUsd).toBeGreaterThan(0);
    });

    it('naprawa dodaje liczbę spoza punktu („7”) → bezpiecznik, bez zapisu', async () => {
        const { f, calls } = mockFetch([json(bad), json(bad), json(bad)], [json({ punkty: ['Media piszą o 7 decyzjach RPP.'] })]);
        const r = await runBrief('daily', NOW, f);
        expect(r.status).toBe('rejected');
        expect(setServerCache).not.toHaveBeenCalled();
        expect(calls.repair).toBe(1);
    });

    it('powód nie-słowny (markdown) → zero wywołań naprawy', async () => {
        const md = { ...good, teza: '**Teza**' };
        const { f, calls } = mockFetch([json(md), json(md), json(md)], []);
        const r = await runBrief('daily', NOW, f);
        expect(r.status).toBe('rejected');
        expect(calls).toEqual({ main: 3, repair: 0 });
    });

    it('maks. jedna naprawa na przebieg, nawet gdy kolejne próby też padają', async () => {
        const { f, calls } = mockFetch([json(bad), json(bad), json(bad)], [json({ punkty: ['Drugi raz media piszą.'] }), json({ punkty: [FIXED] })]);
        const r = await runBrief('daily', NOW, f);
        expect(r.status).toBe('rejected');
        expect(calls.repair).toBe(1);
    });

    it('błąd HTTP naprawy → zwykła kolejna próba, bez wyjątku, brief bez repaired', async () => {
        const { f, calls } = mockFetch([json(bad), json(good)], [{ status: 500 }]);
        const r = await runBrief('daily', NOW, f);
        expect(r.status).toBe('ok');
        expect(calls).toEqual({ main: 2, repair: 1 });
        const doc = setServerCache.mock.calls[0][2] as { repaired?: number };
        expect(doc.repaired).toBeUndefined();
    });
});

describe('findOffendingPoints / applyRepairs', () => {
    const allowed = collectBriefAllowed(buildBriefInput({ kind: 'daily', date: '2026-10-30', digests: [digest], world: [], calendar: [] }), '2026-10-30');
    const body = { ...good, polska: [ORDINAL] } as BriefBody;

    it('zgłasza obcy liczebnik i obcą liczbę, nie zgłasza słów i liczb z wejścia', () => {
        const [p] = findOffendingPoints(body, allowed);
        expect(p).toMatchObject({ field: 'polska', index: 0, token: 'Pierwszy', kind: 'word' });
        expect(findOffendingPoints(good as BriefBody, allowed)).toEqual([]);
        const num = findOffendingPoints({ ...good, dane: ['Inflacja CPI spadła do 6,1%.'] } as BriefBody, allowed);
        expect(num[0]).toMatchObject({ field: 'dane', kind: 'number', token: '6.1' });
    });

    it('applyRepairs: zakazany token, nowa liczba, >130% długości, zła liczba elementów → null', () => {
        const points = findOffendingPoints(body, allowed);
        expect(applyRepairs(body, points, [FIXED])?.polska[0]).toBe(FIXED);
        expect(applyRepairs(body, points, ['Pierwszy raz media piszą.'])).toBeNull();
        expect(applyRepairs(body, points, ['Media piszą o 7 decyzjach.'])).toBeNull();
        expect(applyRepairs(body, points, [`${FIXED} ${FIXED} ${FIXED}`])).toBeNull();
        expect(applyRepairs(body, points, [FIXED, FIXED])).toBeNull();
        expect(applyRepairs(body, points, [''])).toBeNull();
        expect(applyRepairs(body, points, 'nie tablica')).toBeNull();
        expect(body.polska[0]).toBe(ORDINAL); // bez mutacji
    });

    it('naprawialne są tylko liczby i liczebniki', () => {
        expect(isRepairableReason('liczebnik słowny spoza wejścia: „pierwszy”')).toBe(true);
        expect(isRepairableReason('liczby spoza wejścia: 6 (…)')).toBe(true);
        for (const r of ['markdown', 'za mało punktów', 'powtórzenie: 2.8', 'meta: „x”']) expect(isRepairableReason(r)).toBe(false);
    });
});
