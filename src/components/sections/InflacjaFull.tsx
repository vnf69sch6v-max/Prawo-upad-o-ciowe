'use client';

import { useMemo, useState, useCallback } from 'react';
import { PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, AreaChart, Area, CartesianGrid } from 'recharts';
import { ResponsiveContainer } from '@/components/ui/ChartContainer';
import { TrendingUp, Activity, Fuel, DollarSign, Factory, Banknote, Info, ChevronRight, Grid3x3, SlidersHorizontal, RotateCcw, Target } from 'lucide-react';
import { useCpiFull, usePPI, useBrentMM, useEURPLN, useUSDPLN, type CpiDivision, type CpiHistPoint } from '@/lib/hooks';
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
import { Heatmap } from '@/components/ui/Heatmap';
import { Sparkline } from '@/components/ui/Sparkline';
import { InsightBar } from '@/components/ui/InsightBar';
import { analyzeSeries } from '@/lib/observations';
import { InflationBubbles } from '@/components/sections/InflationBubbles';
import { AXIS_INK } from '@/lib/chart-theme';

const PALETTE = ['#2563EB', '#16A34A', '#D97706', '#7C3AED', '#E11D48', '#0891B2', '#CA8A04', '#DB2777', '#059669', '#4F46E5', '#EA580C', '#0D9488', '#64748B'];
const monthTick = (d: string) => { const [y, m] = d.split('-'); return m ? `${m}.${y.slice(2)}` : d; };
const colorFor = (i: number) => PALETTE[i % PALETTE.length];

type Pt = { date: string; value: number };
// Wybór metryki z historii GUS: r/r=yoy (kwartalnie COICOP 1999 + miesięcznie 2026), kw/kw=qoq
// (kwartalnie 1999), m/m=mom (miesięcznie 2026). Pusta seria = brak danych dla metryki na tym poziomie.
const seriesFor = (hist: CpiHistPoint[] | undefined, metric: 'yoy' | 'qoq' | 'mom'): Pt[] =>
    (hist ?? []).map((h) => ({ date: h.date, value: metric === 'yoy' ? h.yoy : metric === 'qoq' ? (h.qoq ?? null) : (h.mom ?? null) }))
        .filter((p): p is Pt => p.value != null);
const METRIC_LABEL: Record<'yoy' | 'qoq' | 'mom', string> = { yoy: 'rocznie (r/r)', qoq: 'kwartalnie (kw/kw)', mom: 'miesięcznie (m/m)' };

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

// „Co obejmuje" — opis wybranych klas COICOP (podkategorii); reszta pokazuje sam trend.
const SUB_INFO: Record<string, string> = {
    '0111': 'Pieczywo, mąka, makarony, kasze, ryż — ceny zbóż, energii i kosztów wypieku.',
    '0112': 'Mięso i wędliny (wołowina, wieprzowina, drób) — ceny pasz i energii, sytuacja epizootyczna (ASF, ptasia grypa).',
    '0113': 'Ryby i owoce morza — połowy, import, koszty chłodzenia i transportu.',
    '0114': 'Mleko, sery, jogurty, jaja — ceny skupu mleka, pasz i energii.',
    '0115': 'Oleje i tłuszcze (masło, oleje roślinne) — ceny surowców roślinnych na rynkach światowych.',
    '0116': 'Owoce świeże i przetwory — sezonowość, pogoda (przymrozki, susze), import.',
    '0117': 'Warzywa i ziemniaki — silna sezonowość i wrażliwość na pogodę.',
    '0118': 'Cukier, słodycze, dżemy, miód — ceny cukru i kakao na rynkach światowych.',
    '0121': 'Soki owocowe i warzywne — ceny owoców i kosztów przetwórstwa.',
    '0122': 'Kawa i substytuty — notowania kawy na giełdach, kurs USD/PLN.',
    '0211': 'Napoje spirytusowe i likiery — dominuje akcyza i jej coroczne podwyżki.',
    '0213': 'Piwo — akcyza, ceny surowców (słód, chmiel) i energii.',
    '0230': 'Wyroby tytoniowe — głównie akcyza i coroczna mapa akcyzowa.',
    '0312': 'Odzież (ubrania) — kursy walut (import z Azji), ceny bawełny i frachtu.',
    '0451': 'Energia elektryczna — taryfy zatwierdzane przez URE; mrożenie cen i tarcze osłonowe mają duży wpływ.',
    '0452': 'Gaz ziemny — taryfy URE, notowania hurtowe (TTF) i polityka osłonowa.',
    '0453': 'Paliwa płynne do ogrzewania (olej opałowy) — ceny ropy naftowej i kurs USD/PLN.',
    '0454': 'Paliwa stałe (węgiel, drewno) — ceny surowca i jego dostępność.',
    '0711': 'Samochody osobowe (nowe) — kursy walut, dostępność i popyt.',
    '0722': 'Paliwa i smary do aut (benzyna, ON, LPG) — ceny ropy Brent, kurs USD/PLN, akcyza i marże stacji.',
    '0731': 'Transport kolejowy pasażerski — taryfy przewoźników i dopłaty.',
    '0732': 'Transport drogowy pasażerski (autobusy) — ceny paliw i koszty pracy.',
    '0733': 'Transport lotniczy pasażerski — ceny paliwa lotniczego, sezonowość, popyt.',
    '0832': 'Usługi telefonii komórkowej — konkurencja operatorów i pakiety.',
    '1111': 'Restauracje i kawiarnie — koszty pracy, żywności i energii.',
    '1120': 'Usługi zakwaterowania (hotele) — popyt turystyczny i sezonowość.',
    '1313': 'Salony fryzjerskie i kosmetyczne — koszty pracy i wynajmu lokali.',
};
// Zapasowy opis, gdy brak szczegółowego (kategorie zbiorcze/„pozostałe"); dla reszty wystarcza pełna nazwa.
const subFallback = (name: string): string =>
    /pozostał|gdzie indziej|niesklasyfikowan/i.test(name) ? 'Kategoria zbiorcza — obejmuje pozycje nieujęte w pozostałych klasach tego działu.' : '';

