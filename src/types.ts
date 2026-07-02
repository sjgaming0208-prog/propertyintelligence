/**
 * Shared domain types for the Climate-Smart Property Intelligence Hub.
 */

/** The three views of the single-page flow. */
export type Step = 1 | 2 | 3;

/** Which financial audience / math engine is active. */
export type CalcMode = "investor" | "homeowner";

/** Which legal document is displayed in the overlay, or `null` when closed. */
export type ModalType = "privacy" | "terms" | null;

/**
 * The shared, cross-step financial data object.
 *
 * All monetary values are held as strings while typed into the form so the
 * inputs stay controlled and empty states remain representable. They are
 * parsed to numbers inside the math engine.
 */
export interface Financials {
  postcode: string;
  houseNumber: string;
  price: string;
  deposit: string;
  /** Expected gross monthly rent — only relevant for the investor engine. */
  rent: string;
  /** Estimated monthly utility bills — only relevant for the homeowner engine. */
  bills: string;
  name: string;
  email: string;
  phone: string;
}

/** The initial, empty financials object. */
export const emptyFinancials: Financials = {
  postcode: "",
  houseNumber: "",
  price: "",
  deposit: "",
  rent: "",
  bills: "",
  name: "",
  email: "",
  phone: "",
};

/**
 * Simulated PropEco climate-adjustment parameters.
 * These are illustrative constants, not live PropEco API data.
 */
export const PROP_ECO = {
  /** One-off EPC retrofit liability added to upfront capital. */
  epcRetrofitLiability: 7500,
  /** Monthly flood-insurance premium surcharge. */
  floodPremiumMonthly: 85,
  /** Assumed mortgage term (years) used to amortise the retrofit liability. */
  amortisationYears: 25,
  /** Assumed annual interest rate used for the illustrative repayment figure. */
  annualInterestRate: 0.055,
} as const;
