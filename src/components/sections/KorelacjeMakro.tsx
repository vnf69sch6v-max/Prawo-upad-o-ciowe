'use client';

// Macierz korelacji makro — współczynnik Pearsona na wspólnych miesiącach (dane GUS).
import { useMemo, useState } from 'react';
import { Link2 } from 'lucide-react';
import {
    useGusCpiHeadline, useGusPpiHeadline, useGusUnemploymentNational,
    useGusIndustrialProduction, useGusRetailSales,
} from '@/lib/hooks';
import { plSeries } from '@/lib/series';
import { formatDecimalPL } from '@/lib/formatters';
import { SectionCard } from '@/components/ui/SectionCard';

interface Ind { key: string; short: string; label: string; data: ReturnType<typeof plSeries> }

function pearson(pairs: [number, number][]): number | null {
    const n = pairs.length;
    if (n < 8) return null;
    let sx = 0, sy = 0, sxy = 0, sxx = 0, syy = 0;
    for (const [x, y] of pairs) { sx += x; sy += y; sxy += x * y; sxx += x * x; syy += y * y; }
    const cov = n * sxy - sx * sy;
    const dx = Math.sqrt(n * sxx - sx * sx), dy = Math.sqrt(n * syy - sy * sy);
    return dx === 0 || dy === 0 ? null : cov / (dx * dy);
}

function corrColor(r: number | null): string {
    if (r == null) return '#F1F5F9';
    const t = Math.min(1, Math.abs(r));
    const lerp = (a: number, b: number) => Math.round(a + (b - a) * t);
    return r >= 0
        ? `rgb(${lerp(241, 29)},${lerp(245, 78)},${lerp(249, 216)})`
        : `rgb(${lerp(241, 185)},${lerp(245, 28)},${lerp(249, 28)})`;
}
const strength = (r: number) => { const a = Math.abs(r); return a >= 0.7 ? 'silna' : a >= 0.4 ? 'umiarkowana' : a >= 0.2 ? 'słaba' : 'znikoma'; };

