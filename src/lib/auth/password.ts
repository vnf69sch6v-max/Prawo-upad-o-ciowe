/** Minimum przy rejestracji. Firebase odrzuca krótsze niż 6, my wymagamy 8 zanim pójdzie żądanie. */
export const MIN_PASSWORD_LENGTH = 8;

/** `null` = hasło nadaje się do założenia konta. */
export function passwordProblem(password: string, confirm: string): string | null {
    if (password.length < MIN_PASSWORD_LENGTH) return `Hasło musi mieć co najmniej ${MIN_PASSWORD_LENGTH} znaków.`;
    if (password !== confirm) return 'Hasła nie są takie same.';
    return null;
}
