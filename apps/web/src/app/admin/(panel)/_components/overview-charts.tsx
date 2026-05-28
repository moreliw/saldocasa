'use client';

import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

const PLAN_COLORS: Record<string, string> = {
  FREE: '#94a3b8',
  PRO: '#38bdf8',
  PRO_PLUS: '#10b981',
};
const PLAN_LABELS: Record<string, string> = {
  FREE: 'Free',
  PRO: 'Pro',
  PRO_PLUS: 'Pro+',
};

export function SignupsBar({ data }: { data: Array<{ label: string; count: number }> }) {
  return (
    <div className="h-56">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
          <XAxis
            dataKey="label"
            tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
          />
          <Tooltip
            cursor={{ fill: 'rgba(255,255,255,0.05)' }}
            contentStyle={{
              background: '#0f1a2e',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 12,
              color: '#fff',
              fontSize: 12,
            }}
            labelStyle={{ color: 'rgba(255,255,255,0.5)' }}
            formatter={(v: number) => [`${v} novos`, 'Cadastros']}
          />
          <Bar dataKey="count" fill="#10b981" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function PlanDonut({ data }: { data: Record<string, number> }) {
  const rows = Object.entries(data)
    .filter(([, v]) => v > 0)
    .map(([k, v]) => ({ name: PLAN_LABELS[k] ?? k, key: k, value: v }));

  const total = rows.reduce((s, r) => s + r.value, 0);
  if (total === 0) {
    return (
      <div className="flex h-56 items-center justify-center text-sm text-white/50">
        Sem dados ainda.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="h-40">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={rows}
              dataKey="value"
              innerRadius={45}
              outerRadius={70}
              paddingAngle={2}
              stroke="none"
            >
              {rows.map((r) => (
                <Cell key={r.key} fill={PLAN_COLORS[r.key] ?? '#64748b'} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                background: '#0f1a2e',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 12,
                color: '#fff',
                fontSize: 12,
              }}
              formatter={(v: number, _name, p) => [
                `${v} (${((v / total) * 100).toFixed(0)}%)`,
                p.payload.name,
              ]}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <ul className="space-y-1.5 text-sm">
        {rows.map((r) => (
          <li key={r.key} className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-white/70">
              <span
                className="h-2.5 w-2.5 rounded-sm"
                style={{ background: PLAN_COLORS[r.key] ?? '#64748b' }}
              />
              {r.name}
            </span>
            <span className="tabular-nums text-white/90">
              {r.value} <span className="text-white/40">· {((r.value / total) * 100).toFixed(0)}%</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
