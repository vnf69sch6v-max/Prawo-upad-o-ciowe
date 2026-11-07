// lib/ixbrl/concepts.ts — us-gaap concepts per MetricKey (PS3a). One table, one place to review (spec 2026-11-07-parser-ixbrl-html.md).
// Order = priority: the first concept that has a value for some column wins for the whole row; only dimensionless facts count
// (a dimension = a segment/product, never the consolidated figure). XBRL signs already match our metrics: costs, tax and cash
// outflows are positive, `sign="-"` is removed by the reader. ESEF / ifrs-full is PS3c.
import type { MetricKey } from "../types";

export const REVENUE = [
  "Revenues",
  "RevenueFromContractWithCustomerExcludingAssessedTax",
  "RevenueFromContractWithCustomerIncludingAssessedTax",
  "SalesRevenueNet",
];

export const CONCEPTS: Partial<Record<MetricKey, string[]>> = {
  revenue: REVENUE,
  costOfRevenue: ["CostOfRevenue", "CostOfGoodsAndServicesSold", "CostOfGoodsSold"],
  grossProfit: ["GrossProfit"],
  rAndD: ["ResearchAndDevelopmentExpense", "ResearchAndDevelopmentExpenseExcludingAcquiredInProcessCost"],
  sellingMarketing: ["SellingAndMarketingExpense", "MarketingAndAdvertisingExpense"],
  generalAdmin: ["GeneralAndAdministrativeExpense"],
  sga: ["SellingGeneralAndAdministrativeExpense"],
  totalOpEx: ["CostsAndExpenses", "OperatingExpenses", "OperatingCostsAndExpenses"],
  operatingIncome: ["OperatingIncomeLoss"],
  otherIncome: ["OtherNonoperatingIncomeExpense", "NonoperatingIncomeExpense", "NonoperatingGainsLosses"],
  interestExpense: ["InterestExpenseNonoperating", "InterestExpense", "InterestExpenseDebt"],
  incomeBeforeTax: [
    "IncomeLossFromContinuingOperationsBeforeIncomeTaxesExtraordinaryItemsNoncontrollingInterest",
    "IncomeLossFromContinuingOperationsBeforeIncomeTaxesMinorityInterestAndIncomeLossFromEquityMethodInvestments",
    "IncomeLossFromContinuingOperationsBeforeIncomeTaxesDomestic",
  ],
  incomeTax: ["IncomeTaxExpenseBenefit"],
  netIncome: ["NetIncomeLoss", "ProfitLoss"],

  totalAssets: ["Assets"],
  totalCurrentAssets: ["AssetsCurrent"],
  totalCurrentLiabilities: ["LiabilitiesCurrent"],
  accountsReceivable: ["AccountsReceivableNetCurrent", "ReceivablesNetCurrent"],
  inventories: ["InventoryNet"],
  goodwill: ["Goodwill"],
  intangiblesNet: ["IntangibleAssetsNetExcludingGoodwill", "FiniteLivedIntangibleAssetsNet"],
  ppeNet: [
    "PropertyPlantAndEquipmentNet",
    "PropertyPlantAndEquipmentAndFinanceLeaseRightOfUseAssetAfterAccumulatedDepreciationAndAmortization",
  ],
  totalLiabilities: ["Liabilities"],
  totalEquity: ["StockholdersEquity", "StockholdersEquityIncludingPortionAttributableToNoncontrollingInterest"],
  cash: ["CashAndCashEquivalentsAtCarryingValue", "CashCashEquivalentsRestrictedCashAndRestrictedCashEquivalents"],
  shortTermInvestments: ["MarketableSecuritiesCurrent", "ShortTermInvestments", "AvailableForSaleSecuritiesDebtSecuritiesCurrent"],
  totalCashAndStInvestments: ["CashCashEquivalentsAndShortTermInvestments"],
  currentDebt: ["LongTermDebtAndCapitalLeaseObligationsCurrent", "LongTermDebtCurrent", "ShortTermBorrowings", "DebtCurrent"],
  longTermDebt: ["LongTermDebtAndCapitalLeaseObligations", "LongTermDebtNoncurrent", "LongTermNotesPayable"],

  ocf: ["NetCashProvidedByUsedInOperatingActivities", "NetCashProvidedByUsedInOperatingActivitiesContinuingOperations"],
  capex: ["PaymentsToAcquirePropertyPlantAndEquipment", "PaymentsToAcquireProductiveAssets"],
  depreciationAmortization: ["DepreciationDepletionAndAmortization", "DepreciationAndAmortization", "DepreciationAmortizationAndAccretionNet"],
  dividendsPaid: ["PaymentsOfDividends", "PaymentsOfDividendsCommonStock"],
  buybacks: ["PaymentsForRepurchaseOfCommonStock", "PaymentsForRepurchaseOfEquity"],
  stockComp: ["ShareBasedCompensation", "AllocatedShareBasedCompensationExpense"],

  epsBasic: ["EarningsPerShareBasic", "EarningsPerShareBasicAndDiluted"],
  epsDiluted: ["EarningsPerShareDiluted", "EarningsPerShareBasicAndDiluted"],
  dps: ["CommonStockDividendsPerShareDeclared", "CommonStockDividendsPerShareCashPaid"],
  weightedSharesBasic: ["WeightedAverageNumberOfSharesOutstandingBasic", "WeightedAverageNumberOfSharesOutstandingBasicAndDiluted"],
  weightedSharesDiluted: ["WeightedAverageNumberOfDilutedSharesOutstanding", "WeightedAverageNumberOfSharesOutstandingBasicAndDiluted"],
};

/** Per-share and share-count metrics are not scaled like money (EPS) or are scaled as counts (shares). */
export const EPS_KEYS: MetricKey[] = ["epsBasic", "epsDiluted", "dps"];
export const SHARE_KEYS: MetricKey[] = ["weightedSharesBasic", "weightedSharesDiluted"];
export const PER_SHARE_KEYS: MetricKey[] = ["epsBasic", "epsDiluted", "dps", "weightedSharesDiluted", "weightedSharesBasic"];

/** Statements whose columns are the income (duration) columns, matched on the exact period. */
export const BALANCE_KEYS: MetricKey[] = [
  "totalAssets", "totalCurrentAssets", "totalCurrentLiabilities", "accountsReceivable", "inventories", "goodwill",
  "intangiblesNet", "ppeNet", "totalLiabilities", "totalEquity", "cash", "shortTermInvestments",
  "totalCashAndStInvestments", "currentDebt", "longTermDebt",
];
export const CASHFLOW_KEYS: MetricKey[] = ["ocf", "capex", "depreciationAmortization", "dividendsPaid", "buybacks", "stockComp"];

/** Mezzanine equity (redeemable preferred / redeemable NCI) sits between liabilities and equity: A = L + mezzanine + E. */
export const MEZZANINE = [
  "RedeemableNoncontrollingInterestEquityCarryingAmount",
  "TemporaryEquityCarryingAmountIncludingPortionAttributableToNoncontrollingInterests",
  "TemporaryEquityCarryingAmountAttributableToParent",
];
export const NONOPERATING_TOTAL = ["NonoperatingIncomeExpense", "NonoperatingGainsLosses"];
export const INTEREST_INCOME = ["InvestmentIncomeInterest", "InterestIncomeOther", "InterestAndOtherIncome"];
export const NET_INCOME_CONSOLIDATED = ["ProfitLoss", "NetIncomeLoss"];
