/**
 * Client-side fetch: usa caminho relativo. Nginx proxy /api/ → api:3011.
 * Cookies HttpOnly viajam automaticamente.
 */
export async function apiFetch(path: string, init: RequestInit = {}): Promise<Response> {
  return fetch(`/api${path}`, {
    ...init,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(init.headers ?? {}),
    },
  });
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message);
  }
}

export async function apiJson<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await apiFetch(path, init);
  if (!res.ok) {
    let body: unknown = null;
    try {
      body = await res.json();
    } catch {
      /* ignore */
    }
    const msg =
      (body as { message?: string | string[] })?.message instanceof Array
        ? ((body as { message: string[] }).message[0] ?? 'Erro inesperado')
        : ((body as { message?: string })?.message ?? `Erro ${res.status}`);
    throw new ApiError(res.status, msg, body);
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}
