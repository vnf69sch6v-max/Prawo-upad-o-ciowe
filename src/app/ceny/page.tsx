'use client';

import { useState } from 'react';
import { useInitialTab } from '@/lib/use-initial-tab';
import { Home, HardHat, Wheat } from 'lucide-react';
import { Segmented } from '@/components/ui/Segmented';
import { InflacjaFull } from '@/components/sections/InflacjaFull';
import { PpiFull } from '@/components/sections/PpiFull';
import { DbwPriceSection } from '@/components/sections/DbwPriceSection';
import { RelatedNews } from '@/components/ui/RelatedNews';

type Tab = 'inflacja' | 'ppi' | 'nieruchomosci' | 'budowlane' | 'rolne';
const TABS: { value: Tab; label: string }[] = [
    { value: 'inflacja', label: 'Inflacja CPI' },
    { value: 'ppi', label: 'PPI' },
    { value: 'nieruchomosci', label: 'Nieruchomości' },
    { value: 'budowlane', label: 'Budowlano-montażowe' },
    { value: 'rolne', label: 'Rolne' },
];

export default function CenyPage() {
    const [tab, setTab] = useState<Tab>('inflacja');
    useInitialTab(TABS.map((t) => t.value), setTab);
    return (
        <div className="mk-fade-in space-y-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-mk-text">Ceny</h1>
                    <p className="mt-1 text-sm text-mk-muted">Inflacja konsumencka, ceny producenta, nieruchomości, budownictwo i rolnictwo</p>
                </div>
                <Segmented value={tab} onChange={setTab} options={TABS} aria-label="Sekcja cen" />
            </div>

            {/* Newsy powiązane — nad danymi, nie na dole strony (zlecenie właściciela). */}
            <RelatedNews topic="ceny" />

            <div key={tab} className="mk-fade-in">
            {tab === 'inflacja' && <InflacjaFull />}
            {tab === 'ppi' && <PpiFull />}
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
        </div>
    );
}
