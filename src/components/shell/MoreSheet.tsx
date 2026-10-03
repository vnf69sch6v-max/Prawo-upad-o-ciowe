'use client';

import type { RefObject } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight } from 'lucide-react';
import { rememberOpener } from '@/lib/use-focus-trap';
import { isActive } from './TopNav';
import { MORE_GROUPS, type MoreEntry } from './mobile-nav';
import { SHEET_ROW, ShellSheet } from './ShellSheet';

interface MoreSheetProps {
    open: boolean;
    onClose: () => void;
    /** Zakładka „Więcej” — dostaje fokus po zamknięciu i jest „openerem” palety otwartej z arkusza. */
    returnFocusRef: RefObject<HTMLButtonElement | null>;
}

/** Arkusz „Więcej” (< lg): pozostałe sekcje, narzędzia i ustawienia, pogrupowane jak lista w iOS. */
export function MoreSheet({ open, onClose, returnFocusRef }: MoreSheetProps) {
    const pathname = usePathname();

    const openSearch = () => {
        // Kolejność ma znaczenie: fokus na „Więcej” → paleta zapamięta go jako miejsce powrotu; zdarzenie
        // synchronicznie w geście tapnięcia → paleta zdąży otworzyć klawiaturę na iOS.
        const tab = returnFocusRef.current;
        tab?.focus({ preventScroll: true });
        rememberOpener(tab);
        onClose();
        window.dispatchEvent(new Event('mk:palette'));
    };

    const row = (it: MoreEntry) => {
        const Icon = it.icon;
        const current = it.kind === 'link' && isActive(pathname, it.href);
        const body = (
            <>
                <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] ${current ? 'bg-mk-brand text-white' : 'bg-mk-surface-alt text-mk-muted group-active:bg-mk-surface'}`}
                >
                    <Icon size={19} strokeWidth={2} aria-hidden />
                </span>
                <span className="min-w-0 flex-1">
                    <span className={`block truncate text-[15px] leading-5 ${current ? 'font-semibold text-mk-brand' : 'font-medium text-mk-text'}`}>{it.label}</span>
                    {it.hint && <span className="line-clamp-2 text-xs leading-4 text-mk-faint">{it.hint}</span>}
                </span>
                <ChevronRight size={18} className="shrink-0 text-mk-faint" aria-hidden />
            </>
        );
        return (
            <li key={it.label}>
                {it.kind === 'link' ? (
                    <Link href={it.href} onClick={onClose} aria-current={current ? 'page' : undefined} className={SHEET_ROW}>
                        {body}
                    </Link>
                ) : (
                    <button type="button" onClick={openSearch} className={SHEET_ROW}>
                        {body}
                    </button>
                )}
            </li>
        );
    };

    return (
        <ShellSheet id="mk-more-sheet" open={open} onClose={onClose} title="Więcej" returnFocusRef={returnFocusRef} className="lg:hidden">
            <nav aria-label="Więcej sekcji i narzędzi">
                {MORE_GROUPS.map((g) => (
                    <section key={g.title} aria-labelledby={`mk-more-${g.title}`} className="mt-2 first:mt-0">
                        <h3 id={`mk-more-${g.title}`} className="px-1 pb-1.5 pt-2 text-xs font-semibold uppercase tracking-wide text-mk-faint">
                            {g.title}
                        </h3>
                        <ul className="divide-y divide-mk-border overflow-hidden rounded-2xl border border-mk-border bg-mk-surface">
                            {g.items.map(row)}
                        </ul>
                    </section>
                ))}
            </nav>
        </ShellSheet>
    );
}
