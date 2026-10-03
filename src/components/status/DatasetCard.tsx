import { formatPeriodPl, type FreshnessItem } from '@/lib/freshness';
import { StatusPill } from './StatusPill';

/** Jeden zbiór danych jako wiersz-karta: nazwa + status, najnowszy vs oczekiwany okres, wyjaśnienie. */
export function DatasetCard({ item }: { item: FreshnessItem }) {
    return (
        <li className="flex min-h-12 flex-col gap-2 rounded-xl border border-mk-border bg-mk-surface px-3.5 py-3">
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <h3 className="text-sm font-semibold leading-snug text-mk-text [overflow-wrap:anywhere]">{item.label}</h3>
                    <p className="mt-0.5 text-xs text-mk-muted">{item.source}</p>
                </div>
                <StatusPill status={item.status} />
            </div>

            <dl className="grid grid-cols-2 gap-x-3">
                <div className="min-w-0">
                    <dt className="text-xs text-mk-muted">Najnowsze</dt>
                    <dd className="text-sm font-semibold tabular-nums text-mk-text">{formatPeriodPl(item.latest)}</dd>
                </div>
                <div className="min-w-0">
                    <dt className="text-xs text-mk-muted">Oczekiwane</dt>
                    <dd className="text-sm font-medium tabular-nums text-mk-text-soft">{formatPeriodPl(item.expected)}</dd>
                </div>
            </dl>

            {item.note && item.status !== 'ok' && (
                <p className="border-t border-mk-border pt-2 text-xs leading-relaxed text-mk-text-soft">{item.note}</p>
            )}
        </li>
    );
}

export function DatasetCardSkeleton() {
    return (
        <li className="flex min-h-12 flex-col gap-2 rounded-xl border border-mk-border bg-mk-surface px-3.5 py-3" aria-hidden>
            <div className="flex items-start justify-between gap-3">
                <div className="space-y-1.5">
                    <div className="mk-skeleton h-4 w-36 rounded" />
                    <div className="mk-skeleton h-3 w-20 rounded" />
                </div>
                <div className="mk-skeleton h-5 w-20 rounded-full" />
            </div>
            <div className="grid grid-cols-2 gap-3">
                <div className="mk-skeleton h-8 rounded" />
                <div className="mk-skeleton h-8 rounded" />
            </div>
        </li>
    );
}
