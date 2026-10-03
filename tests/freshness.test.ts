import { describe, expect, it } from 'vitest';
import {
    businessDaysBetween,
    datasetById,
    evaluateDataset,
    expectedBusinessDay,
    expectedGdpQuarter,
    expectedMonthlyByDay,
    expectedMonthlyBySchedule,
    extractCpiFull,
    extractDbwSeries,
    extractEurostat,
    extractNbpGold,
    extractNbpTable,
    extractStooq,
    formatPeriodPl,
    FRESHNESS_DATASETS,
    httpStatusFor,
    NBP_RELEASE_MINUTES,
    overallStatus,
    periodsBehind,
    pluralPl,
    previousBusinessDay,
    withRefreshParam,
    type DatasetSpec,
} from '@/lib/freshness';
import { industrialDate, retailDate } from '@/lib/calendar-schedules';

/** Chwila w czasie warszawskim (CEST +02:00 latem, CET +01:00 zimą — podawana jawnie). */
const at = (iso: string) => new Date(iso);

const spec = (id: string): DatasetSpec => {
    const s = datasetById(id);
    if (!s) throw new Error(`brak zbioru ${id}`);
    return s;
};

describe('harmonogram miesięczny GUS', () => {
    it('3.10.2026: sprzedaż detaliczna — oczekiwany sierpień (publikacja 21.09), lipiec = lag', () => {
        const now = at('2026-10-03T12:00:00+02:00');
        const retail = spec('retail');
        expect(retail.expected(now)).toBe('2026-08');
        expect(evaluateDataset(retail, '2026-07', now).status).toBe('lag');
        expect(evaluateDataset(retail, '2026-08', now).status).toBe('ok');
        expect(evaluateDataset(retail, '2026-06', now).status).toBe('stale');
    });

    it('lag tłumaczy opóźnienie źródła, stale podaje liczbę okresów', () => {
        const now = at('2026-10-03T12:00:00+02:00');
        expect(evaluateDataset(spec('wages'), '2026-07', now).note).toMatch(/BDL publikuje z opóźnieniem/);
        expect(evaluateDataset(spec('retail'), '2026-06', now).note).toMatch(/2 miesiące/);
    });

    it('dzień publikacji: przed 10:00 jeszcze M-2, po 10:00 już M-1', () => {
        const pub = retailDate(2026, 10); // 2026-10-20
        expect(pub).toBe('2026-10-20');
        expect(expectedMonthlyBySchedule(at('2026-10-19T18:00:00+02:00'), retailDate)).toBe('2026-08');
        expect(expectedMonthlyBySchedule(at('2026-10-20T09:30:00+02:00'), retailDate)).toBe('2026-08');
        expect(expectedMonthlyBySchedule(at('2026-10-20T10:30:00+02:00'), retailDate)).toBe('2026-09');
        expect(expectedMonthlyBySchedule(at('2026-10-21T08:00:00+02:00'), retailDate)).toBe('2026-09');
    });

    it('przełom roku: styczeń 2027 oczekuje listopada, po ~20.01 grudnia 2026', () => {
        expect(spec('industry').expected(at('2027-01-10T12:00:00+01:00'))).toBe('2026-11');
        expect(industrialDate(2027, 1)).toBe('2027-01-20');
        expect(spec('industry').expected(at('2027-01-20T11:00:00+01:00'))).toBe('2026-12');
        // Okresy liczone przez przełom roku: grudzień 2026 → styczeń 2027 to jeden miesiąc.
        expect(periodsBehind('2026-12', '2027-01', 'monthly')).toBe(1);
        const feb = at('2027-02-23T12:00:00+01:00'); // po publikacji 22.02 (20.02 to sobota)
        expect(spec('industry').expected(feb)).toBe('2027-01');
        expect(evaluateDataset(spec('industry'), '2026-12', feb).status).toBe('lag');
        expect(evaluateDataset(spec('industry'), '2026-11', feb).status).toBe('stale');
    });

    it('CPI w styczniu: grudzień pojawia się dopiero ~15.01 (heurystyka cpiPreliminaryDate)', () => {
        const cpi = spec('cpi');
        expect(cpi.expected(at('2027-01-14T12:00:00+01:00'))).toBe('2026-11');
        expect(cpi.expected(at('2027-01-15T10:05:00+01:00'))).toBe('2026-12');
        expect(cpi.expected(at('2026-10-03T12:00:00+02:00'))).toBe('2026-08');
    });

    it('bezrobocie: publikacja ~25. → do 26.10.2026 oczekiwany sierpień', () => {
        const u = spec('unemployment');
        expect(u.expected(at('2026-10-25T12:00:00+01:00'))).toBe('2026-08');
        expect(u.expected(at('2026-10-26T12:00:00+01:00'))).toBe('2026-09');
    });

    it('bezpiecznik maks. wieku zamienia lag na stale', () => {
        const now = at('2026-10-03T12:00:00+02:00');
        const strict: DatasetSpec = { ...spec('retail'), maxAgeDays: 30 };
        const r = evaluateDataset(strict, '2026-07', now);
        expect(r.ageDays).toBe(64); // 31.07 → 3.10
        expect(r.status).toBe('stale');
        expect(r.note).toMatch(/maksymalny wiek/);
    });

    it('brak danych albo zły format → error', () => {
        const now = at('2026-10-03T12:00:00+02:00');
        expect(evaluateDataset(spec('retail'), null, now).status).toBe('error');
        expect(evaluateDataset(spec('retail'), '2026-Q2', now).status).toBe('error');
    });
});

