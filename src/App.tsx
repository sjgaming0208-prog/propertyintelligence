import { useCallback, useState } from "react";
import Header from "./components/Header";
import Footer from "./components/Footer";
import LegalModal from "./components/LegalModal";
import LandingSearch from "./components/LandingSearch";
import DashboardView from "./components/DashboardView";
import SuccessScreen from "./components/SuccessScreen";
import {
  emptyInputs,
  type CalcMode,
  type ModalType,
  type PropertyInputs,
  type Step,
} from "./types";

/**
 * App — global layout template and single-page state router.
 *
 * Owns all cross-cutting state (step, calcMode, inputs, modalType) and threads
 * it down into the step views and the persistent header/footer.
 */
export default function App() {
  const [step, setStep] = useState<Step>(1);
  const [calcMode, setCalcMode] = useState<CalcMode>("investor");
  const [inputs, setInputs] = useState<PropertyInputs>(emptyInputs);
  const [modalType, setModalType] = useState<ModalType>(null);

  /** Advance/return to a given step and scroll to the top. */
  const goToStep = useCallback((next: number) => {
    setStep(next as Step);
    setModalType(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  /** Return to the landing search. */
  const goHome = useCallback(() => goToStep(1), [goToStep]);

  /** Fully reset the application to a clean first-run state. */
  const resetAll = useCallback(() => {
    setStep(1);
    setCalcMode("investor");
    setInputs(emptyInputs);
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
            initialInputs={inputs}
            onSubmit={(next) => {
              setInputs(next);
              goToStep(2);
            }}
          />
        )}

        {step === 2 && (
          <DashboardView setStep={goToStep} calcMode={calcMode} inputs={inputs} />
        )}

        {step === 3 && (
          <SuccessScreen inputs={inputs} onRestart={resetAll} />
        )}
      </main>

      <Footer onOpenModal={setModalType} />

      <LegalModal type={modalType} onClose={() => setModalType(null)} />
    </div>
  );
}
