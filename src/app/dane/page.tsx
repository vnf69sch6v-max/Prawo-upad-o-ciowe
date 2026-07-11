import { redirect } from 'next/navigation';

// "Dane makro" was split into Ceny / Gospodarka / Rynek pracy.
export default function DaneRedirect() {
    redirect('/gospodarka');
}
