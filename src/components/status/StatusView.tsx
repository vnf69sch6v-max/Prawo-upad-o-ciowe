'use client';

import Link from 'next/link';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ChevronDown, RefreshCw } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { QueryError } from '@/components/ui/QueryState';
import { datasetById, pluralPl, STATUS_LABELS, type FreshnessItem, type FreshnessReport, type FreshnessStatus } from '@/lib/freshness';
import { useIsClient } from '@/lib/use-is-client';
import { DatasetCard, DatasetCardSkeleton } from './DatasetCard';
import { CronRuns } from './CronRuns';
import { STATUS_STYLE } from './StatusPill';

const QUERY_KEY = ['health-freshness'] as const;
const ENDPOINT = '/api/health/freshness';

const GROUPS: { id: 'gus' | 'eurostat' | 'markets'; title: string }[] = [
    { id: 'gus', title: 'Wskaźniki GUS' },
    { id: 'eurostat', title: 'Eurostat' },
    { id: 'markets', title: 'Rynki — NBP i giełda' },
];

const LEGEND: { status: FreshnessStatus; text: string }[] = [
    { status: 'ok', text: 'najnowszy okres zgadza się z harmonogramem publikacji źródła.' },
    { status: 'lag', text: 'jeden okres za harmonogramem — zwykle opóźnienie źródła (np. BDL za komunikatem GUS), nie błąd serwisu.' },
    { status: 'stale', text: 'dwa okresy lub więcej za harmonogramem albo dane starsze niż dopuszczalny wiek.' },
    { status: 'error', text: 'endpoint nie odpowiedział w 20 s albo zwrócił odpowiedź bez danych.' },
];

/**
 * 503 to też poprawny raport (coś jest nieaktualne). `force` omija 5-min cache CDN — kluczem jest
 * bieżąca minuta, więc wielokrotne klikanie nie wywołuje pełnej kontroli częściej niż raz na minutę.
 */
async function fetchReport(force: boolean): Promise<FreshnessReport> {
    const url = force ? `${ENDPOINT}?t=${Math.floor(Date.now() / 60_000)}` : ENDPOINT;
    const res = await fetch(url);
    if (res.status !== 200 && res.status !== 503) throw new Error(`HTTP ${res.status}`);
    const json = (await res.json()) as FreshnessReport;
    if (!Array.isArray(json?.items)) throw new Error('Nieprawidłowa odpowiedź');
    return json;
}

function count(items: FreshnessItem[], status: FreshnessStatus): number {
    return items.filter((i) => i.status === status).length;
}

function headline(items: FreshnessItem[]): { title: string; detail: string } {
    const lag = count(items, 'lag');
    const stale = count(items, 'stale');
    const error = count(items, 'error');
    if (!lag && !stale && !error) {
        return { title: 'Wszystkie dane aktualne', detail: 'Każdy zbiór ma najnowszy okres, jaki źródło zdążyło opublikować.' };
    }
    if (!stale && !error) {
        return {
            title: `${lag} ${pluralPl(lag, 'zbiór opóźniony', 'zbiory opóźnione', 'zbiorów opóźnionych')}`,
            detail: 'Opóźnienie o jeden okres to zwykle opóźnienie źródła względem komunikatu — reszta jest aktualna.',
        };
    }
    const parts: string[] = [];
    if (stale) parts.push(`${stale} ${pluralPl(stale, 'zbiór nieaktualny', 'zbiory nieaktualne', 'zbiorów nieaktualnych')}`);
    if (error) parts.push(`${error} ${pluralPl(error, 'źródło nie odpowiada', 'źródła nie odpowiadają', 'źródeł nie odpowiada')}`);
    if (lag) parts.push(`${lag} ${pluralPl(lag, 'opóźniony', 'opóźnione', 'opóźnionych')}`);
    return { title: parts.join(' · '), detail: 'Automatyczna kontrola próbuje odświeżyć NBP, giełdę i Eurostat; dane GUS odświeżają crony po publikacjach GUS.' };
}

const CHECKED_AT_FMT = new Intl.DateTimeFormat('pl-PL', {
    timeZone: 'Europe/Warsaw', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit',
});

function Summary({ report }: { report: FreshnessReport }) {
    const { title, detail } = headline(report.items);
    const style = STATUS_STYLE[report.overall];
    const Icon = style.icon;
    const checked = new Date(report.checkedAt);
    const chips = (['ok', 'lag', 'stale', 'error'] as const).filter((s) => s === 'ok' || count(report.items, s) > 0);
    return (
        <section className={`rounded-2xl border border-mk-border px-4 py-4 sm:px-5 ${style.tintClass}`} aria-live="polite">
            <div className="flex items-start gap-3">
                <Icon size={28} className={`mt-0.5 shrink-0 ${style.iconClass}`} aria-hidden />
                <div className="min-w-0">
                    <h2 className="text-lg font-bold leading-snug text-mk-text sm:text-xl">{title}</h2>
                    <p className="mt-1 text-sm text-mk-text-soft">{detail}</p>
                    <p className="mt-2 text-xs text-mk-muted">
                        Sprawdzono {Number.isNaN(checked.getTime()) ? '—' : CHECKED_AT_FMT.format(checked)} · {report.items.length}{' '}
                        {pluralPl(report.items.length, 'zbiór', 'zbiory', 'zbiorów')}
                    </p>
                </div>
            </div>
            <ul className="mt-3 flex flex-wrap gap-2" aria-label="Podsumowanie statusów">
                {chips.map((s) => {
                    const S = STATUS_STYLE[s].icon;
                    return (
                        <li key={s} className="inline-flex items-center gap-1.5 rounded-full bg-mk-surface px-2.5 py-1 text-xs font-medium text-mk-text ring-1 ring-inset ring-mk-border">
                            <S size={13} className={STATUS_STYLE[s].iconClass} aria-hidden />
                            {STATUS_LABELS[s]}: <span className="tabular-nums">{count(report.items, s)}</span>
                        </li>
                    );
                })}
            </ul>
        </section>
    );
}

