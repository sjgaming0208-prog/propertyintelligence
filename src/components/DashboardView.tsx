import { useMemo, useState, type FormEvent } from "react";
import { getSupabaseClient } from "../lib/supabaseClient";
import type { CalcMode, PropertyInputs } from "../types";

interface DashboardViewProps {
  /** Advance the funnel (used to reach the Page 3 success screen). */
  setStep: (step: number) => void;
  /** Which math engine to run. */
  calcMode: CalcMode;
  /** Numeric property inputs captured on Page 1. */
  inputs: PropertyInputs;
}

/** Local, typed state for the lead-capture form. */
interface LeadFormState {
  fullName: string;
  email: string;
  phone: string;
}

/** Row shape inserted into the Supabase `mortgage_leads` table. */
interface MortgageLeadInsert {
  postcode: string;
  house_number: string;
  full_name: string;
  email: string;
  phone: string;
  loan_to_value: number;
  finance_purpose: string;
}

/* -------------------------------------------------------------------------- */
/*  Hardcoded baseline multipliers (UK environmental risk averages)           */
/* -------------------------------------------------------------------------- */

const MORTGAGE_RATE = 0.055; // 5.5% annual mortgage rate framework.
const PREVIEW_EPC_RATING = "E";
const PREVIEW_UPGRADE_COST = 8400; // Capital to reach compliance Grade C.
const PREVIEW_FLOOD_RISK = "High";
const FLOOD_INSURANCE_SURCHARGE = 75; // Monthly insurance loading fee.
const MAINTENANCE_RATE = 0.12; // 12% of rent set aside for maintenance.
const RISK_ADJUSTED_FEES = 2500; // Additional acquisition fees.
const HOMEOWNER_STANDING_CHARGE = 100; // Baseline monthly standing costs.
const RETROFIT_AMORTISATION_MONTHS = 120; // Upgrade cost amortised over 10 yrs.

/* -------------------------------------------------------------------------- */
/*  Formatting helpers                                                         */
/* -------------------------------------------------------------------------- */

function formatGBP(value: number, fractionDigits = 0): string {
  if (!Number.isFinite(value)) return "£0";
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(value);
}

function formatPercent(value: number, fractionDigits = 2): string {
  if (!Number.isFinite(value)) return "0%";
  return `${value.toFixed(fractionDigits)}%`;
}

/**
 * DashboardView — Page 2 of the conversion funnel.
 *
 * Runs one of two financial risk engines, shows a teaser of the property's
 * climate vulnerabilities, and gates the full co-branded PropEco report behind
 * a lead-capture form that writes to Supabase before advancing to Page 3.
 */
