import { randomBytes } from 'node:crypto';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fromStored, open, seal, sealConfig, sealStatus, SealError, toStored, cacheLegacy, docLegacy } from '@/lib/data-seal';

const key = () => randomBytes(32).toString('base64');
const K1 = key();
const K2 = key();
const on = (extra: Record<string, string> = {}) => sealConfig({ DATA_ENCRYPTION_KEY: K1, ...extra });
const PATH = 'macro_data/gus_cpi_full_2026_v5';
const T = 1_792_900_000_000;
const PAYLOAD = { series: [{ date: '2026-09', yoy: 4.1 }], source: 'GUS DBW' };

beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => { });
});

describe('seal / open — AES-256-GCM', () => {
    it('round-trip zwraca tę samą treść, a bajty nie zawierają jawnego tekstu', () => {
        const blob = seal(PATH, T, PAYLOAD, on());
        expect(blob.subarray(0, 3).toString()).toBe('SV1');
        expect(blob.includes(Buffer.from('GUS DBW'))).toBe(false);
        expect(blob.includes(Buffer.from('2026-09'))).toBe(false);
        expect(open(PATH, T, blob, on())).toEqual(PAYLOAD);
    });

    it('ten sam wpis szyfruje się za każdym razem inaczej (losowy IV)', () => {
        expect(seal(PATH, T, PAYLOAD, on()).equals(seal(PATH, T, PAYLOAD, on()))).toBe(false);
    });

    it('podmiana choćby jednego bajtu szyfrogramu jest wykrywana', () => {
        const blob = seal(PATH, T, PAYLOAD, on());
        blob[blob.length - 1] ^= 0x01;
        expect(() => open(PATH, T, blob, on())).toThrow(SealError);
    });

    it('szyfrogramu nie da się przenieść do innego dokumentu', () => {
        const blob = seal(PATH, T, PAYLOAD, on());
        expect(() => open('macro_data/inny_klucz', T, blob, on())).toThrow(/podpis/);
    });

    it('podmiana jawnego updatedAt (np. „odświeżenie” starych danych) jest wykrywana', () => {
        const blob = seal(PATH, T, PAYLOAD, on());
        expect(() => open(PATH, T + 3_600_000, blob, on())).toThrow(/podpis/);
    });

    it('cudzy klucz nie odszyfruje', () => {
        const blob = seal(PATH, T, PAYLOAD, on());
        expect(() => open(PATH, T, blob, sealConfig({ DATA_ENCRYPTION_KEY: K2 }))).toThrow(/nieznany klucz/);
    });

    it('rotacja: nowy klucz + poprzedni odczytuje stare wpisy, zapisuje nowym', () => {
        const old = seal(PATH, T, PAYLOAD, on());
        const rotated = sealConfig({ DATA_ENCRYPTION_KEY: K2, DATA_ENCRYPTION_KEY_PREVIOUS: K1 });
        expect(open(PATH, T, old, rotated)).toEqual(PAYLOAD);
        const fresh = seal(PATH, T, PAYLOAD, rotated);
        expect(fresh.subarray(3, 7).equals(rotated.active!.kid)).toBe(true);
        expect(() => open(PATH, T, fresh, on())).toThrow(/nieznany klucz/);
    });

    it('kompresja: duży wpis po zaszyfrowaniu jest mniejszy niż jawny JSON (limit 1 MiB dokumentu)', () => {
        const big = { series: Array.from({ length: 5000 }, (_, i) => ({ date: `20${10 + (i % 16)}-0${1 + (i % 9)}`, value: i % 97, name: 'Ceny towarów i usług konsumpcyjnych' })) };
        const blob = seal(PATH, T, big, on());
        expect(blob.length).toBeLessThan(JSON.stringify(big).length / 3);
        expect(open(PATH, T, blob, on())).toEqual(big);
    });

    it('przyjmuje Uint8Array (Firestore Bytes), nie tylko Buffer', () => {
        const blob = seal(PATH, T, PAYLOAD, on());
        expect(open(PATH, T, new Uint8Array(blob), on())).toEqual(PAYLOAD);
    });
});

