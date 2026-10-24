'use client';

import { useMemo, useState } from 'react';
import { Bar, CartesianGrid, ComposedChart, Line, ReferenceLine, Tooltip, XAxis, YAxis } from 'recharts';
import { usePlotWidth } from '@/components/ui/ChartContainer';
import { SectionCard } from '@/components/ui/SectionCard';
import { Segmented } from '@/components/ui/Segmented';
import { AXIS_INK, GRID, TICK_FONT, xTickStep } from '@/lib/chart-theme';
import { RANGE_MONTHS, sliceByMonths } from '@/lib/chart-range';
import { formatDataPeriod, formatDecimalPL } from '@/lib/formatters';
import { useCanHover } from '@/lib/use-can-hover';
import { BOJ_TARGET, type JpCpiPayload } from '@/lib/jp/cpi';
import {
    NEUTRAL_MAX_TENTHS, STEP_LABEL, STEP_ORDER, breakdownPeriodLabel, breakdownRows, breakdownSentence,
    formatLevel, formatStep, latestBreakdown, stepQualifier, type BreakdownRow, type StepId,
} from '@/lib/jp/breakdown';

// Kolory jak w polskiej „Dekompozycji CPI”: podnosi — czerwony, obniża — zielony, poziomy — granat.
const UP = '#DC2626';
const DOWN = '#16A34A';
const LEVEL = '#1E3A5F';
const NEUTRAL = '#94A3B8';
const STEP_COLOR: Record<StepId, string> = { food: '#D97706', energy: '#7C3AED', fresh: '#0891B2' };
const TOTAL_COLOR = '#2563EB'; // jak linia CPI ogółem na wykresie trendu

const monthTick = (d: string) => { const [y, m] = d.split('-'); return m ? `${m}.${y.slice(2)}` : d; };

/** Schody: wspólna skala [min(0, poziomy), max(poziomy)], odcinek od poprzedniego poziomu do nowego. */
function Steps({ row, prevR }: { row: BreakdownRow; prevR: number | null }) {
    const levels = [row.R, row.CC, row.C, row.T];
    const lo = Math.min(0, ...levels);
    const hi = Math.max(0.1, ...levels);
    const x = (v: number) => ((v - lo) / (hi - lo)) * 100;
    const after: Record<StepId, string> = {
        food: `→ ${formatLevel(row.CC)} bez świeżej żywności i energii`,
        energy: `→ ${formatLevel(row.C)} bez świeżej żywności (bazowa)`,
        fresh: `→ ${formatLevel(row.T)} CPI ogółem`,
    };
    const bar = (from: number, to: number, color: string) => {
        const a = Math.min(x(from), x(to));
        const w = Math.abs(x(to) - x(from));
        return <span className="absolute inset-y-0 rounded-full" style={{ left: `${a}%`, width: `${Math.max(w, 0.8)}%`, background: color }} />;
    };
    const items = [
        { key: 'R', label: 'Bez żywności i energii', value: formatLevel(row.R), sub: `punkt wyjścia${prevR != null ? ` · miesiąc wcześniej ${formatLevel(prevR)}` : ''}`, track: bar(0, row.R, LEVEL), strong: false },
        ...STEP_ORDER.map((id) => {
            const from = id === 'food' ? row.R : id === 'energy' ? row.CC : row.C;
            const d = row[id];
            const neutral = Math.abs(Math.round(d * 10)) <= NEUTRAL_MAX_TENTHS;
            return {
                key: id, label: `+ ${STEP_LABEL[id].toLowerCase()}`, value: formatStep(d),
                sub: `${after[id]} · ${stepQualifier(d)}`,
                track: neutral
                    ? <span className="absolute -inset-y-0.5 w-0.5 rounded bg-mk-faint" style={{ left: `${x(from)}%` }} />
                    : bar(from, from + d, d > 0 ? UP : DOWN),
                strong: false,
            };
        }),
        { key: 'T', label: '= CPI ogółem', value: formatLevel(row.T), sub: '', track: bar(0, row.T, LEVEL), strong: true },
    ];
    return (
        <ol className="space-y-3" aria-label="Od inflacji bez żywności i energii do CPI ogółem">
            {items.map((it) => (
                <li key={it.key} className={it.strong ? 'border-t border-mk-border pt-3' : ''}>
                    <div className="flex items-baseline justify-between gap-3">
                        <span className={`min-w-0 text-sm ${it.strong ? 'font-bold text-mk-text' : 'font-semibold text-mk-text'}`}>{it.label}</span>
                        <span className={`shrink-0 whitespace-nowrap tabular-nums ${it.strong ? 'text-base font-extrabold' : 'text-sm font-bold'} text-mk-text`}>{it.value}</span>
                    </div>
                    {it.sub && <p className="mt-0.5 text-xs leading-snug text-mk-muted">{it.sub}</p>}
                    <div className="relative mt-1.5 h-2 rounded-full bg-mk-surface-alt" aria-hidden>{it.track}</div>
                </li>
            ))}
        </ol>
    );
}

