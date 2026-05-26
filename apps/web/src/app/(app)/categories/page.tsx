'use client';

import { motion } from 'framer-motion';
import { Pencil, Plus, Tag } from 'lucide-react';
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
import type { Category, CategoryType } from '@/lib/types';

const PRESET_COLORS = [
  '#0f1a2e', '#3d5a85', '#0ea5e9', '#06b6d4', '#10b981', '#22c55e',
  '#eab308', '#f97316', '#ef4444', '#ec4899', '#a855f7', '#64748b',
];

export default function CategoriesPage() {
  const [items, setItems] = useState<Category[] | null>(null);
  const [tab, setTab] = useState<CategoryType>('EXPENSE');
  const [editing, setEditing] = useState<Category | null>(null);
  const [creating, setCreating] = useState(false);

  async function load() {
    try {
      const data = await apiJson<Category[]>('/categories');
      setItems(data);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Erro ao carregar categorias');
    }
  }
  useEffect(() => {
    load();
  }, []);

  const filtered = items?.filter((c) => c.type === tab) ?? [];

  async function toggleActive(c: Category) {
    try {
      await apiJson(`/categories/${c.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ isActive: !c.isActive }),
      });
      await load();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Erro ao atualizar');
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Categorias"
        description="Organize seus lançamentos por categoria. Crie quantas precisar."
        action={
          <Button onClick={() => setCreating(true)}>
            <Plus className="h-4 w-4" />
            Nova categoria
          </Button>
        }
      />

      <div className="inline-flex rounded-xl border border-slate-200 bg-white p-1 shadow-card">
        <TabButton active={tab === 'EXPENSE'} onClick={() => setTab('EXPENSE')}>
          Saídas
        </TabButton>
        <TabButton active={tab === 'INCOME'} onClick={() => setTab('INCOME')}>
          Entradas
        </TabButton>
      </div>

      {items === null ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <EmptyState
            icon={Tag}
            title="Nenhuma categoria"
            description={`Você ainda não tem categorias de ${tab === 'EXPENSE' ? 'saída' : 'entrada'}.`}
            action={
              <Button onClick={() => setCreating(true)}>
                <Plus className="h-4 w-4" />
                Criar primeira
              </Button>
            }
          />
        </Card>
      ) : (
        <motion.div
          layout
          className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
        >
          {filtered.map((c) => (
            <motion.div
              key={c.id}
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.18 }}
              className={cn(
                'group surface flex items-center gap-3 px-4 py-3 transition-colors',
                !c.isActive && 'opacity-60',
              )}
            >
              <span
                className="h-9 w-9 shrink-0 rounded-xl ring-1 ring-inset ring-black/5"
                style={{ backgroundColor: c.color + '22' }}
              >
                <span
                  className="block h-full w-full rounded-xl"
                  style={{ backgroundColor: c.color, opacity: 0.85 }}
                />
              </span>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium text-slate-900">{c.name}</div>
                <div className="mt-0.5 flex items-center gap-1.5">
                  {!c.isActive && <Badge tone="muted">inativa</Badge>}
                </div>
              </div>
              <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                <Button variant="ghost" size="icon" onClick={() => setEditing(c)} aria-label="Editar">
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleActive(c)}
                  className="text-xs"
                >
                  {c.isActive ? 'Inativar' : 'Ativar'}
                </Button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      <CategoryFormModal
        open={creating || !!editing}
        category={editing}
        defaultType={tab}
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

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'relative rounded-lg px-4 py-1.5 text-sm font-medium transition-colors',
        active ? 'text-white' : 'text-slate-600 hover:text-slate-900',
      )}
    >
      {active && (
        <motion.span
          layoutId="categoryTab"
          className="absolute inset-0 rounded-lg bg-brand-900"
          transition={{ type: 'spring', stiffness: 400, damping: 35 }}
        />
      )}
      <span className="relative">{children}</span>
    </button>
  );
}

function CategoryFormModal({
  open,
  category,
  defaultType,
  onClose,
  onSaved,
}: {
  open: boolean;
  category: Category | null;
  defaultType: CategoryType;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState('');
  const [type, setType] = useState<CategoryType>(defaultType);
  const [color, setColor] = useState(PRESET_COLORS[0]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setName(category?.name ?? '');
      setType(category?.type ?? defaultType);
      setColor(category?.color ?? PRESET_COLORS[0]);
    }
  }, [open, category, defaultType]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      if (category) {
        await apiJson(`/categories/${category.id}`, {
          method: 'PATCH',
          body: JSON.stringify({ name, color }),
        });
        toast.success('Categoria atualizada');
      } else {
        await apiJson('/categories', {
          method: 'POST',
          body: JSON.stringify({ name, type, color }),
        });
        toast.success('Categoria criada');
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
      title={category ? 'Editar categoria' : 'Nova categoria'}
      description={category ? 'Atualize nome ou cor.' : 'Crie uma categoria para organizar seus lançamentos.'}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} type="button">
            Cancelar
          </Button>
          <Button form="category-form" type="submit" loading={saving}>
            Salvar
          </Button>
        </>
      }
    >
      <form id="category-form" onSubmit={save} className="space-y-4">
        <div>
          <Label htmlFor="cat-name">Nome</Label>
          <Input
            id="cat-name"
            required
            maxLength={60}
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
          />
        </div>

        {!category && (
          <div>
            <Label>Tipo</Label>
            <div className="grid grid-cols-2 gap-2">
              {(['EXPENSE', 'INCOME'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className={cn(
                    'rounded-xl border px-3 py-2.5 text-sm font-medium transition-colors focus-ring',
                    type === t
                      ? 'border-brand-900 bg-brand-50 text-brand-900'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50',
                  )}
                >
                  {t === 'EXPENSE' ? 'Saída' : 'Entrada'}
                </button>
              ))}
            </div>
          </div>
        )}

        <div>
          <Label>Cor</Label>
          <div className="grid grid-cols-6 gap-2">
            {PRESET_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={cn(
                  'aspect-square rounded-xl ring-2 ring-offset-2 ring-offset-white transition-transform focus-ring',
                  color === c ? 'ring-brand-900 scale-105' : 'ring-transparent hover:scale-105',
                )}
                style={{ backgroundColor: c }}
                aria-label={`Cor ${c}`}
              />
            ))}
          </div>
        </div>
      </form>
    </Modal>
  );
}
