'use client';

import { useMemo, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { TrendingUp, Activity, Fuel, DollarSign, Factory, Banknote, Info, ChevronRight } from 'lucide-react';
import { useCpiFull, useHICPCoreYoY, usePPI, useBrentMM, useEURPLN, useUSDPLN, useHicpDivision, type CpiDivision } from '@/lib/hooks';
import { plSeries, lastOf, fmtPL } from '@/lib/series';
import { formatDecimalPL } from '@/lib/formatters';
import { KpiCard } from '@/components/ui/KpiCard';
import { InteractiveChart } from '@/components/ui/InteractiveChart';
import { SectionCard } from '@/components/ui/SectionCard';
import { Segmented } from '@/components/ui/Segmented';
import { CsvExport } from '@/components/ui/CsvExport';
import { StaleBadge } from '@/components/ui/StaleBadge';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { Drawer } from '@/components/ui/Drawer';

const PALETTE = ['#2563EB', '#16A34A', '#D97706', '#7C3AED', '#E11D48', '#0891B2', '#CA8A04', '#DB2777', '#059669', '#4F46E5', '#EA580C', '#0D9488', '#64748B'];
const monthTick = (d: string) => { const [y, m] = d.split('-'); return m ? `${m}.${y.slice(2)}` : d; };
const colorFor = (i: number) => PALETTE[i % PALETTE.length];

// % zmiana z indeksu cen: r/r = lag 12 mies., kw/kw = lag 3, m/m = lag 1 (HICP miesięczny jest ciągły).
type Pt = { date: string; value: number };
const changeFromIndex = (idx: Pt[], lag: number): Pt[] =>
    idx.map((p, i) => (i >= lag && idx[i - lag].value ? { date: p.date, value: +((p.value / idx[i - lag].value - 1) * 100).toFixed(1) } : null))
        .filter((x): x is Pt => x !== null);
const METRIC_LABEL: Record<'yoy' | 'qoq' | 'mom', string> = { yoy: 'rocznie (r/r)', qoq: 'kwartalnie (kw/kw)', mom: 'miesięcznie (m/m)' };

// Dział COICOP 2018 → kod HICP (Eurostat) dla 10-letniej historii (12→13 dzielą CP12).
const COICOP_MAP: Record<string, string> = {
    '01': 'CP01', '02': 'CP02', '03': 'CP03', '04': 'CP04', '05': 'CP05', '06': 'CP06',
    '07': 'CP07', '08': 'CP08', '09': 'CP09', '10': 'CP10', '11': 'CP11', '12': 'CP12', '13': 'CP12',
};

// „Co wpływa na tę kategorię" — czynniki cenotwórcze per dział.
const DIVISION_INFO: Record<string, string> = {
    '01': 'Ceny żywności zależą od cen surowców rolnych (zboża, mięso, nabiał), pogody i susz, kursów walut przy imporcie, sezonowości oraz kosztów energii w produkcji i transporcie.',
    '02': 'Napoje alkoholowe i wyroby tytoniowe — dominuje wpływ akcyzy i jej corocznych podwyżek; kategoria mało wrażliwa na koniunkturę.',
    '03': 'Odzież i obuwie — sezonowe wyprzedaże, kursy walut (import głównie z Azji), ceny bawełny i frachtu morskiego.',
    '04': 'Użytkowanie mieszkania i energia — taryfy prądu i gazu (decyzje URE), ceny paliw grzewczych, czynsze, woda i wywóz śmieci. Największa waga w koszyku.',
    '05': 'Wyposażenie mieszkania — meble, AGD, artykuły domowe; kursy walut i koszty importu, siła popytu konsumpcyjnego.',
    '06': 'Zdrowie — ceny leków i wyrobów medycznych, usługi ambulatoryjne i szpitalne, poziom refundacji.',
    '07': 'Transport — ceny paliw (ropa Brent, kurs USD/PLN), ceny nowych i używanych samochodów, koszty usług transportu pasażerskiego.',
    '08': 'Informacja i komunikacja — usługi telekomunikacyjne (abonamenty, internet), sprzęt elektroniczny, konkurencja operatorów.',
    '09': 'Rekreacja, sport i kultura — turystyka zorganizowana (silna sezonowość), sprzęt i usługi rekreacyjne, wydarzenia kulturalne.',
    '10': 'Edukacja — czesne i opłaty za naukę (sezonowość wrzesień/październik); niewielka waga w koszyku.',
    '11': 'Restauracje i hotele — koszty pracy (płace), ceny żywności, energii i najmu lokali; popyt turystyczny.',
    '12': 'Ubezpieczenia i usługi finansowe — składki ubezpieczeniowe (OC/AC, majątkowe, na życie), opłaty bankowe.',
    '13': 'Higiena osobista i pozostałe — kosmetyki i usługi fryzjerskie, biżuteria, ochrona socjalna, artykuły osobiste.',
};

export function InflacjaFull() {
    const { data, isLoading } = useCpiFull();
    const coreQ = useHICPCoreYoY();
    const ppiQ = usePPI();
    const brentQ = useBrentMM();
    const eurQ = useEURPLN();
    const usdQ = useUSDPLN();

    const headline = useMemo(() => data?.headline ?? [], [data]);
    const divisions = useMemo(() => data?.divisions ?? [], [data]);
    const dataDate = data?.dataDate ?? null;
    const spliceDate = data?.spliceDate ?? null;
    const latest = headline.length ? headline[headline.length - 1] : null;
    const prev = headline.length > 1 ? headline[headline.length - 2] : null;

    // ── Struktura inflacji: CPI (ogółem) vs bazowa vs PPI (producent), r/r ──
    const coreSeries = useMemo(() => plSeries(coreQ.data), [coreQ.data]);
    const ppiSeries = useMemo(() => plSeries(ppiQ.data), [ppiQ.data]);
    const structureData = useMemo(() => {
        const by = new Map<string, { date: string; cpi: number | null; core: number | null; ppi: number | null }>();
        const put = (date: string, key: 'cpi' | 'core' | 'ppi', v: number | null) => {
            const e = by.get(date) ?? { date, cpi: null, core: null, ppi: null };
            e[key] = v; by.set(date, e);
        };
        for (const h of headline) put(h.date, 'cpi', h.yoy);
        for (const p of coreSeries) put(p.date, 'core', p.value);
        for (const p of ppiSeries) put(p.date, 'ppi', p.value);
        return [...by.values()].sort((a, b) => a.date.localeCompare(b.date));
    }, [headline, coreSeries, ppiSeries]);

    // ── Czynniki cenotwórcze (drivers): ropa, kursy, PPI ──
    const brent = brentQ.data;
    const fxCard = (arr: { mid?: number }[] | undefined) => {
        const s = (arr ?? []).filter((r) => r.mid != null);
        const last = s.length ? s[s.length - 1].mid! : null;
        const ref = s.length > 22 ? s[s.length - 23].mid! : (s[0]?.mid ?? null);
        const chg = last != null && ref != null && ref !== 0 ? +((last / ref - 1) * 100).toFixed(1) : null;
        return { last, chg };
    };
    const eur = fxCard(eurQ.data);
    const usd = fxCard(usdQ.data);
    const ppiLast = lastOf(ppiSeries);
    const ppiPrev = ppiSeries.length > 1 ? ppiSeries[ppiSeries.length - 2].value : null;

    const contrib = useMemo(
        () => divisions.map((d, i) => ({ ...d, color: colorFor(i) })).filter((d) => d.contribution != null).sort((a, b) => (b.contribution ?? 0) - (a.contribution ?? 0)),
        [divisions],
    );
    const maxAbs = Math.max(...contrib.map((d) => Math.abs(d.contribution ?? 0)), 0.01);
    const colorOf = (code: string) => colorFor(divisions.findIndex((d) => d.code === code));

    const [freq, setFreq] = useState<'yoy' | 'mom'>('yoy');
    const [selCode, setSelCode] = useState<string | null>(null);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const openDiv = (code: string) => { setSelCode(code); setDrawerOpen(true); };

    const sel: CpiDivision | null = selCode ? divisions.find((d) => d.code === selCode) ?? null : null;
    const selColor = sel ? colorOf(sel.code) : '#2563EB';

    // 10-letni indeks cen wybranego działu (HICP) → zmiana roczna / kwartalna / miesięczna
    const [divMetric, setDivMetric] = useState<'yoy' | 'qoq' | 'mom'>('yoy');
    const hicpDivQ = useHicpDivision(sel ? COICOP_MAP[sel.code] : undefined);
    const divIndex = useMemo(() => plSeries(hicpDivQ.data), [hicpDivQ.data]);
    const divChange = useMemo(() => changeFromIndex(divIndex, divMetric === 'yoy' ? 12 : divMetric === 'qoq' ? 3 : 1), [divIndex, divMetric]);

    const subs = useMemo(() => (sel?.subcategories ?? []).filter((s) => s.yoy != null).sort((a, b) => (b.yoy ?? -99) - (a.yoy ?? -99)), [sel]);
    const maxSubAbs = useMemo(() => Math.max(...subs.map((s) => Math.abs(s.yoy ?? 0)), 0.1), [subs]);

    const chartData = useMemo(() => headline.map((h) => ({ date: h.date, value: freq === 'yoy' ? h.yoy : h.mom })), [headline, freq]);
    const pieData = useMemo(() => divisions.map((d, i) => ({ name: d.name, value: d.weight, color: colorFor(i), yoy: d.yoy })), [divisions]);

    const cols: Column<CpiDivision>[] = [
        { key: 'name', header: 'Dział', sortable: true, sortValue: (d) => d.code, render: (d) => <span><span className="text-mk-faint">{d.code}</span> {d.name}</span> },
        { key: 'weight', header: 'Waga', align: 'right', sortable: true, sortValue: (d) => d.weight, render: (d) => `${formatDecimalPL(d.weight, 1)}%` },
        { key: 'yoy', header: 'r/r', align: 'right', sortable: true, sortValue: (d) => d.yoy ?? -99, render: (d) => <span style={{ color: (d.yoy ?? 0) >= 0 ? '#DC2626' : '#16A34A', fontWeight: 600 }}>{d.yoy != null ? `${d.yoy > 0 ? '+' : ''}${formatDecimalPL(d.yoy, 1)}%` : '—'}</span> },
        { key: 'mom', header: 'm/m', align: 'right', sortable: true, sortValue: (d) => d.mom ?? -99, render: (d) => d.mom != null ? `${d.mom > 0 ? '+' : ''}${formatDecimalPL(d.mom, 1)}%` : '—' },
        { key: 'contribution', header: 'Wkład', align: 'right', sortable: true, sortValue: (d) => d.contribution ?? -99, render: (d) => <span className="font-semibold">{d.contribution != null ? `${d.contribution > 0 ? '+' : ''}${formatDecimalPL(d.contribution, 2)}` : '—'}</span> },
    ];

    if (isLoading) return <div className="space-y-4"><div className="grid grid-cols-2 gap-4">{Array.from({ length: 2 }).map((_, i) => <div key={i} className="mk-card h-28" />)}</div><div className="mk-skeleton h-[340px] w-full" /></div>;

    return (
        <div className="space-y-6">
            {/* ── KPI (ujednolicone na krajowy CPI GUS) ── */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <KpiCard label="CPI (r/r)" value={fmtPL(latest?.yoy)} unit="%" accent="amber" icon={TrendingUp}
                    delta={latest?.yoy != null && prev?.yoy != null ? { value: +(latest.yoy - prev.yoy).toFixed(1), unit: 'pp', invert: true } : undefined}
                    footnote={dataDate ? `GUS · krajowy CPI · ${dataDate}` : 'GUS · krajowy CPI'} />
                <KpiCard label="CPI (m/m)" value={fmtPL(latest?.mom)} unit="%" accent="blue" icon={Activity} footnote="miesiąc do miesiąca" />
            </div>

            {/* ── Hero: trend r/r ↔ m/m ── */}
            <SectionCard title="Inflacja CPI — trend (10 lat)" subtitle={`${freq === 'yoy' ? 'rok do roku' : 'miesiąc do miesiąca'} (%) · krajowy CPI (GUS)${spliceDate ? ` od ${spliceDate.slice(0, 4)}` : ''}, wcześniej HICP (Eurostat)`}
                actions={<div className="flex flex-wrap items-center gap-2">
                    <Segmented value={freq} onChange={setFreq} options={[{ value: 'yoy', label: 'r/r' }, { value: 'mom', label: 'm/m' }]} />
                    <StaleBadge date={dataDate} label="GUS do" warnAfterMonths={4} />
                    <CsvExport filename="cpi-10lat" headers={['Miesiąc', 'r/r', 'm/m']} rows={headline.map((h) => [h.date, h.yoy, h.mom])} />
                </div>}>
                <InteractiveChart data={chartData} xKey="date" height={320} unit="%" showRange initialRange="5L" ranges={['1R', '3L', '5L', 'ALL']}
                    valueFormatter={(v) => formatDecimalPL(v, 1)} xTickFormatter={monthTick}
                    referenceLines={freq === 'yoy' ? [{ y: 2.5, label: 'Cel NBP', color: '#94A3B8' }] : [{ y: 0, color: '#CBD2DD' }]}
                    series={[{ key: 'value', name: freq === 'yoy' ? 'CPI r/r' : 'CPI m/m', color: '#D97706', type: 'area', strokeWidth: 2.5 }]} />
            </SectionCard>

            {/* ── Struktura inflacji: CPI vs bazowa vs PPI ── */}
            <SectionCard title="Struktura inflacji" subtitle="CPI ogółem · inflacja bazowa · PPI (ceny producenta) — r/r (%)">
                <InteractiveChart data={structureData} xKey="date" height={300} unit="%" showRange initialRange="5L" ranges={['1R', '3L', '5L', 'ALL']} legend
                    valueFormatter={(v) => formatDecimalPL(v, 1)} xTickFormatter={monthTick}
                    referenceLines={[{ y: 2.5, label: 'Cel NBP', color: '#94A3B8' }]}
                    series={[
                        { key: 'cpi', name: 'CPI ogółem', color: '#D97706', type: 'line', strokeWidth: 2.5 },
                        { key: 'core', name: 'Inflacja bazowa', color: '#7C3AED', type: 'line', strokeWidth: 2 },
                        { key: 'ppi', name: 'PPI (producent)', color: '#0891B2', type: 'line', strokeWidth: 2, dashed: true },
                    ]} />
                <p className="mt-2 text-xs text-mk-faint">
                    <span className="font-medium text-mk-muted">PPI</span> (ceny producenta) zwykle wyprzedza CPI — presja u producentów przekłada się na ceny konsumenckie z opóźnieniem.
                    <span className="font-medium text-mk-muted"> Inflacja bazowa</span> (bez żywności i energii) pokazuje trwałość presji cenowej. Bazowa: HICP core (Eurostat), PPI: Eurostat.
                </p>
            </SectionCard>

            {/* ── Czynniki cenotwórcze (drivers) ── */}
            <SectionCard title="Czynniki cenotwórcze" subtitle="zewnętrzne presje na ceny — ropa, kursy walut, ceny producenta">
                <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                    <KpiCard label="Ropa Brent" value={fmtPL(brent?.latest, 1)} unit=" USD" accent="amber" icon={Fuel}
                        delta={brent?.changeMM != null ? { value: brent.changeMM, unit: 'pct', invert: true } : undefined}
                        footnote="napędza paliwa i transport" loading={brentQ.isLoading} />
                    <KpiCard label="EUR/PLN" value={fmtPL(eur.last, 3)} accent="blue" icon={Banknote}
                        delta={eur.chg != null ? { value: eur.chg, unit: 'pct', invert: true } : undefined}
                        footnote="import, żywność (30 dni)" loading={eurQ.isLoading} />
                    <KpiCard label="USD/PLN" value={fmtPL(usd.last, 3)} accent="violet" icon={DollarSign}
                        delta={usd.chg != null ? { value: usd.chg, unit: 'pct', invert: true } : undefined}
                        footnote="ropa w USD, surowce (30 dni)" loading={usdQ.isLoading} />
                    <KpiCard label="PPI (r/r)" value={fmtPL(ppiLast)} unit="%" accent="rose" icon={Factory}
                        delta={ppiLast != null && ppiPrev != null ? { value: +(ppiLast - ppiPrev).toFixed(1), unit: 'pp', invert: true } : undefined}
                        footnote="ceny producenta — wyprzedza CPI" loading={ppiQ.isLoading} />
                </div>
            </SectionCard>

            {/* ── Kontrybucje do inflacji (pełna szerokość, klik → drawer) ── */}
            <SectionCard title="Kontrybucje do inflacji" subtitle="waga × dynamika = wkład (pp) · kliknij dział, aby zobaczyć szczegóły i 10-letni trend">
                <div className="space-y-1">
                    {contrib.map((d) => {
                        const c = d.contribution ?? 0;
                        const w = (Math.abs(c) / maxAbs) * 100;
                        return (
                            <button key={d.code} onClick={() => openDiv(d.code)}
                                className="group flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left transition-colors hover:bg-mk-surface-alt">
                                <span className="w-[15rem] shrink-0 truncate text-sm font-medium text-mk-text" title={d.name}><span className="mr-1.5 text-xs text-mk-faint">{d.code}</span>{d.name}</span>
                                <span className="w-14 shrink-0 text-right text-xs tnum text-mk-muted">{d.yoy != null ? `${d.yoy > 0 ? '+' : ''}${formatDecimalPL(d.yoy, 1)}%` : '—'}</span>
                                <span className="h-3 flex-1 rounded-full bg-mk-surface-alt"><span className="block h-3 rounded-full" style={{ width: `${w}%`, background: d.color }} /></span>
                                <span className="w-14 shrink-0 text-right text-sm font-semibold tnum" style={{ color: c >= 0 ? '#0F172A' : '#16A34A' }}>{c > 0 ? '+' : ''}{formatDecimalPL(c, 2)}</span>
                                <ChevronRight size={16} className="shrink-0 text-mk-faint transition-transform group-hover:translate-x-0.5 group-hover:text-mk-muted" />
                            </button>
                        );
                    })}
                </div>
            </SectionCard>

            {/* ── Koszyk (donut) + tabela działów ── */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <SectionCard title="Koszyk inflacyjny 2026" subtitle="struktura wag koszyka (COICOP 2018, przybliżone)">
                    <div className="flex flex-col items-center gap-4 sm:flex-row">
                        <ResponsiveContainer width="100%" height={240}>
                            <PieChart>
                                <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={95} paddingAngle={1} stroke="#fff" strokeWidth={2}>
                                    {pieData.map((e, i) => <Cell key={i} fill={e.color} />)}
                                </Pie>
                                <Tooltip content={({ active, payload }) => {
                                    if (!active || !payload?.length) return null;
                                    const p = payload[0].payload as { name: string; value: number; yoy: number | null };
                                    return <div style={{ background: '#fff', border: '1px solid #E7EAF0', borderRadius: 10, padding: '8px 12px', boxShadow: '0 6px 16px rgba(16,24,40,.12)', fontSize: 13 }}>
                                        <div style={{ fontWeight: 600, color: '#0F172A' }}>{p.name}</div>
                                        <div style={{ color: '#64748B' }}>waga {formatDecimalPL(p.value, 1)}% · r/r {p.yoy != null ? `${formatDecimalPL(p.yoy, 1)}%` : '—'}</div>
                                    </div>;
                                }} />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="grid w-full grid-cols-1 gap-1 sm:max-w-[42%]">
                            {[...pieData].sort((a, b) => b.value - a.value).slice(0, 6).map((e) => (
                                <div key={e.name} className="flex items-center gap-2 text-xs">
                                    <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: e.color }} />
                                    <span className="flex-1 truncate text-mk-text-soft">{e.name}</span>
                                    <span className="tnum font-semibold text-mk-text">{formatDecimalPL(e.value, 1)}%</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </SectionCard>

                <SectionCard title="Wszystkie działy COICOP 2018" subtitle={`${divisions.length} działów · kliknij nagłówek, aby sortować`}
                    actions={<CsvExport filename="cpi-dzialy" headers={['Kod', 'Dział', 'Waga', 'r/r', 'm/m', 'Wkład']} rows={divisions.map((d) => [d.code, d.name, d.weight, d.yoy, d.mom, d.contribution])} />}>
                    <div className="max-h-[320px] overflow-auto">
                        <DataTable columns={cols} rows={divisions} initialSort="contribution" initialDir="desc" rowKey={(d) => d.code} />
                    </div>
                </SectionCard>
            </div>

            <div className="rounded-xl bg-mk-surface-alt p-4 text-sm text-mk-text-soft">
                <span className="font-semibold text-mk-text">Źródło: </span>GUS (DBW) — krajowy CPI (COICOP 2018 od 2026, COICOP 1999 do 2025); trend 10-letni uzupełniony szkieletem HICP (Eurostat) sprzed okresu danych krajowych.
                Działy i podkategorie (klasy COICOP 4-cyfrowe, np. Żywność → pieczywo/mięso/nabiał) — dynamiki oficjalne z GUS; wagi koszyka przybliżone.
            </div>

            {/* ── Drawer: szczegóły klikniętego działu ── */}
            <Drawer open={drawerOpen && !!sel} onClose={() => setDrawerOpen(false)} accent={selColor}
                title={sel ? `${sel.code} · ${sel.name}` : ''} subtitle={sel ? `waga ${formatDecimalPL(sel.weight, 1)}% koszyka inflacyjnego` : ''}>
                {sel && (
                    <div className="space-y-5">
                        <div className="grid grid-cols-4 gap-2">
                            {[
                                { l: 'r/r', v: sel.yoy != null ? `${sel.yoy > 0 ? '+' : ''}${formatDecimalPL(sel.yoy, 1)}%` : '—' },
                                { l: 'm/m', v: sel.mom != null ? `${sel.mom > 0 ? '+' : ''}${formatDecimalPL(sel.mom, 1)}%` : '—' },
                                { l: 'waga', v: `${formatDecimalPL(sel.weight, 1)}%` },
                                { l: 'wkład', v: sel.contribution != null ? `${sel.contribution > 0 ? '+' : ''}${formatDecimalPL(sel.contribution, 2)}` : '—' },
                            ].map((x) => (
                                <div key={x.l} className="rounded-xl border border-mk-border p-2 text-center">
                                    <div className="text-[11px] text-mk-muted">{x.l}</div>
                                    <div className="mt-0.5 text-base font-bold tnum text-mk-text">{x.v}</div>
                                </div>
                            ))}
                        </div>

                        <div className="rounded-xl bg-mk-surface-alt p-3.5 text-sm leading-relaxed text-mk-text-soft">
                            <div className="mb-1.5 flex items-center gap-1.5 font-semibold text-mk-text"><Info size={15} style={{ color: selColor }} /> Co wpływa na tę kategorię</div>
                            {DIVISION_INFO[sel.code] ?? 'Dynamika cen w tej kategorii zależy od popytu, kosztów i czynników sezonowych.'}
                        </div>

                        <div>
                            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                                <div className="text-[11px] font-semibold uppercase tracking-wide text-mk-muted">Dynamika cen — {METRIC_LABEL[divMetric]}</div>
                                <Segmented value={divMetric} onChange={setDivMetric} options={[{ value: 'yoy', label: 'r/r' }, { value: 'qoq', label: 'kw/kw' }, { value: 'mom', label: 'm/m' }]} />
                            </div>
                            {divChange.length > 1 ? (
                                <InteractiveChart data={divChange} xKey="date" height={220} unit="%" showRange initialRange="ALL" ranges={['1R', '3L', '5L', 'ALL']}
                                    valueFormatter={(v) => formatDecimalPL(v, 1)} xTickFormatter={monthTick} referenceLines={[{ y: 0, color: '#CBD2DD' }]}
                                    series={[{ key: 'value', name: sel.name, color: selColor, type: 'area', strokeWidth: 2.5 }]} />
                            ) : <div className="mk-skeleton h-[220px] w-full" />}
                            <p className="mt-1.5 text-[11px] text-mk-faint">Zmiana {METRIC_LABEL[divMetric]} liczona z indeksu cen HICP (Eurostat), 10 lat.</p>
                        </div>

                        {subs.length > 0 && (
                            <div className="border-t border-mk-border pt-4">
                                <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-mk-muted">Szczegóły działu · {subs.length} kategorii (r/r)</div>
                                <div className="space-y-1">
                                    {subs.map((s) => {
                                        const y = s.yoy ?? 0;
                                        const w = (Math.abs(y) / maxSubAbs) * 100;
                                        return (
                                            <div key={s.code} className="flex items-center gap-2 text-xs">
                                                <span className="w-40 shrink-0 truncate text-mk-text-soft" title={s.name}>{s.name}</span>
                                                <span className="h-2.5 flex-1 rounded-full bg-mk-surface-alt"><span className="block h-2.5 rounded-full" style={{ width: `${w}%`, marginLeft: y < 0 ? 'auto' : undefined, background: y >= 0 ? selColor : '#16A34A' }} /></span>
                                                <span className="w-12 shrink-0 text-right font-semibold tnum" style={{ color: y >= 0 ? '#DC2626' : '#16A34A' }}>{y > 0 ? '+' : ''}{formatDecimalPL(y, 1)}%</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </Drawer>
        </div>
    );
}
