// Semi-dynamic macro calendar — generates events from known schedules
// RPP meetings published by NBP, GUS publication dates approximated

export interface MacroEvent {
    date: string;           // ISO date YYYY-MM-DD
    name: string;
    type: 'rpp' | 'cpi' | 'gdp' | 'employment' | 'retail' | 'industrial';
    importance: 'high' | 'medium' | 'low';
}

// RPP meetings 2026 (source: nbp.pl/polityka-pieniezna/decyzje-rpp/)
const RPP_2026 = [
    '2026-01-14', '2026-02-04', '2026-03-04', '2026-04-01',
    '2026-05-06', '2026-06-03', '2026-07-01', '2026-09-02',
    '2026-10-07', '2026-11-04', '2026-12-02',
];

const MONTH_NAMES = ['sty', 'lut', 'mar', 'kwi', 'maj', 'cze', 'lip', 'sie', 'wrz', 'paź', 'lis', 'gru'];

export function generateMacroCalendar(year: number): MacroEvent[] {
    const events: MacroEvent[] = [];

    // CPI flash — ~15th of each month
    for (let m = 1; m <= 12; m++) {
        events.push({
            date: `${year}-${String(m).padStart(2, '0')}-15`,
            name: `Inflacja CPI flash (${MONTH_NAMES[m - 2] || MONTH_NAMES[11]} ${m === 1 ? year - 1 : year})`,
            type: 'cpi',
            importance: 'high',
        });
    }

    // GDP flash — quarterly (~Feb 14, May 15, Aug 14, Nov 14)
    [{ d: '02-14', q: 4, y: year - 1 }, { d: '05-15', q: 1, y: year }, { d: '08-14', q: 2, y: year }, { d: '11-14', q: 3, y: year }]
        .forEach(({ d, q, y }) => {
            events.push({
                date: `${year}-${d}`,
                name: `PKB flash Q${q} ${y}`,
                type: 'gdp',
                importance: 'high',
            });
        });

    // RPP meetings
    const rppDates = year === 2026 ? RPP_2026 : [];
    rppDates.forEach(date => {
        events.push({
            date,
            name: 'Decyzja RPP (stopy %)',
            type: 'rpp',
            importance: 'high',
        });
    });

    // Employment / unemployment — ~22nd of each month
    for (let m = 1; m <= 12; m++) {
        events.push({
            date: `${year}-${String(m).padStart(2, '0')}-22`,
            name: `Bezrobocie (${MONTH_NAMES[m - 2] || MONTH_NAMES[11]})`,
            type: 'employment',
            importance: 'medium',
        });
    }

    return events.sort((a, b) => a.date.localeCompare(b.date));
}

// Get upcoming events from today
export function getUpcomingEvents(count = 5): MacroEvent[] {
    const today = new Date().toISOString().split('T')[0];
    const year = new Date().getFullYear();
    const events = generateMacroCalendar(year);
    return events.filter(e => e.date >= today).slice(0, count);
}

// Color mapping for event types
export const EVENT_COLORS: Record<MacroEvent['type'], string> = {
    rpp: '#FF6B00',
    cpi: '#FBBF24',
    gdp: '#22C55E',
    employment: '#3B82F6',
    retail: '#06B6D4',
    industrial: '#A855F7',
};