describe('Eurostat', () => {
    it('HICP: M-1 dopiero od 19. dnia, wcześniej M-2; tolerancja 1 okres', () => {
        expect(expectedMonthlyByDay(at('2026-10-03T12:00:00+02:00'), 19)).toBe('2026-08');
        expect(expectedMonthlyByDay(at('2026-10-18T23:00:00+02:00'), 19)).toBe('2026-08');
        expect(expectedMonthlyByDay(at('2026-10-19T08:00:00+02:00'), 19)).toBe('2026-09');
        const hicp = spec('hicp');
        const now = at('2026-10-20T12:00:00+02:00');
        expect(evaluateDataset(hicp, '2026-08', now).status).toBe('lag');
        expect(evaluateDataset(hicp, '2026-07', now).status).toBe('stale');
    });

    it('HICP w styczniu: przed 19.01 oczekiwany listopad poprzedniego roku', () => {
        expect(spec('hicp').expected(at('2027-01-05T12:00:00+01:00'))).toBe('2026-11');
    });

    it('strefa Europe/Warsaw, nie UTC: 31.10 23:30 UTC to już 1.11 w Warszawie', () => {
        // UTC dałoby październik → M-2 = sierpień; w Warszawie jest listopad → M-2 = wrzesień.
        expect(spec('hicp').expected(at('2026-10-31T23:30:00Z'))).toBe('2026-09');
    });

    it('PKB: ostatni opublikowany szybki szacunek, z przełomem roku', () => {
        expect(expectedGdpQuarter(at('2026-10-03T12:00:00+02:00'))).toBe('2026-Q2');
        expect(expectedGdpQuarter(at('2026-11-13T09:00:00+01:00'))).toBe('2026-Q2');
        expect(expectedGdpQuarter(at('2026-11-13T11:00:00+01:00'))).toBe('2026-Q3');
        expect(expectedGdpQuarter(at('2027-01-10T12:00:00+01:00'))).toBe('2026-Q3');
        const gdp = spec('gdp');
        const now = at('2026-10-03T12:00:00+02:00');
        expect(evaluateDataset(gdp, '2026-Q2', now).status).toBe('ok');
        expect(evaluateDataset(gdp, '2026-Q1', now).status).toBe('lag');
        expect(evaluateDataset(gdp, '2025-Q4', now).status).toBe('stale');
    });
});

describe('rynki — dni robocze', () => {
    it('NBP w weekend: sobota 3.10.2026 → oczekiwana tabela z piątku', () => {
        const nbp = spec('nbp-a');
        const sat = at('2026-10-03T15:00:00+02:00');
        expect(nbp.expected(sat)).toBe('2026-10-02');
        expect(evaluateDataset(nbp, '2026-10-02', sat).status).toBe('ok');
        expect(evaluateDataset(nbp, '2026-10-01', sat).status).toBe('lag');
        expect(evaluateDataset(nbp, '2026-09-30', sat).status).toBe('stale');
    });

    it('NBP przed ~12:15 oczekuje poprzedniego dnia roboczego (poniedziałek → piątek)', () => {
        expect(expectedBusinessDay(at('2026-10-05T11:00:00+02:00'), NBP_RELEASE_MINUTES)).toBe('2026-10-02');
        expect(expectedBusinessDay(at('2026-10-05T12:30:00+02:00'), NBP_RELEASE_MINUTES)).toBe('2026-10-05');
        // Poniedziałek przed publikacją: piątkowa tabela jest aktualna, czwartkowa to lag.
        const mon = at('2026-10-05T09:00:00+02:00');
        expect(evaluateDataset(spec('nbp-a'), '2026-10-02', mon).status).toBe('ok');
        expect(evaluateDataset(spec('nbp-a'), '2026-10-01', mon).status).toBe('lag');
    });

    it('święta PL nie są dniami roboczymi (11.11, Poniedziałek Wielkanocny)', () => {
        expect(previousBusinessDay('2026-11-12')).toBe('2026-11-10');
        expect(expectedBusinessDay(at('2026-11-11T14:00:00+01:00'), NBP_RELEASE_MINUTES)).toBe('2026-11-10');
        expect(previousBusinessDay('2026-04-07')).toBe('2026-04-03');
        expect(businessDaysBetween('2026-04-03', '2026-04-07')).toBe(1);
    });

    it('Yahoo: ostatnia sesja ≤1 dzień roboczy = ok, 2–3 = lag, >3 = stale', () => {
        const wig = spec('wig20');
        const sat = at('2026-10-03T12:00:00+02:00');
        expect(wig.expected(sat)).toBe('2026-10-02');
        expect(evaluateDataset(wig, '2026-10-02', sat).status).toBe('ok');
        expect(evaluateDataset(wig, '2026-10-01', sat).status).toBe('ok');
        expect(evaluateDataset(wig, '2026-09-29', sat).status).toBe('lag');
        expect(evaluateDataset(wig, '2026-09-25', sat).status).toBe('stale');
    });

    it('przełom roku dla dni roboczych: 2.01.2027 po 1.01 (święto) → 31.12.2026', () => {
        expect(previousBusinessDay('2027-01-02')).toBe('2026-12-31');
        expect(periodsBehind('2026-12-30', '2027-01-04', 'daily')).toBe(2);
    });
});

