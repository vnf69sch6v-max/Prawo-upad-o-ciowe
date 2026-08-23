'use client';

import { useMemo, useState } from 'react';
import { Pencil, Plus, RotateCcw, Check } from 'lucide-react';
import { useCpiFull, useGusRegisteredUnemployment, useStooq } from '@/lib/hooks';
import { lastOf, prevOf, fmtPL } from '@/lib/series';
import { formatDataPeriodLabel, formatNumber, percentChange } from '@/lib/formatters';
import { PageHeader, PageEyebrow } from '@/components/ui/PageHeader';
import { EditorialHero } from '@/components/ui/EditorialHero';
import { DashboardCanvas } from '@/components/panel/DashboardCanvas';
import { WidgetPicker } from '@/components/panel/WidgetPicker';
import { useDashboardLayout } from '@/lib/dashboard/useDashboardLayout';

export default function PanelPage() {
    const { layout, ready, setLayout, addWidget, removeWidget, resize, reset } = useDashboardLayout();
    const [editing, setEditing] = useState(false);
    const [pickerOpen, setPickerOpen] = useState(false);

    const cpiQ = useCpiFull();
    const unempQ = useGusRegisteredUnemployment(24);
    const wigQ = useStooq('wig20', 30);

    const cpi = useMemo(
        () => (cpiQ.data?.headline ?? []).filter((h) => h.yoy != null).map((h) => ({ date: h.date, value: h.yoy as number })),
        [cpiQ.data],
    );
    const unemp = useMemo(
        () => (unempQ.data?.series ?? []).map((d) => ({ date: d.date, value: d.value })),
        [unempQ.data],
    );
    const wigLast = wigQ.data?.latest?.close ?? null;
    const wigBars = wigQ.data?.data ?? [];
    const wigDelta = wigBars.length > 1
        ? +percentChange(wigBars[wigBars.length - 1].close, wigBars[wigBars.length - 2].close).toFixed(2)
        : null;

    const cpiLast = lastOf(cpi);
    const cpiDelta = lastOf(cpi) != null && prevOf(cpi) != null ? +(lastOf(cpi)! - prevOf(cpi)!).toFixed(1) : null;
    const period = cpi.length ? formatDataPeriodLabel(cpi[cpi.length - 1].date) : null;

    const present = useMemo(() => new Set(layout.map((i) => i.widgetId)), [layout]);

    return (
        <div className="mk-fade-in space-y-5">
            <PageHeader
                eyebrow={<PageEyebrow section="Mój panel" />}
                title="Mój panel"
                subtitle="Edytowalny układ kafli z realnych danych GUS, NBP i GPW. Brak odczytu = —."
                actions={
                    <div className="flex flex-wrap items-center gap-2">
                        <button
                            type="button"
                            onClick={() => setPickerOpen(true)}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-mk-border bg-mk-surface px-3 py-2 text-sm font-medium text-mk-text transition-colors hover:border-mk-primary/40 hover:bg-mk-primary/5"
                        >
                            <Plus size={15} /> Dodaj widget
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                if (typeof window !== 'undefined' && !window.confirm('Przywrócić domyślny układ panelu?')) return;
                                reset();
                            }}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-mk-border bg-mk-surface px-3 py-2 text-sm font-medium text-mk-muted transition-colors hover:bg-mk-surface-alt hover:text-mk-text"
                        >
                            <RotateCcw size={15} /> Domyślny
                        </button>
                        <button
                            type="button"
                            onClick={() => setEditing((e) => !e)}
                            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${editing ? 'bg-mk-primary text-white' : 'border border-mk-border bg-mk-surface text-mk-text hover:border-mk-primary/40 hover:bg-mk-primary/5'}`}
                        >
                            {editing ? <><Check size={15} /> Gotowe</> : <><Pencil size={15} /> Edytuj układ</>}
                        </button>
                    </div>
                }
            />

            <EditorialHero
                ariaLabel="Mój panel — punkt odniesienia"
                period={period}
                source="GUS · NBP · GPW"
                headline="Twój panel makro"
                description="Przeciągaj, zmieniaj rozmiar i dobieraj kafle. Każda liczba pochodzi z istniejącego źródła — gdy API nic nie zwróci, kafel pokazuje „—”."
                value={fmtPL(cpiLast)}
                unit="%"
                delta={cpiDelta}
                valueCaption="Inflacja CPI · r/r (GUS)"
                panelTitle="Skrót na dziś"
                rows={[
                    { label: 'Bezrobocie rej.', value: lastOf(unemp) != null ? `${fmtPL(lastOf(unemp))}%` : '—' },
                    { label: 'WIG20', value: wigLast != null ? `${formatNumber(wigLast, 0)} pkt` : '—' },
                    { label: 'WIG20 — zmiana', value: wigDelta != null ? `${wigDelta > 0 ? '+' : ''}${wigDelta.toString().replace('.', ',')}%` : '—' },
                    { label: 'Kafle na panelu', value: ready ? `${layout.length}` : '—', divider: true },
                ]}
            />

            {editing && (
                <p className="text-sm text-mk-muted">
                    Tryb edycji: przeciągnij uchwyt, aby zmienić kolejność. S / M / L to szerokość (1–3 kolumny), 1 / 2 / 3 to wysokość rzędu.
                </p>
            )}

            {!ready ? (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {Array.from({ length: 6 }, (_, i) => (
                        <div key={i} className="mk-skeleton h-48 rounded-xl" />
                    ))}
                </div>
            ) : (
                <DashboardCanvas
                    layout={layout}
                    editing={editing}
                    onReorder={setLayout}
                    onRemove={removeWidget}
                    onResize={resize}
                    onAdd={() => setPickerOpen(true)}
                />
            )}

            <WidgetPicker
                open={pickerOpen}
                onClose={() => setPickerOpen(false)}
                present={present}
                onAdd={(id) => { addWidget(id); }}
            />
        </div>
    );
}
