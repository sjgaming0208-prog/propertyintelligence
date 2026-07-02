/**
 * Domain types for the Property ROI & Yield Calculator.
 */

/** How the mortgage repayments are structured. */
export type MortgageType = "interest-only" | "repayment";

/**
 * All user-provided calculator inputs.
 *
 * Monetary values are in GBP. `insurance` and `maintenance` are treated as
 * annual figures; `monthlyRent` is monthly. Percentages are whole numbers
 * (e.g. `5` means 5%).
 */
export interface Inputs {
  // Purchase
  purchasePrice: number;
  renoCosts: number;
  stampDuty: number;
  legalFees: number;

  // Income & running costs
  monthlyRent: number;
  mgmtFeePercent: number;
  insurance: number; // annual
  maintenance: number; // annual

  // Financing
  mortgageDepositPercent: number;
  mortgageInterestRate: number; // annual %

  // Extra financing controls needed for repayment logic
  useMortgage: boolean;
  mortgageType: MortgageType;
  mortgageTermYears: number;
}

/** The headline metrics surfaced on the dashboard. */
export interface Outputs {
  /** Annual rent ÷ purchase price (%). */
  grossYield: number;
  /** Net operating income ÷ total project cost (%). */
  netYield: number;
  /** Annual pre-tax cash flow ÷ total cash invested (%). */
  cashOnCashRoi: number;
  /** Post-financing monthly net cash flow (£). */
  monthlyNetCashFlow: number;
}

/** A detailed monthly cash-flow breakdown for the results panel. */
export interface CashFlowBreakdown {
  monthlyRent: number;
  monthlyMgmtFee: number;
  monthlyInsurance: number;
  monthlyMaintenance: number;
  monthlyMortgage: number;
  monthlyNetCashFlow: number;

  // Supporting figures
  loanAmount: number;
  depositAmount: number;
  totalCashInvested: number;
  totalProjectCost: number;
  annualNoi: number;
  annualCashFlow: number;
}

/** Sensible starting values for a first-time visitor. */
export const defaultInputs: Inputs = {
  purchasePrice: 250000,
  renoCosts: 5000,
  stampDuty: 2500,
  legalFees: 1500,

  monthlyRent: 1400,
  mgmtFeePercent: 10,
  insurance: 350,
  maintenance: 1000,

  mortgageDepositPercent: 25,
  mortgageInterestRate: 5.5,

  useMortgage: true,
  mortgageType: "interest-only",
  mortgageTermYears: 25,
};
