'use client';

import { useEffect, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { formatDataPeriod } from '@/lib/formatters';

/** Months between a data period (YYYY-MM / YYYY-Qn / YYYY-MM-DD / YYYY) and now. */
function monthsAgo(dateStr: string): number | null {
    const m = dateStr.match(/^(\d{4})(?:-(?:Q(\d)|(\d{2}))(?:-(\d{2}))?)?$/);
    if (!m) return null;
    const year = +m[1];
    let month = 1;
    if (m[2]) month = +m[2] * 3 - 2; // quarter → first month
    else if (m[3]) month = +m[3];
    const d = new Date(year, month - 1, 1);
    const now = new Date();
    return (now.getFullYear() - d.getFullYear()) * 12 + (now.getMonth() - d.getMonth());
}

/** Amber "nieaktualne" pill shown only when the data period is older than the threshold. */
export function StaleBadge({ date, warnAfterMonths = 2, label = 'dane' }: { date?: string | null; warnAfterMonths?: number; label?: string }) {
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);
    if (!mounted || !date) return null;

    const ago = monthsAgo(date);
    if (ago == null || ago < warnAfterMonths) return null;

    return (
        <span className="inline-flex items-center gap-1 rounded-full bg-mk-warn-soft px-2 py-0.5 text-[11px] font-semibold text-mk-warn">
            <AlertTriangle size={12} /> nieaktualne · {label} {formatDataPeriod(date)}
        </span>
    );
}
