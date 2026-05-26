import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (session) redirect('/dashboard');
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">saldocasa</h1>
          <p className="mt-1 text-sm text-slate-500">Controle financeiro da casa</p>
        </div>
        {children}
      </div>
    </main>
  );
}
