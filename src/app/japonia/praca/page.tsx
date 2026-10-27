import type { Metadata } from 'next';
import { JpJobs } from '@/components/jp/JpJobs';
import { JpLabour } from '@/components/jp/JpLabour';
import { JpWages } from '@/components/jp/JpWages';
import { PageHeader } from '@/components/ui/PageHeader';
import { jobsSentence } from '@/lib/jp/jobs';
import { peekJpJobs } from '@/lib/jp/jobs-server';
import { labourSentence } from '@/lib/jp/labour';
import { peekJpLabour } from '@/lib/jp/labour-server';
import { wagesSentence } from '@/lib/jp/wages';
import { peekJpWages } from '@/lib/jp/wages-server';
import { SITE_URL } from '@/lib/internal-fetch';

export const revalidate = 1800;

export async function generateMetadata(): Promise<Metadata> {
    const [labour, jobs, wages] = await Promise.all([
        peekJpLabour().catch(() => null),
        peekJpJobs().catch(() => null),
        peekJpWages().catch(() => null),
    ]);
    const bits = [labour ? labourSentence(labour) : null, jobs ? jobsSentence(jobs) : null, wages ? wagesSentence(wages) : null].filter(Boolean);
    return {
        title: 'Rynek pracy w Japonii — bezrobocie, oferty i płace | Savori',
        description: bits.join(' ') || 'Stopa bezrobocia, oferty w urzędach pracy i płace w Japonii.',
        alternates: { canonical: `${SITE_URL}/japonia/praca` },
    };
}

export default async function JaponiaPracaPage() {
    const [labour, jobs, wages] = await Promise.all([
        peekJpLabour().catch(() => null),
        peekJpJobs().catch(() => null),
        peekJpWages().catch(() => null),
    ]);
    return (
        <div className="mk-fade-in space-y-5">
            <PageHeader title="Japonia · Rynek pracy" />
            <JpLabour initial={labour} />
            <JpJobs initial={jobs} />
            <JpWages initial={wages} />
        </div>
    );
}
