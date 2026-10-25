import { PAYMENT_KIND_LABELS, type FreshnessReport, type FreshnessStatus, type PaymentEventKind } from '@/lib/freshness';
import { formatStatusWhen } from './CronRuns';
import { StatusPill } from './StatusPill';

/**
 * Zielona pigułka tylko po udanym księgowaniu albo nieszkodliwej powtórce.
 * Każdy inny wynik (zły podpis, brak sekretu, zły tryb, błąd zapisu, odrzut, oczekiwanie)
 * to ostrzeżenie w stylu `lag` — nie `stale` i nie `error`, więc nie podnosi HTTP 503.
 */
function pillStatus(kind: PaymentEventKind): FreshnessStatus {
    return kind === 'ok' || kind === 'already' ? 'ok' : 'lag';
}

/** Ostatni webhook Stripe. W demo (`null`) i przy pustym dzienniku: „brak zdarzeń”. */
export function PaymentsHealth({ payments }: { payments: FreshnessReport['payments'] }) {
    const last = payments?.last ?? null;
    const lastOk = payments?.lastOk ?? null;
    return (
        <section aria-labelledby="status-payments" className="space-y-2">
            <h2 id="status-payments" className="mk-section-label">Płatności</h2>
            <ul className="grid grid-cols-1 gap-2">
                <li className="flex min-h-12 flex-col gap-2 rounded-xl border border-mk-border bg-mk-surface px-3.5 py-3">
                    <h3 className="text-sm font-semibold leading-snug text-mk-text">Płatności (webhook Stripe)</h3>
                    {last ? (
                        <>
                            <StatusPill status={pillStatus(last.kind)} label={PAYMENT_KIND_LABELS[last.kind]} />
                            <p className="text-xs leading-relaxed text-mk-text-soft">
                                Ostatnie zdarzenie{' '}
                                <time dateTime={last.at} className="font-semibold tabular-nums text-mk-text">{formatStatusWhen(last.at)}</time>
                                <span className="mx-1 text-mk-muted" aria-hidden>·</span>
                                ostatnie zaksięgowanie{' '}
                                {lastOk ? (
                                    <time dateTime={lastOk.at} className="font-semibold tabular-nums text-mk-text">{formatStatusWhen(lastOk.at)}</time>
                                ) : (
                                    <span className="font-semibold text-mk-text">—</span>
                                )}
                            </p>
                        </>
                    ) : (
                        <p className="text-sm text-mk-text-soft">brak zdarzeń</p>
                    )}
                </li>
            </ul>
        </section>
    );
}