type ChartRow = { date: string; R: number; food: number; energy: number; fresh: number; T: number };

function BreakdownTooltip({ active, payload, maxWidth }: { active?: boolean; payload?: Array<{ payload: ChartRow }>; maxWidth?: number }) {
    if (!active || !payload?.length) return null;
    const r = payload[0].payload;
    return (
        <div style={{ background: '#fff', border: '1px solid #E7EAF0', borderRadius: 10, padding: '8px 12px', boxShadow: '0 6px 16px rgba(16,24,40,.12)', fontSize: 12.5, maxWidth }}>
            <div style={{ fontWeight: 700, color: '#0F172A', marginBottom: 4 }}>{formatDataPeriod(r.date)}</div>
            <div style={{ color: '#334155' }}>Bez żywności i energii <b>{formatLevel(r.R)}</b></div>
            {STEP_ORDER.map((id) => (
                <div key={id} style={{ color: '#334155' }}>
                    <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: 2, background: STEP_COLOR[id], marginRight: 6 }} />
                    {STEP_LABEL[id]} <b>{formatStep(r[id])}</b>
                </div>
            ))}
            <div style={{ color: '#0F172A', borderTop: '1px solid #E7EAF0', marginTop: 4, paddingTop: 4 }}>= CPI ogółem <b>{formatLevel(r.T)}</b></div>
        </div>
    );
}

