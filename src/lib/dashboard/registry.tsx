'use client';

// ─── Katalog widgetów pulpitu Przeglądu ──────────────────────────────────────
// Każdy widget jest SAMODZIELNY: wywołuje własne hooki (te same, których używają zwykłe strony),
// więc działa w izolacji na panelu. NIE reimplementujemy danych — opakowujemy istniejące hooki
// (lib/hooks.ts) i komponenty (KpiCard, InteractiveChart, LatestNews, PublicationDatesPanel…).
//
// ZASADA UCZCIWOŚCI DANYCH: nigdy nie zmyślamy liczb. Gdy źródło nie zwróci wartości → „—"
// (KPI) albo komunikat „Brak danych" (InteractiveChart ma go wbudowanego).

import { useMemo, type ReactNode } from 'react';
import {
    TrendingUp, Factory, ShoppingCart, Users, Percent, Landmark, Gem, Euro, DollarSign,
    LineChart, Banknote, Wallet, Newspaper, CalendarClock, Map as MapIcon, LayoutDashboard,
} from 'lucide-react';
import { OverviewHero } from '@/components/ui/OverviewHero';
import { WatchlistStrip } from '@/components/ui/WatchlistStrip';
import { useWatchlist } from '@/lib/watchlist';
import { useOverviewData } from './overview-data';
import { useEditMode } from '@/components/panel/EditModeContext';
import {
    useCpiFull, usePpiFull, useGusGdpAnnual, useGusIndustrialProduction, useGusRetailSales,
    useGusRegisteredUnemployment, useGUSWages, useStooq, useWig20, useNBPTable, useEURPLN,
    useUSDPLN, useNBPCurrencyHistory, useGold, useBondYield10YPl, useWibor, useNBPInterestRates,
    useRegionalGus,
} from '@/lib/hooks';
import { plSeries, lastOf, prevOf, monthTick, fmtPL, type Point } from '@/lib/series';
import { formatDecimalPL, formatNumber, formatDate, percentChange } from '@/lib/formatters';
import { KpiCard, type KpiCardProps } from '@/components/ui/KpiCard';
import { SectionCard } from '@/components/ui/SectionCard';
import { InteractiveChart, type ChartSeries } from '@/components/ui/InteractiveChart';
import { DeltaChip } from '@/components/ui/DeltaChip';
import { LatestNews } from '@/components/ui/RelatedNews';
import { PublicationDatesPanel } from '@/components/ui/PublicationDatesPanel';
import { cellHeightPx, type WidgetDef, type WidgetSize } from './types';

const RED = '#DC2626';

// ── Wspólne skorupy kafli ────────────────────────────────────

/** Skorupa wykresu — karta editorial wypełniająca komórkę, z metryczką źródła u dołu. */
function ChartShell({ title, size, source, children }: {
    title: string; size: WidgetSize; source?: string; children: (chartHeight: number) => ReactNode;
}) {
    // Wysokość komórki minus nagłówek/padding/metryczka. Klamrujemy, żeby przy h=1 wykres był czytelny.
    const chartHeight = Math.max(110, cellHeightPx(size.h) - 104);
    return (
        <SectionCard title={title} titleVariant="label" editorial className="flex h-full flex-col">
            <div className="min-h-0 flex-1">{children(chartHeight)}</div>
            {source && <p className="mt-2 shrink-0 text-[11px] text-mk-faint">{source}</p>}
        </SectionCard>
    );
}

/** Skorupa tabeli — karta z tytułem i przewijaną treścią. */
function TableShell({ title, source, children }: { title: string; source?: string; children: ReactNode }) {
    return (
        <SectionCard title={title} titleVariant="label" editorial className="flex h-full flex-col">
            <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
            {source && <p className="mt-2 shrink-0 text-[11px] text-mk-faint">{source}</p>}
        </SectionCard>
    );
}

const ppDelta = (s: Point[]): KpiCardProps['delta'] => {
    const a = lastOf(s), b = prevOf(s);
    return a != null && b != null ? { value: +(a - b).toFixed(1), unit: 'pp', invert: true } : undefined;
};

// ═══ CENY ══════════════════════════════════════════════════════

function CpiKpi() {
    const q = useCpiFull();
    const s = useMemo(() => (q.data?.headline ?? []).filter((h) => h.yoy != null).map((h) => ({ date: h.date, value: h.yoy as number })), [q.data]);
    return <KpiCard label="Inflacja CPI (r/r)" value={fmtPL(lastOf(s))} unit="%" icon={TrendingUp} loading={q.isLoading}
        delta={ppDelta(s)} footnote={s.length ? `GUS · ${s[s.length - 1].date}` : 'GUS · cel NBP 2,5%'} href="/ceny?tab=inflacja" />;
}

