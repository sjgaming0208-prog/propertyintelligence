import { PROP_ECO, type Financials } from "../types";

/** Format a number as GBP currency. */
export function formatGBP(value: number, fractionDigits = 0): string {
  if (!Number.isFinite(value)) return "£0";
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(value);
}

/** Format a ratio (e.g. 0.0532) as a percentage string (e.g. "5.32%"). */
export function formatPercent(ratio: number, fractionDigits = 2): string {
  if (!Number.isFinite(ratio)) return "0%";
  return `${(ratio * 100).toFixed(fractionDigits)}%`;
}

function num(value: string): number {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

/**
 * Standard capital-and-interest monthly repayment for a given principal.
 * Uses the illustrative rate/term from {@link PROP_ECO}.
 */
export function monthlyRepayment(
  principal: number,
  annualRate = PROP_ECO.annualInterestRate,
  years = PROP_ECO.amortisationYears,
): number {
  if (principal <= 0) return 0;
  const monthlyRate = annualRate / 12;
  const payments = years * 12;
  if (monthlyRate === 0) return principal / payments;
  const factor = Math.pow(1 + monthlyRate, payments);
  return (principal * monthlyRate * factor) / (factor - 1);
}

/** Result of the investor (buy-to-let) math engine. */
export interface InvestorMetrics {
  annualRent: number;
  /** Traditional gross yield: annual rent / purchase price. */
  traditionalGrossYield: number;
  /** Climate-smart yield: annual rent / (price + EPC retrofit liability). */
  climateSmartYield: number;
  /** Monthly mortgage repayment on the loan (price - deposit). */
  monthlyMortgage: number;
  /** Net monthly cash flow ignoring climate factors. */
  standardNetMonthly: number;
  /** Net monthly cash flow including the flood premium surcharge. */
  trueNetMonthly: number;
}

/** Result of the homeowner math engine. */
export interface HomeownerMetrics {
  monthlyMortgage: number;
  monthlyBills: number;
  /** Mortgage + bills, no climate factors. */
  standardMonthlyOutgoings: number;
  /** Amortised monthly cost of the EPC retrofit liability. */
  amortisedRetrofitMonthly: number;
  /** Standard outgoings + amortised retrofit + flood premium. */
  trueMonthlyCost: number;
}

/** Run MATH ENGINE 1 — investor / landlord metrics. */
export function computeInvestorMetrics(f: Financials): InvestorMetrics {
  const price = num(f.price);
  const deposit = num(f.deposit);
  const monthlyRent = num(f.rent);
  const annualRent = monthlyRent * 12;

  const loanAmount = Math.max(price - deposit, 0);
  const monthlyMortgage = monthlyRepayment(loanAmount);

  const traditionalGrossYield = price > 0 ? annualRent / price : 0;

  const climateAdjustedCapital = price + PROP_ECO.epcRetrofitLiability;
  const climateSmartYield =
    climateAdjustedCapital > 0 ? annualRent / climateAdjustedCapital : 0;

  const standardNetMonthly = monthlyRent - monthlyMortgage;
  const trueNetMonthly =
    monthlyRent - monthlyMortgage - PROP_ECO.floodPremiumMonthly;

  return {
    annualRent,
    traditionalGrossYield,
    climateSmartYield,
    monthlyMortgage,
    standardNetMonthly,
    trueNetMonthly,
  };
}

/** Run MATH ENGINE 2 — homeowner / buyer metrics. */
export function computeHomeownerMetrics(f: Financials): HomeownerMetrics {
  const price = num(f.price);
  const deposit = num(f.deposit);
  const monthlyBills = num(f.bills);

  const loanAmount = Math.max(price - deposit, 0);
  const monthlyMortgage = monthlyRepayment(loanAmount);

  const standardMonthlyOutgoings = monthlyMortgage + monthlyBills;

  const amortisedRetrofitMonthly = monthlyRepayment(
    PROP_ECO.epcRetrofitLiability,
  );

  const trueMonthlyCost =
    standardMonthlyOutgoings +
    amortisedRetrofitMonthly +
    PROP_ECO.floodPremiumMonthly;

  return {
    monthlyMortgage,
    monthlyBills,
    standardMonthlyOutgoings,
    amortisedRetrofitMonthly,
    trueMonthlyCost,
  };
}
