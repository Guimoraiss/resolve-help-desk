import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { useForm } from "react-hook-form";
import { useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import { api } from "../../lib/api";
import { TextField } from "../customers/CustomersPage";
import { useI18n } from "../i18n/I18nProvider";

type Customer = { id: string; name: string };
type TicketForm = {
  customerId: string;
  title: string;
  description: string;
  priority: "LOW" | "NORMAL" | "HIGH" | "URGENT";
};

export function NewTicketPage({ organizationId }: { organizationId: string }) {
  const { t } = useI18n();
  const navigate = useNavigate();
  const resolver = useMemo(
    () =>
      zodResolver(
        z.object({
          customerId: z.string().min(1, t("selectCustomerError")),
          title: z.string().trim().min(3, t("ticketSubjectMin")),
          description: z.string().trim().min(1, t("ticketDescriptionRequired")),
          priority: z.enum(["LOW", "NORMAL", "HIGH", "URGENT"]),
        }),
      ),
    [t],
  );
  const customers = useQuery({
    queryKey: ["customers", organizationId],
    queryFn: () => api<{ customers: Customer[] }>("/customers", {}, organizationId),
  });
  const form = useForm<TicketForm>({
    resolver,
    defaultValues: { customerId: "", title: "", description: "", priority: "NORMAL" },
  });
  const createTicket = useMutation({
    mutationFn: (input: TicketForm) =>
      api<{ ticket: { id: string } }>(
        "/tickets",
        { method: "POST", body: JSON.stringify(input) },
        organizationId,
      ),
    onSuccess: ({ ticket }) => navigate(`/inbox/${ticket.id}`),
  });
  return (
    <main className="ticket-form-page">
      <Link to="/inbox" className="back-link">
        <ArrowLeft size={15} />
        {t("backToInbox")}
      </Link>
      <div className="form-card ticket-form">
        <p className="eyebrow">{t("newTicket")}</p>
        <h1>{t("createTicket")}</h1>
        <form onSubmit={form.handleSubmit((input) => createTicket.mutate(input))}>
          <TextField label={t("customer")} error={form.formState.errors.customerId?.message}>
            <select {...form.register("customerId")}>
              <option value="">{t("chooseCustomer")}</option>
              {customers.data?.customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.name}
                </option>
              ))}
            </select>
          </TextField>
          {customers.data?.customers.length === 0 && <p className="hint">{t("createCustomerFirst")}</p>}
          <TextField label={t("subject")} error={form.formState.errors.title?.message}>
            <input {...form.register("title")} />
          </TextField>
          <TextField label={t("description")} error={form.formState.errors.description?.message}>
            <textarea {...form.register("description")} rows={6} />
          </TextField>
          <TextField label={t("priority")}>
            <select {...form.register("priority")}>
              <option value="LOW">{t("low")}</option>
              <option value="NORMAL">{t("normal")}</option>
              <option value="HIGH">{t("high")}</option>
              <option value="URGENT">{t("urgent")}</option>
            </select>
          </TextField>
          {createTicket.error && <p className="form-error">{createTicket.error.message}</p>}
          <button className="form-submit" disabled={createTicket.isPending}>
            {createTicket.isPending ? t("creating") : t("createTicket")}
          </button>
        </form>
      </div>
    </main>
  );
}
