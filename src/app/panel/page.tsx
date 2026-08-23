import { redirect } from 'next/navigation';

/** Alias — pulpit to Przegląd (`/`), nie osobna pusta strona. */
export default function PanelAlias() {
    redirect('/');
}
