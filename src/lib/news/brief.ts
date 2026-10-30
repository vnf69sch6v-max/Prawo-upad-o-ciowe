// Brief dnia / tygodnia (DeepSeek) — część czysta: wejście modelu, walidator liczb, koszt.
// Spec: docs/specs/2026-10-30-brief-deepseek.md. Wywołanie API i zapis: brief-server.ts.
//
// Zasada jak w summary.ts (Grok): model widzi wyłącznie nasze zweryfikowane liczby z digestu
// i publiczne nagłówki; każda liczba w odpowiedzi musi wystąpić w wejściu, inaczej brief
// nie jest publikowany (zostaje poprzedni).
import { WORD_NUMERALS_G, extractNumbers } from '@/lib/news/summary';
import type { DailyDigest } from '@/lib/news/daily';
import type { NewsArchiveItem } from '@/lib/news/archive';
import { META_POINT, ddmm } from '@/lib/news/brief-text';

export { META_POINT, cleanBriefBody, ddmm, normalizeBriefBody, normalizeBriefText } from '@/lib/news/brief-text';

export type BriefKind = 'daily' | 'weekly';

/** Treść briefu — tylko czysty tekst, UI nie renderuje markdownu. */
export interface BriefBody {
    /** Jedno zdanie: najważniejsza teza dnia / tygodnia. */
    teza: string;
    /** Dane z serwisu z wnioskiem (liczba + okres + źródło). */
    dane: string[];
    /** Polska — najważniejsze tematy z wnioskami. */
    polska: string[];
    /** Świat — banki centralne i rynki zagraniczne, co z tego dla Polski. */
    swiat: string[];
    /** Kalendarz publikacji na dziś / bieżący tydzień. */
    kalendarz: string[];
}

export interface BriefDoc {
    kind: BriefKind;
    /** Data Warsaw, na którą brief jest przygotowany (YYYY-MM-DD; tydzień = poniedziałek). */
    date: string;
    /** Data najnowszego digestu, z którego wzięto liczby (dzień: wczoraj). Brak w briefach sprzed 31.10.2026. */
    dataDate?: string;
    generatedAt: string;
    model: string;
    body: BriefBody;
    tokens: { input: number; output: number };
    costUsd: number;
}

// ─── Model i limity ─────────────────────────────────────────

/** api-docs.deepseek.com/quick_start/pricing (2026-10-30): `deepseek-flash` = DeepSeek-V4.1-Flash-1017. */
export const DEEPSEEK_MODEL = 'deepseek-flash';
export const DEEPSEEK_ENDPOINT = 'https://api.deepseek.com/chat/completions';
/** Twardy limit wejścia (szacunek znaki/3 — dla polskiego tekstu raczej zawyżony, czyli bezpieczny). */
export const MAX_INPUT_TOKENS = 12_000;
export const MAX_OUTPUT_TOKENS: Record<BriefKind, number> = { daily: 1200, weekly: 2000 };

export function estimateTokens(text: string): number {
    return Math.ceil(text.length / 3);
}

/** USD za 1M tokenów, `deepseek-flash`. Szczyt: 01–04 i 06–10 UTC, pn–pt (cena ×2). */
const PRICE = {
    offPeak: { hit: 0.003, miss: 0.15, out: 0.6 },
    peak: { hit: 0.006, miss: 0.3, out: 1.2 },
};

export function isDeepseekPeak(at: Date): boolean {
    const day = at.getUTCDay();
    if (day === 0 || day === 6) return false;
    const h = at.getUTCHours();
    return (h >= 1 && h < 4) || (h >= 6 && h < 10);
}

export interface DeepseekUsage {
    prompt_tokens?: number;
    completion_tokens?: number;
    prompt_cache_hit_tokens?: number;
    prompt_cache_miss_tokens?: number;
}

export function costUsd(usage: DeepseekUsage, at: Date): number {
    const p = isDeepseekPeak(at) ? PRICE.peak : PRICE.offPeak;
    const hit = usage.prompt_cache_hit_tokens ?? 0;
    const miss = usage.prompt_cache_miss_tokens ?? Math.max(0, (usage.prompt_tokens ?? 0) - hit);
    const out = usage.completion_tokens ?? 0;
    return Math.round(((hit * p.hit + miss * p.miss + out * p.out) / 1e6) * 1e6) / 1e6;
}

// ─── Wejście ────────────────────────────────────────────────

