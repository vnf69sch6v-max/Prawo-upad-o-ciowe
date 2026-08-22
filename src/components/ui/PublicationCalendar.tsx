'use client';

import { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { generateMacroCalendar, getUpcomingEvents, EVENT_COLORS, type MacroEvent } from '@/lib/calendar';
import { formatDate } from '@/lib/formatters';
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
 * Kompaktowy pasek nadchodzących publikacji — wyświetlany obok kalendarza.
 */
export function UpcomingEventsInline({ count = 6, className = '' }: { count?: number; className?: string }) {
    const events = useMemo(() => getUpcomingEvents(count), [count]);

    return (
        <div className={className}>
            <h3 className="mk-section-label mb-2">Nadchodzące publikacje</h3>
            <ul className="divide-y divide-mk-border rounded-lg border border-mk-border bg-mk-surface-alt/50">
                {events.map((e, i) => (
                    <li key={i} className="flex items-center gap-2 px-2.5 py-2 text-sm">
                        <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: EVENT_COLORS[e.type] }} />
                        <time dateTime={e.date} className="w-14 shrink-0 text-[11px] font-semibold tabular-nums text-mk-brand">
                            {formatDate(e.date)}
                        </time>
                        <span className="min-w-0 flex-1 truncate text-xs leading-snug text-mk-text">{e.name}</span>
                        {e.importance === 'high' && (
                            <span className="shrink-0 rounded bg-mk-brand/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-mk-brand">
                                kluczowe
                            </span>
                        )}
                    </li>
                ))}
                {events.length === 0 && (
                    <li className="px-2.5 py-3 text-xs text-mk-muted">Brak zaplanowanych publikacji.</li>
                )}
            </ul>
        </div>
    );
}

/**
 * Kalendarz publikacji danych makro w formie siatki miesiąca. Dane: `generateMacroCalendar`
 * (statyczne, bez fetchu). Kolor kropek koduje TYP wydarzenia (tożsamość, z legendą — dozwolone
 * użycie koloru, nie dekoracja); „kluczowe" (importance high) wyróżnione pogrubieniem + plakietką.
 *
 * Hydration-safe: bieżący miesiąc i „dziś" liczymy DOPIERO po zamontowaniu (new Date() różni się
 * server/client), do tego czasu render skeletonu — inaczej React zgłosi mismatch.
 */
