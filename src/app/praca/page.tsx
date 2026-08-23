'use client';

import { PageHeader } from '@/components/ui/PageHeader';
import { PracaDashboard } from '@/components/sections/PracaDashboard';

export default function RynekPracyPage() {
    return (
        <div className="space-y-5">
            <PageHeader title="Rynek pracy" />
            <PracaDashboard />
        </div>
    );
}