export const BRIEF_SYSTEM_PROMPT = `Jesteś analitykiem makro serwisu Savori. Piszesz po polsku brief dla inwestora.
Zasady bezwzględne:
1. Używaj WYŁĄCZNIE liczb, które stoją w danych wejściowych, zapisanych tak samo. Niczego nie licz, nie zaokrąglaj, nie szacuj.
2. Źródło liczby to instytucja z wejścia (NBP, GPW, GUS…) — podawaj je tylko, gdy ma znaczenie; nigdy „serwis”.
   Datę odczytu podaj tylko, gdy ma znaczenie, w formie DD.MM.
3. Nagłówki to tylko tytuły i lidy mediów — pisz „media piszą”, „według nagłówków”, nie przedstawiaj ich jako faktów.
4. Wnioski formułuj ostrożnie („może”, „sugeruje”); bez rekomendacji kupna lub sprzedaży.
5. Nie komentuj danych wejściowych ani ich braków (żadnego „brak danych w wejściu”, „nie podano w materiale”,
   „to liczba z nagłówka”). Gdy do sekcji nie ma materiału, zwróć pustą tablicę.
6. Liczby po polsku: przecinek dziesiętny, minus „−”.
7. Odpowiedz wyłącznie obiektem JSON: {"teza": string, "dane": string[], "polska": string[], "swiat": string[], "kalendarz": string[]}.
   teza = jedno zdanie; dane 2–3 wnioski z liczb („co mówią liczby”) — NIE przepisuj wartości po kolei, czytelnik
   widzi je obok w kafelkach; każdą liczbę przywołaj najwyżej raz; polska 2–5;
   swiat 0–4 (co z tego wynika dla Polski lub Japonii); kalendarz 0–5.
   Każdy punkt to 1–2 zdania czystego tekstu, bez markdownu.`;

export interface BriefInputData {
    kind: BriefKind;
    date: string;
    /** Digesty (dzień: dzisiejszy, a bez niego wczorajszy; tydzień: ostatnie 7) — dane i nagłówki PL. */
    digests: DailyDigest[];
    /** Pozycje zagraniczne z archiwum (lang 'en'). */
    world: Pick<NewsArchiveItem, 'title' | 'description' | 'source' | 'region' | 'publishedAt'>[];
    /** Wydarzenia z kalendarza publikacji na dziś / tydzień. */
    calendar: string[];
}

const MAX_PL = { daily: 15, weekly: 25 };
const MAX_WORLD = { daily: 10, weekly: 15 };

/**
 * Składa tekst wejścia. Dane liczbowe nigdy nie są przycinane — gdy tekst przekracza
 * `MAX_INPUT_TOKENS`, najpierw ubywa leadów, potem nagłówków świata, potem PL.
 */
export function buildBriefInput(d: BriefInputData, maxTokens = MAX_INPUT_TOKENS): string {
    const seen = new Set<string>();
    const dane: string[] = [];
    for (const dg of d.digests) {
        for (const m of dg.dane) {
            // Średnik, nie przecinek, po wartości: `joinThousands` celowo nie skleja „10 945,” (przecinek może
            // zaczynać część dziesiętną), więc walidator widział 10 i 945, a model pisał 10945 → każdy brief
            // z mWIG40/sWIG80 ≥ 10 000 był odrzucany (30.10, „liczby spoza wejścia: 10945, 30085”).
            const line = `- ${m.label}: ${m.value}${m.delta ? `; zmiana ${m.delta}` : ''}; ${ddmm(m.readingDate)}${m.source ? `; ${m.source}` : ''}`;
            if (!seen.has(line)) { seen.add(line); dane.push(line); }
        }
    }
    const plSeen = new Set<string>();
    const pl: string[] = [];
    for (const dg of d.digests) {
        for (const p of dg.punkty) {
            if (plSeen.has(p.title)) continue;
            plSeen.add(p.title);
            pl.push(`- „${p.title}” — ${p.source}`);
        }
    }
    let plList = pl.slice(0, MAX_PL[d.kind]);
    let worldList = d.world.slice(0, MAX_WORLD[d.kind]);
    let withLeads = true;

    const render = () => {
        const world = worldList.map((w) => {
            const lead = withLeads && w.description ? ` — ${w.description.slice(0, 200)}` : '';
            return `- „${w.title}” — ${w.source}${w.region ? ` (${w.region})` : ''}${lead}`;
        });
        const okres = d.kind === 'daily' ? `BRIEF NA ${ddmm(d.date)}` : `BRIEF TYGODNIA od ${ddmm(d.date)}`;
        return [
            okres,
            '',
            // Nagłówek bez słowa „serwis” — 30.10 model przepisywał go jako „źródło: serwis Savori”.
            'DANE — wartości zweryfikowane u źródła; instytucja na końcu linii:',
            dane.length ? dane.join('\n') : '(pusto)',
            '',
            'NAGŁÓWKI POLSKICH MEDIÓW:',
            plList.length ? plList.join('\n') : '(pusto)',
            '',
            'NAGŁÓWKI ZAGRANICZNE I KOMUNIKATY BANKÓW CENTRALNYCH (po angielsku):',
            world.length ? world.join('\n') : '(pusto — sekcja „swiat” = [])',
            '',
            d.kind === 'daily' ? 'KALENDARZ — NAJBLIŻSZY DZIEŃ ROBOCZY:' : 'KALENDARZ — NADCHODZĄCY TYDZIEŃ (pn–pt):',
            d.calendar.length ? d.calendar.map((c) => `- ${c}`).join('\n') : '(brak publikacji)',
        ].join('\n');
    };

    let text = render();
    while (estimateTokens(text) > maxTokens) {
        if (withLeads) withLeads = false;
        else if (worldList.length > 0) worldList = worldList.slice(0, -1);
        else if (plList.length > 0) plList = plList.slice(0, -1);
        else break; // zostały same liczby i kalendarz — tych nie tniemy
        text = render();
    }
    return text;
}

