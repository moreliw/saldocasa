import type { SubscriptionTier } from '@prisma/client';

export interface PlanFeatures {
  monthlyTransactionLimit: number | null; // null = ilimitado
  recurring: boolean;
  budgets: boolean;
  csvExport: boolean;
  inviteMembers: boolean;
  maxMembers: number;
  reports: 'basic' | 'full';
}

export interface PlanDefinition {
  tier: SubscriptionTier;
  name: string;
  tagline: string;
  monthlyPriceCents: number; // BRL centavos
  features: PlanFeatures;
  highlights: string[];
}

export const PLANS: Record<SubscriptionTier, PlanDefinition> = {
  FREE: {
    tier: 'FREE',
    name: 'Free',
    tagline: 'Para experimentar.',
    monthlyPriceCents: 0,
    features: {
      monthlyTransactionLimit: 50,
      recurring: false,
      budgets: false,
      csvExport: false,
      inviteMembers: false,
      maxMembers: 1,
      reports: 'basic',
    },
    highlights: [
      'Até 50 lançamentos por mês',
      'Dashboard com saldo, entradas e saídas',
      'Categorias e formas de pagamento',
      'Apenas 1 usuário',
    ],
  },
  PRO: {
    tier: 'PRO',
    name: 'Pro',
    tagline: 'Para quem quer organizar a casa toda.',
    monthlyPriceCents: 2990,
    features: {
      monthlyTransactionLimit: null,
      recurring: true,
      budgets: true,
      csvExport: true,
      inviteMembers: false,
      maxMembers: 1,
      reports: 'full',
    },
    highlights: [
      'Lançamentos ilimitados',
      'Recorrências (salário, contas fixas, assinaturas)',
      'Orçamentos por categoria com alertas',
      'Relatórios completos',
      'Exportar tudo em CSV',
    ],
  },
  PRO_PLUS: {
    tier: 'PRO_PLUS',
    name: 'Pro+',
    tagline: 'Para a família inteira.',
    monthlyPriceCents: 8990,
    features: {
      monthlyTransactionLimit: null,
      recurring: true,
      budgets: true,
      csvExport: true,
      inviteMembers: true,
      maxMembers: 5,
      reports: 'full',
    },
    highlights: [
      'Tudo do Pro',
      'Convidar até 5 membros da família',
      'Cada membro com login próprio',
      'Suporte prioritário',
    ],
  },
};

/** Identificadores de lookup_key usados no Stripe para os Prices recorrentes. */
export const STRIPE_PRICE_LOOKUP_KEYS = {
  PRO_MONTHLY: 'saldocasa_pro_monthly_brl',
  PRO_PLUS_MONTHLY: 'saldocasa_pro_plus_monthly_brl',
} as const;
