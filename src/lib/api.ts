// If running in development (Vite dev server), we rely on the proxy and use relative path
const isDev = import.meta.env.DEV;
export const API_BASE = isDev ? '' : (import.meta.env.VITE_API_URL || 'https://qe180141-ass1.onrender.com');

export async function apiFetch(path: string, options?: RequestInit) {
  const url = `${API_BASE}${path}`; // in dev this becomes relative '/api/...'
  const res = await fetch(url, options);
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`${res.status} ${res.statusText} ${text}`);
  }
  const data = await res.json().catch(() => null);
  // If API wraps response with { success, data }
  if (data && typeof data === 'object' && ('success' in data) && data.success) {
    return data.data;
  }
  return data;
}