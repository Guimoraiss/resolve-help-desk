import { useQuery } from "@tanstack/react-query";
import { api } from "../../lib/api";
import { Link } from "react-router-dom";
import { useI18n } from "../i18n/I18nProvider";

type Ticket = {
  id: string;
  title: string;
  description: string;
  priority: "LOW" | "NORMAL" | "HIGH" | "URGENT";
  status: string;
  updatedAt: string;
};
type TicketItem = { ticket: Ticket; customerName: string };

export function InboxPage({ organizationId }: { organizationId: string }) {
  const { t } = useI18n();
  const { data, isLoading, error } = useQuery({
    queryKey: ["tickets", organizationId],
    queryFn: () => api<{ tickets: { items: TicketItem[] } }>("/tickets", {}, organizationId),
  });
  const tickets = data?.tickets.items ?? [];
  return (
    <main className="inbox">
      <div className="page-heading">
        <div>
          <p className="eyebrow">{t("inbox")}</p>
          <h1>
            {t("allTickets")} <span>{tickets.length}</span>
          </h1>
        </div>
        <button className="filter">{t("filters")}</button>
      </div>
      <div className="filters">
        <button className="active">{t("all")}</button>
        <button>{t("open")}</button>
        <button>{t("inProgress")}</button>
        <button>{t("waiting")}</button>
        <button>{t("resolved")}</button>
      </div>
      <div className="ticket-table">
        <div className="table-header">
          <span>{t("ticket")}</span>
          <span>{t("priority")}</span>
          <span>Atualizado</span>
        </div>
        {isLoading && <p className="table-message">{t("loadingTickets")}</p>}
        {error && <p className="table-message error">{error.message}</p>}
        {!isLoading && !error && tickets.length === 0 && <p className="table-message">{t("noTickets")}</p>}
        {tickets.map(({ ticket, customerName }) => (
          <Link className="ticket" to={`/inbox/${ticket.id}`} key={ticket.id}>
            <div className="ticket-main">
              <span className="ticket-id">{ticket.id.slice(0, 8)}</span>
              <div>
                <strong>{ticket.title}</strong>
                <p>
                  <b>{customerName}</b> · {ticket.description}
                </p>
              </div>
            </div>
            <span className={`priority ${ticket.priority.toLowerCase()}`}>{ticket.priority}</span>
            <time>{relativeTime(ticket.updatedAt)}</time>
          </Link>
        ))}
      </div>
    </main>
  );
}

function relativeTime(date: string) {
  const minutes = Math.max(1, Math.floor((Date.now() - new Date(date).getTime()) / 60_000));
  return minutes < 60 ? `${minutes}m` : `${Math.floor(minutes / 60)}h`;
}
