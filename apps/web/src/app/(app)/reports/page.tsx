'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { PageHeader } from '@/components/ui/page-header';
import { Skeleton } from '@/components/ui/skeleton';
import { ApiError, apiJson } from '@/lib/api';
import { formatMoney, monthLabel } from '@/lib/format';
import type {
  CashFlowPoint,
  CategoryReportItem,
  PaymentMethodReportItem,
} from '@/lib/types';
import { PieChart as PieIcon } from 'lucide-react';

export default function ReportsPage() {
  const [monthly, setMonthly] = useState<CashFlowPoint[] | null>(null);
  const [byCategory, setByCategory] = useState<CategoryReportItem[] | null>(null);
  const [byPaymentMethod, setByPaymentMethod] = useState<PaymentMethodReportItem[] | null>(null);

  useEffect(() => {
    Promise.all([
      apiJson<CashFlowPoint[]>('/reports/monthly-comparison?months=6'),
      apiJson<CategoryReportItem[]>('/reports/by-category?type=EXPENSE'),
      apiJson<PaymentMethodReportItem[]>('/reports/by-payment-method'),
    ])
      .then(([m, c, p]) => {
        setMonthly(m);
        setByCategory(c);
        setByPaymentMethod(p);
      })
      .catch((err) => toast.error(err instanceof ApiError ? err.message : 'Erro'));
  }, []);

  const hasMonthly = (monthly?.some((m) => m.income > 0 || m.expense > 0)) ?? false;
  const hasCategory = (byCategory?.length ?? 0) > 0;
  const hasPayment = (byPaymentMethod?.length ?? 0) > 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Relatórios"
        description="Visão analítica dos seus últimos meses."
      />

      {/* Linha + barras */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Evolução mensal</CardTitle>
            <CardDescription>Entradas, saídas e saldo nos últimos 6 meses.</CardDescription>
          </CardHeader>
          <div className="px-2 pb-4 pt-2">
            {monthly === null ? (
              <Skeleton className="mx-4 h-64" />
            ) : !hasMonthly ? (
              <div className="px-6 py-8 text-center text-sm text-slate-500">
                Sem dados pagos nos últimos meses.
              </div>
            ) : (
              <div className="h-64 w-full">
                <ResponsiveContainer>
                  <LineChart data={monthly} margin={{ left: 8, right: 20, top: 10, bottom: 0 }}>
                    <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" vertical={false} />
                    <XAxis
                      dataKey="ym"
                      tickFormatter={shortMonth}
                      tick={{ fontSize: 11, fill: '#64748b' }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      tickFormatter={shortMoney}
                      tick={{ fontSize: 11, fill: '#64748b' }}
                      tickLine={false}
                      axisLine={false}
                      width={60}
                    />
                    <Tooltip
                      formatter={(v: number, name) => [formatMoney(v), nameLabel(name as string)]}
                      labelFormatter={fullMonth}
                      contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }}
                    />
                    <Legend
                      wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
                      formatter={(v) => nameLabel(v as string)}
                    />
                    <Line
                      type="monotone"
                      dataKey="income"
                      stroke="#10b981"
                      strokeWidth={2.5}
                      dot={{ r: 3 }}
                      activeDot={{ r: 5 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="expense"
                      stroke="#f43f5e"
                      strokeWidth={2.5}
                      dot={{ r: 3 }}
                      activeDot={{ r: 5 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="balance"
                      stroke="#0f1a2e"
                      strokeWidth={2}
                      strokeDasharray="4 4"
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Entradas vs. Saídas</CardTitle>
            <CardDescription>Comparativo mês a mês.</CardDescription>
          </CardHeader>
          <div className="px-2 pb-4 pt-2">
            {monthly === null ? (
              <Skeleton className="mx-4 h-64" />
            ) : !hasMonthly ? (
              <div className="px-6 py-8 text-center text-sm text-slate-500">Sem dados.</div>
            ) : (
              <div className="h-64 w-full">
                <ResponsiveContainer>
                  <BarChart data={monthly} margin={{ left: 8, right: 20, top: 10, bottom: 0 }}>
                    <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" vertical={false} />
                    <XAxis
                      dataKey="ym"
                      tickFormatter={shortMonth}
                      tick={{ fontSize: 11, fill: '#64748b' }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      tickFormatter={shortMoney}
                      tick={{ fontSize: 11, fill: '#64748b' }}
                      tickLine={false}
                      axisLine={false}
                      width={60}
                    />
                    <Tooltip
                      formatter={(v: number, name) => [formatMoney(v), nameLabel(name as string)]}
                      labelFormatter={fullMonth}
                      contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }}
                      cursor={{ fill: 'rgba(15,23,42,0.04)' }}
                    />
                    <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} formatter={(v) => nameLabel(v as string)} />
                    <Bar dataKey="income" fill="#10b981" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="expense" fill="#f43f5e" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Por categoria + por forma de pagamento */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Gastos por categoria</CardTitle>
            <CardDescription>Saídas pagas nos últimos 6 meses.</CardDescription>
          </CardHeader>
          {byCategory === null ? (
            <Skeleton className="mx-6 mb-6 h-64" />
          ) : !hasCategory ? (
            <EmptyState icon={PieIcon} title="Nada a mostrar" description="Sem saídas pagas no período." />
          ) : (
            <div className="grid gap-4 px-6 pb-6 sm:grid-cols-[1fr_auto]">
              <div className="h-56 w-full">
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={byCategory}
                      dataKey="amount"
                      nameKey="name"
                      innerRadius={50}
                      outerRadius={90}
                      paddingAngle={2}
                      stroke="white"
                      strokeWidth={2}
                    >
                      {byCategory.map((d) => (
                        <Cell key={d.categoryId} fill={d.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(v: number) => [formatMoney(v), '']}
                      contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <ul className="space-y-2 self-center text-sm sm:min-w-[180px]">
                {byCategory.slice(0, 8).map((c) => (
                  <li key={c.categoryId} className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: c.color }} />
                    <span className="min-w-0 flex-1 truncate text-slate-700">{c.name}</span>
                    <span className="text-xs tabular-nums text-slate-500">{formatMoney(c.amount)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Por forma de pagamento</CardTitle>
            <CardDescription>Saídas pagas agrupadas por meio.</CardDescription>
          </CardHeader>
          {byPaymentMethod === null ? (
            <Skeleton className="mx-6 mb-6 h-64" />
          ) : !hasPayment ? (
            <EmptyState icon={PieIcon} title="Nada a mostrar" description="Sem dados de formas de pagamento." />
          ) : (
            <div className="px-6 pb-6">
              <table className="w-full text-sm">
                <thead className="text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="pb-2 text-left font-medium">Forma</th>
                    <th className="pb-2 text-right font-medium">Lançamentos</th>
                    <th className="pb-2 text-right font-medium">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {byPaymentMethod.map((p) => (
                    <tr key={p.paymentMethodId ?? 'none'}>
                      <td className="py-2.5 text-slate-800">{p.name}</td>
                      <td className="py-2.5 text-right tabular-nums text-slate-500">{p.count}</td>
                      <td className="py-2.5 text-right font-medium tabular-nums text-slate-900">
                        {formatMoney(p.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

function shortMonth(ym: string) {
  const [y, m] = ym.split('-').map(Number);
  if (!y || !m) return ym;
  return new Date(y, m - 1, 1).toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '');
}

function fullMonth(ym: string) {
  const [y, m] = ym.split('-').map(Number);
  if (!y || !m) return ym;
  return monthLabel(y, m);
}

function shortMoney(v: number) {
  if (Math.abs(v) >= 1000) return `${(v / 1000).toFixed(1)}k`;
  return String(v);
}

function nameLabel(name: string) {
  if (name === 'income') return 'Entradas';
  if (name === 'expense') return 'Saídas';
  if (name === 'balance') return 'Saldo';
  return name;
}
