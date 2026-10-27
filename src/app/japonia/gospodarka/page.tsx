import type { Metadata } from 'next';
import { JpGdp } from '@/components/jp/JpGdp';
import { JpHousing } from '@/components/jp/JpHousing';
import { JpOrders } from '@/components/jp/JpOrders';
import { JpIndustry } from '@/components/jp/JpIndustry';
import { JpRetail } from '@/components/jp/JpRetail';
import { JpTertiary } from '@/components/jp/JpTertiary';
import { JpTrade } from '@/components/jp/JpTrade';
import { PageHeader } from '@/components/ui/PageHeader';
import { gdpSentence } from '@/lib/jp/gdp';
import { peekJpGdp } from '@/lib/jp/gdp-server';
import { housingSentence } from '@/lib/jp/housing';
import { peekJpHousing } from '@/lib/jp/housing-server';
import { ordersSentence } from '@/lib/jp/orders';
import { peekJpOrders } from '@/lib/jp/orders-server';
import { industrySentence } from '@/lib/jp/industry';
import { peekJpIndustry } from '@/lib/jp/industry-server';
import { tertiarySentence } from '@/lib/jp/tertiary';
import { peekJpTertiary } from '@/lib/jp/tertiary-server';
import { retailSentence } from '@/lib/jp/retail';
import { peekJpRetail } from '@/lib/jp/retail-server';
import { tradeSentence } from '@/lib/jp/trade';
import { peekJpTrade } from '@/lib/jp/trade-server';
import { SITE_URL } from '@/lib/internal-fetch';

export const revalidate = 1800;

export async function generateMetadata(): Promise<Metadata> {
    const [industry, tertiary, retail, gdp, orders, housing, trade] = await Promise.all([
        peekJpIndustry().catch(() => null),
        peekJpTertiary().catch(() => null),
        peekJpRetail().catch(() => null),
        peekJpGdp().catch(() => null),
        peekJpOrders().catch(() => null),
        peekJpHousing().catch(() => null),
        peekJpTrade().catch(() => null),
    ]);
    const bits = [
        industry ? industrySentence(industry) : null,
        tertiary ? tertiarySentence(tertiary) : null,
        retail ? retailSentence(retail.points) : null,
        gdp ? gdpSentence(gdp) : null,
        orders ? ordersSentence(orders) : null,
        housing ? housingSentence(housing) : null,
        trade ? tradeSentence(trade) : null,
    ].filter(Boolean);
    return {
        title: 'Gospodarka Japonii — produkcja, usługi, sprzedaż, PKB | Savori',
        description: bits.join(' ') || 'Produkcja przemysłowa, aktywność usług, sprzedaż detaliczna, PKB i bilans płatniczy Japonii.',
        alternates: { canonical: `${SITE_URL}/japonia/gospodarka` },
    };
}

export default async function JaponiaGospodarkaPage() {
    const [industry, tertiary, retail, gdp, orders, housing, trade] = await Promise.all([
        peekJpIndustry().catch(() => null),
        peekJpTertiary().catch(() => null),
        peekJpRetail().catch(() => null),
        peekJpGdp().catch(() => null),
        peekJpOrders().catch(() => null),
        peekJpHousing().catch(() => null),
        peekJpTrade().catch(() => null),
    ]);
    return (
        <div className="mk-fade-in space-y-5">
            <PageHeader title="Japonia · Gospodarka" />
            <JpIndustry initial={industry} />
            <JpTertiary initial={tertiary} />
            <JpRetail initial={retail} />
            <JpOrders initial={orders} />
            <JpHousing initial={housing} />
            <JpGdp initial={gdp} />
            <JpTrade initial={trade} />
        </div>
    );
}
