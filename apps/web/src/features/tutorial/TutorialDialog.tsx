import { CheckCircle2, X } from "lucide-react";
import { useI18n } from "../i18n/I18nProvider";

export function TutorialDialog({ onClose }: { onClose(): void }) {
  const { t } = useI18n();
  const steps = [
    ["tutorialStepOneTitle", "tutorialStepOneDescription"],
    ["tutorialStepTwoTitle", "tutorialStepTwoDescription"],
    ["tutorialStepThreeTitle", "tutorialStepThreeDescription"],
    ["tutorialStepFourTitle", "tutorialStepFourDescription"],
  ];
  return (
    <div className="tutorial-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        className="tutorial-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="tutorial-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button className="tutorial-close" onClick={onClose} aria-label={t("closeTutorial")}>
          <X size={18} />
        </button>
        <p className="eyebrow">Resolve / {t("tutorial")}</p>
        <h2 id="tutorial-title">{t("tutorialTitle")}</h2>
        <p className="tutorial-lead">{t("tutorialLead")}</p>
        <ol className="tutorial-steps">
          {steps.map(([title, description], index) => (
            <li key={title}>
              <span>{index + 1}</span>
              <div>
                <strong>{t(title)}</strong>
                <p>{t(description)}</p>
              </div>
              <CheckCircle2 size={16} />
            </li>
          ))}
        </ol>
        <button className="form-submit" onClick={onClose}>
          {t("startExploring")}
        </button>
      </section>
    </div>
  );
}
