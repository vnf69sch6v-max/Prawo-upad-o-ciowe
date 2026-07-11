'use client';

import { useState } from 'react';
import { TrendingUp, ShoppingCart, Wrench, Package, Factory, Home, HardHat, Wheat } from 'lucide-react';
import { useCpiNational } from '@/lib/hooks';
import { fmtPL } from '@/lib/series';
import { formatDecimalPL } from '@/lib/formatters';
import { KpiCard } from '@/components/ui/KpiCard';
import { InteractiveChart } from '@/components/ui/InteractiveChart';
import { SectionCard } from '@/components/ui/SectionCard';
import { Segmented } from '@/components/ui/Segmented';
import { CsvExport } from '@/components/ui/CsvExport';
import { StaleBadge } from '@/components/ui/StaleBadge';
import { DbwPriceSection } from '@/components/sections/DbwPriceSection';

type Tab = 'inflacja' | 'ppi' | 'nieruchomosci' | 'budowlane' | 'rolne';
const TABS: { value: Tab; label: string }[] = [
    { value: 'inflacja', label: 'Inflacja CPI' },
    { value: 'ppi', label: 'PPI' },
    { value: 'nieruchomosci', label: 'Nieruchomości' },
    { value: 'budowlane', label: 'Budowlano-montażowe' },
    { value: 'rolne', label: 'Rolne' },
];

const monthTick = (d: string) => { const [y, m] = d.split('-'); return m ? `${m}.${y.slice(2)}` : d; };

