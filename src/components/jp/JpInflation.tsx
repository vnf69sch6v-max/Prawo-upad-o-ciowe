'use client';

import { useMemo } from 'react';
import { Building2, CalendarClock, Gauge, Info, Tag, Zap, type LucideIcon } from 'lucide-react';
import { EditorialHero } from '@/components/ui/EditorialHero';
import { CompactKpiGrid, type CompactKpiItem } from '@/components/ui/CompactKpiGrid';
import { SectionCard } from '@/components/ui/SectionCard';
import { InteractiveChart } from '@/components/ui/InteractiveChart';
import { QueryState } from '@/components/ui/QueryState';
import { AXIS_INK } from '@/lib/chart-theme';
import { formatDataPeriod, formatDecimalPL } from '@/lib/formatters';
import { useIsClient } from '@/lib/use-is-client';
import { BOJ_TARGET, JP_CPI_DISPLAY_SERIES, JP_CPI_SERIES, changePp, chartRows, lastPoint, type JpCpiId, type JpCpiPayload } from '@/lib/jp/cpi';
import { JpBreakdown, jpBreakdownSentence } from './JpBreakdown';
import { jstDateKey, nextRelease, publishedOn, releaseInstant } from '@/lib/jp/calendar';
import { DASHBOARD_CREDIT_JA, DASHBOARD_CREDIT_PL } from '@/lib/jp/stat-dashboard';
import { useJpCpi } from '@/lib/jp/use-jp-cpi';

const ICONS: Record<JpCpiId, LucideIcon> = { headline: Tag, core: Gauge, coreCore: Zap, exFoodEnergy: Zap, tokyo: Building2 };
/** Odczyt z ostatnich 7 dni dostaje plakietkę „Nowy odczyt” (jak na Przeglądzie). */
const FRESH_DAYS = 7;

const pct = (v: number | null | undefined) => (v == null ? '—' : formatDecimalPL(v, 1));
const signedPp = (v: number) => `${v > 0 ? '+' : v < 0 ? '−' : '±'}${formatDecimalPL(Math.abs(v), 1)} p.p.`;
const monthTick = (d: string) => { const [y, m] = d.split('-'); return m ? `${m}.${y.slice(2)}` : d; };
const shortDay = (iso: string) => new Date(`${iso}T12:00:00Z`).toLocaleDateString('pl-PL', { day: 'numeric', month: 'short', timeZone: 'UTC' });
/** 8:30 JST w czasie polskim (zimą 0:30, latem 1:30 — Japonia nie zmienia czasu). */
const plTimeOf = (iso: string) => new Date(releaseInstant(iso)).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Warsaw' });

function daysSince(iso: string, todayJst: string): number {
    return Math.round((Date.parse(`${todayJst}T00:00:00Z`) - Date.parse(`${iso}T00:00:00Z`)) / 86_400_000);
}
function ageText(days: number): string {
    if (days <= 0) return 'dziś';
    if (days === 1) return 'wczoraj';
    return `${days} dni temu`;
}

