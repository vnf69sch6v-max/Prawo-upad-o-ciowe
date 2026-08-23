'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Settings, LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from '@/lib/auth/use-auth';

export function UserMenu() {
    const { user, enabled, signOut } = useAuth();
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    const router = useRouter();

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    useEffect(() => {
        if (!open) return;
        const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                e.preventDefault();
                setOpen(false);
            }
        };
        document.addEventListener('keydown', onKey);
        return () => {
            document.removeEventListener('keydown', onKey);
            previous?.focus?.();
        };
    }, [open]);

    const onSignOut = async () => {
        await signOut();
        router.push('/login');
    };

    return (
        <div className="relative" ref={ref}>
            <button
                type="button"
                onClick={() => setOpen((o) => !o)}
                className="flex min-h-8 items-center gap-1.5 rounded-full p-0.5 pr-1.5 transition-colors hover:bg-mk-surface-alt"
                aria-label="Menu użytkownika"
                aria-expanded={open}
                aria-haspopup="menu"
            >
                {user?.photoURL ? (
                    <Image src={user.photoURL} alt="" width={34} height={34} className="rounded-full" />
                ) : (
                    <span className="flex h-[34px] w-[34px] items-center justify-center rounded-full bg-mk-primary-soft text-sm font-semibold text-mk-primary">
                        {user?.initials ?? 'MD'}
                    </span>
                )}
                <ChevronDown size={15} className="text-mk-muted" />
            </button>

            {open && (
                <div className="absolute right-0 z-50 mt-2 w-60 overflow-hidden rounded-xl border border-mk-border bg-mk-surface p-1 shadow-[var(--shadow-mk-lg)]">
                    <div className="border-b border-mk-border px-3 py-2.5">
                        <div className="text-sm font-semibold text-mk-text">{user?.displayName ?? 'Użytkownik'}</div>
                        <div className="truncate text-xs text-mk-muted">{user?.email}</div>
                        {!enabled && (
                            <div className="mt-1.5 inline-block rounded bg-mk-warn-soft px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-mk-warn">tryb demo</div>
                        )}
                    </div>
                    <Link href="/ustawienia" onClick={() => setOpen(false)} className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-mk-text-soft transition-colors hover:bg-mk-surface-alt">
                        <Settings size={16} /> Ustawienia
                    </Link>
                    <button onClick={onSignOut} className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-mk-text-soft transition-colors hover:bg-mk-surface-alt">
                        <LogOut size={16} /> {enabled ? 'Wyloguj' : 'Ekran logowania'}
                    </button>
                </div>
            )}
        </div>
    );
}
