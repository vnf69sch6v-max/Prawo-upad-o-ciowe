'use client';

import { useMemo, useState } from 'react';
import { Sparkles, Scale, TrendingUp, Target } from 'lucide-react';
import { useCPIBasket, useInflationMonthly, useGDPQuarterly, useNBPInterestRates } from '@/lib/hooks';
import { plSeries, lastOf, fmtPL } from '@/lib/series';
import { formatDecimalPL } from '@/lib/formatters';
import { taylorRule, DEFAULT_TAYLOR } from '@/lib/calculations/taylor';
import { BASKET_WEIGHTS_YEAR } from '@/lib/calculations/cpi-basket';
import { KpiCard } from '@/components/ui/KpiCard';
import { SectionCard } from '@/components/ui/SectionCard';
import { Segmented } from '@/components/ui/Segmented';
import { CsvExport } from '@/components/ui/CsvExport';
import { StaleBadge } from '@/components/ui/StaleBadge';

type Section = 'inflacja' | 'taylor';

// ═══ CPI z koszyka ═══
function InflacjaNowcast() {
    const { basket, isLoading } = useCPIBasket();
    const maxAbs = Math.max(...basket.items.map((i) => Math.abs(i.contribution ?? 0)), 0.01);

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <KpiCard label="Nowcast CPI (z koszyka)" value={fmtPL(basket.headlineNowcast)} unit="%" accent="blue" icon={Sparkles}
                    footnote={`Σ wkładów · wagi ${BASKET_WEIGHTS_YEAR}`} loading={isLoading} />
                <KpiCard label="Oficjalny CPI (CP00)" value={fmtPL(basket.official)} unit="%" accent="amber" icon={Target}
                    footnote={basket.dataDate ? `Eurostat · ${basket.dataDate}` : 'Eurostat'} loading={isLoading} />
                <KpiCard label="Pokrycie koszyka" value={fmtPL(basket.coverage, 0)} unit="%" accent="green" icon={Scale}
                    footnote="udział dywizji z danymi" loading={isLoading} />
            </div>

            <SectionCard
                title="Dekompozycja inflacji wg koszyka (COICOP)"
                subtitle="Wkład każdej dywizji do headline CPI: waga × dynamika roczna"
                actions={<div className="flex items-center gap-2"><StaleBadge date={basket.dataDate} label="HICP do" /><CsvExport filename="cpi-koszyk" headers={['Dywizja', 'Waga %', 'YoY %', 'Wkład pp']} rows={basket.items.map((i) => [i.name, i.weight, i.yoy, i.contribution])} /></div>}
            >
                {isLoading ? <div className="mk-skeleton h-[420px] w-full" /> : (
                    <div className="overflow-x-auto">
                        <table className="mk-table">
                            <thead>
                                <tr>
                                    <th>Dywizja</th>
                                    <th className="text-right">Waga</th>
                                    <th className="text-right">Dynamika r/r</th>
                                    <th style={{ width: '38%' }}>Wkład do CPI (pp)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {basket.items.map((i) => {
                                    const c = i.contribution ?? 0;
                                    const w = (Math.abs(c) / maxAbs) * 100;
                                    const pos = c >= 0;
                                    return (
                                        <tr key={i.code}>
                                            <td className="font-medium text-mk-text">{i.name}</td>
                                            <td className="text-right tnum text-mk-muted">{formatDecimalPL(i.weight, 1)}%</td>
                                            <td className="text-right tnum">{i.yoy != null ? `${formatDecimalPL(i.yoy, 1)}%` : '—'}</td>
                                            <td>
                                                <div className="flex items-center gap-2">
                                                    <div className="h-2.5 flex-1 rounded-full bg-mk-surface-alt">
                                                        <div className="h-2.5 rounded-full" style={{ width: `${w}%`, background: pos ? '#2563EB' : '#16A34A' }} />
                                                    </div>
                                                    <span className="w-14 shrink-0 text-right tnum font-semibold">{i.contribution != null ? `${pos ? '+' : ''}${formatDecimalPL(c, 2)}` : '—'}</span>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
                <div className="mt-4 rounded-xl bg-mk-surface-alt p-4 text-sm text-mk-text-soft">
                    <div className="mb-1 font-semibold text-mk-text">Metoda</div>
                    Nowcast rekonstruuje inflację „od dołu": headline = Σ (waga dywizji × jej dynamika roczna). Wagi koszyka GUS ({BASKET_WEIGHTS_YEAR}, COICOP 2018;
                    aktualizowane co luty na podstawie struktury wydatków gospodarstw domowych). Dynamiki komponentów pobierane na żywo z Eurostat HICP.
                    Największe wkłady = główne motory inflacji.
                </div>
            </SectionCard>
        </div>
    );
}

// ═══ Reguła Taylora ═══
function TaylorSection() {
    const cpiQ = useInflationMonthly();
    const gdpQ = useGDPQuarterly();
    const ratesQ = useNBPInterestRates();

    const cpi = lastOf(plSeries(cpiQ.data));
    const gdp = lastOf(plSeries(gdpQ.data));
    const ref = useMemo(() => ratesQ.data?.rates?.find((r) => /referen/i.test(r.name) || /referen/i.test(r.nameEn))?.value ?? null, [ratesQ.data]);

    const t = useMemo(() => (cpi != null && gdp != null ? taylorRule(DEFAULT_TAYLOR, cpi, gdp) : null), [cpi, gdp]);
    const gap = t && ref != null ? +(ref - t.optimalRate).toFixed(2) : null;
    const loading = cpiQ.isLoading || gdpQ.isLoading || ratesQ.isLoading;

    const stance = gap == null ? '' : gap > 0.25 ? 'restrykcyjna (stopa powyżej reguły)' : gap < -0.25 ? 'akomodacyjna (stopa poniżej reguły)' : 'zbliżona do reguły';

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <KpiCard label="Stopa wg reguły Taylora" value={t ? fmtPL(t.optimalRate, 2) : '—'} unit="%" accent="violet" icon={Scale}
                    footnote="i = π + r* + α(π−π*) + β(y−y*)" loading={loading} />
                <KpiCard label="Stopa referencyjna NBP" value={fmtPL(ref, 2)} unit="%" accent="blue" icon={Target} footnote="stan bieżący" loading={loading} />
                <KpiCard label="Luka polityki pieniężnej" value={gap != null ? `${gap > 0 ? '+' : ''}${formatDecimalPL(gap, 2)}` : '—'} unit="pp" accent={gap != null && gap >= 0 ? 'green' : 'rose'} icon={TrendingUp}
                    footnote="NBP − Taylor" loading={loading} />
            </div>

            <SectionCard title="Reguła Taylora — dekompozycja" subtitle={`Parametry: r*=${DEFAULT_TAYLOR.rStar}% · π*=${DEFAULT_TAYLOR.piTarget}% · y*=${DEFAULT_TAYLOR.potentialGDP}%`}>
                {t == null ? <div className="mk-skeleton h-[160px] w-full" /> : (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                            {[
                                { l: 'Inflacja (π)', v: `${formatDecimalPL(cpi ?? 0, 1)}%` },
                                { l: 'PKB (y)', v: `${formatDecimalPL(gdp ?? 0, 1)}%` },
                                { l: 'Luka inflacyjna', v: `${t.inflationGap >= 0 ? '+' : ''}${formatDecimalPL(t.inflationGap, 1)} pp` },
                                { l: 'Luka popytowa', v: `${t.outputGap >= 0 ? '+' : ''}${formatDecimalPL(t.outputGap, 1)} pp` },
                            ].map((x) => (
                                <div key={x.l} className="rounded-xl border border-mk-border p-3">
                                    <div className="text-xs text-mk-muted">{x.l}</div>
                                    <div className="mt-1 text-lg font-bold tnum text-mk-text">{x.v}</div>
                                </div>
                            ))}
                        </div>
                        <div className="rounded-xl bg-mk-surface-alt p-4 text-sm text-mk-text-soft">
                            <span className="font-semibold text-mk-text">Interpretacja: </span>
                            polityka pieniężna jest {stance || '—'}. Reguła Taylora sugeruje stopę {fmtPL(t.optimalRate, 2)}%, a NBP utrzymuje {fmtPL(ref, 2)}%.
                        </div>
                    </div>
                )}
            </SectionCard>
        </div>
    );
}

const SECTIONS: { value: Section; label: string }[] = [
    { value: 'inflacja', label: 'Inflacja (koszyk)' },
    { value: 'taylor', label: 'Reguła Taylora' },
];

export default function PrognozyPage() {
    const [section, setSection] = useState<Section>('inflacja');
    return (
        <div className="mk-fade-in space-y-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-mk-text">Prognozy</h1>
                    <p className="mt-1 text-sm text-mk-muted">Nowcast inflacji z koszyka oraz modele polityki pieniężnej</p>
                </div>
                <Segmented value={section} onChange={setSection} options={SECTIONS} aria-label="Sekcja" />
            </div>

            {section === 'inflacja' && <InflacjaNowcast />}
            {section === 'taylor' && <TaylorSection />}
        </div>
    );
}
