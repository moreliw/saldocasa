'use client';

import { ShieldCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { ApiError, apiJson } from '@/lib/api';
import { formatDate } from '@/lib/format';
import type { AdminUser } from '../../_lib/admin-api';

export function UserRow({ user }: { user: AdminUser }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function toggleAdmin() {
    if (
      !confirm(
        user.isSuperAdmin
          ? `Remover privilégios de super admin de ${user.email}?`
          : `Tornar ${user.email} um super admin?`,
      )
    )
      return;
    setBusy(true);
    try {
      await apiJson(`/admin/users/${user.id}/toggle-admin`, { method: 'POST' });
      toast.success('Status atualizado');
      router.refresh();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Falha');
    } finally {
      setBusy(false);
    }
  }

  return (
    <tr className="hover:bg-white/[0.03]">
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="font-medium text-white">{user.name}</span>
          {user.isSuperAdmin && (
            <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-emerald-300 ring-1 ring-emerald-400/30">
              <ShieldCheck className="h-3 w-3" />
              admin
            </span>
          )}
        </div>
        <div className="text-xs text-white/50">{user.email}</div>
      </td>
      <td className="px-4 py-3 text-white/70">
        {user.isActive ? (
          <span className="inline-flex items-center gap-1 text-xs">
            <span className="h-2 w-2 rounded-full bg-emerald-400" /> Ativo
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-xs">
            <span className="h-2 w-2 rounded-full bg-rose-400" /> Inativo
          </span>
        )}
      </td>
      <td className="px-4 py-3 text-xs text-white/60">{user.householdCount}</td>
      <td className="px-4 py-3 text-xs text-white/60">{formatDate(user.createdAt)}</td>
      <td className="px-4 py-3 text-right">
        <button
          onClick={toggleAdmin}
          disabled={busy}
          className="rounded-md bg-white/5 px-2.5 py-1.5 text-xs font-medium text-white/80 ring-1 ring-white/10 transition hover:bg-white/10 disabled:opacity-60"
        >
          {user.isSuperAdmin ? 'Remover admin' : 'Tornar admin'}
        </button>
      </td>
    </tr>
  );
}
