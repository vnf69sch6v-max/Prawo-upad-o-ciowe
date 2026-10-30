import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));
import {
    MAX_OUTPUT_TOKENS, buildBriefInput, collectBriefAllowed, costUsd, estimateTokens, isDeepseekPeak,
    parseBriefJson, validateBrief, type BriefInputData,
} from '@/lib/news/brief';
import { callDeepseek, runBrief } from '@/lib/news/brief-server';
import type { DailyDigest } from '@/lib/news/daily';

const digest: DailyDigest = {
    date: '2026-10-29',
    generatedAt: '2026-10-29T16:05:00Z',
    punkty: [{ title: 'RPP zostawia stopy bez zmian', link: 'https://a.pl/1', source: 'Bankier.pl', section: 'ogolne', publishedAt: '2026-10-29T12:00:00Z', description: '', importance: 90, corroboration: 3, topics: [] }],
    dane: [{ id: 'cpi', label: 'Inflacja CPI', value: '2,8%', delta: '−0,1 pp', readingDate: '2026-10-15' }],
    jutro: { date: '2026-10-30', events: [] },
} as DailyDigest;

const input: BriefInputData = {
    kind: 'daily',
    date: '2026-10-30',
    digests: [digest],
    world: [{ title: 'Federal Reserve issues FOMC statement', description: 'Rates held at 3.75%', source: 'Fed — komunikaty', region: 'US', publishedAt: '2026-10-28T18:00:00Z' }],
    calendar: ['2026-10-30: Szybki szacunek inflacji'],
};

const goodBody = {
    teza: 'Inflacja CPI spadła do 2,8% (GUS, odczyt 2026-10-15), a Fed trzyma stopy na 3.75%.',
    dane: ['Inflacja CPI 2,8%, zmiana −0,1 pp (GUS, 2026-10-15).'],
    polska: ['Media piszą, że RPP zostawia stopy bez zmian.'],
    swiat: ['Fed: komunikat FOMC — dla PLN to sygnał stabilnych stóp w USA.'],
    kalendarz: ['Dziś szybki szacunek inflacji.'],
};

describe('wejście briefu', () => {
    it('zawiera liczby z digestu, nagłówki PL i świat, kalendarz', () => {
        const text = buildBriefInput(input);
        expect(text).toContain('Inflacja CPI: 2,8% (zmiana −0,1 pp), odczyt 2026-10-15');
        expect(text).toContain('RPP zostawia stopy');
        expect(text).toContain('FOMC statement');
        expect(text).toContain('Szybki szacunek');
    });

    it('limit tokenów tnie newsy, nigdy liczb', () => {
        const many = { ...input, world: Array.from({ length: 50 }, (_, i) => ({ ...input.world[0], title: `World headline ${i} ${'x'.repeat(300)}` })) };
        const text = buildBriefInput(many, 600);
        expect(estimateTokens(text)).toBeLessThanOrEqual(600);
        expect(text).toContain('Inflacja CPI: 2,8%');
        expect(text).not.toContain('World headline 49');
    });
});

describe('walidator liczb', () => {
    const allowed = collectBriefAllowed(buildBriefInput(input), input.date);

    it('akceptuje liczby z wejścia (2,8 = 2.8, −0,1 bez znaku, daty)', () => {
        expect(validateBrief(parseBriefJson(JSON.stringify(goodBody))!, allowed)).toEqual({ ok: true });
    });

    it('odrzuca liczbę spoza wejścia', () => {
        const bad = { ...goodBody, teza: 'Inflacja CPI spadła do 2,7%.' };
        const v = validateBrief(parseBriefJson(JSON.stringify(bad))!, allowed);
        expect(v.ok).toBe(false);
        expect(v.reason).toContain('2.7');
    });

    it('odrzuca liczebnik słowny spoza wejścia, przepuszcza cytat z nagłówka', () => {
        const v = validateBrief({ ...goodBody, teza: 'Inflacja spada trzeci miesiąc z rzędu.' }, allowed);
        expect(v.ok).toBe(false);
        expect(v.reason).toContain('trzeci');
        const withHeadline = collectBriefAllowed(`${buildBriefInput(input)}\n- Trzy lata hossy uśpiły czujność`, input.date);
        expect(validateBrief({ ...goodBody, teza: 'Media piszą, że trzy lata hossy uśpiły czujność.' }, withHeadline)).toEqual({ ok: true });
    });

    it('odrzuca markdown i niepoprawny JSON', () => {
        expect(validateBrief({ ...goodBody, teza: '**Teza**' }, allowed).ok).toBe(false);
        expect(parseBriefJson('to nie jest JSON')).toBeNull();
        expect(parseBriefJson('{"dane": []}')).toBeNull();
    });
});

describe('koszt', () => {
    it('szczyt DeepSeek: 01–04 i 06–10 UTC pn–pt', () => {
        expect(isDeepseekPeak(new Date('2026-10-30T05:10:00Z'))).toBe(false); // piątek, cron
        expect(isDeepseekPeak(new Date('2026-10-30T07:00:00Z'))).toBe(true);
        expect(isDeepseekPeak(new Date('2026-10-31T07:00:00Z'))).toBe(false); // sobota
    });

    it('liczony z usage wg cennika (poza szczytem)', () => {
        const usage = { prompt_tokens: 10_000, prompt_cache_hit_tokens: 0, prompt_cache_miss_tokens: 10_000, completion_tokens: 1_000 };
        expect(costUsd(usage, new Date('2026-10-30T05:10:00Z'))).toBeCloseTo(0.0015 + 0.0006, 6);
        expect(costUsd(usage, new Date('2026-10-30T07:00:00Z'))).toBeCloseTo(0.0042, 6);
    });
});

describe('wywołanie DeepSeek', () => {
    afterEach(() => vi.unstubAllEnvs());

    it('bez DEEPSEEK_API_KEY: skipped, zero wywołań', async () => {
        vi.stubEnv('DEEPSEEK_API_KEY', '');
        const f = vi.fn();
        const r = await runBrief('daily', new Date(), f as unknown as typeof fetch);
        expect(r.status).toBe('skipped');
        expect(f).not.toHaveBeenCalled();
    });

    it('wysyła deepseek-flash, thinking disabled, max_tokens z limitu', async () => {
        const f = vi.fn(async () => new Response(JSON.stringify({ choices: [{ message: { content: '{}' } }], usage: {} })));
        await callDeepseek('k', 'wejście', MAX_OUTPUT_TOKENS.daily, f as unknown as typeof fetch);
        const body = JSON.parse((f.mock.calls[0] as unknown as [string, RequestInit])[1].body as string);
        expect(body.model).toBe('deepseek-flash');
        expect(body.thinking).toEqual({ type: 'disabled' });
        expect(body.max_tokens).toBe(1200);
    });

    it('odpowiedź z reasoning_content jest odrzucana', async () => {
        const f = vi.fn(async () => new Response(JSON.stringify({ choices: [{ message: { content: '{}', reasoning_content: 'myślę…' } }] })));
        await expect(callDeepseek('k', 'x', 100, f as unknown as typeof fetch)).rejects.toThrow(/reasoning_content/);
    });
});
