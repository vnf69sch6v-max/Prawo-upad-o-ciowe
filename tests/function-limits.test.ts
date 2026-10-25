import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { CRON_ENDPOINTS, CRON_SPACING_MS } from '@/lib/cron-endpoints';

// Kryteria 1–3 specyfikacji docs/specs/2026-10-25-gus-parametry-i-limit-czasu.md. Efektywny limit liczymy tak jak
// Vercel: `export const maxDuration` z pliku trasy wygrywa (@vercel/next: `{ ...vercelConfigOpts, ...opts }`),
// a z `vercel.json` → `functions` liczy się PIERWSZY pasujący wzorzec (@vercel/build-utils `findMatchingFunction`).
// Wpisy pod globem `src/app/api/**/*.ts` były przez to martwe i `gus-cpi-full` dostawało 30 s → 504 w cronie dbw-1.
const walk = (dir: string): string[] => readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    return statSync(p).isDirectory() ? walk(p) : f === 'route.ts' ? [p] : [];
});
const ROUTES = walk('src/app/api');
const PATTERNS = Object.entries(JSON.parse(readFileSync('vercel.json', 'utf8')).functions ?? {}) as [string, { maxDuration?: number }][];

function globRegex(glob: string): RegExp {
    const re = glob.split(/(\*\*\/|\*\*|\*)/).map((part) => {
        if (part === '**/') return '(?:.*/)?';
        if (part === '**') return '.*';
        if (part === '*') return '[^/]*';
        return part.replace(/[.+?^${}()|[\]\\]/g, '\\$&');
    }).join('');
    return new RegExp(`^${re}$`);
}

const exported = (file: string) => {
    const m = /export const maxDuration = (\d+)/.exec(readFileSync(file, 'utf8'));
    return m ? Number(m[1]) : null;
};

function effective(file: string): number {
    const fromFile = exported(file);
    if (fromFile != null) return fromFile;
    const hit = PATTERNS.find(([p]) => globRegex(p).test(file));
    expect(hit?.[1].maxDuration, `${file}: brak limitu`).toBeTypeOf('number');
    return hit![1].maxDuration!;
}

const routeFile = (endpoint: string) => `src/app/api/${new URL(endpoint, 'https://x').pathname.replace(/^\/api\//, '')}/route.ts`;

describe('limity czasu funkcji (Vercel)', () => {
    it('trasy GUS mają limit z eksportu', () => {
        expect(effective('src/app/api/gus-cpi-full/route.ts')).toBe(120);
        expect(effective('src/app/api/gus-ppi-full/route.ts')).toBe(120);
        expect(effective('src/app/api/gus-koniunktura/route.ts')).toBeGreaterThanOrEqual(60);
        expect(effective('src/app/api/dbw-series/route.ts')).toBeGreaterThanOrEqual(60);
    });

    it('vercel.json bez martwych wpisów: każdy wzorzec coś łapie i nie jest przesłonięty przez wcześniejszy', () => {
        expect(PATTERNS.length).toBeGreaterThan(0);
        PATTERNS.forEach(([pattern], i) => {
            const files = ROUTES.filter((f) => globRegex(pattern).test(f));
            expect(files.length, `${pattern} nie pasuje do żadnej trasy`).toBeGreaterThan(0);
            for (const f of files) {
                const earlier = PATTERNS.slice(0, i).find(([p]) => globRegex(p).test(f));
                expect(earlier?.[0], `${pattern} przesłonięty dla ${f}`).toBeUndefined();
            }
        });
    });

    it.each(['dbw-1', 'dbw-2', 'dbw-3', 'dbw-4'] as const)('cron %s zdąży wywołać wszystkie trasy i zapisać przebieg', (group) => {
        const endpoints = CRON_ENDPOINTS[group];
        const need = endpoints.reduce((s, ep) => s + effective(routeFile(ep)), 0) + endpoints.length * CRON_SPACING_MS / 1000 + 10;
        expect(effective(`src/app/api/cron/${group}/route.ts`)).toBeGreaterThanOrEqual(need);
        expect(effective(`src/app/api/cron/${group}/route.ts`)).toBeLessThanOrEqual(300); // Hobby
    });
});
