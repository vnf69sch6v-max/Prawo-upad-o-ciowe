'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Check, ChevronDown } from 'lucide-react';
import { COUNTRIES, countryInfo, countryOf } from './country';
import { SHEET_ROW, ShellSheet } from './ShellSheet';

/**
 * Przełącznik kraju (Polska / Japonia).
 *  - od `lg`: dwa przyciski obok logo — jedno kliknięcie;
 *  - poniżej `lg`: przycisk 44 × 44 px z kodem kraju → arkusz od dołu z nazwami i źródłami
 *    (w nagłówku telefonu nie ma miejsca na dwa pełne cele dotyku).
 * Kraj wynika z adresu (`countryOf`), więc link zawsze otwiera ten sam widok.
 */
export function CountrySwitch() {
    const pathname = usePathname();
    const current = countryOf(pathname);
    // Arkusz otwarty tylko na ścieżce, na której go otwarto — przejście (też „wstecz”) zamyka go samo.
    const [openOn, setOpenOn] = useState<string | null>(null);
    const open = openOn === pathname;
    const btnRef = useRef<HTMLButtonElement>(null);

    return (
        <>
            <nav aria-label="Kraj" className="hidden items-center rounded-lg border border-mk-border bg-mk-surface-alt p-0.5 lg:flex">
                {COUNTRIES.map((c) => {
                    const on = c.id === current;
                    return (
                        <Link
                            key={c.id}
                            href={c.home}
                            title={`${c.label} — ${c.hint}`}
                            aria-current={on ? 'page' : undefined}
                            className={`flex h-8 min-w-10 items-center justify-center rounded-md px-2.5 text-xs font-bold tracking-wide transition-colors ${on ? 'bg-mk-surface text-mk-text shadow-sm' : 'text-mk-muted hover:text-mk-text'}`}
                        >
                            <span aria-hidden>{c.code}</span>
                            <span className="sr-only">{c.label}</span>
                        </Link>
                    );
                })}
            </nav>

            <button
                ref={btnRef}
                type="button"
                onClick={() => setOpenOn((on) => (on === pathname ? null : pathname))}
                aria-expanded={open}
                aria-controls="mk-country-sheet"
                aria-label={`Kraj: ${countryInfo(current).label}. Zmień kraj`}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl active:bg-mk-surface-alt lg:hidden"
            >
                <span className="flex items-center gap-0.5 rounded-md border border-mk-border px-1 py-0.5 text-[12px] font-bold leading-4 text-mk-text">
                    {countryInfo(current).code}
                    <ChevronDown size={12} strokeWidth={2.5} className="text-mk-muted" aria-hidden />
                </span>
            </button>

            <ShellSheet id="mk-country-sheet" open={open} onClose={() => setOpenOn(null)} title="Kraj" returnFocusRef={btnRef} className="lg:hidden">
                <ul className="divide-y divide-mk-border overflow-hidden rounded-2xl border border-mk-border bg-mk-surface">
                    {COUNTRIES.map((c) => {
                        const on = c.id === current;
                        return (
                            <li key={c.id}>
                                <Link href={c.home} onClick={() => setOpenOn(null)} aria-current={on ? 'page' : undefined} className={SHEET_ROW}>
                                    <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] text-[13px] font-bold ${on ? 'bg-mk-brand text-white' : 'bg-mk-surface-alt text-mk-muted'}`}>
                                        {c.code}
                                    </span>
                                    <span className="min-w-0 flex-1">
                                        <span className={`block truncate text-[15px] leading-5 ${on ? 'font-semibold text-mk-brand' : 'font-medium text-mk-text'}`}>{c.label}</span>
                                        <span className="line-clamp-2 text-xs leading-4 text-mk-faint">{c.hint}</span>
                                    </span>
                                    {on && <Check size={18} className="shrink-0 text-mk-brand" aria-hidden />}
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </ShellSheet>
        </>
    );
}
