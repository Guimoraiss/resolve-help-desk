import { Bell, ChevronDown, Command, LayoutDashboard, Plus, Search } from "lucide-react";
import { Link, NavLink, Route, Routes } from "react-router-dom";
import { InboxPage } from "../features/tickets/InboxPage";
import { TicketDetailPage } from "../features/tickets/TicketDetailPage";
import { NewTicketPage } from "../features/tickets/NewTicketPage";
import { CustomersPage } from "../features/customers/CustomersPage";
import { AuthPage } from "../features/auth/AuthPage";
import { useAuth } from "../features/auth/AuthProvider";
import { useI18n } from "../features/i18n/I18nProvider";
import { SettingsPage } from "../features/settings/SettingsPage";
import { DashboardPage } from "../features/dashboard/DashboardPage";
import { AnalyticsPage } from "../features/analytics/AnalyticsPage";
import { TeamPage } from "../features/team/TeamPage";

const navigation = [
  ["dashboard", "/", LayoutDashboard],
  ["inbox", "/inbox", Command],
  ["customers", "/customers", Command],
  ["analytics", "/analytics", Command],
  ["team", "/team", Command],
  ["settings", "/settings", Command],
] as const;

function Placeholder({ title }: { title: string }) {
  const { t } = useI18n();
  return (
    <main className="placeholder">
      <p className="eyebrow">Resolve / {title}</p>
      <h1>{title}</h1>
      <p>{t("placeholderDescription")}</p>
    </main>
  );
}

export function App() {
  const { session, logout, selectOrganization } = useAuth();
  const { t } = useI18n();
  if (!session) return <AuthPage />;
  const organization = session.organizations.find((item) => item.id === session.organizationId)!;
  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark">R</span>
          <span>resolve</span>
        </div>
        <label className="organization">
          <select
            value={organization.id}
            onChange={(event) => selectOrganization(event.target.value)}
            aria-label="Current organization"
          >
            {session.organizations.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
          <ChevronDown size={14} />
        </label>
        <nav>
          {navigation.map(([label, href, Icon]) => (
            <NavLink key={href} to={href} end={href === "/"}>
              <Icon size={16} />
              {t(label)}
            </NavLink>
          ))}
        </nav>
        <button className="sidebar-footer" onClick={logout} title={t("signOut")}>
          <span className="avatar">{session.user.name.slice(0, 2).toUpperCase()}</span>
          <div>
            <strong>{session.user.name}</strong>
            <small>
              {organization.role} · {t("signOut")}
            </small>
          </div>
        </button>
      </aside>
      <section className="workspace">
        <header className="topbar">
          <div className="search">
            <Search size={16} />
            <span>{t("search")}</span>
            <kbd>⌘ K</kbd>
          </div>
          <button className="icon-button" aria-label="Notifications">
            <Bell size={18} />
          </button>
          <Link className="new-ticket" to="/tickets/new">
            <Plus size={16} />
            {t("newTicket")}
          </Link>
        </header>
        <Routes>
          <Route path="/" element={<DashboardPage organizationId={organization.id} />} />
          <Route path="/inbox" element={<InboxPage organizationId={organization.id} />} />
          <Route path="/inbox/:ticketId" element={<TicketDetailPage organizationId={organization.id} />} />
          <Route path="/tickets/new" element={<NewTicketPage organizationId={organization.id} />} />
          <Route path="/customers" element={<CustomersPage organizationId={organization.id} />} />
          <Route path="/analytics" element={<AnalyticsPage organizationId={organization.id} />} />
          <Route path="/team" element={<TeamPage organizationId={organization.id} />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<Placeholder title={t("comingSoon")} />} />
        </Routes>
      </section>
    </div>
  );
}
