import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
vi.mock('server-only', () => ({}));
import {
    BATCH_SIZE, MAX_BATCHES, MAX_BATCH_INPUT_TOKENS, MAX_ENTRIES, MAX_TRANSLATE_OUTPUT_TOKENS,
    allowedNumbers, applyTranslations, buildBatches, entriesFromReply, mergeEntries, parseTranslateJson,
    TRANSLATE_RULES_VERSION, pendingItems, suspicious, translationKey, type TranslationsDoc,
} from '@/lib/news/translate';
import { readFileSync } from 'node:fs';
import { estimateTokens } from '@/lib/news/brief';
import { runNewsTranslate } from '@/lib/news/translate-server';
import type { NewsItem } from '@/lib/news/types';

// Kryteria akceptacji docs/specs/2026-11-03-newsy-tlumaczenie.md.

const en = (title: string, description = '', extra: Partial<NewsItem> = {}): NewsItem => ({
    title, description, link: `https://x.test/${encodeURIComponent(title)}`, publishedAt: '2026-11-03T10:00:00Z',
    sourceId: 'bbc', source: 'BBC Business', section: 'swiat', lang: 'en', region: 'GB', ...extra,
});
const pl = (title: string): NewsItem => ({ ...en(title), sourceId: 'bankier', source: 'Bankier', section: 'ogolne', lang: 'pl', region: 'PL' });

describe('walidator liczb', () => {
    const fed = en('Fed holds rates at 4.25%, sees 1,200 job cuts', 'The Federal Reserve kept rates unchanged at 4.25% in November.');
    const allowed = allowedNumbers(fed);

    it('przepuszcza polski zapis liczb z oryginału („4.25%” → „4,25%”, „1,200” → „1200” / „1 200”)', () => {
        expect(suspicious('Fed utrzymuje stopy na poziomie 4,25%, widzi 1200 zwolnień', fed.title, allowed, 'title')).toBeNull();
        expect(suspicious('Fed utrzymuje stopy na 4,25% i spodziewa się 1 200 zwolnień', fed.title, allowed, 'title')).toBeNull();
    });

    it('odrzuca liczbę spoza oryginału', () => {
        expect(suspicious('Fed utrzymuje stopy na 4,5%', fed.title, allowed, 'title')).toMatch(/liczba spoza oryginału: 4.5/);
        expect(suspicious('Fed podnosi stopy o 25 pb', fed.title, allowed, 'title')).toMatch(/25/);
    });

    it('„1,200” → „1,2 tys.” odpada; tytuł bez liczby z oryginału („0.25%”) odpada', () => {
        expect(suspicious('Fed utrzymuje stopy na 4,25%, widzi 1,2 tys. zwolnień', fed.title, allowed, 'title')).toMatch(/1.2/);
        const cut = en('Fed cuts rates by 0.25%');
        expect(suspicious('Fed obniża stopy', cut.title, allowedNumbers(cut), 'title')).toMatch(/brak liczby z oryginału: 0.25/);
        // lead to skrót — brak liczby z tytułu nie jest tam błędem
        expect(suspicious('Fed obniżył stopy procentowe.', cut.title, allowedNumbers(cut), 'lead')).toBeNull();
    });

    it('znak minus nie ma znaczenia („down 0.3%” → „−0,3%”)', () => {
        const it2 = en('UK GDP down 0.3% in September');
        expect(suspicious('PKB W. Brytanii spadł o −0,3% we wrześniu', it2.title, allowedNumbers(it2), 'title')).toBeNull();
    });

    it('odrzuca pustą, nieprzetłumaczoną, w obcym piśmie, z markdownem i meta-komentarzem', () => {
        const t = 'Oil prices fall as demand weakens';
        const a = allowedNumbers(en(t));
        expect(suspicious('  ', t, a, 'title')).toBe('pusta');
        expect(suspicious(t, t, a, 'title')).toBe('bez tłumaczenia');
        expect(suspicious('Ceny ropy 下跌', t, a, 'title')).toBe('obce pismo');
        expect(suspicious('Цены нефти падают', t, a, 'title')).toBe('obce pismo');
        expect(suspicious('**Ceny ropy spadają**', t, a, 'title')).toBe('markdown');
        expect(suspicious('Tłumaczenie: ceny ropy spadają', t, a, 'title')).toBe('meta-komentarz');
        expect(suspicious('Ceny\nropy', t, a, 'title')).toBe('nowa linia');
        expect(suspicious('Ropa', t, a, 'title')).toBe('długość');
        expect(suspicious('x'.repeat(230), t, a, 'lead')).toBe('lead za długi');
    });
});

