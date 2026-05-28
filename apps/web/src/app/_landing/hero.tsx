import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { DashboardMock } from './dashboard-mock';
import { HeroReveal } from './hero-reveal';

export function LandingHero() {
  return (
    <section className="relative overflow-hidden">
      {/* Plano de fundo: textura sutil de ruído + linha de horizonte */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[640px]"
        style={{
          background:
            'radial-gradient(1200px 500px at 80% -20%, rgba(15,26,46,0.06), transparent 60%)',
        }}
      />
      <div className="container relative grid items-center gap-12 py-20 lg:grid-cols-[1.05fr_1fr] lg:py-28">
        <div>
          <HeroReveal>
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/70 px-3 py-1 text-xs font-medium text-slate-600">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Em produção · família real, números reais
            </div>

            <h1 className="mt-6 font-display text-[clamp(2.4rem,5.5vw,4.4rem)] font-semibold leading-[1.02] tracking-[-0.02em] text-slate-950">
              Em casa todo mundo gasta.
              <br />
              <span className="font-serif italic font-normal text-slate-700">
                Pouca gente sabe quanto.
              </span>
            </h1>

            <p className="mt-6 max-w-lg text-[1.05rem] leading-relaxed text-slate-600">
              O saldocasa é um diário de finanças domésticas. Você lança em três toques,
              o sistema cuida do resto — categorias, recorrências, orçamentos, evolução
              mês a mês. Sem planilha. Sem dashboard de empresa.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Link
                href="/register"
                className="group inline-flex items-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
              >
                Criar minha casa
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="/login"
                className="rounded-xl border border-slate-300/80 bg-white px-5 py-3 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:text-slate-900"
              >
                Já tenho conta
              </Link>
            </div>

            <p className="mt-5 text-xs text-slate-500">
              Free pra sempre · sem cartão · 50 lançamentos/mês.
            </p>
          </HeroReveal>
        </div>

        <div className="relative lg:-mr-8">
          <DashboardMock />
        </div>
      </div>
    </section>
  );
}