export function KorelacjeMakro() {
    const cpiQ = useGusCpiHeadline();
    const ppiQ = useGusPpiHeadline();
    const unempQ = useGusUnemploymentNational();
    const indQ = useGusIndustrialProduction();
    const retQ = useGusRetailSales();
    const cpi = useMemo(() => plSeries(cpiQ.data), [cpiQ.data]);
    const ppi = useMemo(() => plSeries(ppiQ.data), [ppiQ.data]);
    const unemp = useMemo(() => plSeries(unempQ.data), [unempQ.data]);
    const ind = useMemo(() => plSeries(indQ.data), [indQ.data]);
    const ret = useMemo(() => plSeries(retQ.data), [retQ.data]);

    const inds: Ind[] = useMemo(() => [
        { key: 'cpi', short: 'CPI', label: 'Inflacja CPI (r/r)', data: cpi },
        { key: 'ppi', short: 'PPI', label: 'Ceny producenta (r/r)', data: ppi },
        { key: 'ind', short: 'Prod.', label: 'Produkcja przemysłowa (r/r)', data: ind },
        { key: 'ret', short: 'Detal', label: 'Sprzedaż detaliczna (r/r)', data: ret },
        { key: 'unemp', short: 'Bezr.', label: 'Bezrobocie rejestrowane', data: unemp },
    ], [cpi, ppi, ind, ret, unemp]);

    const [hover, setHover] = useState<{ i: number; j: number } | null>(null);

    const { matrix, pairs } = useMemo(() => {
        const maps = inds.map((it) => new Map(it.data.map((p) => [p.date, p.value])));
        const m: (number | null)[][] = inds.map(() => inds.map(() => null));
        const flat: { a: string; b: string; r: number }[] = [];
        for (let i = 0; i < inds.length; i++) {
            for (let j = 0; j < inds.length; j++) {
                if (i === j) { m[i][j] = 1; continue; }
                if (j < i) { m[i][j] = m[j][i]; continue; }
                const common: [number, number][] = [];
                maps[i].forEach((v, d) => { const w = maps[j].get(d); if (w != null && v != null) common.push([v, w]); });
                const r = pearson(common);
                m[i][j] = r;
                if (r != null) flat.push({ a: inds[i].label, b: inds[j].label, r });
            }
        }
        flat.sort((x, y) => Math.abs(y.r) - Math.abs(x.r));
        return { matrix: m, pairs: flat };
    }, [inds]);

    const ready = inds.every((it) => it.data.length > 0);

    return (
        <div className="space-y-6">
            <SectionCard editorial titleVariant="label" title="Macierz korelacji makro" subtitle="współczynnik Pearsona na wspólnych miesiącach · GUS (BDL/DBW)">
                {!ready ? <div className="mk-skeleton h-[360px] w-full" /> : (
                    <div className="overflow-x-auto">
                        <table className="border-separate" style={{ borderSpacing: 3 }}>
                            <thead>
                                <tr>
                                    <th />
                                    {inds.map((it) => <th key={it.key} className="pb-1 text-[11px] font-semibold text-mk-muted" title={it.label}>{it.short}</th>)}
                                </tr>
                            </thead>
                            <tbody>
                                {inds.map((row, i) => (
                                    <tr key={row.key}>
                                        <td className="pr-2 text-right text-[11px] font-semibold text-mk-muted" title={row.label}>{row.short}</td>
                                        {inds.map((_, j) => {
                                            const r = matrix[i][j];
                                            const on = hover && (hover.i === i || hover.j === j);
                                            return (
                                                <td key={j} onMouseEnter={() => setHover({ i, j })} onMouseLeave={() => setHover(null)}
                                                    className="text-center align-middle" style={{
                                                        width: 46, height: 40, background: corrColor(r), borderRadius: 6,
                                                        outline: hover?.i === i && hover?.j === j ? '2px solid #0F172A' : on ? '1px solid rgba(15,23,42,.2)' : 'none',
                                                        color: r != null && Math.abs(r) > 0.55 ? '#fff' : '#0F172A', fontSize: 12, fontWeight: 600,
                                                    }}>
                                                    {r != null ? formatDecimalPL(r, 2) : '—'}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
                <div className="mt-3 flex items-center justify-between gap-4 text-[11px] text-mk-faint">
                    <span>{hover ? <span className="font-medium text-mk-muted">{inds[hover.i].label} ↔ {inds[hover.j].label}: {matrix[hover.i][hover.j] != null ? `${formatDecimalPL(matrix[hover.i][hover.j]!, 2)} (${strength(matrix[hover.i][hover.j]!)})` : 'brak'}</span> : 'Najedź na komórkę. Przekątna = 1 (wskaźnik sam ze sobą).'}</span>
                    <span className="flex items-center gap-2 whitespace-nowrap">−1 <span className="h-2.5 w-24 rounded-full" style={{ background: 'linear-gradient(90deg, rgb(185,28,28), rgb(241,245,249), rgb(29,78,216))' }} /> +1</span>
                </div>
            </SectionCard>

            <SectionCard editorial titleVariant="label" title="Najsilniejsze zależności" subtitle="co porusza się razem — dodatnia: rosną/spadają zgodnie; ujemna: przeciwnie">
                <div className="space-y-1.5">
                    {pairs.slice(0, 8).map((p, k) => (
                        <div key={k} className="flex items-center gap-3 text-sm">
                            <Link2 size={14} className="shrink-0 text-mk-faint" />
                            <span className="min-w-0 flex-1 truncate text-mk-text-soft">{p.a} <span className="text-mk-faint">↔</span> {p.b}</span>
                            <span className="h-2 w-24 shrink-0 overflow-hidden rounded-full bg-mk-surface-alt"><span className="block h-2 rounded-full" style={{ width: `${Math.abs(p.r) * 100}%`, marginLeft: p.r < 0 ? 'auto' : undefined, background: corrColor(p.r) }} /></span>
                            <span className="w-24 shrink-0 text-right text-xs"><span className="font-semibold tnum" style={{ color: p.r >= 0 ? '#1D4ED8' : '#B91C1C' }}>{p.r > 0 ? '+' : ''}{formatDecimalPL(p.r, 2)}</span> <span className="text-mk-faint">{strength(p.r)}</span></span>
                        </div>
                    ))}
                </div>
                <p className="mt-3 text-[11px] text-mk-faint">Korelacja ≠ przyczynowość. Źródła: CPI/PPI (GUS DBW), produkcja i budownictwo (GUS DBW var 312), sprzedaż detaliczna (GUS BDL P3860), bezrobocie rejestrowane (GUS BDL P3559). Wskaźniki bez odpowiednika w GUS (rentowność 10Y, koniunktura konsumencka Eurostat) zostały usunięte.</p>
            </SectionCard>
        </div>
    );
}
