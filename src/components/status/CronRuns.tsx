import { AlertTriangle, CheckCircle2, CircleDashed, XCircle, type LucideIcon } from 'lucide-react';
import type { CronRunReport, CronRunStatus } from '@/lib/cron-runs';
import type { FreshnessReport } from '@/lib/freshness';

const STYLE: Record<CronRunStatus, { label: string; icon: LucideIcon; iconClass: string; pillClass: string }> = {
    ok: { label: 'Działa', icon: CheckCircle2, iconClass: 'text-mk-positive', pillClass: 'bg-mk-positive-soft ring-mk-positive/25' },
    failing: { label: 'Błędy', icon: XCircle, iconClass: 'text-mk-negative', pillClass: 'bg-mk-negative-soft ring-mk-negative/25' },
    late: { label: 'Spóźniony', icon: AlertTriangle, iconClass: 'text-mk-negative', pillClass: 'bg-mk-negative-soft ring-mk-negative/25' },
    never: { label: 'Czeka na 1. przebieg', icon: CircleDashed, iconClass: 'text-mk-muted', pillClass: 'bg-mk-surface-alt ring-mk-border' },
};

const TIME = new Intl.DateTimeFormat('pl-PL', { timeZone: 'Europe/Warsaw', hour: '2-digit', minute: '2-digit' });
const DAY = new Intl.DateTimeFormat('pl-PL', { timeZone: 'Europe/Warsaw', day: 'numeric', month: 'short' });
const KEY = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Warsaw', year: 'numeric', month: '2-digit', day: '2-digit' });

/** „dziś 07:02", „wczoraj 15:41", „1 paź 13:00" — czas warszawski. Renderowane tylko po hydratacji. */
function when(iso: string): string {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '—';
    const today = KEY.format(new Date());
    const yesterday = KEY.format(new Date(Date.now() - 86_400_000));
    const key = KEY.format(d);
    const day = key === today ? 'dziś' : key === yesterday ? 'wczoraj' : DAY.format(d);
    return `${day} ${TIME.format(d)}`;
}

function Row({ c }: { c: CronRunReport }) {
    const s = STYLE[c.status];
    const Icon = s.icon;
    return (
        <li className="flex min-h-12 flex-col gap-1.5 rounded-xl border border-mk-border bg-mk-surface px-3.5 py-3">
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <h3 className="text-sm font-semibold leading-snug text-mk-text">{c.label}</h3>
                    <p className="mt-0.5 text-xs text-mk-muted">{c.schedule}</p>
                </div>
                <span className={`inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-semibold text-mk-text ring-1 ring-inset ${s.pillClass}`}>
                    <Icon size={13} className={s.iconClass} aria-hidden />
                    {s.label}
                </span>
            </div>
            {c.run && (
                <p className="text-xs text-mk-text-soft">
                    Ostatnio <span className="font-semibold tabular-nums text-mk-text">{when(c.run.at)}</span>
                    {' · '}
                    <span className="tabular-nums">{c.run.ok}/{c.run.total}</span> źródeł odświeżonych
                    {c.run.failed.length > 0 && c.status !== 'ok' && (
                        <span className="block pt-1 text-mk-muted [overflow-wrap:anywhere]">{c.run.failed.slice(0, 3).join(' · ')}</span>
                    )}
                </p>
            )}
        </li>
    );
}

/** Dowód, że automat działa: kiedy każdy cron odświeżył dane ostatnio i z jakim skutkiem. */
export function CronRuns({ crons }: { crons: FreshnessReport['crons'] }) {
    if (!crons) return null;
    return (
        <section aria-labelledby="status-crons" className="space-y-2">
            <h2 id="status-crons" className="mk-section-label">Automatyczne odświeżanie</h2>
            {!crons.available ? (
                <p className="rounded-xl border border-mk-border bg-mk-surface px-3.5 py-3 text-sm text-mk-text-soft">
                    Historia przebiegów jest zapisywana w bazie serwisu — w tym środowisku (bez Firestore) jej nie ma.
                </p>
            ) : (
                <ul className="grid grid-cols-1 gap-2 md:grid-cols-2">
                    {crons.items.map((c) => <Row key={c.group} c={c} />)}
                </ul>
            )}
        </section>
    );
}
