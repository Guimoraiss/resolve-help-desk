import { zodResolver } from "@hookform/resolvers/zod";
import { useRef, useState, type ReactNode } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { z } from "zod";
import { useAuth } from "./AuthProvider";
import { useI18n } from "../i18n/I18nProvider";

const loginSchema = z.object({
  email: z.string().email("Informe um e-mail válido"),
  password: z.string().min(12, "A senha deve ter ao menos 12 caracteres"),
});
const registerSchema = loginSchema.extend({
  name: z.string().min(2, "Informe seu nome"),
  organizationName: z.string().min(2, "Informe o nome da organização"),
  organizationSlug: z
    .string()
    .min(3, "O slug deve ter ao menos 3 caracteres")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use letras minúsculas, números e hífens"),
});
type LoginForm = z.infer<typeof loginSchema>;
type RegisterForm = z.infer<typeof registerSchema>;
type AuthForm = LoginForm & Partial<Pick<RegisterForm, "name" | "organizationName" | "organizationSlug">>;

export function AuthPage() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const { login, register: registerAccount } = useAuth();
  const { t } = useI18n();
  const modeReference = useRef(mode);
  modeReference.current = mode;
  const resolver: Resolver<AuthForm> = (values, context, options) =>
    zodResolver(modeReference.current === "login" ? loginSchema : registerSchema)(
      values,
      context,
      options,
    ) as ReturnType<Resolver<AuthForm>>;
  const form = useForm<AuthForm>({ resolver, defaultValues: { email: "", password: "" } });
  const submit = form.handleSubmit(async (values) => {
    try {
      if (mode === "login") await login(values as LoginForm);
      else await registerAccount(values as RegisterForm);
    } catch (error) {
      form.setError("root", { message: error instanceof Error ? error.message : "Unable to authenticate" });
    }
  });
  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="brand">
          <span className="brand-mark">R</span>
          <span>resolve</span>
        </div>
        <p className="eyebrow">{t("customerOperations")}</p>
        <h1>{mode === "login" ? t("welcomeBack") : t("createWorkspace")}</h1>
        <p className="auth-lead">{mode === "login" ? t("signInLead") : t("createLead")}</p>
        <form onSubmit={submit}>
          {mode === "register" && (
            <>
              <Field label={t("yourName")} error={form.formState.errors.name?.message}>
                <input {...form.register("name")} autoComplete="name" />
              </Field>
              <Field label={t("organization")} error={form.formState.errors.organizationName?.message}>
                <input {...form.register("organizationName")} autoComplete="organization" />
              </Field>
              <Field label={t("workspaceSlug")} error={form.formState.errors.organizationSlug?.message}>
                <input {...form.register("organizationSlug")} placeholder="acme-inc" />
              </Field>
            </>
          )}
          <Field label={t("workEmail")} error={form.formState.errors.email?.message}>
            <input {...form.register("email")} type="email" autoComplete="email" />
          </Field>
          <Field label={t("password")} error={form.formState.errors.password?.message}>
            <input
              {...form.register("password")}
              type="password"
              autoComplete={mode === "login" ? "current-password" : "new-password"}
            />
          </Field>
          {form.formState.errors.root && <p className="form-error">{form.formState.errors.root.message}</p>}
          <button className="auth-submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting
              ? t("pleaseWait")
              : mode === "login"
                ? t("signIn")
                : t("createAccount")}
          </button>
        </form>
        <button
          className="auth-switch"
          onClick={() => {
            setMode(mode === "login" ? "register" : "login");
            form.reset();
          }}
        >
          {mode === "login" ? t("needAccount") : t("alreadyAccount")}
        </button>
      </section>
    </main>
  );
}
function Field({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
      {error && <small>{error}</small>}
    </label>
  );
}
