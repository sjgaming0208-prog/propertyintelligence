import { useMemo, useState } from "react";
import { Calculator, RotateCcw } from "lucide-react";
import InputForm from "./components/InputForm";
import ResultsDisplay from "./components/ResultsDisplay";
import { calculateBreakdown, calculateOutputs } from "./calculations";
import { defaultInputs, type Inputs } from "./types";

/**
 * RoiCalculator — main state controller for the Property ROI & Yield
 * Calculator. Holds the inputs and recomputes all outputs in real time.
 */
export default function RoiCalculator() {
  const [inputs, setInputs] = useState<Inputs>(defaultInputs);

  const handleChange = <K extends keyof Inputs>(key: K, value: Inputs[K]) =>
    setInputs((prev) => ({ ...prev, [key]: value }));

  const outputs = useMemo(() => calculateOutputs(inputs), [inputs]);
  const breakdown = useMemo(() => calculateBreakdown(inputs), [inputs]);

  return (
    <section className="animate-fade-in mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-200">
            <Calculator className="h-3.5 w-3.5" />
            Real-time results
          </span>
          <h1 className="mt-3 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Property ROI &amp; Yield Calculator
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Model gross &amp; net yields, cash-on-cash ROI and monthly cash flow
            — updated as you type.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setInputs(defaultInputs)}
          className="inline-flex w-fit items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-emerald-300 hover:text-emerald-700"
        >
          <RotateCcw className="h-4 w-4" />
          Reset
        </button>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <InputForm inputs={inputs} onChange={handleChange} />
        <ResultsDisplay outputs={outputs} breakdown={breakdown} />
      </div>

      <p className="mt-6 text-center text-xs text-slate-400">
        Illustrative estimates only. Not FCA-regulated financial advice.
      </p>
    </section>
  );
}
