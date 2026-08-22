'use client';

import type React from 'react';
import { formatDecimalPL } from '@/lib/formatters';

export interface EditorialHeroRow {
    label: string;
    value: string;
    divider?: boolean;
}

export interface EditorialHeroProps {
    period?: string | null;
    source?: string;
    headline: string;
    description?: React.ReactNode;
    value: string; // pre-formatted big number
    unit?: string;
    delta?: number | null; // renders chip if not null
    deltaUnit?: string; // default 'p.p.'
    valueCaption?: string;
    panelTitle?: string;
    gauge?: { pct: number; labels: [string, string, string] } | null;
    rows?: EditorialHeroRow[];
    ariaLabel?: string;
}

/**
 * Redakcyjny czerwony hero (styl makiety v3) — prezentacyjny, wyłącznie realne dane
 * (przekazywane już sformatowane; brak = „—"). Wspólny wzorzec dla sekcji Ceny oraz
 * głównych zakładek (Gospodarka, Praca, Rynki, Regiony).
 */
export function EditorialHero({
    period,
    source,
    headline,
    description,
    value,
    unit,
    delta,
    deltaUnit = 'p.p.',
    valueCaption,
    panelTitle,
    gauge,
    rows,
    ariaLabel,
}: EditorialHeroProps) {
    const showPanel = !!panelTitle || (rows != null && rows.length > 0) || gauge != null;

    return (
        <section className="overflow-hidden rounded-[14px] bg-mk-brand p-6 text-white" aria-label={ariaLabel}>
            <div className="grid gap-6 md:grid-cols-[1.6fr_1fr]">
                <div>
                    <div className="flex flex-wrap items-center gap-2">
                        {period && <span className="inline-flex items-center rounded-full bg-white px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-mk-brand-strong tnum">{period}</span>}
                        {source && <span className="text-xs font-semibold text-white/70">{source}</span>}
                    </div>
                    <h2 className="mt-3.5 max-w-[26ch] text-[26px] font-extrabold leading-tight tracking-tight">{headline}</h2>
                    {description && <p className="mt-2 max-w-[56ch] text-[15px] leading-relaxed text-white/90">{description}</p>}
                    <div className="mt-5 flex items-baseline gap-4">
                        <span className="text-[56px] font-extrabold leading-none tracking-tight tnum">{value}{unit && <span className="ml-1 text-2xl font-semibold text-white/70">{unit}</span>}</span>
                        {delta != null && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-[13px] font-bold text-mk-brand-strong tnum">
                                {delta > 0 ? '↑ +' : delta < 0 ? '↓ ' : '→ '}{formatDecimalPL(delta, 1)} {deltaUnit}
                            </span>
                        )}
                    </div>
                    {valueCaption && <div className="mt-2 text-xs font-semibold text-white/70">{valueCaption}</div>}
                </div>
                {showPanel && (
                    <div className="md:border-l md:border-white/25 md:pl-6">
                        {panelTitle && <div className="text-[11px] font-bold uppercase tracking-wide text-white/70">{panelTitle}</div>}
                        {gauge && (
                            <>
                                <div className="relative mt-4 h-[34px]">
                                    <div className="absolute inset-x-0 top-[14px] h-1.5 rounded-full bg-white/25" />
                                    <div className="absolute bottom-1 left-1/2 top-1 w-0.5 bg-white/80" />
                                    <div className="absolute top-2 h-[18px] w-[18px] -translate-x-1/2 rounded-full bg-white shadow" style={{ left: `${gauge.pct}%` }} aria-hidden />
                                </div>
                                <div className="flex justify-between text-[11px] font-semibold text-white/70 tnum"><span>{gauge.labels[0]}</span><span>{gauge.labels[1]}</span><span>{gauge.labels[2]}</span></div>
                            </>
                        )}
                        {rows != null && rows.length > 0 && (
                            <div className="mt-4 space-y-2 text-[13px] tnum">
                                {rows.map((r, i) => (
                                    <div key={i} className={`flex justify-between gap-2${r.divider ? ' border-t border-white/25 pt-2' : ''}`}>
                                        <span className="truncate text-white/80">{r.label}</span>
                                        <strong>{r.value}</strong>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </section>
    );
}
