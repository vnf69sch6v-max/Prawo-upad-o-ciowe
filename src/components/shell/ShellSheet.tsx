'use client';

import { useEffect, useEffectEvent, useRef, type PointerEvent as ReactPointerEvent, type ReactNode, type RefObject } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { useIsClient } from '@/lib/use-is-client';

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

interface ShellSheetProps {
    id: string;
    open: boolean;
    onClose: () => void;
    title: string;
    /** Element, który dostaje fokus po zamknięciu (przycisk otwierający). Na iOS tapnięty przycisk nie
     *  dostaje fokusu, więc `document.activeElement` sprzed otwarcia nie nadaje się do przywrócenia. */
    returnFocusRef: RefObject<HTMLElement | null>;
    /** Np. `lg:hidden` — arkusz istnieje tylko tam, gdzie jest jego przycisk. */
    className?: string;
    children: ReactNode;
}

/**
 * Arkusz od dołu dla powłoki (menu „Więcej”, konto). Zawsze w DOM (po hydratacji), a zamknięty jest
 * `inert` + `invisible`, więc wjazd i zjazd są animowane samym CSS. Zamykają go: tło, Esc, przycisk ×,
 * przeciągnięcie uchwytu w dół. Tab krąży w panelu; po zamknięciu fokus wraca do `returnFocusRef` —
 * ale tylko gdy był w arkuszu (jeśli akcja w arkuszu przeniosła fokus dalej, np. do palety, nie
 * zabieramy go).
 *
 * Własna obsługa fokusu zamiast `useFocusTrap`: tamten trzyma jeden globalny „opener”, który
 * zamykany arkusz zużyłby w tym samym commicie, w którym otwiera się paleta ⌘K (akcja „Szukaj”).
 */
export function ShellSheet({ id, open, onClose, title, returnFocusRef, className = '', children }: ShellSheetProps) {
    const isClient = useIsClient();
    const panelRef = useRef<HTMLDivElement>(null);
    const closeRef = useRef<HTMLButtonElement>(null);
    const drag = useRef<{ y0: number; t0: number; dy: number } | null>(null);
    const requestClose = useEffectEvent(() => onClose());

    useEffect(() => {
        if (!open) return;
        const panel = panelRef.current;
        const returnTo = returnFocusRef.current;
        const focusId = window.setTimeout(() => closeRef.current?.focus({ preventScroll: true }), 30);
        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                e.preventDefault();
                requestClose();
                return;
            }
            if (e.key !== 'Tab' || !panel) return;
            const items = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE));
            if (items.length === 0) return;
            const first = items[0];
            const last = items[items.length - 1];
            const current = document.activeElement;
            if (e.shiftKey && (current === first || !panel.contains(current))) {
                e.preventDefault();
                last.focus();
            } else if (!e.shiftKey && (current === last || !panel.contains(current))) {
                e.preventDefault();
                first.focus();
            }
        };
        document.addEventListener('keydown', onKey);

        return () => {
            window.clearTimeout(focusId);
            document.removeEventListener('keydown', onKey);
            document.body.style.overflow = prevOverflow;
            const active = document.activeElement;
            if (!active || active === document.body || panel?.contains(active)) returnTo?.focus({ preventScroll: true });
        };
    }, [open, returnFocusRef]);

    // Przeciąganie uchwytu: panel jedzie za palcem (bez re-renderów), puszczenie > 80 px albo szybki
    // ruch w dół zamyka, inaczej panel wraca na miejsce animacją z klas.
    const onDragStart = (e: ReactPointerEvent<HTMLDivElement>) => {
        if (e.pointerType === 'mouse' && e.button !== 0) return;
        drag.current = { y0: e.clientY, t0: performance.now(), dy: 0 };
        e.currentTarget.setPointerCapture(e.pointerId);
        if (panelRef.current) panelRef.current.style.transition = 'none';
    };
    const onDragMove = (e: ReactPointerEvent<HTMLDivElement>) => {
        const d = drag.current;
        if (!d || !panelRef.current) return;
        d.dy = Math.max(0, e.clientY - d.y0);
        panelRef.current.style.transform = `translateY(${d.dy}px)`;
    };
    const onDragEnd = () => {
        const d = drag.current;
        drag.current = null;
        if (panelRef.current) {
            panelRef.current.style.transition = '';
            panelRef.current.style.transform = '';
        }
        if (d && (d.dy > 80 || d.dy / Math.max(1, performance.now() - d.t0) > 0.6)) onClose();
    };

    if (!isClient) return null;

    return createPortal(
        <div
            className={`mk-sheet fixed inset-0 z-[60] transition-[visibility] duration-300 motion-reduce:transition-none ${open ? 'visible' : 'pointer-events-none invisible'} ${className}`}
            inert={!open}
        >
            <div
                aria-hidden
                onClick={onClose}
                className={`absolute inset-0 bg-slate-900/40 transition-opacity duration-300 motion-reduce:transition-none ${open ? 'opacity-100' : 'opacity-0'}`}
            />
            <div
                ref={panelRef}
                id={id}
                role="dialog"
                aria-modal="true"
                aria-labelledby={`${id}-title`}
                className={`absolute inset-x-0 bottom-0 mx-auto flex max-h-[calc(100dvh-env(safe-area-inset-top)-48px)] w-full max-w-lg flex-col rounded-t-[20px] bg-mk-bg shadow-[0_-8px_30px_rgba(15,23,42,0.18)] [-webkit-tap-highlight-color:transparent] touch-manipulation transition-transform duration-300 ease-[cubic-bezier(.22,1,.36,1)] motion-reduce:transition-none ${open ? 'translate-y-0' : 'translate-y-full'}`}
            >
                <div className="relative shrink-0">
                    <div
                        className="cursor-grab touch-none select-none px-5 pb-2 pt-2.5 active:cursor-grabbing"
                        onPointerDown={onDragStart}
                        onPointerMove={onDragMove}
                        onPointerUp={onDragEnd}
                        onPointerCancel={onDragEnd}
                    >
                        <span aria-hidden className="mx-auto block h-1.5 w-10 rounded-full bg-mk-border-strong" />
                        <h2 id={`${id}-title`} className="mt-2.5 text-lg font-bold leading-7 text-mk-text">{title}</h2>
                    </div>
                    <button
                        ref={closeRef}
                        type="button"
                        onClick={onClose}
                        aria-label="Zamknij"
                        className="absolute right-2 top-3.5 flex h-11 w-11 items-center justify-center rounded-full text-mk-muted transition-colors hover:bg-mk-surface-alt active:bg-mk-border"
                    >
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-mk-surface-alt">
                            <X size={18} strokeWidth={2.4} aria-hidden />
                        </span>
                    </button>
                </div>
                <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-[calc(16px+env(safe-area-inset-bottom))]">
                    {children}
                </div>
            </div>
        </div>,
        document.body,
    );
}

/** Wiersz listy w arkuszu (≥ 52 px): ikona w kafelku, nazwa, opis, strzałka. */
export const SHEET_ROW =
    'group flex min-h-[52px] w-full items-center gap-3 px-3.5 py-2 text-left transition-colors duration-100 hover:bg-mk-surface-alt active:bg-mk-border focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-mk-primary';
