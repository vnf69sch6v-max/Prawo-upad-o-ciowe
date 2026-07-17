'use client';

// Animowany wykres bąbelkowy inflacji w czasie (Gapminder-style).
// x = waga w koszyku (co strukturalnie waży dla CPI), y = dynamika r/r (jak „gorąca" kategoria),
// rozmiar bąbla = |wkład| = waga × |r/r|. Scrubber + Play przewijają 10 lat historii GUS —
// widać, jak działy „wjeżdżają" w strefę wysokiej inflacji 2022–23 i z niej schodzą.
import { useEffect, useMemo, useState } from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, ZAxis, Cell, ReferenceLine, Tooltip } from 'recharts';
import { ResponsiveContainer } from '@/components/ui/ChartContainer';
import { Play, Pause } from 'lucide-react';
import { SectionCard } from '@/components/ui/SectionCard';
import { formatDecimalPL } from '@/lib/formatters';
import type { CpiDivision } from '@/lib/hooks';
import { AXIS_INK } from '@/lib/chart-theme';

const monthTick = (d: string) => { const [y, m] = d.split('-'); return m ? `${m}.${y.slice(2)}` : d; };
const STEP_MS = 750;

interface Props { divisions: CpiDivision[]; colorFor: (i: number) => string; onSelect?: (code: string) => void }