export default function DashboardView({
  setStep,
  calcMode,
  inputs,
}: DashboardViewProps) {
  /* ----------------------------- Calculations ---------------------------- */

  const metrics = useMemo(() => {
    const { price, deposit, rent, bills } = inputs;

    // 5.5% mortgage rate framework, expressed as a monthly interest-only cost.
    const standardMortgage = ((price - deposit) * MORTGAGE_RATE) / 12;

    // Investor / landlord engine.
    const grossYield = price > 0 ? ((rent * 12) / price) * 100 : 0;
    const standardMaintenance = rent * MAINTENANCE_RATE;
    const traditionalNetProfit =
      rent - (standardMaintenance + standardMortgage);

    const riskAdjustedCapital =
      deposit + PREVIEW_UPGRADE_COST + RISK_ADJUSTED_FEES;
    const riskAdjustedExpenses =
      standardMaintenance + standardMortgage + FLOOD_INSURANCE_SURCHARGE;
    const trueNetProfit = rent - riskAdjustedExpenses;
    const trueYield =
      riskAdjustedCapital > 0
        ? ((trueNetProfit * 12) / riskAdjustedCapital) * 100
        : 0;

    // Homeowner / buyer engine.
    const standardMonthlyCost =
      standardMortgage + bills + HOMEOWNER_STANDING_CHARGE;
    const trueMonthlyCost =
      standardMonthlyCost +
      FLOOD_INSURANCE_SURCHARGE +
      PREVIEW_UPGRADE_COST / RETROFIT_AMORTISATION_MONTHS;

    // Local loan-to-value for the lead record.
    const loanToValue = price > 0 ? ((price - deposit) / price) * 100 : 0;

    return {
      standardMortgage,
      grossYield,
      traditionalNetProfit,
      trueNetProfit,
      trueYield,
      standardMonthlyCost,
      trueMonthlyCost,
      loanToValue,
    };
  }, [inputs]);

  /* ------------------------------ Form state ----------------------------- */

  const [form, setForm] = useState<LeadFormState>({
    fullName: "",
    email: "",
    phone: "",
  });
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const updateField =
    (key: keyof LeadFormState) =>
    (event: React.ChangeEvent<HTMLInputElement>) =>
      setForm((prev) => ({ ...prev, [key]: event.target.value }));

  const financePurpose =
    calcMode === "investor"
      ? "Investor Green Mortgage"
      : "Homeowner Green Finance";

  /* --------------------------- Supabase submit --------------------------- */

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);

    if (!form.fullName.trim() || !form.email.trim() || !form.phone.trim()) {
      setErrorMessage("Please complete all fields so we can send your report.");
      return;
    }

    const payload: MortgageLeadInsert = {
      postcode: inputs.postcode.trim().toUpperCase(),
      house_number: inputs.houseNumber.trim(),
      full_name: form.fullName.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      loan_to_value: Number(metrics.loanToValue.toFixed(2)),
      finance_purpose: financePurpose,
    };

    setIsSubmitting(true);

    try {
      const supabase = getSupabaseClient();

      // Demo / preview fallback: when Supabase is not configured, simulate a
      // successful insert so the funnel remains fully usable.
      if (!supabase) {
        // eslint-disable-next-line no-console
        console.info("[ClimateSmart] Simulated mortgage_leads insert:", payload);
        await new Promise((resolve) => setTimeout(resolve, 700));
        setStep(3);
        return;
      }

      const { error } = await supabase.from("mortgage_leads").insert(payload);

      if (error) {
        setErrorMessage(
          error.message ||
            "We couldn't save your details right now. Please try again.",
        );
        return;
      }

      setStep(3);
    } catch (unknownError) {
      const message =
        unknownError instanceof Error
          ? unknownError.message
          : "A network error occurred. Please try again.";
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  const propertyLabel = inputs.houseNumber
    ? `${inputs.houseNumber}, ${inputs.postcode.toUpperCase()}`
    : inputs.postcode.toUpperCase();

  /* -------------------------------- Render ------------------------------- */

  return (
    <section className="animate-fade-in mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <div className="mb-6">
        <button
          type="button"
          onClick={() => setStep(1)}
          className="mb-3 inline-flex items-center gap-1 text-sm font-medium text-slate-500 transition hover:text-emerald-600"
        >
          <svg
            viewBox="0 0 24 24"
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M19 12H5M11 18l-6-6 6-6" />
          </svg>
          Edit search
        </button>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">
          Your climate-adjusted analysis
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          {propertyLabel}
          {" · "}
          {calcMode === "investor"
            ? "Landlord & investor view"
            : "Homeowner & buyer view"}
        </p>
      </div>

      {/* -------------------- SECTION 1: Hero metric cards ------------------- */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Traditional metric card */}
        <div className="animate-fade-in rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">
              Traditional Metric
            </h3>
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              Standard
            </span>
          </div>

          {calcMode === "investor" ? (
            <dl className="mt-5 space-y-3.5">
              <MetricLine label="Gross yield" value={formatPercent(metrics.grossYield)} />
              <MetricLine
                label="Monthly mortgage (5.5%)"
                value={formatGBP(metrics.standardMortgage)}
              />
              <MetricLine
                label="Traditional net profit / mo"
                value={formatGBP(metrics.traditionalNetProfit)}
                tone={metrics.traditionalNetProfit >= 0 ? "positive" : "negative"}
                emphasis
              />
            </dl>
          ) : (
            <dl className="mt-5 space-y-3.5">
              <MetricLine
                label="Monthly mortgage (5.5%)"
                value={formatGBP(metrics.standardMortgage)}
              />
              <MetricLine label="Utility bills" value={formatGBP(inputs.bills)} />
              <MetricLine
                label="Standard monthly cost"
                value={formatGBP(metrics.standardMonthlyCost)}
                emphasis
              />
            </dl>
          )}

          <p className="mt-4 text-xs leading-relaxed text-slate-500">
            The headline figures a standard calculator shows — before climate
            risk is priced in.
          </p>
        </div>

        {/* True risk-adjusted metric card (highlighted) */}
        <div className="animate-fade-in rounded-2xl border-2 border-emerald-500 bg-emerald-50/60 p-6 shadow-md ring-1 ring-emerald-500/20">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-emerald-900">
              True Risk-Adjusted Metric
            </h3>
            <span className="rounded-full bg-emerald-500 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-white">
              PropEco
            </span>
          </div>

          {calcMode === "investor" ? (
            <dl className="mt-5 space-y-3.5">
              <MetricLine
                label="True yield"
                value={formatPercent(metrics.trueYield)}
                tone="emerald"
              />
              <MetricLine
                label="+ Flood insurance / mo"
                value={formatGBP(FLOOD_INSURANCE_SURCHARGE)}
              />
              <MetricLine
                label="True net profit / mo"
                value={formatGBP(metrics.trueNetProfit)}
                tone={metrics.trueNetProfit >= 0 ? "positive" : "negative"}
                emphasis
              />
            </dl>
          ) : (
            <dl className="mt-5 space-y-3.5">
              <MetricLine
                label="+ Flood insurance / mo"
                value={formatGBP(FLOOD_INSURANCE_SURCHARGE)}
              />
              <MetricLine
                label="+ Amortised EPC upgrade / mo"
                value={formatGBP(PREVIEW_UPGRADE_COST / RETROFIT_AMORTISATION_MONTHS)}
              />
              <MetricLine
                label="True monthly cost"
                value={formatGBP(metrics.trueMonthlyCost)}
                tone="negative"
                emphasis
              />
            </dl>
          )}

          <p className="mt-4 text-xs leading-relaxed text-emerald-800/80">
            {calcMode === "investor"
              ? "Climate liabilities compress your real return once retrofit capital and flood cover are priced in."
              : "Climate liabilities raise your real cost of ownership once retrofit and flood cover are priced in."}
          </p>
        </div>
      </div>

      {/* -------------------- SECTION 2: Teaser matrix ---------------------- */}
      <div className="mt-6">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Property vulnerability preview
        </h3>
        <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <TeaserCard
            icon="epc"
            label="EPC energy rating"
            badge={PREVIEW_EPC_RATING}
            badgeTone="amber"
            headline={`Grade ${PREVIEW_EPC_RATING} — asset liability`}
            detail={`Estimated ${formatGBP(
              PREVIEW_UPGRADE_COST,
            )} of retrofit capital is needed to reach compliance Grade C.`}
          />
          <TeaserCard
            icon="flood"
            label="Surface water flood risk"
            badge={PREVIEW_FLOOD_RISK}
            badgeTone="rose"
            headline={`${PREVIEW_FLOOD_RISK} environmental exposure`}
            detail={`Adds an estimated ${formatGBP(
              FLOOD_INSURANCE_SURCHARGE,
            )} / month insurance loading to your outgoings.`}
          />
        </div>
      </div>

      {/* -------------------- SECTION 3: Lead gate paywall ------------------ */}
      <div className="animate-fade-in mt-8 overflow-hidden rounded-2xl bg-slate-900 shadow-xl ring-1 ring-slate-900/10">
        <div className="grid grid-cols-1 gap-8 p-6 sm:p-8 lg:grid-cols-2 lg:gap-10">
          {/* Left: value payload */}
          <div className="flex flex-col justify-center">
            <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-300 ring-1 ring-inset ring-emerald-500/30">
              🔒 Premium report locked
            </span>
            <h3 className="mt-4 text-2xl font-bold text-white">
              Unlock Full Co-Branded Report
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-slate-300">
              Get the complete PropEco white-label PDF for{" "}
              <span className="font-semibold text-white">{propertyLabel}</span> —
              including full EPC retrofit modelling, flood-risk mapping and a
              tailored {financePurpose.toLowerCase()} review from a registered
              broker.
            </p>
            <ul className="mt-5 space-y-2.5 text-sm text-slate-300">
              {[
                "Full climate-adjusted yield & cost breakdown",
                "Line-by-line EPC upgrade cost schedule",
                "Surface water & flood exposure report",
                "Green mortgage options from FCA-regulated brokers",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5">
                  <svg
                    viewBox="0 0 24 24"
                    className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2.5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Right: capture form */}
          <div className="rounded-2xl bg-slate-800/60 p-5 ring-1 ring-slate-700 sm:p-6">
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <DarkField
                label="Full Name"
                type="text"
                value={form.fullName}
                onChange={updateField("fullName")}
                placeholder="Alex Morgan"
                autoComplete="name"
              />
              <DarkField
                label="Email Address"
                type="email"
                value={form.email}
                onChange={updateField("email")}
                placeholder="alex@example.com"
                autoComplete="email"
              />
              <DarkField
                label="Phone Number"
                type="tel"
                value={form.phone}
                onChange={updateField("phone")}
                placeholder="07123 456789"
                autoComplete="tel"
              />

              {errorMessage && (
                <div
                  role="alert"
                  className="rounded-lg border border-rose-500/40 bg-rose-500/10 px-3.5 py-2.5 text-sm text-rose-200"
                >
                  {errorMessage}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-400 px-5 py-3.5 text-sm font-bold text-slate-900 shadow-lg shadow-emerald-500/25 transition hover:from-emerald-400 hover:to-emerald-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? (
                  <>
                    <svg
                      className="h-4 w-4 animate-spin"
                      viewBox="0 0 24 24"
                      fill="none"
                      aria-hidden="true"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 0 1 8-8v4a4 4 0 0 0-4 4H4z"
                      />
                    </svg>
                    Unlocking your report…
                  </>
                ) : (
                  "Unlock my free report"
                )}
              </button>

              <p className="text-center text-[11px] leading-relaxed text-slate-400">
                By continuing you consent to your details being securely passed
                to registered, FCA-regulated mortgage brokers. Data retained for
                a maximum of 90 days.
              </p>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*  Presentational sub-components                                             */
/* -------------------------------------------------------------------------- */

interface MetricLineProps {
  label: string;
  value: string;
  tone?: "default" | "positive" | "negative" | "emerald";
  emphasis?: boolean;
}

function MetricLine({
  label,
  value,
  tone = "default",
  emphasis = false,
}: MetricLineProps) {
  const toneClass =
    tone === "positive"
      ? "text-emerald-600"
      : tone === "negative"
        ? "text-rose-600"
        : tone === "emerald"
          ? "text-emerald-700"
          : "text-slate-900";

  return (
    <div
      className={`flex items-baseline justify-between gap-4 ${
        emphasis ? "border-t border-dashed border-slate-300 pt-3.5" : ""
      }`}
    >
      <dt
        className={`text-sm ${
          emphasis ? "font-semibold text-slate-800" : "text-slate-600"
        }`}
      >
        {label}
      </dt>
      <dd
        className={`tabular-nums text-right ${
          emphasis ? "text-lg font-bold" : "text-sm font-semibold"
        } ${toneClass}`}
      >
        {value}
      </dd>
    </div>
  );
}

interface TeaserCardProps {
  icon: "epc" | "flood";
  label: string;
  badge: string;
  badgeTone: "amber" | "rose";
  headline: string;
  detail: string;
}

function TeaserCard({
  icon,
  label,
  badge,
  badgeTone,
  headline,
  detail,
}: TeaserCardProps) {
  const badgeClass =
    badgeTone === "amber"
      ? "bg-amber-100 text-amber-700 ring-amber-200"
      : "bg-rose-100 text-rose-700 ring-rose-200";

  return (
    <div className="animate-fade-in relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      {/* Blurred "locked" flourish to signal there's more behind the paywall. */}
      <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-slate-100 blur-2xl" />
      <div className="relative flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
            {icon === "epc" ? (
              <svg
                viewBox="0 0 24 24"
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M13 2 3 14h7l-1 8 10-12h-7z" />
              </svg>
            ) : (
              <svg
                viewBox="0 0 24 24"
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M12 2s6 7 6 11a6 6 0 0 1-12 0c0-4 6-11 6-11z" />
              </svg>
            )}
          </span>
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            {label}
          </span>
        </div>
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-bold ring-1 ring-inset ${badgeClass}`}
        >
          {badge}
        </span>
      </div>
      <p className="relative mt-3 text-sm font-semibold text-slate-900">
        {headline}
      </p>
      <p className="relative mt-1 text-sm leading-relaxed text-slate-600">
        {detail}
      </p>
    </div>
  );
}

interface DarkFieldProps {
  label: string;
  type: "text" | "email" | "tel";
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  autoComplete?: string;
}

function DarkField({
  label,
  type,
  value,
  onChange,
  placeholder,
  autoComplete,
}: DarkFieldProps) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-slate-300">
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className="w-full rounded-xl border border-slate-700 bg-slate-900/70 px-3.5 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/40"
      />
    </label>
  );
}
