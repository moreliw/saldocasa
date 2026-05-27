'use client';

import { motion } from 'framer-motion';
import { Pencil, Plus, Wallet } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Modal } from '@/components/ui/modal';
import { PageHeader } from '@/components/ui/page-header';
import { Skeleton } from '@/components/ui/skeleton';
import { ApiError, apiJson } from '@/lib/api';
import { cn } from '@/lib/cn';
import type { PaymentMethod } from '@/lib/types';

export default function PaymentMethodsPage() {
  const [items, setItems] = useState<PaymentMethod[] | null>(null);
  const [editing, setEditing] = useState<PaymentMethod | null>(null);
  const [creating, setCreating] = useState(false);

  async function load() {
    try {
      const data = await apiJson<PaymentMethod[]>('/payment-methods');
      setItems(data);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Erro ao carregar');
    }
  }
  useEffect(() => {
    load();
  }, []);

  async function toggleActive(pm: PaymentMethod) {
    try {
      await apiJson(`/payment-methods/${pm.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ isActive: !pm.isActive }),
      });
      await load();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Erro ao atualizar');
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Formas de pagamento"
        description="Pix, débito, crédito, boleto — registre como costuma pagar."
        action={
          <Button onClick={() => setCreating(true)} className="w-full sm:w-auto">
            <Plus className="h-4 w-4" />
            Nova forma
          </Button>
        }
      />

      {items === null ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <Card>
          <EmptyState
            icon={Wallet}
            title="Nenhuma forma de pagamento"
            description="Adicione as formas que você usa no dia a dia."
            action={
              <Button onClick={() => setCreating(true)}>
                <Plus className="h-4 w-4" />
                Adicionar
              </Button>
            }
          />
        </Card>
      ) : (
        <motion.div layout className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((pm) => (
            <motion.div
              key={pm.id}
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.18 }}
              className={cn(
                'group surface flex items-center gap-3 px-4 py-3',
                !pm.isActive && 'opacity-60',
              )}
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                <Wallet className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium text-slate-900">{pm.name}</div>
                {!pm.isActive && (
                  <div className="mt-0.5">
                    <Badge tone="muted">inativa</Badge>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                <Button variant="ghost" size="icon" onClick={() => setEditing(pm)} aria-label="Editar">
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => toggleActive(pm)} className="text-xs">
                  {pm.isActive ? 'Inativar' : 'Ativar'}
                </Button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      <PaymentMethodFormModal
        open={creating || !!editing}
        item={editing}
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

function PaymentMethodFormModal({
  open,
  item,
  onClose,
  onSaved,
}: {
  open: boolean;
  item: PaymentMethod | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) setName(item?.name ?? '');
  }, [open, item]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      if (item) {
        await apiJson(`/payment-methods/${item.id}`, {
          method: 'PATCH',
          body: JSON.stringify({ name }),
        });
        toast.success('Forma atualizada');
      } else {
        await apiJson('/payment-methods', {
          method: 'POST',
          body: JSON.stringify({ name }),
        });
        toast.success('Forma criada');
      }
      onSaved();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Erro ao salvar');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      open={open}
      onOpenChange={(v) => !v && onClose()}
      title={item ? 'Editar forma de pagamento' : 'Nova forma de pagamento'}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} type="button">
            Cancelar
          </Button>
          <Button form="pm-form" type="submit" loading={saving}>
            Salvar
          </Button>
        </>
      }
    >
      <form id="pm-form" onSubmit={save}>
        <Label htmlFor="pm-name">Nome</Label>
        <Input
          id="pm-name"
          required
          maxLength={60}
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
        />
      </form>
    </Modal>
  );
}
