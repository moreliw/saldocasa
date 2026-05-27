'use client';

import { motion } from 'framer-motion';
import { AlertTriangle, Pencil, Plus, Target, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Modal } from '@/components/ui/modal';
import { PageHeader } from '@/components/ui/page-header';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { ApiError, apiJson } from '@/lib/api';
import { cn } from '@/lib/cn';
import { formatMoney, monthLabel } from '@/lib/format';
import type { BudgetItem, BudgetsResponse, Category } from '@/lib/types';

export default function BudgetsPage() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [data, setData] = useState<BudgetsResponse | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [editing, setEditing] = useState<BudgetItem | null>(null);
  const [creating, setCreating] = useState(false);

  async function load() {
    try {
      const d = await apiJson<BudgetsResponse>(`/budgets?year=${year}&month=${month}`);
      setData(d);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Erro');
    }
  }

  useEffect(() => {
    load();
    apiJson<Category[]>('/categories?type=EXPENSE').then(setCategories).catch(() => undefined);
  }, [year, month]);

  function shiftMonth(delta: number) {
    const d = new Date(year, month - 1 + delta, 1);
    setYear(d.getFullYear());
    setMonth(d.getMonth() + 1);
  }

  async function remove(b: BudgetItem) {
    if (!confirm(`Remover orçamento de "${b.category.name}"?`)) return;
    try {
      await apiJson(`/budgets/${b.id}`, { method: 'DELETE' });
      toast.success('Orçamento removido');
      await load();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Erro');
    }
  }

  const usedCategoryIds = useMemo(
    () => new Set(data?.items.map((b) => b.categoryId) ?? []),
    [data],
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Orçamentos"
        description="Defina um teto de gasto por categoria e acompanhe o consumo do mês."
        action={
          <Button onClick={() => setCreating(true)}>
            <Plus className="h-4 w-4" />
            Novo orçamento
          </Button>
        }
      />

      <div className="flex items-center justify-between">
        <div className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-1 shadow-card">
          <Button variant="ghost" size="sm" onClick={() => shiftMonth(-1)} aria-label="Mês anterior">
            ◀
          </Button>
          <span className="min-w-[160px] text-center text-sm font-medium capitalize text-slate-700">
            {monthLabel(year, month)}
          </span>
          <Button variant="ghost" size="sm" onClick={() => shiftMonth(1)} aria-label="Próximo mês">
            ▶
          </Button>
        </div>
      </div>

      {data === null ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      ) : data.items.length === 0 ? (
        <Card>
          <EmptyState
            icon={Target}
            title="Sem orçamentos para este mês"
            description="Defina limites de gasto por categoria. Você verá o consumo em tempo real conforme lançar as despesas."
            action={
              <Button onClick={() => setCreating(true)}>
                <Plus className="h-4 w-4" />
                Criar primeiro
              </Button>
            }
          />
        </Card>
      ) : (
        <motion.div layout className="grid gap-4 sm:grid-cols-2">
          {data.items.map((b) => (
            <BudgetCard
              key={b.id}
              item={b}
              onEdit={() => setEditing(b)}
              onRemove={() => remove(b)}
            />
          ))}
        </motion.div>
      )}

      <BudgetFormModal
        open={creating || !!editing}
        item={editing}
        year={year}
        month={month}
        categories={categories.filter(
          (c) => c.isActive && (editing || !usedCategoryIds.has(c.id)),
        )}
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

