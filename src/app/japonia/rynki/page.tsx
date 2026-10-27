import type { Metadata } from 'next';
import { JpMarkets } from '@/components/jp/JpMarkets';
import { PageHeader } from '@/components/ui/PageHeader';
import { lastBojPoint } from '@/lib/jp/boj';
import { peekBojMarkets } from '@/lib/jp/boj-server';
import { formatDecimalPL } from '@/lib/formatters';
import { SITE_URL } from '@/lib/internal-fetch';

export const revalidate = 1800;

export async function generateMetadata(): Promise<Metadata> {
    const data = await peekBojMarkets().catch(() => null);
    const fx = lastBojPoint(data?.series.usdjpy);
    const policy = lastBojPoint(data?.series.policy);
    const description = fx && policy
        ? `Dolar kosztuje ${formatDecimalPL(fx.value, 2)} jena, stopa BOJ wynosi ${formatDecimalPL(policy.value, 2)}%. Kurs 17:00 Tokio i call overnight — Bank Japonii.`
        : 'Kurs USD/JPY o 17:00 czasu tokijskiego, stopa BOJ i niezabezpieczony call overnight — Bank Japonii.';
    return {
        title: 'Rynki Japonii — jen, stopa BOJ | Savori',
        description,
        alternates: { canonical: `${SITE_URL}/japonia/rynki` },
    };
}

export default async function JaponiaRynkiPage() {
    const initial = await peekBojMarkets().catch(() => null);
    return (
        <div className="mk-fade-in space-y-5">
            <PageHeader title="Japonia · Rynki" />
            <JpMarkets initial={initial} />
        </div>
    );
}
