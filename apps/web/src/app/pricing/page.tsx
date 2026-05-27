import { Check, Sparkles } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/cn';
import { getSession } from '@/lib/session';

export const dynamic = 'force-dynamic';

const PLANS = [
  {
    tier: 'FREE' as const,
    name: 'Free',
    tagline: 'Para experimentar.',
    price: 0,
    features: [
      'Até 50 lançamentos por mês',
      'Dashboard com saldo do mês',
      'Categorias e formas de pagamento',
      'Apenas 1 usuário',
    ],
    cta: 'Começar grátis',
  },
  {
    tier: 'PRO' as const,
    name: 'Pro',
    tagline: 'Para quem quer organizar a casa.',
    price: 2990,
    popular: true,
    features: [
      'Lançamentos ilimitados',
      'Recorrências (salário, contas, assinaturas)',
      'Orçamentos por categoria com alertas',
      'Relatórios completos',
      'Exportar CSV',
    ],
    cta: 'Assinar Pro',
  },
  {
    tier: 'PRO_PLUS' as const,
    name: 'Pro+',
    tagline: 'Para a família inteira.',
    price: 8990,
    features: [
      'Tudo do Pro',
      'Convidar até 5 membros da família',
      'Cada um com login próprio',
      'Suporte prioritário',
    ],
    cta: 'Assinar Pro+',
  },
];

export default async function PricingPage() {
  const session = await getSession();

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="container flex h-16 items-center justify-between">
          <Link href={session ? '/dashboard' : '/'} className="flex items-center gap-2">
            <Image src="/brand/logo-mark.png" alt="" width={32} height={32} />
            <span className="font-display font-semibold tracking-tight">saldocasa</span>
          </Link>
          <Button asChild variant="ghost" size="sm">
            <Link href={session ? '/dashboard' : '/login'}>
              {session ? 'Dashboard' : 'Entrar'}
            </Link>
          </Button>
        </div>
      </header>

      <main className="container py-12 sm:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="font-display text-3xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
            Escolha o plano da sua casa
          </h1>
          <p className="mt-4 text-base text-slate-600 sm:text-lg">
            Comece grátis. Faça upgrade quando precisar de mais.
            <br className="hidden sm:inline" /> Cancele quando quiser.
          </p>
        </div>

        <div className="mx-auto mt-12 grid max-w-5xl gap-6 lg:grid-cols-3">
          {PLANS.map((plan) => (
            <PlanCard key={plan.tier} plan={plan} loggedIn={!!session} />
          ))}
        </div>

        <div className="mx-auto mt-12 max-w-2xl text-center text-sm text-slate-500">
          Preços em reais (BRL). Cobrado mensalmente, pode cancelar a qualquer momento direto no
          seu painel. Pagamento processado pelo Stripe (cartão de crédito).
        </div>
      </main>
    </div>
  );
}

function PlanCard({
  plan,
  loggedIn,
}: {
  plan: (typeof PLANS)[number];
  loggedIn: boolean;
}) {
  const isPopular = 'popular' in plan && plan.popular;
  return (
    <div
      className={cn(
        'relative flex flex-col rounded-2xl border bg-white p-6 shadow-card',
        isPopular ? 'border-brand-900 shadow-elevated ring-1 ring-brand-900/30' : 'border-slate-200',
      )}
    >
      {isPopular && (
        <span className="absolute -top-3 left-1/2 inline-flex -translate-x-1/2 items-center gap-1 rounded-full bg-brand-900 px-3 py-1 text-xs font-medium text-white shadow">
          <Sparkles className="h-3 w-3" />
          Mais popular
        </span>
      )}

      <div>
        <h3 className="font-display text-xl font-semibold text-slate-900">{plan.name}</h3>
        <p className="mt-1 text-sm text-slate-500">{plan.tagline}</p>
      </div>

      <div className="mt-6 flex items-baseline gap-1.5">
        {plan.price === 0 ? (
          <span className="font-display text-4xl font-semibold text-slate-900">Grátis</span>
        ) : (
          <>
            <span className="text-2xl font-semibold text-slate-900">R$</span>
            <span className="font-display text-5xl font-semibold tracking-tight text-slate-900 tabular-nums">
              {(plan.price / 100).toFixed(2).replace('.', ',')}
            </span>
            <span className="text-sm text-slate-500">/mês</span>
          </>
        )}
      </div>

      <ul className="mt-6 space-y-3 text-sm">
        {plan.features.map((f) => (
          <li key={f} className="flex gap-2 text-slate-700">
            <Check className={cn('mt-0.5 h-4 w-4 shrink-0', isPopular ? 'text-brand-900' : 'text-emerald-600')} />
            <span>{f}</span>
          </li>
        ))}
      </ul>

      <div className="mt-8 flex-1" />

      {plan.tier === 'FREE' ? (
        <Button asChild variant="secondary" className="w-full">
          <Link href={loggedIn ? '/dashboard' : '/register'}>{plan.cta}</Link>
        </Button>
      ) : (
        <Button
          asChild
          variant={isPopular ? 'primary' : 'secondary'}
          className="w-full"
        >
          <Link href={loggedIn ? `/settings/billing?upgrade=${plan.tier}` : `/register?upgrade=${plan.tier}`}>
            {plan.cta}
          </Link>
        </Button>
      )}
    </div>
  );
}
