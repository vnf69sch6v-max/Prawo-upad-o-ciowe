'use client';

import { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { generateMacroCalendar, EVENT_COLORS, type MacroEvent } from '@/lib/calendar';
import { SectionCard } from './SectionCard';

const WEEKDAYS = ['Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'So', 'Nd'];
const MONTHS = ['styczeń', 'luty', 'marzec', 'kwiecień', 'maj', 'czerwiec', 'lipiec', 'sierpień', 'wrzesień', 'październik', 'listopad', 'grudzień'];
const TYPE_LABEL: Record<MacroEvent['type'], string> = {
    rpp: 'RPP (stopy)',
    cpi: 'Inflacja CPI',
    gdp: 'PKB flash',
    employment: 'Bezrobocie (GUS)',
    retail: 'Sprzedaż detaliczna',
    industrial: 'Produkcja przemysłowa',
};

type Cell = { day: number; iso: string } | null;

/**
 * Kalendarz publikacji danych makro w formie siatki miesiąca. Dane: `generateMacroCalendar`
 * (statyczne, bez fetchu). Kolor kropek koduje TYP wydarzenia (tożsamość, z legendą — dozwolone
 * użycie koloru, nie dekoracja); „kluczowe" (importance high) wyróżnione pogrubieniem + plakietką.
 *
 * Hydration-safe: bieżący miesiąc i „dziś" liczymy DOPIERO po zamontowaniu (new Date() różni się
 * server/client), do tego czasu render skeletonu — inaczej React zgłosi mismatch.
 */
export function PublicationCalendar({ className = '' }: { className?: string }) {
    const [view, setView] = useState<{ y: number; m: number } | null>(null); // m: 0–11
    const [todayISO, setTodayISO] = useState<string | null>(null);

    useEffect(() => {
        const now = new Date();
        setView({ y: now.getFullYear(), m: now.getMonth() });
        setTodayISO(now.toISOString().slice(0, 10));
    }, []);

    // Wydarzenia widocznego miesiąca, pogrupowane po dacie.
    const byDate = useMemo(() => {
        const map = new Map<string, MacroEvent[]>();
        if (!view) return map;
        for (const e of generateMacroCalendar(view.y)) {
            const [ey, em] = e.date.split('-').map(Number);
            if (ey !== view.y || em !== view.m + 1) continue;
            const g = map.get(e.date);
            if (g) g.push(e); else map.set(e.date, [e]);
        }
        return map;
    }, [view]);

    const monthEvents = useMemo(
        () => [...byDate.values()].flat().sort((a, b) => a.date.localeCompare(b.date)),
        [byDate],
    );
    const legendTypes = useMemo(() => [...new Set(monthEvents.map((e) => e.type))], [monthEvents]);

    // Komórki siatki, tydzień od poniedziałku.
    const cells = useMemo<Cell[]>(() => {
        if (!view) return [];
        const startDow = (new Date(view.y, view.m, 1).getDay() + 6) % 7; // Pn = 0
        const daysInMonth = new Date(view.y, view.m + 1, 0).getDate();
        const arr: Cell[] = Array.from({ length: startDow }, () => null);
        for (let d = 1; d <= daysInMonth; d++) {
            arr.push({ day: d, iso: `${view.y}-${String(view.m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}` });
        }
        while (arr.length % 7 !== 0) arr.push(null);
        return arr;
    }, [view]);

    const prev = () => setView((s) => (s ? (s.m === 0 ? { y: s.y - 1, m: 11 } : { y: s.y, m: s.m - 1 }) : s));
    const next = () => setView((s) => (s ? (s.m === 11 ? { y: s.y + 1, m: 0 } : { y: s.y, m: s.m + 1 }) : s));

    return (
        <SectionCard
            className={className}
            title="Kalendarz publikacji"
            subtitle="Dzień publikacji u GUS/NBP — nazwa wydarzenia podaje okres danych"
            actions={
                view && (
                    <div className="flex items-center gap-1">
                        <button type="button" onClick={prev} aria-label="Poprzedni miesiąc" className="flex h-8 w-8 items-center justify-center rounded-lg text-mk-muted transition-colors hover:bg-mk-surface-alt hover:text-mk-text">
                            <ChevronLeft size={18} />
                        </button>
                        <span className="w-32 text-center text-sm font-semibold capitalize text-mk-text">{MONTHS[view.m]} {view.y}</span>
                        <button type="button" onClick={next} aria-label="Następny miesiąc" className="flex h-8 w-8 items-center justify-center rounded-lg text-mk-muted transition-colors hover:bg-mk-surface-alt hover:text-mk-text">
                            <ChevronRight size={18} />
                        </button>
                    </div>
                )
            }
        >
            {!view ? (
                <div className="mk-skeleton h-[320px] w-full rounded-xl" />
            ) : (
                <>
                    <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-medium text-mk-faint">
                        {WEEKDAYS.map((d) => <div key={d} className="py-1">{d}</div>)}
                    </div>
                    <div className="mt-1 grid grid-cols-7 gap-1">
                        {cells.map((c, i) => {
                            if (!c) return <div key={i} className="aspect-square" />;
                            const evs = byDate.get(c.iso) ?? [];
                            const isToday = c.iso === todayISO;
                            const hasKey = evs.some((e) => e.importance === 'high');
                            return (
                                <div
                                    key={i}
                                    title={evs.length ? evs.map((e) => e.name).join('\n') : undefined}
                                    className={`flex aspect-square flex-col items-center rounded-lg border p-1 ${evs.length ? 'border-mk-border bg-mk-surface-alt' : 'border-transparent'} ${isToday ? 'ring-2 ring-mk-primary' : ''}`}
                                >
                                    <span className={`text-xs ${hasKey ? 'font-bold text-mk-text' : evs.length ? 'text-mk-text' : 'text-mk-faint'}`}>{c.day}</span>
                                    {evs.length > 0 && (
                                        <span className="mt-auto flex flex-wrap justify-center gap-0.5 pb-0.5">
                                            {evs.slice(0, 4).map((e, j) => (
                                                <span key={j} className="h-1.5 w-1.5 rounded-full" style={{ background: EVENT_COLORS[e.type] }} />
                                            ))}
                                        </span>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {legendTypes.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 border-t border-mk-border pt-3 text-[11px] text-mk-muted">
                            {legendTypes.map((t) => (
                                <span key={t} className="inline-flex items-center gap-1.5">
                                    <span className="h-2 w-2 rounded-full" style={{ background: EVENT_COLORS[t] }} />
                                    {TYPE_LABEL[t]}
                                </span>
                            ))}
                        </div>
                    )}

                    <ul className="mt-2 divide-y divide-mk-border">
                        {monthEvents.map((e, i) => {
                            const past = todayISO != null && e.date < todayISO;
                            return (
                                <li key={i} className={`flex items-center gap-2.5 py-2 text-sm ${past ? 'opacity-45' : ''}`}>
                                    <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: EVENT_COLORS[e.type] }} />
                                    <span className="w-12 shrink-0 tabular-nums text-xs text-mk-muted">{e.date.slice(8, 10)}.{e.date.slice(5, 7)}</span>
                                    <span className="min-w-0 flex-1 truncate text-mk-text">{e.name}</span>
                                    {e.importance === 'high' && (
                                        <span className="shrink-0 rounded bg-mk-primary/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-mk-primary">kluczowe</span>
                                    )}
                                </li>
                            );
                        })}
                        {monthEvents.length === 0 && (
                            <li className="py-3 text-sm text-mk-muted">Brak zaplanowanych publikacji w tym miesiącu.</li>
                        )}
                    </ul>
                </>
            )}
        </SectionCard>
    );
}
