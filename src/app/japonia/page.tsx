import type { Metadata } from 'next';
import { JpOverview } from '@/components/jp/JpOverview';
import { PageHeader } from '@/components/ui/PageHeader';
import { formatDecimalPL } from '@/lib/formatters';
import { peekBojMarkets } from '@/lib/jp/boj-server';
import { lastPoint } from '@/lib/jp/cpi';
import { peekJpCpi } from '@/lib/jp/cpi-server';
import { peekJgb } from '@/lib/jp/jgb-server';
import { lastLabourPoint } from '@/lib/jp/labour';
import { peekJpLabour } from '@/lib/jp/labour-server';
import { SITE_URL } from '@/lib/internal-fetch';

export const revalidate = 1800;

export async function generateMetadata(): Promise<Metadata> {
    const [cpi, labour] = await Promise.all([
        peekJpCpi().catch(() => null),
        peekJpLabour().catch(() => null),
    ]);
    const price = lastPoint(cpi?.series.headline);
    const job = lastLabourPoint(labour?.series.sa);
    const bits = [
        price ? `inflacja ${formatDecimalPL(price.value, 1)}%` : null,
        job ? `bezrobocie ${formatDecimalPL(job.value, 1)}%` : null,
    ].filter(Boolean);
    return {
        title: 'Japonia — przegląd | Savori',
        description: bits.length
            ? `Przegląd Japonii: ${bits.join(', ')}. Inflacja, rynek pracy, jen, stopa BOJ i JGB.`
            : 'Przegląd Japonii: inflacja, rynek pracy, jen, stopa BOJ i obligacje.',
        alternates: { canonical: `${SITE_URL}/japonia` },
    };
}

export default async function JaponiaPage() {
    const [cpi, labour, markets, jgb] = await Promise.all([
        peekJpCpi().catch(() => null),
        peekJpLabour().catch(() => null),
        peekBojMarkets().catch(() => null),
        peekJgb().catch(() => null),
    ]);
    return (
        <div className="mk-fade-in space-y-5">
            <PageHeader compact title="Japonia · Przegląd" />
            <JpOverview cpi={cpi} labour={labour} markets={markets} jgb={jgb} />
        </div>
    );
}
