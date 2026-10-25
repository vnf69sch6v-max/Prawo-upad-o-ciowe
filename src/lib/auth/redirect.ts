// Dokąd wrócić po logowaniu (`/login?from=…`). Tylko ścieżka na tej samej domenie: proste sprawdzenie
// `startsWith('/') && !startsWith('//')` przepuszczało `/\evil.com` i `/<TAB>/evil.com` — parser URL zamienia
// `\` na `/` i usuwa tabulatory, a `router.push` na obcy origin robi pełne przejście (otwarte przekierowanie).
// Sam origin też nie wystarcza: `/.//evil.com` ma origin savori.space, ale pathname `//evil.com`, który
// `router.push` czyta jako adres bez schematu — dlatego wiodące ukośniki zwijamy do jednego.
export function safeRedirectTarget(from: string | null | undefined, origin: string): string {
    if (!from) return '/';
    try {
        const u = new URL(from, origin);
        if (u.origin !== origin) return '/';
        return `/${u.pathname.replace(/^\/+/, '')}${u.search}${u.hash}`;
    } catch {
        return '/';
    }
}
