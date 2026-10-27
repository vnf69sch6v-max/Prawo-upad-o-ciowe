'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { DollarSign, Landmark, Percent, TrendingUp, Users } from 'lucide-react';
import { CompactKpiGrid, type CompactKpiItem } from '@/components/ui/CompactKpiGrid';
import { formatDataPeriod, formatDate, formatDecimalPL, formatPP } from '@/lib/formatters';
import { useIsClient } from '@/lib/use-is-client';
import { jstDateKey } from '@/lib/jp/calendar';
import { BOJ_CREDIT_EN, BOJ_CREDIT_PL, lastBojPoint, type BojPayload } from '@/lib/jp/boj';
import { changePp, lastPoint, type JpCpiPayload } from '@/lib/jp/cpi';
import { labourChangePp, lastLabourPoint, type JpLabourPayload } from '@/lib/jp/labour';
import { type JgbPayload } from '@/lib/jp/jgb';
import { jpSignalHeadline, jpSignalReason, jpSignalText, rankJpHero } from '@/lib/jp/overview';
import { DASHBOARD_CREDIT_JA, DASHBOARD_CREDIT_PL } from '@/lib/jp/stat-dashboard';
import { useJpCpi } from '@/lib/jp/use-jp-cpi';
import { useJpJgb } from '@/lib/jp/use-jp-jgb';
import { useJpLabour } from '@/lib/jp/use-jp-labour';
import { useJpMarkets } from '@/lib/jp/use-jp-markets';
import type { RankedSignal } from '@/lib/hero-signals';

const SPARK = 12;
const pct1 = (v: number) => `${formatDecimalPL(v, 1)}%`;
const jpy2 = (v: number) => `${formatDecimalPL(v, 2)} jena`;
const pct3 = (v: number) => `${formatDecimalPL(v, 3)}%`;

function pctMove(points: { value: number }[] | undefined): number | null {
    if (!points || points.length < 2) return null;
    const a = points[points.length - 2].value;
    const b = points[points.length - 1].value;
    if (!a) return null;
    return +(((b - a) / Math.abs(a)) * 100).toFixed(2);
}

function valueOf(r: RankedSignal): string {
    const n = formatDecimalPL(r.last, r.candidate.decimals);
    return r.candidate.unit === '%' ? `${n}%` : `${n} ${r.candidate.unit}`;
}

const shortDay = (iso: string) => new Date(`${iso}T12:00:00Z`).toLocaleDateString('pl-PL', { day: 'numeric', month: 'short', timeZone: 'UTC' });

