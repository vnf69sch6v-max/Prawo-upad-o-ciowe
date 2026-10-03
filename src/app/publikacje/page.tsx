'use client';

import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
import { generateMacroCalendar, EVENT_COLORS, type MacroEvent } from '@/lib/calendar';
import { warsawDateKey } from '@/lib/news/warsaw-date';
import { useIsClient } from '@/lib/use-is-client';
import { PublicationCalendar, UpcomingEventsInline } from '@/components/ui/PublicationCalendar';
import { SectionCard } from '@/components/ui/SectionCard';
import { PageHeader } from '@/components/ui/PageHeader';

const SOURCES = [
    { name: 'GUS — CPI wstępne', note: 'ok. 13–15. dnia M+1 · dane za miesiąc M · 09:30', url: 'https://stat.gov.pl/kalendarz-roczny/' },
    { name: 'GUS — CPI flash (szybki szacunek)', note: 'ostatni dzień roboczy miesiąca M · dane za M', url: 'https://stat.gov.pl/kalendarium/' },
    { name: 'GUS — PKB (szybki szacunek)', note: 'kwartalnie · ~13–14. dnia po kwartale', url: 'https://stat.gov.pl/kalendarz-roczny/' },
    { name: 'GUS — rynek pracy, produkcja, sprzedaż', note: 'harmonogram miesięczny GUS', url: 'https://stat.gov.pl/dla-mediow/harmonogramy-publikacji-danych/' },
    { name: 'GUS — obroty handlu zagranicznego', note: 'miesięcznie · ok. 9. dnia M+1 · DBHZ', url: 'https://stat.gov.pl/obszary-tematyczne/ceny-handel/handel/' },
    { name: 'NBP — Decyzje RPP (stopy)', note: 'wg kalendarza posiedzeń RPP', url: 'https://nbp.pl/polityka-pieniezna/decyzje-rpp/' },
    { name: 'NBP — rachunek bieżący', note: 'kwartalnie · saldo transakcji z zagranicą', url: 'https://nbp.pl/home/statystyka/rachunek-biezacy/rachunek-biezacy.html' },
    { name: 'Eurostat — HICP (porównania UE)', note: 'miesięcznie · opóźnienie vs GUS · tylko benchmark UE', url: 'https://ec.europa.eu/eurostat' },
];

const MONTHS = ['styczeń', 'luty', 'marzec', 'kwiecień', 'maj', 'czerwiec', 'lipiec', 'sierpień', 'wrzesień', 'październik', 'listopad', 'grudzień'];
const WEEKDAYS_SHORT = ['nd', 'pn', 'wt', 'śr', 'cz', 'pt', 'sb'];
const TYPE_LABEL: Record<MacroEvent['type'], string> = {
    rpp: 'RPP · stopy NBP',
    cpi: 'GUS · inflacja CPI',
    gdp: 'GUS · PKB',
    employment: 'GUS · rynek pracy',
    retail: 'GUS · sprzedaż detaliczna',
    industrial: 'GUS · produkcja przemysłowa',
};

type Ym = { y: number; m: number }; // m: 0–11

/**
 * Telefon: kalendarz jako lista dni z publikacjami zamiast ściśniętej siatki 7×6 (komórki 40 px,
 * cyfry 11 px, kropki 4 px). Każdy dzień to nagłówek z datą i dniem tygodnia, pod nim pełne nazwy
 * wydarzeń z okresem danych. W bieżącym miesiącu minione dni są zwinięte za przyciskiem.
 *
 * „Dziś" i bieżący miesiąc liczymy dopiero po hydratacji (strona jest prerenderowana przy buildzie).
 */
