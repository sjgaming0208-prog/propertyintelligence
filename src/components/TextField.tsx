import { useId } from "react";

interface TextFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: "text" | "email" | "tel" | "number";
  required?: boolean;
  /** Optional leading adornment, e.g. a "£" symbol. */
  prefix?: string;
  inputMode?: "text" | "numeric" | "decimal" | "email" | "tel";
  hint?: string;
  /** Dark theme variant for the lead-capture gate. */
  dark?: boolean;
}

/**
 * TextField — a small controlled input with a floating label style.
 * Supports light (default) and dark themes.
 */
export default function TextField({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required = false,
  prefix,
  inputMode,
  hint,
  dark = false,
}: TextFieldProps) {
  const id = useId();

  const labelClass = dark
    ? "text-slate-300"
    : "text-slate-700";
  const inputBase =
    "w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none transition focus:ring-2";
  const inputTheme = dark
    ? "border-slate-700 bg-slate-800/80 text-white placeholder-slate-500 focus:border-emerald-500 focus:ring-emerald-500/40"
    : "border-slate-200 bg-white text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:ring-emerald-500/30";

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className={`text-sm font-medium ${labelClass}`}>
        {label}
        {required && <span className="ml-0.5 text-emerald-500">*</span>}
      </label>
      <div className="relative">
        {prefix && (
          <span
            className={`pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm ${
              dark ? "text-slate-400" : "text-slate-400"
            }`}
          >
            {prefix}
          </span>
        )}
        <input
          id={id}
          type={type}
          inputMode={inputMode}
          value={value}
          required={required}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
          className={`${inputBase} ${inputTheme} ${prefix ? "pl-7" : ""}`}
        />
      </div>
      {hint && (
        <p className={`text-xs ${dark ? "text-slate-400" : "text-slate-500"}`}>
          {hint}
        </p>
      )}
    </div>
  );
}
