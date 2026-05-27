import Image from 'next/image';
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
          <Image
            src="/brand/logo-mark.png"
            alt="saldocasa"
            width={56}
            height={56}
            priority
            className="rounded-2xl bg-white/95 p-1.5 shadow-elevated"
          />
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
          <div className="mb-8 flex justify-center lg:hidden">
            <Image src="/brand/logo-full.png" alt="saldocasa" width={180} height={64} priority />
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
