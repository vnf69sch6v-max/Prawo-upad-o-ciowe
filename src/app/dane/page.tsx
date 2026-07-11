import { ComingSoon } from '@/components/ui/ComingSoon';
import { BarChart3 } from 'lucide-react';

export default function DaneMakroPage() {
    return (
        <ComingSoon
            title="Dane makro"
            subtitle="Inflacja, PKB, produkcja, rynek pracy, stopy procentowe"
            description="Pełny moduł danych makroekonomicznych z interaktywnymi wykresami (M/M vs R/R), mapą regionalną i eksportem CSV. W trakcie migracji do nowego, jasnego interfejsu."
            phase="Dostępne w Fazie 2"
            icon={BarChart3}
            links={[
                { href: '/macro', label: 'Makro (obecny)' },
                { href: '/rates', label: 'Stopy (obecny)' },
                { href: '/labor', label: 'Rynek pracy (obecny)' },
            ]}
        />
    );
}
