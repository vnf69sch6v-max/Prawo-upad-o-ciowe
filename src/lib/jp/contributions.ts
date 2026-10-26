// Oficjalne wkłady CPI (寄与度) z tabeli 5 miesięcznego raportu Statistics Bureau.
// To nie są różnice miar z `breakdown.ts`: wkład mówi, ile punktów procentowych dodaje sama zmiana cen grupy.
// Parser jest czysty — siatka komórek przychodzi z arkusza (src/lib/jp/contributions-xlsx.ts).
import { formatDecimalPL } from '@/lib/formatters';

export interface ContribItem {
    id: string;
    /** Nazwa po polsku. */
    label: string;
    /** Dokładna nazwa z tabeli (walidacja). */
    ja: string;
    /** Waga w dziesięciotysięcznych (10000 = cały koszyk). `null`, gdy w tabeli jest „－”. */
    weight: number | null;
    /** Zmiana cen grupy, r/r, %. */
    yoy: number;
    /** Wkład do CPI ogółem r/r, p.p. */
    contribution: number;
}

export interface ParsedContributions {
    /** YYYY-MM, miesiąc tabeli (kolumna wkładu r/r, kraj). */
    period: string;
    headline: ContribItem;
    /** 10 wielkich grup, w kolejności komunikatu. */
    groups: ContribItem[];
    goods: ContribItem;
    services: ContribItem;
    fresh: ContribItem;
    energy: ContribItem;
    rice: ContribItem;
}

export interface JpContributions extends ParsedContributions {
    source: string;
    /** Identyfikator pliku e-Stat (statInfId). */
    fileId: string;
    fetchedAt: string;
}

const GROUP_DEFS = [
    { id: 'food', ja: '食料', label: 'Żywność' },
    { id: 'housing', ja: '住居', label: 'Mieszkanie' },
    { id: 'utilities', ja: '光熱・水道', label: 'Prąd, gaz i woda' },
    { id: 'furnishings', ja: '家具・家事用品', label: 'Wyposażenie domu' },
    { id: 'clothing', ja: '被服及び履物', label: 'Odzież i obuwie' },
    { id: 'health', ja: '保健医療', label: 'Zdrowie' },
    { id: 'transport', ja: '交通・通信', label: 'Transport i łączność' },
    { id: 'education', ja: '教育', label: 'Edukacja' },
    { id: 'recreation', ja: '教養娯楽', label: 'Kultura i rozrywka' },
    { id: 'misc', ja: '諸雑費', label: 'Pozostałe' },
] as const;

/** „+0,77 p.p.”, „−0,12 p.p.”, „±0,00 p.p.” — wkłady są publikowane do setnych. */
export function formatContrib(v: number): string {
    const n = Math.round(v * 100) / 100;
    const sign = n > 0 ? '+' : n < 0 ? '−' : '±';
    return `${sign}${formatDecimalPL(Math.abs(n), 2)} p.p.`;
}

export function formatYoy(v: number): string {
    const n = Math.round(v * 10) / 10;
    return `${n < 0 ? '−' : ''}${formatDecimalPL(Math.abs(n), 1)}%`;
}

/** Link „najnowsze tabele miesięczne” ze strony Statistics Bureau (`/data/cpi/sokuhou/tsuki/index-z.html`). */
export const ESTAT_CPI_LIST_URL = 'https://www.e-stat.go.jp/stat-search/files?page=1&layout=datalist&lid=000001491870';

export function contributionFileUrl(statInfId: string): string {
    return `https://www.e-stat.go.jp/stat-search/file-download?statInfId=${statInfId}&fileKind=0`;
}

/** Pierwszy plik tabeli 5 (wkłady) na stronie najnowszego miesiąca. */
export function findContributionFileId(html: string): string | null {
    const at = html.indexOf('品目別価格指数・寄与度');
    if (at < 0) return null;
    const id = html.slice(at, at + 6000).match(/statInfId=(\d{6,})/)?.[1];
    return id ?? null;
}

function cell(grid: string[][], r: number, c: number): string {
    return (grid[r]?.[c] ?? '').replace(/\s+/g, ' ').trim();
}

function columnHas(grid: string[][], c: number, pred: (text: string) => boolean): boolean {
    for (let r = 0; r < grid.length; r++) if (pred(cell(grid, r, c))) return true;
    return false;
}

/** Pierwsza kolumna z pasującym nagłówkiem. `national` — tylko blok „全国”, nie Tokio. */
function findColumn(grid: string[][], header: (text: string) => boolean, national = false): number | null {
    let found: number | null = null;
    for (let r = 0; r < grid.length; r++) {
        const row = grid[r] ?? [];
        for (let c = 0; c < row.length; c++) {
            if (!header(cell(grid, r, c))) continue;
            if (national) {
                const isNational = columnHas(grid, c, (t) => t.includes('全国') && !t.includes('東京'));
                const isTokyo = columnHas(grid, c, (t) => t.includes('東京'));
                if (!isNational || isTokyo) continue;
            }
            if (found == null || c < found) found = c;
        }
    }
    return found;
}

function headerRow(grid: string[][], col: number, pred: (text: string) => boolean): number {
    for (let r = 0; r < grid.length; r++) if (pred(cell(grid, r, col))) return r;
    return -1;
}

function parseNum(raw: string, digits: number): number | null {
    const t = raw.trim();
    if (!t || t === '－' || t === '-' || t === '＊' || t === '*') return null;
    const n = Number(t.replace(/,/g, ''));
    if (!Number.isFinite(n)) return null;
    const p = 10 ** digits;
    return Math.round(n * p) / p;
}

