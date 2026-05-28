import { Search } from 'lucide-react';
import { formatDate, formatMoney } from '@/lib/format';
import { fetchHouseholds, type Tier } from '../../_lib/admin-api';
import { HouseholdRow } from './_row';

export const dynamic = 'force-dynamic';

const TIER_OPTIONS: Array<{ label: string; value: Tier | '' }> = [
  { label: 'Todos', value: '' },
  { label: 'Free', value: 'FREE' },
  { label: 'Pro', value: 'PRO' },
  { label: 'Pro+', value: 'PRO_PLUS' },
];

export default async function HouseholdsAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; tier?: Tier; page?: string }>;
}) {
  const sp = await searchParams;
  const page = sp.page ? Number(sp.page) : 1;
  const data = await fetchHouseholds({ q: sp.q, tier: sp.tier, page });

  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.limit)) : 1;

  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight">Casas & Assinaturas</h1>
          <p className="mt-1 text-sm text-white/50">
            {data?.total ?? 0} casas no total. Override de plano grava no banco direto.
          </p>
        </div>
      </div>

      {/* Filtros */}
      <form className="flex flex-wrap items-center gap-2" action="/admin/households">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
          <input
            type="search"
            name="q"
            defaultValue={sp.q ?? ''}
            placeholder="Buscar por casa, dono ou email…"
            className="w-full rounded-lg border border-white/10 bg-white/5 px-9 py-2 text-sm text-white placeholder:text-white/30 focus:border-emerald-400/40 focus:outline-none focus:ring-2 focus:ring-emerald-400/20"
          />
        </div>
        <select
          name="tier"
          defaultValue={sp.tier ?? ''}
          className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-emerald-400/40 focus:outline-none"
        >
          {TIER_OPTIONS.map((o) => (
            <option key={o.value} value={o.value} className="bg-brand-950">
              {o.label}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-brand-950 transition hover:bg-emerald-400"
        >
          Filtrar
        </button>
      </form>

      {/* Tabela */}
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
        <table className="w-full text-sm">
          <thead className="bg-white/5 text-left text-xs uppercase tracking-wider text-white/50">
            <tr>
              <th className="px-4 py-3 font-medium">Casa / Dono</th>
              <th className="px-4 py-3 font-medium">Plano</th>
              <th className="px-4 py-3 font-medium">Estado</th>
              <th className="px-4 py-3 font-medium">Uso</th>
              <th className="px-4 py-3 font-medium">Criada</th>
              <th className="px-4 py-3 font-medium text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {data?.items.map((h) => (
              <HouseholdRow key={h.id} household={h} />
            ))}
            {(!data || data.items.length === 0) && (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-white/50">
                  Nenhuma casa encontrada.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Paginação */}
      {data && data.total > data.limit && (
        <div className="flex items-center justify-between text-sm text-white/60">
          <span>
            Página {data.page} de {totalPages} · {data.total} casas
          </span>
          <div className="flex gap-2">
            {page > 1 && (
              <a
                href={`/admin/households?${new URLSearchParams({
                  ...(sp.q ? { q: sp.q } : {}),
                  ...(sp.tier ? { tier: sp.tier } : {}),
                  page: String(page - 1),
                }).toString()}`}
                className="rounded-lg bg-white/5 px-3 py-1.5 ring-1 ring-white/10 hover:bg-white/10"
              >
                ← Anterior
              </a>
            )}
            {page < totalPages && (
              <a
                href={`/admin/households?${new URLSearchParams({
                  ...(sp.q ? { q: sp.q } : {}),
                  ...(sp.tier ? { tier: sp.tier } : {}),
                  page: String(page + 1),
                }).toString()}`}
                className="rounded-lg bg-white/5 px-3 py-1.5 ring-1 ring-white/10 hover:bg-white/10"
              >
                Próxima →
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// helpers (não exportados — só pra ter date/money disponível no row, mas o row é client)
void formatDate;
void formatMoney;
