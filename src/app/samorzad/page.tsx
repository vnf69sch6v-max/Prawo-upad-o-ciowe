import { ComingSoon } from '@/components/ui/ComingSoon';
import { Landmark } from 'lucide-react';

export default function SamorzadPage() {
    return (
        <ComingSoon
            title="Samorząd / Usługi publiczne"
            subtitle="Dane SMUP — usługi publiczne na poziomie samorządów"
            description="Nowy moduł na danych SMUP (System Monitorowania Usług Publicznych): edukacja, polityka społeczna, kultura, drogownictwo, środowisko… z drill-downem po obszarach i mapą Polski wg TERYT."
            phase="Dostępne w Fazie 5"
            icon={Landmark}
        />
    );
}
