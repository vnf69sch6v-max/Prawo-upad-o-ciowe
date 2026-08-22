import { PublicationCalendar } from '@/components/ui/PublicationCalendar';
import { SectionCard } from '@/components/ui/SectionCard';
import { PageHeader, PageEyebrow } from '@/components/ui/PageHeader';

const SOURCES = [
    { name: 'GUS — CPI wstępne', note: 'ok. 13–15. dnia M+1 · dane za miesiąc M · 09:30', url: 'https://stat.gov.pl/kalendarz-roczny/' },
    { name: 'GUS — CPI flash (szybki szacunek)', note: 'ostatni dzień roboczy miesiąca M · dane za M', url: 'https://stat.gov.pl/kalendarium/' },
    { name: 'GUS — PKB (szybki szacunek)', note: 'kwartalnie · ~13–14. dnia po kwartale', url: 'https://stat.gov.pl/kalendarz-roczny/' },
    { name: 'GUS — rynek pracy, produkcja, sprzedaż', note: 'harmonogram miesięczny GUS', url: 'https://stat.gov.pl/dla-mediow/harmonogramy-publikacji-danych/' },
    { name: 'GUS — obroty handlu zagranicznego', note: 'miesięcznie · ok. 9. dnia M+1 · DBHZ', url: 'https://stat.gov.pl/obszary-tematyczne/ceny-handel/handel/' },
    { name: 'NBP — Decyzje RPP (stopy)', note: 'wg kalendarza posiedzeń RPP', url: 'https://nbp.pl/polityka-pieniezna/decyzje-rpp/' },
    { name: 'NBP — rachunek bieżący', note: 'kwartalnie · saldo transakcji z zagranicą', url: 'https://nbp.pl/home/statystyka/rachunek-biezacy/rachunek-biezacy.html' },
    { name: 'Eurostat — HICP (porównania UE)', note: 'miesięcznie · opóźnienie vs GUS · tylko benchmark UE', url: 'https://ec.europa.eu/eurostat' },
];

export default function PublikacjePage() {
    return (
        <div className="mk-fade-in space-y-6">
            <PageHeader
                eyebrow={<PageEyebrow section="Publikacje" />}
                title="Publikacje"
                subtitle={
                    <>
                        Kalendarz publikacji danych i źródła statystyk
                        <span className="mt-1 block text-xs text-mk-faint">
                            Daty w kalendarzu = dzień publikacji. Nazwa wydarzenia wskazuje okres referencyjny danych (np. „dane za lipiec").
                        </span>
                    </>
                }
            />

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                <PublicationCalendar className="lg:col-span-2" />
                <SectionCard title="Źródła i częstotliwość" titleVariant="label" editorial>
                    <ul className="divide-y divide-mk-border">
                        {SOURCES.map((s) => (
                            <li key={s.name} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                                <div>
                                    <div className="text-sm font-medium text-mk-text">{s.name}</div>
                                    <div className="text-xs text-mk-muted">{s.note}</div>
                                </div>
                                <a
                                    href={s.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="shrink-0 text-sm font-medium text-mk-brand transition-colors hover:underline"
                                >
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
