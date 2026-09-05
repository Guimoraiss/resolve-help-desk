import { useState } from "react";
import { useAuth } from "./AuthProvider";
import { useI18n } from "../i18n/I18nProvider";

export function AuthPage() {
  const { accessDemo } = useAuth();
  const { t } = useI18n();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const enterDemo = async () => {
    setError(null);
    setIsLoading(true);
    try {
      await accessDemo();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : t("demoError"));
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <main className="auth-page">
      <section className="auth-card demo-card">
        <div className="brand">
          <span className="brand-mark">R</span>
          <span>resolve</span>
        </div>
        <p className="eyebrow">{t("customerOperations")}</p>
        <h1>{t("demoTitle")}</h1>
        <p className="auth-lead">{t("demoLead")}</p>
        {error && <p className="form-error">{error}</p>}
        <button className="auth-submit" onClick={enterDemo} disabled={isLoading}>
          {isLoading ? t("pleaseWait") : t("accessDemo")}
        </button>
        <p className="demo-note">{t("demoNote")}</p>
        <p className="auth-credit">
          Developed by:{" "}
          <a href="https://github.com/Guimoraiss" target="_blank" rel="noreferrer">
            github.com/Guimoraiss
          </a>
        </p>
      </section>
    </main>
  );
}
