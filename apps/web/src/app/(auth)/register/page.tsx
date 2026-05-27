'use client';

import { ArrowRight, CheckCircle2, Home, Lock, Mail, Sparkles, User } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ApiError, apiJson } from '@/lib/api';
import { cn } from '@/lib/cn';
import { formatMoney } from '@/lib/format';

type Tier = 'FREE' | 'PRO' | 'PRO_PLUS';

const PLAN_INFO: Record<Exclude<Tier, 'FREE'>, { name: string; priceCents: number; tagline: string }> = {
  PRO: {
    name: 'Pro',
    priceCents: 2990,
    tagline: 'Recorrências, orçamentos, relatórios completos e exportação.',
  },
  PRO_PLUS: {
    name: 'Pro+',
    priceCents: 8990,
    tagline: 'Tudo do Pro + até 5 membros da família compartilhando.',
  },
};

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const upgradeRaw = searchParams.get('upgrade');
  const upgrade =
    upgradeRaw === 'PRO' || upgradeRaw === 'PRO_PLUS' ? (upgradeRaw as 'PRO' | 'PRO_PLUS') : null;
  const planInfo = upgrade ? PLAN_INFO[upgrade] : null;

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [householdName, setHouseholdName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await apiJson('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          name,
          email,
          password,
          householdName: householdName || undefined,
        }),
      });

      // Se selecionou plano pago, dispara o Stripe Checkout
      if (upgrade) {
        try {
          const { url } = await apiJson<{ url: string }>('/billing/checkout', {
            method: 'POST',
            body: JSON.stringify({ tier: upgrade }),
          });
          toast.success('Conta criada! Finalize o pagamento.');
          window.location.href = url;
          return;
        } catch (err) {
          // Falha no checkout: usuário foi criado mas não pagou, leva pro dashboard com aviso
          toast.error(
            err instanceof ApiError
              ? `Conta criada, mas falhou ao iniciar pagamento: ${err.message}`
              : 'Conta criada. Tente assinar de novo em Configurações.',
          );
          router.replace('/settings/billing?upgrade=' + upgrade);
          router.refresh();
          return;
        }
      }

      toast.success('Casa criada! Escolha seu plano.');
      router.replace('/pricing');
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Falha no cadastro');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="animate-fade-in-up">
      <h2 className="font-display text-2xl font-semibold tracking-tight text-slate-900">
        Criar conta
      </h2>
      <p className="mt-1 text-sm text-slate-500">
        {planInfo
          ? 'Após criar a conta você será levado ao pagamento.'
          : 'Sua casa financeira em 30 segundos.'}
      </p>

      {planInfo && (
        <div
          className={cn(
            'mt-5 rounded-xl border bg-gradient-to-br p-4',
            upgrade === 'PRO'
              ? 'border-brand-900/30 from-brand-50 to-white'
              : 'border-emerald-200 from-emerald-50 to-white',
          )}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-slate-500">
                <Sparkles className="h-3 w-3" />
                Plano selecionado
              </div>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="font-display text-lg font-semibold text-slate-900">
                  {planInfo.name}
                </span>
                <span className="text-sm text-slate-500 tabular-nums">
                  {formatMoney(planInfo.priceCents / 100)}<span className="text-xs"> /mês</span>
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-600">{planInfo.tagline}</p>
            </div>
            <Link
              href="/pricing"
              className="shrink-0 text-xs text-slate-500 underline-offset-4 hover:underline"
            >
              Trocar
            </Link>
          </div>
        </div>
      )}

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <div>
          <Label htmlFor="name">Seu nome</Label>
          <div className="relative">
            <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              id="name"
              required
              minLength={2}
              maxLength={80}
              autoComplete="name"
              className="pl-9"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="email">E-mail</Label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              id="email"
              type="email"
              required
              autoComplete="email"
              className="pl-9"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="password">Senha</Label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              id="password"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              className="pl-9"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <p className="mt-1.5 text-xs text-slate-500">Mínimo 8 caracteres.</p>
        </div>

        <div>
          <Label htmlFor="household">
            Nome da casa <span className="font-normal text-slate-400">(opcional)</span>
          </Label>
          <div className="relative">
            <Home className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              id="household"
              maxLength={80}
              placeholder="Casa Principal"
              className="pl-9"
              value={householdName}
              onChange={(e) => setHouseholdName(e.target.value)}
            />
          </div>
        </div>

        {error && (
          <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700 ring-1 ring-inset ring-rose-200">
            {error}
          </p>
        )}

        <Button type="submit" loading={loading} className="w-full">
          {planInfo ? (
            <>
              <CheckCircle2 className="h-4 w-4" />
              Criar conta e pagar
            </>
          ) : (
            <>
              Criar conta
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>

        {!planInfo && (
          <p className="text-center text-xs text-slate-500">
            Começa no plano <strong className="text-slate-700">Free</strong>.{' '}
            <Link href="/pricing" className="text-slate-700 underline-offset-4 hover:underline">
              Ver planos pagos
            </Link>
          </p>
        )}
      </form>

      <p className="mt-6 text-center text-sm text-slate-600">
        Já tem conta?{' '}
        <Link href="/login" className="font-medium text-slate-900 underline-offset-4 hover:underline">
          Entrar
        </Link>
      </p>
    </div>
  );
}
