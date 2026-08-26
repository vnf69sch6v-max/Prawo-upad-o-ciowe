// lib/patterns.ts
// Convention-agnostic registry of canonical metrics and their synonyms. The
// matcher anchors on the row LABEL (text before the first number), so issuer
// naming differences are absorbed here rather than in the parser. Nothing in
// this file references a specific company.

import type { MetricKey, StatementType } from "./types";

export type MatchType = "exact" | "prefix";
export type Tier = "primary" | "secondary";

export interface Synonym {
  text: string;
  match: MatchType;
  tier: Tier;
}

export interface MetricPattern {
  key: MetricKey;
  label: string;
  statement: StatementType;
  /** Ordered by priority; the first synonym that produces a candidate wins. */
  synonyms: Synonym[];
  exclude: string[];
  /** When false (default), percent cells are not accepted as the value. */
  allowPercent?: boolean;
  /** Expected sign of the headline value, used only for display hints. */
  magnitude?: boolean; // true => report absolute value (e.g. capex, buybacks)
}

const p = (text: string, match: MatchType = "exact"): Synonym => ({
  text,
  match,
  tier: "primary",
});
const s = (text: string, match: MatchType = "exact"): Synonym => ({
  text,
  match,
  tier: "secondary",
});

/** Normalise a label for comparison: lowercase, unify quotes, drop (unaudited)/colon,
 *  strip PAS letter/Roman prefixes (A. / III. / c)) and trailing (A-B) formulae.
 *  Polish IFRS writes "Zysk/(strata) netto" — treat "/(" as a space so it matches
 *  the PAS form "Zysk (strata) netto". */
export function normalizeLabel(input: string): string {
  return input
    .toLowerCase()
    .replace(/\/\(/g, " (")
    .replace(/[’‘]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/\(unaudited\)/g, " ")
    .replace(/\(niebadane\)/gi, " ")
    // PAS letter / roman / lettered-list prefixes: "A.", "A ", "III.", "c)", "VI."
    .replace(/^[a-ząćęłńóśźż]\s+(?=[a-ząćęłńóśźż])/i, "")
    .replace(/^(?:[a-ząćęłńóśźż]|[ivxlcdm]{1,6}|\d+)\s*[.)]\s+/i, "")
    // Trailing cross-reference formulae: (A-B), (C+D-E), (I-J-K), (F+/-D)
    .replace(/\s*\([a-z0-9+\-/\s]+\)\s*$/i, "")
    .replace(/\s+/g, " ")
    .replace(/\s*[,:;.]\s*$/, "")
    .trim();
}

