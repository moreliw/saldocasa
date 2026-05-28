import { Search } from 'lucide-react';
import { formatDate } from '@/lib/format';
import { fetchAdminUsers } from '../../_lib/admin-api';
import { UserRow } from './_row';

export const dynamic = 'force-dynamic';

export default async function UsersAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const sp = await searchParams;
  const page = sp.page ? Number(sp.page) : 1;
  const data = await fetchAdminUsers({ q: sp.q, page });
  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.limit)) : 1;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight">Usuários</h1>
        <p className="mt-1 text-sm text-white/50">{data?.total ?? 0} contas cadastradas.</p>
      </div>

      <form className="flex gap-2" action="/admin/users">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
          <input
            type="search"
            name="q"
            defaultValue={sp.q ?? ''}
            placeholder="Buscar por nome ou email…"
            className="w-full rounded-lg border border-white/10 bg-white/5 px-9 py-2 text-sm text-white placeholder:text-white/30 focus:border-emerald-400/40 focus:outline-none focus:ring-2 focus:ring-emerald-400/20"
          />
        </div>
        <button
          type="submit"
          className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-brand-950 hover:bg-emerald-400"
        >
          Filtrar
        </button>
      </form>

      <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
        <table className="w-full text-sm">
          <thead className="bg-white/5 text-left text-xs uppercase tracking-wider text-white/50">
            <tr>
              <th className="px-4 py-3 font-medium">Nome / Email</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Casas</th>
              <th className="px-4 py-3 font-medium">Cadastro</th>
              <th className="px-4 py-3 text-right font-medium">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {data?.items.map((u) => (
              <UserRow key={u.id} user={u} />
            ))}
            {(!data || data.items.length === 0) && (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-white/50">
                  Nenhum usuário encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {data && data.total > data.limit && (
        <div className="flex items-center justify-between text-sm text-white/60">
          <span>
            Página {data.page} de {totalPages} · {data.total} usuários
          </span>
          <div className="flex gap-2">
            {page > 1 && (
              <a
                href={`/admin/users?${new URLSearchParams({
                  ...(sp.q ? { q: sp.q } : {}),
                  page: String(page - 1),
                }).toString()}`}
                className="rounded-lg bg-white/5 px-3 py-1.5 ring-1 ring-white/10 hover:bg-white/10"
              >
                ← Anterior
              </a>
            )}
            {page < totalPages && (
              <a
                href={`/admin/users?${new URLSearchParams({
                  ...(sp.q ? { q: sp.q } : {}),
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

void formatDate;
