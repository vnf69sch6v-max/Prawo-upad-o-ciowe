'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { ArrowRight, Bot } from 'lucide-react';
import { useDailyDigest } from '@/lib/hooks';
import type { DailyDigest, DigestSummary, MacroChange } from '@/lib/news/daily';
import { KpiTiles } from '@/components/ui/KpiTiles';
import { warsawDateKey, prevCalendarDate } from '@/lib/news/warsaw-date';
import { formatDate } from '@/lib/formatters';

/**
 * Akapit „o czym dziś pisano" — jedno miejsce renderowania dla `/podsumowanie`, `/newsy`
 * i Przeglądu. Wydzielone z `podsumowanie/page.tsx`, żeby trzy strony nie rozjechały się
 * w treści stopki — a to ona niesie oznaczenie pochodzenia, więc rozjazd byłby kosztowny.
 *
 * ⚠ OZNACZENIE POCHODZENIA JEST OBOWIĄZKOWE i pokazujemy je niezależnie od tego, czy tekst
 * napisał model, czy złożył szablon. Powód ten sam, dla którego stopka `/newsy` mówi wprost,
 * że etykiety nadaje automat: oznaczanie tylko CZĘŚCI treści uwiarygodnia resztę
 * (implied truth effect — Pennycook i in. 2020).
 *
 * ⚠ Mówimy „o czym pisano", nie „co się wydarzyło" — akapit powstaje z TYTUŁÓW, nie z treści
 * artykułów (świadomie ich nie scrapujemy). Liczby to osobna sprawa: pochodzą z GUS/NBP/GPW.
 */

const FOOT_MODEL = 'Akapit napisany automatycznie na podstawie tytułów artykułów. Liczby pochodzą z GUS, NBP i GPW.';
const FOOT_TEMPLATE = 'Akapit złożony automatycznie z najważniejszego tematu i odczytów wskaźników. Liczby pochodzą z GUS, NBP i GPW.';

interface SummaryCardProps {
    summary: DigestSummary;
    /** Data digestu — pokazujemy ją TYLKO gdy akapit nie jest z dziś (patrz `DailySummaryCard`). */
    staleDate?: string;
    /** Link do pełnego podsumowania; zbędny na samej stronie `/podsumowanie`. */
    href?: string;
    /** Wersja do pasa na stronie z newsami — mniejszy padding i typografia. */
    compact?: boolean;
    /** Liczby dnia jako kafelki KPI nad akapitem (zamiast „W liczbach: …” w tekście). */
    dane?: MacroChange[];
}

/**
 * Sama treść akapitu ze stopką pochodzenia, bez nagłówka i ramki — do wstawienia w kartę,
 * która ma już własny tytuł (np. „Podsumowanie dnia" na Przeglądzie). Stopka mieszka TYLKO
 * tutaj, żeby jej brzmienie nie rozjechało się między stronami.
 */
/**
 * Szablon sprzed 31.10.2026 kończył się „W liczbach: …”. Gdy obok stoją kafelki KPI, ta część
 * dublowałaby je (i to w starym formacie „-0.56%”), więc ją odcinamy. Tekst modelu zostaje bez zmian.
 */
function proseOnly(summary: DigestSummary): string {
    if (summary.origin === 'model') return summary.text;
    return summary.text.replace(/\s*W liczbach:[\s\S]*$/, '').trim();
}

export function SummaryBody({ summary, compact = false, withTiles = false }: { summary: DigestSummary; compact?: boolean; withTiles?: boolean }) {
    const text = withTiles ? proseOnly(summary) : summary.text;
    return (
        <>
            <p className={`max-w-[70ch] leading-relaxed text-mk-text ${compact ? 'text-sm' : 'text-base'}`}>{text}</p>
            <p className="mt-3 flex items-start gap-1.5 text-xs text-mk-muted">
                <Bot size={13} className="mt-0.5 shrink-0" aria-hidden />
                <span>{summary.origin === 'model' ? FOOT_MODEL : FOOT_TEMPLATE}</span>
            </p>
        </>
    );
}

export function SummaryCard({ summary, staleDate, href, compact = false, dane }: SummaryCardProps) {
    return (
        <section className={`mk-card mk-card-editorial ${compact ? 'mk-card-pad-compact' : 'mk-card-pad'}`}>
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <h2 className="mk-section-label">
                    {staleDate ? `O czym pisano ${formatDate(staleDate)}` : 'O czym dziś pisano'}
                </h2>
                {href && (
                    <Link href={href} className="mk-press inline-flex min-h-6 items-center gap-1 text-xs font-medium text-mk-brand hover:underline touch:-my-2.5 touch:min-h-11 touch:text-sm">
                        Całe podsumowanie <ArrowRight size={13} aria-hidden />
                    </Link>
                )}
            </div>
            {dane && dane.length > 0 && <KpiTiles items={dane} className="mb-4" />}
            <SummaryBody summary={summary} compact={compact} withTiles={!!dane?.length} />
        </section>
    );
}

/**
 * Samodzielna wersja: bierze akapit z digestu dnia, a gdy dzisiejszego jeszcze nie ma —
 * sięga po wczorajszy i JAWNIE podpisuje go datą.
 *
 * Bez tego fallbacku strona z newsami byłaby bez akapitu przez cały dzień, bo digest buduje się
 * dopiero o 18:05. Ten sam wzorzec „dziś, a jak nie ma — wczoraj" stosuje już `CategoryNews`.
 * Gdy nie ma ani jednego — nie renderujemy nic. Pusta karta „brak podsumowania" byłaby gorsza
 * niż jej brak, tak samo jak przy pasie powiązanych newsów.
 */
export function DailySummaryCard({ compact = false, href = '/podsumowanie' }: { compact?: boolean; href?: string }) {
    const todayKey = useMemo(() => warsawDateKey(), []);
    const yesterdayKey = useMemo(() => prevCalendarDate(todayKey), [todayKey]);

    const { data: today } = useDailyDigest();
    const { data: yesterday } = useDailyDigest(yesterdayKey);

    const pick = (d: DailyDigest | null | undefined) => d?.podsumowanie ? d : null;
    const dg = pick(today) ?? pick(yesterday);
    if (dg?.podsumowanie) {
        return (
            <SummaryCard
                summary={dg.podsumowanie}
                staleDate={dg === today ? undefined : dg.date}
                href={href}
                compact={compact}
                dane={dg.dane}
            />
        );
    }
    return null;
}
