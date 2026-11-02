import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { EuHicp } from '@/components/eu/EuHicp';
import { PageHeader } from '@/components/ui/PageHeader';
import { euHicpHeadline } from '@/lib/eu/hicp';
import { peekEuHicp } from '@/lib/eu/hicp-server';
import { SITE_URL } from '@/lib/internal-fetch';

// ISR: HTML z liczbami z ostatniego wpisu cache (Firestore). Strona NIE woła Eurostatu — robią to
// trasa /api/eu-hicp i crony `refresh` / `nbp` (fetch w renderze trafiałby do Data Cache Next.js).
export const revalidate = 1800;

export async function generateMetadata(): Promise<Metadata> {
    const data = await peekEuHicp().catch(() => null);
    return {
        title: 'Polska na tle UE — inflacja HICP | Savori',
        description: data
            ? euHicpHeadline(data).headline
            : 'Inflacja HICP w Polsce na tle strefy euro, Niemiec, Czech i Węgier (Eurostat).',
        alternates: { canonical: `${SITE_URL}/ceny/na-tle-ue` },
    };
}

export default async function NaTleUePage() {
    const initial = await peekEuHicp().catch(() => null);
    return (
        <div className="mk-fade-in space-y-5">
            <div className="space-y-1">
                <Link href="/ceny" className="-ml-1 inline-flex min-h-11 items-center gap-1.5 px-1 text-sm font-medium text-mk-muted hover:text-mk-text">
                    <ArrowLeft size={16} aria-hidden /> Ceny
                </Link>
                <PageHeader title="Polska na tle UE · Inflacja HICP" />
            </div>
            <EuHicp initial={initial} />
        </div>
    );
}
