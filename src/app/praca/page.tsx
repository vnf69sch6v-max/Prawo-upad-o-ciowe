'use client';

import { useState } from 'react';
import { useInitialTab } from '@/lib/use-initial-tab';
import { Briefcase, DoorOpen, Activity, Percent } from 'lucide-react';
import { useBdlSeries } from '@/lib/hooks';
import { formatDecimalPL } from '@/lib/formatters';
import { Segmented } from '@/components/ui/Segmented';
import { KpiCard } from '@/components/ui/KpiCard';
import { InteractiveChart } from '@/components/ui/InteractiveChart';
import { SectionCard } from '@/components/ui/SectionCard';
import { CsvExport } from '@/components/ui/CsvExport';
import { RynekPracySection } from '@/components/sections/macro-sections';
import { RelatedNews } from '@/components/ui/RelatedNews';

type Tab = 'bezrobocie' | 'zatrudnienie' | 'bael';
const TABS: { value: Tab; label: string }[] = [
    { value: 'bezrobocie', label: 'Bezrobocie i płace' },
    { value: 'zatrudnienie', label: 'Zatrudnienie i wakaty' },
    { value: 'bael', label: 'BAEL' },
];

const monthTick = (d: string) => { const [y, m] = d.split('-'); return m ? `${m}.${y.slice(2)}` : d; };

function ZatrudnienieSection() {
    const zatrQ = useBdlSeries(154348, 12);
    const wakQ = useBdlSeries(1653025, 1);
    const zatr = zatrQ.data?.series ?? [];
    const zLast = zatr.length ? zatr[zatr.length - 1] : null;
    const wSeries = wakQ.data?.series ?? [];
    const wLast = wSeries.length ? wSeries[wSeries.length - 1] : null;

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <KpiCard label="Przeciętne zatrudnienie" value={zLast ? formatDecimalPL(zLast.value / 1e6, 2) : '—'} unit="mln etatów" accent="blue" icon={Briefcase}
                    footnote={zLast ? `sektor przeds. · ${zLast.date}` : 'GUS'} loading={zatrQ.isLoading} />
                <KpiCard label="Wolne miejsca pracy" value={wLast ? formatDecimalPL(wLast.value, 1) : '—'} unit="tys." accent="green" icon={DoorOpen}
                    footnote="GUS · wakaty (kw.)" loading={wakQ.isLoading} />
            </div>

            <SectionCard title="Przeciętne zatrudnienie w przedsiębiorstwach" subtitle="GUS · mln etatów"
                actions={<CsvExport filename="zatrudnienie" headers={['Miesiąc', 'Etaty']} rows={zatr.map((p) => [p.date, p.value])} />}>
                {zatrQ.isLoading ? <div className="mk-skeleton h-[300px] w-full" /> : (
                    <InteractiveChart data={zatr} xKey="date" height={300} unit=" mln" showRange initialRange="ALL"
                        valueFormatter={(v) => formatDecimalPL(v / 1e6, 2)} xTickFormatter={monthTick}
                        series={[{ key: 'value', name: 'Zatrudnienie', color: '#2563EB', type: 'area' }]} />
                )}
            </SectionCard>
            <div className="rounded-xl bg-mk-surface-alt p-4 text-sm text-mk-text-soft">
                Przeciętne zatrudnienie w sektorze przedsiębiorstw (miesięcznie). Bezrobocie rejestrowane (stopa i mapa) w zakładce „Bezrobocie i płace".
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
    useInitialTab(TABS.map((t) => t.value), setTab);
    return (
        <div className="mk-fade-in space-y-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-mk-text">Rynek pracy</h1>
                    <p className="mt-1 text-sm text-mk-muted">Bezrobocie, zatrudnienie, wynagrodzenia i aktywność zawodowa</p>
                </div>
                <Segmented value={tab} onChange={setTab} options={TABS} aria-label="Sekcja rynku pracy" />
            </div>

            <div key={tab} className="mk-fade-in">
                {tab === 'bezrobocie' && <RynekPracySection />}
                {tab === 'zatrudnienie' && <ZatrudnienieSection />}
                {tab === 'bael' && <BaelSection />}
            </div>

            <RelatedNews topic="praca" />
        </div>
    );
}
