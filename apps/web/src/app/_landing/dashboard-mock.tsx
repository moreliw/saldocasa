import { ArrowDownRight, ArrowUpRight, Wallet } from 'lucide-react';

/**
 * Mockup estático do dashboard renderizado em HTML/CSS — sem imagem.
 * Mantém visual coerente com o produto real e fica nítido em qualquer DPI.
 */
export function DashboardMock() {
  return (
    <div className="relative">
      {/* Card flutuante decorativo (notificação) */}
      <div className="absolute -left-6 top-6 z-10 hidden rotate-[-3deg] rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 shadow-elevated md:flex md:items-center md:gap-2.5">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
          <ArrowUpRight className="h-3.5 w-3.5" />
        </div>
        <div className="text-xs">
          <div className="font-medium text-slate-900">Salário recebido</div>
          <div className="text-slate-500 tabular-nums">+ R$ 6.200,00</div>
        </div>
      </div>

      {/* Janela do app */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-elevated">
        {/* topo da janela */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/60 px-4 py-2.5">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
          </div>
          <div className="rounded-md bg-white px-2.5 py-0.5 text-[10px] text-slate-500 ring-1 ring-slate-200">
            saldocasa.morelidev.com/dashboard
          </div>
          <div className="w-12" />
        </div>

        <div className="space-y-5 p-5">
          {/* saudação */}
          <div>
            <div className="font-display text-lg font-semibold tracking-tight">Olá, Carolina</div>
            <div className="text-xs text-slate-500">Casa Vila Mariana · novembro</div>
          </div>

          {/* KPIs */}
          <div className="grid grid-cols-3 gap-3">
            <StatCard
              label="Saldo do mês"
              value="R$ 4.820"
              accent="emerald"
              icon={<Wallet className="h-3.5 w-3.5" />}
            />
            <StatCard
              label="Entradas"
              value="R$ 9.300"
              accent="sky"
              icon={<ArrowUpRight className="h-3.5 w-3.5" />}
            />
            <StatCard
              label="Saídas"
              value="R$ 4.480"
              accent="rose"
              icon={<ArrowDownRight className="h-3.5 w-3.5" />}
            />
          </div>

          {/* Donut + lista */}
          <div className="grid grid-cols-[140px_1fr] gap-4">
            <Donut />
            <ul className="space-y-2.5">
              <CategoryRow color="#2563eb" name="Mercado" value="R$ 1.624" pct={36} />
              <CategoryRow color="#10b981" name="Casa" value="R$ 1.120" pct={25} />
              <CategoryRow color="#f59e0b" name="Lazer" value="R$ 642" pct={14} />
              <CategoryRow color="#e11d48" name="Outros" value="R$ 1.094" pct={25} />
            </ul>
          </div>

          {/* Mini gráfico de linha */}
          <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-wider text-slate-500">
                Evolução · 6 meses
              </span>
              <span className="text-[10px] text-emerald-700">+ 12% no semestre</span>
            </div>
            <LineSpark />
          </div>
        </div>
      </div>

      {/* Card flutuante decorativo (orçamento) */}
      <div className="absolute -bottom-5 -right-3 z-10 hidden w-44 rotate-[2deg] rounded-xl border border-slate-200 bg-white p-3 shadow-elevated md:block">
        <div className="text-[10px] uppercase tracking-wider text-slate-500">Orçamento Mercado</div>
        <div className="mt-1.5 flex items-baseline justify-between">
          <span className="font-display text-sm font-semibold">R$ 1.624</span>
          <span className="text-[10px] text-slate-500">/ 2.000</span>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
          <div className="h-full w-[81%] rounded-full bg-emerald-500" />
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  accent,
  icon,
}: {
  label: string;
  value: string;
  accent: 'emerald' | 'sky' | 'rose';
  icon: React.ReactNode;
}) {
  const accents = {
    emerald: 'bg-emerald-50 text-emerald-600',
    sky: 'bg-sky-50 text-sky-600',
    rose: 'bg-rose-50 text-rose-600',
  } as const;
  return (
    <div className="rounded-xl border border-slate-100 bg-white p-3">
      <div className="flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-wider text-slate-500">{label}</span>
        <span className={`flex h-5 w-5 items-center justify-center rounded-md ${accents[accent]}`}>
          {icon}
        </span>
      </div>
      <div className="mt-1.5 font-display text-base font-semibold tabular-nums tracking-tight">
        {value}
      </div>
    </div>
  );
}

function CategoryRow({
  color,
  name,
  value,
  pct,
}: {
  color: string;
  name: string;
  value: string;
  pct: number;
}) {
  return (
    <li className="flex items-center gap-3">
      <span className="h-2 w-2 shrink-0 rounded-sm" style={{ background: color }} />
      <span className="min-w-0 flex-1 truncate text-xs text-slate-700">{name}</span>
      <span className="text-[10px] tabular-nums text-slate-500">{value}</span>
      <span className="w-8 text-right text-[10px] tabular-nums text-slate-400">{pct}%</span>
    </li>
  );
}

function Donut() {
  // SVG estático, conic-gradient via CSS pra ser nítido
  return (
    <div className="relative mx-auto h-[140px] w-[140px]">
      <div
        className="h-full w-full rounded-full"
        style={{
          background:
            'conic-gradient(#2563eb 0 36%, #10b981 36% 61%, #f59e0b 61% 75%, #e11d48 75% 100%)',
        }}
      />
      <div className="absolute inset-3 rounded-full bg-white" />
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[10px] uppercase tracking-wider text-slate-500">Total</span>
        <span className="font-display text-sm font-semibold tabular-nums">R$ 4.480</span>
      </div>
    </div>
  );
}

function LineSpark() {
  // Linha de evolução desenhada em SVG com gradiente sob a curva
  return (
    <svg viewBox="0 0 320 60" className="h-12 w-full" preserveAspectRatio="none">
      <defs>
        <linearGradient id="spark" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        d="M0,42 C40,38 60,30 90,28 C120,26 140,40 170,34 C200,28 220,18 250,22 C280,26 300,14 320,12 L320,60 L0,60 Z"
        fill="url(#spark)"
      />
      <path
        d="M0,42 C40,38 60,30 90,28 C120,26 140,40 170,34 C200,28 220,18 250,22 C280,26 300,14 320,12"
        fill="none"
        stroke="#10b981"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}