export function JpInflation({ initial }: { initial: JpCpiPayload | null }) {
    const { data, isLoading, isError, refetch } = useJpCpi(initial);
    // „Dziś” tylko po hydratacji — strona jest renderowana na serwerze (React #418, AGENTS.md).
    const isClient = useIsClient();
    const todayJst = isClient ? jstDateKey() : null;

    const latest = useMemo(() => {
        const out = {} as Record<JpCpiId, ReturnType<typeof lastPoint>>;
        for (const cfg of JP_CPI_SERIES) out[cfg.id] = lastPoint(data?.series[cfg.id]);
        return out;
    }, [data]);
    const rows = useMemo(() => (data ? chartRows(data.series) : []), [data]);

    /** Ile dni temu liczba trafiła na stronę — null przed hydratacją albo bez daty w kalendarzu. */
    const ageOf = (id: JpCpiId): number | null => {
        const on = publishedOn(id, latest[id]);
        return todayJst && on ? Math.max(0, daysSince(on, todayJst)) : null;
    };

    if (!data) {
        if (isError) return <QueryState isError onRetry={() => { void refetch(); }} height={320} />;
        return (
            <div className="space-y-3" role="status" aria-busy={isLoading} aria-label="Ładowanie inflacji w Japonii">
                <div className="mk-skeleton h-40 w-full" />
                <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="mk-card h-20" />)}</div>
                <div className="mk-skeleton h-[280px] w-full" />
            </div>
        );
    }

    const head = latest.headline;
    const dev = head ? Math.round((head.value - BOJ_TARGET) * 10) / 10 : null;
    const headline = dev == null ? 'Inflacja w Japonii'
        : dev > 0.1 ? 'Inflacja w Japonii powyżej celu BOJ'
            : dev < -0.1 ? 'Inflacja w Japonii poniżej celu BOJ'
                : 'Inflacja w Japonii blisko celu BOJ';
    const headAge = ageOf('headline');
    const tokyo = latest.tokyo;
    // Wstępne Tokio za nowszy miesiąc niż dane krajowe = najświeższy sygnał, zanim przyjdą dane krajowe.
    const tokyoAhead = tokyo && head && tokyo.date > head.date ? tokyo : null;

    const kpis: CompactKpiItem[] = JP_CPI_DISPLAY_SERIES.map((cfg) => {
        const p = latest[cfg.id];
        const ch = changePp(data.series[cfg.id]);
        const age = ageOf(cfg.id);
        const parts = [
            age != null && age <= FRESH_DAYS ? 'nowe' : null,
            p?.provisional ? 'wstępne' : null,
            p ? `dane za ${formatDataPeriod(p.date)}` : null,
        ].filter(Boolean);
        return {
            key: cfg.id, label: cfg.label, value: pct(p?.value), unit: '%', icon: ICONS[cfg.id],
            delta: ch != null ? { value: ch, unit: 'pp', invert: true } : undefined,
            footnote: parts.join(' · '),
        };
    });

    // Zdanie-wniosek z rozbicia (najnowszy miesiąc wspólny czterem miarom) — liczby, nie „dziś”, więc w HTML z serwera.
    const sentence = jpBreakdownSentence(data.series);

    const upcoming = todayJst
        ? (['tokyo', 'national'] as const).map((kind) => ({ kind, next: nextRelease(kind, new Date()) }))
        : [];

    return (
        <div className="space-y-4 lg:space-y-5">
            <EditorialHero
                ariaLabel="Inflacja w Japonii — najważniejszy odczyt"
                period={head ? formatDataPeriod(head.date) : null}
                badge={headAge != null && headAge <= FRESH_DAYS ? `Nowy odczyt · ${ageText(headAge)}` : null}
                source="Statistics Bureau of Japan"
                headline={headline}
                description={
                    <>
                        CPI ogółem wynosi {pct(head?.value)}% r/r przy celu BOJ {BOJ_TARGET}%.{' '}
                        {sentence ?? `Bazowa (bez świeżej żywności) — ${pct(latest.core?.value)}%, bez świeżej żywności i energii — ${pct(latest.coreCore?.value)}%.`}
                        {tokyoAhead && ` Wstępny odczyt z Tokio za ${formatDataPeriod(tokyoAhead.date).split(' ')[0]}: ${pct(tokyoAhead.value)}%.`}
                    </>
                }
                value={pct(head?.value)}
                unit="%"
                delta={changePp(data.series.headline)}
                panelTitle="Wobec celu BOJ"
                gauge={head ? { pct: Math.max(3, Math.min(97, (head.value / (BOJ_TARGET * 2)) * 100)), labels: ['0%', `cel ${BOJ_TARGET}%`, `${BOJ_TARGET * 2}%`] } : null}
                rows={[
                    { label: 'Odchylenie od celu', value: dev != null ? signedPp(dev) : '—' },
                    { label: 'Bazowa (bez świeżej żywności)', value: `${pct(latest.core?.value)}%` },
                    { label: 'Bez świeżej żywności i energii', value: `${pct(latest.coreCore?.value)}%` },
                    { label: tokyo?.provisional ? 'Tokio (wstępne)' : 'Tokio', value: `${pct(tokyo?.value)}%`, divider: true },
                ]}
            />

            <CompactKpiGrid items={kpis} label="Miary inflacji (r/r)" columns={4} dense />

            <JpBreakdown series={data.series} />

            <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
                <SectionCard editorial titleVariant="label" title="Inflacja w Japonii — trend" subtitle="rok do roku (%) · Statistics Bureau of Japan, baza 2025">
                    <InteractiveChart
                        data={rows} xKey="date" height={300} unit="%" showRange initialRange="5L" ranges={['1R', '3L', '5L', 'ALL']} legend
                        valueFormatter={(v) => formatDecimalPL(v, 1)} xTickFormatter={monthTick}
                        referenceLines={[{ y: BOJ_TARGET, label: `Cel BOJ ${BOJ_TARGET}%`, color: AXIS_INK }, { y: 0, color: '#CBD2DD' }]}
                        series={JP_CPI_DISPLAY_SERIES.map((cfg) => ({
                            key: cfg.id, name: cfg.short, color: cfg.color, type: 'line' as const,
                            strokeWidth: cfg.id === 'headline' ? 2.5 : cfg.id === 'tokyo' ? 1.5 : 2, dashed: cfg.id === 'tokyo',
                        }))}
                    />
                </SectionCard>

                <div className="grid min-w-0 gap-4">
                    <SectionCard titleVariant="label" title="Kolejne publikacje">
                        <ul className="space-y-2.5 text-sm">
                            {!isClient && <li className="mk-skeleton h-10 w-full" aria-hidden />}
                            {upcoming.map(({ kind, next }) => (
                                <li key={kind} className="flex items-start gap-3">
                                    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-mk-surface-alt text-mk-muted">
                                        <CalendarClock size={17} aria-hidden />
                                    </span>
                                    <span className="min-w-0">
                                        <span className="block font-semibold text-mk-text">
                                            {kind === 'tokyo' ? 'Tokio (wstępne)' : 'Cała Japonia'}
                                            {next && <> · za {formatDataPeriod(next.period).split(' ')[0]}</>}
                                        </span>
                                        <span className="block text-mk-muted">
                                            {next ? <>{shortDay(next.date)}, 8:30 JST <span className="whitespace-nowrap">({plTimeOf(next.date)} w Polsce)</span></> : 'termin do uzupełnienia w kalendarzu'}
                                        </span>
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </SectionCard>

                    <SectionCard titleVariant="label" title="Jak czytać">
                        <ul className="space-y-2.5 text-sm leading-relaxed text-mk-text-soft">
                            {JP_CPI_DISPLAY_SERIES.map((cfg) => (
                                <li key={cfg.id} className="flex gap-2">
                                    <span className="mt-[7px] h-2 w-2 shrink-0 rounded-full" style={{ background: cfg.color }} aria-hidden />
                                    <span><strong className="font-semibold text-mk-text">{cfg.label}</strong> — {cfg.hint}</span>
                                </li>
                            ))}
                            {[
                                'Rozbicie to różnice między oficjalnymi miarami: o ile zmienia się stopa inflacji, gdy do koszyka dołączamy kolejno żywność poza świeżą, energię i świeżą żywność. Kolejność wynika z miar, które publikuje Statistics Bureau.',
                                'To nie są wkłady (寄与度) z komunikatu. Grupa, która drożeje w tym samym tempie co reszta koszyka, ma różnicę 0,0 p.p., nawet jeśli jej ceny rosną. Oficjalne wkłady pokażemy w kolejnym kroku.',
                                'Bez żywności i energii: alkohol zostaje w koszyku, a gastronomia nie. To miara bliska inflacji bazowej NBP, ale nie identyczna. Różnice stóp zaokrąglonych do 0,1 mają dokładność ±0,1 p.p.',
                                'Od sierpnia 2026 r. Japonia liczy CPI w bazie 2025. Pokazujemy tylko nową bazę — historię przeliczył Statistics Bureau.',
                            ].map((t) => (
                                <li key={t.slice(0, 24)} className="flex gap-2 text-mk-muted">
                                    <Info size={15} className="mt-0.5 shrink-0" aria-hidden />
                                    <span>{t}</span>
                                </li>
                            ))}
                        </ul>
                    </SectionCard>
                </div>
            </div>

            <footer className="space-y-1 border-t border-mk-border pt-3 text-xs leading-relaxed text-mk-muted">
                <p>
                    Źródło: Statistics Bureau of Japan (総務省統計局) przez{' '}
                    <a href="https://dashboard.e-stat.go.jp/" className="font-semibold text-mk-text underline-offset-2 hover:underline" rel="noopener" target="_blank">Statistics Dashboard</a>
                    {' '}· dane surowe, r/r. Godziny publikacji: 8:30 czasu japońskiego.
                </p>
                <p lang="ja">{DASHBOARD_CREDIT_JA}</p>
                <p>{DASHBOARD_CREDIT_PL}</p>
            </footer>
        </div>
    );
}
