// Pełny obraz PPI (ceny produkcji sprzedanej przemysłu) — GUS DBW, zmienna 314, przekrój 657.
// 33 pozycje PKD 2007: OGÓŁEM + 4 sekcje (B/C/D/E) + 28 działów, każda r/r (prez 5) i m/m (prez 2).
// Struktura kategoria→subkategoria jak w CPI: sekcje = kategorie, działy = subkategorie pod sekcją.
// Miesięcznie, ostatnie ~3,5 roku (przekrój 657 zwraca wszystkie 33 pozycje w 1 zapytaniu/okres).
import { NextRequest, NextResponse } from 'next/server';
import { withCache } from '@/lib/server-cache';
import { dbwFetchMany, pick, monthOkres, type DbwRow, type DbwPeriod } from '@/lib/dbw-fetch';

export const maxDuration = 120;
const mm = (m: number) => String(m).padStart(2, '0');

const OGOLEM = 6966261;
interface Sec { code: string; poz: number; name: string }
interface Div { code: string; poz: number; name: string; sec: string }

const SECTIONS: Sec[] = [
    { code: 'B', poz: 6971717, name: 'Górnictwo i wydobywanie' },
    { code: 'C', poz: 6971743, name: 'Przetwórstwo przemysłowe' },
    { code: 'D', poz: 6971723, name: 'Wytwarzanie energii (prąd, gaz, para)' },
    { code: 'E', poz: 6971709, name: 'Woda, ścieki i odpady' },
];

const DIVISIONS: Div[] = [
    // B — Górnictwo
    { code: '05', poz: 6662551, name: 'Węgiel kamienny i brunatny', sec: 'B' },
    { code: '06', poz: 6662537, name: 'Ropa naftowa i gaz ziemny', sec: 'B' },
    { code: '07', poz: 6662523, name: 'Rudy metali', sec: 'B' },
    { code: '08', poz: 6662505, name: 'Pozostałe górnictwo (kamień, żwir, sól)', sec: 'B' },
    // C — Przetwórstwo
    { code: '10', poz: 6664574, name: 'Artykuły spożywcze', sec: 'C' },
    { code: '11', poz: 6663537, name: 'Napoje', sec: 'C' },
    { code: '12', poz: 6663504, name: 'Wyroby tytoniowe', sec: 'C' },
    { code: '13', poz: 6662475, name: 'Wyroby tekstylne', sec: 'C' },
    { code: '14', poz: 6662412, name: 'Odzież', sec: 'C' },
    { code: '15', poz: 6664487, name: 'Skóry i wyroby skórzane', sec: 'C' },
    { code: '16', poz: 6664478, name: 'Wyroby z drewna i korka', sec: 'C' },
    { code: '17', poz: 6664463, name: 'Papier i wyroby z papieru', sec: 'C' },
    { code: '18', poz: 6663400, name: 'Poligrafia i reprodukcja nośników', sec: 'C' },
    { code: '19', poz: 6663373, name: 'Koks i produkty rafinacji ropy', sec: 'C' },
    { code: '20', poz: 6663359, name: 'Chemikalia i wyroby chemiczne', sec: 'C' },
    { code: '21', poz: 6662258, name: 'Podstawowe subst. farmaceutyczne i leki', sec: 'C' },
    { code: '22', poz: 6662244, name: 'Wyroby z gumy i tworzyw sztucznych', sec: 'C' },
    { code: '23', poz: 6662214, name: 'Wyroby z pozostałych mineralnych surowców', sec: 'C' },
    { code: '24', poz: 6663299, name: 'Metale', sec: 'C' },
    { code: '25', poz: 6662107, name: 'Metalowe wyroby gotowe', sec: 'C' },
    { code: '26', poz: 6664357, name: 'Komputery, wyroby elektroniczne i optyczne', sec: 'C' },
    { code: '27', poz: 6664321, name: 'Urządzenia elektryczne', sec: 'C' },
    { code: '28', poz: 6663108, name: 'Maszyny i urządzenia', sec: 'C' },
    { code: '29', poz: 6661988, name: 'Pojazdy samochodowe, przyczepy i naczepy', sec: 'C' },
    { code: '30', poz: 6661956, name: 'Pozostały sprzęt transportowy', sec: 'C' },
    { code: '31', poz: 6664088, name: 'Meble', sec: 'C' },
    // E — Woda/odpady
    { code: '36', poz: 6661843, name: 'Pobór, uzdatnianie i dostarczanie wody', sec: 'E' },
    { code: '38', poz: 6661827, name: 'Zbieranie i przetwarzanie odpadów; odzysk', sec: 'E' },
];

