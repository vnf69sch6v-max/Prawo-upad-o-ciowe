'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, X } from 'lucide-react';
import { getWidget } from '@/lib/dashboard/registry';
import { MAX_COLS, MAX_ROWS, type WidgetInstance, type WidgetSize } from '@/lib/dashboard/types';

const COL_SPAN: Record<number, string> = {
    1: 'col-span-1',
    2: 'col-span-1 md:col-span-2',
    3: 'col-span-1 md:col-span-2 xl:col-span-3',
};

export function WidgetTile({
    instance, editing, onRemove, onResize,
}: {
    instance: WidgetInstance;
    editing: boolean;
    onRemove: (id: string) => void;
    onResize: (id: string, patch: Partial<Pick<WidgetInstance, 'w' | 'h'>>) => void;
}) {
    const def = getWidget(instance.widgetId);
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: instance.widgetId,
        disabled: !editing,
    });

    if (!def) return null;

    const minW = def.minW ?? 1;
    const minH = def.minH ?? 1;
    const size: WidgetSize = { w: instance.w, h: instance.h };

    return (
        <div
            ref={setNodeRef}
            style={{
                transform: CSS.Transform.toString(transform),
                transition,
                gridRow: `span ${instance.h}`,
            }}
            className={`relative min-h-0 ${COL_SPAN[instance.w] ?? COL_SPAN[1]} ${isDragging ? 'z-20 opacity-40' : ''}`}
        >
            {editing && (
                <div className="absolute inset-x-0 top-0 z-10 flex items-center gap-1 rounded-t-xl bg-mk-surface/95 px-2 py-1.5 shadow-sm ring-1 ring-mk-primary/30 backdrop-blur-sm">
                    <button
                        type="button"
                        className="flex h-7 w-7 shrink-0 cursor-grab items-center justify-center rounded-md text-mk-faint hover:bg-mk-surface-alt hover:text-mk-text active:cursor-grabbing"
                        aria-label={`Przeciągnij: ${def.title}`}
                        {...attributes}
                        {...listeners}
                    >
                        <GripVertical size={16} />
                    </button>
                    <span className="min-w-0 flex-1 truncate text-[11px] font-semibold uppercase tracking-wide text-mk-muted">
                        {def.title}
                    </span>
                    <SizeCycle
                        label="Szerokość"
                        value={instance.w}
                        min={minW}
                        max={MAX_COLS}
                        marks={['S', 'M', 'L']}
                        onChange={(w) => onResize(instance.widgetId, { w })}
                    />
                    <SizeCycle
                        label="Wysokość"
                        value={instance.h}
                        min={minH}
                        max={MAX_ROWS}
                        marks={['1', '2', '3']}
                        onChange={(h) => onResize(instance.widgetId, { h })}
                    />
                    <button
                        type="button"
                        onClick={() => onRemove(instance.widgetId)}
                        aria-label={`Usuń widget: ${def.title}`}
                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-mk-faint transition-colors hover:bg-mk-negative/10 hover:text-mk-negative"
                    >
                        <X size={15} />
                    </button>
                </div>
            )}

            <div className={`h-full min-h-0 [&_.mk-card]:h-full [&_.mk-kpi]:h-full ${editing ? 'pointer-events-none' : ''}`}>
                {def.render(size)}
            </div>

            {editing && (
                <div className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-inset ring-mk-primary/25" />
            )}
        </div>
    );
}

function SizeCycle({
    label, value, min, max, marks, onChange,
}: {
    label: string;
    value: number;
    min: number;
    max: number;
    marks: string[];
    onChange: (n: number) => void;
}) {
    return (
        <div className="flex shrink-0 items-center overflow-hidden rounded-md border border-mk-border bg-mk-surface" role="group" aria-label={label}>
            {marks.map((mark, i) => {
                const n = i + 1;
                const disabled = n < min || n > max;
                const on = n === value;
                return (
                    <button
                        key={mark}
                        type="button"
                        disabled={disabled}
                        onClick={() => onChange(n)}
                        className={`h-7 min-w-[22px] px-1.5 text-[10px] font-bold ${on ? 'bg-mk-primary text-white' : 'text-mk-muted hover:bg-mk-surface-alt'} ${disabled ? 'cursor-not-allowed opacity-30' : ''}`}
                    >
                        {mark}
                    </button>
                );
            })}
        </div>
    );
}
