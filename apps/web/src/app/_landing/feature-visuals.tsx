/**
 * Visuais editoriais para a seção de features. Tudo em HTML/CSS/SVG —
 * nada de ícone genérico em círculo colorido.
 */

import { Calendar, Repeat } from 'lucide-react';

export function FeatureVisual1() {
  return (
    <div className="relative">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
        <div className="text-[10px] uppercase tracking-[0.18em] text-slate-500">Novo lançamento</div>
        <div className="mt-3 space-y-3">
          <Row label="Tipo">
            <Pill active>Despesa</Pill>
            <Pill>Receita</Pill>
          </Row>
          <Row label="Valor">
            <span className="font-display text-2xl font-semibold tabular-nums tracking-tight text-slate-900">
              R$ 318<span className="text-slate-400">,40</span>
            </span>
          </Row>
          <Row label="Descrição">
            <span className="text-sm text-slate-700">Mercado · Pão de Açúcar</span>
          </Row>
          <Row label="Categoria">
            <span className="inline-flex items-center gap-1.5 rounded-md bg-sky-50 px-2 py-0.5 text-xs font-medium text-sky-700 ring-1 ring-inset ring-sky-200">
              <span className="h-1.5 w-1.5 rounded-full bg-sky-500" />
              Mercado
            </span>
          </Row>
        </div>
        <button
          type="button"
          className="mt-5 w-full rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-medium text-white"
        >
          Salvar
        </button>
      </div>

      {/* Card de recorrência flutuando */}
      <div className="absolute -bottom-6 right-0 w-60 rounded-xl border border-slate-200 bg-white p-3 shadow-elevated">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
            <Repeat className="h-3.5 w-3.5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-xs font-medium text-slate-900">Aluguel · todo dia 5</div>
            <div className="text-[10px] text-slate-500">Próximo: 05/dez</div>
          </div>
          <Calendar className="h-3.5 w-3.5 text-slate-400" />
        </div>
      </div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-slate-500">{label}</div>
      <div className="mt-1 flex items-center gap-1.5">{children}</div>
    </div>
  );
}

function Pill({ children, active = false }: { children: React.ReactNode; active?: boolean }) {
  return (
    <span
      className={`rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${
        active
          ? 'bg-slate-900 text-white ring-slate-900'
          : 'bg-white text-slate-600 ring-slate-200'
      }`}
    >
      {children}
    </span>
  );
}

/** Tela de relatórios: barras horizontais por categoria + comparativo. */
export function FeatureVisual2() {
  const rows = [
    { name: 'Mercado', value: 1624, pct: 81, color: '#2563eb' },
    { name: 'Casa', value: 1120, pct: 56, color: '#10b981' },
    { name: 'Transporte', value: 720, pct: 36, color: '#0ea5e9' },
    { name: 'Lazer', value: 642, pct: 32, color: '#f59e0b' },
    { name: 'Saúde', value: 374, pct: 19, color: '#a855f7' },
  ];
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[10px] uppercase tracking-[0.18em] text-slate-500">
            Relatório · Novembro
          </div>
          <div className="mt-1 font-display text-xl font-semibold tracking-tight">
            Para onde foi o dinheiro
          </div>
        </div>
        <div className="text-right">
          <div className="text-[10px] uppercase tracking-wider text-slate-500">Total</div>
          <div className="font-display text-lg font-semibold tabular-nums">R$ 4.480</div>
        </div>
      </div>

      <ul className="mt-6 space-y-3.5">
        {rows.map((r) => (
          <li key={r.name}>
            <div className="mb-1 flex items-center justify-between text-xs">
              <span className="text-slate-700">{r.name}</span>
              <span className="tabular-nums text-slate-500">
                R$ {r.value.toLocaleString('pt-BR')}
              </span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full"
                style={{ width: `${r.pct}%`, background: r.color }}
              />
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4 text-xs text-slate-600">
        <span>vs. outubro</span>
        <span className="font-medium text-emerald-700 tabular-nums">− R$ 312 · 6,5% menos</span>
      </div>
    </div>
  );
}

/** Visualização da casa com membros + isolamento. */
export function FeatureVisual3() {
  const members = [
    { initials: 'CA', name: 'Carolina', role: 'Dona', color: 'bg-emerald-100 text-emerald-800' },
    { initials: 'RA', name: 'Rafael', role: 'Membro', color: 'bg-sky-100 text-sky-800' },
    { initials: 'LU', name: 'Luiza', role: 'Membro', color: 'bg-amber-100 text-amber-800' },
  ];
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase tracking-[0.18em] text-slate-500">Casa</div>
            <div className="mt-1 font-display text-lg font-semibold tracking-tight">
              Vila Mariana
            </div>
          </div>
          <span className="rounded-md bg-emerald-50 px-2 py-1 text-[10px] font-medium uppercase tracking-wider text-emerald-700 ring-1 ring-inset ring-emerald-200">
            Pro+ · 3 / 5
          </span>
        </div>

        <ul className="mt-5 divide-y divide-slate-100">
          {members.map((m) => (
            <li key={m.initials} className="flex items-center gap-3 py-2.5">
              <span
                className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-semibold ${m.color}`}
              >
                {m.initials}
              </span>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium text-slate-900">{m.name}</div>
                <div className="text-[11px] text-slate-500">{m.role}</div>
              </div>
              <span className="text-[10px] text-slate-400">online</span>
            </li>
          ))}
        </ul>

        <button
          type="button"
          className="mt-4 w-full rounded-xl border border-dashed border-slate-300 px-3 py-2 text-xs font-medium text-slate-600"
        >
          + Convidar por e-mail
        </button>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white/70 p-4 text-xs leading-relaxed text-slate-600">
        <strong className="block text-slate-900">Isolamento por casa.</strong>
        Cada household tem dados próprios no banco. Convites por link, com expiração de 7 dias.
        Auditoria interna de tudo que muda.
      </div>
    </div>
  );
}
