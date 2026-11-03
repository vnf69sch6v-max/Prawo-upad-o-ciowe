// Tłumaczenie zagranicznych newsów (ROADMAP N3) — część czysta: klucz, partie, prompt, walidator, nakładanie.
// Spec: docs/specs/2026-11-03-newsy-tlumaczenie.md. Wywołanie DeepSeek i zapis: translate-server.ts (tylko cron).
//
// Zasada jak w briefie: model nie może niczego dopisać. Każda liczba w tłumaczeniu musi wystąpić
// w oryginale, a pusta lub podejrzana odpowiedź zostawia oryginał — lepiej angielski tytuł niż zmyślony polski.
import { createHash } from 'node:crypto';
import { extractNumbers } from '@/lib/news/summary';
import { estimateTokens } from '@/lib/news/brief';

/** Dokument `news/translations_v1` — kolekcja `news` jest już szyfrowana i objęta sweepem. */
export const TRANSLATIONS_DOC = 'translations_v1';

/** Udane tłumaczenie albo odrzucenie (tego tytułu nie wysyłamy drugi raz — zostaje oryginał). */
export type TranslationEntry =
    | { t: string; l?: string; at: string }
    | { rej: string; at: string; rv?: number };

/**
 * Wersja reguł (prompt + walidator). Odrzucenie zapisane przy innej wersji wraca do kolejki — po poprawce
 * walidatora nie czekamy 14 dni na przycięcie słownika. Dobre tłumaczenia zostają. Podbij przy każdej zmianie reguł.
 */
export const TRANSLATE_RULES_VERSION = 1;

export interface TranslationsDoc {
    entries: Record<string, TranslationEntry>;
}

/** Pozycja, którą umiemy przetłumaczyć — podzbiór `NewsItem`. */
export interface TranslatableItem {
    title: string;
    description: string;
    lang?: string;
}

// ─── Klucz ──────────────────────────────────────────────────

/** Klucz = hash tytułu po ujednoliceniu białych znaków: ten sam tytuł z dwóch odświeżeń feedu = jedno tłumaczenie. */
export function translationKey(title: string): string {
    const norm = title.normalize('NFKC').replace(/\s+/g, ' ').trim().toLowerCase();
    return createHash('sha256').update(norm).digest('hex').slice(0, 16);
}

const isForeign = (it: { lang?: string }) => (it.lang ?? 'pl') !== 'pl';

const isDone = (e: TranslationEntry | undefined) => !!e && ('t' in e || e.rv === TRANSLATE_RULES_VERSION);

/**
 * Zagraniczne pozycje bez wpisu w słowniku (ani tłumaczenia, ani odrzucenia przy bieżących regułach), bez duplikatów
 * tytułu. Banki centralne pierwsze, potem najnowsze — gdy partii zabraknie, czekają mniej ważne.
 */
export function pendingItems<T extends TranslatableItem & { section?: string; publishedAt?: string }>(items: T[], doc: TranslationsDoc | null): T[] {
    const seen = new Set<string>();
    const out: T[] = [];
    for (const it of items) {
        if (!isForeign(it) || !it.title.trim()) continue;
        const k = translationKey(it.title);
        if (seen.has(k) || isDone(doc?.entries[k])) continue;
        seen.add(k);
        out.push(it);
    }
    return out.sort((a, b) =>
        Number(b.section === 'banki') - Number(a.section === 'banki') || (b.publishedAt ?? '').localeCompare(a.publishedAt ?? ''));
}

// ─── Partie i prompt ────────────────────────────────────────

export const BATCH_SIZE = 15;
/** Twardy limit wejścia jednej partii (szacunek znaki/3 jak w briefie). */
export const MAX_BATCH_INPUT_TOKENS = 4000;
export const MAX_TRANSLATE_OUTPUT_TOKENS = 3000;
/** 3 × 15 = 45 ≥ `MAX_FOREIGN_ITEMS` (40) — jeden przebieg może przetłumaczyć cały zagraniczny feed. */
export const MAX_BATCHES = 3;
const LEAD_INPUT_CHARS = 300;
export const MAX_LEAD_CHARS = 220;

