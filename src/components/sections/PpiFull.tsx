'use client';

import { useMemo, useState, useCallback } from 'react';
import { Factory, Fuel, Activity, ChevronRight, Info, ArrowRight, Pickaxe, Zap, Droplets, ShoppingCart } from 'lucide-react';
import { usePpiFull, useCpiFull, type PpiSection, type PpiHistPoint } from '@/lib/hooks';
import { analyzeSeries, type Observation } from '@/lib/observations';
import { formatDecimalPL } from '@/lib/formatters';
import { KpiCard } from '@/components/ui/KpiCard';
import { InteractiveChart } from '@/components/ui/InteractiveChart';
import { SectionCard } from '@/components/ui/SectionCard';
import { Segmented } from '@/components/ui/Segmented';
import { CsvExport } from '@/components/ui/CsvExport';
import { StaleBadge } from '@/components/ui/StaleBadge';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { Drawer } from '@/components/ui/Drawer';
import { Heatmap } from '@/components/ui/Heatmap';
import { InsightBar } from '@/components/ui/InsightBar';

const monthTick = (d: string) => { const [y, m] = d.split('-'); return m ? `${m}.${y.slice(2)}` : d; };
const seriesFor = (hist: PpiHistPoint[] | undefined, metric: 'yoy' | 'mom') =>
    (hist ?? []).map((h) => ({ date: h.date, value: metric === 'yoy' ? h.yoy : h.mom })).filter((p): p is { date: string; value: number } => p.value != null);

// Kolory + ikony sekcji (kategorii)
const SEC_META: Record<string, { color: string; icon: typeof Factory }> = {
    B: { color: '#B45309', icon: Pickaxe },   // górnictwo
    C: { color: '#2563EB', icon: Factory },   // przetwórstwo
    D: { color: '#DC2626', icon: Zap },       // energia
    E: { color: '#0891B2', icon: Droplets },  // woda/odpady
};

// „Co napędza tę sekcję" (kategorię)
const SEC_INFO: Record<string, string> = {
    B: 'Ceny surowców wydobywczych — idą wprost za światowymi notowaniami ropy (Brent), gazu (TTF), węgla i rud metali oraz kursem USD/PLN. Najbardziej zmienna sekcja — to tu najwcześniej widać szok cenowy.',
    C: 'Przetwórstwo — najszerszy i najważniejszy segment. Koszty energii, surowców (metale, chemia, ropa) i pracy przekładają się na ceny wyrobów gotowych, które z opóźnieniem trafiają do CPI (konsumenta).',
    D: 'Wytwarzanie i dostawa energii — taryfy prądu i gazu (decyzje URE), ceny paliw i uprawnień do emisji CO₂. Uderza w koszty CAŁEGO przemysłu, więc „rozlewa się" na pozostałe sekcje.',
    E: 'Woda, ścieki i odpady — usługi komunalne. Mało wrażliwe na koniunkturę, bardziej na taryfy i koszty energii. Najstabilniejsza sekcja.',
};

