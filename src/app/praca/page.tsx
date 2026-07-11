'use client';

import { useState } from 'react';
import { Briefcase, UserMinus, DoorOpen, Activity, Percent } from 'lucide-react';
import { useBdlSeries } from '@/lib/hooks';
import { formatDecimalPL, formatNumber } from '@/lib/formatters';
import { Segmented } from '@/components/ui/Segmented';
import { KpiCard } from '@/components/ui/KpiCard';
import { InteractiveChart } from '@/components/ui/InteractiveChart';
import { SectionCard } from '@/components/ui/SectionCard';
import { CsvExport } from '@/components/ui/CsvExport';
import { RynekPracySection } from '@/components/sections/macro-sections';

type Tab = 'bezrobocie' | 'zatrudnienie' | 'bael';
const TABS: { value: Tab; label: string }[] = [
    { value: 'bezrobocie', label: 'Bezrobocie i płace' },
    { value: 'zatrudnienie', label: 'Zatrudnienie i wakaty' },
    { value: 'bael', label: 'BAEL' },
];

const monthTick = (d: string) => { const [y, m] = d.split('-'); return m ? `${m}.${y.slice(2)}` : d; };

function ZatrudnienieSection() {
    const zatrQ = useBdlSeries(154348, 12);
    const bezrQ = useBdlSeries(217613, 12);
    const wakQ = useBdlSeries(1653025, 1);
    const zatr = zatrQ.data?.series ?? [];
    const bezr = bezrQ.data?.series ?? [];
    const zLast = zatr.length ? zatr[zatr.length - 1] : null;
    const bLast = bezr.length ? bezr[bezr.length - 1] : null;
    const wLast = wakQ.data?.series?.[0] ?? null;

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <KpiCard label="Przeciętne zatrudnienie" value={zLast ? formatDecimalPL(zLast.value / 1e6, 2) : '—'} unit="mln etatów" accent="blue" icon={Briefcase}
                    footnote={zLast ? `sektor przeds. · ${zLast.date}` : 'GUS'} loading={zatrQ.isLoading} />
                <KpiCard label="Bezrobotni zarejestrowani" value={bLast ? formatNumber(bLast.value / 1e3, 0) : '—'} unit="tys. osób" accent="rose" icon={UserMinus}
                    footnote={bLast ? `GUS · ${bLast.date}` : 'GUS'} loading={bezrQ.isLoading} />
                <KpiCard label="Wolne miejsca pracy" value={wLast ? formatDecimalPL(wLast.value, 1) : '—'} unit="tys." accent="green" icon={DoorOpen}
                    footnote="GUS · wakaty (kw.)" loading={wakQ.isLoading} />
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <SectionCard title="Przeciętne zatrudnienie w przedsiębiorstwach" subtitle="GUS · mln etatów (2025)"
                    actions={<CsvExport filename="zatrudnienie" headers={['Miesiąc', 'Etaty']} rows={zatr.map((p) => [p.date, p.value])} />}>
                    {zatrQ.isLoading ? <div className="mk-skeleton h-[260px] w-full" /> : (
                        <InteractiveChart data={zatr} xKey="date" height={260} unit=" mln" valueFormatter={(v) => formatDecimalPL(v / 1e6, 2)} xTickFormatter={monthTick}
                            series={[{ key: 'value', name: 'Zatrudnienie', color: '#2563EB', type: 'area' }]} />
                    )}
                </SectionCard>
                <SectionCard title="Bezrobotni zarejestrowani" subtitle="GUS · tys. osób (2025)"
                    actions={<CsvExport filename="bezrobotni" headers={['Miesiąc', 'Osoby']} rows={bezr.map((p) => [p.date, p.value])} />}>
                    {bezrQ.isLoading ? <div className="mk-skeleton h-[260px] w-full" /> : (
                        <InteractiveChart data={bezr} xKey="date" height={260} unit=" tys." valueFormatter={(v) => formatDecimalPL(v / 1e3, 0)} xTickFormatter={monthTick}
                            series={[{ key: 'value', name: 'Bezrobotni', color: '#E11D48', type: 'area' }]} />
                    )}
                </SectionCard>
            </div>
        </div>
    );
}

function BaelSection() {
    const aktQ = useBdlSeries(1615281, 1);
    const zatrQ = useBdlSeries(1615457, 1);
    const akt = aktQ.data?.series?.[0]?.value ?? null;
    const zatr = zatrQ.data?.series?.[0]?.value ?? null;

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <KpiCard label="Współczynnik aktywności zawodowej" value={akt != null ? formatDecimalPL(akt, 1) : '—'} unit="%" accent="blue" icon={Activity} footnote="BAEL · GUS" loading={aktQ.isLoading} />
                <KpiCard label="Wskaźnik zatrudnienia" value={zatr != null ? formatDecimalPL(zatr, 1) : '—'} unit="%" accent="green" icon={Percent} footnote="BAEL · GUS" loading={zatrQ.isLoading} />
            </div>
            <div className="rounded-xl bg-mk-surface-alt p-4 text-sm text-mk-text-soft">
                <span className="font-semibold text-mk-text">BAEL </span>(Badanie Aktywności Ekonomicznej Ludności) — kwartalne badanie GUS wg standardu Eurostat/ILO.
                Współczynnik aktywności = udział aktywnych zawodowo w ludności 15+; wskaźnik zatrudnienia = udział pracujących.
            </div>
        </div>
    );
}

export default function RynekPracyPage() {
    const [tab, setTab] = useState<Tab>('bezrobocie');
    return (
        <div className="mk-fade-in space-y-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-mk-text">Rynek pracy</h1>
                    <p className="mt-1 text-sm text-mk-muted">Bezrobocie, zatrudnienie, wynagrodzenia i aktywność zawodowa</p>
                </div>
                <Segmented value={tab} onChange={setTab} options={TABS} aria-label="Sekcja rynku pracy" />
            </div>

            {tab === 'bezrobocie' && <RynekPracySection />}
            {tab === 'zatrudnienie' && <ZatrudnienieSection />}
            {tab === 'bael' && <BaelSection />}
        </div>
    );
}
