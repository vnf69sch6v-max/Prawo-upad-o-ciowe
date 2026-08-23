'use client';

import { useEffect, useMemo, useState } from 'react';
import { Check, Pencil, Plus, RotateCcw } from 'lucide-react';
import { formatDataPeriodLabel } from '@/lib/formatters';
import { CompactKpiGrid } from '@/components/ui/CompactKpiGrid';
import { CsvExport } from '@/components/ui/CsvExport';
import { LatestNews } from '@/components/ui/RelatedNews';
import { OverviewHero } from '@/components/ui/OverviewHero';
import { PageHeader, PageEyebrow } from '@/components/ui/PageHeader';
import { WatchlistStrip } from '@/components/ui/WatchlistStrip';
import { DashboardCanvas } from '@/components/panel/DashboardCanvas';
import { WidgetPicker } from '@/components/panel/WidgetPicker';
import { EditModeContext } from '@/components/panel/EditModeContext';
import { LongPressSurface } from '@/components/panel/LongPressSurface';
import { useDashboardLayout } from '@/lib/dashboard/useDashboardLayout';
import { useOverviewData } from '@/lib/dashboard/overview-data';

function DefaultOverview({ data }: { data: ReturnType<typeof useOverviewData> }) {
    return (
        <>
            <OverviewHero cpi={data.cpi} retail={data.retail} cpiLoading={data.cpiLoading} retailLoading={data.retailLoading} />
            <WatchlistStrip items={data.watchlistItems} compact />
            <div className="space-y-2">
                <CompactKpiGrid label="Wskaźniki makro" columns={5} dense items={data.macro.map((k) => ({ key: k.watchId, ...k, watchId: k.watchId }))} />
                <CompactKpiGrid label="Rynki finansowe" columns={5} dense items={data.markets.map((k) => ({ key: k.watchId, ...k, watchId: k.watchId }))} />
            </div>
            <LatestNews limit={6} variant="overview" />
        </>
    );
}

export default function OverviewPage() {
    const data = useOverviewData();
    const dash = useDashboardLayout();
    const [editing, setEditing] = useState(false);
    const [pickerOpen, setPickerOpen] = useState(false);

    useEffect(() => {
        const enter = () => setEditing(true);
        window.addEventListener('mk:edit-dashboard', enter);
        try {
            if (sessionStorage.getItem('mk:edit-once') === '1') {
                sessionStorage.removeItem('mk:edit-once');
                setEditing(true);
            }
            const q = new URLSearchParams(window.location.search);
            if (q.get('edit') === '1') {
                setEditing(true);
                window.history.replaceState({}, '', window.location.pathname || '/');
            }
        } catch { /* ignore */ }
        return () => window.removeEventListener('mk:edit-dashboard', enter);
    }, []);

    useEffect(() => {
        if (!editing) return;
        const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setEditing(false); };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [editing]);

    const present = useMemo(() => new Set(dash.layout.map((i) => i.widgetId)), [dash.layout]);
    const showDefault = (!dash.ready || dash.isDefault) && !editing;

    return (
        <EditModeContext.Provider value={editing}>
            <div className={`mk-fade-in mk-overview ${editing ? 'mk-overview-editing' : ''}`}>
                <PageHeader
                    compact
                    eyebrow={<PageEyebrow section="Dane makro" />}
                    title="Przegląd"
                    subtitle={
                        editing
                            ? 'Przeciągnij kafle, zmień rozmiar albo dodaj wykres — jak ikony na iPhonie.'
                            : (
                                <>
                                    Kluczowe wskaźniki makroekonomiczne dla Polski
                                    {data.dataDate ? ` · ${formatDataPeriodLabel(data.dataDate)}` : ''}
                                </>
                            )
                    }
                    actions={
                        <div className="flex flex-wrap items-center gap-2">
                            {editing ? (
                                <>
                                    <button type="button" onClick={() => setPickerOpen(true)} className="mk-btn">
                                        <Plus size={15} /> Dodaj
                                    </button>
                                    {!dash.isDefault && (
                                        <button type="button" onClick={() => dash.reset()} className="mk-btn">
                                            <RotateCcw size={15} /> Przywróć domyślny układ
                                        </button>
                                    )}
                                    <button type="button" onClick={() => setEditing(false)} className="mk-btn mk-btn-primary">
                                        <Check size={15} /> Gotowe
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button type="button" onClick={() => setEditing(true)} className="mk-btn" aria-label="Edytuj pulpit">
                                        <Pencil size={15} /> Edytuj
                                    </button>
                                    <CsvExport filename="przeglad-makro" headers={['Wskaźnik', 'Wartość']} rows={data.csvRows} />
                                </>
                            )}
                        </div>
                    }
                />

                {showDefault ? (
                    <LongPressSurface onLongPress={() => setEditing(true)}>
                        <DefaultOverview data={data} />
                    </LongPressSurface>
                ) : (
                    <DashboardCanvas
                        layout={dash.layout}
                        editing={editing}
                        onReorder={dash.setLayout}
                        onRemove={dash.removeWidget}
                        onResize={dash.resize}
                        onAdd={() => setPickerOpen(true)}
                    />
                )}

                <WidgetPicker
                    open={pickerOpen}
                    onClose={() => setPickerOpen(false)}
                    present={present}
                    onAdd={(id) => { dash.addWidget(id); }}
                />
            </div>
        </EditModeContext.Provider>
    );
}