describe('konfiguracja klucza', () => {
    it('bez klucza: tryb off, zapis jawny jak dawniej', () => {
        const cfg = sealConfig({});
        expect(cfg.mode).toBe('off');
        expect(toStored(PATH, PAYLOAD, T, cacheLegacy.write, {}, cfg)).toEqual({ payload: PAYLOAD, updatedAt: T });
    });

    it('zły klucz: tryb error i zapis wstrzymany (nie piszemy jawnie, skoro miało być szyfrowanie)', () => {
        for (const bad of ['abc', randomBytes(16).toString('base64'), `${K1}!`]) {
            const cfg = sealConfig({ DATA_ENCRYPTION_KEY: bad });
            expect(cfg.mode).toBe('error');
            expect(() => toStored(PATH, PAYLOAD, T, cacheLegacy.write, {}, cfg)).toThrow(SealError);
        }
        expect(sealConfig({ DATA_ENCRYPTION_KEY_PREVIOUS: K1 }).mode).toBe('error');
    });

    it('status pokazuje tylko identyfikator klucza (skrót), nigdy klucz', () => {
        const s = sealStatus({ DATA_ENCRYPTION_KEY: K1 });
        expect(s).toMatchObject({ mode: 'on', strict: false, error: null });
        expect(s.kid).toMatch(/^[0-9a-f]{8}$/);
        expect(JSON.stringify(s)).not.toContain(K1);
    });
});

describe('toStored / fromStored — dokumenty Firestore', () => {
    it('z kluczem w dokumencie zostaje tylko szyfrogram i data', () => {
        const doc = toStored(PATH, PAYLOAD, T, cacheLegacy.write, {}, on());
        expect(Object.keys(doc).sort()).toEqual(['sealed', 'updatedAt']);
        expect(fromStored(PATH, doc, cacheLegacy.read, on())).toEqual({ value: PAYLOAD, updatedAt: T });
    });

    it('jawny wpis sprzed włączenia szyfrowania nadal się czyta (migracja bez przerwy w danych)', () => {
        expect(fromStored(PATH, { payload: PAYLOAD, updatedAt: T, source: 'x' }, cacheLegacy.read, on()))
            .toEqual({ value: PAYLOAD, updatedAt: T });
    });

    it('tryb ścisły odrzuca jawne wpisy (podrzucony jawny dokument nie przejdzie)', () => {
        const strict = on({ DATA_ENCRYPTION_STRICT: '1' });
        expect(fromStored(PATH, { payload: { series: [666] }, updatedAt: T }, cacheLegacy.read, strict)).toBeNull();
    });

    it('podmieniony albo nieodszyfrowywalny wpis = brak wpisu (cache pobierze dane od nowa)', () => {
        const doc = toStored(PATH, PAYLOAD, T, cacheLegacy.write, {}, on());
        expect(fromStored(PATH, doc, cacheLegacy.read, sealConfig({}))).toBeNull();
        expect(fromStored(PATH, { ...doc, updatedAt: T + 1 }, cacheLegacy.read, on())).toBeNull();
    });

    it('dokumenty health/* (cała treść bez updatedAt) w obu trybach', () => {
        const runs = { 'dbw-1': { at: '2026-10-25T09:50:00Z', ok: 2, total: 2, ms: 1, failed: [] } };
        const legacy = toStored('health/cron_runs', runs, T, docLegacy.write, {}, sealConfig({}));
        expect(legacy).toEqual({ ...runs, updatedAt: T });
        expect(fromStored('health/cron_runs', legacy, docLegacy.read, on())?.value).toEqual(runs);
        const sealed = toStored('health/cron_runs', runs, T, docLegacy.write, {}, on());
        expect(fromStored('health/cron_runs', sealed, docLegacy.read, on())?.value).toEqual(runs);
    });
});
