'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { useFocusTrap } from '@/lib/use-focus-trap';

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

/** Wysuwany panel z prawej krawędzi (drawer) z przyciemnieniem tła. Zamyka: X, klik w tło, Escape.
 *  Renderowany przez portal do <body>, by `position: fixed` był względny do viewportu
 *  (przodek z `transform` inaczej łamie pozycjonowanie). Kontener `overflow-hidden` chowa panel poza ekranem. */
export function Drawer({ open, onClose, title, subtitle, accent = '#2563EB', width = 480, children }: DrawerProps) {
    const [mounted, setMounted] = useState(false);
    const panelRef = useRef<HTMLElement>(null);
    const closeBtnRef = useRef<HTMLButtonElement>(null);
    useEffect(() => setMounted(true), []);
    useFocusTrap(open, panelRef, onClose);

    useEffect(() => {
        if (!open) return;
        const prev = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        const id = setTimeout(() => closeBtnRef.current?.focus(), 20);
        return () => { clearTimeout(id); document.body.style.overflow = prev; };
    }, [open]);

    if (!mounted) return null;

    return createPortal(
        <div className={`fixed inset-0 z-[60] ${open ? '' : 'pointer-events-none'}`} aria-hidden={!open}>
            <div onClick={onClose}
                className={`absolute inset-0 bg-slate-900/30 backdrop-blur-[1px] transition-opacity duration-300 ${open ? 'opacity-100' : 'opacity-0'}`} />
            <div className="absolute inset-0 overflow-hidden">
                <aside ref={panelRef} role="dialog" aria-modal="true" style={{ width, maxWidth: '94vw' }}
                    className={`pointer-events-auto absolute inset-y-0 right-0 flex flex-col bg-mk-surface shadow-2xl transition-transform duration-300 ease-out ${open ? 'translate-x-0' : 'translate-x-full'}`}>
                    <div style={{ height: 4, background: accent }} />
                    <header className="flex items-start justify-between gap-3 border-b border-mk-border px-5 py-4">
                        <div className="min-w-0">
                            {title && <h2 className="text-lg font-bold leading-tight text-mk-text">{title}</h2>}
                            {subtitle && <p className="mt-0.5 text-sm text-mk-muted">{subtitle}</p>}
                        </div>
                        <button ref={closeBtnRef} type="button" onClick={onClose} aria-label="Zamknij" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-mk-muted transition-colors hover:bg-mk-surface-alt hover:text-mk-text">
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
