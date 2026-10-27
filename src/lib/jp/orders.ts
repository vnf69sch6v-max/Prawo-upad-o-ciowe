// Zamówienia maszyn, popyt prywatny bez statków i energetyki. Statistics Dashboard, bez klucza.
// Komunikat Gabinetu 15.10.2026, 8:50: sierpień, wyrównane sezonowo +5,2% m/m, bez korekty +18,6% r/r.
// Poziom sezonowy 1 069 779 mln jenów = 1 069,8 mld jenów (w komunikacie 1兆698億円).
import { formatDataPeriod, formatDecimalPL, formatNumber } from '@/lib/formatters';
import { jstDateKey } from './calendar';
import type { DashboardPoint, DashboardQuery } from './stat-dashboard';

export type JpOrdersId = 'sa' | 'yoy';

const CORE = ['機械受注額（船舶・電力を除く民需）'];

export interface JpOrdersSeriesConfig {
    id: JpOrdersId;
    query: DashboardQuery;
}

export const JP_ORDERS_SERIES: JpOrdersSeriesConfig[] = [
    {
        id: 'sa',
        query: {
            indicator: '0701030000000010010', rank: 2, region: '00000', from: '201801', seasonal: true,
            mustInclude: CORE,
            mustExclude: ['前年同月比', '前月比'],
            unitIncludes: ['百万円'],
        },
    },
    {
        id: 'yoy',
        query: {
            indicator: '0701030000000030010', rank: 2, region: '00000', from: '201801',
            mustInclude: ['（前年同月比）', ...CORE],
            mustExclude: ['季節調整値'],
            unitIncludes: ['%'],
        },
    },
];

export const JP_ORDERS_SOURCE = 'Cabinet Office · Machinery Orders';

export interface JpOrdersPayload {
    series: Record<JpOrdersId, DashboardPoint[]>;
    names: Record<JpOrdersId, string>;
    source: string;
    fetchedAt: string;
}

export function jpOrdersIsEmpty(p: JpOrdersPayload | null | undefined): boolean {
    return !p?.series?.sa?.length || !p.series.yoy?.length;
}

export function lastOrdersPoint(points: DashboardPoint[] | undefined): DashboardPoint | null {
    return points?.length ? points[points.length - 1] : null;
}

function consecutive(prev: string, next: string): boolean {
    const [y, m] = prev.split('-').map(Number);
    const expected = m === 12 ? `${y + 1}-01` : `${y}-${String(m + 1).padStart(2, '0')}`;
    return next === expected;
}

/** Zmiana poziomu wyrównanego sezonowo wobec poprzedniego miesiąca, do 0,1. */
export function ordersMom(points: DashboardPoint[] | undefined): number | null {
    if (!points || points.length < 2) return null;
    const prev = points[points.length - 2];
    const last = points[points.length - 1];
    if (!consecutive(prev.date, last.date) || !prev.value) return null;
    return Math.round(((last.value - prev.value) / Math.abs(prev.value)) * 1000) / 10;
}

/** mln jenów → mld jenów, do 0,1. 1 069 779 mln = 1 069,8 mld. */
export function ordersMld(millionYen: number): number {
    return Math.round(millionYen / 100) / 10;
}

export function formatOrdersMld(millionYen: number): string {
    const mld = ordersMld(millionYen);
    return Number.isInteger(mld) ? formatNumber(mld, 0) : formatDecimalPL(mld, 1);
}

/** Komunikat Gabinetu o 8:50 JST. Po kwietniu 2027 świeżość schodzi na heurystykę. */
export const JP_ORDERS_RELEASES: Record<string, string> = {
    '2026-06': '2026-08-19', '2026-07': '2026-09-16', '2026-08': '2026-10-15', '2026-09': '2026-11-19',
    '2026-10': '2026-12-16', '2026-11': '2027-01-18', '2026-12': '2027-02-18', '2027-01': '2027-03-18',
    '2027-02': '2027-04-14',
};

function ordersEntries(): Array<[string, string]> {
    return Object.entries(JP_ORDERS_RELEASES).sort((a, b) => a[1].localeCompare(b[1]));
}

export function ordersInstant(dateJst: string): number {
    return Date.parse(`${dateJst}T08:50:00+09:00`);
}

export function nextOrdersRelease(now: Date): { period: string; date: string } | null {
    const hit = ordersEntries().find(([, date]) => ordersInstant(date) > now.getTime());
    return hit ? { period: hit[0], date: hit[1] } : null;
}

export function expectedJpOrders(now: Date): string {
    const entries = ordersEntries();
    const lastDate = entries[entries.length - 1][1];
    const fromCalendar = now.getTime() - ordersInstant(lastDate) <= 40 * 86_400_000;
    if (fromCalendar) {
        let hit: string | null = null;
        for (const [period, date] of entries) if (ordersInstant(date) <= now.getTime()) hit = period;
        if (hit) return hit;
    }
    const [y, m, d] = jstDateKey(now).split('-').map(Number);
    const idx = y * 12 + (m - 1) + (d >= 16 ? -2 : -3);
    return `${Math.floor(idx / 12)}-${String((idx % 12) + 1).padStart(2, '0')}`;
}

export function ordersSentence(p: JpOrdersPayload): string | null {
    const sa = lastOrdersPoint(p.series.sa);
    if (!sa) return null;
    const mom = ordersMom(p.series.sa);
    const yoy = lastOrdersPoint(p.series.yoy);
    const period = formatDataPeriod(sa.date);
    const move = mom == null
        ? 'zamówienia maszyn'
        : mom === 0
            ? 'zamówienia maszyn nie zmieniły się wobec poprzedniego miesiąca'
            : `zamówienia maszyn ${mom > 0 ? 'wzrosły' : 'spadły'} o ${formatDecimalPL(Math.abs(mom), 1)}% wobec poprzedniego miesiąca`;
    const year = yoy && yoy.date === sa.date
        ? ` Rok do roku, bez korekty sezonowej: ${yoy.value > 0 ? '+' : ''}${formatDecimalPL(yoy.value, 1)}%.`
        : '';
    return `Dane za ${period}: ${move}, po wyrównaniu sezonowym.${year} To popyt prywatny bez statków i energetyki.`;
}
