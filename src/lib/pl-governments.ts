// Kalendarz rządów Polski (III RP) do nakładki „rządy a gospodarka".
// Lata przypisane wg ZASADY WIĘKSZOŚCI: wybory są jesienią, więc rok wyborczy liczy się
// do rządu, który rządził większość roku (budżet danego roku ustala poprzednia ekipa).
// Kolory nawiązują do barw partyjnych; sąsiednie okresy zawsze się różnią.
export interface Gov {
    party: string;        // skrót głównej partii
    label: string;        // koalicja
    pm: string;           // premier(zy)
    orient: string;       // orientacja
    from: number;         // pierwszy rok (włącznie)
    to: number;           // ostatni rok (włącznie); 9999 = trwa
    color: string;
}

export const PL_GOVERNMENTS: Gov[] = [
    { party: 'AWS', label: 'AWS–UW', pm: 'Buzek', orient: 'centroprawica', from: 1998, to: 2001, color: '#CA8A04' },
    { party: 'SLD', label: 'SLD–UP–PSL', pm: 'Miller · Belka', orient: 'lewica', from: 2002, to: 2005, color: '#DC2626' },
    { party: 'PiS', label: 'PiS–SO–LPR', pm: 'Marcinkiewicz · Kaczyński', orient: 'prawica', from: 2006, to: 2007, color: '#1E40AF' },
    { party: 'PO', label: 'PO–PSL', pm: 'Tusk · Kopacz', orient: 'centrum / liberalna', from: 2008, to: 2015, color: '#F97316' },
    { party: 'PiS', label: 'PiS (Zjedn. Prawica)', pm: 'Szydło · Morawiecki', orient: 'prawica / konserwatywna', from: 2016, to: 2023, color: '#1E40AF' },
    { party: 'KO', label: 'KO–TD–Lewica', pm: 'Tusk', orient: 'centrum / koalicja 15.X', from: 2024, to: 9999, color: '#F97316' },
];

/** Rząd rządzący w danym roku (wg zasady większości). */
export function govForYear(year: number): Gov | null {
    return PL_GOVERNMENTS.find((g) => year >= g.from && year <= g.to) ?? null;
}
