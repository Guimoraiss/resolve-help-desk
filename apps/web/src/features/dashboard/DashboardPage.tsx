import { useQuery } from "@tanstack/react-query";
import { ArrowUpRight, CheckCircle2, CircleDotDashed, UsersRound } from "lucide-react";
import { Link } from "react-router-dom";
import { api } from "../../lib/api";
import { useI18n } from "../i18n/I18nProvider";

type Insights = {
  overview: {
    totalTickets: number;
    activeTickets: number;
    resolvedTickets: number;
    customers: number;
    createdLast7Days: number;
  };
  recentTickets: {
    id: string;
    title: string;
    status: string;
    priority: string;
    updatedAt: string;
    customerName: string;
  }[];
};
const statusKey: Record<string, string> = {
  OPEN: "open",
  IN_PROGRESS: "inProgress",
  WAITING_CUSTOMER: "waitingCustomer",
  RESOLVED: "resolved",
  CLOSED: "closed",
};

export function DashboardPage({ organizationId }: { organizationId: string }) {
  const { t } = useI18n();
  const { data, isLoading, error } = useQuery({
    queryKey: ["insights", organizationId],
    queryFn: () => api<{ insights: Insights }>("/dashboard", {}, organizationId),
  });
  const insights = data?.insights;
  const metrics = insights
    ? [
        [t("totalTickets"), insights.overview.totalTickets, CircleDotDashed],
        [t("activeTickets"), insights.overview.activeTickets, ArrowUpRight],
        [t("resolvedTickets"), insights.overview.resolvedTickets, CheckCircle2],
        [t("customers"), insights.overview.customers, UsersRound],
      ]
    : [];
  return (
    <main className="insights-page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">Resolve / {t("dashboard")}</p>
          <h1>{t("dashboard")}</h1>
          <p className="page-subtitle">{t("dashboardDescription")}</p>
        </div>
        <Link className="new-ticket" to="/tickets/new">
          {t("createTicket")}
        </Link>
      </div>
      {isLoading && <p className="table-message">{t("loadingDashboard")}</p>}
      {error && <p className="table-message error">{error.message}</p>}
      {insights && (
        <>
          <section className="metric-grid">
            {metrics.map(([label, value, Icon]) => {
              const MetricIcon = Icon as typeof CircleDotDashed;
              return (
                <article className="metric-card" key={label as string}>
                  <span>
                    {label as string}
                    <MetricIcon size={16} />
                  </span>
                  <strong>{value as number}</strong>
                </article>
              );
            })}
          </section>
          <section className="data-panel">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">{t("inbox")}</p>
                <h2>{t("recentTickets")}</h2>
              </div>
              <Link to="/inbox">{t("viewAll")}</Link>
            </div>
            {insights.recentTickets.length === 0 ? (
              <p className="table-message">{t("noTickets")}</p>
            ) : (
              <div className="compact-ticket-list">
                {insights.recentTickets.map((ticket) => (
                  <Link to={`/inbox/${ticket.id}`} key={ticket.id}>
                    <div>
                      <strong>{ticket.title}</strong>
                      <span>{ticket.customerName}</span>
                    </div>
                    <span className={`status-pill ${ticket.status.toLowerCase()}`}>
                      {t(statusKey[ticket.status] ?? ticket.status)}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </main>
  );
}
