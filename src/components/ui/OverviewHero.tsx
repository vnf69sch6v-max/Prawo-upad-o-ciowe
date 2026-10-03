'use client';

import { useMemo, type ReactNode } from 'react';
import Link from 'next/link';
import { useNews } from '@/lib/hooks';
import { formatDataPeriod, formatDate, formatDecimalPL, formatRelativeTime, formatTime } from '@/lib/formatters';
import { collapseClusters } from '@/lib/news/match';
import { NBP_TARGET, type RankedSignal } from '@/lib/hero-signals';
import { HeroMetricCard } from '@/components/ui/HeroMetricCard';
import { useIsClient } from '@/lib/use-is-client';

interface OverviewHeroProps {
    /** Sygnały posortowane przez `rankHeroSignals` — hero bierze dwa pierwsze. */
    ranked: RankedSignal[];
    loading?: boolean;
}

const signed = (v: number, d = 1) => `${v > 0 ? '+' : v < 0 ? '−' : ''}${formatDecimalPL(Math.abs(v), d)}`;

function valueOf(r: RankedSignal): string {
    const { unit, decimals } = r.candidate;
    const n = formatDecimalPL(r.last, decimals);
    return unit === '%' ? `${n}%` : `${n} ${unit}`;
}

function headlineOf(r: RankedSignal): string {
    const { candidate: c, delta, last, prev } = r;
    if (c.kind === 'cpi') {
        const above = last > NBP_TARGET;
        if (r.crossedTarget) return above ? 'Inflacja wraca ponad cel NBP' : 'Inflacja schodzi do celu NBP';
        if (delta != null && Math.abs(delta) >= 0.2) return delta > 0 ? 'Inflacja przyspiesza' : 'Inflacja hamuje';
        return above ? 'Inflacja powyżej celu NBP' : prev != null ? 'Inflacja w pobliżu celu NBP' : 'Inflacja CPI';
    }
    if (c.kind === 'market') {
        if (c.id === 'eur-pln') return (delta ?? 0) > 0 ? 'Złoty wyraźnie słabnie' : 'Złoty wyraźnie się umacnia';
        return (delta ?? 0) > 0 ? `${c.label} mocno w górę` : `${c.label} mocno w dół`;
    }
    if (delta == null || Math.abs(delta) < 0.2) return `${c.label} — stabilnie`;
    if (c.kind === 'employment') return delta > 0 ? 'Bezrobocie rośnie' : 'Bezrobocie spada';
    return `${c.label} ${delta > 0 ? 'przyspiesza' : 'zwalnia'}`;
}

function textOf(r: RankedSignal): string {
    const { candidate: c, delta, last, prev } = r;
    if (c.kind === 'market') {
        const sinceTxt = r.biggestSince >= 5 ? ` Największy dzienny ruch od ${r.biggestSince} sesji.` : '';
        return `Ostatnia sesja: ${delta != null ? `${signed(delta, 2)}%` : '—'}.${sinceTxt}`;
    }
    const pct = (v: number) => `${formatDecimalPL(v, c.decimals)}%`;
    let base: string;
    if (c.kind === 'cpi') {
        const gap = last - NBP_TARGET;
        base = Math.abs(gap) < 0.05
            ? `Dokładnie w celu NBP (${pct(NBP_TARGET)}).`
            : `${formatDecimalPL(Math.abs(gap), 1)} p.p. ${gap > 0 ? 'powyżej' : 'poniżej'} celu NBP (${pct(NBP_TARGET)})${prev != null ? `; miesiąc wcześniej ${pct(prev)}` : ''}.`;
    } else if (prev == null || delta == null) {
        base = `Ostatni odczyt: ${pct(last)}.`;
    } else if (Math.abs(delta) < 0.05) {
        base = `Bez zmian względem poprzedniego miesiąca.`;
    } else {
        const what = c.kind === 'employment' ? 'Stopa' : 'Dynamika r/r';
        base = `${what} ${delta > 0 ? 'wzrosła' : 'spadła'} z ${pct(prev)} do ${pct(last)}.`;
    }
    const since = r.biggestSince >= 6 && delta != null && Math.abs(delta) >= 0.2
        ? ` Największa zmiana od ${r.biggestSince} mies.`
        : '';
    return base + since;
}

function ageText(days: number): string {
    if (days <= 0) return 'dziś';
    if (days === 1) return 'wczoraj';
    return `${days} dni temu`;
}

/** Dlaczego ten sygnał jest na górze — widoczne, żeby zmiana kolejności nie wyglądała na przypadek. */
function reasonOf(r: RankedSignal): string | null {
    if (r.candidate.kind === 'market') return 'Nietypowy ruch';
    if (r.fresh && r.ageDays != null) return `Nowy odczyt · ${ageText(r.ageDays)}`;
    if (r.crossedTarget) return 'Przebicie celu NBP';
    if (r.biggestSince >= 6) return 'Nietypowa zmiana';
    return null;
}

const shortDay = (iso: string) => new Date(`${iso}T12:00:00`).toLocaleDateString('pl-PL', { day: 'numeric', month: 'short' });

function Footnote({ r }: { r: RankedSignal }) {
    const period = r.candidate.kind === 'market' ? `sesja ${formatDate(r.period)}` : `dane za ${formatDataPeriod(r.period)}`;
    return (
        <>
            <span className="whitespace-nowrap">{period}</span>
            {r.next && <span className="whitespace-nowrap"> · kolejny odczyt {shortDay(r.next.date)}</span>}
            <span className="ml-1 inline-block transition-transform group-hover:translate-x-0.5" aria-hidden>→</span>
        </>
    );
}

