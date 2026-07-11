'use client';

import { useMemo, useState } from 'react';
import { Landmark, MapPin, Layers } from 'lucide-react';
import { useSmupAreas, useSmupServices, useSmupIndicators, useSmupData, type SmupDataRow } from '@/lib/hooks';
import { formatDecimalPL } from '@/lib/formatters';
import { KpiCard } from '@/components/ui/KpiCard';
import { InteractiveChart } from '@/components/ui/InteractiveChart';
import { SectionCard } from '@/components/ui/SectionCard';
import { CsvExport } from '@/components/ui/CsvExport';

function Select({ label, value, onChange, options, disabled, placeholder }: {
    label: string; value: number | undefined; onChange: (v: number) => void;
    options: { id: number; name: string }[]; disabled?: boolean; placeholder: string;
}) {
    return (
        <label className="block">
            <span className="mk-label mb-1.5 block">{label}</span>
            <select className="mk-input" value={value ?? ''} disabled={disabled} onChange={(e) => onChange(Number(e.target.value))}>
                {value == null && <option value="">{placeholder}</option>}
                {options.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
            </select>
        </label>
    );
}

export function SmupExplorer() {
    const [selArea, setSelArea] = useState<number>();
    const [selService, setSelService] = useState<number>();
    const [selIndicator, setSelIndicator] = useState<number>();

    const areas = useSmupAreas().data ?? [];
    const areaId = selArea ?? areas[0]?.['id-ou'];

    const servicesQ = useSmupServices(areaId);
    const services = servicesQ.data ?? [];
    const serviceId = selService ?? services[0]?.['id-up'];

    const indicatorsQ = useSmupIndicators(serviceId);
    const indicators = indicatorsQ.data ?? [];
    const indicatorId = selIndicator ?? indicators[0]?.id;
    const indicatorName = indicators.find((i) => i.id === indicatorId)?.['nazwa-wskaznika'] ?? '';

    const dataQ = useSmupData(indicatorId);
    const rows: SmupDataRow[] = useMemo(() => {
        const d = dataQ.data;
        return Array.isArray(d) ? d : d?.data ?? [];
    }, [dataQ.data]);

    const series = useMemo(() => {
        const byYear = new Map<string, { sum: number; n: number }>();
        for (const r of rows) {
            if (r.wartosc == null) continue;
            const y = String(r['id-daty']).slice(0, 4);
            const e = byYear.get(y) ?? { sum: 0, n: 0 };
            e.sum += r.wartosc; e.n += 1; byYear.set(y, e);
        }
        return Array.from(byYear.entries())
            .map(([year, e]) => ({ date: year, value: +(e.sum / e.n).toFixed(2) }))
            .sort((a, b) => a.date.localeCompare(b.date));
    }, [rows]);

    const latest = series.length ? series[series.length - 1] : null;
    const jstCount = useMemo(() => new Set(rows.map((r) => r['id-teryt'])).size, [rows]);

    return (
        <div className="mk-fade-in space-y-6">
            <SectionCard title="Wybór wskaźnika" padded>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <Select label="Obszar" value={areaId} placeholder="Wybierz obszar"
                        options={areas.map((a) => ({ id: a['id-ou'], name: a['nazwa-obszaru'] }))}
                        onChange={(v) => { setSelArea(v); setSelService(undefined); setSelIndicator(undefined); }} />
                    <Select label="Usługa publiczna" value={serviceId} placeholder="Wybierz usługę" disabled={servicesQ.isLoading || services.length === 0}
                        options={services.map((s) => ({ id: s['id-up'], name: s['nazwa-uslugi'] }))}
                        onChange={(v) => { setSelService(v); setSelIndicator(undefined); }} />
                    <Select label="Wskaźnik" value={indicatorId} placeholder="Wybierz wskaźnik" disabled={indicatorsQ.isLoading || indicators.length === 0}
                        options={indicators.map((i) => ({ id: i.id, name: i['nazwa-wskaznika'] }))}
                        onChange={setSelIndicator} />
                </div>
            </SectionCard>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <KpiCard label="Ostatnia wartość (śr. JST)" value={latest ? formatDecimalPL(latest.value, 2) : '—'} accent="blue" icon={Landmark}
                    footnote={latest ? `rok ${latest.date}` : '—'} loading={dataQ.isLoading} />
                <KpiCard label="Liczba jednostek (TERYT)" value={jstCount ? String(jstCount) : '—'} unit="JST" accent="violet" icon={MapPin}
                    footnote="gminy/powiaty w próbie" loading={dataQ.isLoading} />
                <KpiCard label="Lata danych" value={series.length ? String(series.length) : '—'} accent="green" icon={Layers}
                    footnote={series.length ? `${series[0].date}–${series[series.length - 1].date}` : '—'} loading={dataQ.isLoading} />
            </div>

            <SectionCard title={indicatorName || 'Wskaźnik'} subtitle="Średnia dla jednostek samorządu · SMUP"
                actions={<CsvExport filename="smup-wskaznik" headers={['Rok', 'Wartość (śr.)']} rows={series.map((s) => [s.date, s.value])} />}>
                {dataQ.isLoading ? <div className="mk-skeleton h-[300px] w-full" /> : series.length === 0 ? (
                    <p className="py-10 text-center text-sm text-mk-faint">Brak danych dla wybranego wskaźnika.</p>
                ) : (
                    <InteractiveChart data={series} xKey="date" height={300} valueFormatter={(v) => formatDecimalPL(v, 1)}
                        series={[{ key: 'value', name: 'Średnia JST', color: '#2563EB', type: 'area', strokeWidth: 2.5 }]} />
                )}
                <p className="mt-3 text-xs text-mk-faint">
                    Wartość uśredniona po jednostkach samorządu (gminy/powiaty) w próbie danych. Dane pierwotne SMUP są w podziale TERYT — mapa regionalna (choropleta) planowana jako rozszerzenie.
                </p>
            </SectionCard>
        </div>
    );
}
