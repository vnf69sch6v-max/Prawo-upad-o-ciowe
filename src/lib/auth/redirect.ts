// Dokąd wrócić po logowaniu (`/login?from=…`). Tylko ścieżka na tej samej domenie: proste sprawdzenie
// `startsWith('/') && !startsWith('//')` przepuszczało `/\evil.com` i `/<TAB>/evil.com` — parser URL zamienia
// `\` na `/` i usuwa tabulatory, a `router.push` na obcy origin robi pełne przejście (otwarte przekierowanie).
export function safeRedirectTarget(from: string | null | undefined, origin: string): string {
    if (!from) return '/';
    try {
        const u = new URL(from, origin);
        return u.origin === origin ? `${u.pathname}${u.search}${u.hash}` : '/';
    } catch {
        return '/';
    }
}
