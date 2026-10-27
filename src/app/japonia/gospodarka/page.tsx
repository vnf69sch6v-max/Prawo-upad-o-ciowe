import type { Metadata } from 'next';
import { JpGdp } from '@/components/jp/JpGdp';
import { JpIndustry } from '@/components/jp/JpIndustry';
import { JpRetail } from '@/components/jp/JpRetail';
import { JpTrade } from '@/components/jp/JpTrade';
import { PageHeader } from '@/components/ui/PageHeader';
import { gdpSentence } from '@/lib/jp/gdp';
import { peekJpGdp } from '@/lib/jp/gdp-server';
import { industrySentence } from '@/lib/jp/industry';
import { peekJpIndustry } from '@/lib/jp/industry-server';
import { retailSentence } from '@/lib/jp/retail';
import { peekJpRetail } from '@/lib/jp/retail-server';
import { tradeSentence } from '@/lib/jp/trade';
import { peekJpTrade } from '@/lib/jp/trade-server';
import { SITE_URL } from '@/lib/internal-fetch';

export const revalidate = 1800;

export async function generateMetadata(): Promise<Metadata> {
    const [industry, retail, gdp, trade] = await Promise.all([
        peekJpIndustry().catch(() => null),
        peekJpRetail().catch(() => null),
        peekJpGdp().catch(() => null),
        peekJpTrade().catch(() => null),
    ]);
    const bits = [
        industry ? industrySentence(industry) : null,
        retail ? retailSentence(retail.points) : null,
        gdp ? gdpSentence(gdp) : null,
        trade ? tradeSentence(trade) : null,
    ].filter(Boolean);
    return {
        title: 'Gospodarka Japonii — produkcja, sprzedaż, PKB, handel | Savori',
        description: bits.join(' ') || 'Produkcja przemysłowa, sprzedaż detaliczna, PKB i bilans płatniczy Japonii.',
        alternates: { canonical: `${SITE_URL}/japonia/gospodarka` },
    };
}

export default async function JaponiaGospodarkaPage() {
    const [industry, retail, gdp, trade] = await Promise.all([
        peekJpIndustry().catch(() => null),
        peekJpRetail().catch(() => null),
        peekJpGdp().catch(() => null),
        peekJpTrade().catch(() => null),
    ]);
    return (
        <div className="mk-fade-in space-y-5">
            <PageHeader title="Japonia · Gospodarka" />
            <JpIndustry initial={industry} />
            <JpRetail initial={retail} />
            <JpGdp initial={gdp} />
            <JpTrade initial={trade} />
        </div>
    );
}