function BudgetCard({
  item,
  onEdit,
  onRemove,
}: {
  item: BudgetItem;
  onEdit: () => void;
  onRemove: () => void;
}) {
  const barColor =
    item.status === 'over'
      ? 'bg-rose-500'
      : item.status === 'warning'
      ? 'bg-amber-500'
      : 'bg-emerald-500';

  const pct = Math.min(item.percent, 100);
  const over = item.spent - item.plannedAmount;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="surface group p-5"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: item.category.color }}
            />
            <span className="truncate font-medium text-slate-900">{item.category.name}</span>
            {item.status === 'over' && (
              <Badge tone="negative">
                <AlertTriangle className="h-3 w-3" />
                Estourou
              </Badge>
            )}
            {item.status === 'warning' && <Badge tone="warning">Atenção</Badge>}
          </div>
          <div className="mt-1 text-xs text-slate-500">
            {formatMoney(item.spent)} de {formatMoney(item.plannedAmount)}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <Button variant="ghost" size="icon" onClick={onEdit} aria-label="Editar">
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={onRemove} aria-label="Excluir">
            <Trash2 className="h-4 w-4 text-slate-400" />
          </Button>
        </div>
      </div>

      <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
        <motion.div
          className={cn('h-full rounded-full', barColor)}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>
      <div className="mt-3 flex items-baseline justify-between">
        <span className="text-sm tabular-nums text-slate-700">{item.percent}%</span>
        <span className={cn(
          'text-sm font-medium tabular-nums',
          item.status === 'over' ? 'text-rose-600' : 'text-slate-700',
        )}>
          {item.status === 'over'
            ? `${formatMoney(over)} acima`
            : `${formatMoney(item.remaining)} restante`}
        </span>
      </div>
    </motion.div>
  );
}

function BudgetFormModal({
  open,
  item,
  year,
  month,
  categories,
  onClose,
  onSaved,
}: {
  open: boolean;
  item: BudgetItem | null;
  year: number;
  month: number;
  categories: Category[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [categoryId, setCategoryId] = useState<string>('');
  const [planned, setPlanned] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setCategoryId(item?.categoryId ?? '');
    setPlanned(item ? String(item.plannedAmount) : '');
  }, [open, item]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const plannedAmount = Number(planned.replace(',', '.'));
      if (item) {
        await apiJson(`/budgets/${item.id}`, {
          method: 'PATCH',
          body: JSON.stringify({ plannedAmount }),
        });
        toast.success('Orçamento atualizado');
      } else {
        await apiJson('/budgets', {
          method: 'POST',
          body: JSON.stringify({ categoryId, year, month, plannedAmount }),
        });
        toast.success('Orçamento criado');
      }
      onSaved();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Erro');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      open={open}
      onOpenChange={(v) => !v && onClose()}
      title={item ? 'Editar orçamento' : 'Novo orçamento'}
      description={item ? undefined : `Para ${monthLabel(year, month)}`}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} type="button">
            Cancelar
          </Button>
          <Button form="b-form" type="submit" loading={saving}>
            Salvar
          </Button>
        </>
      }
    >
      <form id="b-form" onSubmit={save} className="space-y-4">
        <div>
          <Label>Categoria</Label>
          {item ? (
            <div className="rounded-xl bg-slate-50 px-3 py-2.5 text-sm text-slate-700">
              <span
                className="mr-2 inline-block h-2 w-2 rounded-full align-middle"
                style={{ backgroundColor: item.category.color }}
              />
              {item.category.name}
            </div>
          ) : (
            <Select value={categoryId || undefined} onValueChange={setCategoryId}>
              <SelectTrigger><SelectValue placeholder="Escolha" /></SelectTrigger>
              <SelectContent>
                {categories.length === 0 ? (
                  <div className="px-3 py-4 text-center text-sm text-slate-500">
                    Todas as categorias já têm orçamento neste mês.
                  </div>
                ) : (
                  categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      <span className="inline-flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: c.color }} />
                        {c.name}
                      </span>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          )}
        </div>

        <div>
          <Label htmlFor="b-amount">Valor planejado (R$)</Label>
          <Input
            id="b-amount"
            inputMode="decimal"
            placeholder="0,00"
            required
            value={planned}
            onChange={(e) => setPlanned(e.target.value)}
          />
        </div>
      </form>
    </Modal>
  );
}
