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
import type { Category, PaymentMethod, RecurringTransaction } from '@/lib/types';

const schema = z.object({
  type: z.enum(['INCOME', 'EXPENSE']),
  description: z.string().min(1, 'Obrigatório').max(160),
  amount: z
    .union([z.string(), z.number()])
    .transform((v) => (typeof v === 'string' ? Number(v.replace(',', '.')) : v))
    .refine((v) => Number.isFinite(v) && v > 0, 'Valor inválido'),
  frequency: z.enum(['WEEKLY', 'MONTHLY', 'YEARLY']),
  dueDay: z
    .union([z.string(), z.number()])
    .transform((v) => (typeof v === 'string' ? Number(v) : v))
    .refine((v) => Number.isInteger(v) && v >= 1 && v <= 31, 'Dia entre 1 e 31'),
  startDate: z.string().min(1),
  endDate: z.string().optional(),
  categoryId: z.string().min(1, 'Escolha uma categoria'),
  paymentMethodId: z.string().optional(),
});

type FormValues = z.input<typeof schema>;

interface Props {
  open: boolean;
  item: RecurringTransaction | null;
  categories: Category[];
  paymentMethods: PaymentMethod[];
  onClose: () => void;
  onSaved: () => void;
}

export function RecurringFormModal({
  open,
  item,
  categories,
  paymentMethods,
  onClose,
  onSaved,
}: Props) {
  const isEdit = !!item;
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
      frequency: 'MONTHLY',
      dueDay: 1,
      startDate: toDateInput(new Date()),
    },
  });

  const type = watch('type');
  const filteredCategories = useMemo(
    () => categories.filter((c) => c.type === type && c.isActive),
    [categories, type],
  );

  useEffect(() => {
    if (!open) return;
    if (item) {
      reset({
        type: item.type,
        description: item.description,
        amount: item.amount,
        frequency: item.frequency,
        dueDay: item.dueDay,
        startDate: item.startDate,
        endDate: item.endDate ?? '',
        categoryId: item.category.id,
        paymentMethodId: item.paymentMethod?.id ?? '',
      });
    } else {
      reset({
        type: 'EXPENSE',
        description: '',
        amount: '' as unknown as number,
        frequency: 'MONTHLY',
        dueDay: 1,
        startDate: toDateInput(new Date()),
        endDate: '',
        categoryId: '',
        paymentMethodId: '',
      });
    }
  }, [open, item, reset]);

  useEffect(() => {
    if (!open || item) return;
    setValue('categoryId', '');
  }, [type, open, item, setValue]);

  async function onSubmit(values: FormValues) {
    try {
      const payload = {
        type: values.type,
        description: values.description,
        amount: typeof values.amount === 'string' ? Number(values.amount) : values.amount,
        frequency: values.frequency,
        dueDay: typeof values.dueDay === 'string' ? Number(values.dueDay) : values.dueDay,
        startDate: values.startDate,
        endDate: values.endDate || undefined,
        categoryId: values.categoryId,
        paymentMethodId: values.paymentMethodId || undefined,
      };
      if (item) {
        await apiJson(`/recurring-transactions/${item.id}`, {
          method: 'PATCH',
          body: JSON.stringify(payload),
        });
        toast.success('Recorrência atualizada');
      } else {
        await apiJson('/recurring-transactions', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        toast.success('Recorrência criada');
      }
      onSaved();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Erro');
    }
  }

  return (
    <Modal
      open={open}
      onOpenChange={(v) => !v && onClose()}
      title={isEdit ? 'Editar recorrência' : 'Nova recorrência'}
      description={isEdit ? undefined : 'Lançamentos fixos serão sugeridos em "Gerar deste mês".'}
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} type="button">
            Cancelar
          </Button>
          <Button form="rec-form" type="submit" loading={isSubmitting}>
            Salvar
          </Button>
        </>
      }
    >
      <form id="rec-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Controller
          control={control}
          name="type"
          render={({ field }) => (
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => field.onChange('EXPENSE')}
                className={cn(
                  'rounded-xl border px-3 py-3 text-sm font-medium transition-colors focus-ring',
                  field.value === 'EXPENSE'
                    ? 'border-rose-600 bg-rose-50 text-rose-700'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50',
                )}
              >
                Saída
              </button>
              <button
                type="button"
                onClick={() => field.onChange('INCOME')}
                className={cn(
                  'rounded-xl border px-3 py-3 text-sm font-medium transition-colors focus-ring',
                  field.value === 'INCOME'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-700'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50',
                )}
              >
                Entrada
              </button>
            </div>
          )}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label htmlFor="r-desc">Descrição</Label>
            <Input id="r-desc" autoFocus {...register('description')} />
            {errors.description && (
              <p className="mt-1 text-xs text-rose-600">{errors.description.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="r-amount">Valor (R$)</Label>
            <Input id="r-amount" inputMode="decimal" placeholder="0,00" {...register('amount')} />
            {errors.amount && <p className="mt-1 text-xs text-rose-600">{errors.amount.message as string}</p>}
          </div>

          <div>
            <Label>Frequência</Label>
            <Controller
              control={control}
              name="frequency"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="WEEKLY">Semanal</SelectItem>
                    <SelectItem value="MONTHLY">Mensal</SelectItem>
                    <SelectItem value="YEARLY">Anual</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div>
            <Label htmlFor="r-day">Dia do vencimento (1-31)</Label>
            <Input id="r-day" type="number" min={1} max={31} {...register('dueDay')} />
            {errors.dueDay && <p className="mt-1 text-xs text-rose-600">{errors.dueDay.message as string}</p>}
          </div>

          <div>
            <Label htmlFor="r-start">Início</Label>
            <Input id="r-start" type="date" {...register('startDate')} />
          </div>

          <div>
            <Label htmlFor="r-end">Fim <span className="font-normal text-slate-400">(opcional)</span></Label>
            <Input id="r-end" type="date" {...register('endDate')} />
          </div>

          <div className="sm:col-span-2">
            <Label>Categoria</Label>
            <Controller
              control={control}
              name="categoryId"
              render={({ field }) => (
                <Select value={field.value || undefined} onValueChange={field.onChange}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    {filteredCategories.length === 0 ? (
                      <div className="px-3 py-6 text-center text-sm text-slate-500">
                        Sem categorias de {type === 'INCOME' ? 'entrada' : 'saída'}.
                      </div>
                    ) : (
                      filteredCategories.map((c) => (
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
            />
            {errors.categoryId && <p className="mt-1 text-xs text-rose-600">{errors.categoryId.message}</p>}
          </div>

          <div className="sm:col-span-2">
            <Label>Forma de pagamento</Label>
            <Controller
              control={control}
              name="paymentMethodId"
              render={({ field }) => (
                <Select
                  value={field.value || 'NONE'}
                  onValueChange={(v) => field.onChange(v === 'NONE' ? '' : v)}
                >
                  <SelectTrigger><SelectValue placeholder="Opcional" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NONE">— Nenhuma —</SelectItem>
                    {paymentMethods.filter((pm) => pm.isActive).map((pm) => (
                      <SelectItem key={pm.id} value={pm.id}>{pm.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
        </div>
      </form>
    </Modal>
  );
}
