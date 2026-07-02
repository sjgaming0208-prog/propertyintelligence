import logoMarkUrl from "../assets/logo-mark.png";
import type { ModalType } from "../types";

interface FooterProps {
  /** Open the legal overlay for the given document. */
  onOpenModal: (type: ModalType) => void;
}

/**
 * Footer — FCA / UK-GDPR compliance disclaimers and legal document triggers.
 */
export default function Footer({ onOpenModal }: FooterProps) {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-800 bg-slate-900 text-slate-300">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div className="max-w-xl">
            <div className="flex items-center gap-2.5">
              <span className="flex items-center justify-center rounded-lg bg-white px-2 py-1.5">
                <img
                  src={logoMarkUrl}
                  alt="Property Intelligence Hub"
                  className="h-6 w-auto"
                />
              </span>
              <span className="text-sm font-bold text-white">
                Property Intelligence Hub
              </span>
            </div>
            <p className="mt-4 text-xs leading-relaxed text-slate-400">
              <strong className="text-slate-200">
                Important regulatory notice.
              </strong>{" "}
              Property Intelligence Hub is a software and data-analytics
              service. We are{" "}
              <strong className="text-slate-200">
                not an FCA-regulated financial advisory firm, mortgage broker or
                lender
              </strong>
              , and nothing presented here constitutes regulated financial
              advice, a personal recommendation or an offer of credit. All
              figures are illustrative estimates generated from simulated PropEco
              parameters and should not be relied upon for financial decisions.
              Always seek advice from a firm authorised and regulated by the
              Financial Conduct Authority before entering any mortgage or
              investment arrangement.
            </p>
          </div>

          <div className="md:text-right">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Legal &amp; Compliance
            </p>
            <div className="mt-4 flex flex-col gap-2 md:items-end">
              <button
                type="button"
                onClick={() => onOpenModal("privacy")}
                className="text-sm font-medium text-slate-300 underline-offset-4 transition hover:text-emerald-400 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
              >
                Privacy Policy
              </button>
              <button
                type="button"
                onClick={() => onOpenModal("terms")}
                className="text-sm font-medium text-slate-300 underline-offset-4 transition hover:text-emerald-400 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
              >
                Terms of Service
              </button>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-2 border-t border-slate-800 pt-6 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} Property Intelligence Hub. All rights reserved.</p>
          <p>
            UK GDPR compliant · Data purged automatically after 90 days ·
            Registered in England &amp; Wales
          </p>
        </div>
      </div>
    </footer>
  );
}
