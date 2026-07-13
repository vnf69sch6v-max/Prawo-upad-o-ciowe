'use client';

// Pasek auto-insightów (augmented analytics) — chipy z ikoną i kolorem wg tonu/rodzaju.
// Zasilany przez analyzeSeries() z lib/observations. Kompaktowy, do nagłówka sekcji/zakładki.
import { TrendingUp, TrendingDown, Target, Award, Zap, Info, AlertTriangle, Sparkles } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { Observation, Tone, InsightKind } from '@/lib/observations';

const TONE: Record<Tone, { fg: string; bg: string }> = {
    up: { fg: '#15803D', bg: '#F0FDF4' },
    down: { fg: '#B91C1C', bg: '#FEF2F2' },
    warn: { fg: '#B45309', bg: '#FFFBEB' },
    neutral: { fg: '#1D4ED8', bg: '#EFF6FF' },
};

function iconFor(kind: InsightKind | undefined, tone: Tone): LucideIcon {
    if (kind === 'anomaly') return AlertTriangle;
    if (kind === 'target') return Target;
    if (kind === 'record') return Award;
    if (kind === 'accel') return Zap;
    if (kind === 'trend') return tone === 'down' ? TrendingDown : TrendingUp;
    if (tone === 'warn') return AlertTriangle;
    return Info;
}

export function InsightBar({ items, label = 'Auto-analiza' }: { items: Observation[]; label?: string }) {
    if (!items.length) return null;
    return (
        <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-mk-faint">
                <Sparkles size={13} className="text-mk-primary" /> {label}
            </span>
            {items.map((o, i) => {
                const tone = o.tone ?? 'neutral';
                const c = TONE[tone];
                const Icon = iconFor(o.kind, tone);
                return (
                    <span key={i} className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium"
                        style={{ color: c.fg, background: c.bg }}>
                        <Icon size={13} className="shrink-0" />
                        {o.text}
                    </span>
                );
            })}
        </div>
    );
}
