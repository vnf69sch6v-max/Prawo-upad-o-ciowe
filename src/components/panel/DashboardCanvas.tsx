'use client';

import { useMemo, useState } from 'react';
import {
    DndContext, DragOverlay, PointerSensor, KeyboardSensor, closestCenter,
    useSensor, useSensors, type DragEndEvent, type DragStartEvent,
} from '@dnd-kit/core';
import { SortableContext, arrayMove, rectSortingStrategy, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { Plus } from 'lucide-react';
import { getWidget } from '@/lib/dashboard/registry';
import { GRID_GAP, GRID_ROW_H, type WidgetInstance } from '@/lib/dashboard/types';
import { WidgetTile } from './WidgetTile';

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
    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
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

    const grid = (
        <div
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3"
            style={{ gap: GRID_GAP, gridAutoRows: GRID_ROW_H }}
        >
            <SortableContext items={ids} strategy={rectSortingStrategy}>
                {layout.map((instance) => (
                    <WidgetTile
                        key={instance.widgetId}
                        instance={instance}
                        editing={editing}
                        onRemove={onRemove}
                        onResize={onResize}
                    />
                ))}
            </SortableContext>
        </div>
    );

    if (layout.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-mk-border bg-mk-surface-alt px-6 py-16 text-center">
                <p className="text-sm font-medium text-mk-text">Panel jest pusty</p>
                <p className="mt-1 max-w-md text-sm text-mk-muted">
                    Dodaj kafle z katalogu — CPI, WIG20, bezrobocie, newsy. Brak odczytu ze źródła pokazuje „—”, nigdy zmyślonych liczb.
                </p>
                <button
                    type="button"
                    onClick={onAdd}
                    className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-mk-primary px-3 py-2 text-sm font-semibold text-white hover:bg-mk-primary/90"
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
            {grid}
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
