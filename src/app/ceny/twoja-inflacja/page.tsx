import { Suspense } from 'react';
import type { Metadata } from 'next';
import { PageHeader } from '@/components/ui/PageHeader';
import { TwojaInflacja } from '@/components/sections/TwojaInflacja';
import { SITE_URL } from '@/lib/internal-fetch';

export const metadata: Metadata = {
    title: 'Twoja inflacja — kalkulator na wagach koszyka GUS | Savori',
    description: 'Ustaw udziały wydatków w 13 działach koszyka CPI i porównaj swoją inflację z oficjalnym CPI GUS. Wkład każdego działu w punktach procentowych.',
    alternates: { canonical: `${SITE_URL}/ceny/twoja-inflacja` },
};

// Koszyk z adresu (`?w=`) czyta `useSearchParams` — w prerenderze to granica Suspense (bez #418).
export default function TwojaInflacjaPage() {
    return (
        <div className="mk-fade-in space-y-5">
            <PageHeader title="Twoja inflacja" />
            <Suspense fallback={<div className="mk-skeleton h-[480px] w-full rounded-xl" role="status" aria-busy="true" aria-label="Ładowanie kalkulatora" />}>
                <TwojaInflacja />
            </Suspense>
        </div>
    );
}
