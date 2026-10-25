// Szyfrowanie treści dokumentów Firestore po stronie aplikacji — drugie szyfrowanie na szyfrowaniu
// dysków Google. Bez klucza z env serwera treść w bazie (konsola Firebase, eksport, wyciek klucza konta
// serwisowego, inna aplikacja w tym samym projekcie) to nieczytelne bajty, a każda podmiana jest wykrywana.
//
//   DATA_ENCRYPTION_KEY           32 bajty w base64 (`openssl rand -base64 32`) — szyfruje i odszyfrowuje
//   DATA_ENCRYPTION_KEY_PREVIOUS  poprzedni klucz przy rotacji — tylko odszyfrowuje
//   DATA_ENCRYPTION_STRICT=1      odrzuca wpisy jawne (po migracji: `sweepLegacyDocs` nie znajduje już żadnego)
//
// Format pola `sealed` (Bytes): "SV1" | kid (4 B = SHA-256(klucz)[0..4]) | IV (12 B) | tag GCM (16 B) | szyfrogram.
// Treść: JSON → deflate → AES-256-GCM. AAD = wersja | ścieżka dokumentu | updatedAt, więc szyfrogramu nie da
// się przenieść do innego dokumentu ani „odświeżyć” podmianą jawnego `updatedAt`.
// Bez klucza (tryb demo, przed ustawieniem w Vercelu) zapis jest jawny jak dawniej — strona działa tak samo.
import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'node:crypto';
import { deflateRawSync, inflateRawSync } from 'node:zlib';

const MAGIC = Buffer.from('SV1', 'ascii');
const KID_LEN = 4;
const IV_LEN = 12;
const TAG_LEN = 16;
const HEADER_LEN = MAGIC.length + KID_LEN + IV_LEN + TAG_LEN;

export class SealError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'SealError';
    }
}

interface SealKey { key: Buffer; kid: Buffer }

export type SealMode = 'off' | 'on' | 'error';

export interface SealConfig {
    /** off = brak klucza (zapis jawny), on = szyfrowanie, error = zły klucz (zapis wstrzymany). */
    mode: SealMode;
    active: SealKey | null;
    previous: SealKey | null;
    strict: boolean;
    error: string | null;
}

type Env = Record<string, string | undefined>;

function parseKey(raw: string | undefined, name: string): SealKey | null {
    const s = raw?.trim();
    if (!s) return null;
    const key = Buffer.from(s, 'base64');
    if (key.length !== 32 || key.toString('base64') !== s) {
        throw new SealError(`${name}: oczekiwano 32 bajtów w base64 (openssl rand -base64 32)`);
    }
    return { key, kid: createHash('sha256').update(key).digest().subarray(0, KID_LEN) };
}

let cached: { sig: string; cfg: SealConfig } | null = null;

export function sealConfig(env: Env = process.env): SealConfig {
    const sig = `${env.DATA_ENCRYPTION_KEY ?? ''}|${env.DATA_ENCRYPTION_KEY_PREVIOUS ?? ''}|${env.DATA_ENCRYPTION_STRICT ?? ''}`;
    if (cached?.sig === sig) return cached.cfg;
    const strict = env.DATA_ENCRYPTION_STRICT === '1';
    let cfg: SealConfig;
    try {
        const active = parseKey(env.DATA_ENCRYPTION_KEY, 'DATA_ENCRYPTION_KEY');
        const previous = parseKey(env.DATA_ENCRYPTION_KEY_PREVIOUS, 'DATA_ENCRYPTION_KEY_PREVIOUS');
        if (!active && previous) throw new SealError('DATA_ENCRYPTION_KEY_PREVIOUS bez DATA_ENCRYPTION_KEY');
        cfg = { mode: active ? 'on' : 'off', active, previous, strict, error: null };
    } catch (err) {
        cfg = { mode: 'error', active: null, previous: null, strict, error: (err as Error).message };
        console.error('[data-seal]', cfg.error);
    }
    cached = { sig, cfg };
    return cfg;
}

/** Do /api/health/freshness — identyfikatory kluczy to skrót SHA-256, nie klucz. */
export function sealStatus(env?: Env) {
    const c = sealConfig(env);
    return {
        mode: c.mode,
        kid: c.active?.kid.toString('hex') ?? null,
        previousKid: c.previous?.kid.toString('hex') ?? null,
        strict: c.strict,
        error: c.error,
    };
}

const aad = (path: string, updatedAt: number) => Buffer.from(`savori-seal:v1|${path}|${updatedAt}`, 'utf8');

export function seal(path: string, updatedAt: number, value: unknown, cfg: SealConfig = sealConfig()): Buffer {
    if (!cfg.active) throw new SealError(cfg.error ?? 'brak klucza szyfrowania');
    const iv = randomBytes(IV_LEN);
    const cipher = createCipheriv('aes-256-gcm', cfg.active.key, iv, { authTagLength: TAG_LEN });
    cipher.setAAD(aad(path, updatedAt));
    const plain = deflateRawSync(Buffer.from(JSON.stringify(value ?? null), 'utf8'));
    const ct = Buffer.concat([cipher.update(plain), cipher.final()]);
    return Buffer.concat([MAGIC, cfg.active.kid, iv, cipher.getAuthTag(), ct]);
}