// „Co obejmuje / co napędza" wybrane działy (subkategorie); reszta pokazuje sam trend + sekcję.
const DIV_INFO: Record<string, string> = {
    '05': 'Węgiel kamienny i brunatny — ceny krajowe i światowe, popyt energetyki i hut.',
    '06': 'Wydobycie ropy i gazu — ceny idą niemal 1:1 za notowaniami Brent/TTF i kursem USD/PLN. Najbardziej zmienny dział.',
    '07': 'Rudy metali — światowe notowania (miedź, cynk) i popyt przemysłu.',
    '10': 'Artykuły spożywcze — ceny surowców rolnych, energii i opakowań. Zwiastun cen żywności w CPI (z opóźnieniem).',
    '11': 'Napoje — surowce, energia, opakowania (szkło, aluminium) i akcyza.',
    '17': 'Papier — energochłonna produkcja; ceny celulozy, energii i frachtu.',
    '19': 'Koks i rafinacja ropy — najbardziej „naftowy" dział. Ceny paliw u producenta reagują niemal natychmiast na ropę Brent i kurs USD.',
    '20': 'Chemikalia — bardzo energochłonne; gaz ziemny jest zarazem surowcem i paliwem, więc ceny idą za TTF i ropą.',
    '21': 'Farmaceutyki — mniej wrażliwe na surowce, bardziej na regulacje i kursy walut.',
    '23': 'Materiały budowlane (cement, szkło, ceramika) — skrajnie energochłonne; ceny zależą od gazu, prądu i CO₂. Wyprzedzają koszty budownictwa.',
    '24': 'Metale — światowe notowania (LME), energia (huty energochłonne) i kurs USD/PLN.',
    '25': 'Metalowe wyroby gotowe — pochodna cen metali (dz. 24) i energii.',
    '26': 'Elektronika — globalne łańcuchy dostaw, ceny półprzewodników, kursy walut.',
    '27': 'Urządzenia elektryczne — miedź, stal, elektronika i koszty pracy.',
    '29': 'Pojazdy samochodowe — stal, elektronika, energia; globalne łańcuchy dostaw.',
    '31': 'Meble — drewno, płyty, energia i koszty pracy.',
    '36': 'Woda — taryfy zatwierdzane lokalnie, koszty energii i infrastruktury.',
    '38': 'Odpady i odzysk — opłaty, ceny surowców wtórnych i energii.',
};
const divFallback = (secName: string) => `Dział sekcji „${secName}". Ceny producenta zależą od kosztów surowców, energii i pracy w tej branży.`;

// Ogniwa łańcucha cenowego (edukacyjny pasek „co wynika z czego")
const PIPELINE = [
    { icon: Fuel, label: 'Surowce i energia', note: 'ropa, gaz, prąd, metale', color: '#B45309' },
    { icon: Pickaxe, label: 'Górnictwo (PPI B)', note: 'wydobycie surowców', color: '#B45309' },
    { icon: Factory, label: 'Przetwórstwo (PPI C)', note: 'wyroby gotowe', color: '#2563EB' },
    { icon: ShoppingCart, label: 'CPI — konsument', note: 'ceny w sklepie', color: '#16A34A' },
];

