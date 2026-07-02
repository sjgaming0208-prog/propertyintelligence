import {
  ArrowDownRight,
  ArrowUpRight,
  Coins,
  Home,
  Percent,
  PiggyBank,
  ShieldCheck,
  TrendingUp,
  Wallet,
  Wrench,
} from "lucide-react";
import { formatGBP, formatPercent } from "../calculations";
import type { CashFlowBreakdown, Outputs } from "../types";

interface ResultsDisplayProps {
  outputs: Outputs;
  breakdown: CashFlowBreakdown;
}

interface MetricCardProps {
  label: string;
  value: string;
  caption: string;
  icon: React.ReactNode;
  accent: "emerald" | "sky" | "violet";
}

function MetricCard({ label, value, caption, icon, accent }: MetricCardProps) {
  const accents = {
    emerald: "from-emerald-500 to-emerald-600",
    sky: "from-sky-500 to-sky-600",
    violet: "from-violet-500 to-violet-600",
  } as const;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-500">{label}</span>
        <span
          className={`flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br text-white ${accents[accent]}`}
        >
          {icon}
        </span>
      </div>
      <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900 tabular-nums">
        {value}
      </p>
      <p className="mt-1 text-xs text-slate-500">{caption}</p>
    </div>
  );
}

interface RowProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  kind: "income" | "expense";
}

function BreakdownRow({ label, value, icon, kind }: RowProps) {
  const isExpense = kind === "expense";
  return (
    <div className="flex items-center justify-between gap-4 py-2.5">
      <span className="flex items-center gap-2.5 text-sm text-slate-600">
        <span
          className={`flex h-7 w-7 items-center justify-center rounded-lg ${
            isExpense ? "bg-rose-50 text-rose-500" : "bg-emerald-50 text-emerald-600"
          }`}
        >
          {icon}
        </span>
        {label}
      </span>
      <span
        className={`text-sm font-semibold tabular-nums ${
          isExpense ? "text-rose-600" : "text-slate-900"
        }`}
      >
        {isExpense ? "−" : "+"} {formatGBP(Math.abs(value))}
      </span>
    </div>
  );
}

/**
 * ResultsDisplay — dashboard of headline metrics plus a monthly cash-flow
 * breakdown. Purely presentational; recomputed in real time by the parent.
 */
export default function ResultsDisplay({
  outputs,
  breakdown,
}: ResultsDisplayProps) {
  const cashFlowPositive = breakdown.monthlyNetCashFlow >= 0;

  return (
    <div className="space-y-5">
      {/* Metric cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <MetricCard
          label="Gross Yield"
          value={formatPercent(outputs.grossYield)}
          caption="Annual rent ÷ purchase price"
          icon={<Percent className="h-5 w-5" />}
          accent="sky"
        />
        <MetricCard
          label="Net Yield"
          value={formatPercent(outputs.netYield)}
          caption="Net income ÷ total project cost"
          icon={<TrendingUp className="h-5 w-5" />}
          accent="emerald"
        />
        <MetricCard
          label="Cash-on-Cash ROI"
          value={formatPercent(outputs.cashOnCashRoi)}
          caption="Annual cash flow ÷ cash invested"
          icon={<PiggyBank className="h-5 w-5" />}
          accent="violet"
        />
      </div>

      {/* Monthly cash flow breakdown */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-center gap-2">
          <Wallet className="h-5 w-5 text-slate-400" />
          <h3 className="text-base font-bold text-slate-900">
            Monthly Cash Flow
          </h3>
        </div>

        <div className="mt-3 divide-y divide-slate-100">
          <BreakdownRow
            label="Rental income"
            value={breakdown.monthlyRent}
            icon={<Home className="h-3.5 w-3.5" />}
            kind="income"
          />
          <BreakdownRow
            label="Management fee"
            value={breakdown.monthlyMgmtFee}
            icon={<Coins className="h-3.5 w-3.5" />}
            kind="expense"
          />
          <BreakdownRow
            label="Insurance"
            value={breakdown.monthlyInsurance}
            icon={<ShieldCheck className="h-3.5 w-3.5" />}
            kind="expense"
          />
          <BreakdownRow
            label="Maintenance"
            value={breakdown.monthlyMaintenance}
            icon={<Wrench className="h-3.5 w-3.5" />}
            kind="expense"
          />
          {breakdown.monthlyMortgage > 0 && (
            <BreakdownRow
              label="Mortgage payment"
              value={breakdown.monthlyMortgage}
              icon={<PiggyBank className="h-3.5 w-3.5" />}
              kind="expense"
            />
          )}
        </div>

        <div
          className={`mt-4 flex items-center justify-between rounded-xl px-4 py-3.5 ${
            cashFlowPositive ? "bg-emerald-50" : "bg-rose-50"
          }`}
        >
          <span className="flex items-center gap-2 text-sm font-semibold text-slate-800">
            {cashFlowPositive ? (
              <ArrowUpRight className="h-4 w-4 text-emerald-600" />
            ) : (
              <ArrowDownRight className="h-4 w-4 text-rose-600" />
            )}
            Net monthly cash flow
          </span>
          <span
            className={`text-lg font-bold tabular-nums ${
              cashFlowPositive ? "text-emerald-700" : "text-rose-700"
            }`}
          >
            {formatGBP(breakdown.monthlyNetCashFlow)}
          </span>
        </div>

        {/* Supporting investment summary */}
        <dl className="mt-5 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
          <div className="rounded-xl bg-slate-50 p-3">
            <dt className="text-xs text-slate-500">Deposit</dt>
            <dd className="mt-0.5 font-semibold text-slate-900 tabular-nums">
              {formatGBP(breakdown.depositAmount)}
            </dd>
          </div>
          <div className="rounded-xl bg-slate-50 p-3">
            <dt className="text-xs text-slate-500">Loan amount</dt>
            <dd className="mt-0.5 font-semibold text-slate-900 tabular-nums">
              {formatGBP(breakdown.loanAmount)}
            </dd>
          </div>
          <div className="rounded-xl bg-slate-50 p-3">
            <dt className="text-xs text-slate-500">Cash invested</dt>
            <dd className="mt-0.5 font-semibold text-slate-900 tabular-nums">
              {formatGBP(breakdown.totalCashInvested)}
            </dd>
          </div>
          <div className="rounded-xl bg-slate-50 p-3">
            <dt className="text-xs text-slate-500">Annual cash flow</dt>
            <dd
              className={`mt-0.5 font-semibold tabular-nums ${
                breakdown.annualCashFlow >= 0 ? "text-slate-900" : "text-rose-600"
              }`}
            >
              {formatGBP(breakdown.annualCashFlow)}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
