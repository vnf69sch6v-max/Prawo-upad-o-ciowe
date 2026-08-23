'use client';

import { useMemo, useState, useCallback } from 'react';
import { Factory, Activity, ChevronRight, Info, Pickaxe, Zap, Droplets, Percent } from 'lucide-react';
import { usePpiFull, useCpiFull, useGusPpiHeadline, type PpiSection, type PpiHistPoint } from '@/lib/hooks';
import { formatDecimalPL, formatDataPeriodLabel } from '@/lib/formatters';
import { CompactKpiGrid, type CompactKpiItem } from '@/components/ui/CompactKpiGrid';
import { EditorialHero } from '@/components/ui/EditorialHero';
import { DensePageLayout, DenseTwoCol } from '@/components/ui/DensePageLayout';
import { InteractiveChart } from '@/components/ui/InteractiveChart';
import { SectionCard } from '@/components/ui/SectionCard';
import { Segmented } from '@/components/ui/Segmented';
import { StaleBadge } from '@/components/ui/StaleBadge';
import { RefreshButton } from '@/components/ui/RefreshButton';
import { Drawer } from '@/components/ui/Drawer';
import { Heatmap } from '@/components/ui/Heatmap';
import { RelatedNews } from '@/components/ui/RelatedNews';
import { QueryState, QueryEmpty } from '@/components/ui/QueryState';

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

