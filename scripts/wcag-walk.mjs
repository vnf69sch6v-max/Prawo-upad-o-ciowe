import { chromium } from 'playwright';

const BASE = process.env.BASE_URL || 'http://127.0.0.1:3002';
const PAGES = [
    '/',
    '/ceny',
    '/gospodarka',
    '/praca',
    '/rynki',
    '/newsy',
    '/regiony',
    '/prognozy',
    '/publikacje',
    '/samorzad',
    '/spolki/PKN',
    '/login',
    '/ustawienia',
];
const WIDTHS = [375, 320];

const SHELL_SEL = [
    'header a', 'header button',
    '.mk-tab', '.mk-seg-btn',
    '[role="dialog"] button', '[role="dialog"] a', '[role="dialog"] input',
    '.mk-input', 'input[type="range"]',
    'footer a',
];

function classify(el) {
    if (el.closest('.mk-table, table, [class*="DataTable"]')) return 'datatable';
    if (el.closest('.recharts-wrapper, .recharts-surface')) return 'charts';
    if (el.closest('.mk-kpi, .mk-kpi-compact')) return 'kpi';
    if (el.closest('header, footer, [role="dialog"], .mk-seg, nav')) return 'shell';
    return 'other';
}

async function measure(page, path, width) {
    const logs = [];
    const onLog = (msg) => {
        const t = msg.type();
        if (t === 'error' || t === 'warning') logs.push(`${t}: ${msg.text()}`);
    };
    const onErr = (err) => logs.push(`pageerror: ${err.message}`);
    page.on('console', onLog);
    page.on('pageerror', onErr);

    await page.setViewportSize({ width, height: 812 });
    await page.goto(BASE + path, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(1800);

    const metrics = await page.evaluate((shellSel) => {
        const overflow = document.documentElement.scrollWidth - window.innerWidth;
        const selectors = 'a, button, input, select, textarea, [role="button"], [role="tab"], [role="menuitem"]';
        const nodes = [...document.querySelectorAll(selectors)];
        const small = [];
        for (const el of nodes) {
            const r = el.getBoundingClientRect();
            if (r.width === 0 && r.height === 0) continue;
            const w = Math.round(r.width);
            const h = Math.round(r.height);
            if (w < 24 || h < 24) {
                const tag = el.tagName.toLowerCase();
                const cls = (el.className && String(el.className).slice(0, 80)) || '';
                const label = (el.getAttribute('aria-label') || el.textContent || '').trim().slice(0, 40);
                let owner = 'other';
                if (el.closest('.mk-table, table')) owner = 'datatable';
                else if (el.closest('.recharts-wrapper, .recharts-surface')) owner = 'charts';
                else if (el.closest('.mk-kpi, .mk-kpi-compact')) owner = 'kpi';
                else if (el.closest('header, footer, [role="dialog"], .mk-seg, nav')) owner = 'shell';
                small.push({ w, h, tag, cls, label, owner });
            }
        }
        const segs = [...document.querySelectorAll('.mk-seg-btn')].map((el) => {
            const r = el.getBoundingClientRect();
            return { h: Math.round(r.height), selected: el.getAttribute('aria-selected') === 'true' };
        });
        const sliders = [...document.querySelectorAll('input[type="range"]')].map((el) => ({
            labelled: !!(el.labels && el.labels.length) || !!el.getAttribute('aria-label'),
            valueText: el.getAttribute('aria-valuetext'),
        }));
        const alerts = document.querySelectorAll('[role="alert"]').length;
        const inputOverlap = [...document.querySelectorAll('.mk-input')].map((el) => {
            const cs = getComputedStyle(el);
            return { pl: cs.paddingLeft, pr: cs.paddingRight };
        });
        return {
            overflow,
            inner: window.innerWidth,
            scroll: document.documentElement.scrollWidth,
            small,
            segs,
            sliders,
            alerts,
            inputOverlap,
            shellCount: document.querySelectorAll(shellSel.join(',')).length,
        };
    }, SHELL_SEL);

    page.off('console', onLog);
    page.off('pageerror', onErr);
    return { path, width, ...metrics, logs };
}

async function testPalette(page) {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto(BASE + '/', { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(800);
    await page.locator('button[aria-label="Szukaj (paleta poleceń)"]').click();
    await page.waitForSelector('[role="dialog"][aria-label="Paleta poleceń"]');
    const box = await page.locator('[role="dialog"][aria-label="Paleta poleceń"] > div.relative').boundingBox();
    const inputFocused = await page.evaluate(() => document.activeElement?.tagName === 'INPUT');
    await page.keyboard.press('Escape');
    await page.waitForTimeout(200);
    const stillOpen = await page.locator('[role="dialog"][aria-label="Paleta poleceń"]').count();
    const restored = await page.evaluate(() => document.activeElement?.getAttribute('aria-label') || document.activeElement?.tagName);
    return {
        marginLeft: box ? Math.round(box.x) : null,
        width: box ? Math.round(box.width) : null,
        inputFocused,
        closedOnEsc: stillOpen === 0,
        focusAfter: restored,
    };
}

const browser = await chromium.launch({ channel: 'chrome', headless: true });
const context = await browser.newContext();
const page = await context.newPage();

const rows = [];
for (const width of WIDTHS) {
    for (const path of PAGES) {
        try {
            rows.push(await measure(page, path, width));
        } catch (e) {
            rows.push({ path, width, error: String(e), overflow: null, small: [], logs: [] });
        }
    }
}

let palette;
try {
    palette = await testPalette(page);
} catch (e) {
    palette = { error: String(e) };
}

await browser.close();

const table = rows.map((r) => {
    const smallShell = (r.small || []).filter((s) => s.owner === 'shell');
    const smallSibling = (r.small || []).filter((s) => s.owner !== 'shell');
    const byOwner = {};
    for (const s of r.small || []) byOwner[s.owner] = (byOwner[s.owner] || 0) + 1;
    return {
        path: r.path,
        width: r.width,
        overflow: r.overflow,
        scroll: r.scroll,
        inner: r.inner,
        smallTotal: (r.small || []).length,
        smallShell: smallShell.length,
        smallByOwner: byOwner,
        smallExamples: (r.small || []).slice(0, 8),
        segHeights: r.segs,
        sliders: r.sliders,
        alerts: r.alerts,
        logs: r.logs,
        error: r.error,
    };
});

console.log(JSON.stringify({ table, palette }, null, 2));
