'use client';

import { useState } from 'react';
import { useInitialTab, useTabScrollReset } from '@/lib/use-initial-tab';
import { PageHeader } from '@/components/ui/PageHeader';
import { Segmented } from '@/components/ui/Segmented';
import { RegionyDashboard, type MapView } from '@/components/sections/RegionyDashboard';
import { SmupExplorer } from '@/components/sections/smup-explorer';

type Tab = MapView | 'samorzad';
const TABS: { value: Tab; label: string }[] = [
    { value: 'pkb', label: 'PKB' },
    { value: 'ludnosc', label: 'Demografia' },
    { value: 'samorzad', label: 'Samorząd' },
];

export default function RegionyPage() {
    const [tab, setTab] = useState<Tab>('pkb');
    useInitialTab(['pkb', 'ludnosc', 'samorzad', 'demografia'] as const, (t) => {
        setTab(t === 'demografia' ? 'ludnosc' : t);
    });
    useTabScrollReset(tab);
    return (
        <div className="space-y-5">
            <PageHeader
                title="Regiony"
                actions={<Segmented value={tab} onChange={setTab} options={TABS} aria-label="Sekcja regionów" />}
            />
            <div key={tab} className="mk-tab-panel">
                {tab === 'samorzad' ? <SmupExplorer /> : <RegionyDashboard view={tab} />}
            </div>
        </div>
    );
}