function periodInColumn(grid: string[][], col: number): string | null {
    for (let r = 0; r < grid.length; r++) {
        const m = cell(grid, r, col).match(/(\d{4})年(\d{1,2})月/);
        if (!m) continue;
        const month = Number(m[2]);
        if (month >= 1 && month <= 12) return `${m[1]}-${String(month).padStart(2, '0')}`;
    }
    return null;
}

interface RawItem { name: string; weight: number | null; yoy: number; contribution: number }

/**
 * Siatka arkusza (wiersz 0 = pierwszy wiersz Excela). Bierze krajową kolumnę wkładu r/r,
 * nie kolumnę Tokio i nie wkład do zmiany m/m.
 */
export function parseContributionGrid(grid: string[][]): ParsedContributions {
    const flat = grid.flat().join('\n');
    if (!flat.includes('2025年基準')) throw new Error('tabela CPI nie jest w bazie 2025');
    if (!flat.includes('第5表')) throw new Error('to nie jest tabela 5 (wkłady)');

    const nameCol = findColumn(grid, (t) => t.includes('類・品目') && !t.includes('符号'));
    const contribCol = findColumn(grid, (t) => t.includes('寄与度') && t.includes('前年同月比'), true);
    const yoyCol = findColumn(grid, (t) => t.includes('前年同月比') && !t.includes('寄与度'), true);
    const weightCol = findColumn(grid, (t) => t.includes('ウエイト'), true);
    if (nameCol == null || contribCol == null || yoyCol == null) {
        throw new Error('arkusz nie ma krajowych kolumn wkładu r/r');
    }
    const period = periodInColumn(grid, contribCol);
    if (!period) throw new Error('brak miesiąca w kolumnie wkładu');

    const start = Math.max(
        headerRow(grid, nameCol, (t) => t.includes('類・品目')),
        headerRow(grid, contribCol, (t) => t.includes('寄与度')),
    ) + 1;

    const byName = new Map<string, RawItem>();
    for (let r = start; r < grid.length; r++) {
        const name = cell(grid, r, nameCol);
        if (!name || byName.has(name)) continue;
        const yoy = parseNum(cell(grid, r, yoyCol), 1);
        const contribution = parseNum(cell(grid, r, contribCol), 2);
        if (yoy == null || contribution == null) continue;
        const weight = weightCol == null ? null : parseNum(cell(grid, r, weightCol), 0);
        byName.set(name, { name, weight, yoy, contribution });
    }

    const take = (id: string, ja: string, label: string): ContribItem => {
        const row = byName.get(ja);
        if (!row) throw new Error(`brak pozycji „${ja}”`);
        return { id, label, ja, weight: row.weight, yoy: row.yoy, contribution: row.contribution };
    };

    const headline = take('headline', '総合', 'CPI ogółem');
    if (Math.abs(headline.contribution - headline.yoy) > 0.15) {
        throw new Error('wkład CPI ogółem nie zgadza się z jego dynamiką r/r');
    }
    return {
        period,
        headline,
        groups: GROUP_DEFS.map((d) => take(d.id, d.ja, d.label)),
        goods: take('goods', '財', 'Towary'),
        services: take('services', 'サービス', 'Usługi'),
        fresh: take('fresh', '生鮮食品', 'Świeża żywność'),
        energy: take('energy', 'エネルギー', 'Energia'),
        rice: take('rice', '米類', 'Ryż'),
    };
}

function joinLabels(items: ContribItem[]): string {
    if (items.length <= 1) return items[0]?.label.toLowerCase() ?? '';
    const head = items.slice(0, -1).map((i) => i.label.toLowerCase()).join(', ');
    return `${head} oraz ${items[items.length - 1].label.toLowerCase()}`;
}

/** Jedno–dwa zdania do hero i nad słupkami. Miesiąc jest w nagłówku sekcji, tu same liczby. */
export function contributionSentence(p: ParsedContributions): string {
    const ranked = [...p.groups].sort((a, b) => b.contribution - a.contribution);
    const top = ranked[0];
    const parts: string[] = [];
    if (top && top.contribution >= 0.1) {
        const tiedSecond = ranked.filter((g) => g !== top && g.contribution === ranked[1]?.contribution && g.contribution >= 0.1);
        if (tiedSecond.length >= 2) {
            parts.push(`Najwięcej dokłada ${top.label.toLowerCase()} (${formatContrib(top.contribution)}), potem ${joinLabels(tiedSecond)} (po ${formatContrib(tiedSecond[0].contribution)}).`);
        } else if (ranked[1] && ranked[1].contribution >= 0.1) {
            parts.push(`Najwięcej dokłada ${top.label.toLowerCase()} (${formatContrib(top.contribution)}), potem ${ranked[1].label.toLowerCase()} (${formatContrib(ranked[1].contribution)}).`);
        } else {
            parts.push(`Najwięcej dokłada ${top.label.toLowerCase()} (${formatContrib(top.contribution)}).`);
        }
    }
    const down = [...p.groups].sort((a, b) => a.contribution - b.contribution)[0];
    if (down && down.contribution <= -0.1) parts.push(`Obniża ją ${down.label.toLowerCase()} (${formatContrib(down.contribution)}).`);
    if (p.rice.contribution <= -0.1 && p.groups.find((g) => g.id === 'food')!.contribution > 0) {
        parts.push(`Sam ryż obniża inflację o ${formatContrib(Math.abs(p.rice.contribution)).replace(/^[+−±]/, '')} (ceny ryżu ${formatYoy(p.rice.yoy)} r/r), choć żywność jako całość ją podnosi.`);
    }
    parts.push(`Towary dokładają ${formatContrib(p.goods.contribution)}, usługi ${formatContrib(p.services.contribution)}`);
    return parts.join(' ');
}

export function contributionsLookEmpty(p: JpContributions | null | undefined): boolean {
    return !p || p.groups.length !== 10 || !p.period;
}
