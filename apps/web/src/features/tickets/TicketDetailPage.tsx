import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, CheckCircle2, MessageSquare, StickyNote, UserRound } from "lucide-react";
import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../../lib/api";
import { useI18n } from "../i18n/I18nProvider";

type Ticket = {
  id: string;
  title: string;
  description: string;
  status: "OPEN" | "IN_PROGRESS" | "WAITING_CUSTOMER" | "RESOLVED" | "CLOSED";
  priority: "LOW" | "NORMAL" | "HIGH" | "URGENT";
  assignedAgentId: string | null;
  createdAt: string;
};
type Message = { id: string; type: "PUBLIC_REPLY" | "INTERNAL_NOTE"; content: string; createdAt: string };
type Activity = { id: string; eventType: string; metadata: Record<string, string | null>; createdAt: string };

export function TicketDetailPage({ organizationId }: { organizationId: string }) {
  const { t, locale } = useI18n();
  const { ticketId } = useParams();
  const client = useQueryClient();
  const [messageType, setMessageType] = useState<Message["type"]>("PUBLIC_REPLY");
  const [content, setContent] = useState("");
  const ticket = useQuery({
    queryKey: ["ticket", organizationId, ticketId],
    enabled: Boolean(ticketId),
    queryFn: () => api<{ ticket: Ticket }>(`/tickets/${ticketId}`, {}, organizationId),
  });
  const messages = useQuery({
    queryKey: ["ticket-messages", organizationId, ticketId],
    enabled: Boolean(ticketId),
    queryFn: () => api<{ messages: Message[] }>(`/tickets/${ticketId}/messages`, {}, organizationId),
  });
  const activity = useQuery({
    queryKey: ["ticket-activity", organizationId, ticketId],
    enabled: Boolean(ticketId),
    queryFn: () => api<{ activity: Activity[] }>(`/tickets/${ticketId}/activity`, {}, organizationId),
  });
  const refresh = () => {
    client.invalidateQueries({ queryKey: ["ticket", organizationId, ticketId] });
    client.invalidateQueries({ queryKey: ["tickets", organizationId] });
    client.invalidateQueries({ queryKey: ["ticket-messages", organizationId, ticketId] });
    client.invalidateQueries({ queryKey: ["ticket-activity", organizationId, ticketId] });
  };
  const statusMutation = useMutation({
    mutationFn: (status: Ticket["status"]) =>
      api(
        `/tickets/${ticketId}/status`,
        { method: "PATCH", body: JSON.stringify({ status }) },
        organizationId,
      ),
    onSuccess: refresh,
  });
  const priorityMutation = useMutation({
    mutationFn: (priority: Ticket["priority"]) =>
      api(
        `/tickets/${ticketId}/priority`,
        { method: "PATCH", body: JSON.stringify({ priority }) },
        organizationId,
      ),
    onSuccess: refresh,
  });
  const claimMutation = useMutation({
    mutationFn: () => api(`/tickets/${ticketId}/assignee/claim`, { method: "POST" }, organizationId),
    onSuccess: refresh,
  });
  const messageMutation = useMutation({
    mutationFn: () =>
      api(
        `/tickets/${ticketId}/messages`,
        { method: "POST", body: JSON.stringify({ type: messageType, content }) },
        organizationId,
      ),
    onSuccess: () => {
      setContent("");
      refresh();
    },
  });
  if (ticket.isLoading) return <main className="ticket-detail loading">{t("loadingTicket")}</main>;
  if (ticket.error || !ticket.data)
    return <main className="ticket-detail loading">{ticket.error?.message ?? t("ticketNotFound")}</main>;
  const currentTicket = ticket.data.ticket;
  return (
    <main className="ticket-detail">
      <div className="ticket-detail-header">
        <div>
          <Link className="back-link" to="/inbox">
            <ArrowLeft size={15} />
            {t("inbox")}
          </Link>
          <p className="eyebrow">
            {t("ticket")} · {currentTicket.id.slice(0, 8)}
          </p>
          <h1>{currentTicket.title}</h1>
        </div>
        <button
          className="claim-button"
          onClick={() => claimMutation.mutate()}
          disabled={claimMutation.isPending || Boolean(currentTicket.assignedAgentId)}
        >
          <UserRound size={15} />
          {currentTicket.assignedAgentId ? t("assigned") : t("assignToMe")}
        </button>
      </div>
      <div className="ticket-detail-grid">
        <section className="conversation">
          <div className="original-message">
            <p className="eyebrow">{t("customerRequest")}</p>
            <p>{currentTicket.description}</p>
          </div>
          {messages.data?.messages.map((message) => (
            <article
              className={`message ${message.type === "INTERNAL_NOTE" ? "internal" : "public"}`}
              key={message.id}
            >
              <div className="message-icon">
                {message.type === "INTERNAL_NOTE" ? <StickyNote size={14} /> : <MessageSquare size={14} />}
              </div>
              <div>
                <strong>{message.type === "INTERNAL_NOTE" ? t("internalNote") : t("replyToCustomer")}</strong>
                <time>{formatTime(message.createdAt, locale)}</time>
                <p>{message.content}</p>
              </div>
            </article>
          ))}
          <form
            className="composer"
            onSubmit={(event) => {
              event.preventDefault();
              if (content.trim()) messageMutation.mutate();
            }}
          >
            <div className="composer-tabs">
              <button
                type="button"
                className={messageType === "PUBLIC_REPLY" ? "active" : ""}
                onClick={() => setMessageType("PUBLIC_REPLY")}
              >
                {t("reply")}
              </button>
              <button
                type="button"
                className={messageType === "INTERNAL_NOTE" ? "active note" : ""}
                onClick={() => setMessageType("INTERNAL_NOTE")}
              >
                {t("internalNote")}
              </button>
            </div>
            <textarea
              value={content}
              onChange={(event) => setContent(event.target.value)}
              placeholder={messageType === "PUBLIC_REPLY" ? t("writeReply") : t("writeNote")}
              rows={4}
            />
            <button className="form-submit" disabled={!content.trim() || messageMutation.isPending}>
              {messageMutation.isPending
                ? t("sending")
                : messageType === "PUBLIC_REPLY"
                  ? t("sendReply")
                  : t("addNote")}
            </button>
            {messageMutation.error && <p className="form-error">{messageMutation.error.message}</p>}
          </form>
        </section>
        <aside className="ticket-sidebar">
          <section>
            <p className="eyebrow">{t("status")}</p>
            <select
              value={currentTicket.status}
              onChange={(event) => statusMutation.mutate(event.target.value as Ticket["status"])}
            >
              <option value="OPEN">{t("open")}</option>
              <option value="IN_PROGRESS">{t("inProgress")}</option>
              <option value="WAITING_CUSTOMER">{t("waitingCustomer")}</option>
              <option value="RESOLVED">{t("resolved")}</option>
              <option value="CLOSED">{t("closed")}</option>
            </select>
            {statusMutation.error && <p className="form-error">{statusMutation.error.message}</p>}
          </section>
          <section>
            <p className="eyebrow">{t("priority")}</p>
            <select
              value={currentTicket.priority}
              onChange={(event) => priorityMutation.mutate(event.target.value as Ticket["priority"])}
            >
              <option value="LOW">{t("low")}</option>
              <option value="NORMAL">{t("normal")}</option>
              <option value="HIGH">{t("high")}</option>
              <option value="URGENT">{t("urgent")}</option>
            </select>
            {priorityMutation.error && <p className="form-error">{priorityMutation.error.message}</p>}
          </section>
          <section className="activity">
            <p className="eyebrow">{t("activity")}</p>
            {activity.data?.activity.map((event) => (
              <div className="activity-item" key={event.id}>
                <CheckCircle2 size={13} />
                <div>
                  <strong>{event.eventType.replaceAll("_", " ")}</strong>
                  <time>{formatTime(event.createdAt, locale)}</time>
                </div>
              </div>
            ))}
          </section>
        </aside>
      </div>
    </main>
  );
}

function formatTime(date: string, locale: string) {
  return new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" }).format(new Date(date));
}
