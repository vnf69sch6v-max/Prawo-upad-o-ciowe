'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { rememberOpener, useFocusTrap } from '@/lib/use-focus-trap';

interface DrawerProps {
    open: boolean;
    onClose: () => void;
    title?: ReactNode;
    subtitle?: string;
    /** Kolor paska akcentu na górze panelu. */
    accent?: string;
    width?: number;
    children: ReactNode;
}

/** Wysuwany panel: na ≥sm z prawej, poniżej sm jako arkusz ~90% z dołu.
 *  Renderowany przez portal do <body>, by `position: fixed` był względny do viewportu.
 *  Zamyka: X (≥44px), klik w tło, Escape, przeciągnięcie w dół na mobile.
 *  Tab krąży wewnątrz otwartego panelu; fokus wraca do otwierającego. */
export function Drawer({ open, onClose, title, subtitle, accent = '#2563EB', width = 480, children }: DrawerProps) {
    const [mounted, setMounted] = useState(false);
    const panelRef = useRef<HTMLElement>(null);
    const closeBtnRef = useRef<HTMLButtonElement>(null);
    const dragStartY = useRef<number | null>(null);

    useEffect(() => setMounted(true), []);
    useFocusTrap(open, panelRef, onClose);

    useEffect(() => {
        if (open) rememberOpener();
    }, [open]);

    useEffect(() => {
        if (!open) return;
        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        const focusId = setTimeout(() => closeBtnRef.current?.focus(), 20);
        return () => {
            clearTimeout(focusId);
            document.body.style.overflow = prevOverflow;
        };
    }, [open]);

    const onHandlePointerDown = (e: React.PointerEvent) => {
        dragStartY.current = e.clientY;
    };
    const onHandlePointerUp = (e: React.PointerEvent) => {
        if (dragStartY.current != null && e.clientY - dragStartY.current > 72) onClose();
        dragStartY.current = null;
    };

    if (!mounted) return null;

    return createPortal(
        <div className={`fixed inset-0 z-[60] ${open ? '' : 'pointer-events-none'}`} aria-hidden={!open}>
            <div
                onClick={onClose}
                className={`absolute inset-0 bg-slate-900/30 backdrop-blur-[1px] transition-opacity duration-300 ${open ? 'opacity-100' : 'opacity-0'}`}
            />
            <div className="absolute inset-0 overflow-hidden">
                <aside
                    ref={panelRef}
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby={title ? 'drawer-title' : undefined}
                    tabIndex={-1}
                    data-drawer-panel=""
                    style={{ ['--drawer-width' as string]: `${width}px` }}
                    className={`pointer-events-auto absolute flex flex-col bg-mk-surface shadow-2xl transition-transform duration-300 ease-out inset-x-0 bottom-0 h-[90%] w-full max-w-none rounded-t-2xl sm:inset-y-0 sm:right-0 sm:left-auto sm:h-auto sm:w-[min(var(--drawer-width),94vw)] sm:max-w-[94vw] sm:rounded-none ${
                        open
                            ? 'translate-y-0 sm:translate-x-0 sm:translate-y-0'
                            : 'translate-y-full sm:translate-x-full sm:translate-y-0'
                    }`}
                >
                    <div
                        className="flex h-11 shrink-0 items-center justify-center sm:hidden"
                        onPointerDown={onHandlePointerDown}
                        onPointerUp={onHandlePointerUp}
                        aria-hidden
                    >
                        <span className="h-1.5 w-10 rounded-full bg-mk-border-strong" />
                    </div>
                    <div className="hidden sm:block" style={{ height: 4, background: accent }} />
                    <header className="flex items-start justify-between gap-3 border-b border-mk-border px-5 py-4">
                        <div className="min-w-0">
                            {title && <h2 id="drawer-title" className="text-lg font-bold leading-tight text-mk-text">{title}</h2>}
                            {subtitle && <p className="mt-0.5 text-sm text-mk-muted">{subtitle}</p>}
                        </div>
                        <button
                            ref={closeBtnRef}
                            type="button"
                            onClick={onClose}
                            aria-label="Zamknij"
                            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-mk-muted transition-colors hover:bg-mk-surface-alt hover:text-mk-text"
                        >
                            <X size={20} />
                        </button>
                    </header>
                    <div className="flex-1 overflow-y-auto px-5 py-5">{children}</div>
                </aside>
            </div>
        </div>,
        document.body,
    );
}
