import type { Metadata } from 'next';
import { JpLabour } from '@/components/jp/JpLabour';
import { PageHeader } from '@/components/ui/PageHeader';
import { labourSentence } from '@/lib/jp/labour';
import { peekJpLabour } from '@/lib/jp/labour-server';
import { SITE_URL } from '@/lib/internal-fetch';

export const revalidate = 1800;

export async function generateMetadata(): Promise<Metadata> {
    const data = await peekJpLabour().catch(() => null);
    const sentence = data ? labourSentence(data) : null;
    return {
        title: 'Rynek pracy w Japonii — bezrobocie | Savori',
        description: sentence ?? 'Stopa bezrobocia w Japonii: wyrównana sezonowo i bez korekty. Labour Force Survey, Statistics Bureau of Japan.',
        alternates: { canonical: `${SITE_URL}/japonia/praca` },
    };
}

export default async function JaponiaPracaPage() {
    const initial = await peekJpLabour().catch(() => null);
    return (
        <div className="mk-fade-in space-y-5">
            <PageHeader title="Japonia · Rynek pracy" />
            <JpLabour initial={initial} />
        </div>
    );
}
