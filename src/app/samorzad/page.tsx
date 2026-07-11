import { redirect } from 'next/navigation';

// "Samorząd" moved under the Regiony domain.
export default function SamorzadRedirect() {
    redirect('/regiony');
}