// ─── Walidacja odpowiedzi ───────────────────────────────────

export interface BriefAllowed {
    numbers: Set<string>;
    /** Liczebniki słowne z wejścia — jak w `summary.ts`: cytat z nagłówka to nie liczenie przez model. */
    words: Set<string>;
    /** Daty „DD.MM” z wejścia jako liczby (29.10 → 29.1) — mogą się powtarzać między punktami. */
    dates: Set<string>;
}

/** Liczby, których wolno użyć: wszystko z wejścia (także bez znaku) + składniki daty briefu. */
export function collectBriefAllowed(input: string, date: string): BriefAllowed {
    const numbers = new Set<string>();
    for (const n of [...extractNumbers(input), ...extractNumbers(date), ...extractNumbers(ddmm(date))]) {
        numbers.add(n);
        numbers.add(n.replace(/^-/, ''));
    }
    const words = new Set([...input.matchAll(WORD_NUMERALS_G)].map((m) => m[0].toLowerCase()));
    const dates = new Set([...`${input} ${ddmm(date)}`.matchAll(/\b\d{2}\.\d{2}\b/g)].flatMap((m) => extractNumbers(m[0])));
    return { numbers, words, dates };
}

export function parseBriefJson(raw: string): BriefBody | null {
    let obj: unknown;
    try {
        obj = JSON.parse(raw.trim().replace(/^```(?:json)?\s*|\s*```$/g, ''));
    } catch {
        return null;
    }
    if (!obj || typeof obj !== 'object') return null;
    const o = obj as Record<string, unknown>;
    const list = (v: unknown, max: number) =>
        Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string' && x.trim() !== '').map((x) => x.trim().slice(0, 500)).slice(0, max) : [];
    if (typeof o.teza !== 'string' || !o.teza.trim()) return null;
    return {
        teza: o.teza.trim().slice(0, 400),
        dane: list(o.dane, 6),
        polska: list(o.polska, 6),
        swiat: list(o.swiat, 5),
        kalendarz: list(o.kalendarz, 6),
    };
}

export function briefText(b: BriefBody): string {
    return [b.teza, ...b.dane, ...b.polska, ...b.swiat, ...b.kalendarz].join('\n');
}

export function validateBrief(body: BriefBody, allowed: BriefAllowed): { ok: boolean; reason?: string } {
    if (body.dane.length + body.polska.length + body.swiat.length < 3) return { ok: false, reason: 'za mało punktów' };
    const text = briefText(body);
    if (/\*\*|^#{1,6}\s/m.test(text)) return { ok: false, reason: 'markdown' };
    const meta = META_POINT.exec(text);
    if (meta) return { ok: false, reason: `meta: „${meta[0]}”` };
    const obce = extractNumbers(text).filter((n) => !allowed.numbers.has(n));
    if (obce.length) return { ok: false, reason: `liczby spoza wejścia: ${[...new Set(obce)].slice(0, 5).join(', ')}` };
    // Druga bramka jak w `validateSummary`: „trzeci miesiąc z rzędu” nie ma cyfry, a jest liczeniem.
    const obceSlowa = [...text.matchAll(WORD_NUMERALS_G)].map((m) => m[0]).filter((w) => !allowed.words.has(w.toLowerCase()));
    if (obceSlowa.length) return { ok: false, reason: `liczebnik słowny spoza wejścia: „${obceSlowa[0]}”` };
    // „Co mówią liczby” to wnioski, a wartości są w kafelkach obok: liczba przywołana w dwóch punktach
    // `dane` znaczy, że model znowu przepisuje tabelę (brief z 30.10). Daty się nie liczą.
    const seen = new Set<string>();
    for (const point of body.dane) {
        const nums = new Set(extractNumbers(point).map((n) => n.replace(/^-/, '')).filter((n) => !allowed.dates.has(n)));
        for (const n of nums) {
            if (seen.has(n)) return { ok: false, reason: `powtórzenie: ${n}` };
            seen.add(n);
        }
    }
    return { ok: true };
}
