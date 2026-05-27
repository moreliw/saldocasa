'use client';

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { formatMoney, monthLabel } from '@/lib/format';
import type { CashFlowPoint } from '@/lib/types';

interface Props {
  data: CashFlowPoint[];
}

export function EvolutionLine({ data }: Props) {
  return (
    <div className="px-2 pb-4 pt-2">
      <div className="h-56 w-full">
        <ResponsiveContainer>
          <LineChart data={data} margin={{ left: 8, right: 20, top: 10, bottom: 0 }}>
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
              width={56}
            />
            <Tooltip
              formatter={(v: number, name) => [formatMoney(v), nameLabel(name as string)]}
              labelFormatter={fullMonth}
              contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }}
            />
            <Line type="monotone" dataKey="income" stroke="#10b981" strokeWidth={2.5} dot={{ r: 3 }} />
            <Line type="monotone" dataKey="expense" stroke="#f43f5e" strokeWidth={2.5} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
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
