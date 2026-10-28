'use client';

import { useMemo } from 'react';
import { Building2, CalendarClock } from 'lucide-react';
import { EditorialHero } from '@/components/ui/EditorialHero';
import { CompactKpi } from '@/components/ui/CompactKpi';
import { SectionCard } from '@/components/ui/SectionCard';
import { InteractiveChart } from '@/components/ui/InteractiveChart';
import { QueryState } from '@/components/ui/QueryState';
import { formatDecimalPL, formatNumber } from '@/lib/formatters';
import { useIsClient } from '@/lib/use-is-client';
import { BOJ_CREDIT_EN, BOJ_CREDIT_PL } from '@/lib/jp/boj';
import {
    lastTankanPoint, nextTankanRelease, tankanDelta, tankanSentence, tankanSurveyLabel, type JpTankanPayload,
} from '@/lib/jp/tankan';
import { useJpTankan } from '@/lib/jp/use-jp-tankan';

const quarterTick = (d: string) => {
    const m = d.match(/^(\d{4})-Q([1-4])$/);
    if (!m) return d;
    const month = ['03', '06', '09', '12'][Number(m[2]) - 1];
    return `${month}.${m[1].slice(2)}`;
};
const shortDay = (iso: string) => new Date(`${iso}T12:00:00Z`).toLocaleDateString('pl-PL', { day: 'numeric', month: 'short', timeZone: 'UTC' });
const plTimeOf = (iso: string) => new Date(`${iso}T08:50:00+09:00`).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Warsaw' });
const level = (v: number) => Number.isInteger(v) ? formatNumber(v, 0) : formatDecimalPL(v, 1);
const signed = (v: number) => `${v > 0 ? '+' : ''}${level(v)}`;

