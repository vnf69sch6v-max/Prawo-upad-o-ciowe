// Brief DeepSeek — wywołanie API, retry, zapis do Firestore. Uruchamiane WYŁĄCZNIE z crona
// `/api/cron/brief`; strona czyta gotowy dokument (`readBrief`). Bez DEEPSEEK_API_KEY → `skipped`.
import { peekServerCache, setServerCache } from '@/lib/server-cache';
import { readDailyDigest } from '@/lib/news/digest-store';
import { readNewsArchive, type NewsArchiveItem } from '@/lib/news/archive';
import { buildTomorrowBlock, type DailyDigest } from '@/lib/news/daily';
import { nextCalendarDate, prevCalendarDate, warsawDateKey } from '@/lib/news/warsaw-date';
import {
    BRIEF_SYSTEM_PROMPT, DEEPSEEK_ENDPOINT, DEEPSEEK_MODEL, MAX_OUTPUT_TOKENS,
    buildBriefInput, cleanBriefBody, collectBriefAllowed, costUsd, normalizeBriefBody, parseBriefJson, validateBrief, ddmm,
    type BriefDoc, type BriefKind, type DeepseekUsage,
} from '@/lib/news/brief';

const TIMEOUT_MS = 30_000;
const ATTEMPTS = 2;

/** `digest/brief_daily_v1` i `digest/brief_weekly_v1` — kolekcja `digest` jest już objęta szyfrowaniem i sweepem. */
export const briefDocId = (kind: BriefKind) => `brief_${kind}_v1`;

export async function readBrief(kind: BriefKind): Promise<BriefDoc | null> {
    return peekServerCache<BriefDoc>('digest', briefDocId(kind));
}

export interface DeepseekReply {
    content: string;
    usage: DeepseekUsage;
}

/** Jedno wywołanie DeepSeek, tryb bez rozumowania (`thinking: disabled`), odpowiedź JSON. */
export async function callDeepseek(
    key: string,
    user: string,
    maxTokens: number,
    fetchImpl: typeof fetch = fetch,
    /** Powód odrzucenia poprzedniej próby — model dostaje szansę poprawki zamiast losować od nowa. */
    feedback = '',
): Promise<DeepseekReply> {
    const res = await fetchImpl(DEEPSEEK_ENDPOINT, {
        method: 'POST',
        headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
            model: DEEPSEEK_MODEL,
            messages: [
                { role: 'system', content: BRIEF_SYSTEM_PROMPT },
                { role: 'user', content: feedback ? `${user}\n\nPOPRZEDNIA ODPOWIEDŹ ODRZUCONA: ${feedback}. Napisz brief od nowa, używając wyłącznie liczb z danych.` : user },
            ],
            thinking: { type: 'disabled' },
            response_format: { type: 'json_object' },
            max_tokens: maxTokens,
            temperature: 0.3,
            stream: false,
        }),
        signal: AbortSignal.timeout(TIMEOUT_MS),
        cache: 'no-store',
    });
    if (!res.ok) throw new Error(`DeepSeek HTTP ${res.status}`);
    const json = (await res.json()) as {
        choices?: { message?: { content?: string; reasoning_content?: string } }[];
        usage?: DeepseekUsage;
    };
    const msg = json.choices?.[0]?.message;
    // Rozumowanie miało być wyłączone — jeśli wróciło, płacimy za tokeny, których nie chcieliśmy.
    if (msg?.reasoning_content) throw new Error('DeepSeek zwrócił reasoning_content (thinking nie wyłączony)');
    if (!msg?.content) throw new Error('DeepSeek: pusta odpowiedź');
    return { content: msg.content, usage: json.usage ?? {} };
}

export interface BriefRunResult {
    kind: BriefKind;
    status: 'ok' | 'skipped' | 'rejected' | 'error';
    reason?: string;
    costUsd: number;
    tokens?: { input: number; output: number };
}

/**
 * Dzienny: WYŁĄCZNIE dzisiejszy digest (cron 17:20 UTC idzie po `news-digest`). Bez fallbacku na wczoraj —
 * wczorajszy brief już go opisuje, płacilibyśmy drugi raz za ten sam dzień; brak digestu = `error`.
 * Tygodniowy (niedziela): 7 ostatnich dni łącznie z dzisiejszym. Najnowszy pierwszy — `dataDate` = `[0].date`.
 */
