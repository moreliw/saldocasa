'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Modal } from '@/components/ui/modal';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ApiError, apiJson } from '@/lib/api';
import { cn } from '@/lib/cn';
import { toDateInput } from '@/lib/format';
import type { Category, PaymentMethod, Transaction } from '@/lib/types';

const schema = z.object({
  type: z.enum(['INCOME', 'EXPENSE']),
  description: z.string().min(1, 'Obrigatório').max(160),
  amount: z
    .union([z.string(), z.number()])
    .transform((v) => (typeof v === 'string' ? Number(v.replace(',', '.')) : v))
    .refine((v) => Number.isFinite(v) && v > 0, 'Valor deve ser maior que zero'),
  transactionDate: z.string().min(1, 'Obrigatório'),
  categoryId: z.string().min(1, 'Escolha uma categoria'),
  paymentMethodId: z.string().optional(),
  status: z.enum(['PAID', 'PENDING', 'CANCELLED']).default('PAID'),
  notes: z.string().max(500).optional(),
});

type FormValues = z.input<typeof schema>;

interface Props {
  open: boolean;
  transaction: Transaction | null;
  categories: Category[];
  paymentMethods: PaymentMethod[];
  onClose: () => void;
  onSaved: () => void;
}

export function TransactionFormModal({
  open,
  transaction,
  categories,
  paymentMethods,
  onClose,
  onSaved,
}: Props) {
  const isEdit = !!transaction;
  const {
    register,
    handleSubmit,
    reset,
    control,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      type: 'EXPENSE',
      status: 'PAID',
      transactionDate: toDateInput(new Date()),
    },
  });

  const type = watch('type');
  const filteredCategories = useMemo(
    () => categories.filter((c) => c.type === type && c.isActive),
    [categories, type],
  );

  useEffect(() => {
    if (!open) return;
    if (transaction) {
      reset({
        type: transaction.type,
        description: transaction.description,
        amount: transaction.amount,
        transactionDate: transaction.transactionDate,
        categoryId: transaction.category.id,
        paymentMethodId: transaction.paymentMethod?.id ?? '',
        status: transaction.status,
        notes: transaction.notes ?? '',
      });
    } else {
      reset({
        type: 'EXPENSE',
        description: '',
        amount: '' as unknown as number,
        transactionDate: toDateInput(new Date()),
        categoryId: '',
        paymentMethodId: '',
        status: 'PAID',
        notes: '',
      });
    }
  }, [open, transaction, reset]);

  // Se trocar o tipo, limpar categoria pois categoria é tipada
  useEffect(() => {
    if (!open || transaction) return;
    setValue('categoryId', '');
  }, [type, open, transaction, setValue]);

  async function onSubmit(values: FormValues) {
    try {
      const payload = {
        type: values.type,
        description: values.description,
        amount: typeof values.amount === 'string' ? Number(values.amount) : values.amount,
        transactionDate: values.transactionDate,
        categoryId: values.categoryId,
        paymentMethodId: values.paymentMethodId || undefined,
        status: values.status,
        notes: values.notes || undefined,
      };
      if (transaction) {
        await apiJson(`/transactions/${transaction.id}`, {
          method: 'PATCH',
          body: JSON.stringify(payload),
        });
        toast.success('Lançamento atualizado');
      } else {
        await apiJson('/transactions', { method: 'POST', body: JSON.stringify(payload) });
        toast.success('Lançamento criado');
      }
      onSaved();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Erro ao salvar');
    }
  }

  return (
    <Modal
      open={open}
      onOpenChange={(v) => !v && onClose()}
      title={isEdit ? 'Editar lançamento' : 'Novo lançamento'}
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} type="button">
            Cancelar
          </Button>
          <Button form="tx-form" type="submit" loading={isSubmitting}>
            Salvar
          </Button>
        </>
      }
    >
      <form id="tx-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Tipo: tabs */}
        <Controller
          control={control}
          name="type"
          render={({ field }) => (
            <div className="grid grid-cols-2 gap-2">
              <TypeButton
                active={field.value === 'EXPENSE'}
                onClick={() => field.onChange('EXPENSE')}
                tone="negative"
              >
                Saída
              </TypeButton>
              <TypeButton
                active={field.value === 'INCOME'}
                onClick={() => field.onChange('INCOME')}
                tone="positive"
              >
                Entrada
              </TypeButton>
            </div>
          )}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label htmlFor="description">Descrição</Label>
            <Input id="description" autoFocus {...register('description')} />
            {errors.description && <FieldError>{errors.description.message}</FieldError>}
          </div>

          <div>
            <Label htmlFor="amount">Valor (R$)</Label>
            <Input
              id="amount"
              inputMode="decimal"
              placeholder="0,00"
              {...register('amount')}
            />
            {errors.amount && <FieldError>{errors.amount.message as string}</FieldError>}
          </div>

          <div>
            <Label htmlFor="transactionDate">Data</Label>
            <Input id="transactionDate" type="date" {...register('transactionDate')} />
            {errors.transactionDate && <FieldError>{errors.transactionDate.message}</FieldError>}
          </div>

          <div>
            <Label>Categoria</Label>
            <Controller
              control={control}
              name="categoryId"
              render={({ field }) => (
                <Select value={field.value || undefined} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredCategories.length === 0 ? (
                      <div className="px-3 py-6 text-center text-sm text-slate-500">
                        Sem categorias de {type === 'INCOME' ? 'entrada' : 'saída'}.
                      </div>
                    ) : (
                      filteredCategories.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          <span className="inline-flex items-center gap-2">
                            <span
                              className="h-2 w-2 rounded-full"
                              style={{ backgroundColor: c.color }}
                            />
                            {c.name}
                          </span>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.categoryId && <FieldError>{errors.categoryId.message}</FieldError>}
          </div>

          <div>
            <Label>Forma de pagamento</Label>
            <Controller
              control={control}
              name="paymentMethodId"
              render={({ field }) => (
                <Select
                  value={field.value || 'NONE'}
                  onValueChange={(v) => field.onChange(v === 'NONE' ? '' : v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Opcional" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NONE">— Nenhuma —</SelectItem>
                    {paymentMethods
                      .filter((pm) => pm.isActive)
                      .map((pm) => (
                        <SelectItem key={pm.id} value={pm.id}>
                          {pm.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div>
            <Label>Status</Label>
            <Controller
              control={control}
              name="status"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PAID">Pago</SelectItem>
                    <SelectItem value="PENDING">Pendente</SelectItem>
                    <SelectItem value="CANCELLED">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="sm:col-span-2">
            <Label htmlFor="notes">Observação</Label>
            <Input id="notes" placeholder="Opcional" {...register('notes')} />
          </div>
        </div>
      </form>
    </Modal>
  );
}

function TypeButton({
  active,
  onClick,
  tone,
  children,
}: {
  active: boolean;
  onClick: () => void;
  tone: 'positive' | 'negative';
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-xl border px-3 py-3 text-sm font-medium transition-colors focus-ring',
        active
          ? tone === 'positive'
            ? 'border-emerald-600 bg-emerald-50 text-emerald-700'
            : 'border-rose-600 bg-rose-50 text-rose-700'
          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50',
      )}
    >
      {children}
    </button>
  );
}

function FieldError({ children }: { children: React.ReactNode }) {
  return <p className="mt-1 text-xs text-rose-600">{children}</p>;
}