describe('odpowiedź modelu → wpisy', () => {
    const items = [en('ECB keeps rates at 2%', 'The ECB left its deposit rate at 2% on Thursday.'), en('Yen weakens past 150 per dollar', 'Desc'), en('Markets rally')];

    it('dobre tytuły zapisane, podejrzany → rej, zły lead → sam tytuł, brak pozycji → rej', () => {
        const reply = parseTranslateJson(JSON.stringify({ items: [
            { id: '1', t: 'EBC utrzymuje stopy na poziomie 2%', l: 'EBC pozostawił stopę depozytową na poziomie 2% w czwartek.' },
            { id: 2, t: 'Jen słabnie powyżej 155 za dolara', l: '' },
        ] }))!;
        expect(reply).not.toBeNull();
        const e = entriesFromReply(items, reply, '2026-11-03T05:15:00Z');
        expect(e[translationKey(items[0].title)]).toEqual({ t: 'EBC utrzymuje stopy na poziomie 2%', l: 'EBC pozostawił stopę depozytową na poziomie 2% w czwartek.', at: '2026-11-03T05:15:00Z' });
        expect(e[translationKey(items[1].title)]).toMatchObject({ rej: expect.stringMatching(/155/) });
        expect(e[translationKey(items[1].title)]).toMatchObject({ rv: TRANSLATE_RULES_VERSION });
        // pozycji, której model nie zwrócił, nie zapisujemy — spróbuje następny przebieg
        expect(e[translationKey(items[2].title)]).toBeUndefined();

        const badLead = entriesFromReply([items[0]], new Map([['1', { t: 'EBC utrzymuje stopy na 2%', l: 'Stopa wynosi 3%.' }]]), 'x');
        expect(badLead[translationKey(items[0].title)]).toEqual({ t: 'EBC utrzymuje stopy na 2%', at: 'x' });
    });

    it('zły JSON albo brak tablicy items → null (partia do ponowienia)', () => {
        expect(parseTranslateJson('nie json')).toBeNull();
        expect(parseTranslateJson('{"foo": []}')).toBeNull();
        expect(parseTranslateJson('```json\n{"items": []}\n```')).toEqual(new Map());
    });
});

