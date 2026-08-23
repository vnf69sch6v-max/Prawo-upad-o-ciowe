'use client';

import { useMemo, useState, type ReactNode } from 'react';
import {
    DndContext, DragOverlay, PointerSensor, KeyboardSensor, closestCenter,
    useSensor, useSensors, type DragEndEvent, type DragStartEvent,
} from '@dnd-kit/core';
import { SortableContext, arrayMove, rectSortingStrategy, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { Plus } from 'lucide-react';
import { getWidget } from '@/lib/dashboard/registry';
import {
    FULL_WIDTH_IDS, GRID_GAP, GRID_ROW_H, MACRO_KPI_IDS, MARKET_KPI_IDS,
    type WidgetInstance,
} from '@/lib/dashboard/types';
import { WidgetTile } from './WidgetTile';

const FULL = new Set<string>(FULL_WIDTH_IDS);
const MACRO = new Set<string>(MACRO_KPI_IDS);
const MARKET = new Set<string>(MARKET_KPI_IDS);

type Segment =
    | { type: 'full'; item: WidgetInstance }
    | { type: 'macro'; items: WidgetInstance[] }
    | { type: 'market'; items: WidgetInstance[] }
    | { type: 'grid'; items: WidgetInstance[] };

function segmentLayout(layout: WidgetInstance[]): Segment[] {
    const out: Segment[] = [];
    let i = 0;
    while (i < layout.length) {
        const it = layout[i];
        if (FULL.has(it.widgetId)) {
            out.push({ type: 'full', item: it });
            i++;
            continue;
        }
        if (MACRO.has(it.widgetId)) {
            const items: WidgetInstance[] = [];
            while (i < layout.length && MACRO.has(layout[i].widgetId)) items.push(layout[i++]);
            out.push({ type: 'macro', items });
            continue;
        }
        if (MARKET.has(it.widgetId)) {
            const items: WidgetInstance[] = [];
            while (i < layout.length && MARKET.has(layout[i].widgetId)) items.push(layout[i++]);
            out.push({ type: 'market', items });
            continue;
        }
        const items: WidgetInstance[] = [];
        while (
            i < layout.length
            && !FULL.has(layout[i].widgetId)
            && !MACRO.has(layout[i].widgetId)
            && !MARKET.has(layout[i].widgetId)
        ) {
            items.push(layout[i++]);
        }
        out.push({ type: 'grid', items });
    }
    return out;
}

export function DashboardCanvas({
    layout, editing, onReorder, onRemove, onResize, onAdd,
}: {
    layout: WidgetInstance[];
    editing: boolean;
    onReorder: (next: WidgetInstance[]) => void;
    onRemove: (id: string) => void;
    onResize: (id: string, patch: Partial<Pick<WidgetInstance, 'w' | 'h'>>) => void;
    onAdd: () => void;
}) {
    const [activeId, setActiveId] = useState<string | null>(null);
    const ids = useMemo(() => layout.map((i) => i.widgetId), [layout]);
    const segments = useMemo(() => segmentLayout(layout), [layout]);
    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
    );

    const onDragStart = (e: DragStartEvent) => setActiveId(String(e.active.id));
    const onDragEnd = (e: DragEndEvent) => {
        setActiveId(null);
        const { active, over } = e;
        if (!over || active.id === over.id) return;
        const from = layout.findIndex((i) => i.widgetId === active.id);
        const to = layout.findIndex((i) => i.widgetId === over.id);
        if (from < 0 || to < 0) return;
        onReorder(arrayMove(layout, from, to));
    };

    const tile = (instance: WidgetInstance, extra?: { compactChrome?: boolean; autoHeight?: boolean }) => (
        <WidgetTile
            key={instance.widgetId}
            instance={instance}
            editing={editing}
            onRemove={onRemove}
            onResize={onResize}
            compactChrome={extra?.compactChrome}
            autoHeight={extra?.autoHeight}
        />
    );

    const body: ReactNode = (
        <SortableContext items={ids} strategy={rectSortingStrategy}>
            <div className="space-y-4">
                {segments.map((seg, idx) => {
                    if (seg.type === 'full') {
                        return (
                            <div key={seg.item.widgetId} className="grid grid-cols-1">
                                {tile(seg.item, { autoHeight: true })}
                            </div>
                        );
                    }
                    if (seg.type === 'macro' || seg.type === 'market') {
                        const label = seg.type === 'macro' ? 'Wskaźniki makro' : 'Rynki finansowe';
                        return (
                            <section key={`${seg.type}-${idx}`}>
                                <h2 className="mk-section-label mb-1.5">{label}</h2>
                                <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-5">
                                    {seg.items.map((it) => tile(it, { compactChrome: true, autoHeight: true }))}
                                </div>
                            </section>
                        );
                    }
                    return (
                        <div
                            key={`grid-${idx}`}
                            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3"
                            style={{ gap: GRID_GAP, gridAutoRows: GRID_ROW_H }}
                        >
                            {seg.items.map((it) => tile(it))}
                        </div>
                    );
                })}

                {editing && (
                    <button
                        type="button"
                        onClick={onAdd}
                        className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-mk-border-strong bg-mk-surface px-4 py-6 text-sm font-semibold text-mk-muted transition-colors hover:border-mk-primary/50 hover:bg-mk-primary/5 hover:text-mk-primary"
                    >
                        <Plus size={18} /> Dodaj widget
                    </button>
                )}
            </div>
        </SortableContext>
    );

    if (layout.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-mk-border bg-mk-surface-alt px-6 py-16 text-center">
                <p className="text-sm font-medium text-mk-text">Pulpit jest pusty</p>
                <p className="mt-1 max-w-md text-sm text-mk-muted">
                    Dodaj kafle z katalogu. Brak odczytu ze źródła pokazuje „—”, nigdy zmyślonych liczb.
                </p>
                <button
                    type="button"
                    onClick={onAdd}
                    className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-mk-primary px-3 py-2 text-sm font-semibold text-white hover:bg-mk-primary-strong"
                >
                    <Plus size={16} /> Dodaj widget
                </button>
            </div>
        );
    }

    const activeTitle = activeId ? getWidget(activeId)?.title : null;

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={editing ? onDragStart : undefined}
            onDragEnd={editing ? onDragEnd : undefined}
            onDragCancel={editing ? () => setActiveId(null) : undefined}
        >
            {body}
            {editing && (
                <DragOverlay>
                    {activeTitle ? (
                        <div className="rounded-xl border border-mk-primary/40 bg-mk-surface px-4 py-3 text-sm font-semibold text-mk-text shadow-xl">
                            {activeTitle}
                        </div>
                    ) : null}
                </DragOverlay>
            )}
        </DndContext>
    );
}