async function gatherDigests(kind: BriefKind, today: string): Promise<DailyDigest[]> {
    const days: string[] = [];
    let d = today;
    for (let i = 0; i < (kind === 'daily' ? 1 : 7); i++) {
        days.push(d);
        d = prevCalendarDate(d);
    }
    const docs = await Promise.all(days.map((day) => readDailyDigest(day)));
    return docs.filter((x): x is DailyDigest => !!x && (x.punkty.length > 0 || x.dane.length > 0));
}

async function gatherWorld(today: string): Promise<NewsArchiveItem[]> {
    const docs = await Promise.all([readNewsArchive(today), readNewsArchive(prevCalendarDate(today))]);
    const items = docs.flatMap((doc) => doc?.items ?? []).filter((it) => it.lang === 'en');
    // Banki centralne pierwsze, potem najnowsze.
    return items.sort((a, b) =>
        Number(b.section === 'banki') - Number(a.section === 'banki') || b.publishedAt.localeCompare(a.publishedAt),
    );
}

const isWorkday = (day: string) => {
    const wd = new Date(`${day}T12:00:00Z`).getUTCDay();
    return wd !== 0 && wd !== 6;
};

/**
 * Brief powstaje wieczorem, gdy dzisiejsze publikacje już wyszły — kalendarz patrzy do przodu:
 * dzienny = najbliższy dzień roboczy, tygodniowy (niedziela) = pn–pt nadchodzącego tygodnia.
 */
export function gatherCalendar(kind: BriefKind, today: string): string[] {
    const out: string[] = [];
    let day = nextCalendarDate(today);
    let workdays = 0;
    while (workdays < (kind === 'daily' ? 1 : 5)) {
        if (isWorkday(day)) {
            workdays++;
            for (const ev of buildTomorrowBlock(prevCalendarDate(day)).events) out.push(`${ddmm(day)} · ${ev.name}`);
        }
        day = nextCalendarDate(day);
    }
    return out;
}

/** Generuje i zapisuje brief. Nigdy nie rzuca — wynik idzie do dziennika crona. */
export async function runBrief(kind: BriefKind, now = new Date(), fetchImpl: typeof fetch = fetch): Promise<BriefRunResult> {
    const key = process.env.DEEPSEEK_API_KEY?.trim();
    if (!key) return { kind, status: 'skipped', reason: 'brak DEEPSEEK_API_KEY', costUsd: 0 };

    const today = warsawDateKey(now);
    try {
        const [digests, world] = await Promise.all([gatherDigests(kind, today), gatherWorld(today)]);
        // Klucz jest, a digestu brak → to awaria (cron `news-digest`), nie wyłączona funkcja: `skipped`
        // dałoby zielone 0/0 w `/status`, choć briefu nie ma.
        if (!digests.length) return { kind, status: 'error', reason: `brak digestu ${today}`, costUsd: 0 };

        const input = buildBriefInput({ kind, date: today, digests, world, calendar: gatherCalendar(kind, today) });
        const allowed = collectBriefAllowed(input, today);

        let cost = 0;
        let reason = '';
        let feedback = '';
        for (let attempt = 0; attempt < ATTEMPTS; attempt++) {
            try {
                const reply = await callDeepseek(key, input, MAX_OUTPUT_TOKENS[kind], fetchImpl, feedback);
                cost += costUsd(reply.usage, now);
                const tokens = { input: reply.usage.prompt_tokens ?? 0, output: reply.usage.completion_tokens ?? 0 };
                const parsed = parseBriefJson(reply.content);
                if (!parsed) { reason = 'niepoprawny JSON'; continue; }
                const body = cleanBriefBody(normalizeBriefBody(parsed));
                if (!body) { reason = 'meta: teza komentuje wejście'; continue; }
                const v = validateBrief(body, allowed);
                if (!v.ok) { reason = v.reason ?? 'walidacja'; feedback = reason; continue; }

                const doc: BriefDoc = {
                    kind, date: today, dataDate: digests[0].date, generatedAt: now.toISOString(), model: DEEPSEEK_MODEL,
                    body, tokens, costUsd: cost,
                };
                await setServerCache('digest', briefDocId(kind), doc, 'deepseek');
                console.log(`[brief] ${kind} ${today}: ok, ${tokens.input}+${tokens.output} tok, $${cost.toFixed(6)}`);
                return { kind, status: 'ok', costUsd: cost, tokens };
            } catch (e) {
                reason = e instanceof Error ? e.message : String(e);
            }
        }
        console.error(`[brief] ${kind} ${today}: odrzucony (${reason}), $${cost.toFixed(6)}`);
        return { kind, status: 'rejected', reason, costUsd: cost };
    } catch (e) {
        return { kind, status: 'error', reason: e instanceof Error ? e.message : String(e), costUsd: 0 };
    }
}
