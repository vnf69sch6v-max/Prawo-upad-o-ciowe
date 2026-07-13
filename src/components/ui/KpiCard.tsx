'use client';

import type { LucideIcon } from 'lucide-react';
import { DeltaChip } from './DeltaChip';
import { AnimatedNumber } from './AnimatedNumber';

export type AccentKey = 'blue' | 'green' | 'amber' | 'violet' | 'rose' | 'cyan' | 'slate';

const ACCENT: Record<AccentKey, { bar: string; iconBg: string; iconFg: string }> = {
    blue: { bar: '#2563EB', iconBg: '#EFF4FF', iconFg: '#2563EB' },
    green: { bar: '#16A34A', iconBg: '#E7F6EC', iconFg: '#16A34A' },
    amber: { bar: '#D97706', iconBg: '#FDF3E7', iconFg: '#D97706' },
    violet: { bar: '#7C3AED', iconBg: '#F1EBFE', iconFg: '#7C3AED' },
    rose: { bar: '#E11D48', iconBg: '#FCE7EC', iconFg: '#E11D48' },
    cyan: { bar: '#0891B2', iconBg: '#E5F6FB', iconFg: '#0891B2' },
    slate: { bar: '#475569', iconBg: '#F1F3F7', iconFg: '#475569' },
};

interface KpiCardProps {
    label: string;
    /** Pre-formatted value string, e.g. "4,2" */
    value: string;
    unit?: string;
    delta?: { value: number; unit?: 'pp' | 'pct' | 'none'; note?: string; invert?: boolean };
    accent?: AccentKey;
    icon?: LucideIcon;
    /** Small line under the value, e.g. "Cel NBP: 2,5%" or "maj 2026" */
    footnote?: string;
    loading?: boolean;
}

export function KpiCard({ label, value, unit, delta, accent = 'blue', icon: Icon, footnote, loading }: KpiCardProps) {
    const a = ACCENT[accent] ?? ACCENT.blue;

    if (loading) {
        return (
            <div className="mk-card overflow-hidden">
                <div style={{ height: 4, background: a.bar, opacity: 0.4 }} />
                <div className="space-y-3 p-5">
                    <div className="mk-skeleton h-3 w-24" />
                    <div className="mk-skeleton h-10 w-32" />
                    <div className="mk-skeleton h-5 w-28" />
                </div>
            </div>
        );
    }

    return (
        <div className="mk-card mk-card-interactive overflow-hidden">
            <div style={{ height: 4, background: a.bar }} />
            <div className="p-5">
                <div className="flex items-start justify-between gap-2">
                    <span className="mk-label pt-1">{label}</span>
                    {Icon && (
                        <span className="flex shrink-0 items-center justify-center rounded-full" style={{ width: 38, height: 38, background: a.iconBg, color: a.iconFg }}>
                            <Icon size={20} strokeWidth={2} />
                        </span>
                    )}
                </div>
                <div className="mt-3 flex items-baseline gap-1">
                    <span className="mk-kpi-value"><AnimatedNumber value={value} /></span>
                    {unit && <span className="text-2xl font-semibold text-mk-muted">{unit}</span>}
                </div>
                {delta && (
                    <div className="mt-2.5">
                        <DeltaChip value={delta.value} unit={delta.unit} note={delta.note} invert={delta.invert} />
                    </div>
                )}
                {footnote && <div className="mt-2 text-xs text-mk-faint">{footnote}</div>}
            </div>
        </div>
    );
}
