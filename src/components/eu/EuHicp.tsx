'use client';

import { useMemo } from 'react';
import { CalendarClock } from 'lucide-react';
import { SectionCard } from '@/components/ui/SectionCard';
import { InteractiveChart, type ChartSeries } from '@/components/ui/InteractiveChart';
import { QueryState } from '@/components/ui/QueryState';
import { formatDataPeriod } from '@/lib/formatters';
import { useIsClient } from '@/lib/use-is-client';
import {
    EU_HICP_DATASET, EU_HICP_SOURCE_URL, euHicpChartRows, euHicpHeadline, fmtPct, fmtSignedPp, formatUpdatedPL,
    nextEuHicpRelease, type EuGeo, type EuHicpPayload,
} from '@/lib/eu/hicp';
import { useEuHicp } from '@/lib/eu/use-eu-hicp';

const COLORS: Record<EuGeo, string> = {
    PL: '#DC2626', EA: '#2563EB', DE: '#475569', CZ: '#7C3AED', HU: '#0D9488',
};
const SERIES: ChartSeries[] = [
    { key: 'PL', name: 'Polska', color: COLORS.PL, type: 'line', strokeWidth: 3 },
    { key: 'EA', name: 'Strefa euro', color: COLORS.EA, type: 'line', strokeWidth: 1.75 },
    { key: 'DE', name: 'Niemcy', color: COLORS.DE, type: 'line', strokeWidth: 1.75 },
    { key: 'CZ', name: 'Czechy', color: COLORS.CZ, type: 'line', strokeWidth: 1.75 },
    { key: 'HU', name: 'Węgry', color: COLORS.HU, type: 'line', strokeWidth: 1.75 },
];

const monthTick = (d: string) => { const [y, m] = d.split('-'); return m ? `${m}.${y.slice(2)}` : d; };
const releaseLabel = (iso: string) => new Date(iso).toLocaleString('pl-PL', {
    day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Warsaw',
});

