import { cookies } from 'next/headers';
import type { CashFlowPoint, DashboardSummary } from './types';

const INTERNAL_API = process.env.INTERNAL_API_URL ?? 'http://api:3011/api';

async function serverFetch<T>(path: string): Promise<T | null> {
  const jar = await cookies();
  const cookieHeader = jar.getAll().map((c) => `${c.name}=${c.value}`).join('; ');
  if (!cookieHeader) return null;
  try {
    const res = await fetch(`${INTERNAL_API}${path}`, {
      headers: { cookie: cookieHeader },
      cache: 'no-store',
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export function fetchDashboardSummary(year?: number, month?: number) {
  const qs = new URLSearchParams();
  if (year) qs.set('year', String(year));
  if (month) qs.set('month', String(month));
  const path = qs.size ? `/dashboard/summary?${qs.toString()}` : '/dashboard/summary';
  return serverFetch<DashboardSummary>(path);
}

export function fetchMonthlyEvolution(months = 6) {
  return serverFetch<CashFlowPoint[]>(`/reports/monthly-comparison?months=${months}`);
}
