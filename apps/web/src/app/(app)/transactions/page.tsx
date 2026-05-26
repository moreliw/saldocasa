'use client';

import { motion } from 'framer-motion';
import {
  ArrowDownCircle,
  ArrowUpCircle,
  ChevronLeft,
  ChevronRight,
  Plus,
  Receipt,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { PageHeader } from '@/components/ui/page-header';
import { ApiError, apiJson } from '@/lib/api';
import { cn } from '@/lib/cn';
import { formatDate, formatMoney } from '@/lib/format';
import type {
  Category,
  PaymentMethod,
  Transaction,
  TransactionListResponse,
  TransactionStatus,
  TransactionType,
} from '@/lib/types';
import { TransactionFormModal } from './_components/transaction-form-modal';

interface Filters {
  q: string;
  type: '' | TransactionType;
  status: '' | TransactionStatus;
  categoryId: string;
  from: string;
  to: string;
}

const STATUS_TONE: Record<TransactionStatus, 'positive' | 'warning' | 'muted'> = {
  PAID: 'positive',
  PENDING: 'warning',
  CANCELLED: 'muted',
};

const STATUS_LABEL: Record<TransactionStatus, string> = {
  PAID: 'Pago',
  PENDING: 'Pendente',
  CANCELLED: 'Cancelado',
};

export default function TransactionsPage() {
  const [data, setData] = useState<TransactionListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<Filters>({
    q: '',
    type: '',
    status: '',
    categoryId: '',
    from: '',
    to: '',
  });
  const [categories, setCategories] = useState<Category[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [editing, setEditing] = useState<Transaction | null>(null);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    apiJson<Category[]>('/categories').then(setCategories).catch(() => undefined);
    apiJson<PaymentMethod[]>('/payment-methods').then(setPaymentMethods).catch(() => undefined);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.q) params.set('q', filters.q);
    if (filters.type) params.set('type', filters.type);
    if (filters.status) params.set('status', filters.status);
    if (filters.categoryId) params.set('categoryId', filters.categoryId);
    if (filters.from) params.set('from', filters.from);
    if (filters.to) params.set('to', filters.to);
    params.set('page', String(page));
    params.set('pageSize', '20');

    let cancelled = false;
    setLoading(true);
    const t = setTimeout(() => {
      apiJson<TransactionListResponse>(`/transactions?${params.toString()}`)
        .then((d) => {
          if (!cancelled) setData(d);
        })
        .catch((err) => {
          if (!cancelled) toast.error(err instanceof ApiError ? err.message : 'Erro');
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    }, 250);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [filters, page]);

  function updateFilter<K extends keyof Filters>(key: K, value: Filters[K]) {
    setPage(1);
    setFilters((prev) => ({ ...prev, [key]: value }));
  }

  function clearFilters() {
    setPage(1);
    setFilters({ q: '', type: '', status: '', categoryId: '', from: '', to: '' });
  }

  const hasFilters = useMemo(
    () => Object.values(filters).some(Boolean),
    [filters],
  );

  async function deleteTransaction(t: Transaction) {
    if (!confirm(`Excluir "${t.description}"?`)) return;
    try {
      await apiJson(`/transactions/${t.id}`, { method: 'DELETE' });
      toast.success('Lançamento excluído');
      // recarregar
      setFilters((f) => ({ ...f }));
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Erro');
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Lançamentos"
        description="Todas as entradas e saídas da sua casa."
        action={
          <Button onClick={() => setCreating(true)}>
            <Plus className="h-4 w-4" />
            Novo lançamento
          </Button>
        }
      />

      {/* Filtros */}
      <Card className="p-4">
        <div className="flex flex-wrap items-end gap-3">
          <div className="min-w-[200px] flex-1">
            <Label htmlFor="q">Buscar</Label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                id="q"
                value={filters.q}
                onChange={(e) => updateFilter('q', e.target.value)}
                placeholder="Descrição"
                className="pl-9"
              />
            </div>
          </div>

          <div className="w-32">
            <Label>Tipo</Label>
            <Select
              value={filters.type || 'ALL'}
              onValueChange={(v) => updateFilter('type', v === 'ALL' ? '' : (v as TransactionType))}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todos</SelectItem>
                <SelectItem value="INCOME">Entradas</SelectItem>
                <SelectItem value="EXPENSE">Saídas</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="w-36">
            <Label>Status</Label>
            <Select
              value={filters.status || 'ALL'}
              onValueChange={(v) => updateFilter('status', v === 'ALL' ? '' : (v as TransactionStatus))}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todos</SelectItem>
                <SelectItem value="PAID">Pago</SelectItem>
                <SelectItem value="PENDING">Pendente</SelectItem>
                <SelectItem value="CANCELLED">Cancelado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="w-44">
            <Label>Categoria</Label>
            <Select
              value={filters.categoryId || 'ALL'}
              onValueChange={(v) => updateFilter('categoryId', v === 'ALL' ? '' : v)}
            >
              <SelectTrigger><SelectValue placeholder="Todas" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todas</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="w-36">
            <Label htmlFor="from">De</Label>
            <Input
              id="from"
              type="date"
              value={filters.from}
              onChange={(e) => updateFilter('from', e.target.value)}
            />
          </div>

          <div className="w-36">
            <Label htmlFor="to">Até</Label>
            <Input
              id="to"
              type="date"
              value={filters.to}
              onChange={(e) => updateFilter('to', e.target.value)}
            />
          </div>

          {hasFilters && (
            <Button variant="ghost" onClick={clearFilters} className="text-slate-500">
              <X className="h-4 w-4" />
              Limpar
            </Button>
          )}
        </div>
      </Card>

      {/* Tabela */}
      <Card className="overflow-hidden p-0">
        {loading && !data ? (
          <div className="divide-y divide-slate-100">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-6 py-4">
                <Skeleton className="h-10 w-10 rounded-xl" />
                <Skeleton className="h-4 flex-1" />
                <Skeleton className="h-4 w-20" />
              </div>
            ))}
          </div>
        ) : !data || data.items.length === 0 ? (
          <EmptyState
            icon={Receipt}
            title={hasFilters ? 'Nada por aqui' : 'Sem lançamentos ainda'}
            description={
              hasFilters
                ? 'Nenhum lançamento bate com esses filtros. Tente ajustar.'
                : 'Comece criando seu primeiro lançamento para ver tudo organizado.'
            }
            action={
              hasFilters ? (
                <Button variant="secondary" onClick={clearFilters}>
                  Limpar filtros
                </Button>
              ) : (
                <Button onClick={() => setCreating(true)}>
                  <Plus className="h-4 w-4" />
                  Criar primeiro lançamento
                </Button>
              )
            }
          />
        ) : (
          <>
            <div className="hidden md:block">
              <table className="w-full text-sm">
                <thead className="bg-slate-50/60 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-6 py-3 text-left font-medium">Descrição</th>
                    <th className="px-3 py-3 text-left font-medium">Categoria</th>
                    <th className="px-3 py-3 text-left font-medium">Data</th>
                    <th className="px-3 py-3 text-left font-medium">Status</th>
                    <th className="px-3 py-3 text-right font-medium">Valor</th>
                    <th className="px-6 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.items.map((t) => (
                    <motion.tr
                      key={t.id}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="group transition-colors hover:bg-slate-50/60"
                    >
                      <td className="px-6 py-3.5">
                        <button
                          onClick={() => setEditing(t)}
                          className="flex items-center gap-3 text-left focus-ring rounded-lg"
                        >
                          <span
                            className={cn(
                              'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl',
                              t.type === 'INCOME'
                                ? 'bg-emerald-50 text-emerald-600'
                                : 'bg-rose-50 text-rose-600',
                            )}
                          >
                            {t.type === 'INCOME' ? (
                              <ArrowUpCircle className="h-4 w-4" />
                            ) : (
                              <ArrowDownCircle className="h-4 w-4" />
                            )}
                          </span>
                          <div className="min-w-0">
                            <div className="truncate font-medium text-slate-900">
                              {t.description}
                            </div>
                            {t.paymentMethod && (
                              <div className="text-xs text-slate-500">{t.paymentMethod.name}</div>
                            )}
                          </div>
                        </button>
                      </td>
                      <td className="px-3 py-3.5">
                        <span className="inline-flex items-center gap-1.5 text-slate-700">
                          <span
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: t.category.color }}
                          />
                          {t.category.name}
                        </span>
                      </td>
                      <td className="px-3 py-3.5 text-slate-600">
                        {formatDate(t.transactionDate)}
                      </td>
                      <td className="px-3 py-3.5">
                        <Badge tone={STATUS_TONE[t.status]}>{STATUS_LABEL[t.status]}</Badge>
                      </td>
                      <td className="px-3 py-3.5 text-right">
                        <span
                          className={cn(
                            'font-medium tabular-nums',
                            t.type === 'INCOME' ? 'text-emerald-600' : 'text-rose-600',
                          )}
                        >
                          {t.type === 'INCOME' ? '+' : '-'} {formatMoney(t.amount)}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteTransaction(t)}
                          className="opacity-0 group-hover:opacity-100"
                          aria-label="Excluir"
                        >
                          <Trash2 className="h-4 w-4 text-slate-400" />
                        </Button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile: cards */}
            <div className="divide-y divide-slate-100 md:hidden">
              {data.items.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setEditing(t)}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-slate-50"
                >
                  <span
                    className={cn(
                      'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
                      t.type === 'INCOME' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600',
                    )}
                  >
                    {t.type === 'INCOME' ? <ArrowUpCircle className="h-5 w-5" /> : <ArrowDownCircle className="h-5 w-5" />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate font-medium text-slate-900">{t.description}</span>
                      <span
                        className={cn(
                          'shrink-0 text-sm font-medium tabular-nums',
                          t.type === 'INCOME' ? 'text-emerald-600' : 'text-rose-600',
                        )}
                      >
                        {t.type === 'INCOME' ? '+' : '-'} {formatMoney(t.amount)}
                      </span>
                    </div>
                    <div className="mt-0.5 flex items-center gap-2 text-xs text-slate-500">
                      <span>{t.category.name}</span>
                      <span>·</span>
                      <span>{formatDate(t.transactionDate)}</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Paginação */}
            {data.totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-slate-100 px-6 py-3 text-sm">
                <div className="text-slate-500">
                  {data.total} lançamento{data.total === 1 ? '' : 's'}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => p - 1)}
                    aria-label="Página anterior"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-slate-700">
                    {data.page} / {data.totalPages}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    disabled={page >= data.totalPages}
                    onClick={() => setPage((p) => p + 1)}
                    aria-label="Próxima página"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </Card>

      <TransactionFormModal
        open={creating || !!editing}
        transaction={editing}
        categories={categories}
        paymentMethods={paymentMethods}
        onClose={() => {
          setCreating(false);
          setEditing(null);
        }}
        onSaved={() => {
          setCreating(false);
          setEditing(null);
          setFilters((f) => ({ ...f }));
        }}
      />
    </div>
  );
}
