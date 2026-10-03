// Tryb cache'u zapytań do źródeł GUS z limitem (BDL, DBW, SMUP) wewnątrz `withCache`.
//
// Ścieżka użytkownika (chybienie Firestore) → Next Data Cache 24 h: gdy kilka funkcji naraz nie trafi
// w cache, nie palimy wspólnego limitu DBW (~100 żądań / 15 min) tymi samymi zapytaniami.
// Cron `?refresh=1` → `no-store`: Data Cache jest stale-while-revalidate, więc pierwsze wywołanie po
// wygaśnięciu oddaje STARĄ odpowiedź, a `withCache` zapisuje ją do Firestore ze świeżym znacznikiem
// czasu. Nowa publikacja GUS docierała przez to na stronę z jedno-, dwudniowym opóźnieniem mimo
// codziennego crona (ten sam mechanizm zamroził kiedyś kursy NBP na tygodnie).
export function gusFetchInit(force: boolean): RequestInit {
    return force ? { cache: 'no-store' } : { next: { revalidate: 86400 } };
}
