#!/usr/bin/env node
/**
 * Audyt słowników tematów — które prefiksy z `TOPIC_PATTERNS` faktycznie działają,
 * a które produkują fałszywki.
 *
 * Powstał po eksperymencie z klasyfikatorem AI (odrzuconym — patrz ROADMAP). Eksperyment
 * pokazał, że wpadki słowników da się wykryć POMIAREM, a nie czytaniem kodu. To narzędzie
 * robi to samo, tylko za darmo i deterministycznie.
 *
 * ZASADA: nie wyrzucaj prefiksu na podstawie jednej doby. Odpal to kilka razy w różnych
 * dniach — feed ma ~150 pozycji i wymienia się w kilkanaście godzin, więc jeden przebieg
 * to mała próbka. Prefiks, który przez tydzień dał same fałszywki, jest kandydatem
 * do usunięcia; prefiks z dwoma trafieniami w jeden wtorek nie jest.
 *
 *   node scripts/audit-topics.mjs            — audyt na żywym feedzie
 *   node scripts/audit-topics.mjs --json     — surowy wynik do dalszej obróbki
 *
 * Nie odpytuje GUS DBW ani żadnego limitowanego źródła — tylko publiczne RSS.
 */

import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync, symlinkSync, existsSync, writeFileSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import Module from 'node:module';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const asJson = process.argv.includes('--json');

/*
 * Dlaczego to jest takie zawiłe: `match.ts` importuje przez alias `@/lib/...`, którego ani
 * `tsc` bez tsconfig, ani Node nie rozwiążą same. Więc: kompilujemy z tymczasowym tsconfig
 * (baseUrl + paths), a potem podmieniamy resolver Node'a, bo tsc NIE przepisuje aliasów
 * w emitowanym JS — zostawia je dosłownie.
 */
const out = mkdtempSync(join(tmpdir(), 'savori-audit-'));
const cfg = join(out, 'tsconfig.json');
writeFileSync(cfg, JSON.stringify({
    compilerOptions: {
        module: 'commonjs', target: 'es2022', moduleResolution: 'node',
        skipLibCheck: true, esModuleInterop: true, resolveJsonModule: true,
        baseUrl: ROOT, paths: { '@/*': ['src/*'] },
        rootDir: join(ROOT, 'src/lib'), outDir: out,
    },
    files: [join(ROOT, 'src/lib/news/match.ts'), join(ROOT, 'src/lib/news/feed.ts')],
}));

try {
    execFileSync('npx', ['tsc', '-p', cfg], { cwd: ROOT, stdio: 'pipe' });
} catch {
    // Brak typów Node bywa zgłaszany jako błąd, ale pliki i tak powstają — sprawdzamy niżej.
}
if (!existsSync(join(out, 'news/match.js'))) {
    console.error('Nie udało się skompilować match.ts — przerywam.');
    rmSync(out, { recursive: true, force: true });
    process.exit(1);
}
symlinkSync(join(ROOT, 'node_modules'), join(out, 'node_modules'), 'dir');

const require_ = createRequire(import.meta.url);
const origResolve = Module._resolveFilename;
Module._resolveFilename = function (request, ...rest) {
    if (request.startsWith('@/lib/')) {
        return origResolve.call(this, join(out, request.slice('@/lib/'.length)), ...rest);
    }
    return origResolve.call(this, request, ...rest);
};

const { norm, matchesTopic } = require_(join(out, 'news/match.js'));
const { buildNewsFeed } = require_(join(out, 'news/feed.js'));

// Prefiksy odczytujemy z ŹRÓDŁA, nie z kopii — inaczej audyt rozjedzie się ze słownikami.
const src = readFileSync(join(ROOT, 'src/lib/news/match.ts'), 'utf8');
const TOPICS = ['ceny', 'gospodarka', 'praca', 'rynki'];

function patternsFor(topic) {
    const block = src.slice(src.indexOf(`    ${topic}: {`));
    const body = block.slice(0, block.indexOf('\n    },'));
    // `strong` MUSI się kończyć tam, gdzie zaczyna się `titleOnly` — inaczej wzorce z drugiej
    // grupy wyciekają do pierwszej i raport pokazuje je podwójnie.
    const tIdx = body.indexOf('titleOnly: {');
    const strongSeg = body.slice(body.indexOf('strong: {'), tIdx === -1 ? undefined : tIdx);
    const titleSeg = tIdx === -1 ? '' : body.slice(tIdx);
    const grab = (seg) => [...seg.matchAll(/'([^']+)'/g)].map((m) => m[1]);
    return { strong: grab(strongSeg), titleOnly: grab(titleSeg) };
}

const feed = await buildNewsFeed();
console.log(`Feed: ${feed.count} pozycji, ${feed.sourcesOk}/${feed.sourcesTotal} źródeł\n`);

const report = {};

for (const topic of TOPICS) {
    const pats = patternsFor(topic);
    const hits = feed.items.filter((it) => matchesTopic(it, topic));
    const perPattern = {};

    for (const it of hits) {
        const t = norm(it.title);
        const d = norm(it.description ?? '');
        // Który wzorzec odpowiada za to trafienie? Przy kilku liczymy każdy — chodzi o to,
        // żeby zobaczyć, co dany prefiks przyciąga, a nie o wyłączne przypisanie.
        for (const [group, list] of Object.entries(pats)) {
            for (const p of list) {
                const inTitle = t.includes(p);
                const inDesc = group === 'strong' && d.includes(p);
                if (!inTitle && !inDesc) continue;
                const key = `${group}:${p}`;
                (perPattern[key] ??= []).push({ title: it.title, source: it.source, where: inTitle ? 'tytuł' : 'opis' });
            }
        }
    }

    report[topic] = { total: hits.length, perPattern };

    if (asJson) continue;
    console.log(`━━━ ${topic.toUpperCase()} — ${hits.length} trafień ━━━`);
    const rows = Object.entries(perPattern).sort((a, b) => b[1].length - a[1].length);
    if (rows.length === 0) console.log('  (żaden wzorzec nie zadziałał w tej paczce)\n');
    for (const [key, items] of rows) {
        console.log(`\n  ${key}  → ${items.length}`);
        for (const i of items.slice(0, 6)) {
            console.log(`     [${i.where}] ${i.title.slice(0, 74)}  · ${i.source}`);
        }
        if (items.length > 6) console.log(`     … i ${items.length - 6} więcej`);
    }
    console.log('');
}

// Wzorce, które NIC nie złapały — kandydaci do przeglądu, ale patrz uwaga o próbce na górze.
const martwe = [];
for (const topic of TOPICS) {
    const pats = patternsFor(topic);
    for (const [group, list] of Object.entries(pats)) {
        for (const p of list) {
            if (!report[topic].perPattern[`${group}:${p}`]) martwe.push(`${topic}/${group}: ${p}`);
        }
    }
}
if (asJson) {
    console.log(JSON.stringify({ report, martwe }, null, 1));
} else {
    console.log(`━━━ WZORCE BEZ TRAFIEŃ W TEJ PACZCE (${martwe.length}) ━━━`);
    console.log('Nie usuwaj ich na tej podstawie — jedna doba to mała próbka.\n');
    console.log(martwe.map((m) => `  ${m}`).join('\n'));
}

rmSync(out, { recursive: true, force: true });
