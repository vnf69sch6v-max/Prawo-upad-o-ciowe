import type { Metadata } from 'next';
import { PageHeader } from '@/components/ui/PageHeader';
import { TwojaInflacja } from '@/components/sections/TwojaInflacja';
import { SITE_URL } from '@/lib/internal-fetch';
import { peekServerCache } from '@/lib/server-cache';
import { latestCompleteMonth, type MonthSnapshot } from '@/lib/twoja-inflacja';
import { formatDataPeriod, formatDecimalPL } from '@/lib/formatters';

// ISR: liczby w HTML z ostatniego wpisu cache `gus-cpi-full` (Firestore, ten sam klucz co /ceny i cron dbw-1).
// Strona NIE woła DBW — fetch w renderze trafiłby do Data Cache Next.js (AGENTS.md). Bez Firestore (demo) → null,
// a dane dociąga przeglądarka przez `useCpiFull()`.
export const revalidate = 1800;

async function cachedSnapshot(): Promise<MonthSnapshot | null> {
    const year = Number(new Intl.DateTimeFormat('en', { timeZone: 'Europe/Warsaw', year: 'numeric' }).format(new Date()));
    for (const y of [year, year - 1]) {
        const snap = latestCompleteMonth(await peekServerCache<Parameters<typeof latestCompleteMonth>[0]>('dbw', `gus_cpi_full_${y}_v5`).catch(() => null));
        if (snap) return snap;
    }
    return null;
}

export async function generateMetadata(): Promise<Metadata> {
    const snap = await cachedSnapshot();
    return {
        title: 'Twoja inflacja — kalkulator na wagach koszyka GUS | Savori',
        description: `Ustaw udziały wydatków w 13 działach koszyka CPI i porównaj swoją inflację z oficjalnym CPI GUS${snap ? ` (${formatDecimalPL(snap.cpi, 1)}% r/r, ${formatDataPeriod(snap.date)})` : ''}. Wkład każdego działu w punktach procentowych.`,
        alternates: { canonical: `${SITE_URL}/ceny/twoja-inflacja` },
    };
}

export default async function TwojaInflacjaPage() {
    const initial = await cachedSnapshot();
    return (
        <div className="mk-fade-in space-y-5">
            <PageHeader title="Twoja inflacja" />
            <TwojaInflacja initial={initial} />
        </div>
    );
}
