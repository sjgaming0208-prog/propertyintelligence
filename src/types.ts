/**
 * Shared domain types for the Climate-Smart Property Intelligence Hub.
 */

/** Top-level app views: the lead-gen hub funnel or the ROI calculator. */
export type AppView = "hub" | "calculator";

/** The three views of the single-page flow. */
export type Step = 1 | 2 | 3;

/** Which financial audience / math engine is active. */
export type CalcMode = "investor" | "homeowner";

/** Which legal document is displayed in the overlay, or `null` when closed. */
export type ModalType = "privacy" | "terms" | null;

/**
 * The numeric property inputs collected on Step 1 and consumed by the
 * Step 2 calculation engine. Monetary values are held as numbers.
 */
export interface PropertyInputs {
  postcode: string;
  houseNumber: string;
  price: number;
  deposit: number;
  /** Expected gross monthly rent — only relevant for the investor engine. */
  rent: number;
  /** Estimated monthly utility bills — only relevant for the homeowner engine. */
  bills: number;
}

/** The initial, empty inputs object. */
export const emptyInputs: PropertyInputs = {
  postcode: "",
  houseNumber: "",
  price: 0,
  deposit: 0,
  rent: 0,
  bills: 0,
};