describe('partie', () => {
    it('najwyżej BATCH_SIZE pozycji i MAX_BATCHES partii', () => {
        const many = Array.from({ length: 100 }, (_, i) => en(`Headline number ${i}`, 'Short lead.'));
        const b = buildBatches(many);
        expect(b.length).toBe(MAX_BATCHES);
        for (const x of b) expect(x.items.length).toBeLessThanOrEqual(BATCH_SIZE);
        expect(b[0].input).toContain('[1] TYTUŁ: Headline number 0');
        expect(b[1].input).toContain('[1] TYTUŁ: Headline number 15');
    });

    it('opis w wejściu ucięty do 300 zn.', () => {
        const [b] = buildBatches([en('Headline', `${'a'.repeat(300)}ZZZ${'b'.repeat(700)}`)]);
        expect(b.input).toContain('a'.repeat(300));
        expect(b.input).not.toContain('ZZZ');
    });

    it('wejście partii mieści się w limicie tokenów, nawet przy długich opisach', () => {
        const long = Array.from({ length: 40 }, (_, i) => en(`${'Long headline '.repeat(50)}${i}`, 'word '.repeat(400)));
        const b = buildBatches(long);
        expect(b.length).toBeGreaterThan(0);
        for (const x of b) expect(estimateTokens(x.input)).toBeLessThanOrEqual(MAX_BATCH_INPUT_TOKENS);
        expect(b.reduce((s, x) => s + x.items.length, 0)).toBeLessThan(40); // limit tnie, a nie łamie budżet
    });

    it('do tłumaczenia tylko zagraniczne pozycje bez wpisu, bez powtórzeń tytułu', () => {
        const done = en('Already translated');
        const doc: TranslationsDoc = { entries: { [translationKey(done.title)]: { t: 'Już przetłumaczone', at: 'x' } } };
        const p = pendingItems([pl('Polski tytuł'), done, en('New one'), en('New  one'), en('Rejected')], {
            entries: { ...doc.entries, [translationKey('Rejected')]: { rej: 'długość', at: 'x', rv: TRANSLATE_RULES_VERSION } },
        });
        expect(p.map((x) => x.title)).toEqual(['New one']);
    });

    it('odrzucenie ze starszą wersją reguł wraca do kolejki; banki centralne pierwsze, potem najnowsze', () => {
        const doc: TranslationsDoc = { entries: {
            [translationKey('Old rule')]: { rej: 'długość', at: 'x', rv: TRANSLATE_RULES_VERSION - 1 },
            [translationKey('Legacy')]: { rej: 'długość', at: 'x' },
        } };
        const p = pendingItems([
            en('Old rule', '', { publishedAt: '2026-11-03T08:00:00Z' }),
            en('Legacy', '', { publishedAt: '2026-11-03T07:00:00Z' }),
            en('ECB press release', '', { section: 'banki', publishedAt: '2026-11-01T08:00:00Z' }),
            en('Newest media', '', { publishedAt: '2026-11-03T11:00:00Z' }),
        ], doc);
        expect(p.map((x) => x.title)).toEqual(['ECB press release', 'Newest media', 'Old rule', 'Legacy']);
    });

    it('moduły tłumaczenia nie sięgają po sesję ani dane użytkownika (do modelu idą tylko publiczne nagłówki)', () => {
        for (const f of ['src/lib/news/translate.ts', 'src/lib/news/translate-server.ts', 'src/app/api/cron/news-translate/route.ts']) {
            expect(readFileSync(f, 'utf8'), f).not.toMatch(/from '@\/lib\/(auth|user-data|session)/);
        }
    });
});

describe('nakładanie i słownik', () => {
    it('nakłada titlePl/leadPl tylko na zagraniczne; polskich i nieprzetłumaczonych nie zmienia', () => {
        const a = en('Fed holds'), b = en('No translation'), c = pl('Fed holds');
        const doc: TranslationsDoc = { entries: {
            [translationKey('Fed holds')]: { t: 'Fed bez zmian', l: 'Lead.', at: 'x' },
            [translationKey('No translation')]: { rej: 'pusta', at: 'x' },
        } };
        const [ra, rb, rc] = applyTranslations([a, b, c], doc);
        expect(ra).toMatchObject({ titlePl: 'Fed bez zmian', leadPl: 'Lead.', title: 'Fed holds' });
        expect(rb).toBe(b);
        expect(rc).toBe(c);
        expect(applyTranslations([a], null)[0]).toBe(a);
    });

    it('przycina słownik do 14 dni i MAX_ENTRIES najnowszych', () => {
        const now = new Date('2026-11-03T12:00:00Z');
        const prev: TranslationsDoc = { entries: {
            old: { t: 'stare', at: '2026-10-01T00:00:00Z' },
            ...Object.fromEntries(Array.from({ length: MAX_ENTRIES + 5 }, (_, i) => [`k${i}`, { t: 'x', at: new Date(now.getTime() - i * 60_000).toISOString() }])),
        } };
        const merged = mergeEntries(prev, { nowy: { t: 'nowy', at: now.toISOString() } }, now);
        expect(Object.keys(merged.entries).length).toBe(MAX_ENTRIES);
        expect(merged.entries.nowy).toBeDefined();
        expect(merged.entries.old).toBeUndefined();
    });
});

describe('runNewsTranslate (cron)', () => {
    const now = new Date('2026-11-03T19:15:00Z'); // wtorek, poza szczytem
    const feed = [pl('Polski'), en('Fed holds rates at 4.25%', 'The Fed kept rates at 4.25%.'), en('Oil falls', '')];
    const ok = (content: unknown, usage = { prompt_tokens: 1000, completion_tokens: 500, prompt_cache_miss_tokens: 1000 }) =>
        vi.fn(async () => new Response(JSON.stringify({ choices: [{ message: { content: JSON.stringify(content) }, finish_reason: 'stop' }], usage }), { status: 200 }));

    beforeEach(() => { process.env.DEEPSEEK_API_KEY = 'test-key'; });
    afterEach(() => { delete process.env.DEEPSEEK_API_KEY; });

    it('bez klucza → skipped, bez wywołania API i bez zapisu', async () => {
        delete process.env.DEEPSEEK_API_KEY;
        const f = vi.fn(), write = vi.fn();
        const r = await runNewsTranslate(now, f as unknown as typeof fetch, { feed: async () => feed, read: async () => null, write });
        expect(r.status).toBe('skipped');
        expect(f).not.toHaveBeenCalled();
        expect(write).not.toHaveBeenCalled();
    });

    it('wszystko w słowniku (cache-hit) → zero wywołań API, bez zapisu', async () => {
        const doc: TranslationsDoc = { entries: Object.fromEntries(feed.filter((x) => x.lang === 'en').map((x) => [translationKey(x.title), { t: 'pl', at: now.toISOString() }])) };
        const f = vi.fn(), write = vi.fn();
        const r = await runNewsTranslate(now, f as unknown as typeof fetch, { feed: async () => feed, read: async () => doc, write });
        expect(r).toMatchObject({ status: 'ok', pending: 0, costUsd: 0 });
        expect(f).not.toHaveBeenCalled();
        expect(write).not.toHaveBeenCalled();
    });

    it('wysyła deepseek-flash bez thinking, z limitem tokenów; liczy koszt z usage i zapisuje słownik', async () => {
        const f = ok({ items: [{ id: '1', t: 'Fed utrzymuje stopy na 4,25%', l: 'Fed pozostawił stopy na 4,25%.' }, { id: '2', t: 'Ropa tanieje', l: '' }] });
        const write = vi.fn(async () => {});
        const r = await runNewsTranslate(now, f as unknown as typeof fetch, { feed: async () => feed, read: async () => null, write });
        expect(f).toHaveBeenCalledTimes(1);
        const body = JSON.parse((f.mock.calls[0] as unknown as [string, RequestInit])[1].body as string);
        expect(body).toMatchObject({ model: 'deepseek-flash', thinking: { type: 'disabled' }, max_tokens: MAX_TRANSLATE_OUTPUT_TOKENS, temperature: 0.3, response_format: { type: 'json_object' } });
        expect(body.messages[0].content).toMatch(/Tłumaczysz nagłówki/);
        expect(body.messages[1].content).not.toContain('Polski'); // polskie pozycje nie idą do modelu
        // poza szczytem: 1000 × 0,15 + 500 × 0,60 za 1M = 0,00045 USD
        expect(r).toMatchObject({ status: 'ok', translated: 2, rejected: 0, costUsd: 0.00045, batches: { ok: 1, total: 1 } });
        const saved = (write.mock.calls[0] as unknown as [TranslationsDoc])[0];
        expect(saved.entries[translationKey('Fed holds rates at 4.25%')]).toMatchObject({ t: 'Fed utrzymuje stopy na 4,25%', l: 'Fed pozostawił stopy na 4,25%.' });
        expect(saved.entries[translationKey('Oil falls')]).toMatchObject({ t: 'Ropa tanieje' });
    });

    it('błąd całej partii (HTTP 500, ucięty JSON, reasoning_content) nic nie zapisuje', async () => {
        const cases = [
            vi.fn(async () => new Response('err', { status: 500 })),
            vi.fn(async () => new Response(JSON.stringify({ choices: [{ message: { content: '{"items": [' }, finish_reason: 'length' }], usage: {} }))),
            vi.fn(async () => new Response(JSON.stringify({ choices: [{ message: { content: '{}', reasoning_content: 'hmm' } }], usage: {} }))),
            ok('nie obiekt'),
        ];
        for (const f of cases) {
            const write = vi.fn();
            const r = await runNewsTranslate(now, f as unknown as typeof fetch, { feed: async () => feed, read: async () => null, write });
            expect(r.status).toBe('error');
            expect(r.failed.length).toBe(1);
            expect(write).not.toHaveBeenCalled();
        }
    });

    it('timeout partii → error, bez zapisu', async () => {
        const f = vi.fn(async () => { throw new DOMException('The operation was aborted due to timeout', 'TimeoutError'); });
        const write = vi.fn();
        const r = await runNewsTranslate(now, f as unknown as typeof fetch, { feed: async () => feed, read: async () => null, write });
        expect(r.status).toBe('error');
        expect(r.failed[0]).toMatch(/timeout/);
        expect(write).not.toHaveBeenCalled();
    });

    it('ucięta odpowiedź jest zapłacona — koszt z usage trafia do wyniku mimo błędu', async () => {
        const f = vi.fn(async () => new Response(JSON.stringify({
            choices: [{ message: { content: '{"items": [' }, finish_reason: 'length' }],
            usage: { prompt_tokens: 1000, completion_tokens: 3000, prompt_cache_miss_tokens: 1000 },
        })));
        const r = await runNewsTranslate(now, f as unknown as typeof fetch, { feed: async () => feed, read: async () => null, write: vi.fn() });
        expect(r.status).toBe('error');
        expect(r.costUsd).toBeCloseTo(0.00195, 6); // 1000 × 0,15 + 3000 × 0,60 za 1M
        expect(r.tokens).toEqual({ input: 1000, output: 3000 });
    });

    it('przebieg mieszany: udana partia zapisana, nieudana nie (żadnego rej z partii 2) → partial', async () => {
        const many = Array.from({ length: 20 }, (_, i) => en(`Market headline ${i + 100}`, '', { publishedAt: `2026-11-03T${String(i).padStart(2, '0')}:00:00Z` }));
        let call = 0;
        const f = vi.fn(async (_url: string, init: RequestInit) => {
            call++;
            if (call === 2) return new Response('err', { status: 500 });
            const user = JSON.parse(init.body as string).messages[1].content as string;
            const ids = [...user.matchAll(/\[(\d+)\] TYTUŁ: Market headline (\d+)/g)];
            const items = ids.map((m) => ({ id: m[1], t: `Nagłówek rynkowy ${m[2]}`, l: '' }));
            return new Response(JSON.stringify({ choices: [{ message: { content: JSON.stringify({ items }) }, finish_reason: 'stop' }], usage: {} }));
        });
        const write = vi.fn(async () => {});
        const r = await runNewsTranslate(now, f as unknown as typeof fetch, { feed: async () => many, read: async () => null, write });
        expect(r).toMatchObject({ status: 'partial', batches: { ok: 1, total: 2 }, translated: 15, rejected: 0 });
        expect(write).toHaveBeenCalledTimes(1);
        const saved = (write.mock.calls[0] as unknown as [TranslationsDoc])[0];
        expect(Object.keys(saved.entries)).toHaveLength(15);
        // pierwsza partia = 15 najnowszych (19…5), druga (4…0) bez żadnego wpisu
        for (let i = 0; i < 5; i++) expect(saved.entries[translationKey(`Market headline ${i + 100}`)]).toBeUndefined();
        expect(Object.values(saved.entries).every((e) => 't' in e)).toBe(true);
    });

    it('błąd odczytu słownika → error, bez wywołania API (nie nadpisujemy słownika pustym)', async () => {
        const f = vi.fn(), write = vi.fn();
        const r = await runNewsTranslate(now, f as unknown as typeof fetch, { feed: async () => feed, read: async () => { throw new Error('firestore down'); }, write });
        expect(r.status).toBe('error');
        expect(f).not.toHaveBeenCalled();
        expect(write).not.toHaveBeenCalled();
    });
});
