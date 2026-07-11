'use client';

import { useState } from 'react';
import { Segmented } from '@/components/ui/Segmented';
import { SoonNote } from '@/components/ui/SoonNote';
import { RynekPracySection } from '@/components/sections/macro-sections';

type Tab = 'bezrobocie' | 'zatrudnienie' | 'bael';
const TABS: { value: Tab; label: string }[] = [
    { value: 'bezrobocie', label: 'Bezrobocie i płace' },
    { value: 'zatrudnienie', label: 'Zatrudnienie i wakaty' },
    { value: 'bael', label: 'BAEL' },
];

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
            {tab === 'zatrudnienie' && <SoonNote title="Zatrudnienie i wolne miejsca pracy" note="Przeciętne zatrudnienie w sektorze przedsiębiorstw + wakaty — podpinane z GUS." />}
            {tab === 'bael' && <SoonNote title="BAEL — aktywność zawodowa" note="Współczynnik aktywności zawodowej i wskaźnik zatrudnienia (kwartalnie)." />}
        </div>
    );
}
