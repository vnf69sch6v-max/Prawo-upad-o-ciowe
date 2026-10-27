import type { Metadata } from 'next';
import { JpLabour } from '@/components/jp/JpLabour';
import { JpWages } from '@/components/jp/JpWages';
import { PageHeader } from '@/components/ui/PageHeader';
import { labourSentence } from '@/lib/jp/labour';
import { peekJpLabour } from '@/lib/jp/labour-server';
import { wagesSentence } from '@/lib/jp/wages';
import { peekJpWages } from '@/lib/jp/wages-server';
import { SITE_URL } from '@/lib/internal-fetch';

export const revalidate = 1800;

export async function generateMetadata(): Promise<Metadata> {
    const [labour, wages] = await Promise.all([
        peekJpLabour().catch(() => null),
        peekJpWages().catch(() => null),
    ]);
    const bits = [labour ? labourSentence(labour) : null, wages ? wagesSentence(wages) : null].filter(Boolean);
    return {
        title: 'Rynek pracy w Japonii — bezrobocie i płace | Savori',
        description: bits.join(' ') || 'Stopa bezrobocia i płace w Japonii. Labour Force Survey i Monthly Labour Survey.',
        alternates: { canonical: `${SITE_URL}/japonia/praca` },
    };
}

export default async function JaponiaPracaPage() {
    const [labour, wages] = await Promise.all([
        peekJpLabour().catch(() => null),
        peekJpWages().catch(() => null),
    ]);
    return (
        <div className="mk-fade-in space-y-5">
            <PageHeader title="Japonia · Rynek pracy" />
            <JpLabour initial={labour} />
            <JpWages initial={wages} />
        </div>
    );
}
