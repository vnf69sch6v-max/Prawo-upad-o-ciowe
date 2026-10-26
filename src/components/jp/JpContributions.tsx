'use client';

import { SectionCard } from '@/components/ui/SectionCard';
import { formatDataPeriod, formatDecimalPL } from '@/lib/formatters';
import {
    contributionSentence, formatContrib, formatYoy,
    type ContribItem, type JpContributions,
} from '@/lib/jp/contributions';

const UP = '#DC2626';
const DOWN = '#16A34A';

function Bar({ item, max }: { item: ContribItem; max: number }) {
    const width = Math.max(2, (Math.abs(item.contribution) / max) * 100);
    const color = item.contribution < 0 ? DOWN : item.contribution > 0 ? UP : '#94A3B8';
    return (
        <li>
            <div className="flex items-baseline justify-between gap-3">
                <span className="min-w-0 text-sm font-semibold text-mk-text">{item.label}</span>
                <span className="shrink-0 whitespace-nowrap text-sm font-bold tabular-nums text-mk-text">{formatContrib(item.contribution)}</span>
            </div>
            <p className="mt-0.5 text-xs text-mk-muted">{formatYoy(item.yoy)} r/r{item.weight != null ? ` · ${formatDecimalPL(item.weight / 100, 1)}% koszyka` : ''}</p>
            <div className="relative mt-1.5 h-2 rounded-full bg-mk-surface-alt" aria-hidden>
                <span className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${width}%`, background: color }} />
            </div>
        </li>
    );
}

/** Oficjalne wkłady (寄与度). Sekcja znika, dopóki nie ma pliku — rozbicie na różnice miar zostaje. */
export function JpContributionsView({ data }: { data: JpContributions | null }) {
    if (!data) return null;
    const max = Math.max(0.2, ...data.groups.map((g) => Math.abs(g.contribution)));
    const groups = [...data.groups].sort((a, b) => b.contribution - a.contribution);
    const spots = [data.fresh, data.energy, data.rice];
    return (
        <SectionCard
            editorial
            titleVariant="label"
            title="Wkłady w inflację"
            subtitle={`${formatDataPeriod(data.period)} · oficjalne wkłady z komunikatu CPI (寄与度), punkty procentowe`}
        >
            <div className="space-y-4">
                <p className="text-[15px] font-bold leading-snug text-mk-text">{contributionSentence(data)}</p>
                <div className="grid grid-cols-2 gap-3">
                    {[data.goods, data.services].map((item) => (
                        <div key={item.id} className="rounded-2xl border border-mk-border px-3.5 py-3">
                            <div className="text-xs font-semibold text-mk-muted">{item.label}</div>
                            <div className="mt-1 text-lg font-extrabold tabular-nums text-mk-text">{formatContrib(item.contribution)}</div>
                            <div className="text-xs text-mk-muted">{formatYoy(item.yoy)} r/r</div>
                        </div>
                    ))}
                </div>
                <ol className="space-y-3" aria-label="Wkłady dziesięciu grup koszyka">
                    {groups.map((item) => <Bar key={item.id} item={item} max={max} />)}
                </ol>
                <ul className="space-y-1.5 border-t border-mk-border pt-3 text-sm">
                    {spots.map((item) => (
                        <li key={item.id} className="flex items-baseline justify-between gap-3">
                            <span className="text-mk-text-soft">{item.label}</span>
                            <span className="shrink-0 tabular-nums font-semibold text-mk-text">{formatContrib(item.contribution)} <span className="font-normal text-mk-muted">({formatYoy(item.yoy)})</span></span>
                        </li>
                    ))}
                </ul>
                <p className="text-xs leading-relaxed text-mk-muted">
                    Świeża żywność, energia i ryż są już wliczone w grupy powyżej — nie dodawaj ich do sumy. Towary i usługi to drugi podział tego samego koszyka.
                    Różnice miar w sekcji „Co napędza inflację” mówią co innego: o ile zmienia się stopa, gdy grupę dołączymy, a nie ile punktów dodaje sama zmiana jej cen.
                </p>
                <footer className="space-y-0.5 border-t border-mk-border pt-2.5 text-[11px] leading-relaxed text-mk-muted">
                    <p>Źródło: Statistics Bureau of Japan, miesięczny raport CPI, tabela 5 (baza 2025), plik e-Stat {data.fileId}. Wkłady bez przeliczeń Savori.</p>
                    <p lang="ja">出典：総務省統計局「消費者物価指数」第5表を基に作成</p>
                </footer>
            </div>
        </SectionCard>
    );
}
