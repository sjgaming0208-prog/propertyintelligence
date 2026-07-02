import { useEffect } from "react";
import type { ModalType } from "../types";

interface LegalModalProps {
  /** The document to render, or `null` when the overlay is closed. */
  type: ModalType;
  onClose: () => void;
}

interface LegalContent {
  title: string;
  subtitle: string;
  sections: { heading: string; body: string }[];
}

const CONTENT: Record<"privacy" | "terms", LegalContent> = {
  privacy: {
    title: "Privacy Policy",
    subtitle: "How we handle your data under UK GDPR",
    sections: [
      {
        heading: "1. Lawful basis & UK GDPR compliance",
        body: "ClimateSmart Hub processes personal data in accordance with the UK General Data Protection Regulation (UK GDPR) and the Data Protection Act 2018. We collect your name, email address, telephone number and property details on the lawful basis of your explicit consent, provided when you submit the lead-capture form.",
      },
      {
        heading: "2. What we collect",
        body: "We collect the contact and property parameters you enter (name, email, phone, postcode, house number, price, deposit and either rental or utility figures) together with the illustrative metrics our engine derives from them.",
      },
      {
        heading: "3. 90-day automated data purge",
        body: "Your records are stored within our Supabase infrastructure layers and are subject to an automated 90-day retention limit. After 90 days, personal data is automatically and permanently purged from our production and backup layers unless you have an active engagement with a partner broker that legally requires longer retention.",
      },
      {
        heading: "4. Sharing with regulated brokers",
        body: "Where you provide consent, your contact parameters will be shared with FCA-regulated mortgage brokers so that they may contact you about suitable products. These brokers act as independent data controllers once your details are transferred, and their own privacy notices will apply.",
      },
      {
        heading: "5. Your rights",
        body: "You have the right to access, rectify, erase, restrict or object to the processing of your personal data, and the right to data portability. To exercise any of these rights, or to withdraw consent at any time, contact privacy@climatesmarthub.example. You may also lodge a complaint with the Information Commissioner's Office (ICO).",
      },
    ],
  },
  terms: {
    title: "Terms of Service",
    subtitle: "The agreement governing your use of ClimateSmart Hub",
    sections: [
      {
        heading: "1. Software service — not financial advice",
        body: "ClimateSmart Hub is a software and analytics tool. We are not an FCA-regulated financial advisory firm, mortgage broker or lender. Nothing on this platform constitutes regulated financial advice, a personal recommendation or an offer of credit.",
      },
      {
        heading: "2. Illustrative, simulated figures",
        body: "All yields, cash-flow figures and cost-of-ownership metrics are illustrative estimates produced from simulated PropEco parameters — including a fixed EPC retrofit liability and flood-premium surcharge — and assumed interest rates. Actual figures will differ. You must not rely on these outputs when making financial decisions.",
      },
      {
        heading: "3. Lead generation & broker referral",
        body: "By submitting the lead-capture form and ticking the consent box, you agree that your contact parameters may be securely passed to registered, FCA-regulated mortgage brokers who may contact you by phone or email regarding relevant products.",
      },
      {
        heading: "4. Data retention",
        body: "Data submitted through the service is retained within our Supabase infrastructure for a maximum of 90 days and is then automatically purged, as described in our Privacy Policy.",
      },
      {
        heading: "5. Limitation of liability",
        body: "To the fullest extent permitted by law, ClimateSmart Hub accepts no liability for any loss arising from reliance on the illustrative outputs of this tool. Your use of the service is entirely at your own risk.",
      },
    ],
  },
};

/**
 * LegalModal — fixed, blurred-backdrop overlay rendering either the privacy
 * policy or the terms of service. Closes on Escape, backdrop click, or button.
 */
export default function LegalModal({ type, onClose }: LegalModalProps) {
  useEffect(() => {
    if (!type) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);

    // Prevent the background from scrolling while the modal is open.
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [type, onClose]);

  if (!type) return null;

  const content = CONTENT[type];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="legal-modal-title"
    >
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="animate-fade-in-up relative flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-slate-900/5">
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 bg-gradient-to-r from-emerald-50 to-sky-50 px-6 py-5">
          <div>
            <h2
              id="legal-modal-title"
              className="text-lg font-bold text-slate-900"
            >
              {content.title}
            </h2>
            <p className="mt-0.5 text-sm text-slate-500">{content.subtitle}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-slate-400 transition hover:bg-white hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
            aria-label="Close"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-5 overflow-y-auto px-6 py-6">
          {content.sections.map((section) => (
            <section key={section.heading}>
              <h3 className="text-sm font-semibold text-slate-900">
                {section.heading}
              </h3>
              <p className="mt-1 text-sm leading-relaxed text-slate-600">
                {section.body}
              </p>
            </section>
          ))}
        </div>

        <div className="border-t border-slate-100 bg-slate-50 px-6 py-4 text-right">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
          >
            I understand
          </button>
        </div>
      </div>
    </div>
  );
}
