'use client';

import { PageHeader, PageEyebrow } from '@/components/ui/PageHeader';
import { RegionyDashboard } from '@/components/sections/RegionyDashboard';

export default function RegionyPage() {
    return (
        <div className="space-y-5">
            <PageHeader
                eyebrow={<PageEyebrow section="Regiony" />}
                title="Regiony"
                subtitle="PKB regionalne i demografia wg województw — GUS BDL"
            />
            <RegionyDashboard />
        </div>
    );
}
