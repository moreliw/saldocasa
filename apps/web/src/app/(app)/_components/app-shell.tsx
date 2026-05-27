'use client';

import { motion } from 'framer-motion';
import {
  ArrowLeftRight,
  Repeat,
  LayoutDashboard,
  LogOut,
  Menu,
  PieChart,
  Settings,
  Tag,
  Target,
  Wallet,
  X,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { PlanBadge } from '@/components/plan-badge';
import { apiFetch } from '@/lib/api';
import { cn } from '@/lib/cn';
import type { Session } from '@/lib/session';

const NAV: Array<{ href: string; label: string; icon: typeof LayoutDashboard; soon?: boolean }> = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/transactions', label: 'Lançamentos', icon: ArrowLeftRight },
  { href: '/recurring', label: 'Recorrências', icon: Repeat },
  { href: '/budgets', label: 'Orçamentos', icon: Target },
  { href: '/categories', label: 'Categorias', icon: Tag },
  { href: '/payment-methods', label: 'Formas de pagamento', icon: Wallet },
  { href: '/reports', label: 'Relatórios', icon: PieChart },
];

export function AppShell({
  session,
  children,
}: {
  session: Session;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  async function logout() {
    setLoggingOut(true);
    try {
      await apiFetch('/auth/logout', { method: 'POST' });
      toast.success('Sessão encerrada');
    } finally {
      router.replace('/login');
      router.refresh();
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/85 backdrop-blur">
        <div className="container flex h-16 items-center justify-between gap-4">
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="group flex items-center gap-2.5">
              <Image
                src="/brand/logo-mark.png"
                alt=""
                width={34}
                height={34}
                priority
                className="transition-transform group-hover:scale-105"
              />
              <span className="font-display text-base font-semibold tracking-tight text-slate-900">
                saldocasa
              </span>
            </Link>
            <nav className="hidden gap-1 md:flex">
              {NAV.map((item) => {
                const active =
                  pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.soon ? '#' : item.href}
                    aria-current={active ? 'page' : undefined}
                    onClick={(e) => item.soon && e.preventDefault()}
                    className={cn(
                      'relative inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm transition-colors',
                      active
                        ? 'text-slate-900'
                        : 'text-slate-500 hover:text-slate-900',
                      item.soon && 'cursor-not-allowed text-slate-400 hover:text-slate-400',
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                    {item.soon && (
                      <span className="ml-1 rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-slate-500">
                        em breve
                      </span>
                    )}
                    {active && !item.soon && (
                      <motion.span
                        layoutId="navIndicator"
                        className="absolute inset-x-2 -bottom-[17px] h-0.5 rounded-full bg-brand-900"
                        transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                      />
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <PlanBadge className="hidden sm:inline-flex" />
            <div className="hidden text-right sm:block">
              <div className="text-sm font-medium text-slate-900">{session.user.name}</div>
              <div className="text-xs text-slate-500">{session.household.name}</div>
            </div>
            <Button asChild variant="ghost" size="icon" aria-label="Configurações">
              <Link href="/settings">
                <Settings className="h-4 w-4" />
              </Link>
            </Button>
            <Button variant="ghost" size="icon" onClick={logout} disabled={loggingOut} aria-label="Sair">
              <LogOut className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setOpen((v) => !v)}
              aria-label="Menu"
            >
              {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Drawer mobile */}
        {open && (
          <div className="border-t border-slate-200 bg-white md:hidden">
            <div className="container flex items-center justify-between gap-2 border-b border-slate-100 py-3">
              <div className="min-w-0">
                <div className="truncate text-sm font-medium text-slate-900">{session.user.name}</div>
                <div className="truncate text-xs text-slate-500">{session.household.name}</div>
              </div>
              <PlanBadge />
            </div>
            <nav className="container flex flex-col py-2">
              {NAV.map((item) => {
                const Icon = item.icon;
                const active = pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.soon ? '#' : item.href}
                    onClick={(e) => {
                      if (item.soon) e.preventDefault();
                      else setOpen(false);
                    }}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm',
                      active ? 'bg-slate-100 text-slate-900' : 'text-slate-600 hover:bg-slate-50',
                      item.soon && 'cursor-not-allowed text-slate-400',
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                    {item.soon && (
                      <span className="ml-auto rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-slate-500">
                        em breve
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>
        )}
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
