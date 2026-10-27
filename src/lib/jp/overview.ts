// Przegląd Japonii: te same reguły co polski hero (świeżość × skala zmiany, rynek tylko przy ≥2σ),
// ale kalendarze i cel są japońskie. Czysta funkcja — `today` przychodzi z zewnątrz (po hydratacji).
import { formatDecimalPL, formatPP } from '@/lib/formatters';
import { rankHeroSignals, type HeroCandidate, type Point, type RankedSignal } from '@/lib/hero-signals';
import { JP_CPI_NATIONAL_RELEASES } from './calendar';
import { BOJ_TARGET } from './cpi';
import { JP_GDP_SECOND_RELEASES } from './gdp';
import { JP_IIP_FINAL_RELEASES } from './industry';
import { JP_LFS_RELEASES } from './labour';
import { JP_RETAIL_FINAL_RELEASES } from './retail';
import { formatMldAmount, JP_BOP_RELEASES } from './trade';
import { JP_WAGE_FINAL_RELEASES } from './wages';

const CPI_HREF = '/japonia/inflacja';
const LABOUR_HREF = '/japonia/praca';
const MARKETS_HREF = '/japonia/rynki';
const ECONOMY_HREF = '/japonia/gospodarka';

function nextAfter(releases: Record<string, string>, today: string): string | null {
    return Object.values(releases).sort().find((date) => date > today) ?? null;
}

export function jpHeroCandidates(input: {
    cpi: Point[];
    unemployment: Point[];
    usdjpy: Point[];
    jgb: Point[];
    /** Płace nominalne, już jako r/r. */
    wages?: Point[];
    /** Indeks produkcji wyrównany sezonowo. Zmiana procentowa to liczba z komunikatu. */
    industry?: Point[];
    /** Sprzedaż detaliczna, już jako r/r. */
    retail?: Point[];
    /** PKB realny, już jako zmiana wobec poprzedniego kwartału. */
    gdp?: Point[];
    /** Obroty bieżące, już w mld jenów. Zmiana to różnica salda, nie procent. */
    current?: Point[];
}): HeroCandidate[] {
    return [
        {
            id: 'jp-cpi', kind: 'cpi', label: 'Inflacja CPI', series: input.cpi,
            unit: '%', decimals: 1, deltaMode: 'pp', invert: true, weight: 1.3,
            href: CPI_HREF, target: BOJ_TARGET,
            releaseOf: (period) => JP_CPI_NATIONAL_RELEASES[period] ?? null,
            nextReleaseOf: (today) => nextAfter(JP_CPI_NATIONAL_RELEASES, today),
        },
        {
            id: 'jp-unemployment', kind: 'employment', label: 'Stopa bezrobocia', series: input.unemployment,
            unit: '%', decimals: 1, deltaMode: 'pp', invert: true, weight: 0.9,
            href: LABOUR_HREF,
            releaseOf: (period) => JP_LFS_RELEASES[period] ?? null,
            nextReleaseOf: (today) => nextAfter(JP_LFS_RELEASES, today),
        },
        {
            id: 'jp-wages', kind: 'employment', label: 'Płace nominalne', series: input.wages ?? [],
            unit: '%', decimals: 1, deltaMode: 'pp', weight: 1,
            href: LABOUR_HREF,
            releaseOf: (period) => JP_WAGE_FINAL_RELEASES[period] ?? null,
            nextReleaseOf: (today) => nextAfter(JP_WAGE_FINAL_RELEASES, today),
        },
        {
            id: 'jp-industry', kind: 'industrial', label: 'Produkcja przemysłowa', series: input.industry ?? [],
            unit: '%', decimals: 1, deltaMode: 'pct', weight: 1.1,
            href: ECONOMY_HREF,
            releaseOf: (period) => JP_IIP_FINAL_RELEASES[period] ?? null,
            nextReleaseOf: (today) => nextAfter(JP_IIP_FINAL_RELEASES, today),
        },
        {
            id: 'jp-retail', kind: 'retail', label: 'Sprzedaż detaliczna', series: input.retail ?? [],
            unit: '%', decimals: 1, deltaMode: 'pp', weight: 1,
            href: ECONOMY_HREF,
            releaseOf: (period) => JP_RETAIL_FINAL_RELEASES[period] ?? null,
            nextReleaseOf: (today) => nextAfter(JP_RETAIL_FINAL_RELEASES, today),
        },
        {
            id: 'jp-gdp', kind: 'industrial', label: 'PKB realny', series: input.gdp ?? [],
            unit: '%', decimals: 1, deltaMode: 'pp', weight: 1.2,
            href: ECONOMY_HREF,
            releaseOf: (period) => JP_GDP_SECOND_RELEASES[period] ?? null,
            nextReleaseOf: (today) => nextAfter(JP_GDP_SECOND_RELEASES, today),
        },
        {
            id: 'jp-trade', kind: 'industrial', label: 'Obroty bieżące', series: input.current ?? [],
            unit: 'mld', decimals: 1, deltaMode: 'pp', weight: 1.1,
            href: ECONOMY_HREF,
            releaseOf: (period) => JP_BOP_RELEASES[period] ?? null,
            nextReleaseOf: (today) => nextAfter(JP_BOP_RELEASES, today),
        },
        {
            id: 'jp-usdjpy', kind: 'market', label: 'USD/JPY', series: input.usdjpy,
            unit: 'jena', decimals: 2, deltaMode: 'pct', invert: true,
            href: MARKETS_HREF,
            releaseOf: (period) => (/^\d{4}-\d{2}-\d{2}$/.test(period) ? period : null),
        },
        {
            id: 'jp-jgb', kind: 'market', label: 'JGB 10Y', series: input.jgb,
            unit: '%', decimals: 3, deltaMode: 'pp', invert: true,
            href: MARKETS_HREF,
            releaseOf: (period) => (/^\d{4}-\d{2}-\d{2}$/.test(period) ? period : null),
        },
    ];
}

