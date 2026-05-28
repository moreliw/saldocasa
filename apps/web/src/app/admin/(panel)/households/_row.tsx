'use client';

import { motion } from 'framer-motion';
import { CreditCard, Gift, Pencil, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { ApiError, apiJson } from '@/lib/api';
import { formatDate } from '@/lib/format';
import type { AdminHousehold, Tier } from '../../_lib/admin-api';

const TIER_LABEL: Record<Tier, string> = { FREE: 'Free', PRO: 'Pro', PRO_PLUS: 'Pro+' };
const TIER_BADGE: Record<Tier, string> = {
  FREE: 'bg-white/5 text-white/70 ring-white/10',
  PRO: 'bg-sky-500/10 text-sky-300 ring-sky-400/30',
  PRO_PLUS: 'bg-emerald-500/10 text-emerald-300 ring-emerald-400/30',
};

export function HouseholdRow({ household }: { household: AdminHousehold }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <tr className="hover:bg-white/[0.03]">
        <td className="px-4 py-3">
          <div className="font-medium text-white">{household.name}</div>
          <div className="text-xs text-white/50">
            {household.owner.name} · {household.owner.email}
          </div>
        </td>
        <td className="px-4 py-3">
          <span
            className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${TIER_BADGE[household.tier]}`}
          >
            {TIER_LABEL[household.tier]}
            {household.isComp && (
              <Gift className="h-3 w-3 text-amber-400" aria-label="Cortesia" />
            )}
            {household.isPaying && (
              <CreditCard className="h-3 w-3 text-emerald-400" aria-label="Pagante" />
            )}
          </span>
        </td>
        <td className="px-4 py-3 text-white/70">
          {household.status ?? <span className="text-white/30">—</span>}
        </td>
        <td className="px-4 py-3 text-xs text-white/60">
          {household.memberCount} {household.memberCount === 1 ? 'membro' : 'membros'} ·{' '}
          {household.transactionCount} lançamentos
        </td>
        <td className="px-4 py-3 text-xs text-white/60">{formatDate(household.createdAt)}</td>
        <td className="px-4 py-3 text-right">
          <button
            onClick={() => setOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-md bg-white/5 px-2.5 py-1.5 text-xs font-medium text-white/80 ring-1 ring-white/10 transition hover:bg-white/10"
          >
            <Pencil className="h-3 w-3" />
            Editar plano
          </button>
        </td>
      </tr>
      {open && <PlanModal household={household} onClose={() => setOpen(false)} />}
    </>
  );
}

function PlanModal({ household, onClose }: { household: AdminHousehold; onClose: () => void }) {
  const router = useRouter();
  const [tier, setTier] = useState<Tier>(household.tier);
  const [clearStripe, setClearStripe] = useState(false);
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    try {
      await apiJson(`/admin/households/${household.id}/plan`, {
        method: 'PATCH',
        body: JSON.stringify({ tier, clearStripe }),
      });
      toast.success(`Plano atualizado para ${TIER_LABEL[tier]}`);
      onClose();
      router.refresh();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Falha ao salvar');
    } finally {
      setSaving(false);
    }
  }

  return (
    <tr>
      <td colSpan={6} className="p-0">
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-8"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.18 }}
            className="w-full max-w-md rounded-2xl border border-white/10 bg-brand-900 p-6 text-left text-white shadow-elevated"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-xs font-medium uppercase tracking-wider text-emerald-400">
                  Override manual
                </div>
                <h3 className="mt-1 font-display text-lg font-semibold">{household.name}</h3>
                <p className="text-xs text-white/50">{household.owner.email}</p>
              </div>
              <button
                onClick={onClose}
                className="rounded-md p-1 text-white/60 hover:bg-white/5 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-5 space-y-3">
              <label className="block text-xs font-medium uppercase tracking-wide text-white/60">
                Plano
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['FREE', 'PRO', 'PRO_PLUS'] as Tier[]).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTier(t)}
                    className={`rounded-lg border px-3 py-2.5 text-sm transition ${
                      tier === t
                        ? 'border-emerald-400/50 bg-emerald-500/10 text-white'
                        : 'border-white/10 bg-white/5 text-white/60 hover:text-white'
                    }`}
                  >
                    {TIER_LABEL[t]}
                  </button>
                ))}
              </div>

              {household.isPaying && (
                <label className="mt-3 flex items-start gap-2 rounded-lg border border-amber-400/30 bg-amber-500/5 p-3 text-xs text-amber-200">
                  <input
                    type="checkbox"
                    checked={clearStripe}
                    onChange={(e) => setClearStripe(e.target.checked)}
                    className="mt-0.5 h-3.5 w-3.5"
                  />
                  <span>
                    Desvincular do Stripe. Use se quiser parar de aceitar webhooks dessa
                    assinatura. <strong className="text-amber-100">Atenção:</strong> não cancela
                    no Stripe — faça isso pelo dashboard deles também.
                  </span>
                </label>
              )}

              <div className="rounded-lg bg-white/5 p-3 text-xs text-white/60">
                {tier === 'FREE'
                  ? 'Volta pro Free. Limpa status e data de expiração.'
                  : 'Marca como ACTIVE, sem data de expiração — vitalício até você mudar.'}
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={onClose}
                className="rounded-lg bg-white/5 px-4 py-2 text-sm text-white/80 ring-1 ring-white/10 hover:bg-white/10"
              >
                Cancelar
              </button>
              <button
                onClick={save}
                disabled={saving}
                className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-brand-950 transition hover:bg-emerald-400 disabled:opacity-60"
              >
                {saving ? 'Salvando…' : 'Aplicar override'}
              </button>
            </div>
          </motion.div>
        </div>
      </td>
    </tr>
  );
}
