import Link from 'next/link';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import type { MacroChange } from '@/lib/news/daily';
import { ddmm, normalizeBriefText } from '@/lib/news/brief-text';

/**
 * Rząd kafelków „co się zmieniło w liczbach” — zamiast „W liczbach: …” w akapicie.
 * Kierunek niesie znak i strzałka; kolor jest tylko dodatkiem (WCAG 1.4.1).
 * `normalizeBriefText` łata digesty sprzed 31.10.2026, które mają „-0.56%” z kropką.
 */
export function KpiTiles({ items, className = '' }: { items: MacroChange[]; className?: string }) {
    if (items.length === 0) return null;
    return (
        <ul className={`grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6 ${className}`}>
            {items.map((m) => {
                const delta = m.delta && m.delta !== '—' ? normalizeBriefText(m.delta) : null;
                const up = delta?.startsWith('+');
                const down = delta?.startsWith('−');
                const body = (
                    <>
                        <div className="truncate text-[11px] font-medium text-mk-muted">{m.label}</div>
                        <div className="mt-0.5 text-lg font-semibold tabular-nums leading-tight text-mk-text">
                            {m.value}
                            {m.unit === 'pkt' && <span className="ml-0.5 text-xs font-normal text-mk-muted">pkt</span>}
                        </div>
                        {delta && (
                            <div className={`mt-0.5 inline-flex items-center gap-0.5 text-xs font-medium tabular-nums ${up ? 'text-mk-positive' : down ? 'text-mk-negative' : 'text-mk-muted'}`}>
                                {up && <ArrowUpRight size={12} aria-hidden />}
                                {down && <ArrowDownRight size={12} aria-hidden />}
                                {delta}
                            </div>
                        )}
                        <div className="mt-1 text-[11px] text-mk-faint">
                            {ddmm(m.readingDate)}{m.source ? ` · ${m.source}` : ''}
                        </div>
                    </>
                );
                const cls = 'block h-full rounded-lg border border-transparent bg-mk-surface-alt px-3 py-2';
                return (
                    <li key={m.id}>
                        {m.href ? (
                            <Link href={m.href} className={`mk-press ${cls} transition-colors hover:border-mk-border-strong`}>{body}</Link>
                        ) : (
                            <div className={cls}>{body}</div>
                        )}
                    </li>
                );
            })}
        </ul>
    );
}