function SummarySkeleton() {
    return <div className="mk-skeleton h-[148px] rounded-2xl sm:h-[132px]" role="status" aria-busy="true" aria-label="Sprawdzanie stanu danych" />;
}

export function StatusView() {
    const isClient = useIsClient();
    const queryClient = useQueryClient();
    const q = useQuery<FreshnessReport>({
        queryKey: QUERY_KEY,
        queryFn: () => fetchReport(false),
        staleTime: 60_000,
        refetchOnWindowFocus: false,
        retry: 1,
    });

    const recheck = () => {
        queryClient.fetchQuery({ queryKey: QUERY_KEY, queryFn: () => fetchReport(true), staleTime: 0 }).catch(() => { /* stan błędu pokazuje useQuery */ });
    };

    const report = isClient ? q.data : undefined;
    const loading = !isClient || (q.isPending && !q.isError);
    const byGroup = (id: string) => (report?.items ?? []).filter((i) => (datasetById(i.id)?.group ?? 'gus') === id);

    return (
        <div className="mk-fade-in space-y-5">
            <PageHeader
                title="Stan danych"
                actions={
                    <button
                        type="button"
                        onClick={recheck}
                        disabled={q.isFetching}
                        aria-busy={q.isFetching}
                        className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-mk-border bg-mk-surface px-4 text-sm font-semibold text-mk-text transition-colors [-webkit-tap-highlight-color:transparent] hover:bg-mk-surface-alt active:bg-mk-border disabled:cursor-wait disabled:opacity-60 sm:w-auto"
                    >
                        <RefreshCw size={16} className={q.isFetching ? 'animate-spin motion-reduce:animate-none' : ''} aria-hidden />
                        {q.isFetching ? 'Sprawdzam…' : 'Sprawdź ponownie'}
                    </button>
                }
            />

            <p className="max-w-[68ch] text-sm leading-relaxed text-mk-text-soft">
                Porównujemy najnowszy okres w danych serwisu z harmonogramem publikacji GUS, NBP, Eurostatu i giełdy.
                Crony odświeżają dane codziennie (GUS tuż po porannych publikacjach), a kontrola świeżości sprawdza
                wynik każdego popołudnia; ta strona sprawdza na bieżąco (wynik do 5 minut).
            </p>

            {q.isError && !report ? (
                <QueryError
                    title="Nie udało się sprawdzić stanu danych"
                    detail="Kontrola świeżości nie odpowiedziała. Spróbuj ponownie za chwilę."
                    onRetry={recheck}
                />
            ) : (
                <>
                    {loading || !report ? <SummarySkeleton /> : <Summary report={report} />}

                    {GROUPS.map((g) => {
                        const items = byGroup(g.id);
                        const skeletons = loading ? (g.id === 'gus' ? 5 : g.id === 'eurostat' ? 3 : 5) : 0;
                        if (!loading && !items.length) return null;
                        return (
                            <section key={g.id} aria-labelledby={`status-${g.id}`} className="space-y-2">
                                <h2 id={`status-${g.id}`} className="mk-section-label">{g.title}</h2>
                                <ul className="grid grid-cols-1 gap-2 md:grid-cols-2">
                                    {loading
                                        ? Array.from({ length: skeletons }, (_, i) => <DatasetCardSkeleton key={i} />)
                                        : items.map((item) => <DatasetCard key={item.id} item={item} />)}
                                </ul>
                            </section>
                        );
                    })}

                    {report && <CronRuns crons={report.crons} />}
                </>
            )}

            <details className="group rounded-xl border border-mk-border bg-mk-surface">
                <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 px-3.5 text-sm font-semibold text-mk-text [-webkit-tap-highlight-color:transparent] active:bg-mk-surface-alt [&::-webkit-details-marker]:hidden">
                    Jak czytać statusy
                    <ChevronDown size={18} className="shrink-0 text-mk-muted transition-transform group-open:rotate-180" aria-hidden />
                </summary>
                <ul className="space-y-2 px-3.5 pb-3.5 text-sm text-mk-text-soft">
                    {LEGEND.map((l) => {
                        const S = STATUS_STYLE[l.status].icon;
                        return (
                            <li key={l.status} className="flex gap-2">
                                <S size={16} className={`mt-0.5 shrink-0 ${STATUS_STYLE[l.status].iconClass}`} aria-hidden />
                                <span><strong className="font-semibold text-mk-text">{STATUS_LABELS[l.status]}</strong> — {l.text}</span>
                            </li>
                        );
                    })}
                    <li className="pt-1 text-xs text-mk-muted">
                        Daty publikacji: <Link href="/publikacje" className="font-semibold text-mk-brand underline-offset-2 hover:underline">kalendarz publikacji</Link>.
                        Wynik maszynowy (JSON, HTTP 503 przy problemach): <a href={ENDPOINT} className="font-semibold text-mk-brand underline-offset-2 hover:underline">{ENDPOINT}</a>.
                    </li>
                </ul>
            </details>
        </div>
    );
}
