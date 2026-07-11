import { Clock } from 'lucide-react';

/** Placeholder for a sub-tab whose GUS data source is being wired in this phase. */
export function SoonNote({ title, note }: { title: string; note?: string }) {
    return (
        <div className="mk-card mk-card-pad flex flex-col items-center justify-center py-16 text-center">
            <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-mk-surface-alt text-mk-muted">
                <Clock size={24} />
            </span>
            <h3 className="mk-section-title">{title}</h3>
            <p className="mt-2 max-w-md text-sm text-mk-muted">{note ?? 'Dane w przygotowaniu — dołączane z GUS na tym etapie.'}</p>
        </div>
    );
}
