import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { TranslateRunResult } from '@/lib/news/translate-server';

// Kryterium 7 spec docs/specs/2026-11-03-newsy-tlumaczenie.md: koszt i partie trafiają do dziennika crona.
const record = vi.fn(async () => {});
let result: TranslateRunResult;
vi.mock('server-only', () => ({}));
vi.mock('@/lib/cron-log', () => ({ recordCronRun: (...a: unknown[]) => (record as (...x: unknown[]) => Promise<void>)(...a) }));
vi.mock('@/lib/news/translate-server', () => ({ runNewsTranslate: async () => result }));

const base: TranslateRunResult = {
    status: 'ok', pending: 0, translated: 0, rejected: 0, batches: { ok: 0, total: 0 }, failed: [], costUsd: 0, tokens: { input: 0, output: 0 },
};
const call = async () => {
    const { GET } = await import('@/app/api/cron/news-translate/route');
    const { NextRequest } = await import('next/server');
    return GET(new NextRequest('http://localhost/api/cron/news-translate'));
};

describe('cron news-translate → health/cron_runs', () => {
    beforeEach(() => { record.mockClear(); delete process.env.CRON_SECRET; });

    it('zapisuje koszt i partie z wyniku', async () => {
        result = { ...base, pending: 20, translated: 14, rejected: 1, batches: { ok: 1, total: 2 }, failed: ['partia 2 → DeepSeek HTTP 500'], costUsd: 0.0021 };
        const res = await call();
        expect(res.status).toBe(200);
        expect(record).toHaveBeenCalledWith('news-translate', expect.objectContaining({ ok: 1, total: 2, costUsd: 0.0021, failed: ['partia 2 → DeepSeek HTTP 500'] }));
    });

    it('błąd przed pierwszą partią → 0/1 z powodem (nie zielone 0/0)', async () => {
        result = { ...base, status: 'error', reason: 'firestore down' };
        await call();
        expect(record).toHaveBeenCalledWith('news-translate', expect.objectContaining({ ok: 0, total: 1, failed: ['firestore down'] }));
    });

    it('401 bez sekretu, gdy CRON_SECRET jest ustawiony', async () => {
        process.env.CRON_SECRET = 's';
        const res = await call();
        expect(res.status).toBe(401);
        expect(record).not.toHaveBeenCalled();
    });
});