export const TRANSLATE_SYSTEM_PROMPT = `Tłumaczysz nagłówki zagranicznych mediów ekonomicznych i komunikaty banków centralnych na polski dla serwisu makroekonomicznego.
Zasady bezwzględne:
1. Tłumacz wiernie, niczego nie dodawaj i nie interpretuj. Nazwy własne (Fed, ECB → EBC, BOJ, Bank of England) zostaw lub podaj w polskiej formie.
2. Liczby przepisz dokładnie z oryginału, cyframi. Niczego nie przeliczaj (bez zamiany walut, jednostek, procentów na ułamki). Polski zapis: przecinek dziesiętny („2,5%”), „mld”, „mln”.
3. "t" = tytuł po polsku, jedno zdanie, bez cudzysłowów wokół całości.
4. "l" = krótki lead po polsku: jedno zdanie, najwyżej 200 znaków, wyłącznie z treści opisu. Gdy opis jest pusty lub nic nie wnosi — pusty napis "".
5. Bez komentarzy, bez markdownu. Odpowiedz wyłącznie obiektem JSON: {"items":[{"id": "1", "t": "...", "l": "..."}]} — po jednym obiekcie na każdą pozycję wejścia, z tym samym id.`;

export interface TranslateBatch<T> {
    items: T[];
    input: string;
}

function renderItem(i: number, it: TranslatableItem): string {
    const lead = it.description.replace(/\s+/g, ' ').trim().slice(0, LEAD_INPUT_CHARS);
    return `[${i + 1}] TYTUŁ: ${it.title.replace(/\s+/g, ' ').trim()}\nOPIS: ${lead || '(brak)'}`;
}

/** Dzieli pozycje na partie: najwyżej `BATCH_SIZE` pozycji i `MAX_BATCH_INPUT_TOKENS` szacowanych tokenów (z promptem). */
export function buildBatches<T extends TranslatableItem>(items: T[], maxBatches = MAX_BATCHES): TranslateBatch<T>[] {
    const budget = MAX_BATCH_INPUT_TOKENS - estimateTokens(TRANSLATE_SYSTEM_PROMPT);
    const batches: TranslateBatch<T>[] = [];
    let cur: T[] = [];
    let parts: string[] = [];
    const flush = () => {
        if (cur.length) batches.push({ items: cur, input: parts.join('\n\n') });
        cur = [];
        parts = [];
    };
    for (const it of items) {
        if (cur.length >= BATCH_SIZE || (cur.length && estimateTokens([...parts, renderItem(cur.length, it)].join('\n\n')) > budget)) {
            flush();
            if (batches.length >= maxBatches) break;
        }
        const part = renderItem(cur.length, it);
        // Pojedyncza pozycja ponad budżet (nie powinna się zdarzyć: tytuł + 300 zn.) — pomijamy, nie łamiemy limitu.
        if (estimateTokens(part) > budget) continue;
        cur.push(it);
        parts.push(part);
    }
    if (batches.length < maxBatches) flush();
    return batches;
}

// ─── Walidacja ──────────────────────────────────────────────

/** Angielskie separatory tysięcy („1,200”, „12,500,000”) → bez separatora, żeby oryginał i „1200” / „1 200” dały tę samą liczbę. */
export function normalizeEnglishNumbers(text: string): string {
    let out = text;
    let prev: string;
    do {
        prev = out;
        out = out.replace(/(\d),(\d{3})(?!\d)/g, '$1$2');
    } while (out !== prev);
    return out;
}

/** Liczby bez znaku: „−0,3%” w tłumaczeniu i „-0.3%” / „down 0.3%” w oryginale to ta sama wartość. */
const unsigned = (text: string) => extractNumbers(text).map((n) => n.replace(/^-/, ''));

/** Liczby, których wolno użyć w tłumaczeniu pozycji: wszystko z tytułu i opisu oryginału. */
export function allowedNumbers(it: TranslatableItem): Set<string> {
    return new Set(unsigned(normalizeEnglishNumbers(`${it.title} ${it.description}`)));
}

