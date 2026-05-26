'use client';

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { formatMoney } from '@/lib/format';
import type { DashboardSummary } from '@/lib/types';

interface Props {
  data: DashboardSummary['byCategory'];
  total: number;
}

export function CategoryDonut({ data, total }: Props) {
  if (data.length === 0) {
    return (
      <div className="px-6 pb-6 pt-2 text-center text-sm text-slate-500">
        Sem saídas pagas no mês.
      </div>
    );
  }

  return (
    <div className="grid gap-4 px-6 pb-6 pt-2 sm:grid-cols-[1fr_auto]">
      <div className="relative h-52 w-full">
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={data}
              dataKey="amount"
              innerRadius={55}
              outerRadius={85}
              paddingAngle={2}
              stroke="white"
              strokeWidth={2}
            >
              {data.map((d) => (
                <Cell key={d.categoryId} fill={d.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number) => [formatMoney(value), '']}
              labelFormatter={() => ''}
              contentStyle={{
                borderRadius: 12,
                border: '1px solid rgb(226 232 240)',
                fontSize: 12,
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-xs text-slate-500">Total</div>
          <div className="font-display text-lg font-semibold text-slate-900">
            {formatMoney(total)}
          </div>
        </div>
      </div>
      <ul className="space-y-2 self-center text-sm sm:min-w-[180px]">
        {data.slice(0, 6).map((d) => {
          const pct = total > 0 ? (d.amount / total) * 100 : 0;
          return (
            <li key={d.categoryId} className="flex items-center gap-2">
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: d.color }}
              />
              <span className="min-w-0 flex-1 truncate text-slate-700">{d.name}</span>
              <span className="text-xs text-slate-500 tabular-nums">{pct.toFixed(0)}%</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
