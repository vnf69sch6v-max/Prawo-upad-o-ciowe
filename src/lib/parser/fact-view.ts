// PS3b-2b-1 (docs/specs/2026-11-09-parser-ps3b2-fakty-w-oknie-zrodla.md): czyste formatowanie faktów XBRL do okna źródła.
import { pl } from "./copy.pl";
import type { FactRef } from "./types";

const NBSP = "\u00a0";
const MINUS = "\u2212";

/** `decimals` z XBRL po polsku: „−6 = do miliona”, „INF = dokładnie”, brak = „nie podano”. */
export function describeDecimals(decimals: string | null): string {
  if (decimals === null || decimals === "") return pl.source.decimalsNone;
  if (/^inf$/i.test(decimals)) return `INF = ${pl.source.decimalsExact}`;
  const d = Number(decimals);
  if (!Number.isFinite(d)) return decimals;
  const label = d.toString().replace("-", MINUS);
  const step: Record<string, string> = {
    "-9": "do miliarda", "-6": "do miliona", "-3": "do tysiąca", "-2": "do setek", "-1": "do dziesiątek", "0": "do jedności",
  };
  return `${label} = ${step[String(d)] ?? (d > 0 ? `do ${d} miejsc po przecinku` : `do 10^${-d}`)}`;
}

/** Wartość pełna z jednostką: „14 575 000 000 USD”, akcje „1 234 shares”, EPS „USD/shares” bez doklejania do kwoty. */
export function formatFullValue(value: number, unit: string | null): string {
  const neg = value < 0;
  const abs = Math.abs(value);
  const fixed = Number.isInteger(abs) ? String(abs) : abs.toFixed(4).replace(/0+$/, "").replace(/\.$/, "");
  const [int, frac] = fixed.split(".");
  const grouped = int.replace(/\B(?=(\d{3})+(?!\d))/g, NBSP);
  const num = `${neg ? MINUS : ""}${grouped}${frac ? `,${frac}` : ""}`;
  return unit ? `${num}${NBSP}${unit}` : num;
}

/** „2026-07-01|2026-09-30” → „2026-07-01 → 2026-09-30”; data bilansu zostaje sama. */
export function formatFactPeriod(sig: string): string {
  return sig.includes("|") ? sig.replace("|", " \u2192 ") : sig;
}

/** Wykładnik skali: 6 → „10^6 · mln”. */
export function describeScale(scale: number): string {
  const name: Record<number, string> = { 0: "jednostki", 3: "tys.", 6: "mln", 9: "mld" };
  return `10^${scale}${name[scale] ? ` · ${name[scale]}` : ""}`;
}

/** PS3b-2b-2: karta klikniętej komórki pierwsza; nieznany okres = brak wyróżnienia, kolejność kolumn bez zmian. */
export function orderFactRefs(refs: FactRef[] | undefined, periodKey?: string): { ordered: FactRef[]; highlighted: FactRef | null } {
  const list = refs ?? [];
  const hit = periodKey ? list.find((f) => f.periodKey === periodKey) ?? null : null;
  return { ordered: hit ? [hit, ...list.filter((f) => f !== hit)] : list, highlighted: hit };
}