export function labelMatches(rawLabel: string, syn: Synonym): boolean {
  const label = normalizeLabel(rawLabel);
  const target = normalizeLabel(syn.text);
  if (!target) return false;
  if (syn.match === "exact") return label === target;
  if (!label.startsWith(target)) return false;
  const rest = label.slice(target.length);
  return rest === "" || /^[\s\-(,:]/.test(rest);
}

export function isExcluded(rawLabel: string, excludes: string[]): boolean {
  const label = normalizeLabel(rawLabel);
  return excludes.some((ex) => label.includes(normalizeLabel(ex)));
}

export const PATTERNS: MetricPattern[] = [
  // ---- Income statement ----
  {
    key: "revenue",
    label: "Revenue",
    statement: "income",
    synonyms: [
      p("Total revenue"),
      p("Total revenues"),
      p("Total net sales"),
      p("Net sales"),
      p("Net revenues"),
      p("Net revenue"),
      p("Revenues"),
      // Polish PAS / NewConnect
      p("Przychody netto ze sprzedaży i zrównane z nimi"),
      p("Przychody netto ze sprzedaży"),
      p("Przychody ze sprzedaży"),
      s("Revenue", "prefix"),
    ],
    exclude: [
      "deferred",
      "unearned",
      "remaining performance obligation",
      "cost of",
      "costs and operating",
      "total costs",
      "contract with customers",
      "by segment",
      "produktów",
      "towarów",
      "jednostek powiązanych",
    ],
  },
  {
    key: "costOfRevenue",
    label: "Cost of revenue",
    statement: "income",
    synonyms: [
      p("Total cost of revenue"),
      p("Total cost of sales"),
      p("Cost of revenue"),
      p("Cost of sales"),
      p("Cost of goods sold"),
      p("COGS"),
      // PAS by-nature: total operating costs by nature (maps to Rev − Cost = Gross)
      p("Koszty działalności operacyjnej"),
      p("Koszt własny sprzedaży"),
      p("Koszty sprzedanych produktów, usług, towarów i materiałów"),
      p("Koszty sprzedanych produktów"),
    ],
    exclude: ["excluding", "depreciation shown"],
    magnitude: true,
  },
  {
    key: "grossProfit",
    label: "Gross profit",
    statement: "income",
    synonyms: [
      p("Gross profit"),
      p("Gross margin"),
      // PAS closest analogue (sales result after by-nature opex)
      p("Zysk (strata) ze sprzedaży"),
      p("Zysk ze sprzedaży"),
      p("Strata ze sprzedaży"),
      p("Zysk (strata) brutto na sprzedaży"),
      p("Zysk brutto na sprzedaży"),
    ],
    exclude: ["percent", "rate", "%"],
  },
  {
    key: "rAndD",
    label: "Research & development",
    statement: "income",
    synonyms: [p("Research and development"), p("Research and development expenses"), p("R&D")],
    exclude: ["tax credit", "in process"],
    magnitude: true,
  },
  {
    key: "sellingMarketing",
    label: "Sales & marketing",
    statement: "income",
    synonyms: [p("Sales and marketing"), p("Selling and marketing"), p("Selling and distribution")],
    exclude: ["general"],
    magnitude: true,
  },
  {
    key: "generalAdmin",
    label: "General & administrative",
    statement: "income",
    synonyms: [p("General and administrative"), p("General and administrative expenses")],
    exclude: ["selling"],
    magnitude: true,
  },
  {
    key: "sga",
    label: "Selling, general & administrative",
    statement: "income",
    synonyms: [
      p("Selling, general and administrative"),
      p("Selling, general and administrative expenses"),
      p("Sales, general and administrative"),
      p("Sales, general and administrative expenses"),
      p("General and administrative expenses, and selling"),
      p("SG&A"),
    ],
    exclude: [],
    magnitude: true,
  },
  {
    key: "totalOpEx",
    label: "Total operating expenses",
    statement: "income",
    // Bare "Operating expenses" is deliberately excluded — it collides with the
    // per-segment opex rows. When absent, the parser computes it from R&D+S&M+G&A.
    synonyms: [p("Total operating expenses"), p("Total costs and expenses"), p("Total operating costs and expenses")],
    exclude: ["other", "by segment", "income", "total costs and operating"],
    magnitude: true,
  },
  {
    key: "operatingIncome",
    label: "Operating income",
    statement: "income",
    synonyms: [
      p("Operating income"),
      p("Operating income (loss)"),
      p("Operating loss"),
      p("Income from operations"),
      p("Loss from operations"),
      p("Operating profit"),
      p("Zysk (strata) z działalności operacyjnej"),
      p("Zysk z działalności operacyjnej"),
      p("Strata z działalności operacyjnej"),
      p("Zysk (strata) na działalności operacyjnej"),
      p("Zysk na działalności operacyjnej"),
      p("Strata na działalności operacyjnej"),
    ],
    exclude: ["segment", "non-operating", "other operating"],
  },
  {
    key: "otherIncome",
    label: "Other income (expense), net",
    statement: "income",
    synonyms: [
      p("Other income (expense), net"),
      p("Other income, net"),
      p("Other expense, net"),
      p("Total other income (expense)"),
      p("Other income (expense)"),
      p("Other income"),
    ],
    exclude: ["comprehensive", "operating", "accumulated", "finansowe", "pozostałe przychody operacyjne"],
  },
  {
    key: "interestExpense",
    label: "Interest expense",
    statement: "income",
    synonyms: [
      p("Interest expense"),
      p("Interest expense, net"),
      p("Interest and debt expense"),
      p("Interest expense on debt"),
      p("Koszty finansowe"),
    ],
    exclude: ["income", "capitalized", "receivable", "przychody"],
    magnitude: true,
  },
  {
    key: "incomeBeforeTax",
    label: "Pre-tax income",
    statement: "income",
    synonyms: [
      p("Income before income taxes"),
      p("Income before income tax"),
      p("Income (loss) before income taxes"),
      p("Loss before income taxes"),
      p("Income before provision for income taxes"),
      p("Income before taxes"),
      p("Loss before taxes"),
      p("Income before income tax expense"),
      p("Zysk (strata) brutto"),
      p("Zysk brutto"),
      p("Strata brutto"),
      p("Zysk (strata) przed opodatkowaniem"),
      p("Zysk przed opodatkowaniem"),
    ],
    exclude: ["equity", "noncontrolling"],
  },
  {
    key: "incomeTax",
    label: "Income tax",
    statement: "income",
    synonyms: [
      p("Provision for income taxes"),
      p("Provision for (benefit from) income taxes"),
      p("Income tax expense"),
      p("Income tax expense (benefit)"),
      p("Total income tax expense"),
      p("Benefit from income taxes"),
      p("Podatek dochodowy"),
    ],
    exclude: ["deferred", "current income tax", "before", "odroczonego"],
    magnitude: true,
  },
  {
    key: "netIncome",
    label: "Net income",
    statement: "income",
    synonyms: [
      p("Net income"),
      p("Net loss"),
      p("Net income (loss)"),
      p("Net earnings"),
      p("Profit for the period"),
      p("Zysk (strata) netto"),
      p("Zysk netto"),
      p("Strata netto"),
      s("Net income attributable to", "prefix"),
      s("Net loss attributable to", "prefix"),
    ],
    exclude: [
      "comprehensive",
      "attributable to noncontrolling",
      "attributable to redeemable noncontrolling",
      "available for common",
      "per share",
      "before",
      "less:",
      "lat ubiegłych",
      "roku obrotowego",
      "odpisy z zysku",
    ],
  },

  // ---- Balance sheet ----
  {
    key: "totalAssets",
    label: "Total assets",
    statement: "balance",
    synonyms: [p("Total assets"), p("Aktywa razem"), p("Suma aktywów")],
    exclude: ["current", "non-current", "noncurrent", "by segment", "deferred tax", "trwałe", "obrotowe"],
  },
  {
    key: "totalCurrentAssets",
    label: "Total current assets",
    statement: "balance",
    synonyms: [p("Total current assets"), p("Aktywa obrotowe")],
    exclude: [],
  },
  {
    key: "accountsReceivable",
    label: "Accounts receivable",
    statement: "balance",
    // "net of allowance …" forms first so the balance-sheet line (whose label
    // embeds the allowance $ amount) wins over the cash-flow change-in-AR row.
    synonyms: [
      p("Accounts receivable, net of allowance", "prefix"),
      p("Accounts receivable, net", "prefix"),
      p("Trade receivables, net", "prefix"),
      p("Accounts receivable", "prefix"),
      p("Należności krótkoterminowe"),
    ],
    exclude: ["other", "related party", "income tax", "days", "changes in", "decrease", "increase", "długoterminowe"],
  },
  {
    key: "inventories",
    label: "Inventories",
    statement: "balance",
    synonyms: [p("Inventories"), p("Inventory"), p("Inventories, net"), p("Zapasy")],
    exclude: ["change", "decrease", "increase"],
  },
  {
    key: "goodwill",
    label: "Goodwill",
    statement: "balance",
    synonyms: [p("Goodwill"), p("Goodwill, net"), p("Wartość firmy")],
    exclude: ["impairment", "and intangible", "accumulated", "ujemna"],
  },
  {
    key: "intangiblesNet",
    label: "Intangible assets, net",
    statement: "balance",
    synonyms: [
      p("Intangible assets, net"),
      p("Intangible assets"),
      p("Other intangible assets, net"),
      p("Wartości niematerialne i prawne"),
    ],
    exclude: ["amortization", "goodwill", "zaliczki", "nabycie"],
  },
  {
    key: "ppeNet",
    label: "Property & equipment, net",
    statement: "balance",
    // "net of accumulated depreciation of $X" first (digits embedded in label),
    // so the balance-sheet line beats a bare note line and the "at cost" row.
    synonyms: [
      p("Property and equipment, net of accumulated depreciation", "prefix"),
      p("Property, plant and equipment, net of accumulated depreciation", "prefix"),
      p("Property and equipment, net", "prefix"),
      p("Property, plant and equipment, net", "prefix"),
      p("Rzeczowe aktywa trwałe"),
    ],
    exclude: ["additions", "purchases", "gross", "proceeds", "at cost", "nabycie"],
    magnitude: true,
  },
  {
    key: "totalCurrentLiabilities",
    label: "Total current liabilities",
    statement: "balance",
    synonyms: [p("Total current liabilities"), p("Zobowiązania krótkoterminowe")],
    exclude: [],
  },
  {
    key: "totalLiabilities",
    label: "Total liabilities",
    statement: "balance",
    synonyms: [
      p("Total liabilities"),
      p("Zobowiązania i rezerwy na zobowiązania"),
      p("Zobowiązania i rezerwy na zobowiąz", "prefix"),
    ],
    exclude: ["and stockholders", "and shareholders", "and equity", "and redeemable", "current", "krótkoterminowe", "długoterminowe"],
  },
  {
    key: "totalEquity",
    label: "Total equity",
    statement: "balance",
    synonyms: [
      p("Total stockholders' equity"),
      p("Total shareholders' equity"),
      p("Total stockholders' equity (deficit)"),
      p("Total stockholders' deficit"),
      p("Total equity"),
      p("Kapitał (fundusz) własny"),
      p("Kapitał własny"),
      s("Total stockholders' equity attributable to", "prefix"),
      s("Total shareholders' equity attributable to", "prefix"),
    ],
    exclude: ["and redeemable", "mezzanine", "liabilities", "noncontrolling interest", "podstawowy", "zapasowy"],
  },
  {
    key: "cash",
    label: "Cash & equivalents",
    statement: "balance",
    synonyms: [
      p("Cash and cash equivalents"),
      p("Cash and equivalents"),
      p("Cash, cash equivalents and restricted cash"),
      p("Cash, cash equivalents, and restricted cash"),
      p("środki pieniężne i inne aktywa pieniężne"),
      p("środki pieniężne w kasie i na rachunkach"),
      p("Środki pieniężne i inne aktywa pieniężne"),
      p("Środki pieniężne w kasie i na rachunkach"),
      p("Środki pieniężne i ekwiwalenty środków pieniężnych"),
      p("Środki pieniężne i ekwiwalenty"),
    ],
    exclude: [
      "short-term investments",
      "effect of",
      "net change",
      "net increase",
      "net decrease",
      "end of",
      "beginning of",
      "supplemental",
      "restricted",
      "including",
      "przepływy",
      "początek",
      "koniec okresu",
    ],
  },
  {
    key: "shortTermInvestments",
    label: "Short-term investments",
    statement: "balance",
    // "Marketable securities" / "Marketable debt securities" are the current
    // short-term investment line for many issuers (e.g. NVIDIA). Equity
    // securities are typically non-current, so they are excluded from liquidity.
    synonyms: [
      p("Short-term investments"),
      p("Short term investments"),
      p("Marketable securities"),
      p("Marketable debt securities"),
      p("Short-term marketable securities"),
    ],
    exclude: ["maturities", "gross", "available-for-sale by", "equity", "long-term", "non-current", "purchases", "proceeds"],
  },
  {
    key: "totalCashAndStInvestments",
    label: "Total cash + ST investments",
    statement: "balance",
    synonyms: [
      p("Total cash, cash equivalents, and short-term investments"),
      p("Total cash, cash equivalents and short-term investments"),
    ],
    exclude: [],
  },
  {
    key: "currentDebt",
    label: "Current portion of debt",
    statement: "balance",
    synonyms: [
      p("Current portion of long-term debt"),
      p("Current maturities of long-term debt"),
      p("Current portion of long-term debt, net"),
      p("Short-term debt"),
      p("Short-term borrowings"),
      p("Debt, current"),
      p("Current portion of debt"),
      p("Notes payable, current"),
    ],
    exclude: ["lease", "operating", "finance lease", "długoterminowe"],
    magnitude: true,
  },
  {
    key: "longTermDebt",
    label: "Long-term debt",
    statement: "balance",
    synonyms: [
      p("Long-term debt"),
      p("Long-term debt, net of current portion"),
      p("Long-term debt, net"),
      p("Long-term borrowings"),
      p("Debt, non-current"),
      p("Notes payable, noncurrent"),
      // PAS: total long-term liabilities line (dominated by bank loans for this issuer class)
      p("Zobowiązania długoterminowe"),
    ],
    exclude: ["current portion", "lease", "operating", "finance lease", "current maturities", "rezerwy"],
    magnitude: true,
  },
  {
    key: "totalDebt",
    label: "Total debt",
    statement: "balance",
    synonyms: [p("Total debt"), p("Total borrowings"), p("Total debt, net")],
    exclude: ["investments", "lease", "securities", "fair value"],
    magnitude: true,
  },

  // ---- Cash flow ----
  {
    key: "ocf",
    label: "Operating cash flow",
    statement: "cashflow",
    synonyms: [
      p("Net cash from operations"),
      p("Net cash provided by operating activities"),
      p("Net cash provided by (used in) operating activities"),
      p("Net cash (used in) provided by operating activities"),
      p("Net cash used in operating activities"),
      p("Cash generated by operating activities"),
      p("Cash flows from operating activities"),
      p("Przepływy pieniężne netto z działalności operacyjnej"),
    ],
    exclude: ["investing", "financing", "before changes", "supplemental", "inwestycyjnej", "finansowej"],
  },
  {
    key: "capex",
    label: "Capital expenditures",
    statement: "cashflow",
    synonyms: [
      p("Additions to property and equipment"),
      p("Purchases of property and equipment, including capitalized internal-use software"),
      p("Purchases related to property and equipment and intangible assets"),
      p("Purchases of property and equipment"),
      p("Purchases of property, plant and equipment"),
      p("Purchase of property, plant and equipment"),
      p("Purchase of property and equipment, including capitalized internal-use software"),
      p("Payments for property and equipment"),
      p("Capital expenditures"),
      p("Nabycie wartości niematerialnych i prawnych oraz"),
      p("Nabycie wartości niematerialnych i prawnych oraz rzeczowych aktywów trwałych"),
      s("Additions to property", "prefix"),
      s("Purchases of property", "prefix"),
      s("Purchase of property", "prefix"),
      s("Purchases related to property", "prefix"),
      s("Nabycie wartości niematerialnych", "prefix"),
    ],
    exclude: ["proceeds", "disposal", "sale of", "zbycie"],
    magnitude: true,
  },
  {
    key: "depreciationAmortization",
    label: "Depreciation & amortization",
    statement: "cashflow",
    synonyms: [
      p("Depreciation, amortization, and other"),
      p("Depreciation, amortization and other"),
      p("Depreciation and amortization"),
      p("Depreciation, depletion and amortization"),
      p("Depreciation"),
      p("Amortyzacja"),
    ],
    exclude: ["accumulated", "less", "property and equipment, net"],
    magnitude: true,
  },
  {
    key: "dividendsPaid",
    label: "Dividends paid",
    statement: "cashflow",
    synonyms: [
      p("Common stock cash dividends paid"),
      p("Cash dividends paid"),
      p("Dividends paid"),
      p("Payments of dividends"),
      p("Payments related to dividends"),
      p("Dividends and dividend equivalents paid"),
      p("dywidendy i udziały w zyskach"),
    ],
    exclude: ["received", "per share", "noncontrolling", "preferred", "odsetki"],
    magnitude: true,
  },
  {
    key: "buybacks",
    label: "Share repurchases",
    statement: "cashflow",
    synonyms: [
      p("Common stock repurchased"),
      p("Repurchases of common stock"),
      p("Payments related to repurchases of common stock"),
      p("Payments for repurchase of common stock"),
      p("Repurchase of common stock"),
      p("Purchases of treasury stock"),
      p("Repurchases of common stock and related"),
      s("Payments related to repurchases", "prefix"),
    ],
    exclude: ["proceeds", "issuance", "per share", "employee"],
    magnitude: true,
  },
  {
    key: "stockComp",
    label: "Stock-based compensation",
    statement: "cashflow",
    synonyms: [
      p("Stock-based compensation expense"),
      p("Stock-based compensation"),
      p("Share-based compensation expense"),
      p("Share-based compensation"),
    ],
    exclude: ["tax", "excess", "windfall"],
    magnitude: true,
  },
];

/** The 11 headline metrics whose presence drives the "N/11 matched" indicator. */
export const HEADLINE_METRICS: MetricKey[] = [
  "revenue",
  "costOfRevenue",
  "grossProfit",
  "operatingIncome",
  "netIncome",
  "totalAssets",
  "totalEquity",
  "cash",
  "totalDebt",
  "ocf",
  "capex",
];
