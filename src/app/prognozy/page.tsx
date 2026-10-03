'use client';

import { useMemo, useState } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { SectionCard } from '@/components/ui/SectionCard';
import { Segmented } from '@/components/ui/Segmented';
import { Slider } from '@/components/ui/Slider';
import { useWibor } from '@/lib/hooks';
import { calculateMonthlyPayment, type MortgageParams } from '@/lib/calculations/mortgage';
import { formatDecimalPL, formatPLN } from '@/lib/formatters';
import { MobileTabs } from '@/components/sections/mobile-layout';

type Tenor = '3M' | '6M';
const TENORS: { value: Tenor; label: string }[] = [
    { value: '3M', label: 'WIBOR 3M' },
    { value: '6M', label: 'WIBOR 6M' },
];

export default function PrognozyPage() {
    const wiborQ = useWibor();
    const [principal, setPrincipal] = useState(450_000);
    const [years, setYears] = useState(25);
    const [margin, setMargin] = useState(2.0);
    const [tenor, setTenor] = useState<Tenor>('3M');

    const wibor = useMemo(
        () => wiborQ.data?.rates?.find((r) => r.tenor === tenor)?.wibor ?? null,
        [wiborQ.data, tenor],
    );

    const params: MortgageParams = { principal, years, margin, wiborTenor: tenor };
    const payment = wibor != null ? calculateMonthlyPayment(params, wibor) : null;
    const totalRate = wibor != null ? wibor + margin : null;

    return (
        <div className="mk-fade-in space-y-5">
            <PageHeader
                title="Prognozy"
                actions={
                    <div className="hidden lg:block">
                        <Segmented value={tenor} onChange={setTenor} aria-label="Tenor WIBOR" options={TENORS} />
                    </div>
                }
            />

            <SectionCard editorial titleVariant="label" title="Symulator raty kredytu" subtitle="NBP · WIBOR + marża · rata równa">
                {/* Telefon: wynik na górze (zmienia się na oczach przy przesuwaniu suwaków), pod nim tenor
                    jako rząd przełączników 44 px, potem suwaki. Desktop: suwaki, potem wynik — jak wcześniej
                    (tenor zostaje w nagłówku strony). */}
                <div className="flex flex-col gap-5">
                    <MobileTabs value={tenor} onChange={setTenor} options={TENORS} ariaLabel="Tenor WIBOR" sticky={false} className="-my-1.5" />
                    <Slider
                        label="Kwota kredytu"
                        value={principal}
                        min={100_000}
                        max={1_500_000}
                        step={10_000}
                        onChange={setPrincipal}
                        display={formatPLN(principal)}
                        valueText={`${formatDecimalPL(principal, 0)} złotych`}
                    />
                    <Slider
                        label="Okres"
                        value={years}
                        min={5}
                        max={35}
                        step={1}
                        onChange={setYears}
                        display={`${years} lat`}
                        valueText={`${years} ${years === 1 ? 'rok' : years < 5 ? 'lata' : 'lat'}`}
                    />
                    <Slider
                        label="Marża banku"
                        value={margin}
                        min={1}
                        max={4}
                        step={0.1}
                        onChange={setMargin}
                        display={`${formatDecimalPL(margin, 1)}%`}
                        valueText={`${formatDecimalPL(margin, 1)} procent`}
                    />

                    <div className="order-first rounded-xl border border-mk-border bg-mk-surface-alt px-4 py-3 lg:order-last">
                        <p className="mk-label">Rata miesięczna</p>
                        <p className="mt-1 text-3xl font-extrabold tnum text-mk-text lg:text-2xl">
                            {payment != null ? formatPLN(payment) : '—'}
                        </p>
                        <p className="mt-1 text-xs text-mk-muted">
                            oprocentowanie {totalRate != null ? `${formatDecimalPL(totalRate, 2)}%` : '—'}
                            {' '}(WIBOR {wibor != null ? formatDecimalPL(wibor, 2) : '—'}% + marża {formatDecimalPL(margin, 1)}%)
                        </p>
                    </div>
                </div>
            </SectionCard>
        </div>
    );
}