export function EuHicp({ initial }: { initial: EuHicpPayload | null }) {
    const { data, isLoading, isError, refetch } = useEuHicp(initial);
    const isClient = useIsClient();
    const chartRows = useMemo(() => (data ? euHicpChartRows(data) : []), [data]);

    if (!data) {
        if (isError) return <QueryState isError onRetry={() => { void refetch(); }} height={220} />;
        return (
            <div className="mk-card mk-card-pad text-sm text-mk-muted" role="status" aria-busy={isLoading}>
                Dane Eurostatu jeszcze się ładują. Pierwsze pobranie wykona automat (codziennie 06:00 UTC).
            </div>
        );
    }

    const { headline, context } = euHicpHeadline(data);
    const period = formatDataPeriod(data.latest);
    const next = isClient ? nextEuHicpRelease(new Date()) : null;

    return (
        <div className="space-y-4 lg:space-y-5">
            <section className="mk-card mk-card-pad mk-card-editorial" aria-label="Wniosek">
                <p className="text-lg font-bold leading-snug text-mk-text sm:text-2xl">{headline}</p>
                {context && <p className="mt-2 text-sm leading-relaxed text-mk-text-soft">{context}</p>}
                <p className="mt-3 text-xs text-mk-muted">
                    Dane za {period} · Eurostat, aktualizacja {formatUpdatedPL(data.updated)}
                </p>
            </section>

            <div className="grid min-w-0 gap-4 lg:grid-cols-3 lg:gap-5">
                <SectionCard
                    className="lg:col-span-2" editorial titleVariant="label"
                    title="Inflacja HICP rok do roku, 24 miesiące" subtitle="procent · przerywana linia: cel EBC 2%"
                >
                    <InteractiveChart
                        data={chartRows} xKey="date" height={300} unit="%" legend series={SERIES}
                        valueFormatter={(v) => fmtPct(v)} xTickFormatter={monthTick}
                        referenceLines={[{ y: 2, color: '#64748B' }]}
                    />
                </SectionCard>

                <SectionCard className="order-first lg:order-none" titleVariant="label" title={`Ranking · ${period}`} subtitle="HICP r/r, zmiana wobec poprzedniego miesiąca w p.p.">
                    {/* Telefon: karty. */}
                    <ul className="space-y-2 md:hidden">
                        {data.rows.map((r) => (
                            <li
                                key={r.geo}
                                className={`rounded-xl border px-3 py-2.5 ${r.geo === 'PL' ? 'border-mk-primary bg-mk-primary-soft' : 'border-mk-border bg-mk-surface'}`}
                            >
                                <div className="flex items-baseline justify-between gap-3">
                                    <span className="flex min-w-0 items-center gap-2 font-semibold text-mk-text">
                                        <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: COLORS[r.geo] }} aria-hidden />
                                        {r.name}
                                    </span>
                                    <span className="text-xl font-bold tabular-nums text-mk-text">{fmtPct(r.value)}%</span>
                                </div>
                                <p className="mt-0.5 text-xs text-mk-muted">
                                    {r.changePp == null ? '—' : `${fmtSignedPp(r.changePp)} p.p. m/m`} · {r.rank}. miejsce
                                    {r.geo === 'EA' && <> · średnia strefy euro (21 państw)</>}
                                </p>
                            </li>
                        ))}
                    </ul>
                    {/* Od md: tabela. */}
                    <table className="hidden w-full text-sm md:table">
                        <thead>
                            <tr className="border-b border-mk-border text-left text-xs text-mk-muted">
                                <th scope="col" className="py-2 pr-2 font-medium">Kraj</th>
                                <th scope="col" className="py-2 pr-2 text-right font-medium">{period}</th>
                                <th scope="col" className="py-2 pr-2 text-right font-medium">Zmiana m/m (p.p.)</th>
                                <th scope="col" className="py-2 text-right font-medium">Miejsce</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.rows.map((r) => (
                                <tr key={r.geo} className={`border-b border-mk-border last:border-0 ${r.geo === 'PL' ? 'bg-mk-primary-soft font-semibold' : ''}`}>
                                    <th scope="row" className="py-2 pl-1 pr-2 text-left font-medium text-mk-text">
                                        <span className="flex items-center gap-2">
                                            <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: COLORS[r.geo] }} aria-hidden />
                                            {r.name}
                                        </span>
                                    </th>
                                    <td className="py-2 pr-2 text-right tabular-nums text-mk-text">{fmtPct(r.value)}%</td>
                                    <td className="py-2 pr-2 text-right tabular-nums text-mk-text-soft">{r.changePp == null ? '—' : fmtSignedPp(r.changePp)}</td>
                                    <td className="py-2 pr-1 text-right tabular-nums text-mk-text-soft">{r.rank}.</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </SectionCard>
            </div>

            <div className="grid min-w-0 items-start gap-4 lg:grid-cols-2 lg:gap-5">
            <SectionCard titleVariant="label" title="Kolejny odczyt">
                {!isClient ? <div className="mk-skeleton h-10 w-full" aria-hidden /> : (
                    <p className="flex items-start gap-3 text-sm">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-mk-surface-alt text-mk-muted">
                            <CalendarClock size={17} aria-hidden />
                        </span>
                        <span>
                            <span className="block font-semibold text-mk-text">
                                Inflacja HICP{next && <> · {formatDataPeriod(next.period)}</>}
                            </span>
                            <span className="block text-mk-muted">
                                {next ? `Eurostat, ${releaseLabel(next.at)}` : 'Eurostat publikuje dane zwykle w drugiej połowie miesiąca, o 11:00'}
                            </span>
                        </span>
                    </p>
                )}
            </SectionCard>

            <details className="group mk-card mk-card-pad">
                <summary className="flex min-h-11 cursor-pointer items-center text-sm font-semibold text-mk-text">Jak czytać</summary>
                <ul className="mt-2 space-y-2.5 text-sm leading-relaxed text-mk-text-soft">
                    <li><strong className="font-semibold text-mk-text">HICP</strong> to zharmonizowany indeks cen konsumpcyjnych Eurostatu, liczony tą samą metodą w każdym kraju UE. Dlatego nadaje się do porównań między krajami.</li>
                    <li>Dla Polski HICP różni się od CPI GUS (inny koszyk i wagi), więc liczba tutaj może się różnić o kilka dziesiątych od nagłówka w zakładce <a href="/ceny" className="font-medium text-mk-primary underline-offset-2 hover:underline">Ceny</a>.</li>
                    <li><strong className="font-semibold text-mk-text">Zmiana m/m</strong> to zmiana stopy rocznej wobec poprzedniego miesiąca w punktach procentowych, a nie inflacja miesiąc do miesiąca.</li>
                    <li>Strefa euro od 1 stycznia 2026 obejmuje 21 państw (z Bułgarią). Eurostat łączy zmiany składu łańcuchowo.</li>
                    <li>Cel EBC (2%) dotyczy strefy euro. Cel NBP (2,5% ±1 p.p.) jest określony dla CPI, nie dla HICP, więc nie ma go na wykresie.</li>
                </ul>
            </details>
            </div>

            <footer className="border-t border-mk-border pt-3 text-xs leading-relaxed text-mk-muted">
                Źródło: Eurostat, zbiór{' '}
                <a href={EU_HICP_SOURCE_URL} target="_blank" rel="noopener noreferrer" className="font-medium text-mk-text-soft underline underline-offset-2">
                    {EU_HICP_DATASET}
                </a>{' '}
                (HICP, ECOICOP ver. 2), stopa roczna, wszystkie pozycje koszyka (coicop18=TOTAL). Aktualizacja zbioru {formatUpdatedPL(data.updated)}.
            </footer>
        </div>
    );
}