function CpiNationalSection() {
    const q = useCpiNational();
    const trend = q.data?.trend ?? [];
    const latest = q.data?.latest ?? null;
    const cats = latest?.categories ?? [];
    const cat = (n: string) => cats.find((c) => c.name.startsWith(n))?.yoy ?? null;
    const delta = trend.length > 1 ? +(trend[trend.length - 1].value - trend[trend.length - 2].value).toFixed(1) : null;
    const maxAbs = Math.max(...cats.map((c) => Math.abs(c.yoy ?? 0)), 1);

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <KpiCard label="CPI krajowy (r/r)" value={fmtPL(latest?.ogolem)} unit="%" accent="amber" icon={TrendingUp}
                    delta={delta != null ? { value: delta, unit: 'pp', invert: true } : undefined} footnote={latest ? `GUS · ${latest.date}` : 'GUS'} loading={q.isLoading} />
                <KpiCard label="Żywność (r/r)" value={fmtPL(cat('Żywność'))} unit="%" accent="green" icon={ShoppingCart} footnote="GUS" loading={q.isLoading} />
                <KpiCard label="Usługi (r/r)" value={fmtPL(cat('Usługi'))} unit="%" accent="violet" icon={Wrench} footnote="GUS" loading={q.isLoading} />
                <KpiCard label="Towary nieżywn. (r/r)" value={fmtPL(cat('Towary'))} unit="%" accent="cyan" icon={Package} footnote="GUS" loading={q.isLoading} />
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <SectionCard title="CPI krajowy — trend" subtitle="GUS · r/r (%)"
                    actions={<div className="flex items-center gap-2"><StaleBadge date={latest?.date} label="GUS do" warnAfterMonths={4} /><CsvExport filename="cpi-krajowy" headers={['Miesiąc', 'CPI r/r']} rows={trend.map((t) => [t.date, t.value])} /></div>}>
                    {q.isLoading ? <div className="mk-skeleton h-[280px] w-full" /> : (
                        <InteractiveChart data={trend} xKey="date" height={280} unit="%" valueFormatter={(v) => formatDecimalPL(v, 1)} xTickFormatter={monthTick}
                            referenceLines={[{ y: 2.5, label: 'Cel NBP', color: '#94A3B8' }]}
                            series={[{ key: 'value', name: 'CPI krajowy r/r', color: '#D97706', type: 'area', strokeWidth: 2.5 }]} />
                    )}
                </SectionCard>
                <SectionCard title="Struktura inflacji — komponenty" subtitle={latest ? `GUS · ${latest.date}` : 'GUS'}>
                    {q.isLoading ? <div className="mk-skeleton h-[280px] w-full" /> : (
                        <table className="mk-table">
                            <thead><tr><th>Komponent</th><th className="text-right">r/r</th><th style={{ width: '45%' }}>Skala</th></tr></thead>
                            <tbody>
                                {cats.map((c) => {
                                    const v = c.yoy ?? 0; const w = (Math.abs(v) / maxAbs) * 100; const pos = v >= 0;
                                    return (
                                        <tr key={c.name}>
                                            <td className="font-medium text-mk-text">{c.name}</td>
                                            <td className="text-right font-semibold tnum" style={{ color: pos ? '#DC2626' : '#16A34A' }}>{pos ? '+' : ''}{formatDecimalPL(v, 1)}%</td>
                                            <td><div className="h-2.5 rounded-full" style={{ width: `${w}%`, background: pos ? '#D97706' : '#16A34A' }} /></td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </SectionCard>
            </div>

            <div className="rounded-xl bg-mk-surface-alt p-4 text-sm text-mk-text-soft">
                <span className="font-semibold text-mk-text">Źródło: </span>GUS (DBW) — krajowy wskaźnik cen towarów i usług konsumpcyjnych (oficjalny, miesięczny).
                To „polska" inflacja z komunikatów GUS; różni się od zharmonizowanego HICP (Eurostat) użytego w nowcastcie koszykowym (Prognozy).
            </div>
        </div>
    );
}

export default function CenyPage() {
    const [tab, setTab] = useState<Tab>('inflacja');
    return (
        <div className="mk-fade-in space-y-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-mk-text">Ceny</h1>
                    <p className="mt-1 text-sm text-mk-muted">Inflacja konsumencka, ceny producenta, nieruchomości, budownictwo i rolnictwo</p>
                </div>
                <Segmented value={tab} onChange={setTab} options={TABS} aria-label="Sekcja cen" />
            </div>

            {tab === 'inflacja' && <CpiNationalSection />}
            {tab === 'ppi' && (
                <DbwPriceSection title="PPI — ceny produkcji sprzedanej przemysłu" subtitle="GUS · r/r (%)" csvName="ppi" refline={0}
                    config={{ var: 314, przekroj: 657, poz: [6966261, 6971743] }}
                    series={[
                        { poz: 6966261, name: 'PPI ogółem', color: '#2563EB', accent: 'blue', icon: Factory },
                        { poz: 6971743, name: 'Przetwórstwo przem.', color: '#7C3AED', accent: 'violet', icon: Factory },
                    ]}
                    note="PPI = ceny producenta (u bramy fabryki), zwykle wyprzedzają CPI. Ujemne = deflacja producencka." />
            )}
            {tab === 'nieruchomosci' && (
                <DbwPriceSection title="Ceny mieszkań — indeks (r/r)" subtitle="GUS · kwartalnie (%)" csvName="ceny-nieruchomosci" refline={0}
                    config={{ var: 310, przekroj: 484, poz: [4801795, 4801796], freq: 'q' }}
                    series={[
                        { poz: 4801795, name: 'Rynek pierwotny', color: '#16A34A', accent: 'green', icon: Home },
                        { poz: 4801796, name: 'Rynek wtórny', color: '#D97706', accent: 'amber', icon: Home },
                    ]}
                    note="Wskaźnik cen nieruchomości mieszkaniowych GUS — dynamika r/r dla rynku pierwotnego i wtórnego." />
            )}
            {tab === 'budowlane' && (
                <DbwPriceSection title="Ceny robót budowlano-montażowych" subtitle="GUS · r/r (%)" csvName="ceny-budowlane" refline={0}
                    config={{ var: 312, przekroj: 93, poz: [6661787] }}
                    series={[{ poz: 6661787, name: 'Budownictwo (r/r)', color: '#0891B2', accent: 'cyan', icon: HardHat }]} />
            )}
            {tab === 'rolne' && (
                <DbwPriceSection title="Ceny skupu produktów rolnych (r/r)" subtitle="GUS · r/r (%)" csvName="ceny-rolne" refline={0}
                    config={{ var: 324, przekroj: 775, poz: [7124703, 7124713, 7124724, 7189791, 7121981] }}
                    series={[
                        { poz: 7124703, name: 'Pszenica', color: '#D97706', accent: 'amber', icon: Wheat },
                        { poz: 7124713, name: 'Żyto', color: '#CA8A04', accent: 'amber', icon: Wheat },
                        { poz: 7124724, name: 'Żywiec — trzoda', color: '#E11D48', accent: 'rose' },
                        { poz: 7189791, name: 'Żywiec — bydło', color: '#7C3AED', accent: 'violet' },
                        { poz: 7121981, name: 'Mleko', color: '#0891B2', accent: 'cyan' },
                    ]}
                    note="Dynamika cen skupu podstawowych produktów rolnych." />
            )}
        </div>
    );
}
