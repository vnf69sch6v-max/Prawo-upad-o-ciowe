import type { Metadata } from 'next';
import { JpInflation } from '@/components/jp/JpInflation';
import { PageHeader } from '@/components/ui/PageHeader';
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
            ? `Inflacja CPI w Japonii: ${summary}. CPI ogółem, bazowa (bez świeżej żywności), bez energii i wstępny odczyt z Tokio — dane Statistics Bureau of Japan.`
            : 'Inflacja CPI w Japonii: ogółem, bazowa (bez świeżej żywności), bez energii i wstępny odczyt z Tokio — dane Statistics Bureau of Japan.',
        alternates: { canonical: `${SITE_URL}/japonia/inflacja` },
    };
}

export default async function JaponiaInflacjaPage() {
    const [initial, contributions] = await Promise.all([
        peekJpCpi().catch(() => null),
        peekJpContributions().catch(() => null),
    ]);
    return (
        <div className="mk-fade-in space-y-5">
            <PageHeader title="Japonia · Inflacja" />
            <JpInflation initial={initial} contributions={contributions} />
        </div>
    );
}
