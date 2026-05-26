import { cookies } from 'next/headers';

export interface SessionUser {
  id: string;
  email: string;
  name: string;
}

export interface SessionHousehold {
  id: string;
  name: string;
  currency: string;
}

export interface Session {
  user: SessionUser;
  household: SessionHousehold;
}

const INTERNAL_API = process.env.INTERNAL_API_URL ?? 'http://api:3011/api';

/**
 * Server-side: chama /api/auth/me forwarding o cookie da sessão.
 * Retorna null se não autenticado.
 */
export async function getSession(): Promise<Session | null> {
  const jar = await cookies();
  const cookieHeader = jar
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join('; ');
  if (!cookieHeader) return null;

  try {
    const res = await fetch(`${INTERNAL_API}/auth/me`, {
      headers: { cookie: cookieHeader },
      cache: 'no-store',
    });
    if (!res.ok) return null;
    return (await res.json()) as Session;
  } catch {
    return null;
  }
}
