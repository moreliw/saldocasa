'use client';

import { ArrowRight, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { apiJson } from '@/lib/api';

/**
 * Banner discreto exibido apenas quando o household está no plano FREE.
 * Carrega billing/state client-side pra não atrapalhar o SSR.
 */
export function UpgradeBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    apiJson<{ tier: 'FREE' | 'PRO' | 'PRO_PLUS' }>('/billing/state')
      .then((d) => setShow(d.tier === 'FREE'))
      .catch(() => undefined);
  }, []);

  if (!show) return null;

  return (
    <Link
      href="/pricing"
      className="group flex items-center justify-between gap-3 rounded-2xl border border-brand-900/15 bg-gradient-to-r from-brand-50 via-white to-emerald-50 px-5 py-3.5 shadow-card transition-shadow hover:shadow-elevated"
    >
      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-900 text-white">
          <Sparkles className="h-4 w-4" />
        </span>
        <div className="min-w-0">
          <div className="text-sm font-medium text-slate-900">
            Desbloqueie tudo no <span className="font-semibold">Pro</span> por R$ 29,90/mês
          </div>
          <div className="hidden text-xs text-slate-600 sm:block">
            Recorrências, orçamentos, relatórios completos e exportação ilimitada.
          </div>
        </div>
      </div>
      <span className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-brand-900 group-hover:gap-2 transition-all">
        Ver planos
        <ArrowRight className="h-4 w-4" />
      </span>
    </Link>
  );
}
