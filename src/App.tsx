import { useCallback, useState } from "react";
import Header from "./components/Header";
import Footer from "./components/Footer";
import LegalModal from "./components/LegalModal";
import LandingSearch from "./components/LandingSearch";
import DashboardView from "./components/DashboardView";
import SuccessScreen from "./components/SuccessScreen";
import {
  emptyFinancials,
  type CalcMode,
  type Financials,
  type ModalType,
  type Step,
} from "./types";

/**
 * App — global layout template and single-page state router.
 *
 * Owns all cross-cutting state (step, calcMode, financials, modalType) and
 * threads it down into the step views and the persistent header/footer.
 */
export default function App() {
  const [step, setStep] = useState<Step>(1);
  const [calcMode, setCalcMode] = useState<CalcMode>("investor");
  const [financials, setFinancials] = useState<Financials>(emptyFinancials);
  const [modalType, setModalType] = useState<ModalType>(null);

  /** Return to the landing search without wiping typed data. */
  const goHome = useCallback(() => {
    setStep(1);
    setModalType(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  /** Fully reset the application to a clean first-run state. */
  const resetAll = useCallback(() => {
    setStep(1);
    setCalcMode("investor");
    setFinancials(emptyFinancials);
    setModalType(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 font-sans text-slate-900">
      <Header onLogoClick={goHome} onReset={resetAll} />

      <main className="flex-1">
        {step === 1 && (
          <LandingSearch
            calcMode={calcMode}
            setCalcMode={setCalcMode}
            financials={financials}
            setFinancials={setFinancials}
            onSubmit={() => {
              setStep(2);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          />
        )}

        {step === 2 && (
          <DashboardView
            calcMode={calcMode}
            financials={financials}
            setFinancials={setFinancials}
            onBack={goHome}
            onLeadCaptured={() => {
              setStep(3);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          />
        )}

        {step === 3 && (
          <SuccessScreen
            financials={financials}
            onRestart={resetAll}
          />
        )}
      </main>

      <Footer onOpenModal={setModalType} />

      <LegalModal type={modalType} onClose={() => setModalType(null)} />
    </div>
  );
}