export function PublicationCalendar({
    className = '',
    compact = false,
    showMonthList = true,
}: {
    className?: string;
    compact?: boolean;
    showMonthList?: boolean;
}) {
    const [view, setView] = useState<{ y: number; m: number } | null>(null); // m: 0–11
    const [todayISO, setTodayISO] = useState<string | null>(null);

    useEffect(() => {
        const now = new Date();
        setView({ y: now.getFullYear(), m: now.getMonth() });
        setTodayISO(now.toISOString().slice(0, 10));
    }, []);

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

    const cells = useMemo<Cell[]>(() => {
        if (!view) return [];
        const startDow = (new Date(view.y, view.m, 1).getDay() + 6) % 7;
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

    const cellGap = compact ? 'gap-px' : 'gap-1';
    const cellHeight = compact ? 'h-7' : 'aspect-square';
    const headerMb = compact ? 'mb-2' : 'mb-4';

    const inner = !view ? (
        <div className={`mk-skeleton w-full rounded-lg ${compact ? 'h-[200px]' : 'h-[320px]'}`} />
    ) : (
        <>
            <div className={`grid grid-cols-7 ${cellGap} text-center text-[10px] font-medium text-mk-faint`}>
                {WEEKDAYS.map((d) => <div key={d} className="py-0.5">{d}</div>)}
            </div>
            <div className={`mt-0.5 grid grid-cols-7 ${cellGap}`}>
                {cells.map((c, i) => {
                    if (!c) return <div key={i} className={cellHeight} />;
                    const evs = byDate.get(c.iso) ?? [];
                    const isToday = c.iso === todayISO;
                    const hasKey = evs.some((e) => e.importance === 'high');
                    return (
                        <div
                            key={i}
                            title={evs.length ? evs.map((e) => e.name).join('\n') : undefined}
                            className={`flex ${cellHeight} flex-col items-center rounded ${compact ? 'px-0.5' : 'rounded-lg border p-1'} ${
                                evs.length
                                    ? compact
                                        ? 'bg-mk-surface-alt'
                                        : 'border-mk-border bg-mk-surface-alt'
                                    : compact
                                        ? ''
                                        : 'border-transparent'
                            } ${isToday ? 'ring-1 ring-mk-brand' : ''}`}
                        >
                            <span className={`text-[11px] leading-none ${hasKey ? 'font-bold text-mk-text' : evs.length ? 'text-mk-text' : 'text-mk-faint'}`}>
                                {c.day}
                            </span>
                            {evs.length > 0 && (
                                <span className="mt-auto flex flex-wrap justify-center gap-px pb-px">
                                    {evs.slice(0, compact ? 3 : 4).map((e, j) => (
                                        <span key={j} className="h-1 w-1 rounded-full" style={{ background: EVENT_COLORS[e.type] }} />
                                    ))}
                                </span>
                            )}
                        </div>
                    );
                })}
            </div>

            {legendTypes.length > 0 && (
                <div className={`mt-2 flex flex-wrap gap-x-2.5 gap-y-0.5 border-t border-mk-border pt-2 text-[10px] text-mk-muted`}>
                    {legendTypes.map((t) => (
                        <span key={t} className="inline-flex items-center gap-1">
                            <span className="h-1.5 w-1.5 rounded-full" style={{ background: EVENT_COLORS[t] }} />
                            {TYPE_LABEL[t]}
                        </span>
                    ))}
                </div>
            )}

            {showMonthList && (
                <ul className="mt-2 divide-y divide-mk-border">
                    {monthEvents.map((e, i) => {
                        const past = todayISO != null && e.date < todayISO;
                        return (
                            <li key={i} className={`flex items-center gap-2 py-1.5 text-sm ${past ? 'opacity-45' : ''}`}>
                                <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: EVENT_COLORS[e.type] }} />
                                <span className="w-12 shrink-0 tabular-nums text-[11px] text-mk-muted">{e.date.slice(8, 10)}.{e.date.slice(5, 7)}</span>
                                <span className="min-w-0 flex-1 truncate text-xs text-mk-text">{e.name}</span>
                                {e.importance === 'high' && (
                                    <span className="shrink-0 rounded bg-mk-brand/10 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-mk-brand">kluczowe</span>
                                )}
                            </li>
                        );
                    })}
                    {monthEvents.length === 0 && (
                        <li className="py-2 text-xs text-mk-muted">Brak zaplanowanych publikacji w tym miesiącu.</li>
                    )}
                </ul>
            )}
        </>
    );

    const nav = view && (
        <div className="flex items-center gap-0.5">
            <button type="button" onClick={prev} aria-label="Poprzedni miesiąc" className="flex h-7 w-7 items-center justify-center rounded-md text-mk-muted transition-colors hover:bg-mk-surface-alt hover:text-mk-text">
                <ChevronLeft size={16} />
            </button>
            <span className="w-28 text-center text-xs font-semibold capitalize text-mk-text">{MONTHS[view.m]} {view.y}</span>
            <button type="button" onClick={next} aria-label="Następny miesiąc" className="flex h-7 w-7 items-center justify-center rounded-md text-mk-muted transition-colors hover:bg-mk-surface-alt hover:text-mk-text">
                <ChevronRight size={16} />
            </button>
        </div>
    );

    if (compact) {
        return (
            <div className={className}>
                <div className={`flex items-center justify-between gap-2 ${headerMb}`}>
                    <h3 className="mk-section-label">Kalendarz</h3>
                    {nav}
                </div>
                {inner}
            </div>
        );
    }

    return (
        <SectionCard
            className={className}
            title="Kalendarz publikacji"
            subtitle="Dzień publikacji u GUS/NBP — nazwa wydarzenia podaje okres danych"
            actions={nav}
        >
            {inner}
        </SectionCard>
    );
}
