import emblemUrl from "../assets/emblem.svg";

interface HeaderProps {
  /** Reset the flow back to step 1 (fired by the logo). */
  onLogoClick: () => void;
  /** Full application reset (fired by "New Calculation"). */
  onReset: () => void;
}

/**
 * Header — sticky top navigation with the premium brand mark.
 * The logo returns to step 1; "New Calculation" clears all state.
 */
export default function Header({ onLogoClick, onReset }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/80 backdrop-blur-lg">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <button
          type="button"
          onClick={onLogoClick}
          className="group flex items-center gap-2.5 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
          aria-label="Property Intelligence Hub — return to search"
        >
          <img
            src={emblemUrl}
            alt=""
            aria-hidden="true"
            className="h-10 w-10 shrink-0 transition-transform group-hover:scale-105"
          />
          <span className="flex flex-col leading-none">
            <span className="text-base font-bold tracking-tight text-[#232C63]">
              Property Intelligence{" "}
              <span className="text-emerald-600">Hub</span>
            </span>
            <span className="mt-0.5 text-[10px] font-medium uppercase tracking-[0.18em] text-slate-400">
              Climate-Smart Analytics
            </span>
          </span>
        </button>

        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-emerald-300 hover:text-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
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
          New Calculation
        </button>
      </div>
    </header>
  );
}