describe('ekstrakcja najnowszego okresu z odpowiedzi API', () => {
    it('CPI: pomija kwartały COICOP 1999 i puste r/r', () => {
        const json = { headline: [{ date: '2025-Q4', yoy: 3 }, { date: '2026-07', yoy: 3 }, { date: '2026-08', yoy: 3.4 }, { date: '2026-09', yoy: null }] };
        expect(extractCpiFull(json)).toBe('2026-08');
    });

    it('DBW: tylko wiersze z wartością dla danej pozycji', () => {
        const json = { series: [{ date: '2026-07', '6661586': 3.9 }, { date: '2026-08', '6661586': 3.8 }, { date: '2026-09' }] };
        expect(extractDbwSeries(json, 6661586)).toBe('2026-08');
        expect(extractDbwSeries({ error: 'x' }, 6661586)).toBeNull();
    });

    it('Eurostat, NBP, Yahoo', () => {
        expect(extractEurostat({ data: { PL: [{ date: '2026-Q1', value: 3.3 }, { date: '2026-Q2', value: 3.7 }] } }, 'quarterly')).toBe('2026-Q2');
        expect(extractNbpTable([{ effectiveDate: '2026-10-02', rates: [] }])).toBe('2026-10-02');
        expect(extractNbpGold([{ data: '2026-10-01', cena: 1 }, { data: '2026-10-02', cena: 2 }])).toBe('2026-10-02');
        expect(extractStooq({ latest: { date: '2026-10-02' }, data: [{ date: '2026-10-01' }] })).toBe('2026-10-02');
        expect(extractStooq(null)).toBeNull();
    });
});

describe('raport', () => {
    it('lag nie daje 503, stale i error dają', () => {
        expect(httpStatusFor([{ status: 'ok' }, { status: 'lag' }])).toBe(200);
        expect(httpStatusFor([{ status: 'ok' }, { status: 'stale' }])).toBe(503);
        expect(httpStatusFor([{ status: 'error' }])).toBe(503);
        expect(overallStatus([{ status: 'ok' }, { status: 'lag' }])).toBe('lag');
        expect(overallStatus([{ status: 'stale' }, { status: 'error' }, { status: 'lag' }])).toBe('error');
        expect(overallStatus([])).toBe('ok');
    });

    it('samonaprawa tylko poza GUS DBW/BDL (wspólny limit)', () => {
        for (const d of FRESHNESS_DATASETS) {
            const gus = d.kind === 'gus-dbw' || d.kind === 'gus-bdl';
            expect(d.selfHeal, d.id).toBe(!gus);
            expect(d.endpoint(new Date()), d.id).not.toMatch(/refresh=1/);
        }
        expect(withRefreshParam('/api/nbp?table=a')).toBe('/api/nbp?table=a&refresh=1');
    });

    it('endpointy DBW budowane jak w hooku (ten sam klucz cache)', () => {
        expect(spec('retail').endpoint(new Date())).toMatch(/^\/api\/dbw-series\?var=109&przekroj=849&year=\d{4}&freq=m&prez=7&poz1=33617&sub100=1&poz=6661586$/);
        expect(spec('industry').endpoint(new Date())).toMatch(/var=814&przekroj=807/);
    });

    it('polskie okresy i liczba mnoga', () => {
        expect(formatPeriodPl('2026-07')).toBe('lipiec 2026');
        expect(formatPeriodPl('2026-10-02')).toBe('2 października 2026');
        expect(formatPeriodPl('2026-Q2')).toBe('II kwartał 2026');
        expect(formatPeriodPl(null)).toBe('—');
        expect([1, 2, 5, 12, 22, 25].map((n) => pluralPl(n, 'zbiór', 'zbiory', 'zbiorów')))
            .toEqual(['zbiór', 'zbiory', 'zbiorów', 'zbiorów', 'zbiory', 'zbiorów']);
    });
});
