'use client';

import { motion } from 'framer-motion';
import { LayoutDashboard, LogOut, ShieldCheck, Users, Wallet } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { apiFetch } from '@/lib/api';
import { cn } from '@/lib/cn';
import type { Session } from '@/lib/session';

const NAV = [
  { href: '/admin', label: 'Visão geral', icon: LayoutDashboard, exact: true },
  { href: '/admin/households', label: 'Casas / Assinaturas', icon: Wallet },
  { href: '/admin/users', label: 'Usuários', icon: Users },
];

export function AdminShell({ session, children }: { session: Session; children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  async function logout() {
    try {
      await apiFetch('/auth/logout', { method: 'POST' });
      toast.success('Sessão encerrada');
    } finally {
      router.replace('/admin/login');
      router.refresh();
    }
  }

  return (
    <div className="min-h-screen bg-brand-950 text-white">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-brand-950/85 backdrop-blur">
        <div className="container flex h-16 items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-8">
            <Link href="/admin" className="flex shrink-0 items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/15 ring-1 ring-emerald-400/30">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
              </div>
              <div className="leading-tight">
                <div className="text-[10px] font-medium uppercase tracking-wider text-emerald-400">
                  Saldocasa
                </div>
                <div className="font-display text-sm font-semibold tracking-tight">Admin</div>
              </div>
            </Link>
            <nav className="hidden gap-1 md:flex">
              {NAV.map((item) => {
                const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'relative inline-flex items-center gap-2 whitespace-nowrap rounded-lg px-3 py-1.5 text-sm transition-colors',
                      active ? 'text-white' : 'text-white/50 hover:text-white',
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                    {active && (
                      <motion.span
                        layoutId="adminNavIndicator"
                        className="absolute inset-x-2 -bottom-[17px] h-0.5 rounded-full bg-emerald-400"
                        transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                      />
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden text-right leading-tight sm:block">
              <div className="text-sm font-medium">{session.user.name}</div>
              <div className="text-xs text-white/50">{session.user.email}</div>
            </div>
            <button
              onClick={logout}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-white/60 transition hover:bg-white/5 hover:text-white"
              aria-label="Sair"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="container py-8">
        <motion.div
          key={pathname}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
}