export function open<T = unknown>(path: string, updatedAt: number, blob: unknown, cfg: SealConfig = sealConfig()): T {
    if (!(blob instanceof Uint8Array)) throw new SealError('pole sealed nie jest bajtami');
    const buf = Buffer.from(blob.buffer, blob.byteOffset, blob.byteLength);
    if (buf.length < HEADER_LEN || !buf.subarray(0, MAGIC.length).equals(MAGIC)) throw new SealError('nieznany format');
    const kid = buf.subarray(MAGIC.length, MAGIC.length + KID_LEN);
    const key = [cfg.active, cfg.previous].find((k) => k?.kid.equals(kid));
    if (!key) throw new SealError(`nieznany klucz ${kid.toString('hex')}`);
    const ivAt = MAGIC.length + KID_LEN;
    const decipher = createDecipheriv('aes-256-gcm', key.key, buf.subarray(ivAt, ivAt + IV_LEN), { authTagLength: TAG_LEN });
    decipher.setAAD(aad(path, updatedAt));
    decipher.setAuthTag(buf.subarray(ivAt + IV_LEN, HEADER_LEN));
    let plain: Buffer;
    try {
        plain = Buffer.concat([decipher.update(buf.subarray(HEADER_LEN)), decipher.final()]);
    } catch {
        throw new SealError('podpis się nie zgadza (zły klucz, inny dokument albo podmieniona treść)');
    }
    return JSON.parse(inflateRawSync(plain).toString('utf8')) as T;
}

/** Czy szyfrogram jest zrobiony aktywnym kluczem (po rotacji migracja przepisuje resztę). */
export function sealedWithActiveKey(blob: unknown, cfg: SealConfig = sealConfig()): boolean {
    if (!(blob instanceof Uint8Array) || !cfg.active) return false;
    const kid = Buffer.from(blob.buffer, blob.byteOffset, blob.byteLength).subarray(MAGIC.length, MAGIC.length + KID_LEN);
    return kid.equals(cfg.active.kid);
}

/** Jawne `updatedAt` (liczba albo Timestamp Firestore). */
export function storedUpdatedAt(data: Record<string, unknown>): number {
    const u = data.updatedAt as { toMillis?: () => number } | number | undefined;
    const ms = typeof u === 'number' ? u : u?.toMillis?.();
    return typeof ms === 'number' && Number.isFinite(ms) ? ms : 0;
}

/**
 * Dokument do zapisu: `{ sealed, updatedAt }` przy kluczu, inaczej dawny kształt jawny (`legacy`).
 * Zły klucz (`mode: error`) → SealError: nie zapisujemy jawnie, skoro właściciel chciał szyfrowania.
 */
export function toStored(
    path: string,
    value: unknown,
    updatedAt: number,
    legacy: (value: unknown, updatedAt: number) => Record<string, unknown>,
    cfg: SealConfig = sealConfig(),
): Record<string, unknown> {
    if (cfg.mode === 'off') return legacy(value, updatedAt);
    return { sealed: seal(path, updatedAt, value, cfg), updatedAt };
}

/**
 * Treść dokumentu albo `null`, gdy nie da się jej zaufać (zły klucz, podmiana, jawny wpis w trybie ścisłym).
 * `null` działa jak brak wpisu: cache pobiera dane ze źródła od nowa i nadpisuje dokument.
 */
export function fromStored<T>(
    path: string,
    data: Record<string, unknown> | undefined,
    legacy: (data: Record<string, unknown>) => T | undefined,
    cfg: SealConfig = sealConfig(),
): { value: T; updatedAt: number } | null {
    if (!data) return null;
    const updatedAt = storedUpdatedAt(data);
    if (data.sealed !== undefined) {
        try {
            return { value: open<T>(path, updatedAt, data.sealed, cfg), updatedAt };
        } catch (err) {
            console.error(`[data-seal] ${path}: ${(err as Error).message}`);
            return null;
        }
    }
    if (cfg.strict) {
        console.error(`[data-seal] ${path}: jawny wpis odrzucony (DATA_ENCRYPTION_STRICT=1)`);
        return null;
    }
    const value = legacy(data);
    return value === undefined ? null : { value, updatedAt };
}

/** Kształt dokumentów cache (`withCache`): treść w `payload`. */
export const cacheLegacy = {
    write: (payload: unknown, updatedAt: number) => ({ payload, updatedAt }),
    read: (d: Record<string, unknown>) => d.payload,
};

/** Kształt dokumentów `health/*`: treść = cały dokument bez `updatedAt`. */
export const docLegacy = {
    write: (value: unknown, updatedAt: number) => ({ ...(value as Record<string, unknown>), updatedAt }),
    read: (d: Record<string, unknown>) => {
        const rest = { ...d };
        delete rest.updatedAt;
        return rest;
    },
};
