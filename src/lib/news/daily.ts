// Daily Digest — czysta funkcja bez sieci (Etap 1).
// Wejście: surowe pozycje z archiwum + data + opcjonalny blok makro.
// Ranking liczony od zera (cluster → score → normalizacja), bez zaniku świeżości.

import { generateMacroCalendar, type MacroEvent } from '@/lib/calendar';
import { clusterNews } from '@/lib/news/cluster';
import { scoreItem, isSelfPromo } from '@/lib/news/score';
import { collapseClusters, matchesTopic, type NewsTopic } from '@/lib/news/match';
import { NEWS_SOURCES, type NewsOwner } from '@/lib/news/sources';
import { nextCalendarDate } from '@/lib/news/warsaw-date';
import type { NewsItem } from '@/lib/news/types';

const TOPICS: NewsTopic[] = ['ceny', 'gospodarka', 'praca', 'rynki'];
const MIN_POINTS = 6;
const MAX_POINTS = 8;
const MAX_PER_OWNER = 2;

const OWNER_OF = new Map(NEWS_SOURCES.map((s) => [s.id, s.owner]));

export interface MacroChange {
    id: string;
    label: string;
    value: string;
    /** Zmiana względem poprzedniego odczytu (np. „+0,3 pp", „−1,2%"). */
    delta?: string;
    unit?: string;
    /** Data odczytu / publikacji (YYYY-MM-DD). */
    readingDate: string;
    href?: string;
}

export interface DailyDigestPoint {
    title: string;
    link: string;
    source: string;
    section: string;
    publishedAt: string;
    description: string;
    importance: number;
    corroboration: number;
    wire?: boolean;
    alsoIn?: string[];
    topics: NewsTopic[];
}

export interface DailyDigestTomorrowEvent {
    name: string;
    type: MacroEvent['type'];
    importance: MacroEvent['importance'];
}

export interface DailyDigestTomorrow {
    date: string;
    events: DailyDigestTomorrowEvent[];
}

/**
 * Akapit „o czym dziś pisano" (Warstwa 2).
 *
 * ⚠ NAZEWNICTWO: to podsumowanie TYTUŁÓW, nie wydarzeń. Nie mamy treści artykułów
 * (świadomie nie scrapujemy — paywalle i prawo autorskie), więc model widzi wyłącznie
 * nagłówki i lidy. Nie podpisujcie tego w UI jako „co się wydarzyło".
 * Wyjątkiem jest blok `dane` — CPI/WIG20/kursy pochodzą wprost z GUS/NBP/Yahoo.
 */
export interface DigestSummary {
    text: string;
    /** `szablon` = złożony deterministycznie; `model` = wygenerowany i PRZEPUSZCZONY przez walidator. */
    origin: 'model' | 'szablon';
    /** ID modelu, gdy origin === 'model'. */
    model?: string;
    /** Powód odrzucenia generacji — bez tego zły akapit jest niediagnozowalny. */
    rejectedReason?: string;
    /**
     * Zużycie tokenów ostatniego wywołania — zapisywane, żeby dało się pilnować kosztu
     * z historii digestów, bez wchodzenia do konsoli dostawcy.
     * ⚠ `reasoning` xAI dolicza OSOBNO do `output`, nie zawiera go w nim.
     */
    tokens?: { input: number; output: number; reasoning: number };
    /**
     * Wejście, z którego powstał tekst. OBOWIĄZKOWE przy origin === 'model' — inaczej nie da się
     * odróżnić halucynacji modelu od śmieci, które dostał.
     */
    input?: { titles: string[]; numbers: string[] };
}

export interface DailyDigest {
    date: string;
    generatedAt: string;
    punkty: DailyDigestPoint[];
    /** „Co się zmieniło w liczbach" — Etap 2; domyślnie puste. */
    dane: MacroChange[];
    jutro: DailyDigestTomorrow;
    /** Akapit nad listą punktów (Warstwa 2). Opcjonalny — brak nie psuje digestu. */
    podsumowanie?: DigestSummary;
}

function ownerOfItem(it: Pick<NewsItem, 'sourceId'> & { owner?: NewsOwner }): NewsOwner {
    return it.owner ?? OWNER_OF.get(it.sourceId) ?? 'bonnier';
}

/** Przelicza ranking na paczce — freshness wyłączony (`now = publishedAt`). */
export function rankDigestItems(items: NewsItem[]): NewsItem[] {
    const cloned = items.map((it) => ({ ...it }));
    const withOwner = cloned.map((it) => ({
        ...it,
        owner: ownerOfItem(it as NewsItem & { owner?: NewsOwner }),
    }));

    const clusters = clusterNews(withOwner);
    const scored = cloned.map(() => ({ raw: 0, cluster: null as (typeof clusters)[number] | null }));

    for (const [ci, c] of clusters.entries()) {
        for (const i of c.members) {
            const pubMs = new Date(cloned[i].publishedAt).getTime();
            const res = scoreItem({
                item: cloned[i],
                clusterWeight: c.weight,
                isFirst: i === c.firstIndex,
                owner: withOwner[i].owner,
                now: pubMs,
            });
            scored[i].raw = res.raw;
            scored[i].cluster = c;
            cloned[i].clusterId = ci;
            cloned[i].isAd = res.ad;
            cloned[i].clickbait = res.clickbait;
            cloned[i].isOpinion = res.opinion;
        }
    }

    const max = Math.max(...scored.map((s) => s.raw), 1e-9);
    for (let i = 0; i < cloned.length; i++) {
        const c = scored[i].cluster;
        cloned[i].importance = Math.round((scored[i].raw / max) * 100);
        cloned[i].corroboration = c ? c.independentReports : 1;
        cloned[i].wire = c ? c.wire : false;
        cloned[i].alsoIn = c
            ? [...new Set(c.members.filter((m) => m !== i).map((m) => cloned[m].source))].slice(0, 4)
            : [];
    }

    return cloned;
}

