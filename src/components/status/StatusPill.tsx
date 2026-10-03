import { AlertTriangle, CheckCircle2, Clock, XCircle, type LucideIcon } from 'lucide-react';
import { STATUS_LABELS, type FreshnessStatus } from '@/lib/freshness';

/** Kolor semantyczny niesie ikona i tło; tekst zostaje ciemny (kolorowy tekst na jasnym tle < 4,5:1). */
export const STATUS_STYLE: Record<FreshnessStatus, { icon: LucideIcon; iconClass: string; pillClass: string; tintClass: string }> = {
    ok: { icon: CheckCircle2, iconClass: 'text-mk-positive', pillClass: 'bg-mk-positive-soft ring-mk-positive/25', tintClass: 'bg-mk-positive-soft' },
    lag: { icon: Clock, iconClass: 'text-mk-warn', pillClass: 'bg-mk-warn-soft ring-mk-warn/30', tintClass: 'bg-mk-warn-soft' },
    stale: { icon: AlertTriangle, iconClass: 'text-mk-negative', pillClass: 'bg-mk-negative-soft ring-mk-negative/25', tintClass: 'bg-mk-negative-soft' },
    error: { icon: XCircle, iconClass: 'text-mk-negative', pillClass: 'bg-mk-negative-soft ring-mk-negative/25', tintClass: 'bg-mk-negative-soft' },
};

export function StatusPill({ status }: { status: FreshnessStatus }) {
    const s = STATUS_STYLE[status];
    const Icon = s.icon;
    return (
        <span
            className={`inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-semibold text-mk-text ring-1 ring-inset ${s.pillClass}`}
        >
            <Icon size={13} className={s.iconClass} aria-hidden />
            {STATUS_LABELS[status]}
        </span>
    );
}
