import { useMemo, useState, type FormEvent } from "react";
import TextField from "./TextField";
import { submitLead } from "../lib/leads";
import {
  computeHomeownerMetrics,
  computeInvestorMetrics,
  formatGBP,
  formatPercent,
} from "../lib/finance";
import { PROP_ECO, type CalcMode, type Financials } from "../types";

interface DashboardViewProps {
  calcMode: CalcMode;
  financials: Financials;
  setFinancials: React.Dispatch<React.SetStateAction<Financials>>;
  onBack: () => void;
  onLeadCaptured: () => void;
}

interface MetricRow {
  label: string;
  value: string;
  emphasis?: boolean;
  positive?: boolean;
  negative?: boolean;
}

interface MetricPanelProps {
  title: string;
  tag: string;
  accent: "slate" | "emerald";
  rows: MetricRow[];
  footnote?: string;
}

function MetricPanel({ title, tag, accent, rows, footnote }: MetricPanelProps) {
  const accentClasses =
    accent === "emerald"
      ? {
          card: "border-emerald-200 bg-emerald-50/60",
          tag: "bg-emerald-100 text-emerald-700",
          title: "text-emerald-900",
        }
      : {
          card: "border-slate-200 bg-white",
          tag: "bg-slate-100 text-slate-600",
          title: "text-slate-900",
        };

  return (
    <div className={`rounded-2xl border p-6 shadow-sm ${accentClasses.card}`}>
      <div className="flex items-center justify-between gap-2">
        <h3 className={`text-base font-bold ${accentClasses.title}`}>{title}</h3>
        <span
          className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ${accentClasses.tag}`}
        >
          {tag}
        </span>
      </div>

      <dl className="mt-5 space-y-3.5">
        {rows.map((row) => (
          <div
            key={row.label}
            className={`flex items-baseline justify-between gap-4 ${
              row.emphasis ? "border-t border-dashed border-slate-300 pt-3.5" : ""
            }`}
          >
            <dt
              className={`text-sm ${
                row.emphasis ? "font-semibold text-slate-800" : "text-slate-600"
              }`}
            >
              {row.label}
            </dt>
            <dd
              className={`text-right tabular-nums ${
                row.emphasis ? "text-lg font-bold" : "text-sm font-semibold"
              } ${
                row.positive
                  ? "text-emerald-600"
                  : row.negative
                    ? "text-rose-600"
                    : "text-slate-900"
              }`}
            >
              {row.value}
            </dd>
          </div>
        ))}
      </dl>

      {footnote && (
        <p className="mt-4 text-xs leading-relaxed text-slate-500">{footnote}</p>
      )}
    </div>
  );
}

/**
 * DashboardView — Step 2. Runs the dual math engines side-by-side and gates
 * the results behind a dark-themed lead-capture form.
 */
export default function DashboardView({
  calcMode,
  financials,
  setFinancials,
  onBack,
  onLeadCaptured,
}: DashboardViewProps) {
  const investor = useMemo(
    () => computeInvestorMetrics(financials),
    [financials],
  );
  const homeowner = useMemo(
    () => computeHomeownerMetrics(financials),
    [financials],
  );

  const [consent, setConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = (key: keyof Financials) => (value: string) =>
    setFinancials((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!consent) {
      setError("Please confirm consent so we can pass your details to brokers.");
      return;
    }

    setSubmitting(true);
    try {
      const result = await submitLead(financials, calcMode, consent);
      if (result.ok) {
        onLeadCaptured();
      } else {
        setError(
          result.error ??
            "We couldn't submit your details right now. Please try again.",
        );
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="animate-fade-in-up mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <button
            type="button"
            onClick={onBack}
            className="mb-2 inline-flex items-center gap-1 text-sm font-medium text-slate-500 transition hover:text-emerald-600"
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
            {financials.houseNumber
              ? `${financials.houseNumber}, ${financials.postcode.toUpperCase()}`
              : financials.postcode.toUpperCase()}
            {" · "}
            {calcMode === "investor"
              ? "Landlord & investor view"
              : "Homeowner & buyer view"}
          </p>
        </div>
      </div>

      {calcMode === "investor" ? (
        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
          <MetricPanel
            title="Traditional Metrics"
            tag="Standard"
            accent="slate"
            rows={[
              { label: "Purchase price", value: formatGBP(Number(financials.price) || 0) },
              { label: "Annual gross rent", value: formatGBP(investor.annualRent) },
              {
                label: "Monthly mortgage",
                value: formatGBP(investor.monthlyMortgage),
              },
              {
                label: "Standard net monthly cash flow",
                value: formatGBP(investor.standardNetMonthly),
                positive: investor.standardNetMonthly >= 0,
                negative: investor.standardNetMonthly < 0,
              },
              {
                label: "Traditional gross yield",
                value: formatPercent(investor.traditionalGrossYield),
                emphasis: true,
              },
            ]}
            footnote="Standard buy-to-let figures ignore climate-related capital and running costs."
          />
          <MetricPanel
            title="Climate-Smart Metrics"
            tag="PropEco Adjusted"
            accent="emerald"
            rows={[
              {
                label: "EPC retrofit liability (added to capital)",
                value: `+ ${formatGBP(PROP_ECO.epcRetrofitLiability)}`,
              },
              {
                label: "Flood premium surcharge (monthly)",
                value: `+ ${formatGBP(PROP_ECO.floodPremiumMonthly)}`,
              },
              {
                label: "Monthly mortgage",
                value: formatGBP(investor.monthlyMortgage),
              },
              {
                label: "True net monthly cash flow",
                value: formatGBP(investor.trueNetMonthly),
                positive: investor.trueNetMonthly >= 0,
                negative: investor.trueNetMonthly < 0,
                emphasis: false,
              },
              {
                label: "Climate-smart yield",
                value: formatPercent(investor.climateSmartYield),
                emphasis: true,
              },
            ]}
            footnote="Yield recalculated against price + EPC retrofit liability, with the flood premium loaded onto monthly expenses."
          />
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
          <MetricPanel
            title="Standard Monthly Outgoings"
            tag="Standard"
            accent="slate"
            rows={[
              {
                label: "Monthly mortgage",
                value: formatGBP(homeowner.monthlyMortgage),
              },
              {
                label: "Estimated utility bills",
                value: formatGBP(homeowner.monthlyBills),
              },
              {
                label: "Standard monthly outgoings",
                value: formatGBP(homeowner.standardMonthlyOutgoings),
                emphasis: true,
              },
            ]}
            footnote="Mortgage repayment plus your estimated monthly utility bills."
          />
          <MetricPanel
            title="True Monthly Cost of Ownership"
            tag="PropEco Adjusted"
            accent="emerald"
            rows={[
              {
                label: "Standard monthly outgoings",
                value: formatGBP(homeowner.standardMonthlyOutgoings),
              },
              {
                label: "Amortised EPC upgrade (monthly)",
                value: `+ ${formatGBP(homeowner.amortisedRetrofitMonthly)}`,
              },
              {
                label: "Flood premium surcharge (monthly)",
                value: `+ ${formatGBP(PROP_ECO.floodPremiumMonthly)}`,
              },
              {
                label: "True monthly cost of ownership",
                value: formatGBP(homeowner.trueMonthlyCost),
                emphasis: true,
                negative: true,
              },
            ]}
            footnote={`EPC retrofit of ${formatGBP(
              PROP_ECO.epcRetrofitLiability,
            )} amortised over ${PROP_ECO.amortisationYears} years, plus the monthly flood premium surcharge.`}
          />
        </div>
      )}

      {/* Lead Capture Gate */}
      <div className="mt-8 overflow-hidden rounded-2xl bg-slate-900 shadow-xl ring-1 ring-slate-900/10">
        <div className="bg-gradient-to-r from-emerald-600/20 to-sky-600/20 px-6 py-5 sm:px-8">
          <h3 className="text-lg font-bold text-white">
            Unlock your co-branded PropEco report
          </h3>
          <p className="mt-1 text-sm text-slate-300">
            Enter your details to receive a white-label PDF and a tailored
            climate-smart mortgage review from a registered broker.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-6 sm:px-8">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            <TextField
              label="Full Name"
              value={financials.name}
              onChange={update("name")}
              placeholder="Alex Morgan"
              required
              dark
            />
            <TextField
              label="Email"
              value={financials.email}
              onChange={update("email")}
              placeholder="alex@example.com"
              type="email"
              inputMode="email"
              required
              dark
            />
            <TextField
              label="Phone"
              value={financials.phone}
              onChange={update("phone")}
              placeholder="07123 456789"
              type="tel"
              inputMode="tel"
              required
              dark
            />
          </div>

          <label className="mt-5 flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              checked={consent}
              onChange={(event) => setConsent(event.target.checked)}
              className="mt-0.5 h-4 w-4 shrink-0 rounded border-slate-600 bg-slate-800 text-emerald-500 focus:ring-2 focus:ring-emerald-500 focus:ring-offset-0"
            />
            <span className="text-xs leading-relaxed text-slate-400">
              I consent to ClimateSmart Hub securely passing my contact details
              to registered, FCA-regulated mortgage brokers so they may contact
              me about relevant products. I understand my data is retained for a
              maximum of 90 days and I can withdraw consent at any time, as set
              out in the Privacy Policy.
            </span>
          </label>

          {error && (
            <div
              role="alert"
              className="mt-4 rounded-lg border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-200"
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-sky-500 px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 transition hover:from-emerald-400 hover:to-sky-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? (
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
                Securing your report…
              </>
            ) : (
              "Send my free PropEco report"
            )}
          </button>
          <p className="mt-3 text-center text-[11px] text-slate-500">
            Your details are transmitted securely. ClimateSmart Hub is not an
            FCA-regulated lender or broker.
          </p>
        </form>
      </div>
    </section>
  );
}
