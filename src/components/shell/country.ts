// Kraj, którego dane ogląda użytkownik. Wynika WYŁĄCZNIE z adresu (/japonia/* = Japonia), więc link,
// odświeżenie i przycisk „wstecz” zawsze pokazują to samo — bez ukrytego stanu w localStorage.
export type Country = 'pl' | 'jp';

export interface CountryInfo {
    id: Country;
    label: string;
    code: string;
    /** Strona startowa kraju (logo, przełącznik). */
    home: string;
    /** Źródła danych — podpis w przełączniku. */
    hint: string;
}

export const COUNTRIES: CountryInfo[] = [
    { id: 'pl', label: 'Polska', code: 'PL', home: '/', hint: 'GUS, NBP, Eurostat, GPW' },
    { id: 'jp', label: 'Japonia', code: 'JP', home: '/japonia', hint: 'Inflacja i rynki · jen, stopa BOJ' },
];

export const JP_ROOT = '/japonia';

export function countryOf(pathname: string): Country {
    return pathname === JP_ROOT || pathname.startsWith(`${JP_ROOT}/`) ? 'jp' : 'pl';
}

export function countryInfo(id: Country): CountryInfo {
    return COUNTRIES.find((c) => c.id === id)!;
}
