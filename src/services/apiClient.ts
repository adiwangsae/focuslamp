/**
 * FastAPI integration boundary.
 * When VITE_API_BASE_URL is configured, requests target the external FastAPI backend.
 */

export interface ApiClientConfig {
  baseUrl: string | null;
  mode: 'local' | 'fastapi';
}

export function getApiConfig(): ApiClientConfig {
  const configured =
    typeof import.meta !== 'undefined' &&
    import.meta.env &&
    typeof import.meta.env.VITE_API_BASE_URL === 'string' &&
    import.meta.env.VITE_API_BASE_URL.trim().length > 0
      ? import.meta.env.VITE_API_BASE_URL.trim()
      : null;

  return {
    baseUrl: configured,
    mode: configured ? 'fastapi' : 'local',
  };
}

export async function apiRequest<T>(
  path: string,
  options?: RequestInit
): Promise<{ ok: boolean; data?: T; error?: string }> {
  const { baseUrl, mode } = getApiConfig();
  if (mode === 'local' || !baseUrl) {
    return {
      ok: false,
      error: `Remote FastAPI base URL not configured; skipping request to ${path}.`,
    };
  }

  try {
    const response = await fetch(`${baseUrl}${path}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(options?.headers ?? {}),
      },
      ...options,
    });
    if (!response.ok) {
      return { ok: false, error: `HTTP ${response.status}` };
    }
    const data = (await response.json()) as T;
    return { ok: true, data };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Network error' };
  }
}
