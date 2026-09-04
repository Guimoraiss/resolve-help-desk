import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { api, clearAccessToken, getAccessToken, setAccessToken } from "../../lib/api";

export type CurrentUser = { id: string; name: string; email: string };
export type Organization = { id: string; name: string; slug: string; role: "OWNER" | "ADMIN" | "AGENT" };
type Session = { user: CurrentUser; organizations: Organization[]; organizationId: string };
type LoginInput = { email: string; password: string };
type RegisterInput = LoginInput & { name: string; organizationName: string; organizationSlug: string };

type AuthContextValue = {
  session: Session | null;
  login(input: LoginInput): Promise<void>;
  register(input: RegisterInput): Promise<void>;
  selectOrganization(organizationId: string): void;
  logout(): void;
};

const SESSION_KEY = "resolve.session";
const AuthContext = createContext<AuthContextValue | null>(null);

function readSession(): Session | null {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY) ?? "null") as Session | null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(() => (getAccessToken() ? readSession() : null));
  const commit = (next: Session) => {
    setSession(next);
    localStorage.setItem(SESSION_KEY, JSON.stringify(next));
  };
  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      async login(input) {
        const response = await api<{ accessToken: string; user: CurrentUser }>("/auth/login", {
          method: "POST",
          body: JSON.stringify(input),
        });
        setAccessToken(response.accessToken);
        const organizationResponse = await api<{ organizations: Organization[] }>("/organizations");
        const organization = organizationResponse.organizations[0];
        if (!organization) throw new Error("Your account is not a member of an organization");
        commit({
          user: response.user,
          organizations: organizationResponse.organizations,
          organizationId: organization.id,
        });
      },
      async register(input) {
        const response = await api<{
          accessToken: string;
          user: CurrentUser;
          organization: Omit<Organization, "role">;
          membership: { role: Organization["role"] };
        }>("/auth/register", { method: "POST", body: JSON.stringify(input) });
        setAccessToken(response.accessToken);
        const organization = { ...response.organization, role: response.membership.role };
        commit({ user: response.user, organizations: [organization], organizationId: organization.id });
      },
      selectOrganization(organizationId) {
        if (!session?.organizations.some((organization) => organization.id === organizationId)) return;
        commit({ ...session, organizationId });
      },
      logout() {
        clearAccessToken();
        localStorage.removeItem(SESSION_KEY);
        setSession(null);
      },
    }),
    [session],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
