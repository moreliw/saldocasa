'use client';

import { Crown, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/cn';
import { apiJson } from '@/lib/api';

type Tier = 'FREE' | 'PRO' | 'PRO_PLUS';

const STYLES: Record<Tier, { className: string; label: string; icon?: typeof Crown }> = {
  FREE: {
    className:
      'bg-slate-100 text-slate-600 ring-slate-200 hover:bg-slate-200/70',
    label: 'Free',
  },
  PRO: {
    className:
      'bg-brand-900 text-white ring-brand-900/50 hover:bg-brand-800',
    label: 'Pro',
    icon: Sparkles,
  },
  PRO_PLUS: {
    className:
      'bg-gradient-to-br from-amber-500 to-amber-600 text-white ring-amber-500/40 hover:from-amber-600 hover:to-amber-700',
    label: 'Pro+',
    icon: Crown,
  },
};

/**
 * Pílula com o plano atual da casa. Clicável: vai pra /settings/billing
 * (ou /pricing se FREE — funil de upgrade).
 */
export function PlanBadge({ className }: { className?: string }) {
  const [tier, setTier] = useState<Tier | null>(null);

  useEffect(() => {
    apiJson<{ tier: Tier }>('/billing/state')
      .then((d) => setTier(d.tier))
      .catch(() => setTier('FREE'));
  }, []);

  if (!tier) return null;
  const style = STYLES[tier];
  const Icon = style.icon;
  const href = tier === 'FREE' ? '/pricing' : '/settings/billing';

  return (
    <Link
      href={href}
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset transition-colors focus-ring',
        style.className,
        className,
      )}
      title={tier === 'FREE' ? 'Conheça os planos pagos' : 'Gerenciar assinatura'}
    >
      {Icon && <Icon className="h-3 w-3" />}
      {style.label}
    </Link>
  );
}
