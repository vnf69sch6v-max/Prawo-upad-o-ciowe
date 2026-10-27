// Nowe mieszkania (新設住宅着工戸数). Statistics Dashboard, bez klucza.
// Komunikat Ministerstwa Ziemi z 30.09.2026: sierpień, 63 974 mieszkania, +6,1% r/r.
// Skala roku po wyrównaniu sezonowym: 753 108, −2,7% wobec lipca. Wrzesień: 30.10.
import { formatDataPeriod, formatDecimalPL, formatNumber } from '@/lib/formatters';
import { jstDateKey } from './calendar';
import type { DashboardPoint, DashboardQuery } from './stat-dashboard';

export type JpHousingId = 'count' | 'annual' | 'owner' | 'rent' | 'sale';

const TOTAL = ['新設住宅着工戸数（総戸数）'];

export interface JpHousingSeriesConfig {
    id: JpHousingId;
    query: DashboardQuery;
}

export const JP_HOUSING_SERIES: JpHousingSeriesConfig[] = [
    {
        id: 'count',
        query: {
            indicator: '0802010103000010000', rank: 2, region: '00000', from: '201801',
            mustInclude: TOTAL,
            mustExclude: ['年率', '季調', '持家', '貸家'],
            unitIncludes: ['戸'],
        },
    },
    {
        id: 'annual',
        query: {
            indicator: '0802010103000010001', rank: 2, region: '00000', from: '201801', seasonal: true,
            mustInclude: [...TOTAL, '年率換算'],
            mustExclude: ['持家', '貸家'],
            unitIncludes: ['戸'],
        },
    },
    {
        id: 'owner',
        query: {
            indicator: '0802010103010010010', rank: 2, region: '00000', from: '201801',
            mustInclude: ['新設住宅着工戸数（持家）'],
            mustExclude: ['年率', '季調', '貸家', '分譲'],
            unitIncludes: ['戸'],
        },
    },
    {
        id: 'rent',
        query: {
            indicator: '0802010103010010020', rank: 2, region: '00000', from: '201801',
            mustInclude: ['新設住宅着工戸数（貸家）'],
            mustExclude: ['年率', '季調', '持家', '分譲'],
            unitIncludes: ['戸'],
        },
    },
    {
        id: 'sale',
        query: {
            indicator: '0802010103010010030', rank: 2, region: '00000', from: '201801',
            mustInclude: ['新設住宅着工戸数（分譲住宅）'],
            mustExclude: ['年率', '季調', '持家', '貸家'],
            unitIncludes: ['戸'],
        },
    },
];

export const JP_HOUSING_SOURCE = 'Ministry of Land, Infrastructure, Transport and Tourism · Housing Starts';

export interface JpHousingPayload {
    series: Record<JpHousingId, DashboardPoint[]>;
    names: Record<JpHousingId, string>;
    source: string;
    fetchedAt: string;
}

export function jpHousingIsEmpty(p: JpHousingPayload | null | undefined): boolean {
    return !p?.series?.count?.length || !p.series.annual?.length || !p.series.owner?.length || !p.series.rent?.length || !p.series.sale?.length;
}

export function lastHousingPoint(points: DashboardPoint[] | undefined): DashboardPoint | null {
    return points?.length ? points[points.length - 1] : null;
}

function yearAgo(date: string): string | null {
    const m = date.match(/^(\d{4})-(\d{2})$/);
    return m ? `${Number(m[1]) - 1}-${m[2]}` : null;
}

function consecutive(prev: string, next: string): boolean {
    const [y, m] = prev.split('-').map(Number);
    const expected = m === 12 ? `${y + 1}-01` : `${y}-${String(m + 1).padStart(2, '0')}`;
    return next === expected;
}

/** Rok do roku z liczby mieszkań, do 0,1. */
export function housingYoy(points: DashboardPoint[] | undefined, period?: string): number | null {
    const last = period ? points?.find((p) => p.date === period) : lastHousingPoint(points);
    if (!last) return null;
    const prevDate = yearAgo(last.date);
    const prev = prevDate ? points?.find((p) => p.date === prevDate) : undefined;
    if (!prev?.value) return null;
    return Math.round(((last.value - prev.value) / Math.abs(prev.value)) * 1000) / 10;
}

/** Zmiana rocznego tempa sezonowego wobec poprzedniego miesiąca, do 0,1. */
export function housingAnnMom(points: DashboardPoint[] | undefined): number | null {
    if (!points || points.length < 2) return null;
    const prev = points[points.length - 2];
    const last = points[points.length - 1];
    if (!consecutive(prev.date, last.date) || !prev.value) return null;
    return Math.round(((last.value - prev.value) / Math.abs(prev.value)) * 1000) / 10;
}

/** Komunikat MLIT, 14:00 JST. Daty z komunikatu sierpniowego i zapowiedzi września. */
export const JP_HOUSING_RELEASES: Record<string, string> = {
    '2026-08': '2026-09-30',
    '2026-09': '2026-10-30',
};

function housingEntries(): Array<[string, string]> {
    return Object.entries(JP_HOUSING_RELEASES).sort((a, b) => a[1].localeCompare(b[1]));
}

export function housingInstant(dateJst: string): number {
    return Date.parse(`${dateJst}T14:00:00+09:00`);
}

export function nextHousingRelease(now: Date): { period: string; date: string } | null {
    const hit = housingEntries().find(([, date]) => housingInstant(date) > now.getTime());
    return hit ? { period: hit[0], date: hit[1] } : null;
}

export function expectedJpHousing(now: Date): string {
    const entries = housingEntries();
    const lastDate = entries[entries.length - 1][1];
    const fromCalendar = now.getTime() - housingInstant(lastDate) <= 40 * 86_400_000;
    if (fromCalendar) {
        let hit: string | null = null;
        for (const [period, date] of entries) if (housingInstant(date) <= now.getTime()) hit = period;
        if (hit) return hit;
    }
    const [y, m, d] = jstDateKey(now).split('-').map(Number);
    const idx = y * 12 + (m - 1) + (d >= 31 ? -1 : -2);
    return `${Math.floor(idx / 12)}-${String((idx % 12) + 1).padStart(2, '0')}`;
}

export function housingSentence(p: JpHousingPayload): string | null {
    const count = lastHousingPoint(p.series.count);
    if (!count) return null;
    const yoy = housingYoy(p.series.count);
    const annual = lastHousingPoint(p.series.annual);
    const mom = annual && annual.date === count.date ? housingAnnMom(p.series.annual) : null;
    const period = formatDataPeriod(count.date);
    const yoyBit = yoy == null
        ? ''
        : yoy === 0
            ? ', tyle samo co rok wcześniej'
            : `, o ${formatDecimalPL(Math.abs(yoy), 1)}% ${yoy > 0 ? 'więcej' : 'mniej'} niż rok wcześniej`;
    const pace = annual && annual.date === count.date
        ? ` W skali roku, po wyrównaniu sezonowym: ${formatNumber(annual.value, 0)} mieszkań${mom == null ? '' : mom === 0 ? ', bez zmian wobec poprzedniego miesiąca' : `, ${mom > 0 ? 'więcej' : 'mniej'} o ${formatDecimalPL(Math.abs(mom), 1)}% niż w poprzednim miesiącu`}.`
        : '';
    return `Dane za ${period}: rozpoczęto budowę ${formatNumber(count.value, 0)} mieszkań${yoyBit}.${pace}`;
}
