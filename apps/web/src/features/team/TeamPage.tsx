import { useQuery } from "@tanstack/react-query";
import { ShieldCheck, UsersRound } from "lucide-react";
import { api } from "../../lib/api";
import { useI18n } from "../i18n/I18nProvider";

type Member = {
  id: string;
  name: string;
  email: string;
  role: "OWNER" | "ADMIN" | "AGENT";
  joinedAt: string;
};
export function TeamPage({ organizationId }: { organizationId: string }) {
  const { t } = useI18n();
  const { data, isLoading, error } = useQuery({
    queryKey: ["team", organizationId],
    queryFn: () => api<{ members: Member[] }>("/team", {}, organizationId),
  });
  const members = data?.members ?? [];
  return (
    <main className="insights-page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">Resolve / {t("team")}</p>
          <h1>{t("team")}</h1>
          <p className="page-subtitle">{t("teamDescription")}</p>
        </div>
        <UsersRound className="page-icon" size={24} />
      </div>
      {isLoading && <p className="table-message">{t("loadingTeam")}</p>}
      {error && <p className="table-message error">{error.message}</p>}
      {!isLoading && !error && (
        <section className="data-panel team-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">{t("members")}</p>
              <h2>
                {members.length} {t("members")}
              </h2>
            </div>
          </div>
          {members.map((member) => (
            <article className="team-member" key={member.id}>
              <span className="large-avatar">{member.name.slice(0, 2).toUpperCase()}</span>
              <div>
                <strong>{member.name}</strong>
                <p>{member.email}</p>
              </div>
              <span className="role-pill">
                <ShieldCheck size={13} />
                {t(member.role.toLowerCase())}
              </span>
            </article>
          ))}
        </section>
      )}
    </main>
  );
}
