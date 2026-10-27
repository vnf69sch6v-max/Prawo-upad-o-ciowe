import type { Metadata } from 'next';
import { JpIndustry } from '@/components/jp/JpIndustry';
import { JpRetail } from '@/components/jp/JpRetail';
import { PageHeader } from '@/components/ui/PageHeader';
import { industrySentence } from '@/lib/jp/industry';
import { peekJpIndustry } from '@/lib/jp/industry-server';
import { retailSentence } from '@/lib/jp/retail';
import { peekJpRetail } from '@/lib/jp/retail-server';
import { SITE_URL } from '@/lib/internal-fetch';

export const revalidate = 1800;

export async function generateMetadata(): Promise<Metadata> {
    const [industry, retail] = await Promise.all([
        peekJpIndustry().catch(() => null),
        peekJpRetail().catch(() => null),
    ]);
    const bits = [industry ? industrySentence(industry) : null, retail ? retailSentence(retail.points) : null].filter(Boolean);
    return {
        title: 'Gospodarka Japonii — produkcja i sprzedaż | Savori',
        description: bits.join(' ') || 'Produkcja przemysłowa i sprzedaż detaliczna w Japonii. METI.',
        alternates: { canonical: `${SITE_URL}/japonia/gospodarka` },
    };
}

export default async function JaponiaGospodarkaPage() {
    const [industry, retail] = await Promise.all([
        peekJpIndustry().catch(() => null),
        peekJpRetail().catch(() => null),
    ]);
    return (
        <div className="mk-fade-in space-y-5">
            <PageHeader title="Japonia · Gospodarka" />
            <JpIndustry initial={industry} />
            <JpRetail initial={retail} />
        </div>
    );
}
