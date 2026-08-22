'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useNews } from '@/lib/hooks';
import { formatDecimalPL, formatRelativeTime, formatTime } from '@/lib/formatters';
import { collapseClusters } from '@/lib/news/match';
import { consecutiveRun } from '@/lib/observations';
import { HeroMetricCard } from '@/components/ui/HeroMetricCard';

const NBP_TARGET = 2.5;

type Point = { date: string; value: number };

interface OverviewHeroProps {
    cpi: Point[];
    retail: Point[];
    cpiLoading?: boolean;
    retailLoading?: boolean;
}

const lastOf = (s: Point[]) => (s.length ? s[s.length - 1].value : null);
const prevOf = (s: Point[]) => (s.length > 1 ? s[s.length - 2].value : null);
const ppDelta = (s: Point[]) => (lastOf(s) != null && prevOf(s) != null ? +(lastOf(s)! - prevOf(s)!).toFixed(1) : null);

function cpiSignal(cpi: Point[]) {
    const last = lastOf(cpi);
    const prev = prevOf(cpi);
    const delta = ppDelta(cpi);
    if (last == null) {
        return { headline: 'Inflacja CPI', value: '—', delta: null as number | null, text: 'Oczekiwanie na dane GUS…', footnote: 'GUS · cel NBP 2,5%' };
    }
    const above = last > NBP_TARGET;
    const wasBelow = prev != null && prev <= NBP_TARGET;
    let headline = above ? 'Inflacja CPI powyżej celu NBP' : 'Inflacja CPI w pobliżu celu NBP';
    if (above && wasBelow) headline = 'Inflacja CPI wraca ponad cel NBP';
    else if (!above && prev != null && prev > NBP_TARGET) headline = 'Inflacja CPI schodzi poniżej celu NBP';

    const gap = last - NBP_TARGET;
    const text = above
        ? `Odczyt ${formatDecimalPL(last, 1)}% przekracza cel NBP (${formatDecimalPL(NBP_TARGET, 1)}%) o ${formatDecimalPL(Math.abs(gap), 1)} p.p.`
        : `Odczyt ${formatDecimalPL(last, 1)}% — ${gap >= 0 ? 'na' : 'poniżej'} poziomie celu NBP (${formatDecimalPL(NBP_TARGET, 1)}%).`;

    const date = cpi.length ? cpi[cpi.length - 1].date : '';
    return {
        headline,
        value: `${formatDecimalPL(last, 1)}%`,
        delta,
        text,
        footnote: date ? `GUS · ${date} · cel NBP 2,5%` : 'GUS · cel NBP 2,5%',
    };
}

function retailSignal(retail: Point[]) {
    const label = 'Sprzedaż detaliczna';
    const last = lastOf(retail);
    const delta = ppDelta(retail);
    const values = retail.map((d) => d.value);

    if (last == null) {
        return { headline: label, value: '—', delta: null as number | null, text: 'Oczekiwanie na dane GUS…', footnote: 'GUS BDL' };
    }

    const upRun = consecutiveRun(values, 'up');
    const downRun = consecutiveRun(values, 'down');
    let headline = `${label} — stabilnie`;
    if (delta != null && delta > 0.2) headline = `${label} przyspiesza`;
    else if (delta != null && delta < -0.2) headline = `${label} zwalnia`;
    else if (upRun >= 2) headline = `${label} rośnie ${upRun} okresy z rzędu`;
    else if (downRun >= 2) headline = `${label} spada ${downRun} okresy z rzędu`;

    const text = delta != null
        ? `Zmiana r/r: ${delta >= 0 ? '+' : ''}${formatDecimalPL(delta, 1)} p.p. względem poprzedniego odczytu.`
        : `Ostatni odczyt r/r: ${formatDecimalPL(last, 1)}%.`;

    const date = retail.length ? retail[retail.length - 1].date : '';
    return {
        headline,
        value: `${formatDecimalPL(last, 1)}%`,
        delta,
        text,
        footnote: date ? `GUS · ${date}` : 'GUS BDL',
    };
}

export function OverviewHero({ cpi, retail, cpiLoading, retailLoading }: OverviewHeroProps) {
    const { data: newsData, isLoading: newsLoading } = useNews();
    const cpiSig = useMemo(() => cpiSignal(cpi), [cpi]);
    const actSig = useMemo(() => retailSignal(retail), [retail]);
    const topNews = useMemo(() => {
        const items = collapseClusters([...(newsData?.items ?? [])])
            .sort((a, b) => (b.importance ?? 0) - (a.importance ?? 0));
        return items[0] ?? null;
    }, [newsData]);
    const loading = cpiLoading || retailLoading;

    return (
        <section className="mk-hero-band overflow-hidden" aria-label="Główne sygnały makro">
            <div className="grid grid-cols-1 divide-y divide-white/15 lg:grid-cols-12 lg:divide-x lg:divide-y-0">
                <HeroMetricCard
                    className="lg:col-span-5"
                    headline={cpiSig.headline}
                    value={cpiSig.value}
                    delta={cpiSig.delta}
                    invertDelta
                    text={cpiSig.text}
                    footnote={cpiSig.footnote}
                    loading={loading}
                    emphasis="primary"
                />
                <HeroMetricCard
                    className="lg:col-span-3"
                    headline={actSig.headline}
                    value={actSig.value}
                    delta={actSig.delta}
                    text={actSig.text}
                    footnote={actSig.footnote}
                    loading={loading}
                    emphasis="secondary"
                />
                <HeroMetricCard className="lg:col-span-4" headline="Najważniejszy news" loading={newsLoading}>
                    {topNews ? (
                        <a href={topNews.link} target="_blank" rel="noopener noreferrer" className="group block rounded-lg -m-1 p-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50">
                            <h2 className="text-sm font-bold leading-snug transition-opacity group-hover:opacity-90 sm:text-base">{topNews.title}</h2>
                            <div className="mk-hero-muted mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] font-semibold uppercase tracking-wide">
                                <span>{topNews.source}</span>
                                <span className="text-white/40">·</span>
                                <HeroNewsTime publishedAt={topNews.publishedAt} />
                            </div>
                        </a>
                    ) : (
                        <div>
                            <p className="mk-hero-muted text-xs sm:text-sm">Brak newsów do wyświetlenia.</p>
                            <Link href="/newsy" className="mt-2 inline-block text-xs font-semibold underline underline-offset-2 hover:opacity-90 sm:text-sm">Przejdź do newsów</Link>
                        </div>
                    )}
                </HeroMetricCard>
            </div>
        </section>
    );
}

function HeroNewsTime({ publishedAt }: { publishedAt: string }) {
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);
    return <time dateTime={publishedAt}>{mounted ? formatRelativeTime(publishedAt) : formatTime(publishedAt)}</time>;
}
