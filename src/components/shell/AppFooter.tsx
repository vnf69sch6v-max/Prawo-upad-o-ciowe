import Link from 'next/link';

export function AppFooter() {
    return (
        <footer className="mt-10 border-t border-mk-border bg-mk-surface">
            <div className="mx-auto flex max-w-[1440px] flex-col items-center justify-between gap-3 px-4 py-5 text-xs text-mk-muted sm:flex-row md:px-6">
                <div>Źródła: GUS · NBP · Eurostat · Stooq · SMUP · SDP</div>
                {/* `py-1.5` daje linkom 28px wysokości — poniżej ~24px cel dotykowy jest zbyt mały
                    (WCAG 2.2 Target Size). Sam tekst 12px dawał 16px. */}
                <div className="flex items-center gap-2">
                    <Link href="/publikacje" className="rounded px-2 py-1.5 transition-colors hover:bg-mk-surface-alt hover:text-mk-primary">Publikacje</Link>
                    <Link href="/ustawienia" className="rounded px-2 py-1.5 transition-colors hover:bg-mk-surface-alt hover:text-mk-primary">Ustawienia</Link>
                    <span className="flex items-center gap-1.5 px-2"><span className="live-dot" /> Auto-odświeżanie</span>
                </div>
                <div>© 2026 Savori</div>
            </div>
        </footer>
    );
}
