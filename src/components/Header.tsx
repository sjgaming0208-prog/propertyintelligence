import logoMarkUrl from "../assets/logo-mark.png";
import type { AppView } from "../types";

interface HeaderProps {
  /** Return to the hub funnel (fired by the logo). */
  onLogoClick: () => void;
  /** Full application reset (fired by "New Calculation"). */
  onReset: () => void;
  /** The currently active top-level view. */
  view: AppView;
  /** Switch top-level view. */
  onNavigate: (view: AppView) => void;
}

/**
 * Header — sticky top navigation with the premium brand mark, top-level view
 * navigation, and a reset control.
 */
export default function Header({
  onLogoClick,
  onReset,
  view,
  onNavigate,
}: HeaderProps) {
  const navItems: { id: AppView; label: string }[] = [
    { id: "hub", label: "Hub" },
    { id: "calculator", label: "ROI Calculator" },
  ];

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
            src={logoMarkUrl}
            alt="Property Intelligence Hub"
            className="h-10 w-auto shrink-0 transition-transform group-hover:scale-105"
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

        <div className="flex items-center gap-2 sm:gap-4">
          <nav className="flex rounded-xl bg-slate-100 p-1">
            {navItems.map((item) => {
              const active = view === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onNavigate(item.id)}
                  aria-current={active ? "page" : undefined}
                  className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold transition sm:px-3.5 sm:text-sm ${
                    active
                      ? "bg-white text-emerald-700 shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {view === "hub" && (
            <button
              type="button"
              onClick={onReset}
              className="hidden items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-emerald-300 hover:text-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 sm:inline-flex"
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
          )}
        </div>
      </div>
    </header>
  );
}
