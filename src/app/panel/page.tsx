import { redirect } from 'next/navigation';

/** Alias — pulpit to Przegląd (`/`). */
export default function PanelAlias() {
    redirect('/');
}
