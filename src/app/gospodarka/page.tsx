'use client';

import { useState } from 'react';
import { Segmented } from '@/components/ui/Segmented';
import { SoonNote } from '@/components/ui/SoonNote';
import { AktywnoscSection } from '@/components/sections/macro-sections';

type Tab = 'aktywnosc' | 'koniunktura';
const TABS: { value: Tab; label: string }[] = [
    { value: 'aktywnosc', label: 'PKB i aktywność' },
    { value: 'koniunktura', label: 'Koniunktura' },
];

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
            {tab === 'koniunktura' && <SoonNote title="Koniunktura gospodarcza (badanie GUS)" note="Wskaźnik ogólnego klimatu koniunktury: przemysł, budownictwo, handel, usługi — darmowy odpowiednik PMI. Podpinany z GUS." />}
        </div>
    );
}
