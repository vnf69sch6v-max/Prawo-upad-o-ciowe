'use client';

import { PageHeader } from '@/components/ui/PageHeader';
import { RegionyDashboard } from '@/components/sections/RegionyDashboard';

export default function RegionyPage() {
    return (
        <div className="space-y-5">
            <PageHeader title="Regiony" />
            <RegionyDashboard />
        </div>
    );
}
