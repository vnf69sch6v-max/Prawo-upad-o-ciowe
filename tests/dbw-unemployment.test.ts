// P4 (docs/specs/2026-11-13-bezrobocie-rejestrowane-dbw.md): stopa bezrobocia rejestrowanego z GUS DBW (zm. 875, przekrój 143).
// Fixture: prawdziwa odpowiedź DBW za wrzesień 2026 (pobrana 13.11.2026), przycięta do wiersza Polski + 3 innych.
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { DBW_SERIES, pickDbwPoint, type DbwDataRow } from '@/lib/gus-dbw-series';

const rows = JSON.parse(readFileSync('tests/fixtures/dbw/unemployment-875-143-2026-09.json', 'utf8')).data as DbwDataRow[];

describe('bezrobocie rejestrowane z DBW', () => {
    it('wrzesień 2026 = 5,8% (stopa wprost, bez odejmowania 100), tylko wiersz Polski', () => {
        expect(pickDbwPoint(rows, DBW_SERIES.unemployment)).toEqual({ '33617': 5.8 });
    });

    it('brak wiersza (np. październik przed komunikatem) i placeholder 0 → brak punktu, nie 0%', () => {
        expect(pickDbwPoint([], DBW_SERIES.unemployment)).toEqual({});
        const zero = rows.map((r) => (r['id-pozycja-1'] === 33617 ? { ...r, wartosc: 0 } : r));
        expect(pickDbwPoint(zero, DBW_SERIES.unemployment)).toEqual({});
    });

    it('serie indeksowe bez zmian: odchylenie od 100 po id-pozycja-2', () => {
        const idx: DbwDataRow[] = [{ 'id-pozycja-1': 33617, 'id-pozycja-2': 6661586, 'id-sposob-prezentacji-miara': 7, wartosc: 103.2 }];
        expect(pickDbwPoint(idx, DBW_SERIES.retail)).toEqual({ '6661586': 3.2 });
    });
});
