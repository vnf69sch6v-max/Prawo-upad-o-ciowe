'use client';

import { useState } from 'react';
import { Segmented } from '@/components/ui/Segmented';
import { SoonNote } from '@/components/ui/SoonNote';
import { InflacjaSection } from '@/components/sections/macro-sections';

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
    return (
        <div className="mk-fade-in space-y-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-mk-text">Ceny</h1>
                    <p className="mt-1 text-sm text-mk-muted">Inflacja konsumencka, ceny producenta, nieruchomości, budownictwo i rolnictwo</p>
                </div>
                <Segmented value={tab} onChange={setTab} options={TABS} aria-label="Sekcja cen" />
            </div>

            {tab === 'inflacja' && <InflacjaSection />}
            {tab === 'ppi' && <SoonNote title="PPI — ceny produkcji sprzedanej przemysłu" note="Podpinane z GUS (ceny producenta, miesięcznie)." />}
            {tab === 'nieruchomosci' && <SoonNote title="Ceny nieruchomości mieszkaniowych" note="Rynek pierwotny i wtórny — podpinane z GUS." />}
            {tab === 'budowlane' && <SoonNote title="Ceny robót budowlano-montażowych" />}
            {tab === 'rolne' && <SoonNote title="Ceny skupu produktów rolnych" />}
        </div>
    );
}
