import Link from 'next/link';

// Linki: na telefonie cel ≥ 44 px (min-h-11), od `lg` zwarte 28 px jak wcześniej.
const LINK =
    'inline-flex min-h-11 items-center rounded-lg px-2.5 font-medium text-mk-text-soft transition-colors [-webkit-tap-highlight-color:transparent] hover:bg-mk-surface-alt hover:text-mk-primary active:bg-mk-border lg:min-h-0 lg:px-2 lg:py-1.5 lg:font-normal lg:text-mk-muted';

/**
 * Stopka. Dolny padding = `--mk-bottom-chrome` (dolny pasek + safe area poniżej `lg`), więc ostatnia
 * linia strony zawsze kończy się nad paskiem zakładek, a białe tło stopki sięga pod półprzezroczysty pasek.
 */
export function AppFooter() {
    return (
        <footer className="mt-4 border-t border-mk-border bg-mk-surface pb-[var(--mk-bottom-chrome)] pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)] lg:mt-10">
            <div className="mx-auto flex max-w-[1440px] flex-col gap-2 px-4 py-4 text-xs text-mk-muted md:px-6 lg:flex-row lg:items-center lg:justify-between lg:gap-3 lg:py-5">
                <nav aria-label="Stopka" className="-mx-2.5 flex flex-wrap items-center lg:order-2 lg:mx-0 lg:gap-2">
                    <Link href="/publikacje" className={LINK}>Publikacje</Link>
                    <Link href="/status" className={LINK}>Stan danych</Link>
                    <Link href="/ustawienia" className={LINK}>Ustawienia</Link>
                </nav>
                <div className="lg:order-1">Źródła: GUS · NBP · Eurostat · Yahoo Finance · SMUP · SDP</div>
                <div className="flex items-center justify-between gap-3 lg:order-3 lg:gap-4">
                    <span className="flex items-center gap-1.5"><span className="live-dot" /> Auto-odświeżanie</span>
                    <span>© 2026 Savori</span>
                </div>
            </div>
        </footer>
    );
}
