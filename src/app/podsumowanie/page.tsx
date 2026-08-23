'use client';

import { Suspense, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { DailyDigestFull } from '@/components/ui/DailyDigest';
import { PageHeader, PageEyebrow } from '@/components/ui/PageHeader';
import { formatDate } from '@/lib/formatters';
import { warsawDateKey } from '@/lib/news/warsaw-date';

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function PodsumowanieContent() {
    const sp = useSearchParams();
    const raw = sp.get('date');
    const date = useMemo(() => (raw && DATE_RE.test(raw) ? raw : undefined), [raw]);
    const label = date ? formatDate(date) : formatDate(warsawDateKey());

    return (
        <div className="mk-fade-in">
            <PageHeader
                compact
                eyebrow={<PageEyebrow section="Newsy" />}
                title="Podsumowanie dnia"
                subtitle={`Redakcyjny wybór najważniejszych tematów makro · ${label}`}
            />
            <DailyDigestFull date={date} />
        </div>
    );
}

export default function PodsumowaniePage() {
    return (
        <Suspense fallback={<div className="mk-skeleton h-48 w-full rounded-2xl" />}>
            <PodsumowanieContent />
        </Suspense>
    );
}
