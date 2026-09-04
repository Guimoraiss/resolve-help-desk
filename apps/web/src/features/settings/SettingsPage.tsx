import { BellRing, Globe2, Moon, ShieldCheck, UserRound } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../auth/AuthProvider";
import { useI18n, type Locale } from "../i18n/I18nProvider";

type Preferences = {
  email: boolean;
  browser: boolean;
  sound: boolean;
  compact: boolean;
  reducedMotion: boolean;
};
const preferenceKey = "resolve.user-preferences";
function readPreferences(): Preferences {
  try {
    return {
      email: true,
      browser: false,
      sound: true,
      compact: false,
      reducedMotion: false,
      ...JSON.parse(localStorage.getItem(preferenceKey) ?? "{}"),
    };
  } catch {
    return { email: true, browser: false, sound: true, compact: false, reducedMotion: false };
  }
}

export function SettingsPage() {
  const { session } = useAuth();
  const { locale, setLocale, t } = useI18n();
  const [preferences, setPreferences] = useState(readPreferences);
  const updatePreference = (key: keyof Preferences, value: boolean) => {
    const next = { ...preferences, [key]: value };
    setPreferences(next);
    localStorage.setItem(preferenceKey, JSON.stringify(next));
    document.documentElement.dataset.compact = String(next.compact);
    document.documentElement.dataset.reducedMotion = String(next.reducedMotion);
  };
  return (
    <main className="settings-page">
      <div className="settings-hero">
        <div>
          <p className="eyebrow">{t("settings")}</p>
          <h1>{t("settingsTitle")}</h1>
          <p>Personalize a sua experiência no Resolve.</p>
        </div>
        <div className="settings-avatar">{session?.user.name.slice(0, 2).toUpperCase()}</div>
      </div>
      <div className="settings-grid">
        <section className="settings-section profile-card">
          <div className="settings-title">
            <UserRound size={17} />
            <div>
              <p className="eyebrow">{t("profile")}</p>
              <h2>{t("personalInformation")}</h2>
            </div>
          </div>
          <div className="profile-summary">
            <span className="large-avatar">{session?.user.name.slice(0, 2).toUpperCase()}</span>
            <div>
              <strong>{session?.user.name}</strong>
              <p>{session?.user.email}</p>
              <span>
                {
                  session?.organizations.find((organization) => organization.id === session.organizationId)
                    ?.role
                }
              </span>
            </div>
          </div>
        </section>
        <section className="settings-section">
          <div className="settings-title">
            <Globe2 size={17} />
            <div>
              <p className="eyebrow">{t("interface")}</p>
              <h2>{t("interfaceLanguage")}</h2>
            </div>
          </div>
          <p className="settings-description">{t("languageDescription")}</p>
          <select
            className="settings-select"
            value={locale}
            onChange={(event) => setLocale(event.target.value as Locale)}
          >
            <option value="pt-BR">{t("portugueseBrazil")}</option>
            <option value="en">{t("english")}</option>
            <option value="es">{t("spanish")}</option>
            <option value="fr">{t("french")}</option>
            <option value="de">{t("german")}</option>
          </select>
        </section>
        <section className="settings-section">
          <div className="settings-title">
            <BellRing size={17} />
            <div>
              <p className="eyebrow">{t("notifications")}</p>
              <h2>{t("localPreferences")}</h2>
            </div>
          </div>
          <Preference
            label={t("emailNotifications")}
            checked={preferences.email}
            onChange={(value) => updatePreference("email", value)}
          />
          <Preference
            label={t("browserNotifications")}
            checked={preferences.browser}
            onChange={(value) => updatePreference("browser", value)}
          />
          <Preference
            label={t("playSound")}
            checked={preferences.sound}
            onChange={(value) => updatePreference("sound", value)}
          />
        </section>
        <section className="settings-section">
          <div className="settings-title">
            <Moon size={17} />
            <div>
              <p className="eyebrow">{t("interface")}</p>
              <h2>{t("localPreferences")}</h2>
            </div>
          </div>
          <Preference
            label={t("compactMode")}
            checked={preferences.compact}
            onChange={(value) => updatePreference("compact", value)}
          />
          <Preference
            label={t("reduceMotion")}
            checked={preferences.reducedMotion}
            onChange={(value) => updatePreference("reducedMotion", value)}
          />
          <p className="settings-note">
            <ShieldCheck size={14} />
            {t("savedBrowser")}
          </p>
        </section>
      </div>
    </main>
  );
}

function Preference({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange(value: boolean): void;
}) {
  return (
    <label className="preference">
      <span>{label}</span>
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />
      <i aria-hidden="true" />
    </label>
  );
}
