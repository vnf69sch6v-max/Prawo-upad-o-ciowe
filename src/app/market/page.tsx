import { redirect } from 'next/navigation';

// Legacy (stary ciemny motyw) — przekierowanie na nowy odpowiednik po redesignie.
export default function LegacyRedirect() {
    redirect('/rynki?tab=gpw');
}