export function PpiFull() {
    const { data, isLoading } = usePpiFull();
    const cpiQ = useCpiFull();              // GUS CPI (10 lat) do zestawienia PPI→CPI — wszystko GUS

    const headline = useMemo(() => data?.headline ?? [], [data]);
    const sections = useMemo(() => data?.sections ?? [], [data]);
    const dataDate = data?.dataDate ?? null;
    const latest = headline.length ? headline[headline.length - 1] : null;
    const prev = headline.length > 1 ? headline[headline.length - 2] : null;

    const [freq, setFreq] = useState<'yoy' | 'mom'>('yoy');

    // ── PPI → CPI (wszystko GUS) — PPI wyrównany na daty headline CPI (kwartalne '2016-Q1' + miesięczne 2026) ──
    const ppiCpi = useMemo(() => {
        const cpiHead = cpiQ.data?.headline ?? [];
        const ppiByMonth = new Map(headline.map((p) => [p.date, p.yoy]));
        const qEnd: Record<string, string> = { '1': '03', '2': '06', '3': '09', '4': '12' };
        return cpiHead.map((h) => {
            const m = /^(\d{4})-Q(\d)$/.exec(h.date);
            const ppiKey = m ? `${m[1]}-${qEnd[m[2]]}` : h.date;   // kwartał CPI → miesiąc końca kwartału w PPI
            return { date: h.date, ppi: ppiByMonth.get(ppiKey) ?? null, cpi: h.yoy };
        });
    }, [cpiQ.data, headline]);

    // ── Wszystkie działy (płasko) do tabeli / top movers / heatmapy ──
    const allDivs = useMemo(() => sections.flatMap((s) => s.divisions.map((d) => ({ ...d, secName: s.name }))), [sections]);

    // Top movers (działy) — r/r lub m/m
    const [moverMetric, setMoverMetric] = useState<'yoy' | 'mom'>('yoy');
    const movers = useMemo(() => {
        const items = allDivs.map((d) => ({ code: d.code, name: d.name, v: moverMetric === 'yoy' ? d.yoy : d.mom })).filter((x): x is { code: string; name: string; v: number } => x.v != null && Math.abs(x.v) < 200);
        const risers = [...items].sort((a, b) => b.v - a.v).slice(0, 8);
        const fallers = [...items].sort((a, b) => a.v - b.v).slice(0, 8);
        const maxV = Math.max(...items.map((x) => Math.abs(x.v)), 1);
        return { risers, fallers, maxV };
    }, [allDivs, moverMetric]);

    // Mapa ciepła: dział × miesiąc
    const [heatMetric, setHeatMetric] = useState<'yoy' | 'mom'>('yoy');
    const heat = useMemo(() => {
        const lookup = new Map<string, Map<string, PpiHistPoint>>();
        const dates = new Set<string>();
        allDivs.forEach((d) => { const m = new Map<string, PpiHistPoint>(); d.history.forEach((h) => { m.set(h.date, h); if (h[heatMetric] != null) dates.add(h.date); }); lookup.set(d.code, m); });
        return { lookup, dates: [...dates].sort() };
    }, [allDivs, heatMetric]);
    const heatRows = useMemo(() => [...allDivs].sort((a, b) => (b.yoy ?? -999) - (a.yoy ?? -999)).map((d) => ({ key: d.code, label: `${d.code} · ${d.name}` })), [allDivs]);
    const heatValue = useCallback((code: string, date: string) => heat.lookup.get(code)?.get(date)?.[heatMetric] ?? null, [heat, heatMetric]);

    // Auto-analiza
    const insights = useMemo(() => {
        const out: Observation[] = analyzeSeries('PPI ogółem', headline.map((h) => h.yoy), { unit: '%', decimals: 1, period: 'month' }).slice(0, 2);
        const hot = [...allDivs].filter((d) => d.yoy != null).sort((a, b) => (b.yoy ?? 0) - (a.yoy ?? 0))[0];
        if (hot?.yoy != null) out.push({ kind: 'record', tone: 'warn', text: `Najszybciej drożeje: ${hot.name} (${hot.yoy > 0 ? '+' : ''}${formatDecimalPL(hot.yoy, 1)}% r/r)` });
        return out;
    }, [headline, allDivs]);

    // Drawer sekcji
    const [selCode, setSelCode] = useState<string | null>(null);
    const [open, setOpen] = useState(false);
    const [divMetric, setDivMetric] = useState<'yoy' | 'mom'>('yoy');
    const [expDiv, setExpDiv] = useState<string | null>(null);
    const openSec = (code: string) => { setSelCode(code); setOpen(true); setExpDiv(null); };
    const sel: PpiSection | null = selCode ? sections.find((s) => s.code === selCode) ?? null : null;
    const selColor = sel ? SEC_META[sel.code]?.color ?? '#2563EB' : '#2563EB';
    const secChange = useMemo(() => seriesFor(sel?.history, divMetric), [sel, divMetric]);
    const selDivs = useMemo(() => (sel?.divisions ?? []).map((d) => ({ ...d, mv: divMetric === 'yoy' ? d.yoy : d.mom })).filter((d): d is typeof d & { mv: number } => d.mv != null).sort((a, b) => b.mv - a.mv), [sel, divMetric]);
    const maxDivAbs = useMemo(() => Math.max(...selDivs.map((d) => Math.abs(d.mv)), 0.1), [selDivs]);
    const expDivObj = useMemo(() => selDivs.find((d) => d.code === expDiv) ?? null, [selDivs, expDiv]);
    const expDivChange = useMemo(() => seriesFor(expDivObj?.history, divMetric), [expDivObj, divMetric]);

    const chartData = useMemo(() => headline.map((h) => ({ date: h.date, value: freq === 'yoy' ? h.yoy : h.mom })), [headline, freq]);

    const cols: Column<typeof allDivs[number]>[] = [
        { key: 'code', header: 'Dział', sortable: true, sortValue: (d) => d.code, render: (d) => <span><span className="text-mk-faint">{d.code}</span> {d.name}</span> },
        { key: 'sec', header: 'Sekcja', align: 'center', sortable: true, sortValue: (d) => d.sec, render: (d) => <span className="rounded px-1.5 py-0.5 text-xs font-semibold" style={{ background: `${SEC_META[d.sec]?.color ?? '#64748B'}18`, color: SEC_META[d.sec]?.color ?? '#64748B' }}>{d.sec}</span> },
        { key: 'yoy', header: 'r/r', align: 'right', sortable: true, sortValue: (d) => d.yoy ?? -999, render: (d) => <span style={{ color: (d.yoy ?? 0) >= 0 ? '#DC2626' : '#16A34A', fontWeight: 600 }}>{d.yoy != null ? `${d.yoy > 0 ? '+' : ''}${formatDecimalPL(d.yoy, 1)}%` : '—'}</span> },
        { key: 'mom', header: 'm/m', align: 'right', sortable: true, sortValue: (d) => d.mom ?? -999, render: (d) => d.mom != null ? `${d.mom > 0 ? '+' : ''}${formatDecimalPL(d.mom, 1)}%` : '—' },
    ];

    if (isLoading) return <div className="space-y-4"><div className="grid grid-cols-2 gap-4">{Array.from({ length: 2 }).map((_, i) => <div key={i} className="mk-card h-28" />)}</div><div className="mk-skeleton h-[340px] w-full" /></div>;

    return (
        <div className="space-y-6">
            {/* KPI */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <KpiCard label="PPI ogółem (r/r)" value={latest?.yoy != null ? formatDecimalPL(latest.yoy, 1) : '—'} unit="%" accent="rose" icon={Factory}
                    delta={latest?.yoy != null && prev?.yoy != null ? { value: +(latest.yoy - prev.yoy).toFixed(1), unit: 'pp', invert: true } : undefined}
                    footnote={dataDate ? `GUS · ceny producenta · ${dataDate}` : 'GUS'} />
                <KpiCard label="PPI ogółem (m/m)" value={latest?.mom != null ? formatDecimalPL(latest.mom, 1) : '—'} unit="%" accent="amber" icon={Activity} footnote="miesiąc do miesiąca" />
            </div>

            {insights.length > 0 && <InsightBar items={insights} />}

            {/* Łańcuch przyczynowy — co wynika z czego */}
            <SectionCard title="Skąd biorą się ceny — łańcuch cenowy" subtitle="PPI to ceny u producenta („u bramy fabryki”) — wyprzedzają ceny konsumenta (CPI)">
                <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center">
                    {PIPELINE.map((step, i) => {
                        const Icon = step.icon;
                        return (
                            <div key={step.label} className="flex items-center gap-2 sm:flex-1">
                                <div className="flex flex-1 items-center gap-3 rounded-xl border border-mk-border p-3">
                                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg" style={{ background: `${step.color}18`, color: step.color }}><Icon size={18} /></span>
                                    <div className="min-w-0">
                                        <div className="truncate text-sm font-semibold text-mk-text">{step.label}</div>
                                        <div className="truncate text-[11px] text-mk-faint">{step.note}</div>
                                    </div>
                                </div>
                                {i < PIPELINE.length - 1 && <ArrowRight size={18} className="mx-auto shrink-0 rotate-90 text-mk-faint sm:rotate-0" />}
                            </div>
                        );
                    })}
                </div>
                <p className="mt-3 text-xs text-mk-faint">Wzrost cen surowców/energii najpierw podnosi PPI w <span className="font-medium" style={{ color: '#B45309' }}>górnictwie</span>, potem w <span className="font-medium" style={{ color: '#2563EB' }}>przetwórstwie</span>, a z opóźnieniem (kilka miesięcy) przekłada się na <span className="font-medium" style={{ color: '#16A34A' }}>CPI</span>. Dlatego PPI to „system wczesnego ostrzegania” dla inflacji konsumenckiej.</p>
            </SectionCard>

            {/* PPI → CPI */}
            <SectionCard title="PPI wyprzedza CPI" subtitle="ceny producenta (PPI) vs konsumenta (CPI) — r/r (%) · GUS · 10 lat">
                <InteractiveChart data={ppiCpi} xKey="date" height={300} unit="%" showRange initialRange="5L" ranges={['3L', '5L', 'ALL']} legend
                    valueFormatter={(v) => formatDecimalPL(v, 1)} xTickFormatter={monthTick} referenceLines={[{ y: 0, color: '#CBD2DD' }]}
                    series={[
                        { key: 'ppi', name: 'PPI (producent)', color: '#E11D48', type: 'line', strokeWidth: 2.5 },
                        { key: 'cpi', name: 'CPI (konsument)', color: '#2563EB', type: 'line', strokeWidth: 2 },
                    ]} />
                <p className="mt-2 text-xs text-mk-faint">Widać wyprzedzanie: skok PPI w 2021–22 (energia, surowce) poprzedził szczyt CPI o kilka miesięcy. Gdy PPI spada poniżej zera (deflacja producencka), presja na CPI słabnie.</p>
            </SectionCard>

            {/* Hero PPI trend */}
            <SectionCard title="PPI — trend" subtitle={`ceny produkcji sprzedanej przemysłu · ${freq === 'yoy' ? 'rok do roku' : 'miesiąc do miesiąca'} (%) · GUS`}
                actions={<div className="flex flex-wrap items-center gap-2"><Segmented value={freq} onChange={setFreq} options={[{ value: 'yoy', label: 'r/r' }, { value: 'mom', label: 'm/m' }]} /><StaleBadge date={dataDate} label="GUS do" warnAfterMonths={3} /><CsvExport filename="ppi-ogolem" headers={['Miesiąc', 'r/r', 'm/m']} rows={headline.map((h) => [h.date, h.yoy, h.mom])} /></div>}>
                <InteractiveChart data={chartData} xKey="date" height={300} unit="%" showRange initialRange="ALL" ranges={['1R', '3L', 'ALL']}
                    valueFormatter={(v) => formatDecimalPL(v, 1)} xTickFormatter={monthTick} referenceLines={[{ y: 0, color: '#CBD2DD' }]}
                    series={[{ key: 'value', name: freq === 'yoy' ? 'PPI r/r' : 'PPI m/m', color: '#E11D48', type: 'area', strokeWidth: 2.5 }]} />
            </SectionCard>

            {/* Sekcje (kategorie) */}
            <SectionCard title="Sekcje przemysłu" subtitle="4 kategorie PKD · kliknij, aby zobaczyć działy, trend i co napędza ceny">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {sections.map((s) => {
                        const meta = SEC_META[s.code] ?? { color: '#64748B', icon: Factory };
                        const Icon = meta.icon;
                        return (
                            <button key={s.code} onClick={() => openSec(s.code)} className="group flex items-start gap-3 rounded-xl border border-mk-border p-4 text-left transition-colors hover:bg-mk-surface-alt">
                                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg" style={{ background: `${meta.color}18`, color: meta.color }}><Icon size={20} /></span>
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center justify-between gap-2">
                                        <span className="truncate text-sm font-semibold text-mk-text"><span className="text-mk-faint">{s.code}</span> {s.name}</span>
                                        <span className="shrink-0 text-base font-bold tnum" style={{ color: (s.yoy ?? 0) >= 0 ? '#DC2626' : '#16A34A' }}>{s.yoy != null ? `${s.yoy > 0 ? '+' : ''}${formatDecimalPL(s.yoy, 1)}%` : '—'}</span>
                                    </div>
                                    <p className="mt-1 line-clamp-2 text-xs text-mk-faint">{SEC_INFO[s.code]}</p>
                                    <div className="mt-1.5 flex items-center gap-1 text-[11px] font-medium text-mk-muted">{s.divisions.length} działów <ChevronRight size={13} className="transition-transform group-hover:translate-x-0.5" /></div>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </SectionCard>

            {/* Mapa ciepła + Top movers */}
            <SectionCard title="Mapa ciepła — działy przemysłu w czasie" subtitle="dynamika cen producenta · dział PKD × miesiąc · kliknij wiersz"
                actions={<Segmented value={heatMetric} onChange={setHeatMetric} options={[{ value: 'yoy', label: 'r/r' }, { value: 'mom', label: 'm/m' }]} />}>
                {heat.dates.length < 2 ? <div className="flex h-[300px] items-center justify-center text-sm text-mk-faint">Brak danych.</div> : (
                    <Heatmap rows={heatRows} cols={heat.dates} valueAt={heatValue} unit="%" colTickFormatter={monthTick} valueFormatter={(v) => formatDecimalPL(v, 1)} cellHeight={16}
                        onRowClick={(code) => { const d = allDivs.find((x) => x.code === code); if (d) openSec(d.sec); }} />
                )}
                <p className="mt-2 text-[11px] text-mk-faint">Czerwony = ceny producenta rosną, niebieski = spadają. Widać, jak drożyzna „wchodzi” po branżach (najpierw energia i surowce).</p>
            </SectionCard>

            <SectionCard title="Największe ruchy cen producenta" subtitle="działy PKD — co najbardziej zdrożało i staniało u producenta"
                actions={<Segmented value={moverMetric} onChange={setMoverMetric} options={[{ value: 'yoy', label: 'r/r' }, { value: 'mom', label: 'm/m' }]} />}>
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    {[{ t: 'Najbardziej zdrożało', arr: movers.risers, up: true }, { t: 'Najbardziej staniało', arr: movers.fallers, up: false }].map((col) => (
                        <div key={col.t}>
                            <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide" style={{ color: col.up ? '#DC2626' : '#16A34A' }}>{col.up ? '▲' : '▼'} {col.t}</div>
                            <div className="space-y-1.5">
                                {col.arr.map((m) => (
                                    <div key={m.code} className="flex items-center gap-2 text-xs">
                                        <span className="w-36 shrink-0 truncate text-mk-text-soft" title={m.name}><span className="text-mk-faint">{m.code}</span> {m.name}</span>
                                        <span className="h-2.5 flex-1 rounded-full bg-mk-surface-alt"><span className="block h-2.5 rounded-full" style={{ width: `${(Math.abs(m.v) / movers.maxV) * 100}%`, marginLeft: m.v < 0 ? 'auto' : undefined, background: m.v >= 0 ? '#DC2626' : '#16A34A' }} /></span>
                                        <span className="w-14 shrink-0 text-right font-semibold tnum" style={{ color: m.v >= 0 ? '#DC2626' : '#16A34A' }}>{m.v > 0 ? '+' : ''}{formatDecimalPL(m.v, 1)}%</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </SectionCard>

            {/* Tabela wszystkich działów */}
            <SectionCard title="Wszystkie działy PKD" subtitle={`${allDivs.length} działów + 4 sekcje · kliknij nagłówek, aby sortować`}
                actions={<CsvExport filename="ppi-dzialy" headers={['Kod', 'Dział', 'Sekcja', 'r/r', 'm/m']} rows={allDivs.map((d) => [d.code, d.name, d.sec, d.yoy, d.mom])} />}>
                <div className="max-h-[360px] overflow-auto">
                    <DataTable columns={cols} rows={allDivs} initialSort="yoy" initialDir="desc" rowKey={(d) => d.code} onRowClick={(d) => openSec(d.sec)} />
                </div>
            </SectionCard>

            <div className="rounded-xl bg-mk-surface-alt p-4 text-sm text-mk-text-soft">
                <span className="font-semibold text-mk-text">PPI — ceny produkcji sprzedanej przemysłu (GUS): </span>
                ceny, po jakich producenci sprzedają swoje wyroby (bez VAT i handlu). Kategorie = 4 sekcje PKD, subkategorie = 28 działów. PPI wyprzedza CPI, bo koszty producentów z opóźnieniem trafiają do cen konsumenckich. Dane miesięczne, ostatnie ~3,5 roku.
            </div>

            {/* Drawer sekcji */}
            <Drawer open={open && !!sel} onClose={() => setOpen(false)} accent={selColor}
                title={sel ? `${sel.code} · ${sel.name}` : ''} subtitle="sekcja PKD · ceny produkcji przemysłu">
                {sel && (
                    <div className="space-y-5">
                        <div className="grid grid-cols-2 gap-2">
                            {[{ l: 'r/r', v: sel.yoy != null ? `${sel.yoy > 0 ? '+' : ''}${formatDecimalPL(sel.yoy, 1)}%` : '—' }, { l: 'm/m', v: sel.mom != null ? `${sel.mom > 0 ? '+' : ''}${formatDecimalPL(sel.mom, 1)}%` : '—' }].map((x) => (
                                <div key={x.l} className="rounded-xl border border-mk-border p-2.5 text-center"><div className="text-[11px] text-mk-muted">{x.l}</div><div className="mt-0.5 text-lg font-bold tnum text-mk-text">{x.v}</div></div>
                            ))}
                        </div>
                        <div className="rounded-xl bg-mk-surface-alt p-3.5 text-sm leading-relaxed text-mk-text-soft">
                            <div className="mb-1.5 flex items-center gap-1.5 font-semibold text-mk-text"><Info size={15} style={{ color: selColor }} /> Co napędza ceny w tej sekcji</div>
                            {SEC_INFO[sel.code]}
                        </div>
                        <div>
                            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                                <div className="text-[11px] font-semibold uppercase tracking-wide text-mk-muted">Trend cen — {divMetric === 'yoy' ? 'r/r' : 'm/m'}</div>
                                <Segmented value={divMetric} onChange={setDivMetric} options={[{ value: 'yoy', label: 'r/r' }, { value: 'mom', label: 'm/m' }]} />
                            </div>
                            {secChange.length > 1 && (
                                <InteractiveChart data={secChange} xKey="date" height={200} unit="%" showRange initialRange="ALL" ranges={['1R', 'ALL']}
                                    valueFormatter={(v) => formatDecimalPL(v, 1)} xTickFormatter={monthTick} referenceLines={[{ y: 0, color: '#CBD2DD' }]}
                                    series={[{ key: 'value', name: sel.name, color: selColor, type: 'area', strokeWidth: 2.5 }]} />
                            )}
                        </div>
                        {selDivs.length > 0 && (
                            <div className="border-t border-mk-border pt-4">
                                <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-mk-muted">Działy sekcji · {selDivs.length} · kliknij, aby rozwinąć</div>
                                <div className="space-y-0.5">
                                    {selDivs.map((d) => {
                                        const isExp = expDiv === d.code;
                                        const w = (Math.abs(d.mv) / maxDivAbs) * 100;
                                        return (
                                            <div key={d.code}>
                                                <button onClick={() => setExpDiv(isExp ? null : d.code)} className={`flex w-full items-center gap-2 rounded-md px-1.5 py-1 text-left text-xs transition-colors ${isExp ? 'bg-mk-surface-alt' : 'hover:bg-mk-surface-alt'}`}>
                                                    <ChevronRight size={12} className="shrink-0 text-mk-faint transition-transform" style={{ transform: isExp ? 'rotate(90deg)' : undefined }} />
                                                    <span className="w-[9rem] shrink-0 truncate text-mk-text-soft" title={d.name}><span className="text-mk-faint">{d.code}</span> {d.name}</span>
                                                    <span className="h-2.5 flex-1 rounded-full bg-mk-surface-alt"><span className="block h-2.5 rounded-full" style={{ width: `${w}%`, marginLeft: d.mv < 0 ? 'auto' : undefined, background: d.mv >= 0 ? selColor : '#16A34A' }} /></span>
                                                    <span className="w-12 shrink-0 text-right font-semibold tnum" style={{ color: d.mv >= 0 ? '#DC2626' : '#16A34A' }}>{d.mv > 0 ? '+' : ''}{formatDecimalPL(d.mv, 1)}%</span>
                                                </button>
                                                {isExp && (
                                                    <div className="mb-1.5 ml-5 mt-1 rounded-lg border border-mk-border p-3">
                                                        <p className="text-xs font-semibold leading-snug text-mk-text">{d.name}</p>
                                                        <p className="mb-2 mt-0.5 text-xs leading-relaxed text-mk-text-soft">{DIV_INFO[d.code] ?? divFallback(sel.name)}</p>
                                                        {expDivChange.length > 1 && (
                                                            <InteractiveChart data={expDivChange} xKey="date" height={140} unit="%" showRange initialRange="ALL" ranges={['ALL']}
                                                                valueFormatter={(v) => formatDecimalPL(v, 1)} xTickFormatter={monthTick} referenceLines={[{ y: 0, color: '#CBD2DD' }]}
                                                                series={[{ key: 'value', name: d.name, color: selColor, type: 'area', strokeWidth: 2 }]} />
                                                        )}
                                                    </div>
                                                )}
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
