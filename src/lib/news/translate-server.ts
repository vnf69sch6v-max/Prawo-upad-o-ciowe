// Tłumaczenie zagranicznych newsów — wywołanie DeepSeek i słownik w Firestore. Uruchamiane WYŁĄCZNIE z crona
// `/api/cron/news-translate`; `/api/news` tylko czyta słownik (`readTranslations`). Bez DEEPSEEK_API_KEY → `skipped`.
// Spec: docs/specs/2026-11-03-newsy-tlumaczenie.md.
import { peekServerCache, readServerCacheEntry, setServerCache } from '@/lib/server-cache';
import { DeepseekError, callDeepseek } from '@/lib/news/brief-server';
import { costUsd, DEEPSEEK_MODEL } from '@/lib/news/brief';
import { buildNewsFeed } from '@/lib/news/feed';
import {
    MAX_TRANSLATE_OUTPUT_TOKENS, TRANSLATE_SYSTEM_PROMPT, TRANSLATIONS_DOC,
    buildBatches, entriesFromReply, mergeEntries, parseTranslateJson, pendingItems,
    type TranslationEntry, type TranslationsDoc,
} from '@/lib/news/translate';
import type { NewsItem, NewsResult } from '@/lib/news/types';

/** Feed młodszy niż to bierzemy z cache `news/rss_pl`; starszy — pobieramy RSS sami (bez zapisu feedu). */
const FEED_MAX_AGE_MS = 20 * 60_000;

export interface TranslateRunResult {
    status: 'ok' | 'skipped' | 'partial' | 'error';
    reason?: string;
    /** Pozycje zagraniczne bez wpisu w słowniku przed przebiegiem. */
    pending: number;
    translated: number;
    rejected: number;
    batches: { ok: number; total: number };
    failed: string[];
    costUsd: number;
    tokens: { input: number; output: number };
}

const empty = (status: TranslateRunResult['status'], reason?: string, pending = 0): TranslateRunResult => ({
    status, reason, pending, translated: 0, rejected: 0, batches: { ok: 0, total: 0 }, failed: [], costUsd: 0, tokens: { input: 0, output: 0 },
});

async function currentFeed(): Promise<NewsItem[]> {
    const cached = await readServerCacheEntry<NewsResult>('news', 'rss_pl');
    if (cached?.payload?.items?.length && Date.now() - cached.updatedAt < FEED_MAX_AGE_MS) return cached.payload.items;
    return (await buildNewsFeed()).items;
}

/**
 * Tłumaczy nowe zagraniczne pozycje feedu partiami i zapisuje słownik. Nigdy nie rzuca — wynik idzie do dziennika crona.
 * Błąd całej partii (HTTP, timeout, zły lub ucięty JSON) nic nie zapisuje: te pozycje spróbuje następny przebieg.
 */
export async function runNewsTranslate(
    now = new Date(),
    fetchImpl: typeof fetch = fetch,
    deps: { feed?: () => Promise<NewsItem[]>; read?: () => Promise<TranslationsDoc | null>; write?: (doc: TranslationsDoc) => Promise<void> } = {},
): Promise<TranslateRunResult> {
    const key = process.env.DEEPSEEK_API_KEY?.trim();
    if (!key) return empty('skipped', 'brak DEEPSEEK_API_KEY');

    // Błąd odczytu przerywa przebieg (rethrow): pusty słownik zamiast błędu nadpisałby wszystkie wcześniejsze tłumaczenia.
    const read = deps.read ?? (async () => (await readServerCacheEntry<TranslationsDoc>('news', TRANSLATIONS_DOC, true))?.payload ?? null);
    const write = deps.write ?? ((doc: TranslationsDoc) => setServerCache('news', TRANSLATIONS_DOC, doc, 'deepseek'));
    try {
        const [items, doc] = await Promise.all([(deps.feed ?? currentFeed)(), read()]);
        const pending = pendingItems(items, doc);
        if (!pending.length) return empty('ok', undefined, 0);

        const res = empty('ok', undefined, pending.length);
        const fresh: Record<string, TranslationEntry> = {};
        const at = now.toISOString();
        const batches = buildBatches(pending);
        res.batches.total = batches.length;
        for (const [i, b] of batches.entries()) {
            try {
                const reply = await callDeepseek(key, b.input, MAX_TRANSLATE_OUTPUT_TOKENS, fetchImpl, '', TRANSLATE_SYSTEM_PROMPT);
                res.costUsd += costUsd(reply.usage, now);
                res.tokens.input += reply.usage.prompt_tokens ?? 0;
                res.tokens.output += reply.usage.completion_tokens ?? 0;
                const parsed = parseTranslateJson(reply.content);
                if (!parsed) { res.failed.push(`partia ${i + 1} → niepoprawny JSON`); continue; }
                const entries = entriesFromReply(b.items, parsed, at);
                for (const e of Object.values(entries)) {
                    if ('t' in e) res.translated++;
                    else res.rejected++;
                }
                Object.assign(fresh, entries);
                res.batches.ok++;
            } catch (e) {
                // Ucięta odpowiedź albo `reasoning_content` są już zapłacone — koszt musi trafić do dziennika.
                if (e instanceof DeepseekError) {
                    res.costUsd += costUsd(e.usage, now);
                    res.tokens.input += e.usage.prompt_tokens ?? 0;
                    res.tokens.output += e.usage.completion_tokens ?? 0;
                }
                res.failed.push(`partia ${i + 1} → ${e instanceof Error ? e.message : String(e)}`.slice(0, 120));
            }
        }
        res.costUsd = Math.round(res.costUsd * 1e6) / 1e6;
        if (Object.keys(fresh).length) await write(mergeEntries(doc, fresh, now));
        if (res.batches.ok < res.batches.total) res.status = res.batches.ok ? 'partial' : 'error';
        console.log(`[news-translate] ${res.translated} ok, ${res.rejected} odrzuconych, partie ${res.batches.ok}/${res.batches.total}, $${res.costUsd.toFixed(6)} (${DEEPSEEK_MODEL})`);
        return res;
    } catch (e) {
        return empty('error', e instanceof Error ? e.message : String(e));
    }
}

// ─── Odczyt dla /api/news ───────────────────────────────────

const MEMO_MS = 5 * 60_000;
let memo: { at: number; doc: TranslationsDoc | null } | null = null;

/**
 * Słownik tłumaczeń z pamięci instancji (5 min), żeby `/api/news` nie dokładało odczytu Firestore do każdego żądania.
 * Tłumaczenie z crona pojawia się na stronie najpóźniej po 5 min.
 */
export async function readTranslations(nowMs = Date.now()): Promise<TranslationsDoc | null> {
    if (memo && nowMs - memo.at < MEMO_MS) return memo.doc;
    const doc = await peekServerCache<TranslationsDoc>('news', TRANSLATIONS_DOC);
    memo = { at: nowMs, doc };
    return doc;
}
