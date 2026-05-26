'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { apiFetch } from '@/lib/api';
import type { Session } from '@/lib/session';

const NAV = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/transactions', label: 'Lançamentos', soon: true },
  { href: '/categories', label: 'Categorias', soon: true },
  { href: '/payment-methods', label: 'Formas de pagamento', soon: true },
  { href: '/reports', label: 'Relatórios', soon: true },
];

export function AppShell({
  session,
  children,
}: {
  session: Session;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  async function logout() {
    setLoggingOut(true);
    try {
      await apiFetch('/auth/logout', { method: 'POST' });
    } finally {
      router.replace('/login');
      router.refresh();
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="font-semibold tracking-tight text-slate-900">
              saldocasa
            </Link>
            <nav className="hidden gap-1 md:flex">
              {NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.soon ? '#' : item.href}
                  className={`relative rounded-md px-3 py-1.5 text-sm ${
                    item.soon
                      ? 'cursor-not-allowed text-slate-400'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                  aria-disabled={item.soon}
                  onClick={(e) => item.soon && e.preventDefault()}
                >
                  {item.label}
                  {item.soon && (
                    <span className="ml-1.5 rounded bg-slate-100 px-1 py-0.5 text-[10px] font-medium uppercase tracking-wide text-slate-500">
                      em breve
                    </span>
                  )}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <div className="text-sm font-medium text-slate-900">{session.user.name}</div>
              <div className="text-xs text-slate-500">{session.household.name}</div>
            </div>
            <button onClick={logout} disabled={loggingOut} className="btn-ghost">
              {loggingOut ? 'Saindo…' : 'Sair'}
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}
