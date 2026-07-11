export function AppFooter() {
    return (
        <footer className="mt-10 border-t border-mk-border bg-mk-surface">
            <div className="mx-auto flex max-w-[1440px] flex-col items-center justify-between gap-2 px-4 py-5 text-xs text-mk-muted sm:flex-row md:px-6">
                <div>Źródła: GUS · NBP · Eurostat · Stooq · SMUP · SDP</div>
                <div className="flex items-center gap-2">
                    <span className="live-dot" /> Dane odświeżane automatycznie
                </div>
                <div>© 2026 Makro Data Platform · dane szacunkowe</div>
            </div>
        </footer>
    );
}