export function JpTankan({ initial }: { initial: JpTankanPayload | null }) {
    const { data, isLoading, isError, refetch } = useJpTankan(initial);
    const isClient = useIsClient();
    const rows = useMemo(() => {
        const byDate = new Map<string, { date: string; mfg?: number; non?: number }>();
        for (const id of ['mfg', 'non'] as const) {
            for (const p of data?.series[id] ?? []) {
                const row = byDate.get(p.date) ?? { date: p.date };
                row[id] = p.value;
                byDate.set(p.date, row);
            }
        }
        return [...byDate.values()].sort((a, b) => a.date.localeCompare(b.date));
    }, [data]);

    if (!data) {
        if (isError) return <QueryState isError onRetry={() => { void refetch(); }} height={220} />;
        return <div className="mk-skeleton h-36 w-full" role="status" aria-busy={isLoading} aria-label="Ładowanie nastrojów firm w Japonii" />;
    }

    const mfg = lastTankanPoint(data.series.mfg);
    const non = lastTankanPoint(data.series.non);
    const sameNon = non && mfg && non.date === mfg.date ? non : null;
    const delta = tankanDelta(data.series.mfg);
    const nonDelta = tankanDelta(data.series.non);
    const next = isClient ? nextTankanRelease(new Date()) : null;
    const headline = !mfg
        ? 'Nastroje firm'
        : delta == null
            ? 'Nastroje dużych firm przemysłowych'
            : delta > 0
                ? `Nastroje dużych firm przemysłowych lepsze o ${level(delta)} ${delta === 1 ? 'punkt' : 'punkty'}`
                : delta < 0
                    ? `Nastroje dużych firm przemysłowych słabsze o ${level(Math.abs(delta))} ${Math.abs(delta) === 1 ? 'punkt' : 'punkty'}`
                    : 'Nastroje dużych firm przemysłowych bez zmian';

    return (
        <div className="space-y-4 lg:space-y-5">
            <EditorialHero
                ariaLabel="Nastroje firm w Japonii"
                period={mfg ? tankanSurveyLabel(mfg.date) : null}
                source="Bank of Japan"
                headline={headline}
                description={<>{tankanSentence(data)} To badanie Tankan: odsetek odpowiedzi „dobrze” minus odsetek odpowiedzi „źle”.</>}
                value={mfg ? level(mfg.value) : '—'}
                valueCaption="duże firmy przemysłowe"
                panelTitle="Obok"
                rows={[
                    { label: 'Wobec poprzedniego badania', value: delta == null ? '—' : `${signed(delta)} pkt` },
                    { label: 'Duże firmy spoza przemysłu', value: sameNon ? level(sameNon.value) : '—', divider: true },
                    { label: 'Ich zmiana', value: nonDelta == null ? '—' : `${signed(nonDelta)} pkt` },
                ]}
            />
            <div className="grid grid-cols-2 gap-2">
                <CompactKpi
                    label="Duże firmy przemysłowe"
                    icon={Building2}
                    value={mfg ? level(mfg.value) : '—'}
                    footnote={mfg ? `${tankanSurveyLabel(mfg.date)}${delta == null ? '' : ` · ${signed(delta)} pkt`}` : undefined}
                />
                <CompactKpi
                    label="Duże firmy spoza przemysłu"
                    icon={Building2}
                    value={sameNon ? level(sameNon.value) : '—'}
                    footnote={sameNon ? `${tankanSurveyLabel(sameNon.date)}${nonDelta == null ? '' : ` · ${signed(nonDelta)} pkt`}` : undefined}
                />
            </div>
            {rows.length > 1 && (
                <SectionCard editorial titleVariant="label" title="Nastroje dużych firm" subtitle="Tankan · punkty · wynik bieżący">
                    <InteractiveChart
                        data={rows} xKey="date" height={260} showRange initialRange="5L" ranges={['1R', '5L', 'ALL']} legend
                        valueFormatter={(v) => level(v)} xTickFormatter={quarterTick}
                        series={[
                            { key: 'mfg', name: 'Przemysł', color: '#DC2626', type: 'line' as const, strokeWidth: 2.5 },
                            { key: 'non', name: 'Spoza przemysłu', color: '#0369A1', type: 'line' as const, strokeWidth: 2 },
                        ]}
                    />
                </SectionCard>
            )}
            <SectionCard titleVariant="label" title="Kolejny komunikat">
                <ul className="space-y-2.5 text-sm">
                    {!isClient && <li className="mk-skeleton h-10 w-full" aria-hidden />}
                    {isClient && (
                        <li className="flex items-start gap-3">
                            <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-mk-surface-alt text-mk-muted">
                                <CalendarClock size={17} aria-hidden />
                            </span>
                            <span>
                                <span className="block font-semibold text-mk-text">
                                    Tankan{next && <> · {tankanSurveyLabel(next.period)}</>}
                                </span>
                                <span className="block text-mk-muted">
                                    {next ? <>{shortDay(next.date)}, 8:50 JST <span className="whitespace-nowrap">({plTimeOf(next.date)} w Polsce)</span></> : 'termin do uzupełnienia w kalendarzu'}
                                </span>
                            </span>
                        </li>
                    )}
                </ul>
            </SectionCard>
            <SectionCard titleVariant="label" title="Jak czytać nastroje">
                <ul className="space-y-2.5 text-sm leading-relaxed text-mk-text-soft">
                    <li><strong className="font-semibold text-mk-text">Wskaźnik</strong> — odsetek firm, które oceniają sytuację jako dobrą, minus odsetek tych, które oceniają ją jako złą. Wynik dodatni znaczy, że przeważają oceny dobre.</li>
                    <li><strong className="font-semibold text-mk-text">Duże firmy</strong> — osobno przemysł i reszta gospodarki. To te dwie liczby otwierają komunikat Banku Japonii.</li>
                    <li>Bank pyta też, czego firmy oczekują w następnym badaniu. Na stronie zostaje ocena bieżąca.</li>
                </ul>
            </SectionCard>
            <footer className="space-y-1 border-t border-mk-border pt-3 text-xs leading-relaxed text-mk-muted">
                <p>{BOJ_CREDIT_PL}</p>
                <p lang="en">{BOJ_CREDIT_EN}</p>
            </footer>
        </div>
    );
}
