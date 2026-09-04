const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3333/api";
const TOKEN_KEY = "resolve.access-token";

export type ApiError = Error & { code?: string };

export function getAccessToken() {
  return localStorage.getItem(TOKEN_KEY);
}
export function setAccessToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}
export function clearAccessToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export async function api<T>(path: string, options: RequestInit = {}, organizationId?: string): Promise<T> {
  const token = getAccessToken();
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);
  if (organizationId) headers.set("x-organization-id", organizationId);
  const response = await fetch(`${API_URL}${path}`, { ...options, headers });
  if (!response.ok) {
    const rawBody = await response.text();
    const payload = rawBody
      ? (JSON.parse(rawBody) as { error?: { code?: string; message?: string }; message?: string })
      : undefined;
    const message = payload?.error?.message ?? payload?.message ?? rawBody;
    const error = new Error(message || `Request failed (${response.status})`) as ApiError;
    error.code = payload?.error?.code;
    throw error;
  }
  return response.json() as Promise<T>;
}
