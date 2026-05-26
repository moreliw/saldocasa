'use client';

import { motion } from 'framer-motion';
import {
  ArrowDownRight,
  ArrowUpRight,
  Hourglass,
  Wallet,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/cn';
import { formatMoney } from '@/lib/format';
import type { DashboardSummary } from '@/lib/types';

interface Props {
  totals: DashboardSummary['totals'];
}

export function SummaryCards({ totals }: Props) {
  const items = [
    {
      label: 'Saldo do mês',
      value: totals.balance,
      icon: Wallet,
      tone: totals.balance >= 0 ? 'positive' : 'negative',
      hint:
        totals.incomePending || totals.expensePending
          ? `Previsto: ${formatMoney(totals.forecastBalance)}`
          : undefined,
    },
    {
      label: 'Entradas',
      value: totals.income,
      icon: ArrowUpRight,
      tone: 'positive' as const,
      hint:
        totals.incomePending > 0
          ? `+ ${formatMoney(totals.incomePending)} pendente`
          : undefined,
    },
    {
      label: 'Saídas',
      value: totals.expense,
      icon: ArrowDownRight,
      tone: 'negative' as const,
      hint:
        totals.expensePending > 0
          ? `+ ${formatMoney(totals.expensePending)} pendente`
          : undefined,
    },
    {
      label: 'Lançamentos',
      value: totals.txCount,
      icon: Hourglass,
      tone: 'neutral' as const,
      raw: true,
    },
  ] as const;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item, i) => (
        <motion.div
          key={item.label}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.32, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
        >
          <SummaryCard {...item} />
        </motion.div>
      ))}
    </div>
  );
}

function SummaryCard({
  label,
  value,
  icon: Icon,
  tone,
  hint,
  raw,
}: {
  label: string;
  value: number;
  icon: LucideIcon;
  tone: 'positive' | 'negative' | 'neutral';
  hint?: string;
  raw?: boolean;
}) {
  const toneClasses = {
    positive: 'text-emerald-600 bg-emerald-50',
    negative: 'text-rose-600 bg-rose-50',
    neutral: 'text-slate-600 bg-slate-100',
  } as const;

  const valueClass = {
    positive: 'text-emerald-700',
    negative: 'text-rose-700',
    neutral: 'text-slate-900',
  } as const;

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <span className="text-sm text-slate-500">{label}</span>
        <span className={cn('flex h-9 w-9 items-center justify-center rounded-xl', toneClasses[tone])}>
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <div className={cn('mt-3 font-display text-2xl font-semibold tabular-nums', valueClass[tone])}>
        {raw ? value : formatMoney(value)}
      </div>
      {hint && <div className="mt-1 text-xs text-slate-500">{hint}</div>}
    </Card>
  );
}
