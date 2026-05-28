import { ArrowUpRight, Banknote, Gift, Receipt, TrendingUp, Users, Wallet } from 'lucide-react';
import Link from 'next/link';
import { formatMoney } from '@/lib/format';
import { fetchOverview } from '../_lib/admin-api';
import { PlanDonut, SignupsBar } from './_components/overview-charts';

export const dynamic = 'force-dynamic';

function Kpi({
  label,
  value,
  hint,
  icon: Icon,
  accent = 'emerald',
}: {
  label: string;
  value: string;
  hint?: string;
  icon: typeof Users;
  accent?: 'emerald' | 'sky' | 'amber' | 'violet';
}) {
  const accents = {
    emerald: 'text-emerald-400 bg-emerald-500/10 ring-emerald-400/20',
    sky: 'text-sky-400 bg-sky-500/10 ring-sky-400/20',
    amber: 'text-amber-400 bg-amber-500/10 ring-amber-400/20',
    violet: 'text-violet-400 bg-violet-500/10 ring-violet-400/20',
  } as const;
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
      <div className="flex items-start justify-between">
        <div className="text-xs font-medium uppercase tracking-wider text-white/50">{label}</div>
        <div className={`flex h-8 w-8 items-center justify-center rounded-lg ring-1 ${accents[accent]}`}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <div className="mt-3 font-display text-3xl font-semibold tabular-nums">{value}</div>
      {hint && <div className="mt-1 text-xs text-white/50">{hint}</div>}
    </div>
  );
}

export default async function AdminOverviewPage() {
  const data = await fetchOverview();

  if (!data) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center text-white/60">
        Falha ao carregar dados administrativos.
      </div>
    );
  }

  const mrr = formatMoney(data.revenue.mrrCents / 100);
  const arr = formatMoney(data.revenue.arrCents / 100);

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight">Visão geral</h1>
          <p className="mt-1 text-sm text-white/50">Métricas de vendas e adoção do produto.</p>
        </div>
        <Link
          href="/admin/households"
          className="inline-flex items-center gap-1.5 rounded-lg bg-white/5 px-3 py-2 text-xs font-medium text-white/80 ring-1 ring-white/10 transition hover:bg-white/10"
        >
          Ver assinaturas
          <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* KPI grid */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Kpi
          label="MRR"
          value={mrr}
          hint={`ARR estimado ${arr}`}
          icon={Banknote}
          accent="emerald"
        />
        <Kpi
          label="Assinantes pagantes"
          value={String(data.totals.payingHouseholds)}
          hint={`${data.totals.compHouseholds} cortesias`}
          icon={Wallet}
          accent="sky"
        />
        <Kpi
          label="Usuários"
          value={String(data.totals.users)}
          hint={`+${data.thisMonth.newUsers} este mês`}
          icon={Users}
          accent="violet"
        />
        <Kpi
          label="Lançamentos"
          value={data.totals.transactions.toLocaleString('pt-BR')}
          hint={`+${data.thisMonth.transactions} este mês`}
          icon={Receipt}
          accent="amber"
        />
      </div>

      {/* Gráficos */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="font-display text-lg font-semibold">Novos usuários</h2>
              <p className="text-xs text-white/50">Últimos 6 meses</p>
            </div>
            <TrendingUp className="h-4 w-4 text-emerald-400" />
          </div>
          <SignupsBar data={data.signupsByMonth} />
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="font-display text-lg font-semibold">Distribuição de planos</h2>
              <p className="text-xs text-white/50">Casas por tier</p>
            </div>
            <Gift className="h-4 w-4 text-violet-400" />
          </div>
          <PlanDonut data={data.planDistribution} />
        </div>
      </div>
    </div>
  );
}
