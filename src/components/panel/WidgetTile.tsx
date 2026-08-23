'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Minus } from 'lucide-react';
import { getWidget } from '@/lib/dashboard/registry';
import { MAX_COLS, type WidgetInstance, type WidgetSize } from '@/lib/dashboard/types';

const COL_SPAN: Record<number, string> = {
    1: 'col-span-1',
    2: 'col-span-1 md:col-span-2',
    3: 'col-span-1 md:col-span-2 xl:col-span-3',
};

export function WidgetTile({
    instance, editing, onRemove, onResize, compactChrome = false, autoHeight = false,
}: {
    instance: WidgetInstance;
    editing: boolean;
    onRemove: (id: string) => void;
    onResize: (id: string, patch: Partial<Pick<WidgetInstance, 'w' | 'h'>>) => void;
    compactChrome?: boolean;
    autoHeight?: boolean;
}) {
    const def = getWidget(instance.widgetId);
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: instance.widgetId,
        disabled: !editing,
    });

    if (!def) return null;

    const minW = def.minW ?? 1;
    const size: WidgetSize = { w: instance.w, h: instance.h };
    const tall = !autoHeight && !def.autoHeight;

    return (
        <div
            ref={setNodeRef}
            style={{
                transform: CSS.Transform.toString(transform),
                transition,
                gridRow: tall ? `span ${instance.h}` : undefined,
            }}
            className={`relative min-h-0 ${COL_SPAN[instance.w] ?? COL_SPAN[1]} ${isDragging ? 'z-20 opacity-40' : ''} ${editing ? 'mk-jiggle' : ''}`}
            {...(editing ? { ...attributes, ...listeners } : {})}
        >
            {editing && (
                <button
                    type="button"
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={(e) => { e.stopPropagation(); onRemove(instance.widgetId); }}
                    aria-label={`Usuń: ${def.title}`}
                    className="absolute -left-1.5 -top-1.5 z-20 flex h-6 w-6 items-center justify-center rounded-full bg-[#3F3F46] text-white shadow-md ring-2 ring-white"
                >
                    <Minus size={13} strokeWidth={3} />
                </button>
            )}

            {editing && !compactChrome && (
                <div
                    className="absolute -bottom-2 left-1/2 z-20 flex -translate-x-1/2 overflow-hidden rounded-full border border-mk-border bg-mk-surface shadow-sm"
                    onPointerDown={(e) => e.stopPropagation()}
                    role="group"
                    aria-label="Rozmiar kafla"
                >
                    {(['S', 'M', 'L'] as const).map((mark, i) => {
                        const n = i + 1;
                        const disabled = n < minW || n > MAX_COLS;
                        const on = n === instance.w;
                        return (
                            <button
                                key={mark}
                                type="button"
                                disabled={disabled}
                                onClick={(e) => { e.stopPropagation(); onResize(instance.widgetId, { w: n }); }}
                                className={`h-6 min-w-[22px] px-1.5 text-[10px] font-bold ${on ? 'bg-mk-primary text-white' : 'text-mk-muted hover:bg-mk-surface-alt'} ${disabled ? 'cursor-not-allowed opacity-30' : ''}`}
                            >
                                {mark}
                            </button>
                        );
                    })}
                </div>
            )}

            <div className={`h-full min-h-0 [&_.mk-card]:h-full [&_.mk-kpi]:h-full ${editing ? 'pointer-events-none select-none' : ''}`}>
                {def.render(size)}
            </div>
        </div>
    );
}