function HeroCell({ className, loading, primary, children }: { className: string; loading: boolean; primary?: boolean; children: ReactNode }) {
    return (
        <div className={`mk-hero-metric p-3.5 sm:p-4 ${className}`}>
            {loading ? (
                <div className="space-y-2" aria-hidden>
                    <div className="h-3 w-40 rounded bg-white/20" />
                    <div className={`rounded bg-white/20 ${primary ? 'h-11 w-32' : 'h-9 w-24'}`} />
                    <div className="h-3 w-full rounded bg-white/15" />
                    <div className="h-3 w-2/3 rounded bg-white/15" />
                </div>
            ) : children}
        </div>
    );
}

function SignalCell({ r, emphasis }: { r: RankedSignal; emphasis: 'primary' | 'secondary' }) {
    const reason = reasonOf(r);
    const invert = r.candidate.invert;
    const deltaTxt = r.delta == null ? null
        : r.candidate.deltaMode === 'pp' ? `${signed(r.delta)} p.p.` : `${signed(r.delta, 2)}%`;
    // Kolor zmiany niesiony kształtem (strzałka) i tekstem, nie tylko barwą — czerwone tło pasa.
    const arrow = r.delta == null || r.delta === 0 ? '' : r.delta > 0 ? '▲ ' : '▼ ';
    const good = r.delta != null && r.delta !== 0 && (r.delta > 0) !== Boolean(invert);
    return (
        <Link
            href={r.candidate.href}
            className="group -m-1 block rounded-lg p-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 active:opacity-80"
        >
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-white/85 sm:text-xs">{headlineOf(r)}</p>
                {reason && (
                    <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-mk-brand">
                        {reason}
                    </span>
                )}
            </div>
            <div className="mt-2 flex flex-wrap items-baseline gap-2">
                <span className={`tnum font-extrabold tracking-tight ${emphasis === 'primary' ? 'text-4xl sm:text-5xl' : 'text-2xl sm:text-3xl'}`}>
                    {valueOf(r)}
                </span>
                {deltaTxt && (
                    <span className="mk-hero-chip" aria-label={`zmiana ${deltaTxt}${good ? ', korzystna' : ''}`}>
                        {arrow}{deltaTxt}
                    </span>
                )}
            </div>
            <p className="mk-hero-muted mt-2 max-w-md text-xs leading-relaxed sm:text-sm">{textOf(r)}</p>
            <p className="mk-hero-muted mt-2.5 text-[11px] font-semibold uppercase tracking-wide">
                <Footnote r={r} />
            </p>
        </Link>
    );
}

export function OverviewHero({ ranked, loading }: OverviewHeroProps) {
    const { data: newsData, isLoading: newsLoading, isError: newsError, refetch: refetchNews } = useNews();
    const topNews = useMemo(() => {
        const items = collapseClusters([...(newsData?.items ?? [])])
            .sort((a, b) => (b.importance ?? 0) - (a.importance ?? 0));
        return items[0] ?? null;
    }, [newsData]);
    const [primary, secondary] = ranked;

    return (
        <section className="mk-hero-band overflow-hidden" aria-label="Najważniejsze sygnały — wybierane wg świeżości i skali zmiany">
            <div className="grid grid-cols-1 divide-y divide-white/15 lg:grid-cols-12 lg:divide-x lg:divide-y-0">
                {/* Szkielet do końca ładowania WSZYSTKICH wskaźników makro — inaczej kolejność skakałaby
                    w miarę dochodzenia danych. */}
                <HeroCell className="lg:col-span-5" loading={Boolean(loading)} primary>
                    {primary ? <SignalCell r={primary} emphasis="primary" /> : <p className="mk-hero-muted text-sm">Źródła GUS chwilowo nie odpowiadają — dane pojawią się po odświeżeniu.</p>}
                </HeroCell>
                <HeroCell className="lg:col-span-3" loading={Boolean(loading)}>
                    {secondary ? <SignalCell r={secondary} emphasis="secondary" /> : <p className="mk-hero-muted text-sm">Brak drugiego sygnału.</p>}
                </HeroCell>
                <HeroMetricCard className="lg:col-span-4" headline="Najważniejszy news" loading={newsLoading}>
                    {topNews ? (
                        <a href={topNews.link} target="_blank" rel="noopener noreferrer" className="group -m-1 block rounded-lg p-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50 active:opacity-80">
                            <h2 className="text-sm font-bold leading-snug transition-opacity group-hover:opacity-90 sm:text-base">{topNews.title}</h2>
                            <div className="mk-hero-muted mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] font-semibold uppercase tracking-wide">
                                <span>{topNews.source}</span>
                                <span className="text-white/40">·</span>
                                <HeroNewsTime publishedAt={topNews.publishedAt} />
                            </div>
                        </a>
                    ) : newsError ? (
                        <div>
                            <p className="text-sm font-medium">Nie udało się pobrać newsów.</p>
                            <button
                                type="button"
                                onClick={() => { void refetchNews(); }}
                                className="mt-2 min-h-11 text-xs font-semibold underline underline-offset-2 hover:opacity-90"
                            >
                                Spróbuj ponownie
                            </button>
                        </div>
                    ) : (
                        <div>
                            <p className="mk-hero-muted text-xs sm:text-sm">Brak newsów do wyświetlenia.</p>
                            <Link href="/newsy" className="mt-2 inline-flex min-h-11 items-center text-xs font-semibold underline underline-offset-2 hover:opacity-90 sm:text-sm">Przejdź do newsów</Link>
                        </div>
                    )}
                </HeroMetricCard>
            </div>
        </section>
    );
}

function HeroNewsTime({ publishedAt }: { publishedAt: string }) {
    const isClient = useIsClient();
    return <time dateTime={publishedAt}>{isClient ? formatRelativeTime(publishedAt) : formatTime(publishedAt)}</time>;
}
