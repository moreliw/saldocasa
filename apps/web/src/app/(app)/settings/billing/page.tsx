'use client';

import { ArrowUpRight, CheckCircle2, ExternalLink, Sparkles } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PageHeader } from '@/components/ui/page-header';
import { Skeleton } from '@/components/ui/skeleton';
import { ApiError, apiJson } from '@/lib/api';
import { cn } from '@/lib/cn';
import { formatDate, formatMoney } from '@/lib/format';

interface PlanInfo {
  tier: 'FREE' | 'PRO' | 'PRO_PLUS';
  name: string;
  tagline: string;
  monthlyPriceCents: number;
  highlights: string[];
}

interface BillingState {
  tier: 'FREE' | 'PRO' | 'PRO_PLUS';
  status: string | null;
  currentPeriodEnd: string | null;
  hasStripeCustomer: boolean;
  hasActiveSubscription: boolean;
  billingEnabled: boolean;
  plans: PlanInfo[];
}

const TIER_LABEL: Record<string, string> = {
  FREE: 'Free',
  PRO: 'Pro',
  PRO_PLUS: 'Pro+',
};

export default function BillingPage() {
  const searchParams = useSearchParams();
  const upgradeParam = searchParams.get('upgrade') as 'PRO' | 'PRO_PLUS' | null;
  const [state, setState] = useState<BillingState | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  async function load() {
    try {
      const s = await apiJson<BillingState>('/billing/state');
      setState(s);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Erro');
    }
  }

  useEffect(() => {
    load();
  }, []);

  // Trigger automático se vier com ?upgrade=PRO
  useEffect(() => {
    if (upgradeParam && state && state.tier === 'FREE') {
      void checkout(upgradeParam);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [upgradeParam, state?.tier]);

  async function checkout(tier: 'PRO' | 'PRO_PLUS') {
    setBusy(tier);
    try {
      const { url } = await apiJson<{ url: string }>('/billing/checkout', {
        method: 'POST',
        body: JSON.stringify({ tier }),
      });
      window.location.href = url;
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Erro');
      setBusy(null);
    }
  }

  async function openPortal() {
    setBusy('portal');
    try {
      const { url } = await apiJson<{ url: string }>('/billing/portal', { method: 'POST' });
      window.location.href = url;
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Erro');
      setBusy(null);
    }
  }

  if (!state) {
    return (
      <div className="space-y-6">
        <PageHeader title="Assinatura" description="Gerencie seu plano." />
        <Skeleton className="h-40" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Assinatura"
        description="Gerencie o plano da sua casa."
        action={
          state.hasStripeCustomer && (
            <Button onClick={openPortal} loading={busy === 'portal'} variant="secondary">
              <ExternalLink className="h-4 w-4" />
              Gerenciar
            </Button>
          )
        }
      />

      {!state.billingEnabled && (
        <Card className="border-amber-200 bg-amber-50">
          <div className="p-4 text-sm text-amber-800">
            Billing está temporariamente desativado. Todos os recursos liberados como FREE.
          </div>
        </Card>
      )}

      {/* Plano atual */}
      <Card>
        <CardHeader>
          <CardTitle>Plano atual</CardTitle>
          <CardDescription>O que está ativo agora na sua casa.</CardDescription>
        </CardHeader>
        <div className="grid gap-4 px-6 pb-6 sm:grid-cols-3">
          <div>
            <div className="text-xs text-slate-500">Plano</div>
            <div className="mt-1 flex items-center gap-2">
              <span className="font-display text-xl font-semibold text-slate-900">
                {TIER_LABEL[state.tier]}
              </span>
              {state.status && (
                <Badge tone={state.status === 'ACTIVE' ? 'positive' : 'warning'}>
                  {state.status === 'ACTIVE' ? 'ativo' : state.status.toLowerCase()}
                </Badge>
              )}
            </div>
          </div>
          {state.currentPeriodEnd && (
            <div>
              <div className="text-xs text-slate-500">Próxima cobrança</div>
              <div className="mt-1 text-sm font-medium text-slate-900">
                {formatDate(state.currentPeriodEnd)}
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Outros planos pra upgrade */}
      <div className="grid gap-4 lg:grid-cols-3">
        {state.plans.map((plan) => {
          const current = plan.tier === state.tier;
          const isPopular = plan.tier === 'PRO';
          return (
            <div
              key={plan.tier}
              className={cn(
                'flex flex-col rounded-2xl border bg-white p-5 shadow-card transition',
                current
                  ? 'border-emerald-600 ring-1 ring-emerald-600/30'
                  : isPopular
                  ? 'border-brand-900/20'
                  : 'border-slate-200',
              )}
            >
              <div className="flex items-center justify-between">
                <h3 className="font-display text-lg font-semibold text-slate-900">{plan.name}</h3>
                {current && <Badge tone="positive">Seu plano</Badge>}
                {!current && isPopular && (
                  <Badge tone="info">
                    <Sparkles className="h-3 w-3" />
                    Popular
                  </Badge>
                )}
              </div>
              <p className="mt-1 text-sm text-slate-500">{plan.tagline}</p>
              <div className="mt-4">
                {plan.monthlyPriceCents === 0 ? (
                  <span className="font-display text-2xl font-semibold text-slate-900">Grátis</span>
                ) : (
                  <span className="font-display text-2xl font-semibold text-slate-900 tabular-nums">
                    {formatMoney(plan.monthlyPriceCents / 100)}
                    <span className="text-sm font-normal text-slate-500"> /mês</span>
                  </span>
                )}
              </div>
              <ul className="mt-4 space-y-2 text-sm text-slate-700">
                {plan.highlights.map((h) => (
                  <li key={h} className="flex gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                    {h}
                  </li>
                ))}
              </ul>
              <div className="mt-6 flex-1" />
              {plan.tier === 'FREE' ? null : current ? (
                <Button variant="secondary" disabled className="w-full">
                  Plano atual
                </Button>
              ) : (
                <Button
                  onClick={() => checkout(plan.tier as 'PRO' | 'PRO_PLUS')}
                  loading={busy === plan.tier}
                  className="w-full"
                  variant={isPopular ? 'primary' : 'secondary'}
                >
                  Mudar para {plan.name}
                  <ArrowUpRight className="h-4 w-4" />
                </Button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