function CpiChart({ size }: { size: WidgetSize }) {
    const q = useCpiFull();
    const data = useMemo(() => (q.data?.headline ?? []).map((h) => ({ date: h.date, yoy: h.yoy, mom: h.mom })), [q.data]);
    const series: ChartSeries[] = [
        { key: 'yoy', name: 'r/r', color: RED, type: 'area' },
        { key: 'mom', name: 'm/m', color: '#94A3B8', type: 'line' },
    ];
    return (
        <ChartShell title="Inflacja CPI — trend" size={size} source={q.data?.source ?? 'GUS DBW'}>
            {(h) => <InteractiveChart data={data} xKey="date" series={series} height={h} unit="%" showRange initialRange="3L" ranges={['1R', '3L', '5L', 'ALL']} xTickFormatter={monthTick} valueFormatter={(v) => formatDecimalPL(v, 1)} referenceLines={[{ y: 2.5, label: 'Cel NBP', color: '#64748B' }]} />}
        </ChartShell>
    );
}

function PpiKpi() {
    const q = usePpiFull();
    const s = useMemo(() => (q.data?.headline ?? []).filter((h) => h.yoy != null).map((h) => ({ date: h.date, value: h.yoy as number })), [q.data]);
    return <KpiCard label="Ceny producenta PPI (r/r)" value={fmtPL(lastOf(s))} unit="%" icon={Factory} loading={q.isLoading}
        delta={ppDelta(s)} footnote={s.length ? `GUS · ${s[s.length - 1].date}` : 'GUS DBW'} href="/ceny?tab=ppi" />;
}

function PpiChart({ size }: { size: WidgetSize }) {
    const q = usePpiFull();
    const data = useMemo(() => (q.data?.headline ?? []).map((h) => ({ date: h.date, yoy: h.yoy })), [q.data]);
    const series: ChartSeries[] = [{ key: 'yoy', name: 'PPI r/r', color: RED, type: 'area' }];
    return (
        <ChartShell title="Ceny producenta (PPI) — trend" size={size} source={q.data?.source ?? 'GUS DBW'}>
            {(h) => <InteractiveChart data={data} xKey="date" series={series} height={h} unit="%" showRange initialRange="3L" ranges={['1R', '3L', '5L', 'ALL']} xTickFormatter={monthTick} valueFormatter={(v) => formatDecimalPL(v, 1)} />}
        </ChartShell>
    );
}

