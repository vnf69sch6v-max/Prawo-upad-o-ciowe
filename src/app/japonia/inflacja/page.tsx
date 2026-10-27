import type { Metadata } from 'next';
import { JpCgpi } from '@/components/jp/JpCgpi';
import { JpInflation } from '@/components/jp/JpInflation';
import { PageHeader } from '@/components/ui/PageHeader';
import { peekJpCgpi } from '@/lib/jp/cgpi-server';
import { jpCpiSummary } from '@/lib/jp/cpi';
import { peekJpCpi } from '@/lib/jp/cpi-server';
import { peekJpContributions } from '@/lib/jp/contributions-server';
import { SITE_URL } from '@/lib/internal-fetch';

// ISR: HTML z liczbami odświeżany co 30 min z ostatniego wpisu cache (Firestore). Strona NIE woła źródła —
// to robi trasa /api/jp/cpi i crony (fetch w renderze trafiałby do Data Cache Next.js).
export const revalidate = 1800;

export async function generateMetadata(): Promise<Metadata> {
    const summary = jpCpiSummary(await peekJpCpi().catch(() => null));
    return {
        title: 'Inflacja w Japonii — CPI, cel BOJ 2% | Savori',
        description: summary
            ? `Inflacja CPI w Japonii: ${summary}. CPI ogółem, bazowa, Tokio i ceny producenta.`
            : 'Inflacja CPI w Japonii: ogółem, bazowa, Tokio i ceny producenta.',
        alternates: { canonical: `${SITE_URL}/japonia/inflacja` },
    };
}

export default async function JaponiaInflacjaPage() {
    const [initial, contributions, cgpi] = await Promise.all([
        peekJpCpi().catch(() => null),
        peekJpContributions().catch(() => null),
        peekJpCgpi().catch(() => null),
    ]);
    return (
        <div className="mk-fade-in space-y-5">
            <PageHeader title="Japonia · Inflacja" />
            <JpInflation initial={initial} contributions={contributions} />
            <JpCgpi initial={cgpi} />
        </div>
    );
}
