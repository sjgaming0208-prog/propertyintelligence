import { getSupabaseClient } from "./supabaseClient";
import type { CalcMode, Financials } from "../types";

/** Shape of a row inserted into the `mortgage_leads` table. */
export interface MortgageLeadRow {
  name: string;
  email: string;
  phone: string;
  postcode: string;
  house_number: string;
  calc_mode: CalcMode;
  price: number;
  deposit: number;
  rent: number | null;
  bills: number | null;
  broker_consent: boolean;
  source: string;
}

/** Result of attempting to persist a lead. */
export interface SubmitLeadResult {
  ok: boolean;
  /** True when the insert was simulated because Supabase is not configured. */
  simulated: boolean;
  error?: string;
}

function toNumber(value: string): number {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

/**
 * Insert a captured lead into the Supabase `mortgage_leads` table.
 *
 * Robustly handles three failure surfaces:
 *   1. Supabase not configured  -> resolves as a simulated success.
 *   2. Supabase returns an error -> resolves with `ok: false` + message.
 *   3. Network / unexpected throw -> caught and surfaced as `ok: false`.
 */
export async function submitLead(
  financials: Financials,
  calcMode: CalcMode,
  brokerConsent: boolean,
): Promise<SubmitLeadResult> {
  const row: MortgageLeadRow = {
    name: financials.name.trim(),
    email: financials.email.trim(),
    phone: financials.phone.trim(),
    postcode: financials.postcode.trim().toUpperCase(),
    house_number: financials.houseNumber.trim(),
    calc_mode: calcMode,
    price: toNumber(financials.price),
    deposit: toNumber(financials.deposit),
    rent: calcMode === "investor" ? toNumber(financials.rent) : null,
    bills: calcMode === "homeowner" ? toNumber(financials.bills) : null,
    broker_consent: brokerConsent,
    source: "climatesmart-hub-web",
  };

  const supabase = getSupabaseClient();

  if (!supabase) {
    // Demo mode: pretend the insert succeeded so the flow remains usable.
    // eslint-disable-next-line no-console
    console.info("[ClimateSmart] Simulated lead insert:", row);
    await new Promise((resolve) => setTimeout(resolve, 600));
    return { ok: true, simulated: true };
  }

  try {
    const { error } = await supabase.from("mortgage_leads").insert(row);

    if (error) {
      return {
        ok: false,
        simulated: false,
        error: error.message || "The lead could not be saved. Please retry.",
      };
    }

    return { ok: true, simulated: false };
  } catch (unknownError) {
    const message =
      unknownError instanceof Error
        ? unknownError.message
        : "A network error occurred while saving your details.";
    return { ok: false, simulated: false, error: message };
  }
}
