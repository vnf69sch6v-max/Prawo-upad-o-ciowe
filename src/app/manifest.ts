import type { MetadataRoute } from 'next';

// Manifest PWA (serwowany jako /manifest.webmanifest; Next dodaje <link rel="manifest"> sam).
// Celowo BEZ service workera: dane i JS po deployu muszą przychodzić świeże z sieci, a instalacja
// na ekranie głównym działa w Chrome/Safari bez niego. Kolory: theme = biały nagłówek
// (`--color-mk-surface`), tło ekranu startowego = tło strony (`--color-mk-bg`).
// Ikony generowane z glifu logo (lucide `chart-column` na czerwonym kaflu marki #DC2626).
export default function manifest(): MetadataRoute.Manifest {
    return {
        id: '/',
        name: 'Savori — dane o polskiej gospodarce',
        short_name: 'Savori',
        description:
            'Inflacja, PKB, rynek pracy, stopy procentowe, giełda, regiony i newsy finansowe — dane o polskiej gospodarce aktualizowane na bieżąco.',
        lang: 'pl',
        dir: 'ltr',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        background_color: '#F7F8FA',
        theme_color: '#FFFFFF',
        categories: ['finance', 'business', 'news'],
        icons: [
            { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
            { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
            { src: '/icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
        shortcuts: [
            {
                name: 'Rynki',
                description: 'WIG20, kursy walut, stopy procentowe',
                url: '/rynki',
                icons: [{ src: '/icons/shortcut-rynki.png', sizes: '96x96', type: 'image/png' }],
            },
            {
                name: 'Ceny',
                description: 'Inflacja CPI, ceny producenta, nieruchomości',
                url: '/ceny',
                icons: [{ src: '/icons/shortcut-ceny.png', sizes: '96x96', type: 'image/png' }],
            },
            {
                name: 'Kalendarz publikacji',
                short_name: 'Kalendarz',
                description: 'Kiedy GUS i NBP opublikują kolejne dane',
                url: '/publikacje',
                icons: [{ src: '/icons/shortcut-publikacje.png', sizes: '96x96', type: 'image/png' }],
            },
        ],
    };
}
