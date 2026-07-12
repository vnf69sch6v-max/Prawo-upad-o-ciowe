'use client';

import { useEffect, useState, type ReactNode } from 'react';
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

/** Wysuwany panel z prawej krawędzi (drawer) z przyciemnieniem tła. Zamyka: X, klik w tło, Escape.
 *  Renderowany przez portal do <body>, by `position: fixed` był względny do viewportu
 *  (przodek z `transform` inaczej łamie pozycjonowanie). Kontener `overflow-hidden` chowa panel poza ekranem. */
export function Drawer({ open, onClose, title, subtitle, accent = '#2563EB', width = 480, children }: DrawerProps) {
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    useEffect(() => {
        if (!open) return;
        const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('keydown', onKey);
        const prev = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = prev; };
    }, [open, onClose]);

    if (!mounted) return null;

    return createPortal(
        <div className={`fixed inset-0 z-[60] ${open ? '' : 'pointer-events-none'}`} aria-hidden={!open}>
            <div onClick={onClose}
                className={`absolute inset-0 bg-slate-900/30 backdrop-blur-[1px] transition-opacity duration-300 ${open ? 'opacity-100' : 'opacity-0'}`} />
            <div className="absolute inset-0 overflow-hidden">
                <aside role="dialog" aria-modal="true" style={{ width, maxWidth: '94vw' }}
                    className={`pointer-events-auto absolute inset-y-0 right-0 flex flex-col bg-mk-surface shadow-2xl transition-transform duration-300 ease-out ${open ? 'translate-x-0' : 'translate-x-full'}`}>
                    <div style={{ height: 4, background: accent }} />
                    <header className="flex items-start justify-between gap-3 border-b border-mk-border px-5 py-4">
                        <div className="min-w-0">
                            {title && <h2 className="text-lg font-bold leading-tight text-mk-text">{title}</h2>}
                            {subtitle && <p className="mt-0.5 text-sm text-mk-muted">{subtitle}</p>}
                        </div>
                        <button onClick={onClose} aria-label="Zamknij" className="shrink-0 rounded-lg p-1.5 text-mk-muted transition-colors hover:bg-mk-surface-alt hover:text-mk-text">
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
