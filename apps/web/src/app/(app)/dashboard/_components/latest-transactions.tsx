'use client';

import { ArrowDownCircle, ArrowUpCircle } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/cn';
import { formatDate, formatMoney } from '@/lib/format';
import type { DashboardSummary } from '@/lib/types';

const STATUS_TONE = {
  PAID: 'positive',
  PENDING: 'warning',
  CANCELLED: 'muted',
} as const;
const STATUS_LABEL = {
  PAID: 'Pago',
  PENDING: 'Pendente',
  CANCELLED: 'Cancelado',
} as const;

export function LatestTransactions({
  items,
}: {
  items: DashboardSummary['latestTransactions'];
}) {
  if (items.length === 0) {
    return (
      <div className="px-6 py-8 text-center text-sm text-slate-500">
        Nenhum lançamento neste mês ainda.
      </div>
    );
  }

  return (
    <ul className="divide-y divide-slate-100">
      {items.map((t) => (
        <li key={t.id} className="flex items-center gap-3 px-6 py-3.5">
          <span
            className={cn(
              'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl',
              t.type === 'INCOME' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600',
            )}
          >
            {t.type === 'INCOME' ? (
              <ArrowUpCircle className="h-4 w-4" />
            ) : (
              <ArrowDownCircle className="h-4 w-4" />
            )}
          </span>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-medium text-slate-900">{t.description}</div>
            <div className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-500">
              <span className="inline-flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: t.category.color }} />
                {t.category.name}
              </span>
              <span>·</span>
              <span>{formatDate(t.transactionDate)}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge tone={STATUS_TONE[t.status]}>{STATUS_LABEL[t.status]}</Badge>
            <span
              className={cn(
                'shrink-0 text-sm font-medium tabular-nums',
                t.type === 'INCOME' ? 'text-emerald-600' : 'text-rose-600',
              )}
            >
              {t.type === 'INCOME' ? '+' : '-'} {formatMoney(t.amount)}
            </span>
          </div>
        </li>
      ))}
      <li className="px-6 py-3">
        <Link
          href="/transactions"
          className="text-sm font-medium text-brand-700 hover:text-brand-900"
        >
          Ver todos →
        </Link>
      </li>
    </ul>
  );
}