function SignalLink({ r, emphasis }: { r: RankedSignal; emphasis: 'primary' | 'secondary' }) {
    const reason = jpSignalReason(r);
    const deltaTxt = r.delta == null ? null : r.candidate.deltaMode === 'pp' ? formatPP(r.delta, 1) : `${r.delta > 0 ? '+' : r.delta < 0 ? '−' : ''}${formatDecimalPL(Math.abs(r.delta), 2)}%`;
    const arrow = r.delta == null || r.delta === 0 ? '' : r.delta > 0 ? '▲ ' : '▼ ';
    const period = r.candidate.kind === 'market' ? `notowanie ${formatDate(r.period)}` : `dane za ${formatDataPeriod(r.period)}`;
    return (
        <Link href={r.candidate.href} className="group -m-1 block rounded-lg p-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 active:opacity-80">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-white/85 sm:text-xs">{jpSignalHeadline(r)}</p>
                {reason && <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-mk-brand">{reason}</span>}
            </div>
            <div className="mt-2 flex flex-wrap items-baseline gap-2">
                <span className={`tnum font-extrabold tracking-tight ${emphasis === 'primary' ? 'text-4xl sm:text-5xl' : 'text-2xl sm:text-3xl'}`}>{valueOf(r)}</span>
                {deltaTxt && <span className="mk-hero-chip">{arrow}{deltaTxt}</span>}
            </div>
            <p className="mk-hero-muted mt-2 max-w-md text-xs leading-relaxed sm:text-sm">{jpSignalText(r)}</p>
            <p className="mk-hero-muted mt-2.5 text-[11px] font-semibold uppercase tracking-wide">
                <span className="whitespace-nowrap">{period}{!r.next && <span className="ml-1 inline-block" aria-hidden>→</span>}</span>
                {r.next && <> · <span className="whitespace-nowrap">kolejny odczyt {shortDay(r.next.date)} <span aria-hidden>→</span></span></>}
            </p>
        </Link>
    );
}

export function JpOverview({
    cpi: cpiInitial, labour: labourInitial, markets: marketsInitial, jgb: jgbInitial,
}: {
    cpi: JpCpiPayload | null;
    labour: JpLabourPayload | null;
    markets: BojPayload | null;
    jgb: JgbPayload | null;
}) {
    const cpiQ = useJpCpi(cpiInitial);
    const labourQ = useJpLabour(labourInitial);
    const marketsQ = useJpMarkets(marketsInitial);
    const jgbQ = useJpJgb(jgbInitial);
    const isClient = useIsClient();
    const today = isClient ? jstDateKey() : null;

    const cpiSeries = useMemo(() => cpiQ.data?.series.headline ?? [], [cpiQ.data]);
    const labourSeries = useMemo(() => labourQ.data?.series.sa ?? [], [labourQ.data]);
    const fxSeries = useMemo(() => marketsQ.data?.series.usdjpy ?? [], [marketsQ.data]);
    const policySeries = useMemo(() => marketsQ.data?.series.policy ?? [], [marketsQ.data]);
    const jgbSeries = useMemo(() => (jgbQ.data?.history ?? []).map((p) => ({ date: p.date, value: p.y10 })), [jgbQ.data]);

    const ranked = useMemo(() => rankJpHero({
        cpi: cpiSeries, unemployment: labourSeries, usdjpy: fxSeries, jgb: jgbSeries,
    }, today), [cpiSeries, labourSeries, fxSeries, jgbSeries, today]);
    const freshIds = useMemo(() => new Set(ranked.filter((r) => r.fresh).map((r) => r.candidate.id)), [ranked]);
    // Hero czeka na CPI i bezrobocie razem — inaczej pierwszy, który dojdzie, wskakuje na górę i po chwili spada.
    const heroLoading = cpiQ.isLoading || labourQ.isLoading;
    const [primary, secondary] = ranked;

    const cpiLast = lastPoint(cpiSeries);
    const labourLast = lastLabourPoint(labourSeries);
    const fxLast = lastBojPoint(fxSeries);
    const policyLast = lastBojPoint(policySeries);
    const jgbLast = jgbSeries.at(-1) ?? null;
    const jgbPrev = jgbSeries.length > 1 ? jgbSeries[jgbSeries.length - 2].value : null;
    const jgbMove = jgbLast && jgbPrev != null ? +(jgbLast.value - jgbPrev).toFixed(3) : null;
    const policyDelta = policySeries.length > 1 ? policySeries[policySeries.length - 1].value - policySeries[policySeries.length - 2].value : null;

    const kpis: CompactKpiItem[] = [
        {
            key: 'jp-cpi', label: 'Inflacja CPI', href: '/japonia/inflacja', watchId: 'jp-cpi', icon: TrendingUp,
            value: cpiLast ? formatDecimalPL(cpiLast.value, 1) : '—', unit: '%',
            delta: changePp(cpiSeries) != null ? { value: changePp(cpiSeries)!, unit: 'pp', invert: true } : undefined,
            footnote: cpiLast ? `${freshIds.has('jp-cpi') ? 'nowe · ' : ''}dane za ${formatDataPeriod(cpiLast.date)}` : 'cel BOJ 2%',
            spark: cpiSeries.slice(-SPARK), sparkFormat: pct1,
            loading: cpiQ.isLoading, error: cpiQ.isError, onRetry: () => { void cpiQ.refetch(); },
        },
        {
            key: 'jp-unemployment', label: 'Stopa bezrobocia', href: '/japonia/praca', watchId: 'jp-unemployment', icon: Users,
            value: labourLast ? formatDecimalPL(labourLast.value, 1) : '—', unit: '%',
            delta: labourChangePp(labourSeries) != null ? { value: labourChangePp(labourSeries)!, unit: 'pp', invert: true } : undefined,
            footnote: labourLast ? `${freshIds.has('jp-unemployment') ? 'nowe · ' : ''}wyrównana sezonowo · dane za ${formatDataPeriod(labourLast.date)}` : 'wyrównana sezonowo',
            spark: labourSeries.slice(-SPARK), sparkFormat: pct1,
            loading: labourQ.isLoading, error: labourQ.isError, onRetry: () => { void labourQ.refetch(); },
        },
        {
            key: 'jp-usdjpy', label: 'USD/JPY', href: '/japonia/rynki', watchId: 'jp-usdjpy', icon: DollarSign,
            value: fxLast ? formatDecimalPL(fxLast.value, 2) : '—', unit: 'jena',
            delta: pctMove(fxSeries) != null ? { value: pctMove(fxSeries)!, unit: 'pct', invert: true } : undefined,
            footnote: fxLast ? `17:00 Tokio · ${formatDate(fxLast.date)}` : 'fix 17:00',
            spark: fxSeries.slice(-30), sparkFormat: jpy2,
            loading: marketsQ.isLoading, error: marketsQ.isError, onRetry: () => { void marketsQ.refetch(); },
        },
        {
            key: 'jp-policy', label: 'Stopa BOJ', href: '/japonia/rynki', watchId: 'jp-policy', icon: Percent,
            value: policyLast ? formatDecimalPL(policyLast.value, 2) : '—', unit: '%',
            delta: policyDelta != null && Math.abs(policyDelta) >= 0.001 ? { value: +policyDelta.toFixed(2), unit: 'pp', invert: true } : undefined,
            footnote: policyLast ? `basic loan rate · ${formatDate(policyLast.date)}` : 'basic loan rate',
            loading: marketsQ.isLoading, error: marketsQ.isError, onRetry: () => { void marketsQ.refetch(); },
        },
        {
            key: 'jp-jgb', label: 'JGB 10Y', href: '/japonia/rynki', watchId: 'jp-jgb', icon: Landmark,
            value: jgbLast ? formatDecimalPL(jgbLast.value, 3) : '—', unit: '%',
            delta: jgbMove != null && Math.abs(jgbMove) >= 0.05 ? { value: +jgbMove.toFixed(1), unit: 'pp', invert: true } : undefined,
            footnote: jgbLast ? formatDate(jgbLast.date) : 'Ministerstwo Finansów',
            spark: jgbSeries.slice(-30), sparkFormat: pct3,
            loading: jgbQ.isLoading, error: jgbQ.isError, onRetry: () => { void jgbQ.refetch(); },
        },
    ];

    return (
        <div className="space-y-4 lg:space-y-5">
            <section className="mk-hero-band overflow-hidden" aria-label="Najważniejsze sygnały Japonii — świeżość publikacji i skala zmiany">
                <div className="grid grid-cols-1 divide-y divide-white/15 lg:grid-cols-12 lg:divide-x lg:divide-y-0">
                    <div className="mk-hero-metric p-3.5 sm:p-4 lg:col-span-7">
                        {heroLoading ? (
                            <div className="space-y-2" aria-hidden>
                                <div className="h-3 w-40 rounded bg-white/20" />
                                <div className="h-11 w-32 rounded bg-white/20" />
                                <div className="h-3 w-full rounded bg-white/15" />
                            </div>
                        ) : primary ? <SignalLink r={primary} emphasis="primary" /> : (
                            <p className="mk-hero-muted text-sm">Źródła Japonii chwilowo nie odpowiadają — liczby pojawią się po odświeżeniu.</p>
                        )}
                    </div>
                    <div className="mk-hero-metric p-3.5 sm:p-4 lg:col-span-5">
                        {heroLoading ? (
                            <div className="space-y-2" aria-hidden>
                                <div className="h-3 w-32 rounded bg-white/20" />
                                <div className="h-9 w-24 rounded bg-white/20" />
                            </div>
                        ) : secondary ? <SignalLink r={secondary} emphasis="secondary" /> : (
                            <p className="mk-hero-muted text-sm">Drugi sygnał pojawi się, gdy dojdzie kolejny odczyt.</p>
                        )}
                    </div>
                </div>
            </section>
            <p className="text-xs leading-relaxed text-mk-muted">
                Na górze jest świeży odczyt albo duża zmiana. Jen i obligacje wchodzą tylko przy ruchu powyżej dwóch odchyleń własnej historii.
            </p>
            <CompactKpiGrid items={kpis} label="Japonia" columns={5} dense />
            <footer className="space-y-1 border-t border-mk-border pt-3 text-xs leading-relaxed text-mk-muted">
                <p>{DASHBOARD_CREDIT_PL}</p>
                <p lang="ja">{DASHBOARD_CREDIT_JA}</p>
                <p>{BOJ_CREDIT_PL}</p>
                <p lang="en">{BOJ_CREDIT_EN}</p>
                <p>Rentowność JGB: Ministerstwo Finansów Japonii.</p>
            </footer>
        </div>
    );
}
