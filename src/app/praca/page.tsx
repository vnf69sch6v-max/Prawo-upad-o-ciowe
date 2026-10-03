'use client';

import { PageHeader } from '@/components/ui/PageHeader';
import { PracaDashboard, PRACA_SECTIONS } from '@/components/sections/PracaDashboard';
import { MobileAnchorNav } from '@/components/sections/mobile-layout';

export default function RynekPracyPage() {
    return (
        <div className="space-y-5">
            <PageHeader title="Rynek pracy" />
            <MobileAnchorNav items={PRACA_SECTIONS} ariaLabel="Sekcje rynku pracy" />
            <PracaDashboard />
        </div>
    );
}
