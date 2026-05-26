import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (session) redirect('/dashboard');

  return (
    <div className="relative grid min-h-screen lg:grid-cols-2">
      {/* Lado esquerdo: brand */}
      <div className="relative hidden overflow-hidden bg-brand-950 text-white lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            background:
              'radial-gradient(800px 400px at 10% 10%, rgba(86,114,159,0.25), transparent 60%), radial-gradient(600px 400px at 90% 90%, rgba(15,26,46,0.6), transparent 60%)',
          }}
        />
        <div className="relative">
          <div className="inline-flex items-center gap-2 font-display text-lg font-semibold tracking-tight">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 ring-1 ring-white/20">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
            </span>
            saldocasa
          </div>
        </div>
        <div className="relative max-w-md">
          <h2 className="font-display text-3xl font-semibold leading-tight tracking-tight">
            A casa toda no azul.
            <br />
            Sem planilha. Sem fricção.
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-white/70">
            Entradas, saídas, categorias, orçamento e relatórios — em um único lugar, isolado por
            família, com a segurança que finanças pedem.
          </p>
        </div>
        <div className="relative text-xs text-white/50">© {new Date().getFullYear()} saldocasa</div>
      </div>

      {/* Lado direito: form */}
      <div className="flex items-center justify-center px-4 py-12 sm:px-8">
        <div className="w-full max-w-sm">
          <div className="mb-8 text-center lg:hidden">
            <h1 className="font-display text-xl font-semibold text-slate-900">saldocasa</h1>
            <p className="mt-1 text-sm text-slate-500">Controle financeiro da casa</p>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
