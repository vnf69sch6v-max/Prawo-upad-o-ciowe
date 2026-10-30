'use client';

import Link from 'next/link';
import { ArrowRight, ArrowUpRight, Layers } from 'lucide-react';
import { useDailyDigest } from '@/lib/hooks';
import { corroborationLabel } from '@/lib/news/daily';
import { formatDate } from '@/lib/formatters';
import type { NewsTopic } from '@/lib/news/match';
import { SectionCard } from '@/components/ui/SectionCard';
import { SummaryBody } from '@/components/ui/DigestSummaryCard';
import { sectionLabel } from '@/components/ui/RelatedNews';
import { KpiTiles } from '@/components/ui/KpiTiles';

const TOPIC_LABELS: Record<NewsTopic, string> = {
    ceny: 'Ceny',
    gospodarka: 'Gospodarka',
    praca: 'Praca',
    rynki: 'Rynki',
};

/** Tagi neutralne — czerwień w tej karcie czytała się jak błąd (zrzut właściciela 30.10). */
const NEUTRAL_TAG = 'rounded border border-mk-border px-1.5 py-px text-[10px] font-semibold uppercase tracking-wide text-mk-muted';

function Tags({ topics, section }: { topics: NewsTopic[]; section: string }) {
    const labels = [...new Set([...topics.map((t) => TOPIC_LABELS[t]), sectionLabel(section)])];
    return <>{labels.map((l) => <span key={l} className={NEUTRAL_TAG}>{l}</span>)}</>;
}

/** „N niezależne relacje” — dyskretnie, bez zielonej pigułki; `corroborationLabel` zwraca null przy N < 2. */
function Corroboration({ n }: { n: number }) {
    const label = corroborationLabel(n);
    if (!label) return null;
    return (
        <span className="inline-flex shrink-0 items-center gap-1 whitespace-nowrap">
            <Layers size={11} aria-hidden /> {label}
        </span>
    );
}

/** Karta na Przeglądzie — skrót digestu. Pusty dzień → null (jak RelatedNews). */
export function DailyDigestCard({
    preview = 3,
    className = '',
}: {
    preview?: number;
    className?: string;
}) {
    const { data: digest, isLoading, isError } = useDailyDigest();

    if (isLoading) {
        return (
            <SectionCard editorial titleVariant="label" title="Podsumowanie dnia" className={className}>
                <div className="space-y-3">
                    {Array.from({ length: 3 }, (_, i) => (
                        <div key={i} className="flex gap-3">
                            <div className="mk-skeleton mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full" />
                            <div className="min-w-0 flex-1 space-y-2">
                                <div className="mk-skeleton h-4 w-full rounded" />
                                <div className="mk-skeleton h-3 w-2/3 rounded" />
                            </div>
                        </div>
                    ))}
                </div>
            </SectionCard>
        );
    }

    if (isError || !digest || digest.punkty.length === 0) return null;

    const shown = digest.punkty.slice(0, preview);
    const title = `Podsumowanie dnia · ${formatDate(digest.date)}`;

    return (
        <SectionCard
            editorial
            titleVariant="label"
            title={title}
            className={className}
            actions={
                <Link
                    href={`/podsumowanie?date=${digest.date}`}
                    className="mk-press -mr-1.5 flex items-center gap-1 rounded px-1.5 py-1 text-sm font-medium text-mk-brand transition-colors hover:bg-mk-brand-soft hover:underline active:bg-mk-brand-soft touch:-my-2.5 touch:min-h-11"
                >
                    Całe podsumowanie <ArrowRight size={14} />
                </Link>
            }
        >
            <KpiTiles items={digest.dane} className="mb-4" />

            {/* Akapit modelu nad punktami. Szablon („Najważniejsze dziś: „<tytuł 1. punktu>””)
                powtarzałby pierwszy punkt listy tuż pod sobą, więc na Przeglądzie go pomijamy. */}
            {digest.podsumowanie?.origin === 'model' && (
                <div className="mb-3 border-b border-mk-border pb-3">
                    <SummaryBody summary={digest.podsumowanie} compact withTiles />
                </div>
            )}

            <ul className="-mx-2 list-none divide-y divide-mk-border">
                {shown.map((p) => (
                    <li key={p.link}>
                        <a
                            href={p.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mk-press-row group flex min-h-11 flex-col justify-center rounded-lg px-2 py-2.5"
                        >
                            <span className="text-sm font-semibold leading-snug text-mk-text transition-colors group-hover:text-mk-brand">
                                {p.title}
                                <ArrowUpRight size={13} className="ml-1 inline-block align-[-1px] text-mk-faint group-hover:text-mk-brand" aria-label="(otwiera się w nowej karcie)" />
                            </span>
                            <span className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-mk-muted">
                                <Tags topics={p.topics} section={p.section} />
                                <span>{p.source}</span>
                                <Corroboration n={p.corroboration} />
                            </span>
                        </a>
                    </li>
                ))}
            </ul>
        </SectionCard>
    );
}
