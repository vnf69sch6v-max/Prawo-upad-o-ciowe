// Kalendarz publikacji makro — harmonogramy GUS/NBP (statyczne, bez fetchu).
// Daty = dzień publikacji; nazwa wydarzenia wskazuje okres referencyjny danych.

import {
    RPP_DECISIONS,
    GDP_FLASH_PUBLISH,
    cpiPreliminaryDate,
    lastBusinessDayOfMonth,
    monthNamePl,
    unemploymentDate,
    industrialDate,
    retailDate,
} from '@/lib/calendar-schedules';

export interface MacroEvent {
    date: string;           // ISO YYYY-MM-DD — dzień publikacji
    name: string;
    type: 'rpp' | 'cpi' | 'gdp' | 'employment' | 'retail' | 'industrial';
    importance: 'high' | 'medium' | 'low';
    /** Okres, którego dotyczą dane (np. „2026-07" = lipiec 2026). */
    dataPeriod?: string;
}

export function generateMacroCalendar(year: number): MacroEvent[] {
    const events: MacroEvent[] = [];

    // CPI — dwa wydania miesięcznie (GUS)
    for (let m = 1; m <= 12; m++) {
        const dataPeriod = `${year}-${String(m).padStart(2, '0')}`;
        const flashDate = lastBusinessDayOfMonth(year, m);
        events.push({
            date: flashDate,
            name: `CPI flash — dane za ${monthNamePl(m)} ${year}`,
            type: 'cpi',
            importance: 'high',
            dataPeriod,
        });
    }
    for (let publishM = 2; publishM <= 12; publishM++) {
        const dataM = publishM - 1;
        const dataYear = year;
        const dataPeriod = `${dataYear}-${String(dataM).padStart(2, '0')}`;
        events.push({
            date: cpiPreliminaryDate(year, publishM),
            name: `CPI wstępne — dane za ${monthNamePl(dataM)} ${dataYear}`,
            type: 'cpi',
            importance: 'high',
            dataPeriod,
        });
    }
    // CPI za grudzień publikowane w stycznie następnego roku
    events.push({
        date: cpiPreliminaryDate(year + 1, 1),
        name: `CPI wstępne — dane za grudzień ${year}`,
        type: 'cpi',
        importance: 'high',
        dataPeriod: `${year}-12`,
    });

    // PKB flash (GUS)
    const gdpList = GDP_FLASH_PUBLISH[year] ?? [
        { date: `${year}-02-13`, quarter: 4, dataYear: year - 1 },
        { date: `${year}-05-15`, quarter: 1, dataYear: year },
        { date: `${year}-08-13`, quarter: 2, dataYear: year },
        { date: `${year}-11-13`, quarter: 3, dataYear: year },
    ];
    for (const g of gdpList) {
        events.push({
            date: g.date,
            name: `PKB flash Q${g.quarter} ${g.dataYear}`,
            type: 'gdp',
            importance: 'high',
            dataPeriod: `${g.dataYear}-Q${g.quarter}`,
        });
    }

    // RPP (NBP) — dzień decyzji o stopach
    const rppDates = RPP_DECISIONS[year] ?? [];
    for (const date of rppDates) {
        events.push({
            date,
            name: 'Decyzja RPP (stopy procentowe)',
            type: 'rpp',
            importance: 'high',
        });
    }

    // Rynek pracy — bezrobocie rejestrowane (GUS)
    for (let publishM = 1; publishM <= 12; publishM++) {
        const dataM = publishM === 1 ? 12 : publishM - 1;
        const dataYear = publishM === 1 ? year - 1 : year;
        events.push({
            date: unemploymentDate(year, publishM),
            name: `Bezrobocie rejestrowane — dane za ${monthNamePl(dataM)} ${dataYear}`,
            type: 'employment',
            importance: 'medium',
            dataPeriod: `${dataYear}-${String(dataM).padStart(2, '0')}`,
        });
    }

    // Produkcja przemysłowa + sprzedaż detaliczna (GUS)
    for (let publishM = 2; publishM <= 12; publishM++) {
        const dataM = publishM - 1;
        const dataPeriod = `${year}-${String(dataM).padStart(2, '0')}`;
        events.push({
            date: industrialDate(year, publishM),
            name: `Produkcja przemysłowa — dane za ${monthNamePl(dataM)} ${year}`,
            type: 'industrial',
            importance: 'medium',
            dataPeriod,
        });
        events.push({
            date: retailDate(year, publishM),
            name: `Sprzedaż detaliczna — dane za ${monthNamePl(dataM)} ${year}`,
            type: 'retail',
            importance: 'medium',
            dataPeriod,
        });
    }

    return events.sort((a, b) => a.date.localeCompare(b.date));
}

/** Nadchodzące publikacje — z obsługą przejścia roku. */
export function getUpcomingEvents(count = 5): MacroEvent[] {
    const today = new Date().toISOString().slice(0, 10);
    const year = new Date().getFullYear();
    const events = [
        ...generateMacroCalendar(year),
        ...generateMacroCalendar(year + 1),
    ];
    return events.filter((e) => e.date >= today).slice(0, count);
}

export const EVENT_COLORS: Record<MacroEvent['type'], string> = {
    rpp: '#FF6B00',
    cpi: '#FBBF24',
    gdp: '#22C55E',
    employment: '#3B82F6',
    retail: '#06B6D4',
    industrial: '#A855F7',
};
