/** Identyfikator sesji Stripe Checkout. Wąski wzorzec, bo ląduje w ścieżce dokumentu Firestore. */
export const CHECKOUT_SESSION_ID = /^cs_(test|live)_[A-Za-z0-9]{8,}$/;

export function isCheckoutSessionId(id: unknown): id is string {
    return typeof id === 'string' && id.length <= 255 && CHECKOUT_SESSION_ID.test(id);
}
