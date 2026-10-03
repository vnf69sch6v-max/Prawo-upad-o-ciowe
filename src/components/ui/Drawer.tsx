'use client';

import { useEffect, useId, useRef, useState, type PointerEvent as ReactPointerEvent, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { rememberOpener, useFocusTrap } from '@/lib/use-focus-trap';
import { useIsClient } from '@/lib/use-is-client';

interface DrawerProps {
    open: boolean;
    onClose: () => void;
    title?: ReactNode;
    subtitle?: string;
    /** Kolor paska akcentu na górze panelu (tylko panel boczny ≥ md). */
    accent?: string;
    width?: number;
    children: ReactNode;
}

/** Przeciągnięcie w dół, które zamyka arkusz: dystans albo szybki ruch (px/ms). */
const CLOSE_DISTANCE = 96;
const CLOSE_VELOCITY = 0.6;
const SHEET_MQ = '(max-width: 767px)';

/**
 * Panel szczegółów. Poniżej `md` (telefon) to ARKUSZ Z DOŁU — wzorzec natywny (iOS sheet,
 * Material bottom sheet): uchwyt, wysokość wg treści do 85% ekranu, własne przewijanie
 * (`overscroll-behavior: contain` — przewinięcie listy do końca nie przewija strony pod spodem),
 * odstęp na wskaźnik home (safe area). Od `md` — dotychczasowy panel z prawej.
 *
 * Zamyka: X (44 px), stuknięcie w tło, Escape, przeciągnięcie uchwytu/nagłówka w dół (arkusz jedzie
 * za palcem). Tab krąży wewnątrz panelu; fokus wraca do elementu, który go otworzył.
 * Renderowany przez portal do <body>, by `position: fixed` był względny do viewportu; zamknięty
 * panel jest `inert` (nie łapie fokusu ani czytnika ekranu).
 */
export function Drawer({ open, onClose, title, subtitle, accent = '#2563EB', width = 480, children }: DrawerProps) {
    const isClient = useIsClient();
    const titleId = useId();
    const panelRef = useRef<HTMLElement>(null);
    const closeBtnRef = useRef<HTMLButtonElement>(null);
    const drag = useRef<{ y: number; t: number } | null>(null);
    const [dragY, setDragY] = useState(0);

    useFocusTrap(open, panelRef, onClose);

    useEffect(() => {
        if (open) rememberOpener();
    }, [open]);

    useEffect(() => {
        if (!open) return;
        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        const focusId = setTimeout(() => closeBtnRef.current?.focus({ preventScroll: true }), 20);
        return () => {
            clearTimeout(focusId);
            document.body.style.overflow = prevOverflow;
        };
    }, [open]);

    // Przeciąganie arkusza — tylko w trybie arkusza (telefon); przycisk X nie zaczyna przeciągania.
    const onDragStart = (e: ReactPointerEvent<HTMLElement>) => {
        if (!window.matchMedia(SHEET_MQ).matches) return;
        if ((e.target as HTMLElement).closest('button, a')) return;
        drag.current = { y: e.clientY, t: e.timeStamp };
        e.currentTarget.setPointerCapture(e.pointerId);
    };
    const onDragMove = (e: ReactPointerEvent<HTMLElement>) => {
        if (!drag.current) return;
        setDragY(Math.max(0, e.clientY - drag.current.y));
    };
    const onDragEnd = (e: ReactPointerEvent<HTMLElement>) => {
        const start = drag.current;
        drag.current = null;
        if (!start) return;
        const dy = e.clientY - start.y;
        const v = dy / Math.max(1, e.timeStamp - start.t);
        setDragY(0);
        if (dy > CLOSE_DISTANCE || (dy > 24 && v > CLOSE_VELOCITY)) onClose();
    };
    const onDragCancel = () => {
        drag.current = null;
        setDragY(0);
    };
    const dragHandlers = {
        onPointerDown: onDragStart,
        onPointerMove: onDragMove,
        onPointerUp: onDragEnd,
        onPointerCancel: onDragCancel,
    };

    if (!isClient) return null;

    return createPortal(
        <div className={`fixed inset-0 z-[60] ${open ? '' : 'pointer-events-none'}`} aria-hidden={!open} inert={!open}>
            <div
                onClick={onClose}
                className={`absolute inset-0 bg-slate-900/40 backdrop-blur-[1px] transition-opacity duration-300 motion-reduce:transition-none md:bg-slate-900/30 ${open ? 'opacity-100' : 'opacity-0'}`}
                style={dragY ? { opacity: Math.max(0.2, 1 - dragY / 400) } : undefined}
            />
            <div className="absolute inset-0 overflow-hidden">
                <aside
                    ref={panelRef}
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby={title ? titleId : undefined}
                    tabIndex={-1}
                    data-drawer-panel=""
                    style={{
                        ['--drawer-width' as string]: `${width}px`,
                        ...(dragY ? { transform: `translateY(${dragY}px)`, transition: 'none' } : null),
                    }}
                    className={`pointer-events-auto absolute flex flex-col bg-mk-surface shadow-2xl transition-transform duration-300 ease-out motion-reduce:transition-none inset-x-0 bottom-0 max-h-[85dvh] w-full max-w-none rounded-t-2xl md:inset-y-0 md:right-0 md:left-auto md:h-auto md:max-h-none md:w-[min(var(--drawer-width),94vw)] md:max-w-[94vw] md:rounded-none ${
                        open
                            ? 'translate-y-0 md:translate-x-0 md:translate-y-0'
                            : 'translate-y-full md:translate-x-full md:translate-y-0'
                    }`}
                >
                    {/* Uchwyt arkusza (telefon). Cały pas + nagłówek reagują na przeciągnięcie w dół. */}
                    <div
                        className="flex h-6 shrink-0 cursor-grab touch-none items-end justify-center md:hidden"
                        {...dragHandlers}
                        aria-hidden
                    >
                        <span className="h-1.5 w-10 rounded-full bg-mk-border-strong" />
                    </div>
                    <div className="hidden md:block" style={{ height: 4, background: accent }} />
                    <header
                        className="flex shrink-0 touch-none items-start justify-between gap-3 border-b border-mk-border px-4 pb-3 pt-2 md:touch-auto md:px-5 md:py-4"
                        {...dragHandlers}
                    >
                        <div className="min-w-0 self-center">
                            {title && <h2 id={titleId} className="text-lg font-bold leading-tight text-mk-text">{title}</h2>}
                            {subtitle && <p className="mt-0.5 text-sm text-mk-muted">{subtitle}</p>}
                        </div>
                        <button
                            ref={closeBtnRef}
                            type="button"
                            onClick={onClose}
                            aria-label="Zamknij"
                            className="mk-press -mr-2 flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-mk-muted transition-colors hover:bg-mk-surface-alt hover:text-mk-text active:bg-mk-surface-alt md:mr-0"
                        >
                            <X size={20} />
                        </button>
                    </header>
                    <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-[calc(1.25rem+env(safe-area-inset-bottom,0px))] pt-4 md:px-5 md:py-5">
                        {children}
                    </div>
                </aside>
            </div>
        </div>,
        document.body,
    );
}
