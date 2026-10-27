// PKB Japonii, kwartalne, baza 2020. Statistics Dashboard, bez klucza.
// Liczba z czołówki Gabinetu to zmiana wobec poprzedniego kwartału, nie w skali roku.
// II kwartał 2026, drugi komunikat 8.09 o 8:50: realny +0,4%, nominalny +1,3%.
import { formatDataPeriod, formatDecimalPL } from '@/lib/formatters';
import { jstDateKey } from './calendar';
import type { DashboardPoint, DashboardQuery } from './stat-dashboard';

export type JpGdpId = 'real' | 'nominal';

const BASE = ['2020年基準'];

export interface JpGdpSeriesConfig {
    id: JpGdpId;
    label: string;
    short: string;
    hint: string;
    color: string;
    dashed?: boolean;
    query: DashboardQuery;
}

export const JP_GDP_SERIES: JpGdpSeriesConfig[] = [
    {
        id: 'real', label: 'PKB realny', short: 'Realny', color: '#DC2626',
        hint: 'Zmiana wobec poprzedniego kwartału, ceny stałe, wyrównana sezonowo. To nie jest tempo w skali roku.',
        query: {
            indicator: '0705020501000040000', rank: 2, region: '00000', from: '2015-Q1', cycle: 'quarter', seasonal: true,
            mustInclude: ['（前期比）国内総生産（支出側）（実質）', ...BASE],
            mustExclude: ['年率', '名目', '2015年基準'],
        },
    },
    {
        id: 'nominal', label: 'PKB nominalny', short: 'Nominalny', color: '#64748B', dashed: true,
        hint: 'Ta sama zmiana w cenach bieżących. Na stronie Gabinetu stoi obok realnego.',
        query: {
            indicator: '0705010501000040000', rank: 2, region: '00000', from: '2015-Q1', cycle: 'quarter', seasonal: true,
            mustInclude: ['（前期比）国内総生産（支出側）（名目）', ...BASE],
            mustExclude: ['年率', '実質', '2015年基準'],
        },
    },
];

export const JP_GDP_SOURCE = 'Cabinet Office · Quarterly Estimates of GDP';

export interface JpGdpPayload {
    series: Record<JpGdpId, DashboardPoint[]>;
    names: Record<JpGdpId, string>;
    source: string;
    fetchedAt: string;
}

export function jpGdpIsEmpty(p: JpGdpPayload | null | undefined): boolean {
    return !p?.series?.real?.length || !p.series.nominal?.length;
}

export function lastGdpPoint(points: DashboardPoint[] | undefined): DashboardPoint | null {
    return points?.length ? points[points.length - 1] : null;
}

/** Drugi komunikat (2次速報), 8:50 JST. Pierwszy bywa kilka tygodni wcześniej i bywa korygowany. */
export const JP_GDP_SECOND_RELEASES: Record<string, string> = {
    '2025-Q1': '2025-06-09', '2025-Q2': '2025-09-08', '2025-Q3': '2025-12-08', '2025-Q4': '2026-03-10',
    '2026-Q1': '2026-06-08', '2026-Q2': '2026-09-08', '2026-Q3': '2026-12-08', '2026-Q4': '2027-03-09',
};

function gdpEntries(): Array<[string, string]> {
    return Object.entries(JP_GDP_SECOND_RELEASES).sort((a, b) => a[1].localeCompare(b[1]));
}

export function gdpSecondInstant(dateJst: string): number {
    return Date.parse(`${dateJst}T08:50:00+09:00`);
}

export function nextGdpRelease(now: Date): { period: string; date: string } | null {
    const hit = gdpEntries().find(([, date]) => gdpSecondInstant(date) > now.getTime());
    return hit ? { period: hit[0], date: hit[1] } : null;
}

export function expectedJpGdp(now: Date): string {
    const entries = gdpEntries();
    const lastDate = entries[entries.length - 1][1];
    const fromCalendar = now.getTime() - gdpSecondInstant(lastDate) <= 100 * 86_400_000;
    if (fromCalendar) {
        let hit: string | null = null;
        for (const [period, date] of entries) if (gdpSecondInstant(date) <= now.getTime()) hit = period;
        if (hit) return hit;
    }
    const [y, m] = jstDateKey(now).split('-').map(Number);
    const q = Math.floor((m - 1) / 3) + 1;
    const idx = y * 4 + (q - 1) - 2;
    const yy = Math.floor(idx / 4);
    const qq = (idx % 4) + 1;
    return `${yy}-Q${qq}`;
}

export function gdpSentence(p: JpGdpPayload): string | null {
    const real = lastGdpPoint(p.series.real);
    const nominal = lastGdpPoint(p.series.nominal);
    if (!real) return null;
    const period = formatDataPeriod(real.date);
    const verb = real.value < 0 ? 'spadł' : real.value > 0 ? 'wzrósł' : 'nie zmienił się';
    const move = real.value === 0 ? '' : ` o ${formatDecimalPL(Math.abs(real.value), 1)}%`;
    const nom = nominal && nominal.date === real.date ? ` Nominalny: ${formatDecimalPL(nominal.value, 1)}%.` : '';
    return `Dane za ${period}: PKB realny, wyrównany sezonowo, ${verb}${move} wobec poprzedniego kwartału.${nom}`;
}
