// Klient Statistics Dashboard API (統計ダッシュボード, Statistics Bureau of Japan) — bez klucza.
// Dokumentacja: https://dashboard.e-stat.go.jp/static/api
//
// Zasady wyniesione z Polski:
//   • upstream zawsze `no-store` (Data Cache Next.js to stale-while-revalidate — patrz AGENTS.md),
//   • odpowiedź jest WALIDOWANA: kod i nazwa serii muszą się zgadzać z konfiguracją. W PL zmienna DBW 312
//     (ceny budowlane) miesiącami udawała produkcję przemysłową; tu zła seria kończy się błędem,
//     a `withCache` zostawia ostatnie dobre dane, zamiast pokazać cudze liczby,
//   • odczyt wstępny (速報) jest oznaczony (`provisional`) — nie mieszamy go po cichu z końcowym (確報).

export const DASHBOARD_DATA_URL = 'https://dashboard.e-stat.go.jp/api/1.0/Json/getData';

/** Wymagany dopisek (warunki API) — po japońsku jak w regulaminie oraz po polsku dla czytelnika. */
export const DASHBOARD_CREDIT_JA =
    'このサービスは、統計ダッシュボードのAPI機能を使用していますが、サービスの内容は国によって保証されたものではありません。';
export const DASHBOARD_CREDIT_PL =
    'Serwis korzysta z API Statistics Dashboard (Statistics Bureau of Japan), ale rząd Japonii nie gwarantuje jego treści.';

/** RegionalRank w API: 2 = cała Japonia, 3 = prefektura, 4 = gmina (np. 23 dzielnice Tokio). */
export type DashboardRank = 2 | 3 | 4;

export interface DashboardQuery {
    /** 19-cyfrowy kod serii (系列コード). */
    indicator: string;
    rank: DashboardRank;
    /** Kod regionu: „00000" = Japonia, „13100" = 23 dzielnice Tokio (特別区部). */
    region: string;
    /** Pierwszy miesiąc historii, YYYYMM. */
    from: string;
    /** Fragmenty, które MUSI zawierać nazwa serii zwrócona przez API (np. „2025年基準"). */
    mustInclude: string[];
    /** Fragmenty, których w nazwie być nie może (surowa stopa nie może być szeregiem sezonowym). */
    mustExclude?: string[];
    /** `true` = szereg wyrównany sezonowo (季調値). Domyślnie dane surowe. */
    seasonal?: boolean;
}

export interface DashboardPoint {
    /** YYYY-MM */
    date: string;
    value: number;
    /** Odczyt wstępny (速報), np. CPI Tokio z końca miesiąca, zanim przyjdą dane końcowe. */
    provisional?: true;
}

export interface DashboardSeries {
    indicator: string;
    /** Nazwa serii z API (po japońsku) — do logów i diagnostyki. */
    name: string;
    points: DashboardPoint[];
}

export function dashboardUrl(q: DashboardQuery): string {
    const p = new URLSearchParams({
        Lang: 'JP',
        IndicatorCode: q.indicator,
        Cycle: '1', // miesięcznie
        RegionalRank: String(q.rank),
        RegionCode: q.region,
        IsSeasonalAdjustment: q.seasonal ? '2' : '1', // 1 = surowe (原数値), 2 = wyrównane sezonowo
        TimeFrom: `${q.from}00`,
        MetaGetFlg: 'Y', // nazwa serii do walidacji
        SectionHeaderFlg: '2',
    });
    return `${DASHBOARD_DATA_URL}?${p.toString()}`;
}

type Obj = Record<string, unknown>;
const asObj = (v: unknown): Obj | null => (v && typeof v === 'object' && !Array.isArray(v) ? (v as Obj) : null);
const asArray = <T,>(v: T | T[] | undefined | null): T[] => (v == null ? [] : Array.isArray(v) ? v : [v]);

/** „20260900" → „2026-09". */
function monthOf(time: unknown): string | null {
    const m = typeof time === 'string' ? time.match(/^(\d{4})(\d{2})00$/) : null;
    return m && +m[2] >= 1 && +m[2] <= 12 ? `${m[1]}-${m[2]}` : null;
}

/**
 * Odpowiedź getData → punkty miesięczne. Rzuca, gdy API nie zwróciło danych, zwróciło inną serię
 * albo inny region — wtedy `withCache` zostawia poprzedni dobry wpis.
 */
