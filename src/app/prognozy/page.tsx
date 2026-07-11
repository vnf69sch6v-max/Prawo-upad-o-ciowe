import { ComingSoon } from '@/components/ui/ComingSoon';
import { Sparkles } from 'lucide-react';

export default function PrognozyPage() {
    return (
        <ComingSoon
            title="Prognozy"
            subtitle="Żywy nowcast CPI z koszyka, PKB, PMI, reguła Taylora"
            description="Flagowy moduł prognoz: inflacja CPI liczona na bieżąco z koszyka COICOP 2026, nowcast PKB i PMI oraz symulatory. Buduje na istniejących modelach (cpi-forecaster, gdp-nowcast, leading)."
            phase="Dostępne w Fazie 4"
            icon={Sparkles}
            links={[
                { href: '/nowcast', label: 'Nowcast PKB (obecny)' },
                { href: '/tools', label: 'Narzędzia (obecny)' },
            ]}
        />
    );
}
