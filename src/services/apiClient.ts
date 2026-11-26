/**
 * Future FastAPI integration boundary.
 * In this prototype, VITE_API_BASE_URL is optional; when absent or disabled,
 * service modules cleanly execute against the simulated client-side provider.
 */

export interface ApiClientConfig {
  baseUrl: string | null;
  mode: 'simulated' | 'fastapi';
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
    mode: 'simulated',
  };
}

export async function apiRequest<T>(
  path: string,
  options?: RequestInit
): Promise<{ ok: boolean; data?: T; error?: string }> {
  const { baseUrl, mode } = getApiConfig();
  if (mode === 'simulated' || !baseUrl) {
    return {
      ok: false,
      error: `Simulated mode active; skipping remote request to ${path}.`,
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
