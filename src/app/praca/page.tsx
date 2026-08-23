'use client';

import { PageHeader, PageEyebrow } from '@/components/ui/PageHeader';
import { PracaDashboard } from '@/components/sections/PracaDashboard';

export default function RynekPracyPage() {
    return (
        <div className="space-y-5">
            <PageHeader
                eyebrow={<PageEyebrow section="Rynek pracy" />}
                title="Rynek pracy"
                subtitle="Płace realne, bezrobocie i mediana — źródła GUS"
            />
            <PracaDashboard />
        </div>
    );
}