export function rankJpHero(input: Parameters<typeof jpHeroCandidates>[0], today: string | null): RankedSignal[] {
    return rankHeroSignals(jpHeroCandidates(input), today);
}

function ageText(days: number): string {
    if (days <= 0) return 'dziś';
    if (days === 1) return 'wczoraj';
    return `${days} dni temu`;
}

export function jpSignalHeadline(r: RankedSignal): string {
    const { candidate: c, delta, last, prev } = r;
    const target = c.target ?? BOJ_TARGET;
    if (c.kind === 'cpi') {
        const above = last > target;
        if (r.crossedTarget) return above ? 'Inflacja wraca ponad cel BOJ' : 'Inflacja schodzi do celu BOJ';
        if (delta != null && Math.abs(delta) >= 0.2) return delta > 0 ? 'Inflacja przyspiesza' : 'Inflacja hamuje';
        return above ? 'Inflacja powyżej celu BOJ' : prev != null ? 'Inflacja w pobliżu celu BOJ' : 'Inflacja CPI';
    }
    if (c.id === 'jp-usdjpy') return (delta ?? 0) > 0 ? 'Jen słabnie wobec dolara' : 'Jen umacnia się wobec dolara';
    if (c.id === 'jp-jgb') return (delta ?? 0) > 0 ? 'Rentowność JGB mocno w górę' : 'Rentowność JGB mocno w dół';
    if (c.id === 'jp-industry') {
        if (delta == null || Math.abs(delta) < 0.05) return 'Produkcja bez zmian';
        return delta < 0 ? 'Produkcja spadła' : 'Produkcja wzrosła';
    }
    if (c.id === 'jp-retail') return 'Sprzedaż detaliczna rok do roku';
    if (c.id === 'jp-wages') return 'Płace nominalne rok do roku';
    if (c.id === 'jp-gdp') return last < 0 ? 'PKB spadł wobec kwartału' : 'PKB wzrósł wobec kwartału';
    if (c.id === 'jp-trade') return last < 0 ? 'Deficyt obrotów bieżących' : last > 0 ? 'Nadwyżka obrotów bieżących' : 'Obroty bieżące bez salda';
    if (delta == null || Math.abs(delta) < 0.2) return `${c.label} — stabilnie`;
    if (c.kind === 'employment') return delta > 0 ? 'Bezrobocie rośnie' : 'Bezrobocie spada';
    return c.label;
}