export function PpiFull() {
    const { data, isLoading, isError, isFetching, refetch, refreshFromSource } = usePpiFull();
    const cpiQ = useCpiFull();
    useGusPpiHeadline();

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

    const cpiHeadline = useMemo(() => cpiQ.data?.headline ?? [], [cpiQ.data]);
    const cpiLatest = cpiHeadline.length ? cpiHeadline[cpiHeadline.length - 1] : null;
    const hotSec = useMemo(() => [...sections].filter((s) => s.yoy != null).sort((a, b) => (b.yoy ?? 0) - (a.yoy ?? 0))[0] ?? null, [sections]);

    // ── Hero „redakcyjny" (styl makiety v3) — WYŁĄCZNIE realne dane GUS ──
    const ppiYoY = latest?.yoy ?? null;
    const ppiDelta = ppiYoY != null && prev?.yoy != null ? +(ppiYoY - prev.yoy).toFixed(1) : null;
    const ppiHeadline = ppiYoY == null ? 'Ceny producenta (PPI)'
        : ppiYoY > 0.1 ? 'Ceny producenta rosną r/r'
        : ppiYoY < -0.1 ? 'Ceny producenta w deflacji'
        : 'Ceny producenta blisko zera';
    const ppiPeriod = dataDate ? formatDataPeriodLabel(dataDate).replace(/^dane za\s+/, '') : null;
    const ppiCpiSpread = ppiYoY != null && cpiLatest?.yoy != null ? +(ppiYoY - cpiLatest.yoy).toFixed(1) : null;

    const compactKpis: CompactKpiItem[] = [
        { key: 'ppi-mm', label: 'PPI m/m', value: latest?.mom != null ? formatDecimalPL(latest.mom, 1) : '—', unit: '%', icon: Activity, footnote: 'miesiąc do miesiąca', loading: isLoading },
        { key: 'cpi-mm', label: 'CPI m/m', value: cpiLatest?.mom != null ? formatDecimalPL(cpiLatest.mom, 1) : '—', unit: '%', icon: Percent, footnote: 'konsument', loading: cpiQ.isLoading },
        ...sections.slice(0, 4).map((s) => ({
            key: `sec-${s.code}`,
            label: `Sekcja ${s.code}`,
            value: s.yoy != null ? formatDecimalPL(s.yoy, 1) : '—',
            unit: '%' as const,
            icon: (SEC_META[s.code]?.icon ?? Factory),
            footnote: s.name.slice(0, 22),
            loading: isLoading,
        })),
    ].slice(0, 6);

    if (isLoading) {
        return (
            <div className="space-y-3" role="status" aria-busy="true" aria-label="Ładowanie PPI">
                <div className="mk-skeleton h-24 w-full" />
                <div className="grid grid-cols-2 gap-2">
                    {Array.from({ length: 6 }).map((_, i) => <div key={i} className="mk-card h-16" />)}
                </div>
                <div className="mk-skeleton h-[280px] w-full" />
            </div>
        );
    }
    if (isError) {
        return <QueryState isError onRetry={() => { void refetch(); }} height={320} />;
    }

    return (
        <DensePageLayout>
            <EditorialHero
                ariaLabel="PPI — najważniejszy odczyt"
                period={ppiPeriod}
                source="GUS · ceny producenta"
                headline={ppiHeadline}
                description={
                    <>
                        PPI wynosi {ppiYoY != null ? formatDecimalPL(ppiYoY, 1) : '—'}% r/r. Ceny u producenta wyprzedzają CPI o około dwa kwartały.
                        {hotSec?.yoy != null && ` Najszybciej drożeje ${hotSec.name.toLowerCase()} (${hotSec.yoy > 0 ? '+' : ''}${formatDecimalPL(hotSec.yoy, 1)}%).`}
                    </>
                }
                value={ppiYoY != null ? formatDecimalPL(ppiYoY, 1) : '—'}
                unit="%"
                delta={ppiDelta}
                panelTitle="PPI kontra CPI"
                rows={[
                    { label: 'PPI r/r', value: ppiYoY != null ? `${ppiYoY > 0 ? '+' : ''}${formatDecimalPL(ppiYoY, 1)}%` : '—' },
                    { label: 'CPI r/r', value: cpiLatest?.yoy != null ? `${cpiLatest.yoy > 0 ? '+' : ''}${formatDecimalPL(cpiLatest.yoy, 1)}%` : '—' },
                    { label: 'Rozstęp PPI − CPI', value: ppiCpiSpread != null ? `${ppiCpiSpread > 0 ? '+' : ''}${formatDecimalPL(ppiCpiSpread, 1)} p.p.` : '—', divider: true },
                    { label: 'PPI m/m', value: latest?.mom != null ? `${latest.mom > 0 ? '+' : ''}${formatDecimalPL(latest.mom, 1)}%` : '—' },
                ]}
            />

            <CompactKpiGrid items={compactKpis} label="Wskaźniki uzupełniające" dense />

            <DenseTwoCol
                left={<RelatedNews topic="ceny" limit={5} title="Newsy — ceny i inflacja" />}
                right={
                    <SectionCard editorial titleVariant="label" title="PPI — trend" subtitle={`${freq === 'yoy' ? 'rok do roku' : 'miesiąc do miesiąca'} (%) · GUS`}
                        actions={<div className="flex flex-wrap items-center gap-2">
                            <Segmented value={freq} onChange={setFreq} options={[{ value: 'yoy', label: 'r/r' }, { value: 'mom', label: 'm/m' }]} />
                            <RefreshButton onClick={() => { void refreshFromSource(); }} loading={isFetching && !isLoading} />
                            {dataDate && <span className="text-[11px] font-medium text-mk-muted">{formatDataPeriodLabel(dataDate)}</span>}
                            <StaleBadge date={dataDate} label="dane za" warnAfterMonths={3} />
                        </div>}>
                        <InteractiveChart data={chartData} xKey="date" height={280} unit="%" showRange initialRange="ALL" ranges={['1R', '3L', 'ALL']}
                            valueFormatter={(v) => formatDecimalPL(v, 1)} xTickFormatter={monthTick} referenceLines={[{ y: 0, color: '#CBD2DD' }]}
                            series={[{ key: 'value', name: freq === 'yoy' ? 'PPI r/r' : 'PPI m/m', color: '#E11D48', type: 'area', strokeWidth: 2.5 }]} />
                    </SectionCard>
                }
            />

            <DenseTwoCol
                left={
                    <SectionCard editorial titleVariant="label" title="PPI wyprzedza CPI" subtitle="producent vs konsument — r/r (%) · GUS">
                        <InteractiveChart data={ppiCpi} xKey="date" height={220} unit="%" showRange initialRange="5L" ranges={['3L', '5L', 'ALL']} legend
                            valueFormatter={(v) => formatDecimalPL(v, 1)} xTickFormatter={monthTick} referenceLines={[{ y: 0, color: '#CBD2DD' }]}
                            series={[
                                { key: 'ppi', name: 'PPI (producent)', color: '#E11D48', type: 'line', strokeWidth: 2.5 },
                                { key: 'cpi', name: 'CPI (konsument)', color: '#2563EB', type: 'line', strokeWidth: 2 },
                            ]} />
                    </SectionCard>
                }
                right={
                    <SectionCard editorial titleVariant="label" title="Sekcje przemysłu" subtitle="4 kategorie PKD · kliknij">
                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                            {sections.map((s) => {
                                const meta = SEC_META[s.code] ?? { color: '#64748B', icon: Factory };
                                const Icon = meta.icon;
                                return (
                                    <button key={s.code} onClick={() => openSec(s.code)} className="group flex items-center gap-2 rounded-lg border border-mk-border p-2.5 text-left transition-colors hover:bg-mk-surface-alt">
                                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg" style={{ background: `${meta.color}18`, color: meta.color }}><Icon size={16} /></span>
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center justify-between gap-1">
                                                <span className="truncate text-xs font-semibold text-mk-text"><span className="text-mk-faint">{s.code}</span> {s.name}</span>
                                                <span className="shrink-0 text-sm font-bold tnum" style={{ color: (s.yoy ?? 0) >= 0 ? '#DC2626' : '#16A34A' }}>{s.yoy != null ? `${s.yoy > 0 ? '+' : ''}${formatDecimalPL(s.yoy, 1)}%` : '—'}</span>
                                            </div>
                                            <div className="text-[10px] text-mk-faint">{s.divisions.length} działów · kliknij</div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </SectionCard>
                }
            />

            <DenseTwoCol
                left={
                    <SectionCard editorial titleVariant="label" title="Mapa ciepła — działy PKD" subtitle="dynamika cen producenta"
                        actions={<Segmented value={heatMetric} onChange={setHeatMetric} options={[{ value: 'yoy', label: 'r/r' }, { value: 'mom', label: 'm/m' }]} />}>
                        {heat.dates.length < 2 ? <QueryEmpty title="Brak danych" height={220} /> : (
                            <Heatmap rows={heatRows} cols={heat.dates} valueAt={heatValue} unit="%" colTickFormatter={monthTick} valueFormatter={(v) => formatDecimalPL(v, 1)} cellHeight={14}
                                onRowClick={(code) => { const d = allDivs.find((x) => x.code === code); if (d) openSec(d.sec); }} />
                        )}
                    </SectionCard>
                }
                right={
                    <SectionCard editorial titleVariant="label" title="Największe ruchy cen" subtitle="działy PKD u producenta"
                        actions={<Segmented value={moverMetric} onChange={setMoverMetric} options={[{ value: 'yoy', label: 'r/r' }, { value: 'mom', label: 'm/m' }]} />}>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            {[{ t: 'Zdrożało', arr: movers.risers, up: true }, { t: 'Staniało', arr: movers.fallers, up: false }].map((col) => (
                                <div key={col.t}>
                                    <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide" style={{ color: col.up ? '#DC2626' : '#16A34A' }}>{col.up ? '▲' : '▼'} {col.t}</div>
                                    <div className="space-y-1">
                                        {col.arr.slice(0, 6).map((m) => (
                                            <div key={m.code} className="flex items-center gap-1.5 text-[11px]">
                                                <span className="w-24 shrink-0 truncate text-mk-text-soft" title={m.name}><span className="text-mk-faint">{m.code}</span> {m.name}</span>
                                                <span className="h-2 flex-1 rounded-full bg-mk-surface-alt"><span className="block h-2 rounded-full" style={{ width: `${(Math.abs(m.v) / movers.maxV) * 100}%`, marginLeft: m.v < 0 ? 'auto' : undefined, background: m.v >= 0 ? '#DC2626' : '#16A34A' }} /></span>
                                                <span className="w-10 shrink-0 text-right font-semibold tnum" style={{ color: m.v >= 0 ? '#DC2626' : '#16A34A' }}>{m.v > 0 ? '+' : ''}{formatDecimalPL(m.v, 1)}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </SectionCard>
                }
            />

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
        </DensePageLayout>
    );
}
