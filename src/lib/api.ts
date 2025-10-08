// If running in development (Vite dev server), we rely on the proxy and use relative path
const isDev = import.meta.env.DEV;
export const API_BASE = isDev
  ? ""
  : import.meta.env.VITE_API_URL || "https://qe180141-ass1.onrender.com";

let authToken: string | null = null;

export function setAuthToken(token: string | null) {
  authToken = token;
}

type ApiOptions = RequestInit & { json?: unknown };

export async function apiFetch(path: string, options: ApiOptions = {}) {
  const url = `${API_BASE}${path}`; // in dev this becomes relative '/api/...'
  const { json, headers: initHeaders, ...rest } = options;

  const headers = new Headers(initHeaders);
  if (json !== undefined) {
    headers.set("Content-Type", "application/json");
  }
  if (!headers.has("Accept")) {
    headers.set("Accept", "application/json");
  }
  if (authToken) {
    headers.set("Authorization", `Bearer ${authToken}`);
  }

  const response = await fetch(url, {
    ...rest,
    headers,
    body: json !== undefined ? JSON.stringify(json) : rest.body,
  });

  if (!response.ok) {
    let message = `${response.status} ${response.statusText}`;
    const text = await response.text().catch(() => "");
    if (text) {
      try {
        const parsed = JSON.parse(text);
        if (parsed && typeof parsed === "object") {
          const candidate =
            (parsed as Record<string, unknown>).message ??
            (parsed as Record<string, unknown>).error;
          if (typeof candidate === "string" && candidate.trim().length > 0) {
            message = candidate;
          } else {
            message = text;
          }
        } else {
          message = text;
        }
      } catch {
        message = text;
      }
    }
    throw new Error(message);
  }

  if (response.status === 204) {
    return null;
  }

  const data = await response.json().catch(() => null);
  // If API wraps response with { success, data }
  if (data && typeof data === "object" && "success" in data) {
    const payload = data as { success: boolean; data?: unknown };
    if (payload.success) {
      return payload.data ?? null;
    }
  }
  return data;
}