export function InflacjaFull() {
    const { data, isLoading } = useCpiFull();
    const ppiQ = usePPI();
    const brentQ = useBrentMM();
    const eurQ = useEURPLN();
    const usdQ = useUSDPLN();

    const headline = useMemo(() => data?.headline ?? [], [data]);
    const divisions = useMemo(() => data?.divisions ?? [], [data]);
    const dataDate = data?.dataDate ?? null;
    const latest = headline.length ? headline[headline.length - 1] : null;
    const prev = headline.length > 1 ? headline[headline.length - 2] : null;

    // Auto-analiza (augmented analytics): sygnały z serii CPI r/r względem celu NBP.
    const cpiInsights = useMemo(() => analyzeSeries('Inflacja', headline.map((h) => h.yoy), { goodDown: true, unit: '%', target: { value: 2.5, label: 'NBP' } }), [headline]);

    // ── Struktura inflacji: CPI vs bazowa (GUS, bez żywności) vs PPI — wszystko na datach headline ──
    const ppiSeries = useMemo(() => plSeries(ppiQ.data), [ppiQ.data]);
    // Bazowa GUS ≈ CPI bez żywności: ważona średnia r/r działów poza „01" (dane GUS), po datach headline
    const exFood = useMemo(() => {
        const nonFood = divisions.filter((d) => d.code !== '01');
        const dates = new Set<string>();
        nonFood.forEach((d) => d.history.forEach((h) => { if (h.yoy != null) dates.add(h.date); }));
        const map = new Map<string, number>();
        for (const date of dates) {
            let sum = 0, w = 0;
            nonFood.forEach((d) => { const h = d.history.find((x) => x.date === date); if (h?.yoy != null) { sum += d.weight * h.yoy; w += d.weight; } });
            if (w > 0) map.set(date, +(sum / w).toFixed(1));
        }
        return map;
    }, [divisions]);
    // PPI (Eurostat, dane GUS) dopasowany do dat headline: miesięcznie wprost + kwartalna średnia dla „YYYY-QN"
    const ppiByDate = useMemo(() => {
        const map = new Map<string, number>();
        ppiSeries.forEach((p) => map.set(p.date, p.value));
        const byQ: Record<string, number[]> = {};
        ppiSeries.forEach((p) => { const [y, m] = p.date.split('-'); const q = Math.ceil(parseInt(m) / 3); (byQ[`${y}-Q${q}`] ??= []).push(p.value); });
        Object.entries(byQ).forEach(([k, arr]) => map.set(k, +(arr.reduce((s, v) => s + v, 0) / arr.length).toFixed(1)));
        return map;
    }, [ppiSeries]);
    const structureData = useMemo(() => headline.map((h) => ({ date: h.date, cpi: h.yoy, core: exFood.get(h.date) ?? null, ppi: ppiByDate.get(h.date) ?? null })), [headline, exFood, ppiByDate]);

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

    // ── Dekompozycja: wodospad wkładów działów budujący headline (pp) ──
    const waterfall = useMemo(() => {
        const sorted = [...divisions].filter((d) => d.contribution != null).sort((a, b) => (b.contribution ?? 0) - (a.contribution ?? 0));
        let cum = 0;
        const rows = sorted.map((d) => {
            const c = d.contribution as number;
            const base = c >= 0 ? cum : cum + c;
            cum += c;
            return { name: d.name, base: +base.toFixed(2), value: +Math.abs(c).toFixed(2), c, up: c >= 0, total: false };
        });
        rows.push({ name: 'CPI ogółem', base: 0, value: +cum.toFixed(2), c: +cum.toFixed(2), up: true, total: true });
        return rows;
    }, [divisions]);

    // ── Wkłady w czasie: wkład_i(t) = waga × r/r_i(t) (wagi bieżące — przybliżenie dla starszych lat) ──
    const contribTime = useMemo(() => {
        const dates = new Set<string>();
        divisions.forEach((d) => d.history.forEach((h) => { if (h.yoy != null) dates.add(h.date); }));
        return [...dates].sort().map((date) => {
            const row: Record<string, string | number | null> = { date };
            divisions.forEach((d) => {
                const h = d.history.find((x) => x.date === date);
                row[d.code] = h?.yoy != null ? +((d.weight / 100) * h.yoy).toFixed(2) : null;
            });
            return row;
        });
    }, [divisions]);

    // ── Mapa ciepła: dział × okres. r/r = pełne 10 lat; m/m = gęsty widok 2026 ──
    const [heatMetric, setHeatMetric] = useState<'yoy' | 'mom'>('yoy');
    const heat = useMemo(() => {
        const lookup = new Map<string, Map<string, { yoy: number | null; mom: number | null }>>();
        const datesY = new Set<string>(), datesM = new Set<string>();
        divisions.forEach((d) => {
            const m = new Map<string, { yoy: number | null; mom: number | null }>();
            d.history.forEach((h) => { m.set(h.date, { yoy: h.yoy, mom: h.mom ?? null }); if (h.yoy != null) datesY.add(h.date); if (h.mom != null) datesM.add(h.date); });
            lookup.set(d.code, m);
        });
        return { lookup, datesY: [...datesY].sort(), datesM: [...datesM].sort() };
    }, [divisions]);
    const heatRows = useMemo(() => divisions.map((d) => ({ key: d.code, label: `${d.code} · ${d.name}` })), [divisions]);
    const heatCols = heatMetric === 'yoy' ? heat.datesY : heat.datesM;
    const heatValue = useCallback((code: string, date: string) => heat.lookup.get(code)?.get(date)?.[heatMetric] ?? null, [heat, heatMetric]);

    // ── Symulator „co gdyby": suwaki r/r per dział → CPI z koszyka (Σ waga×r/r) ──
    const baselineSum = useMemo(() => +divisions.reduce((s, d) => s + (d.yoy != null ? (d.weight / 100) * d.yoy : 0), 0).toFixed(2), [divisions]);
    const [sim, setSim] = useState<Record<string, number>>({});
    const simSum = useMemo(() => +divisions.reduce((s, d) => s + (d.weight / 100) * (sim[d.code] ?? d.yoy ?? 0), 0).toFixed(2), [divisions, sim]);
    const simDelta = +(simSum - baselineSum).toFixed(2);
    const simDirty = Object.keys(sim).length > 0;
    const simColor = simDelta > 0.005 ? '#DC2626' : simDelta < -0.005 ? '#16A34A' : '#64748B';

    // ── Top movers: podkategorie (klasy), r/r lub m/m ──
    const [moverMetric, setMoverMetric] = useState<'yoy' | 'mom'>('yoy');
    const movers = useMemo(() => {
        const items: { name: string; div: string; v: number }[] = [];
        divisions.forEach((d) => (d.subcategories ?? []).forEach((s) => {
            const v = moverMetric === 'yoy' ? s.yoy : s.mom;
            if (v != null && Math.abs(v) < 95) items.push({ name: s.name, div: d.name, v }); // odrzuć artefakty „brak danych" (indeks=0 → −100%)
        }));
        const risers = [...items].sort((a, b) => b.v - a.v).slice(0, 8);
        const fallers = [...items].sort((a, b) => a.v - b.v).slice(0, 8);
        const maxV = Math.max(...items.map((x) => Math.abs(x.v)), 1);
        return { risers, fallers, maxV };
    }, [divisions, moverMetric]);

    const [freq, setFreq] = useState<'yoy' | 'mom'>('yoy');
    const [selCode, setSelCode] = useState<string | null>(null);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [expandedSub, setExpandedSub] = useState<string | null>(null);
    const openDiv = (code: string) => { setSelCode(code); setDrawerOpen(true); setExpandedSub(null); };

    const sel: CpiDivision | null = selCode ? divisions.find((d) => d.code === selCode) ?? null : null;
    const selColor = sel ? colorOf(sel.code) : '#2563EB';

    // Trend wybranego działu — w 100% GUS (historia z route: r/r pełna, kw/kw kwartalnie, m/m od 2026)
    const [divMetric, setDivMetric] = useState<'yoy' | 'qoq' | 'mom'>('yoy');
    const divChange = useMemo(() => seriesFor(sel?.history, divMetric), [sel, divMetric]);

    const subs = useMemo(() => (sel?.subcategories ?? [])
        .map((s) => ({ ...s, mv: divMetric === 'yoy' ? s.yoy : divMetric === 'qoq' ? (s.qoq ?? null) : s.mom }))
        .filter((s): s is typeof s & { mv: number } => s.mv != null && s.mv > -95)
        .sort((a, b) => b.mv - a.mv), [sel, divMetric]);
    const maxSubAbs = useMemo(() => Math.max(...subs.map((s) => Math.abs(s.mv)), 0.1), [subs]);
    const expSub = useMemo(() => subs.find((s) => s.code === expandedSub) ?? null, [subs, expandedSub]);
    const subChange = useMemo(() => seriesFor(expSub?.history, divMetric), [expSub, divMetric]);

    const chartData = useMemo(() => headline.map((h) => ({ date: h.date, value: freq === 'yoy' ? h.yoy : h.mom })), [headline, freq]);
    const pieData = useMemo(() => divisions.map((d, i) => ({ name: d.name, value: d.weight, color: colorFor(i), yoy: d.yoy })), [divisions]);

    const cols: Column<CpiDivision>[] = [
        { key: 'name', header: 'Dział', sortable: true, sortValue: (d) => d.code, render: (d) => <span><span className="text-mk-faint">{d.code}</span> {d.name}</span> },
        { key: 'weight', header: 'Waga', align: 'right', sortable: true, sortValue: (d) => d.weight, render: (d) => `${formatDecimalPL(d.weight, 1)}%` },
        { key: 'yoy', header: 'r/r', align: 'right', sortable: true, sortValue: (d) => d.yoy ?? -99, render: (d) => <span style={{ color: (d.yoy ?? 0) >= 0 ? '#DC2626' : '#16A34A', fontWeight: 600 }}>{d.yoy != null ? `${d.yoy > 0 ? '+' : ''}${formatDecimalPL(d.yoy, 1)}%` : '—'}</span> },
        { key: 'mom', header: 'm/m', align: 'right', sortable: true, sortValue: (d) => d.mom ?? -99, render: (d) => d.mom != null ? `${d.mom > 0 ? '+' : ''}${formatDecimalPL(d.mom, 1)}%` : '—' },
        { key: 'contribution', header: 'Wkład', align: 'right', sortable: true, sortValue: (d) => d.contribution ?? -99, render: (d) => <span className="font-semibold">{d.contribution != null ? `${d.contribution > 0 ? '+' : ''}${formatDecimalPL(d.contribution, 2)}` : '—'}</span> },
        { key: 'trend', header: 'Trend r/r (10 lat)', align: 'center', render: (d) => <Sparkline data={d.history.map((h) => h.yoy)} /> },
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

            {cpiInsights.length > 0 && <InsightBar items={cpiInsights} />}

            {/* ── Hero: trend r/r ↔ m/m ── */}
            <SectionCard title="Inflacja CPI — trend (10 lat)" subtitle={`${freq === 'yoy' ? 'rok do roku' : 'miesiąc do miesiąca'} (%) · krajowy CPI (GUS) · kwartalnie do 2025, miesięcznie od 2026`}
                actions={<div className="flex flex-wrap items-center gap-2">
                    <Segmented value={freq} onChange={setFreq} options={[{ value: 'yoy', label: 'r/r' }, { value: 'mom', label: 'm/m' }]} />
                    <StaleBadge date={dataDate} label="GUS do" warnAfterMonths={4} />
                    <CsvExport filename="cpi-10lat" headers={['Miesiąc', 'r/r', 'm/m']} rows={headline.map((h) => [h.date, h.yoy, h.mom])} />
                </div>}>
                <InteractiveChart data={chartData} xKey="date" height={320} unit="%" showRange initialRange="5L" ranges={['1R', '3L', '5L', 'ALL']}
                    valueFormatter={(v) => formatDecimalPL(v, 1)} xTickFormatter={monthTick}
                    referenceLines={freq === 'yoy' ? [{ y: 2.5, label: 'Cel NBP', color: AXIS_INK }] : [{ y: 0, color: '#CBD2DD' }]}
                    series={[{ key: 'value', name: freq === 'yoy' ? 'CPI r/r' : 'CPI m/m', color: '#D97706', type: 'area', strokeWidth: 2.5 }]} />
            </SectionCard>

            {/* ── Struktura inflacji: CPI vs bazowa vs PPI ── */}
            <SectionCard title="Struktura inflacji" subtitle="CPI ogółem · CPI bez żywności (bazowa) · PPI (ceny producenta) — r/r (%)">
                <InteractiveChart data={structureData} xKey="date" height={300} unit="%" showRange initialRange="5L" ranges={['1R', '3L', '5L', 'ALL']} legend
                    valueFormatter={(v) => formatDecimalPL(v, 1)} xTickFormatter={monthTick}
                    referenceLines={[{ y: 2.5, label: 'Cel NBP', color: AXIS_INK }]}
                    series={[
                        { key: 'cpi', name: 'CPI ogółem', color: '#D97706', type: 'line', strokeWidth: 2.5 },
                        { key: 'core', name: 'CPI bez żywności', color: '#7C3AED', type: 'line', strokeWidth: 2 },
                        { key: 'ppi', name: 'PPI (producent)', color: '#0891B2', type: 'line', strokeWidth: 2, dashed: true },
                    ]} />
                <p className="mt-2 text-xs text-mk-faint">
                    <span className="font-medium text-mk-muted">PPI</span> (ceny producenta) zwykle wyprzedza CPI — presja u producentów przekłada się na ceny konsumenckie z opóźnieniem.
                    <span className="font-medium text-mk-muted"> CPI bez żywności</span> (przybliżenie bazowej) liczony z działów GUS — pokazuje trwałość presji poza najbardziej zmienną żywnością. PPI: Eurostat (dane GUS).
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

            {/* ── Dekompozycja (wodospad) + Top movers ── */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <SectionCard title="Dekompozycja CPI — wkłady działów" subtitle={`z czego składa się inflacja${dataDate ? ` (${dataDate})` : ''} · słupki budują wskaźnik ogółem (pp)`}>
                    <ResponsiveContainer width="100%" height={Math.max(300, waterfall.length * 28)}>
                        <BarChart data={waterfall} layout="vertical" margin={{ top: 4, right: 44, left: 6, bottom: 4 }} barCategoryGap={5}>
                            <CartesianGrid stroke="#EDF0F5" horizontal={false} />
                            <XAxis type="number" tick={{ fill: AXIS_INK, fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(v) => formatDecimalPL(v, 1)} />
                            <YAxis type="category" dataKey="name" width={140} tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
                            <Tooltip cursor={{ fill: 'rgba(0,0,0,0.03)' }} content={({ active, payload }) => {
                                if (!active || !payload?.length) return null;
                                const p = payload[0].payload as { name: string; c: number };
                                return <div style={{ background: '#fff', border: '1px solid #E7EAF0', borderRadius: 10, padding: '6px 10px', fontSize: 13, boxShadow: '0 6px 16px rgba(16,24,40,.12)' }}>
                                    <div style={{ fontWeight: 600, color: '#0F172A' }}>{p.name}</div><div style={{ color: '#64748B' }}>wkład {p.c > 0 ? '+' : ''}{formatDecimalPL(p.c, 2)} pp</div>
                                </div>;
                            }} />
                            <Bar dataKey="base" stackId="a" fill="transparent" />
                            <Bar dataKey="value" stackId="a" radius={[0, 3, 3, 0]}>
                                {waterfall.map((r, i) => <Cell key={i} fill={r.total ? '#0F172A' : r.up ? '#DC2626' : '#16A34A'} />)}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                    <p className="mt-1 text-[11px] text-mk-faint">Czerwone podbijają inflację, zielone obniżają; ciemny słupek &bdquo;CPI ogółem&rdquo; = suma wkładów.</p>
                </SectionCard>

                <SectionCard title="Największe ruchy cen" subtitle="podkategorie (klasy COICOP) — co najbardziej zdrożało i staniało"
                    actions={<Segmented value={moverMetric} onChange={setMoverMetric} options={[{ value: 'yoy', label: 'r/r' }, { value: 'mom', label: 'm/m' }]} />}>
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                        {[{ t: 'Najbardziej zdrożało', arr: movers.risers, up: true }, { t: 'Najbardziej staniało', arr: movers.fallers, up: false }].map((col) => (
                            <div key={col.t}>
                                <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide" style={{ color: col.up ? '#DC2626' : '#16A34A' }}>{col.up ? '▲' : '▼'} {col.t}</div>
                                <div className="space-y-1.5">
                                    {col.arr.map((m, i) => (
                                        <div key={i} className="flex items-center gap-2 text-xs">
                                            <span className="w-32 shrink-0 truncate text-mk-text-soft" title={`${m.name} · ${m.div}`}>{m.name}</span>
                                            <span className="h-2.5 flex-1 rounded-full bg-mk-surface-alt"><span className="block h-2.5 rounded-full" style={{ width: `${(Math.abs(m.v) / movers.maxV) * 100}%`, marginLeft: m.v < 0 ? 'auto' : undefined, background: m.v >= 0 ? '#DC2626' : '#16A34A' }} /></span>
                                            <span className="w-12 shrink-0 text-right font-semibold tnum" style={{ color: m.v >= 0 ? '#DC2626' : '#16A34A' }}>{m.v > 0 ? '+' : ''}{formatDecimalPL(m.v, 1)}%</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </SectionCard>
            </div>

            {/* ── Wkłady do inflacji w czasie (stacked area) ── */}
            <SectionCard title="Wkłady do inflacji w czasie" subtitle="wkład każdego działu (waga × r/r) — co napędzało CPI · kwartalnie do 2025, miesięcznie 2026 (pp)">
                {contribTime.length < 2 ? <div className="mk-skeleton h-[320px] w-full" /> : (
                    <ResponsiveContainer width="100%" height={340}>
                        <AreaChart data={contribTime} margin={{ top: 6, right: 12, left: -6, bottom: 0 }}>
                            <CartesianGrid stroke="#EDF0F5" vertical={false} />
                            <XAxis dataKey="date" tick={{ fill: AXIS_INK, fontSize: 11 }} tickFormatter={monthTick} axisLine={{ stroke: '#E7EAF0' }} tickLine={false} minTickGap={28} />
                            <YAxis tick={{ fill: AXIS_INK, fontSize: 12 }} axisLine={false} tickLine={false} width={40} tickFormatter={(v) => formatDecimalPL(v, 0)} />
                            <Tooltip content={({ active, payload, label }) => {
                                if (!active || !payload?.length) return null;
                                const nums = payload.filter((p) => typeof p.value === 'number') as { value: number; color?: string; name?: string }[];
                                const total = nums.reduce((s, p) => s + p.value, 0);
                                const top = [...nums].filter((p) => Math.abs(p.value) > 0.01).sort((a, b) => Math.abs(b.value) - Math.abs(a.value)).slice(0, 5);
                                return <div style={{ background: '#fff', border: '1px solid #E7EAF0', borderRadius: 10, padding: '8px 12px', fontSize: 12, boxShadow: '0 6px 16px rgba(16,24,40,.12)', minWidth: 190 }}>
                                    <div style={{ fontWeight: 600, color: '#0F172A', marginBottom: 4 }}>{monthTick(String(label))} · CPI ≈ {formatDecimalPL(total, 1)} pp</div>
                                    {top.map((p, i) => <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#64748B', marginTop: 2 }}><span style={{ width: 8, height: 8, borderRadius: 2, background: p.color, flexShrink: 0 }} /><span style={{ flex: 1 }}>{p.name}</span><span style={{ fontWeight: 600, color: '#0F172A', fontVariantNumeric: 'tabular-nums' }}>{formatDecimalPL(p.value, 2)}</span></div>)}
                                </div>;
                            }} />
                            {divisions.map((d, i) => <Area key={d.code} type="monotone" dataKey={d.code} name={d.name} stackId="1" stroke="none" fill={colorFor(i)} fillOpacity={0.88} />)}
                        </AreaChart>
                    </ResponsiveContainer>
                )}
                <p className="mt-1 text-[11px] text-mk-faint">Suma warstw ≈ CPI ogółem. Wagi koszyka bieżące (2026) zastosowane do całej historii — przybliżenie dla starszych lat.</p>
            </SectionCard>

            {/* ── Mapa ciepła inflacji (dział × czas) ── */}
            <SectionCard title="Mapa ciepła inflacji" subtitle={heatMetric === 'yoy' ? 'dynamika r/r każdego działu w czasie — 10 lat · kliknij wiersz, aby otworzyć szczegóły' : 'dynamika m/m każdego działu — miesięcznie 2026 · kliknij wiersz, aby otworzyć szczegóły'}
                actions={<div className="flex items-center gap-2"><Grid3x3 size={15} className="text-mk-faint" /><Segmented value={heatMetric} onChange={setHeatMetric} options={[{ value: 'yoy', label: 'r/r (10 lat)' }, { value: 'mom', label: 'm/m (2026)' }]} /></div>}>
                {heatCols.length < 2 ? <div className="flex h-[280px] items-center justify-center text-sm text-mk-faint">Brak danych dla wybranej metryki.</div> : (
                    <Heatmap rows={heatRows} cols={heatCols} valueAt={heatValue} unit="%"
                        colTickFormatter={monthTick} valueFormatter={(v) => formatDecimalPL(v, 1)} onRowClick={openDiv} cellHeight={heatMetric === 'yoy' ? 20 : 26} />
                )}
                <p className="mt-2 text-[11px] text-mk-faint">Kolor = dynamika cen: <span className="font-medium" style={{ color: '#B91C1C' }}>czerwony</span> silny wzrost, biały ≈ 0, <span className="font-medium" style={{ color: '#1D4ED8' }}>niebieski</span> spadek. Skala nieliniowa (√) — żeby spokojne okresy nie zlewały się obok skoku 2022–23.</p>
            </SectionCard>

            {/* ── Animowana mapa działów w czasie (bąbelki) ── */}
            <InflationBubbles divisions={divisions} colorFor={colorFor} onSelect={openDiv} />

            {/* ── Symulator „co gdyby" (interaktywny koszyk) ── */}
            <SectionCard title="Symulator inflacji — co gdyby?" subtitle="przesuwaj roczną dynamikę działów i patrz, jak zmienia się CPI (koszyk × r/r)"
                actions={<div className="flex items-center gap-2">
                    <button onClick={() => setSim(Object.fromEntries(divisions.map((d) => [d.code, 2.5])))} className="inline-flex items-center gap-1.5 rounded-lg border border-mk-border px-2.5 py-1.5 text-xs font-medium text-mk-muted transition-colors hover:bg-mk-surface-alt hover:text-mk-text"><Target size={13} /> Cel NBP</button>
                    <button onClick={() => setSim({})} disabled={!simDirty} className="inline-flex items-center gap-1.5 rounded-lg border border-mk-border px-2.5 py-1.5 text-xs font-medium text-mk-muted transition-colors enabled:hover:bg-mk-surface-alt enabled:hover:text-mk-text disabled:opacity-40"><RotateCcw size={13} /> Reset</button>
                </div>}>
                <div className="mb-4 grid grid-cols-3 items-center gap-3 rounded-xl border border-mk-border bg-mk-surface-alt p-4">
                    <div className="text-center">
                        <div className="text-[11px] uppercase tracking-wide text-mk-muted">Bazowy CPI</div>
                        <div className="mt-0.5 text-2xl font-extrabold tnum text-mk-text">{formatDecimalPL(baselineSum, 1)}%</div>
                        <div className="text-[10px] text-mk-faint">z koszyka · dziś</div>
                    </div>
                    <div className="text-center">
                        <SlidersHorizontal size={18} className="mx-auto text-mk-faint" />
                        <div className="mt-1.5 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold tnum" style={{ background: simDelta > 0.005 ? '#FEF2F2' : simDelta < -0.005 ? '#F0FDF4' : '#F1F5F9', color: simColor }}>
                            {simDelta > 0 ? '+' : ''}{formatDecimalPL(simDelta, 2)} pp
                        </div>
                    </div>
                    <div className="text-center">
                        <div className="text-[11px] uppercase tracking-wide text-mk-muted">Symulowany CPI</div>
                        <div className="mt-0.5 text-2xl font-extrabold tnum" style={{ color: simColor }}>{formatDecimalPL(simSum, 1)}%</div>
                        <div className="text-[10px] text-mk-faint">{simDirty ? 'wg suwaków' : '= bazowy'}</div>
                    </div>
                </div>
                <div className="grid grid-cols-1 gap-x-6 gap-y-2.5 md:grid-cols-2">
                    {divisions.map((d, i) => {
                        const cur = sim[d.code] ?? d.yoy ?? 0;
                        const changed = sim[d.code] != null && Math.abs((sim[d.code] ?? 0) - (d.yoy ?? 0)) > 0.01;
                        const color = colorFor(i);
                        return (
                            <div key={d.code} className="flex items-center gap-3">
                                <span className="w-[8.5rem] shrink-0 truncate text-xs text-mk-text-soft" title={d.name}><span className="text-mk-faint">{d.code}</span> {d.name}</span>
                                <span className="w-9 shrink-0 text-right text-[10px] text-mk-faint" title="waga w koszyku">{formatDecimalPL(d.weight, 1)}%</span>
                                <input type="range" min={-15} max={40} step={0.5} value={cur} aria-label={`Dynamika r/r: ${d.name}`}
                                    onChange={(e) => setSim((s) => ({ ...s, [d.code]: +e.target.value }))}
                                    className="h-1.5 flex-1 cursor-pointer" style={{ accentColor: color }} />
                                <span className="w-14 shrink-0 text-right text-xs font-semibold tnum" style={{ color: changed ? color : '#64748B' }}>{cur > 0 ? '+' : ''}{formatDecimalPL(cur, 1)}%</span>
                            </div>
                        );
                    })}
                </div>
                <p className="mt-3 text-[11px] text-mk-faint">Uproszczenie: CPI ≈ Σ(waga działu × dynamika r/r). Dział waży tyle, ile jego udział w koszyku — dlatego żywność (25,9%) i mieszkanie/energia (19,5%) ruszają wskaźnikiem najmocniej, a edukacja (1%) minimalnie.</p>
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
                <span className="font-semibold text-mk-text">Źródło: </span>GUS (DBW) — krajowy CPI w 100%: COICOP 1999 kwartalnie (do 2025) + COICOP 2018 miesięcznie (od 2026).
                Działy z historią ~10-letnią; podkategorie (klasy COICOP 4-cyfrowe, np. Żywność → pieczywo/mięso) — miesięcznie od 2026. Wagi koszyka przybliżone.
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
                            ) : <p className="flex h-[120px] items-center justify-center text-center text-xs text-mk-faint">Brak danych GUS dla wybranej metryki na tym poziomie.</p>}
                            <p className="mt-1.5 text-[11px] text-mk-faint">GUS: r/r kwartalnie (COICOP 1999) do 2025 + miesięcznie (2026); kw/kw kwartalnie; m/m od 2026.</p>
                        </div>

                        {subs.length > 0 && (
                            <div className="border-t border-mk-border pt-4">
                                <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-mk-muted">Szczegóły działu · {subs.length} kategorii ({divMetric === 'yoy' ? 'r/r' : divMetric === 'qoq' ? 'kw/kw' : 'm/m'}) · kliknij, aby rozwinąć</div>
                                <div className="space-y-0.5">
                                    {subs.map((s) => {
                                        const y = s.mv;
                                        const w = (Math.abs(y) / maxSubAbs) * 100;
                                        const isExp = expandedSub === s.code;
                                        return (
                                            <div key={s.code}>
                                                <button onClick={() => setExpandedSub(isExp ? null : s.code)}
                                                    className={`flex w-full items-center gap-2 rounded-md px-1.5 py-1 text-left text-xs transition-colors ${isExp ? 'bg-mk-surface-alt' : 'hover:bg-mk-surface-alt'}`}>
                                                    <ChevronRight size={12} className="shrink-0 text-mk-faint transition-transform" style={{ transform: isExp ? 'rotate(90deg)' : undefined }} />
                                                    <span className="w-[8.5rem] shrink-0 truncate text-mk-text-soft" title={s.name}>{s.name}</span>
                                                    <span className="h-2.5 flex-1 rounded-full bg-mk-surface-alt"><span className="block h-2.5 rounded-full" style={{ width: `${w}%`, marginLeft: y < 0 ? 'auto' : undefined, background: y >= 0 ? selColor : '#16A34A' }} /></span>
                                                    <span className="w-12 shrink-0 text-right font-semibold tnum" style={{ color: y >= 0 ? '#DC2626' : '#16A34A' }}>{y > 0 ? '+' : ''}{formatDecimalPL(y, 1)}%</span>
                                                </button>
                                                {isExp && (
                                                    <div className="mb-1.5 ml-5 mt-1 rounded-lg border border-mk-border p-3">
                                                        <p className="text-xs font-semibold leading-snug text-mk-text">{s.name}</p>
                                                        {(SUB_INFO[s.code] || subFallback(s.name)) && <p className="mb-2 mt-0.5 text-xs leading-relaxed text-mk-text-soft">{SUB_INFO[s.code] ?? subFallback(s.name)}</p>}
                                                        <div className="mb-1 mt-2 text-[10px] font-semibold uppercase tracking-wide text-mk-faint">Trend cen — {METRIC_LABEL[divMetric]} · GUS (miesięcznie od 2026)</div>
                                                        {subChange.length > 1 ? (
                                                            <InteractiveChart data={subChange} xKey="date" height={150} unit="%" showRange initialRange="ALL" ranges={['1R', '5L', 'ALL']}
                                                                valueFormatter={(v) => formatDecimalPL(v, 1)} xTickFormatter={monthTick} referenceLines={[{ y: 0, color: '#CBD2DD' }]}
                                                                series={[{ key: 'value', name: s.name, color: selColor, type: 'area', strokeWidth: 2 }]} />
                                                        ) : <p className="flex h-[90px] items-center justify-center text-center text-[11px] text-mk-faint">{divMetric === 'qoq' ? 'kw/kw niedostępne dla podkategorii — wybierz r/r lub m/m.' : 'Za mało danych (podkategorie od 2026).'}</p>}
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
