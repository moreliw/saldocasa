'use client';

import { motion } from 'framer-motion';
import {
  ArrowDownCircle,
  ArrowUpCircle,
  Repeat,
  Pencil,
  Plus,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { PageHeader } from '@/components/ui/page-header';
import { Skeleton } from '@/components/ui/skeleton';
import { ApiError, apiJson } from '@/lib/api';
import { cn } from '@/lib/cn';
import { formatMoney } from '@/lib/format';
import type { Category, PaymentMethod, RecurringTransaction } from '@/lib/types';
import { RecurringFormModal } from './_components/recurring-form-modal';

const FREQ_LABEL: Record<string, string> = {
  WEEKLY: 'Semanal',
  MONTHLY: 'Mensal',
  YEARLY: 'Anual',
};

export default function RecurringPage() {
  const [items, setItems] = useState<RecurringTransaction[] | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [editing, setEditing] = useState<RecurringTransaction | null>(null);
  const [creating, setCreating] = useState(false);
  const [generating, setGenerating] = useState(false);

  async function load() {
    try {
      const data = await apiJson<RecurringTransaction[]>('/recurring-transactions');
      setItems(data);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Erro ao carregar');
    }
  }

  useEffect(() => {
    load();
    apiJson<Category[]>('/categories').then(setCategories).catch(() => undefined);
    apiJson<PaymentMethod[]>('/payment-methods').then(setPaymentMethods).catch(() => undefined);
  }, []);

  async function generateMonth() {
    setGenerating(true);
    try {
      const res = await apiJson<{ created: number; skipped: number }>(
        '/recurring-transactions/generate-month',
        { method: 'POST' },
      );
      if (res.created > 0) {
        toast.success(`${res.created} lançamento(s) gerado(s)`, {
          description: res.skipped > 0 ? `${res.skipped} já existia(m)` : undefined,
        });
      } else {
        toast.info('Nada para gerar', {
          description: 'Todos os lançamentos deste mês já existem.',
        });
      }
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Erro ao gerar');
    } finally {
      setGenerating(false);
    }
  }

  async function toggleActive(r: RecurringTransaction) {
    try {
      await apiJson(`/recurring-transactions/${r.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ isActive: !r.isActive }),
      });
      await load();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Erro');
    }
  }

  async function remove(r: RecurringTransaction) {
    if (!confirm(`Excluir recorrência "${r.description}"? Os lançamentos já gerados não serão removidos.`)) return;
    try {
      await apiJson(`/recurring-transactions/${r.id}`, { method: 'DELETE' });
      toast.success('Recorrência removida');
      await load();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Erro');
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Recorrências"
        description="Cadastre lançamentos fixos (aluguel, salário, assinaturas) e gere os do mês com um clique."
        action={
          <div className="flex gap-2">
            <Button variant="secondary" onClick={generateMonth} loading={generating}>
              <Sparkles className="h-4 w-4" />
              Gerar deste mês
            </Button>
            <Button onClick={() => setCreating(true)}>
              <Plus className="h-4 w-4" />
              Nova recorrência
            </Button>
          </div>
        }
      />

      {items === null ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <Card>
          <EmptyState
            icon={Repeat}
            title="Sem recorrências cadastradas"
            description="Cadastre lançamentos fixos do dia a dia para não precisar lembrar todo mês."
            action={
              <Button onClick={() => setCreating(true)}>
                <Plus className="h-4 w-4" />
                Cadastrar primeira
              </Button>
            }
          />
        </Card>
      ) : (
        <motion.div layout className="space-y-3">
          {items.map((r) => (
            <motion.div
              key={r.id}
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                'group surface flex items-center gap-4 px-5 py-4',
                !r.isActive && 'opacity-60',
              )}
            >
              <span
                className={cn(
                  'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
                  r.type === 'INCOME' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600',
                )}
              >
                {r.type === 'INCOME' ? (
                  <ArrowUpCircle className="h-5 w-5" />
                ) : (
                  <ArrowDownCircle className="h-5 w-5" />
                )}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="truncate font-medium text-slate-900">{r.description}</span>
                  {!r.isActive && <Badge tone="muted">pausada</Badge>}
                </div>
                <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500">
                  <span className="inline-flex items-center gap-1">
                    <span
                      className="h-1.5 w-1.5 rounded-full"
                      style={{ backgroundColor: r.category.color }}
                    />
                    {r.category.name}
                  </span>
                  <span>·</span>
                  <span>{FREQ_LABEL[r.frequency]}</span>
                  <span>·</span>
                  <span>Dia {r.dueDay}</span>
                  {r.paymentMethod && (
                    <>
                      <span>·</span>
                      <span>{r.paymentMethod.name}</span>
                    </>
                  )}
                </div>
              </div>
              <div className="text-right">
                <div
                  className={cn(
                    'font-medium tabular-nums',
                    r.type === 'INCOME' ? 'text-emerald-600' : 'text-rose-600',
                  )}
                >
                  {r.type === 'INCOME' ? '+' : '-'} {formatMoney(r.amount)}
                </div>
              </div>
              <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                <Button variant="ghost" size="sm" onClick={() => toggleActive(r)} className="text-xs">
                  {r.isActive ? 'Pausar' : 'Ativar'}
                </Button>
                <Button variant="ghost" size="icon" onClick={() => setEditing(r)} aria-label="Editar">
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => remove(r)} aria-label="Excluir">
                  <Trash2 className="h-4 w-4 text-slate-400" />
                </Button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      <RecurringFormModal
        open={creating || !!editing}
        item={editing}
        categories={categories}
        paymentMethods={paymentMethods}
        onClose={() => {
          setCreating(false);
          setEditing(null);
        }}
        onSaved={async () => {
          setCreating(false);
          setEditing(null);
          await load();
        }}
      />
    </div>
  );
}
