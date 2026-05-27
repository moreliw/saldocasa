'use client';

import { Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button, type ButtonProps } from '@/components/ui/button';
import { TransactionFormModal } from '@/app/(app)/transactions/_components/transaction-form-modal';
import { ApiError, apiJson } from '@/lib/api';
import type { Category, PaymentMethod } from '@/lib/types';

interface Props extends Omit<ButtonProps, 'onClick'> {
  label?: string;
  /** Se true, atualiza o RSC depois de criar (útil em /dashboard) */
  refreshAfter?: boolean;
}

/**
 * Botão "Novo lançamento" reutilizável. Abre o modal in-place em qualquer página.
 * Lazy-loads categorias e formas de pagamento só quando o usuário clica.
 */
export function NewTransactionButton({
  label = 'Novo lançamento',
  refreshAfter = true,
  ...buttonProps
}: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);

  async function handleClick() {
    if (categories.length === 0) {
      setLoading(true);
      try {
        const [cats, pms] = await Promise.all([
          apiJson<Category[]>('/categories'),
          apiJson<PaymentMethod[]>('/payment-methods'),
        ]);
        setCategories(cats);
        setPaymentMethods(pms);
      } catch (err) {
        toast.error(err instanceof ApiError ? err.message : 'Erro ao carregar dados');
        setLoading(false);
        return;
      }
      setLoading(false);
    }
    setOpen(true);
  }

  return (
    <>
      <Button onClick={handleClick} loading={loading} {...buttonProps}>
        <Plus className="h-4 w-4" />
        {label}
      </Button>
      <TransactionFormModal
        open={open}
        transaction={null}
        categories={categories}
        paymentMethods={paymentMethods}
        onClose={() => setOpen(false)}
        onSaved={() => {
          setOpen(false);
          if (refreshAfter) router.refresh();
        }}
      />
    </>
  );
}
