import { ComingSoon } from '@/components/ui/ComingSoon';
import { TrendingUp } from 'lucide-react';

export default function RynkiPage() {
    return (
        <ComingSoon
            title="Rynki"
            subtitle="Kursy walut, GPW, obligacje, złoto, handel zagraniczny"
            description="Moduł rynkowy — kursy NBP, indeksy GPW (WIG20), krzywa rentowności obligacji i bilans handlowy w nowym interfejsie."
            phase="Dostępne w Fazie 3"
            icon={TrendingUp}
            links={[
                { href: '/fx', label: 'Kursy (obecny)' },
                { href: '/market', label: 'GPW (obecny)' },
                { href: '/trade', label: 'Handel (obecny)' },
            ]}
        />
    );
}