function shown(v: number, decimals: number, unit: HeroCandidate['unit']): string {
    const n = formatDecimalPL(v, decimals);
    return unit === '%' ? `${n}%` : `${n} ${unit}`;
}

export function jpSignalText(r: RankedSignal): string {
    const { candidate: c, delta, last, prev } = r;
    if (c.kind === 'market') {
        const move = delta == null ? '—' : c.deltaMode === 'pp'
            ? formatPP(delta, 1)
            : `${delta > 0 ? '+' : delta < 0 ? '−' : ''}${formatDecimalPL(Math.abs(delta), 2)}%`;
        const since = r.biggestSince >= 5 ? ` Największy ruch od ${r.biggestSince} notowań.` : '';
        return `Ostatnie notowanie: ${move}.${since}`;
    }
    if (c.id === 'jp-industry') {
        const move = delta == null ? '—' : `${delta > 0 ? '+' : ''}${formatDecimalPL(delta, 1)}%`;
        return `Indeks ${formatDecimalPL(last, 1)} (baza 2020). Wobec poprzedniego miesiąca ${move}.`;
    }
    if (c.id === 'jp-gdp') {
        return `Wobec poprzedniego kwartału ${formatDecimalPL(last, 1)}%, nie w skali roku.`;
    }
    if (c.id === 'jp-trade') {
        const side = last > 0 ? 'Nadwyżka' : last < 0 ? 'Deficyt' : 'Saldo';
        const level = `${formatMldAmount(Math.abs(last))} mld jenów`;
        const move = delta == null || Math.abs(delta) < 0.05
            ? ''
            : ` Wobec poprzedniego miesiąca ${delta > 0 ? '+' : '−'}${formatMldAmount(Math.abs(delta))} mld.`;
        return `${side} ${level}.${move}`;
    }
    if (c.kind === 'cpi') {
        const target = c.target ?? BOJ_TARGET;
        const gap = last - target;
        const where = Math.abs(gap) < 0.05
            ? `Dokładnie w celu BOJ (${formatDecimalPL(target, 0)}%).`
            : `${formatDecimalPL(Math.abs(gap), 1)} p.p. ${gap > 0 ? 'powyżej' : 'poniżej'} celu BOJ (${formatDecimalPL(target, 0)}%).`;
        return prev != null ? `${where} Miesiąc wcześniej ${shown(prev, c.decimals, c.unit)}.` : where;
    }
    if (prev == null || delta == null) return `Ostatni odczyt: ${shown(last, c.decimals, c.unit)}.`;
    if (Math.abs(delta) < 0.05) return 'Bez zmian względem poprzedniego miesiąca.';
    const since = r.biggestSince >= 6 && Math.abs(delta) >= 0.2 ? ` Największa zmiana od ${r.biggestSince} mies.` : '';
    return `Stopa ${delta > 0 ? 'wzrosła' : 'spadła'} z ${shown(prev, c.decimals, c.unit)} do ${shown(last, c.decimals, c.unit)}.${since}`;
}

export function jpSignalReason(r: RankedSignal): string | null {
    if (r.candidate.kind === 'market') return 'Nietypowy ruch';
    if (r.fresh && r.ageDays != null) return `Nowy odczyt · ${ageText(r.ageDays)}`;
    if (r.crossedTarget) return 'Przebicie celu BOJ';
    if (r.biggestSince >= 6) return 'Nietypowa zmiana';
    return null;
}
