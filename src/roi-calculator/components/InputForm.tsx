import { useId, useState } from "react";
import {
  Banknote,
  Building2,
  Home,
  Landmark,
  Percent,
  PoundSterling,
  ReceiptText,
  Wallet,
  Wrench,
} from "lucide-react";
import type { Inputs, MortgageType } from "../types";

interface InputFormProps {
  inputs: Inputs;
  onChange: <K extends keyof Inputs>(key: K, value: Inputs[K]) => void;
}

type Tab = "purchase" | "income";

interface NumberFieldProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  adornment?: "£" | "%" | "none";
  step?: number;
  min?: number;
  icon?: React.ReactNode;
  hint?: string;
}

function NumberField({
  label,
  value,
  onChange,
  adornment = "£",
  step = 1,
  min = 0,
  icon,
  hint,
}: NumberFieldProps) {
  const id = useId();
  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={id}
        className="flex items-center gap-1.5 text-sm font-medium text-slate-700"
      >
        {icon && <span className="text-slate-400">{icon}</span>}
        {label}
      </label>
      <div className="relative">
        {adornment === "£" && (
          <PoundSterling className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        )}
        <input
          id={id}
          type="number"
          inputMode="decimal"
          step={step}
          min={min}
          value={Number.isFinite(value) ? value : ""}
          onChange={(event) => {
            const parsed = Number.parseFloat(event.target.value);
            onChange(Number.isFinite(parsed) ? parsed : 0);
          }}
          className={`w-full rounded-xl border border-slate-200 bg-white py-2.5 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30 ${
            adornment === "£"
              ? "pl-9 pr-8"
              : adornment === "%"
                ? "px-3.5 pr-8"
                : "px-3.5"
          }`}
        />
        {adornment === "%" && (
          <Percent className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        )}
      </div>
      {hint && <p className="text-xs text-slate-500">{hint}</p>}
    </div>
  );
}

/**
 * InputForm — tabbed calculator inputs, split into
 * "Purchase & Financing" and "Income & Expenses".
 */
export default function InputForm({ inputs, onChange }: InputFormProps) {
  const [tab, setTab] = useState<Tab>("purchase");

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "purchase", label: "Purchase & Financing", icon: <Landmark className="h-4 w-4" /> },
    { id: "income", label: "Income & Expenses", icon: <Wallet className="h-4 w-4" /> },
  ];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      {/* Tab bar */}
      <div className="flex gap-1 border-b border-slate-100 p-1.5">
        {tabs.map((t) => {
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              aria-pressed={active}
              className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                active
                  ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
              }`}
            >
              {t.icon}
              <span className="hidden sm:inline">{t.label}</span>
              <span className="sm:hidden">
                {t.id === "purchase" ? "Purchase" : "Income"}
              </span>
            </button>
          );
        })}
      </div>

      <div className="p-5 sm:p-6">
        {tab === "purchase" ? (
          <div className="space-y-5">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <NumberField
                label="Purchase Price"
                value={inputs.purchasePrice}
                onChange={(v) => onChange("purchasePrice", v)}
                step={1000}
                icon={<Building2 className="h-4 w-4" />}
              />
              <NumberField
                label="Renovation Costs"
                value={inputs.renoCosts}
                onChange={(v) => onChange("renoCosts", v)}
                step={500}
                icon={<Wrench className="h-4 w-4" />}
              />
              <NumberField
                label="Stamp Duty"
                value={inputs.stampDuty}
                onChange={(v) => onChange("stampDuty", v)}
                step={100}
                icon={<ReceiptText className="h-4 w-4" />}
              />
              <NumberField
                label="Legal Fees"
                value={inputs.legalFees}
                onChange={(v) => onChange("legalFees", v)}
                step={100}
                icon={<ReceiptText className="h-4 w-4" />}
              />
            </div>

            {/* Financing */}
            <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-4">
              <label className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                  <Banknote className="h-4 w-4 text-slate-400" />
                  Finance with a mortgage
                </span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={inputs.useMortgage}
                  onClick={() => onChange("useMortgage", !inputs.useMortgage)}
                  className={`relative h-6 w-11 shrink-0 rounded-full transition ${
                    inputs.useMortgage ? "bg-emerald-500" : "bg-slate-300"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition ${
                      inputs.useMortgage ? "left-[22px]" : "left-0.5"
                    }`}
                  />
                </button>
              </label>

              {inputs.useMortgage && (
                <div className="mt-4 space-y-4">
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <NumberField
                      label="Deposit"
                      value={inputs.mortgageDepositPercent}
                      onChange={(v) => onChange("mortgageDepositPercent", v)}
                      adornment="%"
                      step={1}
                    />
                    <NumberField
                      label="Interest Rate"
                      value={inputs.mortgageInterestRate}
                      onChange={(v) => onChange("mortgageInterestRate", v)}
                      adornment="%"
                      step={0.1}
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <div className="flex flex-col gap-1.5">
                      <span className="text-sm font-medium text-slate-700">
                        Mortgage Type
                      </span>
                      <div className="flex rounded-xl border border-slate-200 bg-white p-1">
                        {(
                          [
                            { id: "interest-only", label: "Interest-only" },
                            { id: "repayment", label: "Repayment" },
                          ] as { id: MortgageType; label: string }[]
                        ).map((opt) => {
                          const active = inputs.mortgageType === opt.id;
                          return (
                            <button
                              key={opt.id}
                              type="button"
                              onClick={() => onChange("mortgageType", opt.id)}
                              className={`flex-1 rounded-lg px-2 py-1.5 text-xs font-semibold transition ${
                                active
                                  ? "bg-emerald-500 text-white shadow-sm"
                                  : "text-slate-500 hover:text-slate-700"
                              }`}
                            >
                              {opt.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <NumberField
                      label="Mortgage Term (years)"
                      value={inputs.mortgageTermYears}
                      onChange={(v) => onChange("mortgageTermYears", v)}
                      adornment="none"
                      step={1}
                      hint="Used for repayment mortgages."
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <NumberField
              label="Monthly Rent"
              value={inputs.monthlyRent}
              onChange={(v) => onChange("monthlyRent", v)}
              step={50}
              icon={<Home className="h-4 w-4" />}
            />
            <NumberField
              label="Management Fee"
              value={inputs.mgmtFeePercent}
              onChange={(v) => onChange("mgmtFeePercent", v)}
              adornment="%"
              step={0.5}
              icon={<Percent className="h-4 w-4" />}
              hint="Percentage of monthly rent."
            />
            <NumberField
              label="Insurance (annual)"
              value={inputs.insurance}
              onChange={(v) => onChange("insurance", v)}
              step={50}
              icon={<ReceiptText className="h-4 w-4" />}
            />
            <NumberField
              label="Maintenance (annual)"
              value={inputs.maintenance}
              onChange={(v) => onChange("maintenance", v)}
              step={100}
              icon={<Wrench className="h-4 w-4" />}
            />
          </div>
        )}
      </div>
    </div>
  );
}
