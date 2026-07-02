import type { CashFlowBreakdown, Inputs, Outputs } from "./types";

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

/** Format a whole-number percentage value (e.g. 5.32 -> "5.32%"). */
export function formatPercent(value: number, fractionDigits = 2): string {
  if (!Number.isFinite(value)) return "0%";
  return `${value.toFixed(fractionDigits)}%`;
}

/**
 * Monthly repayment for a capital-and-interest (repayment) mortgage.
 * Falls back to straight-line when the interest rate is zero.
 */
export function repaymentMonthlyPayment(
  loanAmount: number,
  annualRatePercent: number,
  termYears: number,
): number {
  if (loanAmount <= 0 || termYears <= 0) return 0;
  const monthlyRate = annualRatePercent / 100 / 12;
  const payments = termYears * 12;
  if (monthlyRate === 0) return loanAmount / payments;
  const factor = Math.pow(1 + monthlyRate, payments);
  return (loanAmount * monthlyRate * factor) / (factor - 1);
}

/** Interest-only monthly payment (interest portion of the loan). */
export function interestOnlyMonthlyPayment(
  loanAmount: number,
  annualRatePercent: number,
): number {
  if (loanAmount <= 0) return 0;
  return (loanAmount * (annualRatePercent / 100)) / 12;
}

/**
 * Compute the full monthly cash-flow breakdown from the inputs.
 * Pure function — no side effects.
 */
export function calculateBreakdown(inputs: Inputs): CashFlowBreakdown {
  const {
    purchasePrice,
    renoCosts,
    stampDuty,
    legalFees,
    monthlyRent,
    mgmtFeePercent,
    insurance,
    maintenance,
    mortgageDepositPercent,
    mortgageInterestRate,
    useMortgage,
    mortgageType,
    mortgageTermYears,
  } = inputs;

  const totalProjectCost = purchasePrice + renoCosts + stampDuty + legalFees;

  // Financing
  const depositAmount = useMortgage
    ? purchasePrice * (mortgageDepositPercent / 100)
    : purchasePrice;
  const loanAmount = useMortgage ? Math.max(purchasePrice - depositAmount, 0) : 0;

  // Cash actually deployed by the investor.
  const totalCashInvested = depositAmount + renoCosts + stampDuty + legalFees;

  // Monthly income & running costs.
  const monthlyMgmtFee = monthlyRent * (mgmtFeePercent / 100);
  const monthlyInsurance = insurance / 12;
  const monthlyMaintenance = maintenance / 12;

  // Monthly mortgage cost depends on the product type.
  let monthlyMortgage = 0;
  if (useMortgage && loanAmount > 0) {
    monthlyMortgage =
      mortgageType === "repayment"
        ? repaymentMonthlyPayment(
            loanAmount,
            mortgageInterestRate,
            mortgageTermYears,
          )
        : interestOnlyMonthlyPayment(loanAmount, mortgageInterestRate);
  }

  const monthlyOperatingCosts =
    monthlyMgmtFee + monthlyInsurance + monthlyMaintenance;

  // Net operating income excludes financing (unleveraged).
  const annualNoi = (monthlyRent - monthlyOperatingCosts) * 12;

  const monthlyNetCashFlow =
    monthlyRent - monthlyOperatingCosts - monthlyMortgage;
  const annualCashFlow = monthlyNetCashFlow * 12;

  return {
    monthlyRent,
    monthlyMgmtFee,
    monthlyInsurance,
    monthlyMaintenance,
    monthlyMortgage,
    monthlyNetCashFlow,
    loanAmount,
    depositAmount,
    totalCashInvested,
    totalProjectCost,
    annualNoi,
    annualCashFlow,
  };
}

/**
 * Compute the four headline output metrics from the inputs.
 * Pure function — no side effects.
 */
export function calculateOutputs(inputs: Inputs): Outputs {
  const b = calculateBreakdown(inputs);
  const annualRent = inputs.monthlyRent * 12;

  const grossYield =
    inputs.purchasePrice > 0 ? (annualRent / inputs.purchasePrice) * 100 : 0;

  const netYield =
    b.totalProjectCost > 0 ? (b.annualNoi / b.totalProjectCost) * 100 : 0;

  const cashOnCashRoi =
    b.totalCashInvested > 0
      ? (b.annualCashFlow / b.totalCashInvested) * 100
      : 0;

  return {
    grossYield,
    netYield,
    cashOnCashRoi,
    monthlyNetCashFlow: b.monthlyNetCashFlow,
  };
}
