'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Settings, LogOut, ChevronDown, ChevronRight } from 'lucide-react';
import { useAuth } from '@/lib/auth/use-auth';
import { SHEET_ROW, ShellSheet } from './ShellSheet';

const DESKTOP = '(min-width: 1024px)';

/**
 * Konto użytkownika. Od `lg` — rozwijane menu pod awatarem; poniżej — arkusz od dołu (strefa kciuka,
 * cele ≥ 52 px). Tryb wybierany w chwili otwarcia, więc SSR i hydratacja renderują to samo.
 */
export function UserMenu() {
    const { user, enabled, signOut } = useAuth();
    const [mode, setMode] = useState<null | 'menu' | 'sheet'>(null);
    const ref = useRef<HTMLDivElement>(null);
    const btnRef = useRef<HTMLButtonElement>(null);
    const router = useRouter();
    const close = () => setMode(null);

    // Menu (desktop): klik poza nim i Esc zamykają, fokus wraca do przycisku.
    useEffect(() => {
        if (mode !== 'menu') return;
        const onDown = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setMode(null);
        };
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                e.preventDefault();
                setMode(null);
                btnRef.current?.focus();
            }
        };
        document.addEventListener('mousedown', onDown);
        document.addEventListener('keydown', onKey);
        return () => {
            document.removeEventListener('mousedown', onDown);
            document.removeEventListener('keydown', onKey);
        };
    }, [mode]);

    // Zmiana szerokości przez próg `lg` przy otwartym menu/arkuszu — zamknij zamiast zostawić zły wariant.
    useEffect(() => {
        const mq = window.matchMedia(DESKTOP);
        const onChange = () => setMode(null);
        mq.addEventListener('change', onChange);
        return () => mq.removeEventListener('change', onChange);
    }, []);

    const toggle = () => setMode((m) => (m ? null : window.matchMedia(DESKTOP).matches ? 'menu' : 'sheet'));

    const onSignOut = async () => {
        close();
        await signOut();
        router.push('/login');
    };

    const avatar = (size: number) =>
        user?.photoURL ? (
            <Image src={user.photoURL} alt="" width={size} height={size} className="rounded-full" />
        ) : (
            <span
                className="flex items-center justify-center rounded-full bg-mk-primary-soft font-semibold text-mk-primary"
                style={{ width: size, height: size, fontSize: size >= 40 ? 16 : 13 }}
            >
                {user?.initials ?? 'MD'}
            </span>
        );

    const demoBadge = !enabled && (
        <div className="mt-1.5 inline-block rounded bg-mk-warn-soft px-1.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-mk-warn">tryb demo</div>
    );
    const signOutLabel = enabled ? 'Wyloguj' : 'Ekran logowania';

    return (
        <div className="relative" ref={ref}>
            <button
                ref={btnRef}
                type="button"
                onClick={toggle}
                className="flex h-11 min-w-11 items-center justify-center gap-1.5 rounded-full transition-colors hover:bg-mk-surface-alt active:bg-mk-border lg:h-auto lg:min-h-8 lg:min-w-0 lg:p-0.5 lg:pr-1.5"
                aria-label="Konto użytkownika"
                aria-expanded={mode !== null}
                aria-controls={mode === 'sheet' ? 'mk-account-sheet' : mode === 'menu' ? 'mk-account-menu' : undefined}
            >
                {avatar(34)}
                <ChevronDown size={15} className="hidden text-mk-muted lg:block" aria-hidden />
            </button>

            {mode === 'menu' && (
                <div id="mk-account-menu" className="absolute right-0 z-50 mt-2 w-60 overflow-hidden rounded-xl border border-mk-border bg-mk-surface p-1 shadow-[var(--shadow-mk-lg)]">
                    <div className="border-b border-mk-border px-3 py-2.5">
                        <div className="text-sm font-semibold text-mk-text">{user?.displayName ?? 'Użytkownik'}</div>
                        <div className="truncate text-xs text-mk-muted">{user?.email}</div>
                        {demoBadge}
                    </div>
                    <Link href="/ustawienia" onClick={close} className="flex min-h-9 items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-mk-text-soft transition-colors hover:bg-mk-surface-alt">
                        <Settings size={16} aria-hidden /> Ustawienia
                    </Link>
                    <button type="button" onClick={onSignOut} className="flex min-h-9 w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-mk-text-soft transition-colors hover:bg-mk-surface-alt">
                        <LogOut size={16} aria-hidden /> {signOutLabel}
                    </button>
                </div>
            )}

            <ShellSheet id="mk-account-sheet" open={mode === 'sheet'} onClose={close} title="Konto" returnFocusRef={btnRef} className="lg:hidden">
                <div className="flex items-center gap-3 rounded-2xl border border-mk-border bg-mk-surface p-3.5">
                    {avatar(48)}
                    <div className="min-w-0">
                        <div className="truncate text-[15px] font-semibold text-mk-text">{user?.displayName ?? 'Użytkownik'}</div>
                        <div className="truncate text-sm text-mk-muted">{user?.email}</div>
                        {demoBadge}
                    </div>
                </div>
                <ul className="mt-4 divide-y divide-mk-border overflow-hidden rounded-2xl border border-mk-border bg-mk-surface">
                    <li>
                        <Link href="/ustawienia" onClick={close} className={SHEET_ROW}>
                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-mk-surface-alt text-mk-muted">
                                <Settings size={19} aria-hidden />
                            </span>
                            <span className="min-w-0 flex-1 truncate text-[15px] font-medium text-mk-text">Ustawienia</span>
                            <ChevronRight size={18} className="shrink-0 text-mk-faint" aria-hidden />
                        </Link>
                    </li>
                    <li>
                        <button type="button" onClick={onSignOut} className={SHEET_ROW}>
                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-mk-surface-alt text-mk-muted">
                                <LogOut size={19} aria-hidden />
                            </span>
                            <span className="min-w-0 flex-1 truncate text-[15px] font-medium text-mk-text">{signOutLabel}</span>
                        </button>
                    </li>
                </ul>
            </ShellSheet>
        </div>
    );
}
