// Bilans płatniczy Japonii (国際収支). Statistics Dashboard, bez klucza.
// Liczby z komunikatu wstępnego Ministerstwa Finansów, 8.10.2026, 8:50 JST:
// obroty bieżące 4兆0,620億円 nadwyżki, handel towarami ▲6,877億円 deficytu.
// Jednostka źródła to 億円 (100 mln jenów) = 0,1 mld jenów. To saldo bilansu płatniczego,
// ta sama tabela co obroty bieżące — nie statystyka celna.
import { formatDataPeriod, formatDecimalPL, formatNumber } from '@/lib/formatters';
import { jstDateKey } from './calendar';
import type { DashboardPoint, DashboardQuery } from './stat-dashboard';

export type JpTradeId = 'current' | 'trade';

export interface JpTradeSeriesConfig {
    id: JpTradeId;
    label: string;
    short: string;
    hint: string;
    color: string;
    dashed?: boolean;
    query: DashboardQuery;
}

export const JP_TRADE_SERIES: JpTradeSeriesConfig[] = [
    {
        id: 'current', label: 'Obroty bieżące', short: 'Obroty bieżące', color: '#DC2626',
        hint: 'Suma towarów, usług i dochodów. Pierwsza linia komunikatu Ministerstwa Finansów.',
        query: {
            indicator: '1601010100000010000', rank: 2, region: '00000', from: '201801',
            mustInclude: ['経常収支'],
            mustExclude: ['米ドル', '比率', '季節調整値'],
            unitIncludes: ['億円'],
        },
    },
    {
        id: 'trade', label: 'Handel towarami', short: 'Handel', color: '#64748B', dashed: true,
        hint: 'Saldo towarów w bilansie płatniczym. Ministerstwo podaje je w tej samej tabeli, obok obrotów bieżących.',
        query: {
            indicator: '1601010101000010020', rank: 2, region: '00000', from: '201801',
            mustInclude: ['貿易収支'],
            mustExclude: ['季節調整値', '米ドル'],
            unitIncludes: ['億円'],
        },
    },
];

export const JP_TRADE_SOURCE = 'Ministry of Finance · Balance of Payments';

export interface JpTradePayload {
    series: Record<JpTradeId, DashboardPoint[]>;
    names: Record<JpTradeId, string>;
    source: string;
    fetchedAt: string;
}

export function jpTradeIsEmpty(p: JpTradePayload | null | undefined): boolean {
    return !p?.series?.current?.length || !p.series.trade?.length;
}

export function lastTradePoint(points: DashboardPoint[] | undefined): DashboardPoint | null {
    return points?.length ? points[points.length - 1] : null;
}

/** 億円 → mld jenów. 1 億円 = 0,1 mld, więc −6 877 → −687,7, a 40 620 → 4 062. */
export function okuToMld(oku: number): number {
    return Math.round(oku) / 10;
}

export function formatMldYen(oku: number): string {
    const mld = okuToMld(oku);
    return Number.isInteger(mld) ? formatNumber(mld, 0) : formatDecimalPL(mld, 1);
}

/**
 * Wstępny bilans płatniczy (速報) o 8:50 JST. Daty z kalendarza Ministerstwa Finansów
 * (令和8年) i zapowiedzi na index.htm. Po marcu 2027 świeżość schodzi na heurystykę.
 */
export const JP_BOP_RELEASES: Record<string, string> = {
    '2026-01': '2026-03-09', '2026-02': '2026-04-08', '2026-03': '2026-05-13', '2026-04': '2026-06-08',
    '2026-05': '2026-07-08', '2026-06': '2026-08-10', '2026-07': '2026-09-08', '2026-08': '2026-10-08',
    '2026-09': '2026-11-10', '2026-10': '2026-12-08', '2026-11': '2027-01-12', '2026-12': '2027-02-08',
    '2027-01': '2027-03-08',
};

function bopEntries(): Array<[string, string]> {
    return Object.entries(JP_BOP_RELEASES).sort((a, b) => a[1].localeCompare(b[1]));
}

export function bopInstant(dateJst: string): number {
    return Date.parse(`${dateJst}T08:50:00+09:00`);
}

export function nextTradeRelease(now: Date): { period: string; date: string } | null {
    const hit = bopEntries().find(([, date]) => bopInstant(date) > now.getTime());
    return hit ? { period: hit[0], date: hit[1] } : null;
}

export function expectedJpTrade(now: Date): string {
    const entries = bopEntries();
    const lastDate = entries[entries.length - 1][1];
    const fromCalendar = now.getTime() - bopInstant(lastDate) <= 35 * 86_400_000;
    if (fromCalendar) {
        let hit: string | null = null;
        for (const [period, date] of entries) if (bopInstant(date) <= now.getTime()) hit = period;
        if (hit) return hit;
    }
    const [y, m, d] = jstDateKey(now).split('-').map(Number);
    const idx = y * 12 + (m - 1) + (d >= 13 ? -2 : -3);
    return `${Math.floor(idx / 12)}-${String((idx % 12) + 1).padStart(2, '0')}`;
}

function side(oku: number): 'nadwyżka' | 'deficyt' | 'saldo' {
    if (oku > 0) return 'nadwyżka';
    if (oku < 0) return 'deficyt';
    return 'saldo';
}

function verb(oku: number): 'wyniosła' | 'wyniósł' | 'wyniosło' {
    if (oku > 0) return 'wyniosła';
    if (oku < 0) return 'wyniósł';
    return 'wyniosło';
}

function capital(word: string): string {
    return word.charAt(0).toUpperCase() + word.slice(1);
}

export function tradeSentence(p: JpTradePayload): string | null {
    const current = lastTradePoint(p.series.current);
    if (!current) return null;
    const trade = lastTradePoint(p.series.trade);
    const same = trade && trade.date === current.date ? trade : null;
    const lead = `${side(current.value)} obrotów bieżących ${verb(current.value)} ${formatMldYen(Math.abs(current.value))} mld jenów`;
    const rest = same
        ? ` ${capital(side(same.value))} handlu towarami ${verb(same.value)} ${formatMldYen(Math.abs(same.value))} mld jenów.`
        : '';
    const both = Boolean(same && current.provisional && same.provisional);
    const one = !both && (current.provisional || Boolean(same?.provisional));
    const tag = both ? ' Oba odczyty są wstępne.' : one ? ' Odczyt jest wstępny.' : '';
    return `Dane za ${formatDataPeriod(current.date)}: ${lead}.${rest}${tag}`;
}
