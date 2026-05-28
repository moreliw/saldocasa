import { serverFetch } from '@/lib/server-api';

export type Tier = 'FREE' | 'PRO' | 'PRO_PLUS';
export type Status = 'ACTIVE' | 'PAST_DUE' | 'CANCELED' | 'INCOMPLETE' | 'TRIALING';

export interface Overview {
  totals: {
    users: number;
    households: number;
    payingHouseholds: number;
    compHouseholds: number;
    transactions: number;
  };
  thisMonth: {
    newUsers: number;
    newHouseholds: number;
    transactions: number;
  };
  revenue: {
    mrrCents: number;
    arrCents: number;
  };
  planDistribution: Record<Tier, number>;
  signupsByMonth: Array<{ label: string; count: number }>;
}

export interface AdminHousehold {
  id: string;
  name: string;
  createdAt: string;
  tier: Tier;
  status: Status | null;
  currentPeriodEnd: string | null;
  isPaying: boolean;
  isComp: boolean;
  owner: { id: string; name: string; email: string; createdAt: string };
  memberCount: number;
  transactionCount: number;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  isActive: boolean;
  isSuperAdmin: boolean;
  createdAt: string;
  householdCount: number;
}

export interface Paginated<T> {
  page: number;
  limit: number;
  total: number;
  items: T[];
}

export function fetchOverview() {
  return serverFetch<Overview>('/admin/overview');
}

export function fetchHouseholds(params: { q?: string; tier?: Tier; page?: number }) {
  const qs = new URLSearchParams();
  if (params.q) qs.set('q', params.q);
  if (params.tier) qs.set('tier', params.tier);
  if (params.page) qs.set('page', String(params.page));
  const suffix = qs.toString();
  return serverFetch<Paginated<AdminHousehold>>(
    suffix ? `/admin/households?${suffix}` : '/admin/households',
  );
}

export function fetchAdminUsers(params: { q?: string; page?: number }) {
  const qs = new URLSearchParams();
  if (params.q) qs.set('q', params.q);
  if (params.page) qs.set('page', String(params.page));
  const suffix = qs.toString();
  return serverFetch<Paginated<AdminUser>>(suffix ? `/admin/users?${suffix}` : '/admin/users');
}