const FOREIGN_SCRIPT = /[Ѐ-ӿ぀-ヿ㐀-鿿가-힯]/;
const META = /(tłumaczeni[ea]\s*:|przetłumacz|nie mogę|nie jestem w stanie|as an ai|translation\s*:|i cannot|i can't)/i;
const MARKDOWN = /\*\*|^#{1,6}\s|`/m;

/** Powód odrzucenia jednego tekstu albo null, gdy tekst jest do przyjęcia. */
export function suspicious(pl: string, original: string, allowed: Set<string>, kind: 'title' | 'lead'): string | null {
    const s = pl.trim();
    if (!s) return 'pusta';
    if (FOREIGN_SCRIPT.test(s) && !FOREIGN_SCRIPT.test(original)) return 'obce pismo';
    if (MARKDOWN.test(s)) return 'markdown';
    if (META.test(s)) return 'meta-komentarz';
    if (kind === 'title') {
        if (/[\r\n]/.test(s)) return 'nowa linia';
        if (s.toLowerCase() === original.trim().toLowerCase()) return 'bez tłumaczenia';
        const len = original.trim().length;
        if (s.length > 3 * len + 20 || s.length < 0.3 * len) return 'długość';
    } else if (s.length > MAX_LEAD_CHARS) return 'lead za długi';
    const nums = unsigned(s);
    const obce = nums.filter((n) => !allowed.has(n));
    if (obce.length) return `liczba spoza oryginału: ${obce[0]}`;
    if (kind === 'title') {
        // Tytuł bez „0.25%” z oryginału wprowadza w błąd tak samo jak obca liczba (dopisek PM). Lead to skrót — tam nie.
        const have = new Set(nums);
        const brak = unsigned(normalizeEnglishNumbers(original)).find((n) => !have.has(n));
        if (brak) return `brak liczby z oryginału: ${brak}`;
    }
    return null;
}

/** Obiekt JSON odpowiedzi → mapa id → {t, l}. Zły JSON = null (cała partia do ponowienia w następnym przebiegu). */
export function parseTranslateJson(raw: string): Map<string, { t: string; l: string }> | null {
    let obj: unknown;
    try {
        obj = JSON.parse(raw.trim().replace(/^```(?:json)?\s*|\s*```$/g, ''));
    } catch {
        return null;
    }
    const items = (obj as { items?: unknown })?.items;
    if (!Array.isArray(items)) return null;
    const out = new Map<string, { t: string; l: string }>();
    for (const x of items) {
        if (!x || typeof x !== 'object') continue;
        const r = x as Record<string, unknown>;
        const id = typeof r.id === 'number' ? String(r.id) : typeof r.id === 'string' ? r.id.trim() : '';
        if (!id) continue;
        out.set(id, { t: typeof r.t === 'string' ? r.t : '', l: typeof r.l === 'string' ? r.l : '' });
    }
    return out;
}

/**
 * Odpowiedź modelu dla partii → wpisy słownika. Podejrzany tytuł → `rej` z bieżącym `rv` (zostaje oryginał).
 * Pozycja, której model nie zwrócił, nie dostaje wpisu — spróbuje następny przebieg. Zły lead przy dobrym tytule → sam tytuł.
 */
export function entriesFromReply<T extends TranslatableItem>(
    batch: T[],
    reply: Map<string, { t: string; l: string }>,
    at: string,
): Record<string, TranslationEntry> {
    const out: Record<string, TranslationEntry> = {};
    batch.forEach((it, i) => {
        const k = translationKey(it.title);
        const r = reply.get(String(i + 1));
        if (!r) return;
        const allowed = allowedNumbers(it);
        const t = r.t.trim().replace(/^[„"“]+|[”"]+$/g, '').trim();
        const bad = suspicious(t, it.title, allowed, 'title');
        if (bad) { out[k] = { rej: bad, at, rv: TRANSLATE_RULES_VERSION }; return; }
        const l = r.l.trim();
        const leadOk = !!l && !!it.description.trim() && !suspicious(l, it.description, allowed, 'lead');
        out[k] = leadOk ? { t, l, at } : { t, at };
    });
    return out;
}

// ─── Słownik ────────────────────────────────────────────────

export const MAX_ENTRIES = 600;
export const ENTRY_MAX_AGE_DAYS = 14;

/** Scala nowe wpisy i przycina: najwyżej 14 dni i 600 najnowszych (dokument Firestore ma limit 1 MiB). */
export function mergeEntries(
    prev: TranslationsDoc | null,
    fresh: Record<string, TranslationEntry>,
    now: Date,
): TranslationsDoc {
    const minAt = new Date(now.getTime() - ENTRY_MAX_AGE_DAYS * 86_400_000).toISOString();
    const all = Object.entries({ ...(prev?.entries ?? {}), ...fresh })
        .filter(([, e]) => e.at >= minAt)
        .sort((a, b) => b[1].at.localeCompare(a[1].at))
        .slice(0, MAX_ENTRIES);
    return { entries: Object.fromEntries(all) };
}

/**
 * Nakłada tłumaczenia na pozycje feedu (`titlePl`, `leadPl`). Polskich pozycji nie dotyka;
 * bez słownika albo bez wpisu pozycja zostaje taka jak była.
 */
export function applyTranslations<T extends TranslatableItem>(items: T[], doc: TranslationsDoc | null): (T & { titlePl?: string; leadPl?: string })[] {
    if (!doc) return items;
    return items.map((it) => {
        if (!isForeign(it)) return it;
        const e = doc.entries[translationKey(it.title)];
        if (!e || !('t' in e)) return it;
        return e.l ? { ...it, titlePl: e.t, leadPl: e.l } : { ...it, titlePl: e.t };
    });
}
