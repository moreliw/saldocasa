import Image from 'next/image';
import Link from 'next/link';

export function LandingFooter() {
  return (
    <footer className="border-t border-slate-200/80 bg-[#f7f6f1] pt-14 pb-10">
      <div className="container">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-2.5">
              <Image
                src="/brand/logo-mark.png"
                alt=""
                width={32}
                height={32}
                className="rounded-lg"
              />
              <span className="font-display text-base font-semibold tracking-tight">
                saldocasa
              </span>
            </div>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-slate-600">
              Um diário de finanças domésticas. Discreto, seguro, feito pra durar mais que a
              moda do mês.
            </p>
          </div>

          <div>
            <div className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
              Produto
            </div>
            <ul className="mt-4 space-y-2 text-sm text-slate-700">
              <li>
                <a href="#por-que" className="hover:text-slate-950">
                  Por que existe
                </a>
              </li>
              <li>
                <a href="#como-funciona" className="hover:text-slate-950">
                  Como funciona
                </a>
              </li>
              <li>
                <a href="#planos" className="hover:text-slate-950">
                  Planos
                </a>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-slate-950">
                  Comparativo completo
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <div className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
              Conta
            </div>
            <ul className="mt-4 space-y-2 text-sm text-slate-700">
              <li>
                <Link href="/login" className="hover:text-slate-950">
                  Entrar
                </Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-slate-950">
                  Criar conta
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-start justify-between gap-3 border-t border-slate-200/80 pt-6 text-xs text-slate-500 sm:flex-row sm:items-center">
          <span>© {new Date().getFullYear()} saldocasa. Feito em São Paulo.</span>
          <span className="font-serif italic">A casa toda no azul.</span>
        </div>
      </div>
    </footer>
  );
}
