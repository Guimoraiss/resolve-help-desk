import { useQuery } from "@tanstack/react-query";
import { BarChart3 } from "lucide-react";
import { api } from "../../lib/api";
import { useI18n } from "../i18n/I18nProvider";

type Insights = {
  overview: { totalTickets: number; createdLast7Days: number };
  byStatus: Record<string, number>;
  byPriority: Record<string, number>;
};
const statuses = ["OPEN", "IN_PROGRESS", "WAITING_CUSTOMER", "RESOLVED", "CLOSED"];
const priorities = ["URGENT", "HIGH", "NORMAL", "LOW"];
const labelKeys: Record<string, string> = {
  OPEN: "open",
  IN_PROGRESS: "inProgress",
  WAITING_CUSTOMER: "waitingCustomer",
  RESOLVED: "resolved",
  CLOSED: "closed",
  URGENT: "urgent",
  HIGH: "high",
  NORMAL: "normal",
  LOW: "low",
};

export function AnalyticsPage({ organizationId }: { organizationId: string }) {
  const { t } = useI18n();
  const { data, isLoading, error } = useQuery({
    queryKey: ["insights", organizationId],
    queryFn: () => api<{ insights: Insights }>("/dashboard", {}, organizationId),
  });
  const insights = data?.insights;
  const renderBars = (items: string[], values: Record<string, number>) => {
    const max = Math.max(1, ...Object.values(values));
    return (
      <div className="bar-list">
        {items.map((item) => (
          <div className="bar-row" key={item}>
            <span>{t(labelKeys[item])}</span>
            <div>
              <i style={{ width: `${(values[item] / max) * 100}%` }} />
            </div>
            <b>{values[item]}</b>
          </div>
        ))}
      </div>
    );
  };
  return (
    <main className="insights-page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">Resolve / {t("analytics")}</p>
          <h1>{t("analytics")}</h1>
          <p className="page-subtitle">{t("analyticsDescription")}</p>
        </div>
        <BarChart3 className="page-icon" size={24} />
      </div>
      {isLoading && <p className="table-message">{t("loadingAnalytics")}</p>}
      {error && <p className="table-message error">{error.message}</p>}
      {insights && (
        <>
          <section className="metric-grid analytics-summary">
            <article className="metric-card">
              <span>{t("totalTickets")}</span>
              <strong>{insights.overview.totalTickets}</strong>
            </article>
            <article className="metric-card">
              <span>{t("last7Days")}</span>
              <strong>{insights.overview.createdLast7Days}</strong>
            </article>
          </section>
          <section className="analytics-grid">
            <article className="data-panel">
              <div className="panel-heading">
                <h2>{t("ticketsByStatus")}</h2>
              </div>
              {renderBars(statuses, insights.byStatus)}
            </article>
            <article className="data-panel">
              <div className="panel-heading">
                <h2>{t("ticketsByPriority")}</h2>
              </div>
              {renderBars(priorities, insights.byPriority)}
            </article>
          </section>
        </>
      )}
    </main>
  );
}