export function InflationBubbles({ divisions, colorFor, onSelect }: Props) {
    // Oś czasu = posortowana unia dat z r/r we wszystkich działach.
    const dates = useMemo(() => {
        const s = new Set<string>();
        divisions.forEach((d) => d.history.forEach((h) => { if (h.yoy != null) s.add(h.date); }));
        return [...s].sort();
    }, [divisions]);

    const [idx, setIdx] = useState<number | null>(null); // null = pokazuj najnowszy okres (bez efektu inicjalizującego)
    const [playing, setPlaying] = useState(false);
    const lastIdx = Math.max(0, dates.length - 1);
    const clampedIdx = idx == null ? lastIdx : Math.min(idx, lastIdx);

    useEffect(() => {
        if (!playing || dates.length < 2) return;
        const id = setInterval(() => setIdx((i) => ((i ?? lastIdx) + 1) % dates.length), STEP_MS);
        return () => clearInterval(id);
    }, [playing, dates.length, lastIdx]);

    const date = dates[clampedIdx] ?? '';
    const frame = useMemo(() => divisions.map((d, i) => {
        const h = d.history.find((x) => x.date === date);
        if (!h || h.yoy == null) return null;
        return { code: d.code, name: d.name, x: d.weight, y: h.yoy, z: +(d.weight * Math.abs(h.yoy)).toFixed(1), contribution: +((d.weight / 100) * h.yoy).toFixed(2), color: colorFor(i) };
    }).filter((p): p is NonNullable<typeof p> => p != null), [divisions, date, colorFor]);

    const yMax = useMemo(() => { let m = 6; divisions.forEach((d) => d.history.forEach((h) => { if (h.yoy != null && h.yoy > m) m = h.yoy; })); return Math.ceil(m / 5) * 5; }, [divisions]);
    const yMin = useMemo(() => { let m = 0; divisions.forEach((d) => d.history.forEach((h) => { if (h.yoy != null && h.yoy < m) m = h.yoy; })); return Math.floor(m / 5) * 5; }, [divisions]);
    const xMax = useMemo(() => Math.ceil(Math.max(...divisions.map((d) => d.weight), 10) / 5) * 5, [divisions]);
    // Globalne maksimum rozmiaru (waga×|r/r|) po wszystkich okresach — dzięki temu bąble są
    // PORÓWNYWALNE w czasie (rosną wchodząc w 2022), a nie przeskalowywane per klatka.
    const zMax = useMemo(() => { let m = 1; divisions.forEach((d) => d.history.forEach((h) => { if (h.yoy != null) { const z = d.weight * Math.abs(h.yoy); if (z > m) m = z; } })); return m; }, [divisions]);

    if (dates.length < 2) return null;

    return (
        <SectionCard title="Mapa działów w czasie" subtitle="waga w koszyku × dynamika r/r · rozmiar = wkład do CPI · przewiń oś czasu lub odtwórz 10 lat"
            actions={<div className="flex items-center gap-3">
                <button onClick={() => { if (clampedIdx >= dates.length - 1) setIdx(0); setPlaying((p) => !p); }}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-mk-primary px-3 py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-90">
                    {playing ? <><Pause size={13} /> Pauza</> : <><Play size={13} /> Odtwórz</>}
                </button>
                <span className="tnum text-sm font-bold text-mk-text">{monthTick(date)}</span>
            </div>}>
            <ResponsiveContainer width="100%" height={380}>
                <ScatterChart margin={{ top: 10, right: 24, bottom: 34, left: 6 }}>
                    <XAxis type="number" dataKey="x" domain={[0, xMax]} name="waga" unit="%" tick={{ fill: AXIS_INK, fontSize: 12 }} axisLine={{ stroke: '#E7EAF0' }} tickLine={false}
                        label={{ value: 'waga w koszyku (%)', position: 'bottom', offset: 16, fill: AXIS_INK, fontSize: 12 }} />
                    <YAxis type="number" dataKey="y" domain={[yMin, yMax]} name="r/r" unit="%" tick={{ fill: AXIS_INK, fontSize: 12 }} axisLine={false} tickLine={false} width={44}
                        label={{ value: 'dynamika r/r (%)', angle: -90, position: 'insideLeft', offset: 16, fill: AXIS_INK, fontSize: 12, style: { textAnchor: 'middle' } }} />
                    <ZAxis type="number" dataKey="z" domain={[0, zMax]} range={[80, 1400]} />
                    <ReferenceLine y={0} stroke="#CBD5E1" />
                    <ReferenceLine y={2.5} stroke={AXIS_INK} strokeDasharray="4 4" label={{ value: 'Cel NBP', position: 'right', fill: AXIS_INK, fontSize: 11 }} />
                    <Tooltip cursor={{ strokeDasharray: '3 3' }} content={({ active, payload }) => {
                        if (!active || !payload?.length) return null;
                        const p = payload[0].payload as { code: string; name: string; x: number; y: number; contribution: number };
                        return <div style={{ background: '#fff', border: '1px solid #E7EAF0', borderRadius: 10, padding: '8px 12px', boxShadow: '0 6px 16px rgba(16,24,40,.12)', fontSize: 13 }}>
                            <div style={{ fontWeight: 600, color: '#0F172A' }}>{p.code} · {p.name}</div>
                            <div style={{ color: '#64748B', marginTop: 2 }}>r/r <b style={{ color: p.y >= 0 ? '#B91C1C' : '#16A34A' }}>{p.y > 0 ? '+' : ''}{formatDecimalPL(p.y, 1)}%</b> · waga {formatDecimalPL(p.x, 1)}%</div>
                            <div style={{ color: '#64748B' }}>wkład {p.contribution > 0 ? '+' : ''}{formatDecimalPL(p.contribution, 2)} pp</div>
                        </div>;
                    }} />
                    <Scatter data={frame} isAnimationActive={false} onClick={(e: { code?: string }) => e?.code && onSelect?.(e.code)} cursor={onSelect ? 'pointer' : undefined}>
                        {frame.map((p) => <Cell key={p.code} fill={p.color} fillOpacity={0.82} stroke="#fff" strokeWidth={1.5} />)}
                    </Scatter>
                </ScatterChart>
            </ResponsiveContainer>

            {/* Scrubber osi czasu */}
            <div className="mt-1 flex items-center gap-3 px-1">
                <span className="w-12 shrink-0 text-[11px] text-mk-faint">{monthTick(dates[0])}</span>
                <input type="range" min={0} max={dates.length - 1} step={1} value={clampedIdx} aria-label="Oś czasu"
                    onChange={(e) => { setPlaying(false); setIdx(+e.target.value); }} className="h-1.5 flex-1 cursor-pointer" style={{ accentColor: '#2563EB' }} />
                <span className="w-12 shrink-0 text-right text-[11px] text-mk-faint">{monthTick(dates[dates.length - 1])}</span>
            </div>
            <p className="mt-2 text-[11px] text-mk-faint">Bąbel wyżej = szybszy wzrost cen; większy = większy wkład do CPI (waga × dynamika). Kliknij bąbel, aby otworzyć szczegóły działu. Prawa strona = kategorie strukturalnie ważne (żywność, mieszkanie).</p>
        </SectionCard>
    );
}
