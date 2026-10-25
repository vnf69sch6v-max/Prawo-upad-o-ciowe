/** Identyfikator sesji Stripe Checkout. Wąski wzorzec, bo ląduje w ścieżce dokumentu Firestore. */
export const CHECKOUT_SESSION_ID = /^cs_(test|live)_[A-Za-z0-9]{8,}$/;

export function isCheckoutSessionId(id: unknown): id is string {
    return typeof id === 'string' && id.length <= 255 && CHECKOUT_SESSION_ID.test(id);
}

/**
 * Adres hostowanej strony płatności. Przeglądarka robi tam pełne przejście (`location`),
 * nie `fetch` — helper jest w tym pliku, bo klient nie może importować `billing.ts` (`node:crypto`).
 */
export function isStripeCheckoutUrl(raw: unknown): raw is string {
    if (typeof raw !== 'string' || raw.length > 2000) return false;
    try {
        const url = new URL(raw);
        return url.protocol === 'https:' && url.hostname === 'checkout.stripe.com' && !url.username && !url.password;
    } catch {
        return false;
    }
}