function BreakdownChart({ rows }: { rows: BreakdownRow[] }) {
    const [range, setRange] = useState<'2L' | '5L'>('2L');
    const trigger = useCanHover() ? 'hover' : 'click';
    const { ref, width } = usePlotWidth();
    const data: ChartRow[] = useMemo(
        () => sliceByMonths(rows.map((r) => ({ date: r.date, R: r.R, food: r.food, energy: r.energy, fresh: r.fresh, T: r.T })), 'date', RANGE_MONTHS[range] ?? 24),
        [rows, range],
    );
    const height = width > 0 && width < 480 ? 260 : 300;
    const step = xTickStep(width, data.length);
    return (
        <div>
            <div className="mb-2 flex justify-end">
                <Segmented size="sm" value={range} onChange={setRange} aria-label="Zakres rozbicia" options={[{ value: '2L', label: '2L' }, { value: '5L', label: '5L' }]} />
            </div>
            <div ref={ref} style={{ width: '100%', height, minWidth: 0 }}>
                {width >= 32 && (
                    <ComposedChart width={width} height={height} data={data} stackOffset="sign" margin={{ top: 6, right: 8, left: -14, bottom: 0 }} barCategoryGap="18%">
                        <CartesianGrid stroke={GRID} vertical={false} />
                        <XAxis dataKey="date" tick={{ fill: AXIS_INK, fontSize: TICK_FONT }} tickFormatter={monthTick} interval={Math.max(0, step - 1)} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: AXIS_INK, fontSize: TICK_FONT }} tickFormatter={(v) => formatDecimalPL(v, 0)} axisLine={false} tickLine={false} width={40} />
                        <ReferenceLine y={0} stroke="#CBD2DD" />
                        <ReferenceLine y={BOJ_TARGET} stroke={AXIS_INK} strokeDasharray="4 4" label={{ value: `Cel BOJ ${BOJ_TARGET}%`, position: 'insideTopLeft', fill: AXIS_INK, fontSize: 10 }} />
                        <Tooltip trigger={trigger} isAnimationActive={false} cursor={{ fill: 'rgba(0,0,0,0.04)' }} content={<BreakdownTooltip maxWidth={Math.max(180, width - 16)} />} />
                        <Bar dataKey="R" name="Bez żywności i energii (%)" stackId="s" fill={NEUTRAL} isAnimationActive={false} />
                        {STEP_ORDER.map((id) => (
                            <Bar key={id} dataKey={id} name={`${STEP_LABEL[id]} (p.p.)`} stackId="s" fill={STEP_COLOR[id]} isAnimationActive={false} />
                        ))}
                        <Line dataKey="T" name="CPI ogółem (%)" type="monotone" stroke={TOTAL_COLOR} strokeWidth={2.5} dot={false} isAnimationActive={false} />
                    </ComposedChart>
                )}
            </div>
            <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-mk-muted" aria-label="Legenda">
                <li className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm" style={{ background: NEUTRAL }} />Bez żywności i energii (%)</li>
                {STEP_ORDER.map((id) => (
                    <li key={id} className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm" style={{ background: STEP_COLOR[id] }} />{STEP_LABEL[id]} (p.p.)</li>
                ))}
                <li className="flex items-center gap-1.5"><span className="h-0.5 w-3.5 rounded" style={{ background: TOTAL_COLOR }} />CPI ogółem (%)</li>
            </ul>
        </div>
    );
}

/** Zdanie-wniosek do opisu hero (null, gdy nie ma kompletu czterech miar). */
export function jpBreakdownSentence(series: JpCpiPayload['series'] | undefined): string | null {
    const b = latestBreakdown(series);
    return b ? breakdownSentence(b.row, b.prevR) : null;
}

/** „Co napędza inflację” — rozbicie na różnice oficjalnych miar (docs/specs/2026-10-24-jp-inflacja-rozbicie.md). */
export function JpBreakdown({ series }: { series: JpCpiPayload['series'] }) {
    const rows = useMemo(() => breakdownRows(series), [series]);
    const latest = useMemo(() => latestBreakdown(series), [series]);

    return (
        <SectionCard
            editorial
            titleVariant="label"
            title="Co napędza inflację"
            subtitle={latest ? `${breakdownPeriodLabel(latest.row)} · różnice oficjalnych miar CPI, p.p.` : 'różnice oficjalnych miar CPI, p.p.'}
        >
            {!latest ? (
                <p className="rounded-xl bg-mk-surface-alt px-3.5 py-3 text-sm text-mk-text-soft">
                    Brak danych do rozbicia — potrzebne są wszystkie cztery miary za ten sam miesiąc.
                </p>
            ) : (
                <div className="space-y-4">
                    <p className="text-[15px] font-bold leading-snug text-mk-text">{breakdownSentence(latest.row, latest.prevR)}</p>
                    <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
                        <div className="min-w-0 lg:order-2"><Steps row={latest.row} prevR={latest.prevR} /></div>
                        <div className="min-w-0 lg:order-1">
                            <h4 className="mb-1 text-xs font-semibold text-mk-muted">Od miary bez żywności i energii do CPI ogółem</h4>
                            <BreakdownChart rows={rows} />
                        </div>
                    </div>
                    <footer className="space-y-0.5 border-t border-mk-border pt-2.5 text-[11px] leading-relaxed text-mk-muted">
                        <p>Opracowanie Savori na podstawie danych Statistics Bureau of Japan (CPI, baza 2025, Statistics Dashboard). Różnice miar policzone przez Savori.</p>
                        <p lang="ja">出典：総務省統計局「消費者物価指数」（統計ダッシュボード）を加工して作成</p>
                    </footer>
                </div>
            )}
        </SectionCard>
    );
}
