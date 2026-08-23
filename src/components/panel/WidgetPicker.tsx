'use client';

// Picker widgetów — modal z wyszukiwaniem, grupujący cały katalog wg kategorii.
// Wzorowany na CommandPalette (portal, backdrop, ⌘K-style), ale dodaje/odejmuje kafle z panelu.
// Widgety już dodane są wyszarzone (bez duplikatów — id jest kluczem układu).

import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Search, Plus, Check, X } from 'lucide-react';
import { WIDGETS, CATEGORY_ORDER } from '@/lib/dashboard/registry';

const norm = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[łŁ]/g, 'l').toLowerCase();

export function WidgetPicker({
    open, onClose, present, onAdd,
}: {
    open: boolean;
    onClose: () => void;
    present: Set<string>;
    onAdd: (widgetId: string) => void;
}) {
    const [q, setQ] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (!open) return;
        setQ(''); // eslint-disable-line react-hooks/set-state-in-effect -- celowy reset wyszukiwarki przy otwarciu
        const id = setTimeout(() => inputRef.current?.focus(), 20);
        const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', onKey);
        const prev = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => { clearTimeout(id); window.removeEventListener('keydown', onKey); document.body.style.overflow = prev; };
    }, [open, onClose]);

    const groups = useMemo(() => {
        const query = norm(q.trim());
        const match = (id: string) => {
            const w = WIDGETS.find((x) => x.id === id)!;
            if (!query) return true;
            return norm(`${w.title} ${w.category} ${w.description ?? ''}`).includes(query);
        };
        return CATEGORY_ORDER
            .map(({ key, icon }) => ({
                key, icon,
                items: WIDGETS.filter((w) => w.category === key && match(w.id)),
            }))
            .filter((g) => g.items.length > 0);
    }, [q]);

    if (!open) return null;

    const total = groups.reduce((n, g) => n + g.items.length, 0);

    return createPortal(
        <div className="fixed inset-0 z-[80] flex items-start justify-center px-4 pt-[10vh]" role="dialog" aria-modal="true" aria-label="Dodaj widget">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]" onClick={onClose} />
            <div className="relative flex max-h-[80vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-mk-border bg-mk-surface shadow-2xl">
                <div className="flex items-center gap-2.5 border-b border-mk-border px-4">
                    <Search size={18} className="shrink-0 text-mk-faint" />
                    <input
                        ref={inputRef}
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        placeholder="Szukaj widgetu — CPI, WIG20, bezrobocie…"
                        className="h-14 flex-1 bg-transparent text-[15px] text-mk-text outline-none placeholder:text-mk-faint"
                    />
                    <button type="button" onClick={onClose} aria-label="Zamknij" className="rounded-lg p-1.5 text-mk-faint transition-colors hover:bg-mk-surface-alt hover:text-mk-text">
                        <X size={18} />
                    </button>
                </div>

                <div className="min-h-0 flex-1 overflow-y-auto px-2 py-3">
                    {total === 0 ? (
                        <div className="px-4 py-10 text-center text-sm text-mk-faint">Brak widgetów dla „{q}”</div>
                    ) : groups.map((g) => {
                        const Icon = g.icon;
                        return (
                            <div key={g.key} className="mb-3">
                                <div className="flex items-center gap-1.5 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-mk-faint">
                                    <Icon size={13} /> {g.key}
                                </div>
                                <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                                    {g.items.map((w) => {
                                        const added = present.has(w.id);
                                        return (
                                            <button
                                                key={w.id}
                                                type="button"
                                                disabled={added}
                                                onClick={() => onAdd(w.id)}
                                                className={`group flex items-start gap-3 rounded-xl border p-3 text-left transition-colors ${added ? 'cursor-default border-mk-border bg-mk-surface-alt opacity-60' : 'border-mk-border bg-mk-surface hover:border-mk-primary/40 hover:bg-mk-primary/5'}`}
                                            >
                                                <span className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${added ? 'bg-mk-positive/10 text-mk-positive' : 'bg-mk-surface-alt text-mk-muted group-hover:bg-mk-primary group-hover:text-white'}`}>
                                                    {added ? <Check size={15} /> : <Plus size={15} />}
                                                </span>
                                                <span className="min-w-0 flex-1">
                                                    <span className="block truncate text-sm font-semibold text-mk-text">{w.title}</span>
                                                    {w.description && <span className="mt-0.5 block truncate text-xs text-mk-faint">{w.description}</span>}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="flex items-center justify-between border-t border-mk-border px-4 py-2 text-[11px] text-mk-faint">
                    <span>{WIDGETS.length} dostępnych widgetów</span>
                    <span>{present.size} na panelu</span>
                </div>
            </div>
        </div>,
        document.body,
    );
}