export function parseDashboardData(json: unknown, q: DashboardQuery): DashboardSeries {
    const stats = asObj(asObj(json)?.GET_STATS);
    const data = asObj(stats?.STATISTICAL_DATA);
    if (!data) {
        const result = asObj(stats?.RESULT);
        const msg = typeof result?.errorMsg === 'string' ? `: ${result.errorMsg}` : '';
        throw new Error(`Statistics Dashboard: brak danych dla serii ${q.indicator}${msg}`);
    }

    const classes = asArray(asObj(data.CLASS_INF)?.CLASS_OBJ as Obj | Obj[] | undefined);
    const indicatorClass = asArray(asObj(classes.find((c) => asObj(c)?.['@id'] === 'indicator'))?.CLASS as Obj | Obj[] | undefined)[0];
    const name = typeof indicatorClass?.['@name'] === 'string' ? indicatorClass['@name'] : '';
    if (!name) throw new Error(`Statistics Dashboard: brak nazwy serii ${q.indicator} w metadanych`);
    const missing = q.mustInclude.filter((frag) => !name.includes(frag));
    if (missing.length) {
        throw new Error(`Statistics Dashboard: seria ${q.indicator} to „${name}" — brak „${missing.join('", „')}"`);
    }
    const banned = (q.mustExclude ?? []).filter((frag) => name.includes(frag));
    if (banned.length) {
        throw new Error(`Statistics Dashboard: seria ${q.indicator} to „${name}" — nie może zawierać „${banned.join('", „')}"`);
    }

    // Nazwa bezrobocia jest identyczna dla szeregu surowego i sezonowego — rozróżnia je klasa isSeasonal
    // (1 = 原数値, 2 = 季調値) i ten sam znacznik na każdym punkcie. Zły przełącznik nie może przejść po nazwie.
    const wantSeasonal = q.seasonal ? '2' : '1';
    const seasonalClass = asArray(asObj(classes.find((c) => asObj(c)?.['@id'] === 'isSeasonal'))?.CLASS as Obj | Obj[] | undefined)[0];
    const seasonalCode = typeof seasonalClass?.['@code'] === 'string' ? seasonalClass['@code'] : '';
    if (seasonalCode !== wantSeasonal) {
        throw new Error(`Statistics Dashboard: seria ${q.indicator} ma znacznik sezonowy „${seasonalCode || 'brak'}", oczekiwano „${wantSeasonal}" (${q.seasonal ? '季調値' : '原数値'})`);
    }

    const byDate = new Map<string, DashboardPoint>();
    for (const raw of asArray(asObj(data.DATA_INF)?.DATA_OBJ as Obj | Obj[] | undefined)) {
        const v = asObj(asObj(raw)?.VALUE);
        if (!v) continue;
        if (v['@indicator'] !== q.indicator || v['@regionCode'] !== q.region) {
            throw new Error(`Statistics Dashboard: oczekiwano ${q.indicator}/${q.region}, przyszło ${String(v['@indicator'])}/${String(v['@regionCode'])}`);
        }
        if (v['@isSeasonal'] !== wantSeasonal) {
            throw new Error(`Statistics Dashboard: punkt ${String(v['@time'])} serii ${q.indicator} ma @isSeasonal „${String(v['@isSeasonal'])}", oczekiwano „${wantSeasonal}"`);
        }
        const date = monthOf(v['@time']);
        const value = typeof v.$ === 'string' && v.$.trim() !== '' ? Number(v.$) : NaN;
        if (!date || !Number.isFinite(value)) continue; // „-", „***" = brak wartości
        const provisional = v['@isProvisional'] === '1';
        const prev = byDate.get(date);
        // Ten sam miesiąc jako wstępny i końcowy → wygrywa końcowy.
        if (prev && !prev.provisional && provisional) continue;
        byDate.set(date, provisional ? { date, value, provisional: true } : { date, value });
    }
    const points = [...byDate.values()].sort((a, b) => a.date.localeCompare(b.date));
    if (!points.length) throw new Error(`Statistics Dashboard: seria ${q.indicator} bez wartości`);
    return { indicator: q.indicator, name, points };
}

/** Limit na jedno zapytanie — budżet całego kompletu liczy `fetchJpCpi` (cpi-server.ts). */
export const DASHBOARD_TIMEOUT_MS = 10_000;

/** Jedna seria z API; `no-store`, limit czasu `DASHBOARD_TIMEOUT_MS`. */
export async function fetchDashboardSeries(q: DashboardQuery): Promise<DashboardSeries> {
    const res = await fetch(dashboardUrl(q), {
        cache: 'no-store',
        headers: { Accept: 'application/json' },
        signal: AbortSignal.timeout(DASHBOARD_TIMEOUT_MS),
    });
    if (!res.ok) throw new Error(`Statistics Dashboard: HTTP ${res.status} dla serii ${q.indicator}`);
    return parseDashboardData(await res.json(), q);
}
