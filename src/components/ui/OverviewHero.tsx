'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useNews } from '@/lib/hooks';
import { formatDecimalPL, formatPP, formatRelativeTime, formatTime } from '@/lib/formatters';
import { collapseClusters } from '@/lib/news/match';
import { consecutiveRun } from '@/lib/observations';

const NBP_TARGET = 2.5;

type Point = { date: string; value: number };

interface OverviewHeroProps {
    cpi: Point[];
    retail: Point[];
    industrial: Point[];
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

/** Drugi sygnał: sprzedaż detaliczna, a gdy brak — produkcja przemysłowa. */
function activitySignal(retail: Point[], industrial: Point[]) {
    const series = retail.length >= 2 ? retail : industrial.length >= 2 ? industrial : retail.length ? retail : industrial;
    const isRetail = series === retail && retail.length >= 2;
    const label = isRetail ? 'Sprzedaż detaliczna' : 'Produkcja przemysłowa';
    const last = lastOf(series);
    const delta = ppDelta(series);
    const values = series.map((d) => d.value);

    if (last == null) {
        return { headline: label, value: '—', delta: null as number | null, text: 'Oczekiwanie na dane Eurostat…', footnote: 'Eurostat' };
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

    const date = series.length ? series[series.length - 1].date : '';
    return {
        headline,
        value: `${formatDecimalPL(last, 1)}%`,
        delta,
        text,
        footnote: date ? `EUROSTAT · ${date}` : 'Eurostat',
    };
}

export function OverviewHero({ cpi, retail, industrial, cpiLoading, retailLoading }: OverviewHeroProps) {
    const { data: newsData, isLoading: newsLoading } = useNews();

    const cpiSig = useMemo(() => cpiSignal(cpi), [cpi]);
    const actSig = useMemo(() => activitySignal(retail, industrial), [retail, industrial]);

    const topNews = useMemo(() => {
        const items = collapseClusters([...(newsData?.items ?? [])])
            .sort((a, b) => (b.importance ?? 0) - (a.importance ?? 0));
        return items[0] ?? null;
    }, [newsData]);

    const loading = cpiLoading || retailLoading;

    return (
        <section className="mk-hero-band overflow-hidden" aria-label="Główne sygnały makro">
            <div className="grid grid-cols-1 divide-y divide-white/15 lg:grid-cols-12 lg:divide-x lg:divide-y-0">
                {/* Sygnał 1 — CPI */}
                <div className="p-5 sm:p-6 lg:col-span-5 xl:col-span-5">
                    {loading ? (
                        <div className="space-y-3">
                            <div className="h-4 w-48 rounded bg-white/20" />
                            <div className="h-12 w-32 rounded bg-white/20" />
                            <div className="h-3 w-full rounded bg-white/15" />
                        </div>
                    ) : (
                        <>
                            <p className="text-xs font-semibold uppercase tracking-wide text-white/80">{cpiSig.headline}</p>
                            <div className="mt-3 flex flex-wrap items-baseline gap-3">
                                <span className="tnum text-4xl font-extrabold tracking-tight sm:text-5xl">{cpiSig.value}</span>
                                {cpiSig.delta != null && (
                                    <span className="mk-hero-chip">{formatPP(cpiSig.delta)}</span>
                                )}
                            </div>
                            <p className="mk-hero-muted mt-3 max-w-md text-sm leading-relaxed">{cpiSig.text}</p>
                            <p className="mk-hero-muted mt-4 text-[11px] font-semibold uppercase tracking-wide">{cpiSig.footnote}</p>
                        </>
                    )}
                </div>

                {/* Sygnał 2 — aktywność */}
                <div className="p-5 sm:p-6 lg:col-span-3 xl:col-span-3">
                    {loading ? (
                        <div className="space-y-3">
                            <div className="h-4 w-40 rounded bg-white/20" />
                            <div className="h-10 w-24 rounded bg-white/20" />
                        </div>
                    ) : (
                        <>
                            <p className="text-xs font-semibold uppercase tracking-wide text-white/80">{actSig.headline}</p>
                            <div className="mt-3 flex flex-wrap items-baseline gap-3">
                                <span className="tnum text-3xl font-extrabold tracking-tight">{actSig.value}</span>
                                {actSig.delta != null && (
                                    <span className="mk-hero-chip">{formatPP(actSig.delta)}</span>
                                )}
                            </div>
                            <p className="mk-hero-muted mt-3 text-sm leading-relaxed">{actSig.text}</p>
                            <p className="mk-hero-muted mt-4 text-[11px] font-semibold uppercase tracking-wide">{actSig.footnote}</p>
                        </>
                    )}
                </div>

                {/* Sygnał 3 — top news */}
                <div className="p-5 sm:p-6 lg:col-span-4 xl:col-span-4">
                    {newsLoading ? (
                        <div className="space-y-3">
                            <div className="h-4 w-24 rounded bg-white/20" />
                            <div className="h-5 w-full rounded bg-white/20" />
                            <div className="h-3 w-32 rounded bg-white/15" />
                        </div>
                    ) : topNews ? (
                        <a
                            href={topNews.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group block focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50 rounded-lg -m-1 p-1"
                        >
                            <p className="text-xs font-semibold uppercase tracking-wide text-white/80">Najważniejszy news</p>
                            <h2 className="mt-2 text-base font-bold leading-snug transition-opacity group-hover:opacity-90 sm:text-lg">
                                {topNews.title}
                            </h2>
                            <div className="mk-hero-muted mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] font-semibold uppercase tracking-wide">
                                <span>{topNews.source}</span>
                                <span className="text-white/40">·</span>
                                <HeroNewsTime publishedAt={topNews.publishedAt} />
                            </div>
                        </a>
                    ) : (
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-white/80">Najważniejszy news</p>
                            <p className="mk-hero-muted mt-2 text-sm">Brak newsów do wyświetlenia.</p>
                            <Link href="/newsy" className="mt-3 inline-block text-sm font-semibold underline underline-offset-2 hover:opacity-90">
                                Przejdź do newsów
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}

/** Czas względny dopiero po mount — hydration-safe. */
function HeroNewsTime({ publishedAt }: { publishedAt: string }) {
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);
    return (
        <time dateTime={publishedAt}>
            {mounted ? formatRelativeTime(publishedAt) : formatTime(publishedAt)}
        </time>
    );
}
