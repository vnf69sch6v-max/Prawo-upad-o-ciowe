'use client';

// Globalna paleta poleceń (⌘K / Ctrl+K) — nowoczesny mechanizm nawigacji „napisz czego szukasz".
// Fuzzy-search bez diakrytyków po zakładkach, wskaźnikach i działach inflacji; deep-linki do
// pod-zakładek przez ?tab=. Otwierana skrótem ⌘K lub zdarzeniem `mk:palette` (z przycisku w headerze).
import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import {
    LayoutDashboard, Tag, Factory, Users, TrendingUp, Sparkles, Map, Search,
    Banknote, Percent, Landmark, LineChart, Home, Wheat, HardHat, Fuel, Building2, CornerDownLeft,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface Cmd { id: string; label: string; sub?: string; group: string; keywords: string; href: string; icon: LucideIcon }

// Indeks poleceń. `keywords` = dodatkowe frazy do wyszukania (synonimy, kody).
const COMMANDS: Cmd[] = [
    // ── Zakładki ──
    { id: 'nav-home', group: 'Zakładki', label: 'Przegląd', keywords: 'dashboard start główna overview', href: '/', icon: LayoutDashboard },
    { id: 'nav-ceny', group: 'Zakładki', label: 'Ceny', keywords: 'inflacja cpi', href: '/ceny', icon: Tag },
    { id: 'nav-gosp', group: 'Zakładki', label: 'Gospodarka', keywords: 'pkb aktywność', href: '/gospodarka', icon: Factory },
    { id: 'nav-praca', group: 'Zakładki', label: 'Rynek pracy', keywords: 'bezrobocie płace zatrudnienie', href: '/praca', icon: Users },
    { id: 'nav-rynki', group: 'Zakładki', label: 'Rynki', keywords: 'gpw waluty stopy złoto', href: '/rynki', icon: TrendingUp },
    { id: 'nav-prog', group: 'Zakładki', label: 'Prognozy', keywords: 'nowcast koszyk taylor symulator', href: '/prognozy', icon: Sparkles },
    { id: 'nav-reg', group: 'Zakładki', label: 'Regiony', keywords: 'województwa mapa samorząd demografia', href: '/regiony', icon: Map },

    // ── Wskaźniki / widoki (deep-link do pod-zakładek) ──
    { id: 'ind-cpi', group: 'Wskaźniki', label: 'Inflacja CPI', sub: 'Ceny', keywords: 'inflacja ceny konsumenckie r/r bazowa', href: '/ceny?tab=inflacja', icon: TrendingUp },
    { id: 'ind-ppi', group: 'Wskaźniki', label: 'Ceny producenta (PPI)', sub: 'Ceny', keywords: 'ppi producent przemysł', href: '/ceny?tab=ppi', icon: Factory },
    { id: 'ind-nier', group: 'Wskaźniki', label: 'Ceny nieruchomości', sub: 'Ceny', keywords: 'mieszkania nieruchomości rynek pierwotny wtórny', href: '/ceny?tab=nieruchomosci', icon: Home },
    { id: 'ind-bud', group: 'Wskaźniki', label: 'Ceny robót budowlanych', sub: 'Ceny', keywords: 'budownictwo budowlano-montażowe', href: '/ceny?tab=budowlane', icon: HardHat },
    { id: 'ind-rol', group: 'Wskaźniki', label: 'Ceny skupu produktów rolnych', sub: 'Ceny', keywords: 'rolne pszenica żyto mleko żywiec', href: '/ceny?tab=rolne', icon: Wheat },
    { id: 'ind-pkb', group: 'Wskaźniki', label: 'PKB i wzrost gospodarczy', sub: 'Gospodarka', keywords: 'pkb wzrost aktywność produkcja', href: '/gospodarka?tab=aktywnosc', icon: LineChart },
    { id: 'ind-kon', group: 'Wskaźniki', label: 'Koniunktura', sub: 'Gospodarka', keywords: 'koniunktura nastroje przedsiębiorstwa', href: '/gospodarka?tab=koniunktura', icon: Building2 },
    { id: 'ind-bezr', group: 'Wskaźniki', label: 'Bezrobocie i płace', sub: 'Rynek pracy', keywords: 'bezrobocie stopa płace wynagrodzenia', href: '/praca?tab=bezrobocie', icon: Users },
    { id: 'ind-zatr', group: 'Wskaźniki', label: 'Zatrudnienie i wakaty', sub: 'Rynek pracy', keywords: 'zatrudnienie wakaty etaty', href: '/praca?tab=zatrudnienie', icon: Users },
    { id: 'ind-kursy', group: 'Wskaźniki', label: 'Kursy walut', sub: 'Rynki', keywords: 'eur usd chf gbp pln kurs waluty nbp', href: '/rynki?tab=kursy', icon: Banknote },
    { id: 'ind-stopy', group: 'Wskaźniki', label: 'Stopy procentowe i WIBOR', sub: 'Rynki', keywords: 'stopa referencyjna nbp rpp wibor', href: '/rynki?tab=stopy', icon: Percent },
    { id: 'ind-gpw', group: 'Wskaźniki', label: 'GPW / WIG20', sub: 'Rynki', keywords: 'giełda wig20 wig akcje indeks złoto surowce brent', href: '/rynki?tab=gpw', icon: LineChart },
    { id: 'ind-handel', group: 'Wskaźniki', label: 'Handel zagraniczny', sub: 'Rynki', keywords: 'eksport import bilans handel', href: '/rynki?tab=handel', icon: TrendingUp },
    { id: 'ind-nowcast', group: 'Wskaźniki', label: 'Prognoza CPI (koszyk)', sub: 'Prognozy', keywords: 'nowcast prognoza inflacja koszyk', href: '/prognozy?tab=inflacja', icon: Sparkles },
    { id: 'ind-taylor', group: 'Wskaźniki', label: 'Reguła Taylora', sub: 'Prognozy', keywords: 'taylor stopa optymalna reguła', href: '/prognozy?tab=taylor', icon: Percent },
    { id: 'ind-regpkb', group: 'Wskaźniki', label: 'PKB regionalne', sub: 'Regiony', keywords: 'województwa pkb per capita mapa', href: '/regiony?tab=pkb', icon: Map },
    { id: 'ind-demo', group: 'Wskaźniki', label: 'Demografia', sub: 'Regiony', keywords: 'ludność demografia województwa', href: '/regiony?tab=demografia', icon: Users },
    { id: 'ind-smup', group: 'Wskaźniki', label: 'Samorząd (SMUP)', sub: 'Regiony', keywords: 'samorząd usługi publiczne smup jst', href: '/regiony?tab=samorzad', icon: Landmark },

    // ── Działy inflacji (COICOP) → /ceny ──
    ...[
        ['Żywność i napoje', 'żywność jedzenie napoje bezalkoholowe'],
        ['Alkohol i tytoń', 'alkohol tytoń papierosy akcyza'],
        ['Odzież i obuwie', 'odzież ubrania obuwie buty'],
        ['Mieszkanie i energia', 'mieszkanie energia prąd gaz czynsz woda'],
        ['Transport i paliwa', 'transport paliwa benzyna samochody ropa'],
        ['Zdrowie', 'zdrowie leki usługi medyczne'],
        ['Restauracje i hotele', 'restauracje hotele gastronomia zakwaterowanie'],
    ].map(([label, kw], i) => ({ id: `div-${i}`, group: 'Działy inflacji', label: label as string, sub: 'Ceny', keywords: kw as string, href: '/ceny?tab=inflacja', icon: Fuel })),
];

// Normalizacja bez diakrytyków + lowercase (żeby „zywnosc" trafiało „Żywność").
const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[łŁ]/g, 'l').toLowerCase();
// Prosty scoring: wszystkie słowa zapytania muszą wystąpić; bonus za dopasowanie na początku etykiety.
function score(cmd: Cmd, q: string): number {
    const hay = norm(`${cmd.label} ${cmd.sub ?? ''} ${cmd.keywords} ${cmd.group}`);
    const label = norm(cmd.label);
    const words = q.split(/\s+/).filter(Boolean);
    let s = 0;
    for (const w of words) {
        const idx = hay.indexOf(w);
        if (idx === -1) return -1;
        s += label.startsWith(w) ? 100 : label.includes(w) ? 40 : 10;
    }
    return s;
}

