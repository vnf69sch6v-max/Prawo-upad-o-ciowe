'use client';

import { useState } from 'react';
import { Factory, HardHat, ShoppingCart, Truck, Radio } from 'lucide-react';
import { useKoniunktura } from '@/lib/hooks';
import { formatDecimalPL } from '@/lib/formatters';
import { Segmented } from '@/components/ui/Segmented';
import { KpiCard, type AccentKey } from '@/components/ui/KpiCard';
import { InteractiveChart } from '@/components/ui/InteractiveChart';
import { SectionCard } from '@/components/ui/SectionCard';
import { CsvExport } from '@/components/ui/CsvExport';
import { AktywnoscSection } from '@/components/sections/macro-sections';

type Tab = 'aktywnosc' | 'koniunktura';
const TABS: { value: Tab; label: string }[] = [
    { value: 'aktywnosc', label: 'PKB i aktywność' },
    { value: 'koniunktura', label: 'Koniunktura' },
];

const monthTick = (d: string) => { const [y, m] = d.split('-'); return m ? `${m}.${y.slice(2)}` : d; };
const SECTOR_META: Record<string, { color: string; accent: AccentKey; icon: typeof Factory }> = {
    przetworstwo: { color: '#2563EB', accent: 'blue', icon: Factory },
    budownictwo: { color: '#D97706', accent: 'amber', icon: HardHat },
    handel: { color: '#16A34A', accent: 'green', icon: ShoppingCart },
    transport: { color: '#0891B2', accent: 'cyan', icon: Truck },
    ikt: { color: '#7C3AED', accent: 'violet', icon: Radio },
};

function KoniunkturaSection() {
    const q = useKoniunktura(2025);
    const trend = q.data?.trend ?? [];
    const sectors = q.data?.sectors ?? [];
    const latest = q.data?.latest ?? null;
    const prev = trend.length > 1 ? trend[trend.length - 2] : null;

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
                {sectors.map((s) => {
                    const v = latest?.sectors.find((x) => x.name === s.name)?.value ?? null;
                    const pv = prev?.[s.key];
                    const d = typeof pv === 'number' && v != null ? +(v - pv).toFixed(1) : null;
                    const meta = SECTOR_META[s.key] ?? { color: '#64748B', accent: 'slate' as AccentKey, icon: Factory };
                    return (
                        <KpiCard key={s.key} label={s.name} value={v != null ? `${v > 0 ? '+' : ''}${formatDecimalPL(v, 1)}` : '—'} unit="pkt"
                            accent={v != null && v >= 0 ? 'green' : 'rose'} icon={meta.icon}
                            delta={d != null ? { value: d, unit: 'none' } : undefined}
                            footnote={latest ? `GUS · ${latest.date}` : 'GUS'} loading={q.isLoading} />
                    );
                })}
            </div>

            <SectionCard title="Koniunktura wg sektorów — trend 2025" subtitle="GUS · wskaźnik ogólnego klimatu koniunktury (saldo)"
                actions={<CsvExport filename="koniunktura" headers={['Miesiąc', ...sectors.map((s) => s.name)]} rows={trend.map((t) => [t.date as string, ...sectors.map((s) => t[s.key] as number)])} />}>
                {q.isLoading ? <div className="mk-skeleton h-[340px] w-full" /> : (
                    <InteractiveChart data={trend} xKey="date" height={340} unit=" pkt" legend showRange initialRange="ALL"
                        valueFormatter={(v) => formatDecimalPL(v, 0)} xTickFormatter={monthTick}
                        referenceLines={[{ y: 0, label: '0 = neutralnie', color: '#CBD2DD' }]}
                        series={sectors.map((s) => ({ key: s.key, name: s.name, color: SECTOR_META[s.key]?.color ?? '#64748B', type: 'line' as const }))} />
                )}
            </SectionCard>

            <div className="rounded-xl bg-mk-surface-alt p-4 text-sm text-mk-text-soft">
                <span className="font-semibold text-mk-text">Wskaźnik ogólnego klimatu koniunktury (GUS): </span>
                saldo ocen przedsiębiorców (dodatnie = przewaga optymizmu). Darmowy, terminowy wskaźnik wyprzedzający — odpowiednik PMI, ale z podziałem na sektory.
            </div>
        </div>
    );
}

export default function GospodarkaPage() {
    const [tab, setTab] = useState<Tab>('aktywnosc');
    return (
        <div className="mk-fade-in space-y-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-mk-text">Gospodarka</h1>
                    <p className="mt-1 text-sm text-mk-muted">PKB, produkcja, sprzedaż i koniunktura gospodarcza</p>
                </div>
                <Segmented value={tab} onChange={setTab} options={TABS} aria-label="Sekcja gospodarki" />
            </div>

            {tab === 'aktywnosc' && <AktywnoscSection />}
            {tab === 'koniunktura' && <KoniunkturaSection />}
        </div>
    );
}
