'use client';

import { formatDecimalPL, formatPP } from '@/lib/formatters';

export interface HeroKpiItem {
    label: string;
    value: string;
    unit?: string;
    /** Zmiana m/m lub r/r — chip jak na Przeglądzie */
    delta?: number | null;
    deltaUnit?: 'pp' | 'pct';
    text?: string;
    footnote?: string;
    loading?: boolean;
}

/** Czerwony pas z trzema głównymi KPI — wzorzec mockupu (Przegląd, sekcje tematyczne). */
export function PageHeroBand({ items }: { items: [HeroKpiItem, HeroKpiItem, HeroKpiItem] }) {
    return (
        <section className="mk-hero-band overflow-hidden" aria-label="Kluczowe wskaźniki">
            <div className="grid grid-cols-1 divide-y divide-white/15 lg:grid-cols-3 lg:divide-x lg:divide-y-0">
                {items.map((item, i) => (
                    <div key={i} className="p-4 sm:p-5">
                        {item.loading ? (
                            <div className="space-y-2">
                                <div className="h-3 w-32 rounded bg-white/20" />
                                <div className="h-9 w-24 rounded bg-white/20" />
                                <div className="h-2.5 w-28 rounded bg-white/15" />
                            </div>
                        ) : (
                            <>
                                <p className="text-[11px] font-semibold uppercase tracking-wide text-white/80">{item.label}</p>
                                <div className="mt-2 flex flex-wrap items-baseline gap-2">
                                    <span className="tnum text-3xl font-extrabold tracking-tight sm:text-4xl">{item.value}</span>
                                    {item.unit && <span className="text-lg font-semibold text-white/90">{item.unit}</span>}
                                    {item.delta != null && (
                                        <span className="mk-hero-chip">
                                            {item.deltaUnit === 'pct'
                                                ? `${item.delta >= 0 ? '+' : ''}${formatDecimalPL(item.delta, 2)}%`
                                                : formatPP(item.delta)}
                                        </span>
                                    )}
                                </div>
                                {item.text && <p className="mk-hero-muted mt-2 max-w-sm text-xs leading-relaxed sm:text-sm">{item.text}</p>}
                                {item.footnote && (
                                    <p className="mk-hero-muted mt-3 text-[11px] font-semibold uppercase tracking-wide">{item.footnote}</p>
                                )}
                            </>
                        )}
                    </div>
                ))}
            </div>
        </section>
    );
}
