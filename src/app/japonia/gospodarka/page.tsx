import type { Metadata } from 'next';
import { JpIndustry } from '@/components/jp/JpIndustry';
import { PageHeader } from '@/components/ui/PageHeader';
import { industrySentence } from '@/lib/jp/industry';
import { peekJpIndustry } from '@/lib/jp/industry-server';
import { SITE_URL } from '@/lib/internal-fetch';

export const revalidate = 1800;

export async function generateMetadata(): Promise<Metadata> {
    const data = await peekJpIndustry().catch(() => null);
    const sentence = data ? industrySentence(data) : null;
    return {
        title: 'Gospodarka Japonii — produkcja przemysłowa | Savori',
        description: sentence ?? 'Produkcja przemysłowa w Japonii: indeks METI, baza 2020, zmiana wobec poprzedniego miesiąca.',
        alternates: { canonical: `${SITE_URL}/japonia/gospodarka` },
    };
}

export default async function JaponiaGospodarkaPage() {
    const initial = await peekJpIndustry().catch(() => null);
    return (
        <div className="mk-fade-in space-y-5">
            <PageHeader title="Japonia · Gospodarka" />
            <JpIndustry initial={initial} />
        </div>
    );
}
