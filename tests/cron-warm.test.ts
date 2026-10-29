import { describe, expect, it, vi } from 'vitest';

// Kryterium 3 specyfikacji docs/specs/2026-10-29-status-czesciowe-awarie-cronow.md: `warmEndpoints` zapisuje czas każdej
// trasy w kolejności listy crona. Sieć i Firestore podstawione.
vi.mock('@/lib/internal-fetch', () => ({
    internalOrigin: () => 'https://savori.space',
    internalCall: vi.fn(async (url: string) => (url.includes('/api/b') ? 504 : 200)),
}));
vi.mock('@/lib/cron-log', () => ({ recordCronRun: vi.fn(async () => undefined) }));

import { warmEndpoints } from '@/lib/cron-warm';
import { recordCronRun } from '@/lib/cron-log';
import type { CronRun } from '@/lib/cron-runs';

describe('warmEndpoints', () => {
    it('records one timed route per endpoint, in list order, and a partial result', async () => {
        vi.stubEnv('CRON_SECRET', '');
        const eps = ['/api/a?refresh=1', '/api/b?x=1&refresh=1', '/api/c'];
        await warmEndpoints(new Request('https://savori.space/api/cron/test') as never, eps, 'dbw-1', 0);
        const [group, run] = vi.mocked(recordCronRun).mock.calls[0] as unknown as [string, CronRun];
        expect(group).toBe('dbw-1');
        expect(run.routes?.map((r) => r.ep)).toEqual(['/api/a', '/api/b?x=1', '/api/c']);
        for (const r of run.routes!) expect(r.ms).toBeGreaterThanOrEqual(0);
        expect([run.ok, run.total]).toEqual([2, 3]);
        vi.unstubAllEnvs();
    });
});
