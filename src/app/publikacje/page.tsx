import { PublicationDatesPanel } from '@/components/ui/PublicationDatesPanel';
import { SectionCard } from '@/components/ui/SectionCard';

const SOURCES = [
    { name: 'GUS — Wskaźniki cen (CPI)', note: 'ok. 15. dnia miesiąca', url: 'https://stat.gov.pl' },
    { name: 'GUS — PKB (szybki szacunek)', note: 'kwartalnie', url: 'https://stat.gov.pl' },
    { name: 'NBP — Decyzje RPP (stopy)', note: 'wg kalendarza posiedzeń', url: 'https://nbp.pl' },
    { name: 'Eurostat — HICP, produkcja, PKB', note: 'miesięcznie', url: 'https://ec.europa.eu/eurostat' },
];

export default function PublikacjePage() {
    return (
        <div className="mk-fade-in space-y-6">
            <div>
                <h1 className="text-3xl font-extrabold tracking-tight text-mk-text">Publikacje</h1>
                <p className="mt-1 text-sm text-mk-muted">Kalendarz publikacji danych i źródła statystyk</p>
            </div>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <PublicationDatesPanel count={8} title="Najbliższe publikacje" />
                <SectionCard title="Źródła i częstotliwość">
                    <ul className="divide-y divide-mk-border">
                        {SOURCES.map((s) => (
                            <li key={s.name} className="flex items-center justify-between gap-3 py-3">
                                <div>
                                    <div className="text-sm font-medium text-mk-text">{s.name}</div>
                                    <div className="text-xs text-mk-muted">{s.note}</div>
                                </div>
                                <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-mk-primary hover:underline">
                                    źródło
                                </a>
                            </li>
                        ))}
                    </ul>
                </SectionCard>
            </div>
        </div>
    );
}
