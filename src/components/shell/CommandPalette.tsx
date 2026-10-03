'use client';

// Globalna paleta poleceń (⌘K / Ctrl+K) — nowoczesny mechanizm nawigacji „napisz czego szukasz".
// Fuzzy-search bez diakrytyków po zakładkach, wskaźnikach i działach inflacji; deep-linki do
// pod-zakładek przez ?tab=. Otwierana skrótem ⌘K lub zdarzeniem `mk:palette` (z przycisku w headerze,
// z arkusza „Więcej”). Poniżej `sm` — pełny ekran jak wyszukiwarka w aplikacji: pole 16 px (iOS nie
// zoomuje), wyniki ≥ 48 px, wysokość = visual viewport (klawiatura nie zasłania listy).
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { rememberOpener, useFocusTrap } from '@/lib/use-focus-trap';
import {
    LayoutDashboard, Tag, Factory, Users, TrendingUp, Map, Search, Newspaper,
    Percent, Landmark, LineChart, Home, Wheat, HardHat, Fuel, Building2, CornerDownLeft, Briefcase,
    FileBarChart2,
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
    { id: 'nav-newsy', group: 'Zakładki', label: 'Newsy', keywords: 'wiadomości aktualności prasa rss bankier money puls biznesu', href: '/newsy', icon: Newspaper },
    { id: 'nav-reg', group: 'Zakładki', label: 'Regiony', keywords: 'województwa mapa samorząd demografia', href: '/regiony', icon: Map },
    { id: 'nav-parser', group: 'Zakładki', label: 'Parser raportów', keywords: 'raport sprawozdanie pdf 10-q 10-k newconnect ekstrakcja bilans rachunek wyników cash flow eps', href: '/parser', icon: FileBarChart2 },
    { id: 'nav-prog', group: 'Zakładki', label: 'Prognozy', keywords: 'kredyt wibor rata symulator', href: '/prognozy', icon: Percent },

    // ── Wskaźniki / widoki (deep-link do pod-zakładek) ──
    { id: 'ind-cpi', group: 'Wskaźniki', label: 'Inflacja CPI', sub: 'Ceny', keywords: 'inflacja ceny konsumenckie r/r bazowa', href: '/ceny?tab=inflacja', icon: TrendingUp },
    { id: 'ind-ppi', group: 'Wskaźniki', label: 'Ceny producenta (PPI)', sub: 'Ceny', keywords: 'ppi producent przemysł', href: '/ceny?tab=ppi', icon: Factory },
    { id: 'ind-nier', group: 'Wskaźniki', label: 'Ceny nieruchomości', sub: 'Ceny', keywords: 'mieszkania nieruchomości rynek pierwotny wtórny', href: '/ceny?tab=nieruchomosci', icon: Home },
    { id: 'ind-bud', group: 'Wskaźniki', label: 'Ceny robót budowlanych', sub: 'Ceny', keywords: 'budownictwo budowlano-montażowe', href: '/ceny?tab=budowlane', icon: HardHat },
    { id: 'ind-rol', group: 'Wskaźniki', label: 'Ceny skupu produktów rolnych', sub: 'Ceny', keywords: 'rolne pszenica żyto mleko żywiec', href: '/ceny?tab=rolne', icon: Wheat },
    { id: 'ind-pkb', group: 'Wskaźniki', label: 'PKB i wzrost gospodarczy', sub: 'Gospodarka', keywords: 'pkb wzrost aktywność produkcja', href: '/gospodarka?tab=aktywnosc', icon: LineChart },
    { id: 'ind-kon', group: 'Wskaźniki', label: 'Koniunktura', sub: 'Gospodarka', keywords: 'koniunktura nastroje przedsiębiorstwa konsumencka', href: '/gospodarka?tab=koniunktura', icon: Building2 },
    { id: 'ind-finanse', group: 'Wskaźniki', label: 'Finanse publiczne (dług, deficyt, 10Y)', sub: 'Gospodarka', keywords: 'dług publiczny deficyt budżet rentowność obligacje 10y maastricht rządy polityka partie', href: '/gospodarka?tab=finanse', icon: Landmark },
    { id: 'ind-bezr', group: 'Wskaźniki', label: 'Bezrobocie i płace', sub: 'Rynek pracy', keywords: 'bezrobocie stopa płace wynagrodzenia', href: '/praca?tab=bezrobocie', icon: Users },
    { id: 'ind-zatr', group: 'Wskaźniki', label: 'Zatrudnienie i wakaty', sub: 'Rynek pracy', keywords: 'zatrudnienie wakaty etaty', href: '/praca?tab=zatrudnienie', icon: Users },
    { id: 'ind-spolki', group: 'Wskaźniki', label: 'Spółki WIG20', sub: 'Rynki', keywords: 'spółki akcje wig20 orlen pko kghm pzu allegro dino cd projekt notowania kurs gpw giełda waluty stopy wibor surowce', href: '/rynki', icon: LineChart },
    { id: 'ind-regpkb', group: 'Wskaźniki', label: 'PKB regionalne', sub: 'Regiony', keywords: 'województwa pkb per capita mapa', href: '/regiony?tab=pkb', icon: Map },
    { id: 'ind-demo', group: 'Wskaźniki', label: 'Demografia', sub: 'Regiony', keywords: 'ludność demografia województwa', href: '/regiony?tab=demografia', icon: Users },
    { id: 'ind-regpraca', group: 'Wskaźniki', label: 'Bezrobocie i płace wg województw', sub: 'Regiony', keywords: 'bezrobocie regionalne województwa mapa płace wynagrodzenia', href: '/regiony?tab=praca', icon: Briefcase },

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

/**
 * iOS otwiera klawiaturę tylko dla `focus()` wywołanego synchronicznie w geście użytkownika, a pole
 * palety powstaje dopiero po renderze. Fokus na tymczasowym, niewidocznym polu w samym geście
 * otwiera klawiaturę; przeniesienie fokusu na właściwe pole już jej nie zamyka.
 */
function primeTouchKeyboard() {
    if (!window.matchMedia('(pointer: coarse)').matches) return;
    const proxy = document.createElement('input');
    proxy.setAttribute('aria-hidden', 'true');
    proxy.tabIndex = -1;
    proxy.style.cssText = 'position:fixed;top:0;left:0;width:1px;height:1px;opacity:0;font-size:16px;border:0;padding:0;pointer-events:none;';
    document.body.appendChild(proxy);
    proxy.focus({ preventScroll: true });
    window.setTimeout(() => proxy.remove(), 600);
}

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
    const panelRef = useRef<HTMLDivElement>(null);
    const rootRef = useRef<HTMLDivElement>(null);
    const close = useCallback(() => setOpen(false), []);
    useFocusTrap(open, panelRef, close);

    // Skrót ⌘K/Ctrl+K globalnie + zdarzenie z headera.
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
                e.preventDefault();
                rememberOpener();
                setOpen((o) => !o);
            }
        };
        const onEvt = () => { rememberOpener(); primeTouchKeyboard(); setOpen(true); };
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

    // Telefon (< sm): pełny ekran o wysokości visual viewport. Gdy klawiatura jest otwarta, layout
    // viewport się nie zmienia (iOS, Chrome Android) — bez tego dół listy wyników leżałby pod klawiaturą.
    useEffect(() => {
        const root = rootRef.current;
        const vv = window.visualViewport;
        if (!open || !root || !vv) return;
        const sm = window.matchMedia('(min-width: 640px)');
        const apply = () => {
            if (sm.matches) {
                root.style.removeProperty('height');
                root.style.removeProperty('top');
                return;
            }
            root.style.height = `${vv.height}px`;
            root.style.top = `${vv.offsetTop}px`;
        };
        apply();
        vv.addEventListener('resize', apply);
        vv.addEventListener('scroll', apply);
        sm.addEventListener('change', apply);
        return () => {
            vv.removeEventListener('resize', apply);
            vv.removeEventListener('scroll', apply);
            sm.removeEventListener('change', apply);
        };
    }, [open]);

    // Przewinięcie listy palcem chowa klawiaturę (jak wyszukiwarki w iOS/Android) — więcej wyników.
    const onListTouchMove = () => {
        if (document.activeElement === inputRef.current) inputRef.current?.blur();
    };

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

    const activeId = results[active] ? `mk-cmd-${results[active].id}` : undefined;
    // Paleta renderuje się tylko po otwarciu (nigdy w SSR), więc odczyt szerokości tutaj jest bezpieczny.
    // Na telefonie obok pola jest „Anuluj” — pełny placeholder byłby ucięty w pół słowa.
    const compact = window.matchMedia('(max-width: 639px)').matches;

    return createPortal(
        <div
            ref={rootRef}
            className="fixed inset-x-0 top-0 z-[70] flex h-dvh items-stretch justify-center sm:inset-0 sm:h-auto sm:items-start sm:p-3 sm:px-4 sm:pt-[12vh]"
            role="dialog"
            aria-modal="true"
            aria-label="Paleta poleceń"
        >
            <div className="absolute inset-0 hidden bg-slate-900/40 backdrop-blur-[2px] sm:block" onClick={close} />
            <div
                ref={panelRef}
                className="relative flex w-full flex-col overflow-hidden bg-mk-surface pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)] pt-[env(safe-area-inset-top)] [-webkit-tap-highlight-color:transparent] sm:max-w-xl sm:rounded-2xl sm:border sm:border-mk-border sm:p-0 sm:shadow-2xl"
                onKeyDown={onKeyDown}
            >
                <div className="flex shrink-0 items-center gap-2.5 border-b border-mk-border pl-4 pr-1 sm:pr-4">
                    <Search size={18} className="shrink-0 text-mk-faint" aria-hidden />
                    <input
                        ref={inputRef}
                        value={q}
                        onChange={(e) => { setQ(e.target.value); setActive(0); }}
                        placeholder={compact ? 'Szukaj wskaźnika…' : 'Szukaj wskaźnika, zakładki, działu…'}
                        type="search"
                        inputMode="search"
                        enterKeyHint="go"
                        autoComplete="off"
                        autoCorrect="off"
                        autoCapitalize="none"
                        spellCheck={false}
                        role="combobox"
                        aria-label="Szukaj wskaźnika, zakładki, działu"
                        aria-expanded={results.length > 0}
                        aria-controls="mk-palette-list"
                        aria-autocomplete="list"
                        aria-activedescendant={activeId}
                        className="h-14 min-w-0 flex-1 bg-transparent text-base text-mk-text outline-none placeholder:text-mk-faint sm:text-[15px] [&::-webkit-search-cancel-button]:hidden"
                    />
                    <kbd className="hidden shrink-0 rounded-md border border-mk-border px-1.5 py-0.5 text-[11px] text-mk-faint sm:block">ESC</kbd>
                    <button
                        type="button"
                        onClick={close}
                        className="flex h-11 shrink-0 items-center rounded-lg px-3 text-[15px] font-medium text-mk-primary active:bg-mk-surface-alt sm:hidden"
                    >
                        Anuluj
                    </button>
                </div>

                <div
                    ref={listRef}
                    id="mk-palette-list"
                    role="listbox"
                    aria-label="Wyniki"
                    onTouchMove={onListTouchMove}
                    className="min-h-0 flex-1 overflow-y-auto overscroll-contain py-2 pb-[calc(8px+env(safe-area-inset-bottom))] sm:max-h-[52vh] sm:flex-none sm:pb-2"
                >
                    {results.length === 0 ? (
                        <div className="px-4 py-10 text-center text-sm text-mk-faint">Brak wyników dla „{q}”</div>
                    ) : groups.map((g) => (
                        <div key={g.name} role="group" aria-label={g.name} className="mb-1">
                            <div aria-hidden className="px-4 py-1 text-[11px] font-semibold uppercase tracking-wide text-mk-faint">{g.name}</div>
                            {g.items.map(({ cmd, i }) => {
                                const Icon = cmd.icon;
                                const on = i === active;
                                return (
                                    <button key={cmd.id} id={`mk-cmd-${cmd.id}`} type="button" role="option" aria-selected={on} tabIndex={-1} data-idx={i}
                                        onMouseMove={() => setActive(i)} onClick={() => go(cmd)}
                                        className={`flex min-h-12 w-full items-center gap-3 px-4 py-2 text-left transition-colors active:bg-mk-primary/10 sm:min-h-10 ${on ? 'bg-mk-primary/10' : ''}`}>
                                        <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg sm:h-7 sm:w-7 ${on ? 'bg-mk-primary text-white' : 'bg-mk-surface-alt text-mk-muted'}`}>
                                            <Icon size={15} aria-hidden />
                                        </span>
                                        <span className="min-w-0 flex-1">
                                            <span className="block truncate text-[15px] font-medium text-mk-text sm:text-sm">{cmd.label}</span>
                                            {cmd.sub && <span className="block truncate text-xs text-mk-faint">{cmd.sub}</span>}
                                        </span>
                                        {on && <CornerDownLeft size={14} className="hidden shrink-0 text-mk-faint sm:block" aria-hidden />}
                                    </button>
                                );
                            })}
                        </div>
                    ))}
                </div>

                <div className="hidden items-center justify-between border-t border-mk-border px-4 py-2 text-[11px] text-mk-faint sm:flex">
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
