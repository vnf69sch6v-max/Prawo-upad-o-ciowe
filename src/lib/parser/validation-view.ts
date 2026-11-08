// PS3b-2a (docs/specs/2026-11-08-parser-ps3b2-kontrole-spojnosci.md): kontrole spójności w widoku. Czyste, bez React.
// `detail` powstaje w parserze z `toLocaleString("en-US")` (XBRL) albo `toLocaleString()` (PDF), a wyświetlamy po polsku:
// grupy tysięcy twardą spacją, przecinek dziesiętny, minus U+2212, ujemna liczba po operatorze w nawiasie. Eksport zostaje bez zmian.
import { validationNamePl } from "./copy.pl";
import type { Detection, ValidationResult } from "./types";

const NBSP = " ";
const MINUS = "−";

// Liczba w stylu en-US: grupy po przecinku („38,752”, „1,234.5”) albo zwykła („2791”, „-390”, „0.5”).
// Zapis już polski („38 752”) nie ma przecinka-grupy, więc zostaje nietknięty.
const NUMBER = /(-?)(\d{1,3}(?:,\d{3})+(?:\.\d+)?|\d+(?:\.\d+)?)/g;

export function formatEquationPl(detail: string): string {
  const formatted = detail.replace(NUMBER, (_m, sign: string, body: string, offset: number, whole: string) => {
    const [int, frac] = body.split(".");
    const grouped = int.split(",").join(NBSP); // grupy tylko tam, gdzie parser je podał; „2791” zostaje
    const num = frac !== undefined ? `${grouped},${frac}` : grouped;
    if (!sign) return num;
    // „−” po operatorze (a − -390, a + -390) wchodzi w nawias; na początku albo po „=”/„vs” zostaje goły.
    const before = whole.slice(0, offset).trimEnd();
    const afterOperator = /[+−]$/.test(before);
    return afterOperator ? `(${MINUS}${num})` : `${MINUS}${num}`;
  });
  return formatted;
}

export interface ValidationItem {
  namePl: string;
  equationPl: string;
  passed: boolean;
}

export interface ValidationView {
  state: "none" | "ok" | "fail";
  passed: number;
  total: number;
  items: ValidationItem[];
  failed: ValidationItem[];
  /** Jednostka raportu do zdania pod listą, np. „mln USD”; pusta, gdy nieznana. */
  unitNote: string;
}

const UNIT_PL: Record<number, string> = { 1: "", 1e3: "tys.", 1e6: "mln", 1e9: "mld" };

export function summarizeValidation(
  validation: ValidationResult,
  detection: Pick<Detection, "unitScale" | "currency">,
): ValidationView {
  const items = validation.checks.map((c) => ({
    namePl: validationNamePl(c.name),
    equationPl: formatEquationPl(c.detail),
    passed: c.passed,
  }));
  const failed = items.filter((i) => !i.passed);
  const unit = [UNIT_PL[detection.unitScale] ?? "", detection.currency ?? ""].filter(Boolean).join(" ");
  return {
    state: items.length === 0 ? "none" : failed.length === 0 ? "ok" : "fail",
    passed: items.length - failed.length,
    total: items.length,
    items,
    failed,
    unitNote: unit,
  };
}
