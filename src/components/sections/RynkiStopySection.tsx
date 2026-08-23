'use client';

import { Percent } from 'lucide-react';
import { useNBPInterestRates, useWibor, useYieldCurve } from '@/lib/hooks';
import { fmtPL } from '@/lib/series';
import { formatDecimalPL } from '@/lib/formatters';
import { KpiCard } from '@/components/ui/KpiCard';
import { InteractiveChart } from '@/components/ui/InteractiveChart';
import { SectionCard } from '@/components/ui/SectionCard';
import { CsvExport } from '@/components/ui/CsvExport';

/** Sekcja stóp procentowych na stronie Rynki — wariant editorial (mockup). */
export function RynkiStopySection() {
    const ratesQ = useNBPInterestRates();
    const wiborQ = useWibor();
    const yc = useYieldCurve();

    const findRate = (re: RegExp) => ratesQ.data?.rates?.find((r) => re.test(r.name) || re.test(r.nameEn))?.value ?? null;
    const ref = findRate(/referen/i), lom = findRate(/lombard/i), dep = findRate(/depozyt/i);
    const wibor = wiborQ.data?.rates ?? [];
    const curve = yc.curve.filter((c) => c.yield != null);

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <KpiCard label="Stopa referencyjna NBP" value={fmtPL(ref, 2)} unit="%" accent="violet" icon={Percent} loading={ratesQ.isLoading} watchId="ref-rate" />
                <KpiCard label="Stopa lombardowa" value={fmtPL(lom, 2)} unit="%" accent="rose" icon={Percent} loading={ratesQ.isLoading} />
                <KpiCard label="Stopa depozytowa" value={fmtPL(dep, 2)} unit="%" accent="cyan" icon={Percent} loading={ratesQ.isLoading} />
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <SectionCard editorial titleVariant="label" title="WIBOR — terminy" subtitle="Szacowane z ref. NBP + spread"
                    actions={<CsvExport filename="wibor" headers={['Termin', 'WIBOR', 'WIBID']} rows={wibor.map((w) => [w.tenor, w.wibor, w.wibid])} />}>
                    {wibor.length === 0 ? <div className="mk-skeleton h-[220px] w-full" /> : (
                        <InteractiveChart data={wibor.map((w) => ({ tenor: w.tenor, wibor: w.wibor }))} xKey="tenor" height={220} unit="%"
                            valueFormatter={(v) => formatDecimalPL(v, 2)} series={[{ key: 'wibor', name: 'WIBOR', color: '#2563EB', type: 'bar' }]} />
                    )}
                </SectionCard>
                <SectionCard editorial titleVariant="label" title="Krzywa rentowności obligacji" subtitle="Stooq · 2Y / 5Y / 10Y">
                    {curve.length === 0 ? (
                        <div className="flex h-[220px] flex-col items-center justify-center text-center text-sm text-mk-faint">
                            <p>Brak danych — źródło Stooq jest chwilowo niedostępne.</p>
                            <p className="mt-1 text-xs">Alternatywne źródło obligacji planowane w module Rynki.</p>
                        </div>
                    ) : (
                        <InteractiveChart data={curve.map((c) => ({ tenor: c.tenor, yield: c.yield }))} xKey="tenor" height={220} unit="%"
                            valueFormatter={(v) => formatDecimalPL(v, 2)} series={[{ key: 'yield', name: 'Rentowność', color: '#0891B2', type: 'line', strokeWidth: 3 }]} />
                    )}
                </SectionCard>
            </div>
        </div>
    );
}
