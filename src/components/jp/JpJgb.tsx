'use client';

import { useMemo } from 'react';
import { SectionCard } from '@/components/ui/SectionCard';
import { InteractiveChart } from '@/components/ui/InteractiveChart';
import { formatDecimalPL } from '@/lib/formatters';
import { JGB_TENORS, jgbSentence, type JgbPayload } from '@/lib/jp/jgb';
import { useJpJgb } from '@/lib/jp/use-jp-jgb';

const dayLabel = (iso: string) => new Date(`${iso}T12:00:00Z`).toLocaleDateString('pl-PL', {
    day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC',
});
const tick = (iso: string) => { const [y, m] = iso.split('-'); return `${m}.${y.slice(2)}`; };

export function JpJgb({ initial }: { initial: JgbPayload | null }) {
    const { data } = useJpJgb(initial);
    const rows = useMemo(() => (data?.history ?? []).map((p) => ({ date: p.date, y10: p.y10 })), [data]);
    if (!data) return null;
    const y10 = data.latest.yields['10'];
    return (
        <SectionCard
            editorial
            titleVariant="label"
            title="Obligacje Japonii"
            subtitle={y10 != null ? `${dayLabel(data.latest.date)} · rentowność JGB, %` : 'rentowność JGB'}
        >
            <div className="space-y-4">
                <p className="text-[15px] font-bold leading-snug text-mk-text">{jgbSentence(data)}</p>
                <ul className="grid grid-cols-2 gap-2 sm:grid-cols-4" aria-label="Krzywa rentowności">
                    {JGB_TENORS.map((tenor) => {
                        const value = data.latest.yields[tenor];
                        if (value == null) return null;
                        return (
                            <li key={tenor} className="rounded-2xl border border-mk-border px-3 py-2.5">
                                <div className="text-xs font-semibold text-mk-muted">{tenor} lat</div>
                                <div className="mt-0.5 text-lg font-extrabold tabular-nums text-mk-text">{formatDecimalPL(value, 3)}%</div>
                            </li>
                        );
                    })}
                </ul>
                <InteractiveChart
                    data={rows} xKey="date" height={260} unit="%" showRange initialRange="5L" ranges={['1R', '3L', '5L']} legend
                    valueFormatter={(v) => formatDecimalPL(v, 3)} xTickFormatter={tick}
                    series={[{ key: 'y10', name: 'JGB 10Y', color: '#0F766E', type: 'line', strokeWidth: 2 }]}
                />
                <footer className="border-t border-mk-border pt-2.5 text-[11px] leading-relaxed text-mk-muted">
                    Źródło: Ministerstwo Finansów Japonii, rentowność obligacji JGB (fixing). Bez przeliczeń Savori.
                </footer>
            </div>
        </SectionCard>
    );
}
