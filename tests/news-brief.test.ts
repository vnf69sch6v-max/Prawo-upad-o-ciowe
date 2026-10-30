import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));
import {
    MAX_OUTPUT_TOKENS, buildBriefInput, collectBriefAllowed, costUsd, estimateTokens, isDeepseekPeak,
    cleanBriefBody, normalizeBriefBody, normalizeBriefText, parseBriefJson, validateBrief, type BriefInputData,
} from '@/lib/news/brief';
import { callDeepseek, runBrief } from '@/lib/news/brief-server';
import type { DailyDigest } from '@/lib/news/daily';
import realBrief from './fixtures/brief-2026-10-30.json';

const digest: DailyDigest = {
    date: '2026-10-29',
    generatedAt: '2026-10-29T16:05:00Z',
    punkty: [{ title: 'RPP zostawia stopy bez zmian', link: 'https://a.pl/1', source: 'Bankier.pl', section: 'ogolne', publishedAt: '2026-10-29T12:00:00Z', description: '', importance: 90, corroboration: 3, topics: [] }],
    dane: [{ id: 'cpi', label: 'Inflacja CPI', source: 'GUS', value: '2,8%', delta: '−0,1 pp', readingDate: '2026-10-15' }],
    jutro: { date: '2026-10-30', events: [] },
} as DailyDigest;

const input: BriefInputData = {
    kind: 'daily',
    date: '2026-10-30',
    digests: [digest],
    world: [{ title: 'Federal Reserve issues FOMC statement', description: 'Rates held at 3.75%', source: 'Fed — komunikaty', region: 'US', publishedAt: '2026-10-28T18:00:00Z' }],
    calendar: ['30.10 · Szybki szacunek inflacji'],
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
        expect(text).toContain('Inflacja CPI: 2,8%; zmiana −0,1 pp; 15.10; GUS');
        expect(text).not.toMatch(/serwis/i);
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

    it('akceptuje liczby z wejścia (2,8 = 2.8, −0,1 bez znaku, daty ISO po normalizacji)', () => {
        expect(validateBrief(normalizeBriefBody(parseBriefJson(JSON.stringify(goodBody))!), allowed)).toEqual({ ok: true });
    });

    it('odrzuca liczbę spoza wejścia', () => {
        const bad = { ...goodBody, teza: 'Inflacja CPI spadła do 2,7%.' };
        const v = validateBrief(parseBriefJson(JSON.stringify(bad))!, allowed);
        expect(v.ok).toBe(false);
        expect(v.reason).toContain('2.7');
    });

    it('odrzuca liczebnik słowny spoza wejścia, przepuszcza cytat z nagłówka', () => {
        const v = validateBrief(normalizeBriefBody({ ...goodBody, teza: 'Inflacja spada trzeci miesiąc z rzędu.' }), allowed);
        expect(v.ok).toBe(false);
        expect(v.reason).toContain('trzeci');
        const withHeadline = collectBriefAllowed(`${buildBriefInput(input)}\n- Trzy lata hossy uśpiły czujność`, input.date);
        expect(validateBrief(normalizeBriefBody({ ...goodBody, teza: 'Media piszą, że trzy lata hossy uśpiły czujność.' }), withHeadline)).toEqual({ ok: true });
    });

    it('normalizuje zapis liczb i dat po polsku, a walidator to przyjmuje', () => {
        expect(normalizeBriefText('EUR/PLN 4.3951 (-0.32%), 2026-10-29')).toBe('EUR/PLN 4.3951 (\u22120,32%), 29.10');
        expect(normalizeBriefText('Rentowność +0.4 pp, -1.2 p.p.')).toBe('Rentowność +0,4 pp, \u22121,2 p.p.');
        const fx = { ...input, digests: [{ ...digest, dane: [{ id: 'eurpln', label: 'EUR / PLN', source: 'NBP', value: '4,3951', delta: '\u22120,32%', readingDate: '2026-10-29' }] }] } as BriefInputData;
        const fxAllowed = collectBriefAllowed(buildBriefInput(fx), fx.date);
        const body = normalizeBriefBody({ teza: 'Złoty: EUR/PLN 4,3951 (-0.32%), 2026-10-29.', dane: ['a'], polska: ['b'], swiat: ['c'], kalendarz: [] });
        expect(validateBrief(body, fxAllowed)).toEqual({ ok: true });
    });

    it('indeks ≥ 10 000 (spacja zwykła i twarda) przechodzi — regresja 30.10', () => {
        const idx = { ...input, digests: [{ ...digest, dane: [
            { id: 'mwig40', label: 'mWIG40', source: 'GPW', value: '10\u00a0945', delta: '+0,67%', readingDate: '2026-10-29' },
            { id: 'swig80', label: 'sWIG80', source: 'GPW', value: '30 085', delta: '\u22120,65%', readingDate: '2026-10-29' },
        ] }] } as BriefInputData;
        const idxAllowed = collectBriefAllowed(buildBriefInput(idx), idx.date);
        const body = normalizeBriefBody({ teza: 'mWIG40 10 945 pkt, sWIG80 30\u00a0085 pkt.', dane: ['a'], polska: ['b'], swiat: ['c'], kalendarz: [] });
        expect(validateBrief(body, idxAllowed)).toEqual({ ok: true });
    });

    it('przyjmuje brief z pustym „swiat”', () => {
        const body = { ...goodBody, swiat: [], polska: [...goodBody.polska, 'Media piszą o RPP.'] };
        expect(validateBrief(normalizeBriefBody(body), allowed)).toEqual({ ok: true });
    });

    it('prawdziwa odpowiedź z 30.10: surowa odrzucona jako meta, po czyszczeniu bez komentarzy do wejścia', () => {
        const raw = normalizeBriefBody(realBrief);
        expect(validateBrief(raw, allowed).reason).toMatch(/^meta/);
        const cleaned = cleanBriefBody(raw)!;
        const text = [cleaned.teza, ...cleaned.dane, ...cleaned.polska, ...cleaned.swiat, ...cleaned.kalendarz].join('\n');
        expect(text).not.toMatch(/serwis|w wejściu|w materiale|nie podano|z nagłówka, nie/i);
        expect(cleaned.swiat).toHaveLength(1); // „Brak nagłówków…” i „brak szczegółów w materiale” wypadają
        expect(cleaned.dane[0]).toBe('EUR/PLN: 4,3951 (zmiana \u22120,32%), odczyt 29.10.');
        expect(text).not.toMatch(/\d\.\d+\s?(?:%|pp)|\d{4}-\d{2}-\d{2}/);
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
