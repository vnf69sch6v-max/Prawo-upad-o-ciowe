import Link from 'next/link';

export function AppFooter() {
    return (
        <footer className="mt-10 border-t border-mk-border bg-mk-surface">
            <div className="mx-auto flex max-w-[1440px] flex-col items-center justify-between gap-3 px-4 py-5 text-xs text-mk-muted sm:flex-row md:px-6">
                <div>Źródła: GUS · NBP · Eurostat · Stooq · SMUP · SDP</div>
                <div className="flex items-center gap-4">
                    <Link href="/publikacje" className="transition-colors hover:text-mk-primary">Publikacje</Link>
                    <Link href="/ustawienia" className="transition-colors hover:text-mk-primary">Ustawienia</Link>
                    <span className="flex items-center gap-1.5"><span className="live-dot" /> Auto-odświeżanie</span>
                </div>
                <div>© 2026 Makro Data Platform</div>
            </div>
        </footer>
    );
}