export function CommandPalette() {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [q, setQ] = useState('');
    const [active, setActive] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);
    const listRef = useRef<HTMLDivElement>(null);

    // Skrót ⌘K/Ctrl+K globalnie + zdarzenie z headera.
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setOpen((o) => !o); }
        };
        const onEvt = () => setOpen(true);
        window.addEventListener('keydown', onKey);
        window.addEventListener('mk:palette', onEvt);
        return () => { window.removeEventListener('keydown', onKey); window.removeEventListener('mk:palette', onEvt); };
    }, []);

    // Reset przy otwarciu + focus.
    useEffect(() => {
        if (!open) return;
        setQ(''); setActive(0); // eslint-disable-line react-hooks/set-state-in-effect -- celowy reset UI przy otwarciu
        const id = setTimeout(() => inputRef.current?.focus(), 20);
        return () => clearTimeout(id);
    }, [open]);

    // Blokada scrolla tła gdy otwarte.
    useEffect(() => {
        if (!open) return;
        const prev = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = prev; };
    }, [open]);

    const results = useMemo(() => {
        const query = norm(q.trim());
        const list = query
            ? COMMANDS.map((c) => ({ c, s: score(c, query) })).filter((x) => x.s >= 0).sort((a, b) => b.s - a.s).map((x) => x.c)
            : COMMANDS.filter((c) => c.group === 'Zakładki').concat(COMMANDS.filter((c) => c.group === 'Wskaźniki').slice(0, 6));
        return list.slice(0, 40);
    }, [q]);

    const go = (cmd: Cmd | undefined) => {
        if (!cmd) return;
        setOpen(false);
        router.push(cmd.href);
    };

    const onKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'ArrowDown') { e.preventDefault(); setActive((a) => Math.min(a + 1, results.length - 1)); }
        else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
        else if (e.key === 'Enter') { e.preventDefault(); go(results[active]); }
        else if (e.key === 'Escape') { e.preventDefault(); setOpen(false); }
    };

    // Auto-scroll aktywnego elementu do widoku.
    useEffect(() => {
        listRef.current?.querySelector<HTMLElement>(`[data-idx="${active}"]`)?.scrollIntoView({ block: 'nearest' });
    }, [active]);

    if (!open) return null;

    // Grupowanie wyników z zachowaniem kolejności + globalny indeks dla klawiatury.
    let idx = -1;
    const groups: { name: string; items: { cmd: Cmd; i: number }[] }[] = [];
    for (const c of results) {
        idx++;
        const g = groups.find((x) => x.name === c.group);
        const entry = { cmd: c, i: idx };
        if (g) g.items.push(entry); else groups.push({ name: c.group, items: [entry] });
    }

    return createPortal(
        <div className="fixed inset-0 z-[70] flex items-start justify-center px-4 pt-[12vh]" role="dialog" aria-modal="true" aria-label="Paleta poleceń">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]" onClick={() => setOpen(false)} />
            <div className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-mk-border bg-mk-surface shadow-2xl" onKeyDown={onKeyDown}>
                <div className="flex items-center gap-2.5 border-b border-mk-border px-4">
                    <Search size={18} className="shrink-0 text-mk-faint" />
                    <input ref={inputRef} value={q} onChange={(e) => { setQ(e.target.value); setActive(0); }} placeholder="Szukaj wskaźnika, zakładki, działu…"
                        className="h-14 flex-1 bg-transparent text-[15px] text-mk-text outline-none placeholder:text-mk-faint" />
                    <kbd className="hidden shrink-0 rounded-md border border-mk-border px-1.5 py-0.5 text-[11px] text-mk-faint sm:block">ESC</kbd>
                </div>

                <div ref={listRef} className="max-h-[52vh] overflow-y-auto py-2">
                    {results.length === 0 ? (
                        <div className="px-4 py-10 text-center text-sm text-mk-faint">Brak wyników dla „{q}”</div>
                    ) : groups.map((g) => (
                        <div key={g.name} className="mb-1">
                            <div className="px-4 py-1 text-[11px] font-semibold uppercase tracking-wide text-mk-faint">{g.name}</div>
                            {g.items.map(({ cmd, i }) => {
                                const Icon = cmd.icon;
                                const on = i === active;
                                return (
                                    <button key={cmd.id} data-idx={i} onMouseMove={() => setActive(i)} onClick={() => go(cmd)}
                                        className={`flex w-full items-center gap-3 px-4 py-2 text-left transition-colors ${on ? 'bg-mk-primary/10' : ''}`}>
                                        <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${on ? 'bg-mk-primary text-white' : 'bg-mk-surface-alt text-mk-muted'}`}>
                                            <Icon size={15} />
                                        </span>
                                        <span className="min-w-0 flex-1">
                                            <span className="block truncate text-sm font-medium text-mk-text">{cmd.label}</span>
                                            {cmd.sub && <span className="block truncate text-xs text-mk-faint">{cmd.sub}</span>}
                                        </span>
                                        {on && <CornerDownLeft size={14} className="shrink-0 text-mk-faint" />}
                                    </button>
                                );
                            })}
                        </div>
                    ))}
                </div>

                <div className="flex items-center justify-between border-t border-mk-border px-4 py-2 text-[11px] text-mk-faint">
                    <span className="flex items-center gap-2">
                        <kbd className="rounded border border-mk-border px-1">↑</kbd><kbd className="rounded border border-mk-border px-1">↓</kbd> nawigacja
                        <kbd className="ml-1 rounded border border-mk-border px-1">↵</kbd> wybór
                    </span>
                    <span>{results.length} wyników</span>
                </div>
            </div>
        </div>,
        document.body,
    );
}