function MonthAgenda() {
    const isClient = useIsClient();
    const todayKey = isClient ? warsawDateKey() : null;
    const current: Ym | null = todayKey ? { y: Number(todayKey.slice(0, 4)), m: Number(todayKey.slice(5, 7)) - 1 } : null;
    const [picked, setPicked] = useState<Ym | null>(null);
    const [showPast, setShowPast] = useState(false);
    const view = picked ?? current;

    const days = useMemo(() => {
        if (!view) return [];
        const prefix = `${view.y}-${String(view.m + 1).padStart(2, '0')}-`;
        const map = new Map<string, MacroEvent[]>();
        for (const e of generateMacroCalendar(view.y)) {
            if (!e.date.startsWith(prefix)) continue;
            const list = map.get(e.date);
            if (list) list.push(e); else map.set(e.date, [e]);
        }
        return [...map.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([date, events]) => ({ date, events }));
    }, [view]);

    if (!view || !todayKey || !current) {
        return (
            <div className="space-y-3" aria-busy="true">
                <div className="mk-skeleton h-11 w-full rounded-xl" />
                {Array.from({ length: 4 }, (_, i) => <div key={i} className="mk-skeleton h-16 w-full rounded-xl" />)}
            </div>
        );
    }

    const isCurrentMonth = view.y === current.y && view.m === current.m;
    const past = isCurrentMonth ? days.filter((d) => d.date < todayKey) : [];
    const shown = isCurrentMonth && !showPast ? days.filter((d) => d.date >= todayKey) : days;
    const shift = (delta: number) => {
        const idx = view.y * 12 + view.m + delta;
        setPicked({ y: Math.floor(idx / 12), m: idx % 12 });
        setShowPast(false);
    };
    const navBtn = 'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-mk-border bg-mk-surface text-mk-text-soft transition-colors [-webkit-tap-highlight-color:transparent] active:bg-mk-surface-alt';

    return (
        <div>
            <div className="flex items-center gap-2">
                <button type="button" onClick={() => shift(-1)} aria-label="Poprzedni miesiąc" className={navBtn}>
                    <ChevronLeft size={18} aria-hidden />
                </button>
                <h2 className="min-w-0 flex-1 text-center text-base font-bold capitalize text-mk-text" aria-live="polite">
                    {MONTHS[view.m]} {view.y}
                </h2>
                <button type="button" onClick={() => shift(1)} aria-label="Następny miesiąc" className={navBtn}>
                    <ChevronRight size={18} aria-hidden />
                </button>
            </div>
            {!isCurrentMonth && (
                <button
                    type="button"
                    onClick={() => { setPicked(null); setShowPast(false); }}
                    className="mx-auto mt-1 flex min-h-11 items-center px-3 text-sm font-semibold text-mk-brand"
                >
                    Wróć do bieżącego miesiąca
                </button>
            )}

            {past.length > 0 && (
                <button
                    type="button"
                    onClick={() => setShowPast((v) => !v)}
                    aria-expanded={showPast}
                    className="mt-3 flex min-h-11 w-full items-center justify-center rounded-xl border border-dashed border-mk-border text-sm font-medium text-mk-muted transition-colors active:bg-mk-surface-alt"
                >
                    {showPast ? 'Ukryj minione dni' : `Pokaż minione w tym miesiącu (${past.length})`}
                </button>
            )}

            {shown.length === 0 ? (
                <p className="mt-4 rounded-xl bg-mk-surface-alt px-4 py-6 text-center text-sm text-mk-muted">
                    {days.length === 0 ? 'Brak zaplanowanych publikacji w tym miesiącu.' : 'Do końca miesiąca nie ma już publikacji — przejdź do następnego.'}
                </p>
            ) : (
                <ol className="mt-3 space-y-2">
                    {shown.map(({ date, events }) => {
                        const d = new Date(`${date}T12:00:00Z`);
                        const isToday = date === todayKey;
                        const isPast = date < todayKey;
                        return (
                            <li
                                key={date}
                                className={`flex gap-3 rounded-xl border p-3 ${isToday ? 'border-mk-brand/50 bg-mk-brand-soft' : 'border-mk-border bg-mk-surface'} ${isPast ? 'opacity-60' : ''}`}
                            >
                                <time dateTime={date} className="flex w-11 shrink-0 flex-col items-center pt-0.5 text-center">
                                    <span className="text-[22px] font-extrabold leading-none text-mk-text tnum">{d.getUTCDate()}</span>
                                    <span className={`mt-1 text-xs font-semibold uppercase ${isToday ? 'text-mk-brand' : 'text-mk-muted'}`}>
                                        {isToday ? 'dziś' : WEEKDAYS_SHORT[d.getUTCDay()]}
                                    </span>
                                </time>
                                <ul className="min-w-0 flex-1 space-y-2.5">
                                    {events.map((e) => (
                                        <li key={`${e.type}-${e.name}`} className="flex items-start gap-2">
                                            <span className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: EVENT_COLORS[e.type] }} aria-hidden />
                                            <div className="min-w-0">
                                                <p className="text-[15px] font-semibold leading-snug text-mk-text">{e.name}</p>
                                                <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-mk-muted">
                                                    <span>{TYPE_LABEL[e.type]}</span>
                                                    {e.importance === 'high' && (
                                                        <span className="rounded bg-mk-brand/10 px-1.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-mk-brand">
                                                            kluczowe
                                                        </span>
                                                    )}
                                                </p>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </li>
                        );
                    })}
                </ol>
            )}
            <p className="mt-3 text-xs text-mk-muted">
                Data = dzień publikacji u GUS/NBP; nazwa wydarzenia podaje okres, którego dotyczą dane.
            </p>
        </div>
    );
}

export default function PublikacjePage() {
    return (
        <div className="mk-fade-in space-y-4">
            <PageHeader title="Publikacje" />

            <div className="mk-card mk-card-editorial mk-card-pad-compact md:hidden">
                <MonthAgenda />
            </div>

            <div className="mk-card mk-card-editorial mk-card-pad-compact hidden md:block">
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:items-start">
                    <PublicationCalendar compact showMonthList={false} className="lg:col-span-5" />
                    <UpcomingEventsInline count={6} className="lg:col-span-7" />
                </div>
            </div>

            <SectionCard title="Źródła i częstotliwość" titleVariant="label" editorial padded={false} className="mk-card-pad-compact [&_header]:mb-2">
                <ul className="divide-y divide-mk-border">
                    {SOURCES.map((s) => (
                        <li key={s.name}>
                            {/* Cały wiersz jest linkiem (≥56 px) — wcześniej celem był tylko napis „źródło" 24 px. */}
                            <a
                                href={s.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group -mx-2 flex min-h-14 items-center justify-between gap-3 rounded-lg px-2 py-2.5 transition-colors [-webkit-tap-highlight-color:transparent] hover:bg-mk-surface-alt active:bg-mk-surface-alt sm:min-h-0 sm:py-2"
                            >
                                <span className="min-w-0">
                                    <span className="block text-[15px] font-medium leading-snug text-mk-text sm:text-sm">{s.name}</span>
                                    <span className="mt-0.5 block text-xs text-mk-muted sm:text-[11px]">{s.note}</span>
                                </span>
                                <span className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-mk-brand group-hover:underline">
                                    <span className="hidden sm:inline">źródło</span>
                                    <ExternalLink size={14} aria-hidden />
                                    <span className="sr-only">(otwiera stronę źródła)</span>
                                </span>
                            </a>
                        </li>
                    ))}
                </ul>
            </SectionCard>
        </div>
    );
}
