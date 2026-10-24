// Japonia — inflacja CPI. Jedna konfiguracja serii dla trasy API, strony, crona i kontroli świeżości
// (w PL ta sama seria bywała opisana w trzech miejscach i rozjeżdżała się — tu nie ma takiej możliwości).
// Moduł bez I/O — importowany też przez klienta. Pobieranie: `cpi-server.ts`.
import { formatDataPeriod, formatDecimalPL } from '@/lib/formatters';
import type { DashboardPoint, DashboardQuery } from './stat-dashboard';

export type JpCpiId = 'headline' | 'core' | 'coreCore' | 'tokyo';

/** Cel BOJ: 2% r/r dla CPI ogółem. */
export const BOJ_TARGET = 2;

/** Historia od 1990 r.: koniec bańki, deflacja, abenomika i inflacja po 2022 r. */
export const JP_CPI_FROM = '199001';

// Od 21.08.2026 (dane za lipiec 2026) oficjalna jest baza 2025; baza 2020 jest liczona tylko do 12.2026.
// Walidacja nazwy pilnuje, żeby nigdy nie pokazać starej bazy ani innej miary.
const BASE = '2025年基準';
const YOY = '前年同月比';

export interface JpCpiSeriesConfig {
    id: JpCpiId;
    label: string;
    /** Krótka etykieta na wykres / kafel. */
    short: string;
    /** Jedno zdanie dla czytelnika: co mierzy i po co. */
    hint: string;
    color: string;
    query: DashboardQuery;
}

export const JP_CPI_SERIES: JpCpiSeriesConfig[] = [
    {
        id: 'headline', label: 'CPI ogółem', short: 'Ogółem', color: '#2563EB',
        hint: 'Cały koszyk konsumenta — tej miary dotyczy cel BOJ 2%.',
        query: { indicator: '0703010601010030000', rank: 2, region: '00000', from: JP_CPI_FROM, mustInclude: [YOY, '（総合）', BASE] },
    },
    {
        id: 'core', label: 'CPI bazowa', short: 'Bazowa', color: '#DC2626',
        hint: 'Bez świeżej żywności — „core CPI”, główna miara w prognozach BOJ.',
        query: { indicator: '0703010601010030010', rank: 2, region: '00000', from: JP_CPI_FROM, mustInclude: [YOY, '（生鮮食品を除く総合）', BASE] },
    },
    {
        id: 'coreCore', label: 'Bazowa bez energii', short: 'Bez energii', color: '#7C3AED',
        hint: 'Bez świeżej żywności i energii — najlepiej pokazuje presję popytu.',
        query: { indicator: '0703010601010030040', rank: 2, region: '00000', from: JP_CPI_FROM, mustInclude: [YOY, '（生鮮食品及びエネルギーを除く総合）', BASE] },
    },
    {
        id: 'tokyo', label: 'Tokio', short: 'Tokio', color: '#0891B2',
        hint: '23 dzielnice Tokio — odczyt wstępny wychodzi pod koniec miesiąca, ok. 3 tygodnie przed danymi krajowymi.',
        query: { indicator: '0703010601010030000', rank: 4, region: '13100', from: JP_CPI_FROM, mustInclude: [YOY, '（総合）', BASE] },
    },
];

export const JP_CPI_SOURCE = 'Statistics Bureau of Japan · Statistics Dashboard';

export interface JpCpiPayload {
    series: Record<JpCpiId, DashboardPoint[]>;
    source: string;
    /** Kiedy dane pobrano u źródła (ISO). */
    fetchedAt: string;
}

/** Pusta odpowiedź (wszystkie serie bez punktów) nie nadpisuje dobrego wpisu cache. */
export function jpCpiIsEmpty(p: JpCpiPayload | null | undefined): boolean {
    return !p?.series || Object.values(p.series).every((points) => !points?.length);
}

export function lastPoint(points: DashboardPoint[] | undefined): DashboardPoint | null {
    return points?.length ? points[points.length - 1] : null;
}

/** Zmiana r/r względem poprzedniego miesiąca w p.p. (null, gdy brak ciągłości). */
export function changePp(points: DashboardPoint[] | undefined): number | null {
    if (!points || points.length < 2) return null;
    const a = points[points.length - 2];
    const b = points[points.length - 1];
    return Math.round((b.value - a.value) * 10) / 10;
}

/** Wiersze wykresu: jedna data, wszystkie serie (brakujące = undefined, linia się nie łączy na siłę). */
export function chartRows(series: JpCpiPayload['series']): Array<{ date: string } & Partial<Record<JpCpiId, number>>> {
    const byDate = new Map<string, { date: string } & Partial<Record<JpCpiId, number>>>();
    for (const cfg of JP_CPI_SERIES) {
        for (const p of series[cfg.id] ?? []) {
            const row = byDate.get(p.date) ?? { date: p.date };
            row[cfg.id] = p.value;
            byDate.set(p.date, row);
        }
    }
    return [...byDate.values()].sort((a, b) => a.date.localeCompare(b.date));
}

/** Do metadanych strony: „2,1% (wrzesień 2026)”. */
export function jpCpiSummary(p: JpCpiPayload | null): string | null {
    const head = lastPoint(p?.series.headline);
    return head ? `${formatDecimalPL(head.value, 1)}% (${formatDataPeriod(head.date)})` : null;
}
