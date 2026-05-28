import Link from 'next/link';
import { Check } from 'lucide-react';

const PLANS = [
  {
    name: 'Free',
    tagline: 'Pra experimentar.',
    price: 0,
    cta: 'Começar grátis',
    href: '/register',
    features: ['50 lançamentos / mês', 'Dashboard mensal', 'Categorias e formas', '1 usuário'],
  },
  {
    name: 'Pro',
    tagline: 'Pra organizar a casa.',
    price: 29.9,
    cta: 'Assinar Pro',
    href: '/register?upgrade=PRO',
    featured: true,
    features: [
      'Lançamentos ilimitados',
      'Recorrências',
      'Orçamentos com alerta',
      'Relatórios completos',
      'Exportar CSV',
    ],
  },
  {
    name: 'Pro+',
    tagline: 'Pra família inteira.',
    price: 89.9,
    cta: 'Assinar Pro+',
    href: '/register?upgrade=PRO_PLUS',
    features: ['Tudo do Pro', 'Até 5 membros', 'Login individual', 'Suporte prioritário'],
  },
];

export function LandingPricing() {
  return (
    <section id="planos" className="bg-[#f7f6f1] py-24">
      <div className="container">
        <div className="mx-auto max-w-2xl text-center">
          <div className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
            Planos
          </div>
          <h2 className="mt-4 font-display text-[clamp(2rem,4vw,3.2rem)] font-semibold leading-[1.05] tracking-tight text-slate-950">
            Comece grátis.{' '}
            <span className="font-serif italic font-normal text-slate-700">
              Pague quando fizer sentido.
            </span>
          </h2>
          <p className="mt-4 text-base text-slate-600">
            Sem trial enganoso, sem cartão pra cadastrar. Você só passa pro Pro quando perceber
            que vale.
          </p>
        </div>

        <div className="mt-14 grid gap-5 lg:grid-cols-3">
          {PLANS.map((p) => (
            <PlanCard key={p.name} plan={p} />
          ))}
        </div>
      </div>
    </section>
  );
}

function PlanCard({ plan }: { plan: (typeof PLANS)[number] }) {
  return (
    <div
      className={`relative rounded-2xl border p-7 transition ${
        plan.featured
          ? 'border-slate-950 bg-slate-950 text-white shadow-elevated'
          : 'border-slate-200 bg-white text-slate-900 hover:border-slate-300'
      }`}
    >
      {plan.featured && (
        <span className="absolute -top-3 left-7 rounded-full bg-emerald-400 px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-slate-950">
          Mais escolhido
        </span>
      )}

      <div className="flex items-baseline justify-between">
        <h3 className="font-display text-xl font-semibold tracking-tight">{plan.name}</h3>
      </div>
      <p className={`mt-1 text-sm ${plan.featured ? 'text-white/60' : 'text-slate-500'}`}>
        {plan.tagline}
      </p>

      <div className="mt-6 flex items-baseline gap-1.5">
        <span className="font-display text-4xl font-semibold tabular-nums tracking-tight">
          {plan.price === 0 ? 'R$ 0' : `R$ ${plan.price.toFixed(2).replace('.', ',')}`}
        </span>
        <span className={`text-sm ${plan.featured ? 'text-white/50' : 'text-slate-500'}`}>
          {plan.price === 0 ? 'pra sempre' : '/ mês'}
        </span>
      </div>

      <ul className="mt-6 space-y-2.5">
        {plan.features.map((f) => (
          <li key={f} className="flex items-start gap-2 text-sm">
            <Check
              className={`mt-0.5 h-4 w-4 shrink-0 ${
                plan.featured ? 'text-emerald-400' : 'text-emerald-600'
              }`}
            />
            <span className={plan.featured ? 'text-white/85' : 'text-slate-700'}>{f}</span>
          </li>
        ))}
      </ul>

      <Link
        href={plan.href}
        className={`mt-8 block w-full rounded-xl px-4 py-2.5 text-center text-sm font-medium transition ${
          plan.featured
            ? 'bg-white text-slate-950 hover:bg-slate-100'
            : 'bg-slate-950 text-white hover:bg-slate-800'
        }`}
      >
        {plan.cta}
      </Link>
    </div>
  );
}