function CpiContributions() {
    const q = useCpiFull();
    const rows = useMemo(() => {
        const divs = q.data?.divisions ?? [];
        return [...divs]
            .filter((d) => d.contribution != null)
            .sort((a, b) => Math.abs(b.contribution as number) - Math.abs(a.contribution as number))
            .slice(0, 8);
    }, [q.data]);
    return (
        <TableShell title="CPI — wkład działów (p.p.)" source={q.data?.source ?? 'GUS DBW'}>
            {rows.length === 0 ? <EmptyRow loading={q.isLoading} /> : (
                <table className="mk-table">
                    <thead><tr><th>Dział</th><th className="text-right">r/r</th><th className="text-right">Wkład</th></tr></thead>
                    <tbody>
                        {rows.map((d) => (
                            <tr key={d.code}>
                                <td className="max-w-[180px] truncate" title={d.name}>{d.name}</td>
                                <td className="text-right tnum">{fmtPL(d.yoy)}%</td>
                                <td className="text-right tnum">{d.contribution != null ? `${d.contribution >= 0 ? '+' : '−'}${formatDecimalPL(Math.abs(d.contribution), 2)}` : '—'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </TableShell>
    );
}

// ═══ GOSPODARKA ════════════════════════════════════════════════

function GdpKpi() {
    const q = useGusGdpAnnual();
    const s = useMemo(() => plSeries(q.data), [q.data]);
    return <KpiCard label="PKB (r/r, rocznie)" value={fmtPL(lastOf(s))} unit="%" icon={LineChart} loading={q.isLoading}
        delta={lastOf(s) != null && prevOf(s) != null ? { value: +(lastOf(s)! - prevOf(s)!).toFixed(1), unit: 'pp' } : undefined}
        footnote={s.length ? `GUS · ${s[s.length - 1].date}` : 'GUS BDL'} href="/gospodarka?tab=aktywnosc" />;
}

function GdpChart({ size }: { size: WidgetSize }) {
    const q = useGusGdpAnnual();
    const data = useMemo(() => plSeries(q.data).map((p) => ({ date: p.date, value: p.value })), [q.data]);
    const series: ChartSeries[] = [{ key: 'value', name: 'PKB r/r', color: RED, type: 'bar' }];
    return (
        <ChartShell title="PKB — wzrost roczny" size={size} source={q.data?.source ?? 'GUS BDL'}>
            {(h) => <InteractiveChart data={data} xKey="date" series={series} height={h} unit="%" valueFormatter={(v) => formatDecimalPL(v, 1)} />}
        </ChartShell>
    );
}

function IndustrialKpi() {
    const q = useGusIndustrialProduction();
    const s = useMemo(() => plSeries(q.data), [q.data]);
    return <KpiCard label="Produkcja przemysłowa (r/r)" value={fmtPL(lastOf(s))} unit="%" icon={Factory} loading={q.isLoading}
        delta={lastOf(s) != null && prevOf(s) != null ? { value: +(lastOf(s)! - prevOf(s)!).toFixed(1), unit: 'pp' } : undefined}
        footnote={s.length ? `GUS · ${s[s.length - 1].date}` : 'GUS DBW'} href="/gospodarka?tab=aktywnosc" />;
}

function IndustrialChart({ size }: { size: WidgetSize }) {
    const q = useGusIndustrialProduction();
    const data = useMemo(() => plSeries(q.data).map((p) => ({ date: p.date, value: p.value })), [q.data]);
    const series: ChartSeries[] = [{ key: 'value', name: 'Produkcja r/r', color: RED, type: 'area' }];
    return (
        <ChartShell title="Produkcja przemysłowa — trend" size={size} source="GUS DBW">
            {(h) => <InteractiveChart data={data} xKey="date" series={series} height={h} unit="%" showRange initialRange="1R" xTickFormatter={monthTick} valueFormatter={(v) => formatDecimalPL(v, 1)} />}
        </ChartShell>
    );
}

function RetailKpi() {
    const q = useGusRetailSales();
    const s = useMemo(() => plSeries(q.data), [q.data]);
    return <KpiCard label="Sprzedaż detaliczna (r/r)" value={fmtPL(lastOf(s))} unit="%" icon={ShoppingCart} loading={q.isLoading}
        delta={lastOf(s) != null && prevOf(s) != null ? { value: +(lastOf(s)! - prevOf(s)!).toFixed(1), unit: 'pp' } : undefined}
        footnote={s.length ? `GUS · ${s[s.length - 1].date}` : 'GUS BDL'} href="/gospodarka?tab=aktywnosc" />;
}

function RetailChart({ size }: { size: WidgetSize }) {
    const q = useGusRetailSales();
    const data = useMemo(() => plSeries(q.data).map((p) => ({ date: p.date, value: p.value })), [q.data]);
    const series: ChartSeries[] = [{ key: 'value', name: 'Sprzedaż r/r', color: RED, type: 'area' }];
    return (
        <ChartShell title="Sprzedaż detaliczna — trend" size={size} source="GUS BDL">
            {(h) => <InteractiveChart data={data} xKey="date" series={series} height={h} unit="%" showRange initialRange="1R" xTickFormatter={monthTick} valueFormatter={(v) => formatDecimalPL(v, 1)} />}
        </ChartShell>
    );
}

// ═══ RYNKI ═════════════════════════════════════════════════════

function stooqDelta(d?: { close: number }[]): number | null {
    if (!d || d.length < 2) return null;
    return +percentChange(d[d.length - 1].close, d[d.length - 2].close).toFixed(2);
}

function Wig20Kpi() {
    const q = useStooq('wig20', 30);
    const last = q.data?.latest?.close ?? null;
    const delta = stooqDelta(q.data?.data);
    return <KpiCard label="WIG20" value={last != null ? formatNumber(last, 0) : '—'} unit="pkt" icon={LineChart} loading={q.isLoading}
        delta={delta != null ? { value: delta, unit: 'pct' } : undefined} footnote="GPW · Stooq" href="/rynki?tab=gpw" />;
}

function Wig20Chart({ size }: { size: WidgetSize }) {
    const q = useStooq('wig20', 200);
    const data = useMemo(() => (q.data?.data ?? []).map((d) => ({ date: d.date, value: d.close })), [q.data]);
    const series: ChartSeries[] = [{ key: 'value', name: 'WIG20', color: RED, type: 'area' }];
    return (
        <ChartShell title="WIG20 — notowania" size={size} source="GPW · Stooq">
            {(h) => <InteractiveChart data={data} xKey="date" series={series} height={h} unit=" pkt" showRange initialRange="6M" xTickFormatter={(d) => d.slice(5)} valueFormatter={(v) => formatNumber(v, 0)} />}
        </ChartShell>
    );
}

function Wig20Movers() {
    const q = useWig20();
    const rows = useMemo(() => {
        const items = (q.data?.items ?? []).filter((it) => it.changePct != null);
        return [...items].sort((a, b) => (b.changePct as number) - (a.changePct as number));
    }, [q.data]);
    return (
        <TableShell title="Spółki WIG20 — zmiana dnia" source="GPW · Stooq/Yahoo">
            {rows.length === 0 ? <EmptyRow loading={q.isLoading} /> : (
                <table className="mk-table">
                    <thead><tr><th>Spółka</th><th className="text-right">Kurs</th><th className="text-right">Zmiana</th></tr></thead>
                    <tbody>
                        {rows.map((it) => (
                            <tr key={it.ticker}>
                                <td className="max-w-[150px] truncate" title={it.name}>{it.name}</td>
                                <td className="text-right tnum">{it.price != null ? formatDecimalPL(it.price, 2) : '—'}</td>
                                <td className="text-right"><DeltaChip value={it.changePct as number} unit="pct" decimals={2} /></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </TableShell>
    );
}

function fxMid(data: unknown, code: string): number | null {
    const raw = data as { rates?: { code: string; mid?: number }[] } | { rates?: { code: string; mid?: number }[] }[] | undefined;
    const t = Array.isArray(raw) ? raw[0] : raw;
    return t?.rates?.find((r) => r.code === code)?.mid ?? null;
}
function fxHistDelta(data: unknown): number | null {
    const arr = data as { mid?: number }[] | undefined;
    if (!arr || arr.length < 2) return null;
    const a = arr[arr.length - 1]?.mid, b = arr[arr.length - 2]?.mid;
    return a && b ? +percentChange(a, b).toFixed(2) : null;
}

function EurPlnKpi() {
    const fx = useNBPTable('a');
    const hist = useEURPLN();
    const mid = fxMid(fx.data, 'EUR');
    return <KpiCard label="EUR / PLN" value={mid != null ? formatDecimalPL(mid, 3) : '—'} unit="zł" icon={Euro} loading={fx.isLoading}
        delta={fxHistDelta(hist.data) != null ? { value: fxHistDelta(hist.data)!, unit: 'pct', invert: true } : undefined} footnote="NBP tabela A" href="/rynki?tab=kursy" />;
}

function UsdPlnKpi() {
    const fx = useNBPTable('a');
    const hist = useUSDPLN();
    const mid = fxMid(fx.data, 'USD');
    return <KpiCard label="USD / PLN" value={mid != null ? formatDecimalPL(mid, 3) : '—'} unit="zł" icon={DollarSign} loading={fx.isLoading}
        delta={fxHistDelta(hist.data) != null ? { value: fxHistDelta(hist.data)!, unit: 'pct', invert: true } : undefined} footnote="NBP tabela A" href="/rynki?tab=kursy" />;
}

function FxChart({ size }: { size: WidgetSize }) {
    const eur = useNBPCurrencyHistory('eur', 90);
    const usd = useNBPCurrencyHistory('usd', 90);
    const data = useMemo(() => {
        const map = new Map<string, { date: string; eur?: number; usd?: number }>();
        for (const r of (eur.data ?? [])) if (r.mid != null) map.set((r as { effectiveDate?: string }).effectiveDate ?? '', { date: (r as { effectiveDate?: string }).effectiveDate ?? '', eur: r.mid });
        for (const r of (usd.data ?? [])) {
            const key = (r as { effectiveDate?: string }).effectiveDate ?? '';
            const prev = map.get(key) ?? { date: key };
            map.set(key, { ...prev, usd: r.mid ?? undefined });
        }
        return [...map.values()].filter((d) => d.date).sort((a, b) => a.date.localeCompare(b.date));
    }, [eur.data, usd.data]);
    const series: ChartSeries[] = [
        { key: 'eur', name: 'EUR/PLN', color: RED, type: 'line' },
        { key: 'usd', name: 'USD/PLN', color: '#2563EB', type: 'line' },
    ];
    return (
        <ChartShell title="Kursy walut — EUR i USD" size={size} source="NBP tabela A">
            {(h) => <InteractiveChart data={data} xKey="date" series={series} height={h} unit=" zł" legend xTickFormatter={(d) => d.slice(5)} valueFormatter={(v) => formatDecimalPL(v, 2)} />}
        </ChartShell>
    );
}

function GoldKpi() {
    const q = useGold(30);
    const s = useMemo(() => (q.data ?? []).map((g) => ({ date: g.data, value: g.cena })), [q.data]);
    const delta = s.length > 1 ? +percentChange(s[s.length - 1].value, s[s.length - 2].value).toFixed(2) : null;
    return <KpiCard label="Złoto (NBP)" value={fmtPL(lastOf(s), 2)} unit="zł/g" icon={Gem} loading={q.isLoading}
        delta={delta != null ? { value: delta, unit: 'pct' } : undefined} footnote="NBP · cena złota" href="/rynki?tab=kursy" />;
}

function GoldChart({ size }: { size: WidgetSize }) {
    const q = useGold(90);
    const data = useMemo(() => (q.data ?? []).map((g) => ({ date: g.data, value: g.cena })), [q.data]);
    const series: ChartSeries[] = [{ key: 'value', name: 'Złoto', color: '#D97706', type: 'area' }];
    return (
        <ChartShell title="Złoto — cena NBP" size={size} source="NBP · cena złota (zł/g)">
            {(h) => <InteractiveChart data={data} xKey="date" series={series} height={h} unit=" zł/g" showRange initialRange="6M" xTickFormatter={(d) => d.slice(5)} valueFormatter={(v) => formatNumber(v, 0)} />}
        </ChartShell>
    );
}

function YieldKpi() {
    const q = useBondYield10YPl(30);
    const s = useMemo(() => (q.data?.data ?? []).map((d) => ({ date: d.date, value: d.close })), [q.data]);
    return <KpiCard label="Rentowność 10Y" value={fmtPL(lastOf(s), 2)} unit="%" icon={Landmark} loading={q.isLoading}
        delta={lastOf(s) != null && prevOf(s) != null ? { value: +(lastOf(s)! - prevOf(s)!).toFixed(2), unit: 'pp', invert: true } : undefined}
        footnote="Rynek · Stooq 10Y PL" href="/gospodarka?tab=finanse" />;
}

function YieldChart({ size }: { size: WidgetSize }) {
    const q = useBondYield10YPl(200);
    const data = useMemo(() => (q.data?.data ?? []).map((d) => ({ date: d.date, value: d.close })), [q.data]);
    const series: ChartSeries[] = [{ key: 'value', name: 'Rentowność 10Y', color: RED, type: 'area' }];
    return (
        <ChartShell title="Rentowność obligacji 10Y" size={size} source="Rynek · Stooq 10ypl.b">
            {(h) => <InteractiveChart data={data} xKey="date" series={series} height={h} unit="%" showRange initialRange="6M" xTickFormatter={(d) => d.slice(5)} valueFormatter={(v) => formatDecimalPL(v, 1)} />}
        </ChartShell>
    );
}

function NbpRateKpi() {
    const q = useNBPInterestRates();
    const ref = useMemo(() => q.data?.rates?.find((x) => /referen/i.test(x.name) || /referen/i.test(x.nameEn)) ?? null, [q.data]);
    return <KpiCard label="Stopa referencyjna NBP" value={ref ? formatDecimalPL(ref.value, 2) : '—'} unit="%" icon={Percent} loading={q.isLoading}
        footnote={ref ? `NBP · od ${formatDate(ref.validFrom)}` : 'NBP'} href="/rynki?tab=stopy" />;
}

function WiborTable() {
    const q = useWibor();
    const rows = useMemo(() => q.data?.rates ?? [], [q.data]);
    return (
        <TableShell title="WIBOR" source={rows[0]?.source ?? 'GPW Benchmark'}>
            {rows.length === 0 ? <EmptyRow loading={q.isLoading} /> : (
                <table className="mk-table">
                    <thead><tr><th>Tenor</th><th className="text-right">WIBOR</th><th className="text-right">WIBID</th></tr></thead>
                    <tbody>
                        {rows.map((r) => (
                            <tr key={r.tenor}>
                                <td>{r.tenor}</td>
                                <td className="text-right tnum">{formatDecimalPL(r.wibor, 2)}%</td>
                                <td className="text-right tnum">{formatDecimalPL(r.wibid, 2)}%</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </TableShell>
    );
}

// ═══ RYNEK PRACY ═══════════════════════════════════════════════

function UnemploymentKpi() {
    const q = useGusRegisteredUnemployment(24);
    const s = useMemo(() => (q.data?.series ?? []).map((d) => ({ date: d.date, value: d.value })), [q.data]);
    return <KpiCard label="Stopa bezrobocia" value={fmtPL(lastOf(s))} unit="%" icon={Users} loading={q.isLoading}
        delta={ppDelta(s)} footnote={s.length ? `GUS · rejestrowane · ${s[s.length - 1].date}` : 'GUS · rejestrowane'} href="/praca?tab=bezrobocie" />;
}

function UnemploymentChart({ size }: { size: WidgetSize }) {
    const q = useGusRegisteredUnemployment(60);
    const data = useMemo(() => (q.data?.series ?? []).map((d) => ({ date: d.date, value: d.value })), [q.data]);
    const series: ChartSeries[] = [{ key: 'value', name: 'Bezrobocie', color: RED, type: 'area' }];
    return (
        <ChartShell title="Stopa bezrobocia — trend" size={size} source="GUS BDL · rejestrowane">
            {(h) => <InteractiveChart data={data} xKey="date" series={series} height={h} unit="%" showRange initialRange="3L" ranges={['1R', '3L', '5L', 'ALL']} xTickFormatter={monthTick} valueFormatter={(v) => formatDecimalPL(v, 1)} />}
        </ChartShell>
    );
}

function WagesKpi() {
    const q = useGUSWages();
    return <KpiCard label="Wynagrodzenie (sektor przeds.)" value={q.data?.latest != null ? formatNumber(q.data.latest, 0) : '—'} unit="zł" icon={Wallet} loading={q.isLoading}
        delta={q.data?.yoy != null ? { value: q.data.yoy, unit: 'pct' } : undefined} footnote={q.data?.source ?? 'GUS BDL'} href="/praca?tab=bezrobocie" />;
}

// ═══ REGIONY ═══════════════════════════════════════════════════

function RegionalGdpTable() {
    const q = useRegionalGus();
    const rows = useMemo(() => {
        const regs = (q.data?.regions ?? []).filter((r) => r.gdpPerCapita != null);
        return [...regs].sort((a, b) => (b.gdpPerCapita as number) - (a.gdpPerCapita as number)).slice(0, 10);
    }, [q.data]);
    return (
        <TableShell title="PKB per capita wg województw" source={q.data?.source ?? 'GUS BDL'}>
            {rows.length === 0 ? <EmptyRow loading={q.isLoading} /> : (
                <table className="mk-table">
                    <thead><tr><th>Województwo</th><th className="text-right">PKB per capita</th></tr></thead>
                    <tbody>
                        {rows.map((r) => (
                            <tr key={r.slug}>
                                <td className="capitalize">{r.name}</td>
                                <td className="text-right tnum">{r.gdpPerCapita != null ? `${formatNumber(r.gdpPerCapita, 0)} zł` : '—'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </TableShell>
    );
}

// ═══ NEWSY / PUBLIKACJE ════════════════════════════════════════

function OverviewHeroWidget() {
    const d = useOverviewData();
    return <OverviewHero cpi={d.cpi} retail={d.retail} cpiLoading={d.cpiLoading} retailLoading={d.retailLoading} />;
}

function WatchlistWidget() {
    const d = useOverviewData();
    const editing = useEditMode();
    const watch = useWatchlist();
    if (!watch.ready) return editing ? <WatchlistPlaceholder /> : null;
    const watched = d.watchlistItems.filter((k) => watch.has('wskaznik', k.watchId));
    if (watched.length === 0) return editing ? <WatchlistPlaceholder /> : null;
    return <WatchlistStrip items={d.watchlistItems} compact />;
}

function WatchlistPlaceholder() {
    return (
        <div className="rounded-xl border border-dashed border-mk-border-strong bg-mk-surface px-4 py-6 text-center text-sm text-mk-faint">
            Obserwowane — dodaj gwiazdką na kafelku KPI
        </div>
    );
}

function LatestNewsWidget() {
    return <LatestNews limit={6} variant="overview" />;
}
function PublicationWidget() {
    return <PublicationDatesPanel count={7} />;
}

// ── Pomocnik pustego stanu tabeli ────────────────────────────
function EmptyRow({ loading }: { loading?: boolean }) {
    return (
        <div className="flex h-full min-h-[80px] items-center justify-center px-4 text-center text-sm text-mk-faint">
            {loading ? 'Ładowanie…' : '— brak danych ze źródła'}
        </div>
    );
}

// ═══ KATALOG ═══════════════════════════════════════════════════

export const WIDGETS: WidgetDef[] = [
    { id: 'overview-hero', title: 'Sygnały makro (hero)', category: 'Przegląd', description: 'Pas hero z CPI, sprzedażą i newsem', defaultSize: { w: 3, h: 2 }, minW: 2, autoHeight: true, render: () => <OverviewHeroWidget /> },
    { id: 'watchlist-strip', title: 'Obserwowane', category: 'Przegląd', description: 'Pas wskaźników z gwiazdką', defaultSize: { w: 3, h: 1 }, autoHeight: true, render: () => <WatchlistWidget /> },

    // Ceny
    { id: 'cpi-kpi', title: 'Inflacja CPI (KPI)', category: 'Ceny', description: 'Ostatni odczyt CPI r/r', defaultSize: { w: 1, h: 1 }, render: () => <CpiKpi /> },
    { id: 'cpi-chart', title: 'Inflacja CPI (wykres)', category: 'Ceny', description: 'Trend CPI r/r i m/m', defaultSize: { w: 2, h: 2 }, minW: 2, minH: 2, render: (s) => <CpiChart size={s} /> },
    { id: 'cpi-contributions', title: 'CPI — wkład działów', category: 'Ceny', description: 'Wkład działów COICOP do inflacji', defaultSize: { w: 1, h: 2 }, minH: 2, render: () => <CpiContributions /> },
    { id: 'ppi-kpi', title: 'Ceny producenta PPI (KPI)', category: 'Ceny', description: 'Ostatni odczyt PPI r/r', defaultSize: { w: 1, h: 1 }, render: () => <PpiKpi /> },
    { id: 'ppi-chart', title: 'Ceny producenta PPI (wykres)', category: 'Ceny', description: 'Trend PPI r/r', defaultSize: { w: 2, h: 2 }, minW: 2, minH: 2, render: (s) => <PpiChart size={s} /> },

    // Gospodarka
    { id: 'gdp-kpi', title: 'PKB (KPI)', category: 'Gospodarka', description: 'Wzrost PKB r/r (rocznie)', defaultSize: { w: 1, h: 1 }, render: () => <GdpKpi /> },
    { id: 'gdp-chart', title: 'PKB (wykres)', category: 'Gospodarka', description: 'Wzrost PKB rok do roku', defaultSize: { w: 2, h: 2 }, minW: 2, minH: 2, render: (s) => <GdpChart size={s} /> },
    { id: 'industrial-kpi', title: 'Produkcja przemysłowa (KPI)', category: 'Gospodarka', description: 'Produkcja przemysłowa r/r', defaultSize: { w: 1, h: 1 }, render: () => <IndustrialKpi /> },
    { id: 'industrial-chart', title: 'Produkcja przemysłowa (wykres)', category: 'Gospodarka', description: 'Trend produkcji przemysłowej', defaultSize: { w: 2, h: 2 }, minW: 2, minH: 2, render: (s) => <IndustrialChart size={s} /> },
    { id: 'retail-kpi', title: 'Sprzedaż detaliczna (KPI)', category: 'Gospodarka', description: 'Sprzedaż detaliczna r/r', defaultSize: { w: 1, h: 1 }, render: () => <RetailKpi /> },
    { id: 'retail-chart', title: 'Sprzedaż detaliczna (wykres)', category: 'Gospodarka', description: 'Trend sprzedaży detalicznej', defaultSize: { w: 2, h: 2 }, minW: 2, minH: 2, render: (s) => <RetailChart size={s} /> },

    // Rynki
    { id: 'wig20-kpi', title: 'WIG20 (KPI)', category: 'Rynki', description: 'Indeks WIG20 — ostatnie notowanie', defaultSize: { w: 1, h: 1 }, render: () => <Wig20Kpi /> },
    { id: 'wig20-chart', title: 'WIG20 (wykres)', category: 'Rynki', description: 'Notowania indeksu WIG20', defaultSize: { w: 2, h: 2 }, minW: 2, minH: 2, render: (s) => <Wig20Chart size={s} /> },
    { id: 'wig20-movers', title: 'Spółki WIG20 (tabela)', category: 'Rynki', description: 'Zmiana dnia spółek WIG20', defaultSize: { w: 2, h: 2 }, minW: 2, minH: 2, render: () => <Wig20Movers /> },
    { id: 'eurpln-kpi', title: 'EUR / PLN (KPI)', category: 'Rynki', description: 'Kurs euro wg NBP', defaultSize: { w: 1, h: 1 }, render: () => <EurPlnKpi /> },
    { id: 'usdpln-kpi', title: 'USD / PLN (KPI)', category: 'Rynki', description: 'Kurs dolara wg NBP', defaultSize: { w: 1, h: 1 }, render: () => <UsdPlnKpi /> },
    { id: 'fx-chart', title: 'Kursy walut (wykres)', category: 'Rynki', description: 'EUR/PLN i USD/PLN — 90 dni', defaultSize: { w: 2, h: 2 }, minW: 2, minH: 2, render: (s) => <FxChart size={s} /> },
    { id: 'gold-kpi', title: 'Złoto (KPI)', category: 'Rynki', description: 'Cena złota NBP (zł/g)', defaultSize: { w: 1, h: 1 }, render: () => <GoldKpi /> },
    { id: 'gold-chart', title: 'Złoto (wykres)', category: 'Rynki', description: 'Cena złota NBP', defaultSize: { w: 2, h: 2 }, minW: 2, minH: 2, render: (s) => <GoldChart size={s} /> },
    { id: 'yield-kpi', title: 'Rentowność 10Y (KPI)', category: 'Rynki', description: 'Rentowność obligacji 10Y', defaultSize: { w: 1, h: 1 }, render: () => <YieldKpi /> },
    { id: 'yield-chart', title: 'Rentowność 10Y (wykres)', category: 'Rynki', description: 'Rentowność obligacji 10Y', defaultSize: { w: 2, h: 2 }, minW: 2, minH: 2, render: (s) => <YieldChart size={s} /> },
    { id: 'nbp-rate-kpi', title: 'Stopa referencyjna NBP (KPI)', category: 'Rynki', description: 'Stopa referencyjna NBP', defaultSize: { w: 1, h: 1 }, render: () => <NbpRateKpi /> },
    { id: 'wibor-table', title: 'WIBOR (tabela)', category: 'Rynki', description: 'Stawki WIBOR wg tenoru', defaultSize: { w: 1, h: 2 }, minH: 2, render: () => <WiborTable /> },

    // Rynek pracy
    { id: 'unemployment-kpi', title: 'Bezrobocie (KPI)', category: 'Rynek pracy', description: 'Stopa bezrobocia rejestrowanego', defaultSize: { w: 1, h: 1 }, render: () => <UnemploymentKpi /> },
    { id: 'unemployment-chart', title: 'Bezrobocie (wykres)', category: 'Rynek pracy', description: 'Trend stopy bezrobocia', defaultSize: { w: 2, h: 2 }, minW: 2, minH: 2, render: (s) => <UnemploymentChart size={s} /> },
    { id: 'wages-kpi', title: 'Wynagrodzenia (KPI)', category: 'Rynek pracy', description: 'Przeciętne wynagrodzenie w sektorze przedsiębiorstw', defaultSize: { w: 1, h: 1 }, render: () => <WagesKpi /> },

    // Regiony
    { id: 'regiony-pkb', title: 'PKB per capita — województwa', category: 'Regiony', description: 'Ranking województw wg PKB per capita', defaultSize: { w: 1, h: 2 }, minH: 2, render: () => <RegionalGdpTable /> },

    // Newsy / Publikacje
    { id: 'latest-news', title: 'Najważniejsze newsy', category: 'Newsy', description: 'Agregat najważniejszych wiadomości', defaultSize: { w: 3, h: 2 }, minH: 2, autoHeight: true, render: () => <LatestNewsWidget /> },
    { id: 'publication-dates', title: 'Kalendarz publikacji', category: 'Publikacje', description: 'Najbliższe publikacje danych GUS/NBP', defaultSize: { w: 1, h: 2 }, minH: 2, render: () => <PublicationWidget /> },
];

const BY_ID = new Map(WIDGETS.map((w) => [w.id, w]));
export function getWidget(id: string): WidgetDef | undefined { return BY_ID.get(id); }
export function widgetExists(id: string): boolean { return BY_ID.has(id); }

/** Kolejność kategorii w pickerze. */
export const CATEGORY_ORDER: { key: WidgetDef['category']; icon: typeof TrendingUp }[] = [
    { key: 'Przegląd', icon: LayoutDashboard },
    { key: 'Ceny', icon: TrendingUp },
    { key: 'Gospodarka', icon: Factory },
    { key: 'Rynki', icon: Banknote },
    { key: 'Rynek pracy', icon: Users },
    { key: 'Regiony', icon: MapIcon },
    { key: 'Newsy', icon: Newspaper },
    { key: 'Publikacje', icon: CalendarClock },
];
