import type { FormEvent } from "react";
import TextField from "./TextField";
import type { CalcMode, Financials } from "../types";

interface LandingSearchProps {
  calcMode: CalcMode;
  setCalcMode: (mode: CalcMode) => void;
  financials: Financials;
  setFinancials: React.Dispatch<React.SetStateAction<Financials>>;
  onSubmit: () => void;
}

interface AudienceTab {
  mode: CalcMode;
  emoji: string;
  title: string;
  blurb: string;
}

const TABS: AudienceTab[] = [
  {
    mode: "investor",
    emoji: "💼",
    title: "Landlords & Investors",
    blurb: "Model gross yields and true net cash flow.",
  },
  {
    mode: "homeowner",
    emoji: "🏠",
    title: "Homeowners & Buyers",
    blurb: "Reveal your true monthly cost of ownership.",
  },
];

/**
 * LandingSearch — Step 1. Multi-audience property input form.
 */
export default function LandingSearch({
  calcMode,
  setCalcMode,
  financials,
  setFinancials,
  onSubmit,
}: LandingSearchProps) {
  const update = (key: keyof Financials) => (value: string) =>
    setFinancials((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit();
  };

  return (
    <section className="animate-fade-in-up mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <div className="text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-200">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          Powered by simulated PropEco climate data
        </span>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          Climate-Smart Property Intelligence
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-base text-slate-600">
          Uncover the risk-adjusted numbers that traditional calculators miss —
          from EPC retrofit liabilities to flood-premium surcharges.
        </p>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {TABS.map((tab) => {
          const active = calcMode === tab.mode;
          return (
            <button
              key={tab.mode}
              type="button"
              onClick={() => setCalcMode(tab.mode)}
              aria-pressed={active}
              className={`flex items-start gap-3 rounded-2xl border p-4 text-left transition ${
                active
                  ? "border-emerald-500 bg-emerald-50 shadow-sm ring-1 ring-emerald-500"
                  : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm"
              }`}
            >
              <span className="text-2xl" aria-hidden="true">
                {tab.emoji}
              </span>
              <span>
                <span
                  className={`block text-sm font-semibold ${
                    active ? "text-emerald-800" : "text-slate-900"
                  }`}
                >
                  {tab.title}
                </span>
                <span className="mt-0.5 block text-xs text-slate-500">
                  {tab.blurb}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      <form
        onSubmit={handleSubmit}
        className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
      >
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <TextField
            label="Property Postcode"
            value={financials.postcode}
            onChange={update("postcode")}
            placeholder="e.g. SW1A 1AA"
            required
          />
          <TextField
            label="House Number / Name"
            value={financials.houseNumber}
            onChange={update("houseNumber")}
            placeholder="e.g. 24 or Rose Cottage"
            required
          />
          <TextField
            label="Estimated Value / Price"
            value={financials.price}
            onChange={update("price")}
            placeholder="350,000"
            prefix="£"
            inputMode="decimal"
            type="number"
            required
          />
          <TextField
            label="Deposit Capital"
            value={financials.deposit}
            onChange={update("deposit")}
            placeholder="70,000"
            prefix="£"
            inputMode="decimal"
            type="number"
            required
          />

          {calcMode === "investor" ? (
            <div className="sm:col-span-2">
              <TextField
                label="Expected Gross Rent (monthly)"
                value={financials.rent}
                onChange={update("rent")}
                placeholder="1,650"
                prefix="£"
                inputMode="decimal"
                type="number"
                required
                hint="The gross rent you expect to charge each month."
              />
            </div>
          ) : (
            <div className="sm:col-span-2">
              <TextField
                label="Estimated Utility Bills (monthly)"
                value={financials.bills}
                onChange={update("bills")}
                placeholder="280"
                prefix="£"
                inputMode="decimal"
                type="number"
                required
                hint="Energy, water and council-related running costs per month."
              />
            </div>
          )}
        </div>

        <button
          type="submit"
          className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-sky-600 px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 transition hover:from-emerald-500 hover:to-sky-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
        >
          Run Climate-Smart Analysis
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
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </button>
        <p className="mt-3 text-center text-xs text-slate-400">
          Illustrative figures only. Not FCA-regulated financial advice.
        </p>
      </form>
    </section>
  );
}
