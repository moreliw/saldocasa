import Image from 'next/image';
import Link from 'next/link';

export function LandingNav() {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/60 bg-[#f7f6f1]/85 backdrop-blur">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <Image
            src="/brand/logo-mark.png"
            alt=""
            width={32}
            height={32}
            priority
            className="rounded-lg"
          />
          <span className="font-display text-base font-semibold tracking-tight">saldocasa</span>
        </Link>

        <nav className="hidden items-center gap-7 text-sm text-slate-600 md:flex">
          <a href="#por-que" className="transition hover:text-slate-900">
            Por que existe
          </a>
          <a href="#como-funciona" className="transition hover:text-slate-900">
            Como funciona
          </a>
          <a href="#planos" className="transition hover:text-slate-900">
            Planos
          </a>
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className="hidden rounded-lg px-3 py-1.5 text-sm text-slate-600 transition hover:text-slate-900 sm:inline-block"
          >
            Entrar
          </Link>
          <Link
            href="/register"
            className="rounded-lg bg-slate-900 px-3.5 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
          >
            Começar grátis
          </Link>
        </div>
      </div>
    </header>
  );
}
