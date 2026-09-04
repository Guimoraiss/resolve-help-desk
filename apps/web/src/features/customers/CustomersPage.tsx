import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { api } from "../../lib/api";
import { useI18n } from "../i18n/I18nProvider";

type Customer = {
  id: string;
  name: string;
  email: string;
  companyName: string | null;
  country: string | null;
};
const customerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  companyName: z.string().optional(),
  country: z.string().optional(),
});
type CustomerForm = z.infer<typeof customerSchema>;

export function CustomersPage({ organizationId }: { organizationId: string }) {
  const { t } = useI18n();
  const client = useQueryClient();
  const customers = useQuery({
    queryKey: ["customers", organizationId],
    queryFn: () => api<{ customers: Customer[] }>("/customers", {}, organizationId),
  });
  const form = useForm<CustomerForm>({
    resolver: zodResolver(customerSchema),
    defaultValues: { name: "", email: "", companyName: "", country: "" },
  });
  const createCustomer = useMutation({
    mutationFn: (input: CustomerForm) =>
      api<{ customer: Customer }>(
        "/customers",
        { method: "POST", body: JSON.stringify(input) },
        organizationId,
      ),
    onSuccess: () => {
      form.reset();
      client.invalidateQueries({ queryKey: ["customers", organizationId] });
    },
  });
  return (
    <main className="customers-page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">{t("customers")}</p>
          <h1>{t("customerDirectory")}</h1>
        </div>
      </div>
      <div className="customer-layout">
        <section className="customer-list">
          <h2>
            {t("customers")} <span>{customers.data?.customers.length ?? 0}</span>
          </h2>
          {customers.isLoading && <p className="table-message">{t("loadingCustomers")}</p>}
          {customers.data?.customers.map((customer) => (
            <article key={customer.id} className="customer-row">
              <div className="customer-avatar">{customer.name.slice(0, 2).toUpperCase()}</div>
              <div>
                <strong>{customer.name}</strong>
                <p>
                  {customer.email}
                  {customer.companyName ? ` · ${customer.companyName}` : ""}
                </p>
              </div>
            </article>
          ))}
        </section>
        <section className="form-card">
          <p className="eyebrow">{t("newCustomer")}</p>
          <h2>{t("addCustomer")}</h2>
          <form onSubmit={form.handleSubmit((input) => createCustomer.mutate(input))}>
            <TextField label={t("name")} error={form.formState.errors.name?.message}>
              <input {...form.register("name")} />
            </TextField>
            <TextField label={t("email")} error={form.formState.errors.email?.message}>
              <input {...form.register("email")} type="email" />
            </TextField>
            <TextField label={t("company")}>
              <input {...form.register("companyName")} />
            </TextField>
            <TextField label={t("country")}>
              <input {...form.register("country")} />
            </TextField>
            {createCustomer.error && <p className="form-error">{createCustomer.error.message}</p>}
            <button className="form-submit" disabled={createCustomer.isPending}>
              {createCustomer.isPending ? t("creating") : t("addCustomer")}
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}

export function TextField({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
      {error && <small>{error}</small>}
    </label>
  );
}
