'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

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

const FOCUSABLE = [
    'a[href]',
    'button:not([disabled])',
    'textarea:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
].join(',');

/** Wysuwany panel: na ≥sm z prawej, poniżej sm jako arkusz ~90% z dołu.
 *  Renderowany przez portal do <body>, by `position: fixed` był względny do viewportu.
 *  Zamyka: X (≥44px), klik w tło, Escape, przeciągnięcie w dół na mobile.
 *  Tab krąży wewnątrz otwartego panelu; fokus wraca do otwierającego. */
export function Drawer({ open, onClose, title, subtitle, accent = '#2563EB', width = 480, children }: DrawerProps) {
    const [mounted, setMounted] = useState(false);
    const panelRef = useRef<HTMLElement>(null);
    const openerRef = useRef<HTMLElement | null>(null);
    const onCloseRef = useRef(onClose);
    const dragStartY = useRef<number | null>(null);
    onCloseRef.current = onClose;

    useEffect(() => setMounted(true), []);

    useEffect(() => {
        if (!open) return;
        openerRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        const panel = panelRef.current;
        const focusables = () =>
            [...(panel?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? [])].filter(
                (el) => el.offsetParent !== null || el === document.activeElement,
            );

        const focusId = requestAnimationFrame(() => {
            const list = focusables();
            (list[0] ?? panel)?.focus();
        });

        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                e.preventDefault();
                onCloseRef.current();
                return;
            }
            if (e.key !== 'Tab' || !panel) return;
            const list = focusables();
            if (list.length === 0) {
                e.preventDefault();
                panel.focus();
                return;
            }
            const first = list[0];
            const last = list[list.length - 1];
            const active = document.activeElement;
            if (e.shiftKey) {
                if (active === first || !panel.contains(active)) {
                    e.preventDefault();
                    last.focus();
                }
            } else if (active === last || !panel.contains(active)) {
                e.preventDefault();
                first.focus();
            }
        };

        document.addEventListener('keydown', onKey);
        return () => {
            cancelAnimationFrame(focusId);
            document.removeEventListener('keydown', onKey);
            document.body.style.overflow = prevOverflow;
            openerRef.current?.focus?.();
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
