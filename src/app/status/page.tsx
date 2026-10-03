import type { Metadata } from 'next';
import { StatusView } from '@/components/status/StatusView';

export const metadata: Metadata = {
    title: 'Stan danych — Savori',
    description:
        'Czy dane na Savori są aktualne: najnowszy okres każdego zbioru wobec harmonogramu publikacji GUS, NBP, Eurostatu i giełdy.',
};

export default function StatusPage() {
    return <StatusView />;
}
