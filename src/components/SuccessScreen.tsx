import type { PropertyInputs } from "../types";

interface SuccessScreenProps {
  inputs: PropertyInputs;
  onRestart: () => void;
}

/**
 * SuccessScreen — Step 3. White-label delivery confirmation and phone-line
 * warm-up notice.
 */
export default function SuccessScreen({
  inputs,
  onRestart,
}: SuccessScreenProps) {
  const propertyLabel = inputs.houseNumber
    ? `${inputs.houseNumber}, ${inputs.postcode.toUpperCase()}`
    : inputs.postcode.toUpperCase() || "your property";

  return (
    <section className="animate-fade-in-up mx-auto max-w-2xl px-4 py-14 sm:px-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm sm:p-12">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-sky-500 shadow-lg shadow-emerald-500/30">
          <svg
            viewBox="0 0 24 24"
            className="h-8 w-8 text-white"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </div>

        <h2 className="mt-6 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          You&apos;re all set!
        </h2>

        <p className="mt-3 text-base leading-relaxed text-slate-600">
          Your official co-branded{" "}
          <strong className="text-slate-900">
            PropEco white-label PDF report
          </strong>{" "}
          for <strong className="text-emerald-700">{propertyLabel}</strong> has
          been queued and is en route to your email address. It should land in
          your inbox within a few minutes.
        </p>

        <div className="mt-6 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-left">
          <span
            className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-100"
            aria-hidden="true"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-4.5 w-4.5 text-amber-600"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
          </span>
          <div>
            <p className="text-sm font-semibold text-amber-900">
              Please keep your phone line clear
            </p>
            <p className="mt-1 text-sm leading-relaxed text-amber-800">
              An eco-finance advisory partner is already reviewing your property
              dataset configuration to perform an automated rate stress test.
              Expect a call shortly on the number you provided to discuss your
              climate-smart mortgage options.
            </p>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-3 text-left sm:grid-cols-3">
          {[
            { step: "1", label: "Report queued", done: true },
            { step: "2", label: "Broker matching", done: true },
            { step: "3", label: "Rate stress test", done: false },
          ].map((item) => (
            <div
              key={item.step}
              className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3"
            >
              <span
                className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                  item.done
                    ? "bg-emerald-500 text-white"
                    : "bg-slate-200 text-slate-500"
                }`}
              >
                {item.done ? "✓" : item.step}
              </span>
              <span className="text-xs font-medium text-slate-700">
                {item.label}
              </span>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={onRestart}
          className="mt-9 inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-emerald-300 hover:text-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
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
            <path d="M21 12a9 9 0 1 1-2.64-6.36" />
            <path d="M21 3v6h-6" />
          </svg>
          Analyse another property
        </button>

        <p className="mt-6 text-xs leading-relaxed text-slate-400">
          Property Intelligence Hub is a software service, not an FCA-regulated
          adviser or
          lender. Figures are illustrative estimates based on simulated PropEco
          parameters.
        </p>
      </div>
    </section>
  );
}
