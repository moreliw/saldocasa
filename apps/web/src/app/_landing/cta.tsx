import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export function LandingCta() {
  return (
    <section className="bg-[#f7f6f1] pb-24">
      <div className="container">
        <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white px-8 py-16 text-center md:px-12 md:py-20">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 -top-32 h-64 opacity-60"
            style={{
              background:
                'radial-gradient(600px 200px at 50% 100%, rgba(16,185,129,0.15), transparent 70%)',
            }}
          />
          <div className="relative">
            <h2 className="mx-auto max-w-3xl font-display text-[clamp(2rem,4.4vw,3.6rem)] font-semibold leading-[1.05] tracking-tight text-slate-950">
              No fim do mês,{' '}
              <span className="font-serif italic font-normal text-slate-600">
                não dá pra fingir que não viu.
              </span>
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-slate-600">
              Comece hoje. Em uma semana você já tem dado pra olhar de verdade.
            </p>
            <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/register"
                className="group inline-flex items-center gap-2 rounded-xl bg-slate-950 px-6 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
              >
                Criar minha casa
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="#planos"
                className="rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:text-slate-900"
              >
                Ver planos
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