function passesQualityGate(it: NewsItem): boolean {
    if (it.isAd) return false;
    if (it.clickbait === 'strong') return false;
    if (isSelfPromo(it)) return false;
    return true;
}

function canAdd(it: NewsItem, selected: NewsItem[], ownerCount: Map<NewsOwner, number>): boolean {
    if (selected.some((s) => s.link === it.link)) return false;
    const owner = ownerOfItem(it as NewsItem & { owner?: NewsOwner });
    return (ownerCount.get(owner) ?? 0) < MAX_PER_OWNER;
}

function recordAdd(it: NewsItem, selected: NewsItem[], ownerCount: Map<NewsOwner, number>): void {
    selected.push(it);
    const owner = ownerOfItem(it as NewsItem & { owner?: NewsOwner });
    ownerCount.set(owner, (ownerCount.get(owner) ?? 0) + 1);
}

/** Wybór 6–8 punktów: zwinięte klastry, filtry jakości, max 2/właściciel, opcjonalnie ≥1/temat. */
export function selectDigestPoints(items: NewsItem[]): NewsItem[] {
    if (items.length === 0) return [];

    const ranked = rankDigestItems(items);
    const pool = collapseClusters(ranked)
        .filter(passesQualityGate)
        .sort((a, b) => (b.importance ?? 0) - (a.importance ?? 0));

    const selected: NewsItem[] = [];
    const ownerCount = new Map<NewsOwner, number>();

    for (const it of pool) {
        if (selected.length >= MAX_POINTS) break;
        if (!canAdd(it, selected, ownerCount)) continue;
        recordAdd(it, selected, ownerCount);
    }

    // Opcjonalna różnorodność tematów — nie psujemy limitu właściciela.
    for (const topic of TOPICS) {
        if (selected.length >= MAX_POINTS) break;
        if (selected.some((it) => matchesTopic(it, topic))) continue;
        const candidate = pool.find(
            (it) => matchesTopic(it, topic) && canAdd(it, selected, ownerCount),
        );
        if (candidate) recordAdd(candidate, selected, ownerCount);
    }

    // Dopełnij do MIN_POINTS jeśli mamy zapas w puli.
    if (selected.length < MIN_POINTS) {
        for (const it of pool) {
            if (selected.length >= MIN_POINTS) break;
            if (!canAdd(it, selected, ownerCount)) continue;
            recordAdd(it, selected, ownerCount);
        }
    }

    return selected
        .sort((a, b) => (b.importance ?? 0) - (a.importance ?? 0))
        .slice(0, MAX_POINTS);
}

export function topicsForItem(it: Pick<NewsItem, 'title' | 'description'>): NewsTopic[] {
    return TOPICS.filter((t) => matchesTopic(it, t));
}

export function toDigestPoint(it: NewsItem): DailyDigestPoint {
    return {
        title: it.title,
        link: it.link,
        source: it.source,
        section: it.section,
        publishedAt: it.publishedAt,
        description: it.description ?? '',
        importance: it.importance ?? 0,
        corroboration: it.corroboration ?? 1,
        wire: it.wire,
        alsoIn: it.alsoIn,
        topics: topicsForItem(it),
    };
}

/** Blok „Jutro" — publikacje makro na następny dzień kalendarzowy względem `date`. */
export function buildTomorrowBlock(date: string): DailyDigestTomorrow {
    const tomorrow = nextCalendarDate(date);
    const year = parseInt(date.slice(0, 4), 10);
    const events = [...generateMacroCalendar(year), ...generateMacroCalendar(year + 1)]
        .filter((e) => e.date === tomorrow)
        .map((e) => ({
            name: e.name,
            type: e.type,
            importance: e.importance,
        }));
    return { date: tomorrow, events };
}

/**
 * Główna funkcja digestu — pure, bez I/O.
 * `macro` wstrzykiwane z Etap 2 (daily-macro.ts); domyślnie puste `dane`.
 */
export function buildDailyDigest(
    items: NewsItem[],
    date: string,
    macro: MacroChange[] = [],
): DailyDigest {
    const punkty = selectDigestPoints(items).map(toDigestPoint);
    return {
        date,
        generatedAt: new Date().toISOString(),
        punkty,
        dane: macro,
        jutro: buildTomorrowBlock(date),
    };
}

/** Etykieta UI: NIE „potwierdzone" — tylko „N niezależnych relacji". */
export function corroborationLabel(n: number): string | null {
    if (n < 2) return null;
    return n === 2 ? '2 niezależne relacje' : `${n} niezależne relacje`;
}