interface Pt { date: string; yoy: number | null; mom: number | null }

export async function GET(request: NextRequest) {
    const now = parseInt(new URL(request.url).searchParams.get('year') || String(new Date().getFullYear()));
    const force = new URL(request.url).searchParams.get('refresh') === '1'; // cron warm → wymuś refetch (pomiń cache)

    try {
        const result = await withCache(
            'dbw',
            `gus_ppi_full_${now}_v2`,
            async () => {
                // PPI w DBW jest MIESIĘCZNY (brak okresu kwartalnego), a 10 lat monthly = 120 wywołań > limit.
                // Dlatego jak przy CPI: próbkowanie kwartalne (mies. 3/6/9/12) dla lat starszych + pełne
                // miesięcznie dla ostatnich 2 lat. ~55 wywołań, pełne 10 lat, wszystko GUS. Przekrój 657
                // zwraca wszystkie 33 pozycje w 1 zapytaniu/okres.
                const periods: DbwPeriod[] = [];
                for (let y = now - 10; y <= now; y++) {
                    const months = y >= now - 1 ? [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] : [3, 6, 9, 12];
                    for (const m of months) periods.push({ rok: y, okres: monthOkres(m), przekroj: 657, key: `${y}-${mm(m)}` });
                }
                const rowsMap = await dbwFetchMany(314, periods, 3);

                const monthsWithData: { key: string; rows: DbwRow[] }[] = [];
                for (const p of periods) {
                    const rows = rowsMap.get(p.key);
                    if (rows && pick(rows, OGOLEM, 5) != null) monthsWithData.push({ key: p.key, rows });
                }
                const latest = monthsWithData.length ? monthsWithData[monthsWithData.length - 1] : null;

                const histOf = (poz: number): Pt[] => monthsWithData
                    .map((m) => ({ date: m.key, yoy: pick(m.rows, poz, 5), mom: pick(m.rows, poz, 2) }))
                    .filter((p) => p.yoy != null || p.mom != null);
                const curYoY = (poz: number) => (latest ? pick(latest.rows, poz, 5) : null);
                const curMoM = (poz: number) => (latest ? pick(latest.rows, poz, 2) : null);

                const headline = histOf(OGOLEM);

                const divisions = DIVISIONS.map((d) => ({
                    code: d.code, name: d.name, sec: d.sec,
                    yoy: curYoY(d.poz), mom: curMoM(d.poz), history: histOf(d.poz),
                }));

                const sections = SECTIONS.map((s) => ({
                    code: s.code, name: s.name,
                    yoy: curYoY(s.poz), mom: curMoM(s.poz), history: histOf(s.poz),
                    divisions: divisions.filter((d) => d.sec === s.code).sort((a, b) => (b.yoy ?? -999) - (a.yoy ?? -999)),
                }));

                return {
                    headline,
                    sections,
                    dataDate: latest?.key ?? '',
                    source: 'GUS DBW — ceny produkcji sprzedanej przemysłu (zmienna 314, przekrój 657, PKD 2007)',
                };
            },
            'GUS DBW PPI full',
            force ? -1 : 48 * 3600 * 1000, // user czyta 48h cache; cron ?refresh=1 odświeża codziennie
        );
        return NextResponse.json(result);
    } catch (error) {
        console.error('GUS PPI full error:', error);
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}
