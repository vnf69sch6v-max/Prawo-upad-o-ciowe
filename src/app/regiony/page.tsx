'use client';

import { useState } from 'react';
import { Segmented } from '@/components/ui/Segmented';
import { SoonNote } from '@/components/ui/SoonNote';
import { SmupExplorer } from '@/components/sections/smup-explorer';

type Tab = 'samorzad' | 'pkb' | 'demografia';
const TABS: { value: Tab; label: string }[] = [
    { value: 'samorzad', label: 'Samorząd (SMUP)' },
    { value: 'pkb', label: 'PKB regionalne' },
    { value: 'demografia', label: 'Demografia' },
];

export default function RegionyPage() {
    const [tab, setTab] = useState<Tab>('samorzad');
    return (
        <div className="mk-fade-in space-y-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-mk-text">Regiony</h1>
                    <p className="mt-1 text-sm text-mk-muted">Usługi publiczne (SMUP), PKB regionalne i demografia województw</p>
                </div>
                <Segmented value={tab} onChange={setTab} options={TABS} aria-label="Sekcja regionów" />
            </div>

            {tab === 'samorzad' && <SmupExplorer />}
            {tab === 'pkb' && <SoonNote title="PKB regionalne (wg województw)" note="Produkt krajowy brutto per województwo — świetne na mapę Polski. Podpinane z GUS." />}
            {tab === 'demografia' && <SoonNote title="Demografia" note="Ludność, przyrost naturalny i migracje wg województw." />}
        </div>
    );
}
